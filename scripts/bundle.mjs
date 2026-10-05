// Builds a single self-contained HTML file with all CSS and JS inlined.
// Usage: node scripts/bundle.mjs [out=dist/fixiam-docs.html] [--fragment]
// --fragment omits <!doctype>, <html>, <head> and <body> wrappers, for hosts
// that supply their own document skeleton.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fragment = args.includes('--fragment');
const out = path.resolve(root, args.find((a) => !a.startsWith('--')) || 'dist/fixiam-docs.html');

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
html = html.replace(/<link rel="stylesheet" href="(assets\/[^"]+)">/g, (_, f) => `<style>\n${read(f)}\n</style>`);
html = html.replace(/<script src="(assets\/[^"]+)"><\/script>/g, (_, f) => `<script>\n${read(f).replace(/<\/script/gi, '<\\/script')}\n</script>`);

if (fragment) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>\s*/, '').replace(/<meta name="viewport"[^>]*>\s*/, '');
  const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
  html = head.trim() + '\n' + body.trim() + '\n';
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${path.relative(root, out)} (${Math.round(html.length / 1024)} KB)`);
