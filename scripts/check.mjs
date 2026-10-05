// Crawls every internal route and reports broken links, missing anchors,
// horizontal overflow and script errors.
//
//   node scripts/check.mjs [screenshotDir]
//
// By default it starts the local server in offline mode, with content from
// studio/seed/fixiam-seed.ndjson answered through the real Sanity query.
// Set BASE_URL to check a running site instead, for example a Vercel deployment.
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.argv[2];
let server = null;
let url = process.env.BASE_URL;
if (!url) {
  const { startServer } = await import('./dev-server.mjs');
  server = await startServer({ port: 0, fixture: process.env.FIXTURE || 'studio/seed/fixiam-seed.ndjson', quiet: true });
  url = server.url + '/';
}

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('response', (r) => r.status() >= 400 && !/favicon\.ico$/.test(r.url()) && errors.push(`http ${r.status()}: ${r.url()}`));
page.on('console', (m) => m.type() === 'error' && /status of 404/.test(m.text()) ? null : m.type() === 'error' && !/fonts\.g|ERR_CERT|ERR_NAME|ERR_TUNNEL|ERR_PROXY/.test(m.text()) && errors.push('console: ' + m.text()));
await page.goto(url);
await page.waitForFunction(() => window.FX && FX.contentStatus && FX.contentStatus !== 'loading', null, { timeout: 20000 });
const status = await page.evaluate(() => FX.contentStatus);
if (status !== 'ready') {
  console.error(`Content did not load (status: ${status})`);
  process.exit(1);
}

const seen = new Set();
const queue = ['/'];
const broken = [];
while (queue.length) {
  const r = queue.shift();
  if (seen.has(r)) continue;
  seen.add(r);
  await page.evaluate((r) => FX.go(r), r);
  const res = await page.evaluate(() => ({
    nf: !!document.querySelector('.nf-code'),
    links: [...document.querySelectorAll('a[href^="#/"]')].map((a) => a.getAttribute('href').slice(1)),
    scrollIds: [...document.querySelectorAll('[data-scroll]')].map((a) => a.dataset.scroll).filter((id) => !document.getElementById(id)),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }));
  if (res.nf) broken.push(r);
  if (res.scrollIds.length) broken.push(r + ' missing anchors: ' + res.scrollIds.join(','));
  if (res.overflow) broken.push(r + ' horizontal overflow');
  for (const l of res.links) if (!seen.has(l) && !l.startsWith('/search')) queue.push(l);
}
// Search behaviour
for (const q of ['SSO', 'MFA', 'device', 'user', 'SAML', 'kubernetes']) {
  const n = await page.evaluate((q) => FX.search(q).length, q);
  console.log(`search "${q}": ${n} results`);
}

if (shots) {
  const take = async (r, name, w = 1440, h = 900, full = false) => {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate((r) => FX.go(r), r);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(shots, name + '.png'), fullPage: full });
  };
  await take('/', 'home', 1440, 900, true);
  await take('/concepts/single-sign-on', 'concept-sso', 1440, 900, true);
  await take('/guides/configure-saml-sso', 'guide-saml', 1440, 1400);
  await take('/guides/configure-saml-sso?journey=roll-out-sso&stage=4', 'guide-journey', 1440, 900);
  await take('/journeys/roll-out-sso', 'journey', 1440, 1400);
  await take('/journeys', 'journeys', 1440, 1100);
  await take('/release-notes', 'releases', 1440, 1100);
  await take('/guides', 'guides', 1440, 1100);
  await take('/search?q=SSO', 'search', 1440, 1000);
  await take('/search?q=kubernetes', 'search-none', 1440, 800);
  await page.evaluate(() => document.querySelector('[data-open-search]').click());
  await page.fill('#palette-input', 'mfa');
  await page.screenshot({ path: path.join(shots, 'palette.png') });
  await page.keyboard.press('Escape');
  await take('/', 'm-home', 390, 844, true);
  await take('/guides/add-user', 'm-guide', 390, 844, true);
  await take('/journeys/roll-out-sso', 'm-journey', 390, 844);
  await page.evaluate(() => document.querySelector('[data-open-nav]').click());
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(shots, 'm-drawer.png') });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await take('/concepts/single-sign-on', 'dark-concept', 1440, 900);
  await take('/release-notes/2026-10', 'dark-releases', 1024, 900);
}

console.log(`routes crawled: ${seen.size}`);
console.log(broken.length ? 'BROKEN:\n' + broken.join('\n') : 'no broken routes');
console.log(errors.length ? 'ERRORS:\n' + [...new Set(errors)].join('\n') : 'no script errors');
await browser.close();
if (server) await server.close();
process.exit(broken.length || errors.length ? 1 : 0);
