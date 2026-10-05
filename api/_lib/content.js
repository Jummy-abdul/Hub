/**
 * Loads published documentation from Sanity and shapes it for the website.
 *
 * The website's templates expect the same data shape the prototype used
 * (FX.content, FX.releases, FX.home). This module produces that shape from
 * Sanity documents, so the templates, navigation, search and design are
 * unchanged. Every relationship is resolved from Sanity references.
 *
 * One problem document never breaks the site: each document is converted on
 * its own, and documents that fail are left out and listed in meta.skipped.
 */
import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'

import {createRenderer} from './render.js'

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

/**
 * Read from environment variables. Project ID and dataset are not secrets;
 * the defaults match this project so a deployment without variables still
 * works. SANITY_API_READ_TOKEN is only needed if the dataset is private.
 */
export function sanityConfig(env = process.env) {
  return {
    projectId: env.SANITY_PROJECT_ID || 'idpyt5ut',
    dataset: env.SANITY_DATASET || 'fixiam_docs_sandbox',
    apiVersion: env.SANITY_API_VERSION || '2025-02-19',
    token: env.SANITY_API_READ_TOKEN || undefined,
  }
}

export function createSanityClient(config = sanityConfig()) {
  return createClient({
    ...config,
    // Only published documents. Drafts and unreleased versions are never returned.
    perspective: 'published',
    // Sanity's API CDN: fast, and refreshed within seconds of a publish.
    useCdn: true,
    timeout: 8000,
    maxRetries: 2,
  })
}

/* ------------------------------------------------------------------ */
/* Query                                                               */
/* ------------------------------------------------------------------ */

// The published perspective already excludes drafts; the path filters are a
// second safeguard in case a client is ever configured differently.
const PUBLISHED = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))'

export const CONTENT_QUERY = `{
  "home": coalesce(*[_id == "docsHomepage"][0], *[_type == "docsHomepage" && ${PUBLISHED}][0]),
  "categories": *[_type == "category" && ${PUBLISHED}] | order(section asc, order asc, title asc),
  "concepts": *[_type == "concept" && defined(slug.current) && ${PUBLISHED}] | order(order asc, title asc),
  "guides": *[_type == "guide" && defined(slug.current) && ${PUBLISHED}] | order(order asc, title asc),
  "journeys": *[_type == "journey" && defined(slug.current) && ${PUBLISHED}] | order(order asc, title asc),
  "releaseNotes": *[_type == "releaseNote" && defined(date) && ${PUBLISHED}] | order(date desc, _createdAt desc)
}`

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const TYPE_BASE = {concept: '/concepts', guide: '/guides', journey: '/journeys'}
const RN_CATEGORIES = new Set(['new', 'improved', 'fixed', 'security'])
const DEFAULT_ORDER = 100

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '')
const today = () => new Date().toISOString().slice(0, 10)
const dateOnly = (doc) => doc.updated || (doc._updatedAt ? doc._updatedAt.slice(0, 10) : today())

/** Release note anchor ID. Imported notes keep their prototype IDs (rn-2026-10-…). */
const releaseAnchor = (doc) => `rn-${doc._id.replace(/^releaseNote-/, '')}`

const byOrder = (a, b) => (a.order ?? DEFAULT_ORDER) - (b.order ?? DEFAULT_ORDER) || String(a.title).localeCompare(String(b.title))

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */

