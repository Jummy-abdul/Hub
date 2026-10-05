# Fixiam Documentation

The Fixiam Documentation website. Content is managed in **Sanity** and shown through the site's own templates:

```
Sanity (published content) → /api/content (Vercel Function) → website in the browser → readers
```

- `/api/content` reads **published** documents only, resolves every reference, renders rich text with Sanity's Portable Text tooling into the site's own components, and returns one JSON bundle.
- The browser loads that bundle once per visit and renders it with the existing templates, navigation and search. It never talks to Sanity directly and never sees a token.
- Published changes appear on the site within about 10 seconds of publishing.

## Run it locally

Requires Node.js 22.

```bash
npm install
npm run dev            # http://localhost:3000, content from Sanity
npm run dev:offline    # same site, content from studio/seed/fixiam-seed.ndjson (no network)
```

Opening `index.html` directly from disk no longer works, because content comes from the `/api/content` function.

## Configuration

Set these as environment variables (in Vercel: Project → Settings → Environment Variables, or in `.env.local` locally; see `.env.example`):

| Variable | Value | Required |
| --- | --- | --- |
| `SANITY_PROJECT_ID` | `idpyt5ut` | Recommended. Defaults to `idpyt5ut` |
| `SANITY_DATASET` | `fixiam_docs_sandbox` | Recommended. Defaults to `fixiam_docs_sandbox` |
| `SANITY_API_READ_TOKEN` | Viewer token | Only if the dataset is private |
| `SANITY_API_VERSION` | `2025-02-19` | No |

The function runs on the server, so no Sanity CORS origin is needed for the website domain.

## If Sanity is unavailable

