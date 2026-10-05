# Fixiam Documentation Studio

Sanity Studio for managing Fixiam Documentation content.

| Setting | Value |
| --- | --- |
| Project ID | `idpyt5ut` |
| Dataset | `fixiam_docs_sandbox` |
| Sanity | v6 (Node.js 22.12 or later) |

The documentation website in the repository root does **not** read from Sanity yet. It still uses its hardcoded sample content.

## Load the sample content

The prototype's sample library (15 concepts, 35 guides, 6 journeys, 21 release notes, 17 categories and the homepage) can be imported into the dataset:

```bash
npx sanity login
npm run seed:import
```

See [seed/README.md](seed/README.md) for how the import works and how it avoids duplicates.

## Run locally

```bash
cd studio
npm install
npm run dev
```

Open http://localhost:3333 and sign in with the account that owns the Sanity project.

If the Studio says it cannot connect or shows a CORS error, add `http://localhost:3333` as a CORS origin, with **Allow credentials** turned on, at https://www.sanity.io/manage/project/idpyt5ut/api.

## Deploy a hosted Studio (optional)

```bash
npm run deploy
```

The CLI asks for a hostname, for example `fixiam-docs`, and publishes the Studio at `https://fixiam-docs.sanity.studio`. Copy the `appId` it prints into `sanity.cli.ts` so later deploys skip the prompt.

## What you can manage

| In the Studio | Document type | Purpose |
| --- | --- | --- |
| Documentation Homepage | `docsHomepage` (single document) | Heading, supporting text, search placeholder, suggested searches, discovery cards, popular topics, featured journeys |
| Concepts | `concept` | “Teach me.” Summary, titled sections, common terminology, related concepts and guides |
| Guides | `guide` | “Show me how.” What you will accomplish, prerequisites, numbered steps with screenshots, expected result, troubleshooting |
| Journeys | `journey` | “Take me from beginning to end.” Audience, effort, duration, outcomes, and stages that link to concepts (Learn) and guides (Do) |
| Release Notes | `releaseNote` | “What's changed?” Date, category (New, Improved, Fixed, Security), affected area, summary, details, related docs |
| Categories | `category` | Sidebar groups for Concepts, Guides and Journeys. A category can have a parent to make nested groups |

### Images and screenshots

Images are uploaded to Sanity's image library. Nobody types image URLs.

- **Guide step screenshot:** Guides → open a guide → **Steps** → open a step → **Screenshot**. Use **Upload** or **Select** (to reuse an uploaded image), fill in **Alt text** and, optionally, **Caption**. The image's menu has **Replace** and **Clear field** (remove). **Crop image** adjusts the crop.
- **Image anywhere in rich text** (concept sections, guide step instructions, journey stages, release note details, expected results): place the cursor where the image should go and choose **Insert Image** in the rich text toolbar.
- **Alt text** is required once an image is uploaded. **Caption** is optional.
- An image field without an uploaded file shows nothing on the website.

Concepts, Guides and Journeys can be browsed in two ways: **All** (alphabetical) or **By category**. Creating a document from inside a category fills in that category for you.

Article types share the same tabs: **Content**, **Navigation** (slug, category, sidebar order), **Related** and **Search and metadata** (last updated, keywords).

The Studio also includes **Vision**, a GROQ query tool, for testing queries before the website is connected.

## File layout

```
sanity.config.ts            Studio config: project, dataset, plugins, singleton rules, templates
sanity.cli.ts               CLI config for build and deploy
env.ts                      Project ID and dataset (overridable with SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET)
structure/index.ts          Studio sidebar
schemaTypes/documents/      Document types: docsHomepage, concept, guide, journey, releaseNote, category
schemaTypes/objects/        Reusable parts: rich text, callout, code block, figure, table, diagram, section,
                            term, step, troubleshooting item, journey stage, discovery card, popular topic
schemaTypes/fields.ts       Fields shared by the article types
schemaTypes/constants.ts    Shared option lists, which match the website's config.js
seed/                       Builds, checks and imports the sample content from the prototype
```

## Checks

```bash
npm run schema:validate   # validate schemas
npm run typecheck         # TypeScript
npm run build             # production build into dist/
npm run seed:build        # regenerate seed/fixiam-seed.ndjson from the prototype
npm run seed:check        # check the seed file against the schema (offline)
```