export function buildBundle(raw, config = sanityConfig()) {
  const skipped = []
  const skip = (doc, reason) => skipped.push({id: doc?._id, type: doc?._type, reason})

  // 1. Index every routable document: Sanity ID → route, type and slug.
  const index = new Map()
  const seenSlugs = {concept: new Set(), guide: new Set(), journey: new Set()}
  const keep = {concept: [], guide: [], journey: []}
  for (const [type, list] of [
    ['concept', raw.concepts],
    ['guide', raw.guides],
    ['journey', raw.journeys],
  ]) {
    for (const doc of list || []) {
      const slug = doc.slug?.current
      if (!slug || !doc.title) {
        skip(doc, 'missing title or slug')
        continue
      }
      if (seenSlugs[type].has(slug)) {
        skip(doc, `duplicate slug "${slug}"`)
        continue
      }
      seenSlugs[type].add(slug)
      index.set(doc._id, {type, slug, title: doc.title, route: `${TYPE_BASE[type]}/${slug}`})
      keep[type].push(doc)
    }
  }
  const releaseDocs = []
  for (const doc of raw.releaseNotes || []) {
    if (!doc.title || !RN_CATEGORIES.has(doc.category) || !/^\d{4}-\d{2}-\d{2}$/.test(doc.date || '')) {
      skip(doc, 'missing title, valid category or date')
      continue
    }
    const id = releaseAnchor(doc)
    index.set(doc._id, {type: 'release', slug: id, title: doc.title, route: `/release-notes/${doc.date.slice(0, 7)}?section=${id}`})
    releaseDocs.push(doc)
  }

  const routeFor = (id) => index.get(id)?.route || null
  const slugsOf = (refs, type) =>
    [...new Set((refs || []).map((r) => index.get(r?._ref)).filter((t) => t && t.type === type).map((t) => t.slug))]

  const imageBuilder = createImageUrlBuilder({projectId: config.projectId, dataset: config.dataset})
  const imageFor = (image) => {
    try {
      const m = /^image-[a-zA-Z0-9]+-(\d+)x(\d+)-/.exec(image.asset._ref)
      const width = m ? Math.min(+m[1], 1600) : undefined
      const height = m && width ? Math.round((+m[2] * width) / +m[1]) : undefined
      return {src: imageBuilder.image(image).width(1600).fit('max').auto('format').url(), width, height}
    } catch {
      return null
    }
  }
  const r = createRenderer({routeFor, imageFor})

  // 2. Pages. Each document is converted on its own so one bad document
  //    cannot stop the rest from loading.
  const safely = (doc, fn) => {
    try {
      return fn()
    } catch (err) {
      skip(doc, `could not be converted: ${err.message}`)
      return null
    }
  }

  const pages = {concept: {}, guide: {}, journey: {}}

  for (const doc of keep.concept) {
    const page = safely(doc, () => {
      const usedIds = new Set()
      return {
        title: doc.title,
        summary: doc.summary || '',
        updated: dateOnly(doc),
        keywords: doc.keywords || [],
        sections: (doc.sections || [])
          .filter((s) => s && s.title)
          .map((s) => {
            let id = s.anchor?.current || slugify(s.title) || 'section'
            while (usedIds.has(id)) id += '-2'
            usedIds.add(id)
            return {id, title: s.title, html: r.blocks(s.body)}
          }),
        terms: (doc.terms || []).filter((t) => t && t.term).map((t) => ({term: t.term, def: r.esc(t.definition || '')})),
        related: {concepts: slugsOf(doc.relatedConcepts, 'concept'), guides: slugsOf(doc.relatedGuides, 'guide')},
      }
    })
    if (page) pages.concept[doc.slug.current] = page
  }

  for (const doc of keep.guide) {
    const page = safely(doc, () => ({
      title: doc.title,
      summary: doc.summary || '',
      updated: dateOnly(doc),
      time: doc.timeToComplete || '',
      role: doc.role || '',
      keywords: doc.keywords || [],
      accomplish: (doc.accomplish || []).filter(Boolean).map(r.esc),
      prereqs: (doc.prerequisites || []).map((b) => r.inline([b])).filter(Boolean),
      steps: (doc.steps || [])
        .filter((s) => s && s.title)
        .map((s) => {
          const html = r.blocks(s.body)
          const media = s.screenshot ? r.figureHtml(s.screenshot) : ''
          // A step with only a title is shown as an outline step, as before.
          return html || media ? {title: s.title, html, ...(media ? {media} : {})} : s.title
        }),
      result: r.inline(doc.expectedResult),
      troubleshooting: (doc.troubleshooting || []).filter((t) => t && t.problem).map((t) => ({q: r.esc(t.problem), a: r.inline(t.solution)})),
      related: {guides: slugsOf(doc.relatedGuides, 'guide'), concepts: slugsOf(doc.relatedConcepts, 'concept')},
    }))
    if (page) pages.guide[doc.slug.current] = page
  }

  for (const doc of keep.journey) {
    const page = safely(doc, () => ({
      title: doc.title,
      summary: doc.summary || '',
      updated: dateOnly(doc),
      audience: doc.audience || '',
      effort: capitalize(doc.effort),
      duration: doc.duration || '',
      keywords: doc.keywords || [],
      outcome: (doc.outcomes || []).filter(Boolean),
      stages: (doc.stages || [])
        .filter((s) => s && s.title)
        .map((s) => ({
          title: s.title,
          html: r.blocks(s.body),
          learn: slugsOf(s.learn, 'concept'),
          do: slugsOf(s.do, 'guide'),
          ...(s.checklist?.length ? {checklist: s.checklist.filter(Boolean)} : {}),
        })),
      next: slugsOf(doc.nextJourneys, 'journey'),
    }))
    if (page && page.stages.length) pages.journey[doc.slug.current] = page
    else if (page) skip(doc, 'journey has no stages')
  }

  // 3. Navigation: categories, nesting and order, from Sanity.
  const content = {
    concept: {categories: buildTree('concept', raw.categories, keep.concept, pages.concept), pages: pages.concept},
    guide: {categories: buildTree('guide', raw.categories, keep.guide, pages.guide), pages: pages.guide},
    journey: {
      categories: [{id: 'all', title: 'All journeys', items: keep.journey.filter((d) => pages.journey[d.slug.current]).sort(byOrder).map((d) => d.slug.current)}],
      pages: pages.journey,
    },
  }

  // 4. Release notes, newest first.
  const releases = releaseDocs
    .map((doc) =>
      safely(doc, () => ({
        id: releaseAnchor(doc),
        date: doc.date,
        category: doc.category,
        area: doc.area || '',
        title: doc.title,
        summary: doc.summary || '',
        details: r.blocks(doc.details),
        links: (doc.relatedDocs || [])
          .map((ref) => index.get(ref?._ref))
          .filter((t) => t && t.type !== 'release')
          .map((t) => [t.title, t.route]),
      }))
    )
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  // 5. Homepage.
  const home = raw.home
    ? safely(raw.home, () => ({
        title: raw.home.title || '',
        tagline: raw.home.tagline || '',
        searchPlaceholder: raw.home.searchPlaceholder || '',
        popularSearches: (raw.home.popularSearches || []).filter(Boolean),
        discoveryCards: (raw.home.discoveryCards || [])
          .filter((c) => c && c.section && c.title)
          .map((c) => ({type: c.section, title: c.title, desc: c.description || '', cta: c.ctaLabel || ''})),
        popular: (raw.home.popularTopics || [])
          .map((t) => ({label: t?.label, target: index.get(t?.page?._ref)}))
          .filter((t) => t.label && t.target)
          .map((t) => ({label: t.label, type: t.target.type, slug: t.target.slug, route: t.target.route})),
        featured: slugsOf(raw.home.featuredJourneys, 'journey'),
      }))
    : null

  return {
    content,
    releases,
    home,
    meta: {
      source: 'sanity',
      projectId: config.projectId,
      dataset: config.dataset,
      generatedAt: new Date().toISOString(),
      counts: {
        concepts: Object.keys(pages.concept).length,
        guides: Object.keys(pages.guide).length,
        journeys: Object.keys(pages.journey).length,
        releaseNotes: releases.length,
        categories: (raw.categories || []).length,
      },
      skipped,
    },
  }
}