- `/api/content` returns the last successful content it has in memory, if it has any.
- The browser falls back to the last copy it loaded successfully and shows a notice with **Try again**.
- A first-time visitor sees a "Documentation is temporarily unavailable" page with **Try again**.
- A document that fails to convert is left out (and listed in the response's `meta.skipped`) without affecting other pages. Links to missing pages are shown as plain text.

## What to try

| Flow | Start here |
| --- | --- |
| Home → discovery cards → Concepts / Guides / Journeys / Release Notes | `#/` |
| Search: press `/` or `Ctrl K` anywhere, or use the home page search. Try `SSO`, `MFA`, `device`, `user`, `SAML`, and `kubernetes` for the no-results state | any page |
| Educational concept page with a diagram, terminology and related docs | `#/concepts/single-sign-on` |
| Task guide with prerequisites, numbered steps, screenshot placeholders and troubleshooting | `#/guides/configure-saml-sso` |
| A journey with stages, progress tracking and Learn / Do links | `#/journeys/roll-out-sso` |
| A guide opened from a journey stage, with the journey context banner | `#/guides/configure-saml-sso?journey=roll-out-sso&stage=4` |
| Release notes with year, month and category filters, plus a month archive | `#/release-notes` |
| Template view: the grid icon in the header outlines and labels every reusable component | any page |
| Prototype notes: templates, components and content model | `#/about` |

The layout is responsive. The sidebar becomes a drawer below 1024 px and the primary navigation moves into it below 760 px. Light and dark themes follow the system setting and can be switched in the header.

## Content types

The prototype keeps four content types separate. Each one has its own template and content shape.

| Type | Question it answers | Template |
| --- | --- | --- |
| Concept | "Teach me." | Sections, diagrams, common terminology, related concepts and guides |
| Guide | "Show me how." | What you will accomplish, prerequisites, numbered steps, expected result, troubleshooting |
| Journey | "Take me from beginning to end." | Ordered stages, each linking to concepts (Learn) and guides (Do), with progress |
| Release note | "What's changed?" | Date, category, summary, details, affected area, related docs |

Pages that a journey references show a "Part of this journey" box automatically. Previous and next links come from the sidebar order.

## Sanity Studio

The `studio/` folder contains the Sanity Studio for project `idpyt5ut`, dataset `fixiam_docs_sandbox`, where editors manage Concepts, Guides, Journeys, Release Notes, Categories and the Documentation Homepage. See [studio/README.md](studio/README.md).

What comes from Sanity: all pages and their content, categories and their nesting and order (the sidebar), related documentation, journey stages and their Learn and Do links, release notes, and the homepage heading, supporting text, search placeholder, suggested searches, discovery cards, popular topics and featured journeys. Search indexes whatever Sanity returns, so there is no separate search data to maintain.

Images are uploaded in the Studio (guide step **Screenshot**, or **Insert Image** in any rich text). The site serves them from Sanity's image CDN in responsive sizes, keeps their aspect ratio, shows the caption, and opens a larger version on click. Image fields without a file show nothing.

What stays in code: the site chrome in `assets/js/config.js`, such as the primary navigation, section names and taglines, and search synonyms.

## Project structure

```
index.html                 App shell: header, footer, script order
api/content.js             Vercel Function: GET /api/content
api/_lib/content.js        Sanity query, published-only client, reference resolution, data shaping
api/_lib/render.js         Portable Text → HTML using the site's own components
assets/styles.css          Design tokens (light and dark) and every component style
assets/js/config.js        Information architecture: primary sections, content types, search synonyms
assets/js/helpers.js       Content components: callouts, code blocks, tables, diagrams, images, screenshot placeholders, icons
assets/js/content-source.js  Loads content from /api/content, with a saved-copy fallback
assets/js/content/*.js     LEGACY prototype content, no longer loaded by the site (see below)
assets/js/model.js         Content model helpers: ordering, ancestors, prev/next, journey references
assets/js/search.js        In-memory search index, ranking and grouping
assets/js/ui.js            Reusable UI components: sidebar tree, breadcrumbs, TOC, cards, feedback, search results
assets/js/templates.js     Page templates, one per page type
assets/js/app.js           Router, search palette, scroll spy and interactions
scripts/dev-server.mjs     Local server for the site and /api/content (optionally offline)
scripts/check.mjs          Crawls every route and reports broken links, missing anchors, overflow and script errors
scripts/bundle.mjs         LEGACY: builds the old self-contained prototype file in dist/
vercel.json                Bundles assets/js/helpers.js with the function
```

Routing uses the URL hash (`#/guides/add-user`). URLs are unchanged from the prototype because the Sanity documents keep the prototype slugs.

## Adding content

Create and publish documents in Sanity Studio. The sidebar, breadcrumbs, previous and next links, search, related links and journey references update automatically. A category inside another category becomes a nested sidebar group. A page's **Order** and its category's **Order** decide its position.

## Legacy prototype files

These files are no longer used by the website. They are kept until the Sanity-powered deployment is confirmed, and can then be deleted:

| File | Why it still exists |
| --- | --- |
| `assets/js/content/concepts.js`, `guides.js`, `journeys.js`, `releases.js` | The original hardcoded content. Also read by `studio/seed/build-seed.mjs` to rebuild the seed file |
| `dist/fixiam-docs.html` and `scripts/bundle.mjs` | The old self-contained prototype file |

Delete the four content files together with `studio/seed/build-seed.mjs`, or after the seed file no longer needs rebuilding. `studio/seed/fixiam-seed.ndjson` stays useful as an offline fixture for `npm run dev:offline` and `npm run check`.

## Adding a Developers section later

Primary navigation is generated from `FX.SECTIONS` and content types from `FX.TYPES` in `assets/js/config.js`. To add a Developers section:

1. Add a `developer` entry to `FX.SECTIONS` and `FX.TYPES`.
2. Add a document type in the Studio, and include it in the query and shaping in `api/_lib/content.js`.
3. Add a route in `resolve()` in `app.js`, and a template if API reference pages need a different layout.

## Checks

```
npm run check                                  # crawl every route, offline content
node scripts/check.mjs shots/                  # also write desktop, mobile and dark screenshots
BASE_URL=https://your-site.vercel.app/ npm run check   # crawl a live deployment
```

`check.mjs` uses Playwright. Set `CHROMIUM=/path/to/chromium` to use a specific browser binary.
