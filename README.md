# Fixiam Documentation prototype

An interactive, click-through prototype of the Fixiam Documentation website. It shows how the documentation should work end to end: information architecture, navigation, search, page templates and cross-linking between content types.

All content is realistic **sample content**. It exists to show how the platform behaves once it holds real documentation, and will be replaced.

## Run it

No build step and no dependencies. Do one of the following:

- Open `index.html` in a browser, or
- Serve the folder, for example `npx serve .`, or
- Open `dist/fixiam-docs.html`, a single self-contained file you can share.

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

## Project structure

```
index.html                 App shell: header, footer, script order
assets/styles.css          Design tokens (light and dark) and every component style
assets/js/config.js        Information architecture: primary sections, content types, search synonyms
assets/js/helpers.js       Content components: callouts, code blocks, tables, screenshot placeholders, icons
assets/js/content/*.js     Sample content, one file per content type
assets/js/model.js         Content model helpers: ordering, ancestors, prev/next, journey references
assets/js/search.js        In-memory search index, ranking and grouping
assets/js/ui.js            Reusable UI components: sidebar tree, breadcrumbs, TOC, cards, feedback, search results
assets/js/templates.js     Page templates, one per page type
assets/js/app.js           Router, search palette, scroll spy and interactions
scripts/check.mjs          Crawls every route and reports broken links, missing anchors, overflow and script errors
scripts/bundle.mjs         Builds dist/fixiam-docs.html as a single self-contained file
```

Routing uses the URL hash (`#/guides/add-user`), so the prototype runs from any static host or directly from disk. The router also keeps its own copy of the current route, so it still works in sandboxed viewers that block hash changes.

## Adding content

Add an entry to the relevant file in `assets/js/content/` and list its slug in that file's `categories`. The sidebar, breadcrumbs, previous and next links, search index and journey references update automatically. Nested sidebar groups are written as `{ id, title, items: [...] }` inside a category.

## Adding a Developers section later

Primary navigation is generated from `FX.SECTIONS` and content types from `FX.TYPES` in `assets/js/config.js`. To add a Developers section:

1. Add a `developer` entry to `FX.SECTIONS` and `FX.TYPES`.
2. Add `assets/js/content/developers.js` with the same `{ categories, pages }` shape.
3. Add a route in `resolve()` in `app.js`, and a template if API reference pages need a different layout.

## Checks

```
node scripts/check.mjs            # crawl every route
node scripts/check.mjs shots/     # also write desktop, mobile and dark screenshots
node scripts/bundle.mjs           # rebuild dist/fixiam-docs.html
```

`check.mjs` uses Playwright. Set `CHROMIUM=/path/to/chromium` to use a specific browser binary.