/**
 * Builds the sidebar tree for one section from Sanity categories.
 * Pages and child categories share one order, so a nested group (for example
 * Applications › Single Sign On) sits between pages exactly where editors put it.
 * Pages without a valid category are grouped under "Other" so they stay reachable.
 */
function buildTree(section, categories, docs, pages) {
  const cats = (categories || []).filter((c) => c.section === section && c.slug?.current && c.title)
  const byId = new Map(cats.map((c) => [c._id, c]))
  const published = docs.filter((d) => pages[d.slug.current])
  const placed = new Set()

  const childrenOf = (id) => cats.filter((c) => c.parent?._ref === id)
  const isTop = (c) => !c.parent?._ref || !byId.has(c.parent._ref) || c.parent._ref === c._id

  function itemsFor(cat, trail) {
    const entries = []
    for (const d of published) {
      if (d.category?._ref === cat._id) {
        entries.push({order: d.order, title: d.title, item: d.slug.current})
        placed.add(d._id)
      }
    }
    for (const child of childrenOf(cat._id)) {
      if (trail.has(child._id)) continue // guards against a category loop
      const items = itemsFor(child, new Set([...trail, child._id]))
      if (items.length) entries.push({order: child.order, title: child.title, item: {id: child.slug.current, title: child.title, items}})
    }
    return entries.sort(byOrder).map((e) => e.item)
  }

  const tree = cats
    .filter(isTop)
    .sort(byOrder)
    .map((c) => ({id: c.slug.current, title: c.title, desc: c.description || '', items: itemsFor(c, new Set([c._id]))}))
    .filter((c) => c.items.length)

  const orphans = published.filter((d) => !placed.has(d._id)).sort(byOrder)
  if (orphans.length) tree.push({id: 'other', title: 'Other', desc: '', items: orphans.map((d) => d.slug.current)})
  return tree
}

/** Fetches published content from Sanity and returns the website bundle. */
export async function getContentBundle({client, config = sanityConfig()} = {}) {
  const raw = await (client || createSanityClient(config)).fetch(CONTENT_QUERY)
  if (!raw || typeof raw !== 'object') throw new Error('Sanity returned no content')
  return buildBundle(raw, config)
}
