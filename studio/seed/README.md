# Seed content from the prototype

These scripts copy the Fixiam Documentation prototype's sample content into Sanity, so the Studio holds the same library the website shows. The website itself is not changed and still uses its own hardcoded content.

## Files

| File | What it does |
| --- | --- |
| `build-seed.mjs` | Loads the prototype's content files (`../assets/js/…`) unchanged, converts them to Sanity documents and writes `fixiam-seed.ndjson`. Sends nothing to Sanity. |
| `check-seed.ts` | Checks every seed document against the Studio's real schema, offline. |
| `import.mjs` | Imports `fixiam-seed.ndjson` with the official `sanity dataset import` command. |
| `fixiam-seed.ndjson` | The generated documents, one per line. Committed so you can review exactly what will be imported. |

## Run it

```bash
cd studio
npx sanity login          # once; opens a browser to sign in
npm run seed:import       # build → check → import, creating only missing documents
```

`npm run seed:import:replace` overwrites the seed documents with the prototype content again. Use it to reset after experiments. It does not touch documents you created yourself.

## Authentication

The import writes to your dataset, so it needs permission. By default it uses your local `sanity login` session, so you don't need a token. In CI, set `SANITY_IMPORT_TOKEN` (an Editor token from sanity.io/manage) as an environment variable. Never put a token in a file in this repository.

## How repeat imports avoid duplicates

Every document has a fixed ID derived from the prototype:

| Content | ID pattern | Example |
| --- | --- | --- |
| Documentation Homepage | `docsHomepage` | `docsHomepage` |
| Category | `category-{section}-{id}` | `category-guide-applications` |
| Concept | `concept-{slug}` | `concept-single-sign-on` |
| Guide | `guide-{slug}` | `guide-configure-saml-sso` |
| Journey | `journey-{slug}` | `journey-roll-out-sso` |
| Release note | `releaseNote-{id}` | `releaseNote-2026-10-device-mgmt` |

Importing the same ID twice never creates a second document:

- `seed:import` uses `--missing`: documents that already exist are skipped, so your Studio edits survive.
- `seed:import:replace` uses `--replace`: documents with these IDs are overwritten.

Array item keys are also derived from the document ID, so rebuilding the seed produces an identical file.

Unpublished edits are stored as separate drafts (`drafts.{id}`). An import never changes drafts. After a `--replace`, an existing draft still shows in the Studio until you publish or discard it.

## How the prototype maps to Sanity

| Prototype | Sanity |
| --- | --- |
| Concept and guide categories, including nested groups (Applications › Single Sign On, Authentication › Authenticators, Identity Lifecycle › HR sources) | `category` documents. Nested groups have a `parent` |
| Sidebar position | `order` in steps of 10, shared between pages and nested groups so they interleave as on the site |
| Page slugs | `slug`, unchanged |
| Article HTML | Rich text: paragraphs, subheadings, bullet and numbered lists, bold, italic, code, links |
| Links such as `#/guides/add-user` | Internal link annotation that references the document |
| `note()`, `tip()`, `warn()`, `important()` | `callout` with the same tone |
| `code()` | `codeBlock` |
| `table()` | `table` |
| SSO flow, “Where Fixiam fits” and Joiner/Mover/Leaver diagrams | `diagram` with the matching variant and caption |
| Benefit cards and tabs | A minor heading followed by its text |
| Guide steps | `guideStep`. Outline steps get a title only |
| Admin Console mock screenshots | An empty image field on the step, with alt text and caption filled in, ready for a real screenshot |
| Related concepts, guides and journeys; journey Learn and Do links; release note links; homepage popular topics and featured journeys | References |
| Homepage hero, search, discovery cards, popular topics, featured journeys | Read from the prototype's rendered home page |
