#!/usr/bin/env node
/**
 * Builds Sanity seed documents from the Fixiam Documentation prototype.
 *
 *   node seed/build-seed.mjs            → writes seed/fixiam-seed.ndjson
 *
 * Source of truth: the prototype's own content files in ../assets/js. They are
 * loaded unchanged in a sandbox, so the seed always matches what the website
 * shows. Nothing is sent to Sanity by this script; importing is a separate,
 * explicit step (see seed/README.md).
 *
 * Document IDs are deterministic (for example "guide-configure-saml-sso"), so
 * importing the file again updates or skips the same documents instead of
 * creating duplicates.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import {fileURLToPath} from 'node:url'
import {parse as parseHtml, NodeType} from 'node-html-parser'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '..', '..')
const OUT = path.join(HERE, 'fixiam-seed.ndjson')

/* ------------------------------------------------------------------ */
/* 1. Load the prototype content                                       */
/* ------------------------------------------------------------------ */

// Same order as index.html. app.js is skipped: it needs a real browser.
const PROTOTYPE_FILES = [
  'assets/js/config.js',
  'assets/js/helpers.js',
  'assets/js/content/concepts.js',
  'assets/js/content/guides.js',
  'assets/js/content/journeys.js',
  'assets/js/content/releases.js',
  'assets/js/model.js',
  'assets/js/ui.js',
  'assets/js/templates.js',
]

function loadPrototype() {
  const sandbox = {console, URLSearchParams}
  sandbox.window = sandbox
  vm.createContext(sandbox)
  for (const file of PROTOTYPE_FILES) {
    vm.runInContext(fs.readFileSync(path.join(REPO, file), 'utf8'), sandbox, {filename: file})
  }
  sandbox.FX.rememberRecent = () => {} // defined in app.js; templates call it
  return sandbox.FX
}

const FX = loadPrototype()

/* ------------------------------------------------------------------ */
/* 2. IDs, keys and references                                         */
/* ------------------------------------------------------------------ */

// Hyphens, not dots: Sanity treats IDs containing "." as private paths.
const ids = {
  concept: (slug) => `concept-${slug}`,
  guide: (slug) => `guide-${slug}`,
  journey: (slug) => `journey-${slug}`,
  releaseNote: (rnId) => `releaseNote-${rnId.replace(/^rn-/, '')}`,
  category: (section, catId) => `category-${section}-${catId}`,
  homepage: () => 'docsHomepage', // must match the singleton ID in structure/index.ts
}

// Array keys are derived from the document ID and a running counter, so the
// same content always produces the same keys.
let keyScope = ''
let keyCounter = 0
const startDoc = (id) => {
  keyScope = id
  keyCounter = 0
}
const key = () => crypto.createHash('sha1').update(`${keyScope}:${keyCounter++}`).digest('hex').slice(0, 12)

const ref = (id) => ({_type: 'reference', _ref: id})
const refItem = (id) => ({_type: 'reference', _key: key(), _ref: id})
const slug = (current) => ({_type: 'slug', current})

const warnings = []
const warn = (msg) => warnings.push(`${keyScope}: ${msg}`)

// The one prototype link to a release-notes month page points readers to a
// specific fix. Sanity can reference a release note, not a month, so it is
// mapped to that note.
const MONTH_LINK_TARGETS = {'2026-10': 'rn-2026-10-enroll-status'}

/** Turns a prototype route such as "/guides/add-user" into a Sanity document ID. */
function routeToId(route) {
  const clean = route.replace(/^#/, '')
  let m = clean.match(/^\/(concepts|guides|journeys)\/([a-z0-9-]+)/)
  if (m) {
    const type = {concepts: 'concept', guides: 'guide', journeys: 'journey'}[m[1]]
    return FX.model.exists(type, m[2]) ? ids[type](m[2]) : null
  }
  m = clean.match(/^\/release-notes\/(\d{4}-\d{2})(?:\?section=([a-z0-9-]+))?/)
  if (m) {
    const rnId = m[2] || MONTH_LINK_TARGETS[m[1]]
    return rnId && FX.releases.some((r) => r.id === rnId) ? ids.releaseNote(rnId) : null
  }
  return null
}

/* ------------------------------------------------------------------ */
/* 3. HTML → Portable Text                                             */
/* ------------------------------------------------------------------ */

// Parse <pre> as normal markup so code blocks keep their structure.
const parse = (html) => parseHtml(html, {blockTextElements: {script: true, style: true}})

const textOf = (node) => (node ? node.text.replace(/\s+/g, ' ').trim() : '')
const stripHtml = (html) => textOf(parse(`<div>${html}</div>`))
const hasClass = (el, c) => el.nodeType === NodeType.ELEMENT_NODE && el.classList.contains(c)

/** Converts inline HTML nodes into Portable Text spans, collecting link definitions. */
function toSpans(nodes, marks, markDefs) {
  const spans = []
  for (const node of nodes) {
    if (node.nodeType === NodeType.TEXT_NODE) {
      const text = node.text.replace(/\s+/g, ' ')
      if (text) spans.push({_type: 'span', _key: key(), text, marks: [...marks]})
      continue
    }
    if (node.nodeType !== NodeType.ELEMENT_NODE) continue
    const tag = node.tagName.toLowerCase()
    if (tag === 'br') {
      spans.push({_type: 'span', _key: key(), text: '\n', marks: [...marks]})
    } else if (tag === 'strong' || tag === 'b' || hasClass(node, 'ui-label')) {
      spans.push(...toSpans(node.childNodes, [...marks, 'strong'], markDefs))
    } else if (tag === 'em' || tag === 'i') {
      spans.push(...toSpans(node.childNodes, [...marks, 'em'], markDefs))
    } else if (tag === 'code' || tag === 'kbd') {
      spans.push(...toSpans(node.childNodes, [...marks, 'code'], markDefs))
    } else if (tag === 'a') {
      const href = node.getAttribute('href') || ''
      const target = href.startsWith('#/') ? routeToId(href) : null
      if (target) {
        const k = key()
        markDefs.push({_type: 'internalLink', _key: k, reference: ref(target)})
        spans.push(...toSpans(node.childNodes, [...marks, k], markDefs))
      } else if (/^https?:|^mailto:/.test(href)) {
        const k = key()
        markDefs.push({_type: 'link', _key: k, href})
        spans.push(...toSpans(node.childNodes, [...marks, k], markDefs))
      } else {
        warn(`link "${href}" has no Sanity target; kept as plain text`)
        spans.push(...toSpans(node.childNodes, marks, markDefs))
      }
    } else {
      spans.push(...toSpans(node.childNodes, marks, markDefs))
    }
  }
  return spans
}

/** Tidies spans: trims the ends and merges neighbours with identical marks. */
function tidySpans(spans) {
  const out = []
  for (const s of spans) {
    const prev = out[out.length - 1]
    if (prev && prev.marks.join() === s.marks.join()) prev.text += s.text
    else out.push({...s})
  }
  if (out.length) {
    out[0].text = out[0].text.replace(/^\s+/, '')
    out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, '')
  }
  return out.filter((s) => s.text.length)
}

function textBlock(nodes, style = 'normal', extra = {}) {
  const markDefs = []
  const _key = key()
  const children = tidySpans(toSpans(nodes, [], markDefs))
  if (!children.length) return null
  const used = new Set(children.flatMap((c) => c.marks))
  return {_type: 'block', _key, style, ...extra, markDefs: markDefs.filter((d) => used.has(d._key)), children}
}

const DIAGRAM_VARIANTS = {diagram: 'sso-flow', fit: 'identity-fit', jml: 'jml-lifecycle'}
const CALLOUT_DEFAULT_TITLES = {note: 'Note', tip: 'Tip', warning: 'Warning', important: 'Important'}
const INLINE_TAGS = new Set(['strong', 'b', 'em', 'i', 'code', 'kbd', 'a', 'span', 'br'])

/** Converts an HTML fragment into an array of Portable Text blocks and custom objects. */
function htmlToBlocks(html) {
  const root = parse(`<div>${html}</div>`).firstChild
  const blocks = []
  let pendingInline = []
  const push = (b) => b && blocks.push(b)
  const flush = () => {
    if (pendingInline.length) push(textBlock(pendingInline))
    pendingInline = []
  }

  for (const node of root.childNodes) {
    if (node.nodeType === NodeType.TEXT_NODE) {
      if (node.text.trim()) pendingInline.push(node)
      continue
    }
    if (node.nodeType !== NodeType.ELEMENT_NODE) continue
    const tag = node.tagName.toLowerCase()
    if (INLINE_TAGS.has(tag) && !hasClass(node, 'tab-list')) {
      pendingInline.push(node)
      continue
    }
    flush()

    if (tag === 'p') push(textBlock(node.childNodes))
    else if (tag === 'h3' || tag === 'h4') push(textBlock(node.childNodes, tag))
    else if (tag === 'ul' || tag === 'ol') {
      for (const li of node.childNodes.filter((n) => n.tagName === 'LI')) {
        push(textBlock(li.childNodes, 'normal', {listItem: tag === 'ul' ? 'bullet' : 'number', level: 1}))
      }
    } else if (hasClass(node, 'callout')) {
      const tone = Object.keys(CALLOUT_DEFAULT_TITLES).find((t) => hasClass(node, `callout-${t}`)) || 'note'
      const title = textOf(node.querySelector('.callout-title span'))
      const body = htmlToBlocks(node.querySelector('.callout-body').innerHTML)
        .filter((b) => b._type === 'block')
        .map((b) => ({...b, style: 'normal'}))
      push({_type: 'callout', _key: key(), tone, ...(title && title !== CALLOUT_DEFAULT_TITLES[tone] ? {title} : {}), body})
    } else if (hasClass(node, 'code')) {
      push({
        _type: 'codeBlock',
        _key: key(),
        label: textOf(node.querySelector('.code-lang')) || undefined,
        code: node.querySelector('pre code').text,
      })
    } else if (hasClass(node, 'table-wrap')) {
      const table = node.querySelector('table')
      const rows = table.querySelectorAll('tr').map((tr) => ({
        _type: 'tableRow',
        _key: key(),
        cells: tr.childNodes.filter((c) => c.tagName === 'TH' || c.tagName === 'TD').map((c) => textOf(c)),
      }))
      push({_type: 'table', _key: key(), rows, compact: table.classList.contains('compact')})
    } else if (tag === 'figure' && Object.keys(DIAGRAM_VARIANTS).some((c) => hasClass(node, c))) {
      const variant = DIAGRAM_VARIANTS[Object.keys(DIAGRAM_VARIANTS).find((c) => hasClass(node, c))]
      push({_type: 'diagram', _key: key(), variant, caption: textOf(node.querySelector('figcaption')) || undefined})
    } else if (hasClass(node, 'benefits')) {
      // Benefit cards become a minor heading and a paragraph each.
      for (const card of node.childNodes.filter((n) => n.tagName === 'DIV')) {
        push(textBlock(card.querySelector('strong').childNodes, 'h4'))
        push(textBlock(card.querySelector('p').childNodes))
      }
    } else if (hasClass(node, 'tabs')) {
      // Tabs become a minor heading per tab followed by that tab's content.
      const labels = node.querySelectorAll('[data-tab]')
      const panels = node.querySelectorAll('[data-panel]')
      labels.forEach((label, i) => {
        push(textBlock(label.childNodes, 'h4'))
        htmlToBlocks(panels[i].innerHTML).forEach(push)
      })
    } else {
      warn(`unhandled <${tag} class="${node.getAttribute('class') || ''}">; converted as text`)
      htmlToBlocks(node.innerHTML).forEach(push)
    }
  }
  flush()
  return blocks
}

/** Converts a one-line HTML string (such as a prerequisite) into a single block. */
const inlineHtmlToBlock = (html) => textBlock(parse(`<div>${html}</div>`).firstChild.childNodes)

/* ------------------------------------------------------------------ */
/* 4. Categories                                                       */
/* ------------------------------------------------------------------ */

const docs = []
const categoryOf = {concept: {}, guide: {}} // slug -> category ID
const orderOf = {concept: {}, guide: {}} // slug -> order within its category

const ORDER_STEP = 10

for (const section of ['concept', 'guide']) {
  const walk = (items, categoryId) => {
    items.forEach((item, i) => {
      const order = (i + 1) * ORDER_STEP
      if (typeof item === 'string') {
        categoryOf[section][item] = categoryId
        orderOf[section][item] = order
        return
      }
      // A nested group (for example Applications › Single Sign On) becomes a
      // child category. Its order is shared with sibling pages so the sidebar
      // can interleave them exactly as the prototype does.
      const childId = ids.category(section, item.id)
      startDoc(childId)
      docs.push({
        _id: childId,
        _type: 'category',
        title: item.title,
        slug: slug(item.id),
        section,
        ...(item.desc ? {description: item.desc} : {}),
        parent: ref(categoryId),
        order,
      })
      walk(item.items, childId)
    })
  }
  FX.content[section].categories.forEach((cat, i) => {
    const id = ids.category(section, cat.id)
    startDoc(id)
    docs.push({
      _id: id,
      _type: 'category',
      title: cat.title,
      slug: slug(cat.id),
      section,
      ...(cat.desc ? {description: cat.desc} : {}),
      order: (i + 1) * ORDER_STEP,
    })
    walk(cat.items, id)
  })
}

/* ------------------------------------------------------------------ */
/* 5. Concepts                                                         */
/* ------------------------------------------------------------------ */

const existingRefs = (type, slugs = []) => slugs.filter((s) => FX.model.exists(type, s)).map((s) => refItem(ids[type](s)))

for (const [s, p] of Object.entries(FX.content.concept.pages)) {
  const id = ids.concept(s)
  startDoc(id)
  docs.push({
    _id: id,
    _type: 'concept',
    title: p.title,
    summary: p.summary,
    sections: (p.sections || []).map((sec) => ({
      _type: 'articleSection',
      _key: key(),
      title: sec.title,
      anchor: slug(sec.id),
      body: htmlToBlocks(sec.html),
    })),
    terms: (p.terms || []).map((t) => ({_type: 'glossaryTerm', _key: key(), term: t.term, definition: stripHtml(t.def)})),
    slug: slug(s),
    category: ref(categoryOf.concept[s]),
    order: orderOf.concept[s],
    relatedConcepts: existingRefs('concept', p.related.concepts),
    relatedGuides: existingRefs('guide', p.related.guides),
    updated: p.updated,
    keywords: p.keywords || [],
  })
}

/* ------------------------------------------------------------------ */
/* 6. Guides                                                           */
/* ------------------------------------------------------------------ */

function screenshotFromShot(shot) {
  // The prototype draws a mock of the Admin Console. There is no image file to
  // upload, so the step gets an empty image field with alt text and caption,
  // ready for a real screenshot.
  const where = [shot.area, shot.title].filter(Boolean).join(' › ')
  return {
    _type: 'figure',
    alt: `Screenshot of the Fixiam Admin Console: ${where}`,
    ...(shot.caption ? {caption: shot.caption} : {}),
  }
}

for (const [s, p] of Object.entries(FX.content.guide.pages)) {
  const id = ids.guide(s)
  startDoc(id)
  docs.push({
    _id: id,
    _type: 'guide',
    title: p.title,
    summary: p.summary,
    ...(p.time ? {timeToComplete: p.time} : {}),
    ...(p.role ? {role: p.role} : {}),
    accomplish: p.accomplish.map(stripHtml),
    prerequisites: p.prereqs.map(inlineHtmlToBlock).filter(Boolean),
    steps: p.steps.map((step) => {
      const st = typeof step === 'string' ? {title: step} : step
      const body = st.html ? htmlToBlocks(st.html) : []
      return {
        _type: 'guideStep',
        _key: key(),
        title: st.title,
        ...(body.length ? {body} : {}),
        ...(st.shot ? {screenshot: screenshotFromShot(st.shot)} : {}),
      }
    }),
    expectedResult: htmlToBlocks(`<p>${p.result}</p>`),
    troubleshooting: (p.troubleshooting || []).map((t) => ({
      _type: 'troubleshootingItem',
      _key: key(),
      problem: stripHtml(t.q),
      solution: htmlToBlocks(`<p>${t.a}</p>`),
    })),
    slug: slug(s),
    category: ref(categoryOf.guide[s]),
    order: orderOf.guide[s],
    relatedGuides: existingRefs('guide', p.related.guides),
    relatedConcepts: existingRefs('concept', p.related.concepts),
    updated: p.updated,
    keywords: p.keywords || [],
  })
}

/* ------------------------------------------------------------------ */
/* 7. Journeys                                                         */
/* ------------------------------------------------------------------ */

FX.content.journey.categories[0].items.forEach((s, i) => {
  const p = FX.content.journey.pages[s]
  const id = ids.journey(s)
  startDoc(id)
  docs.push({
    _id: id,
    _type: 'journey',
    title: p.title,
    summary: p.summary,
    audience: p.audience,
    effort: p.effort.toLowerCase(),
    duration: p.duration,
    outcomes: p.outcome,
    stages: p.stages.map((st) => ({
      _type: 'journeyStage',
      _key: key(),
      title: st.title,
      body: htmlToBlocks(st.html),
      learn: existingRefs('concept', st.learn),
      do: existingRefs('guide', st.do),
      ...(st.checklist ? {checklist: st.checklist} : {}),
    })),
    slug: slug(s),
    order: (i + 1) * ORDER_STEP,
    nextJourneys: existingRefs('journey', p.next),
    updated: p.updated,
    keywords: p.keywords || [],
  })
})

/* ------------------------------------------------------------------ */
/* 8. Release notes                                                    */
/* ------------------------------------------------------------------ */

for (const r of FX.releases) {
  const id = ids.releaseNote(r.id)
  startDoc(id)
  const related = []
  for (const [label, route] of r.links) {
    const target = routeToId(route)
    if (target) related.push(refItem(target))
    else warn(`related link "${label}" (${route}) is not a concept, guide or journey; not migrated`)
  }
  docs.push({
    _id: id,
    _type: 'releaseNote',
    title: r.title,
    date: r.date,
    category: r.category,
    area: r.area,
    summary: r.summary,
    details: htmlToBlocks(r.details),
    relatedDocs: related,
  })
}

/* ------------------------------------------------------------------ */
/* 9. Documentation Homepage                                           */
/* ------------------------------------------------------------------ */

{
  // The homepage content lives in the prototype's home template, so it is read
  // from the rendered home page rather than copied by hand.
  const id = ids.homepage()
  startDoc(id)
  const home = parse(FX.tpl.home().html)
  const section = (el) => ['concept', 'guide', 'journey', 'release'].find((t) => el.classList.contains(`t-${t}`))
  const hrefToRef = (el) => {
    const target = routeToId(el.getAttribute('href').replace(/^#/, ''))
    if (!target) warn(`homepage link ${el.getAttribute('href')} has no Sanity target`)
    return target
  }
  docs.push({
    _id: id,
    _type: 'docsHomepage',
    title: textOf(home.querySelector('.hero h1')),
    tagline: textOf(home.querySelector('.hero .lead')),
    searchPlaceholder: home.querySelector('#hero-q').getAttribute('placeholder'),
    popularSearches: [...FX.POPULAR_SEARCHES],
    discoveryCards: home.querySelectorAll('.discover-card').map((card) => ({
      _type: 'discoveryCard',
      _key: key(),
      section: section(card),
      title: textOf(card.querySelector('.dc-title')),
      description: textOf(card.querySelector('.dc-desc')),
      ctaLabel: textOf(card.querySelector('.dc-cta')),
    })),
    popularTopics: home
      .querySelectorAll('.popular')
      .map((a) => ({label: textOf(a.querySelector('.popular-title')), target: hrefToRef(a)}))
      .filter((t) => t.target)
      .map((t) => ({_type: 'popularTopic', _key: key(), label: t.label, page: ref(t.target)})),
    featuredJourneys: home
      .querySelectorAll('.journey-mini')
      .map(hrefToRef)
      .filter(Boolean)
      .map(refItem),
  })
}

/* ------------------------------------------------------------------ */
/* 10. Self-checks before writing                                      */
/* ------------------------------------------------------------------ */

const errors = []
const allIds = new Set(docs.map((d) => d._id))

const REQUIRED = {
  category: ['title', 'slug', 'section'],
  concept: ['title', 'summary', 'sections', 'slug', 'category', 'updated'],
  guide: ['title', 'summary', 'accomplish', 'steps', 'expectedResult', 'slug', 'category', 'updated'],
  journey: ['title', 'summary', 'audience', 'outcomes', 'stages', 'slug', 'updated'],
  releaseNote: ['title', 'date', 'category', 'area', 'summary'],
  docsHomepage: ['title', 'tagline'],
}

function walkValue(value, docId, trail) {
  if (Array.isArray(value)) {
    const keys = new Set()
    value.forEach((item, i) => {
      if (item && typeof item === 'object') {
        if (!item._key) errors.push(`${docId}: missing _key at ${trail}[${i}]`)
        else if (keys.has(item._key)) errors.push(`${docId}: duplicate _key at ${trail}`)
        keys.add(item._key)
      }
      walkValue(item, docId, `${trail}[${i}]`)
    })
  } else if (value && typeof value === 'object') {
    if (value._type === 'reference' && !allIds.has(value._ref)) errors.push(`${docId}: broken reference to ${value._ref} at ${trail}`)
    if (value._type === 'block' && !value.children?.length) errors.push(`${docId}: empty block at ${trail}`)
    if (value._type === 'block') {
      const defs = new Set((value.markDefs || []).map((d) => d._key))
      const allowed = new Set(['strong', 'em', 'code'])
      for (const c of value.children) for (const m of c.marks) if (!allowed.has(m) && !defs.has(m)) errors.push(`${docId}: unknown mark ${m} at ${trail}`)
    }
    for (const [k, v] of Object.entries(value)) walkValue(v, docId, trail ? `${trail}.${k}` : k)
  } else if (typeof value === 'string' && /<\/?[a-z][a-z0-9]*[\s>]/i.test(value) && !trail.endsWith('.code')) {
    errors.push(`${docId}: HTML left in ${trail}: ${value.slice(0, 60)}`)
  }
}

for (const d of docs) {
  for (const f of REQUIRED[d._type] || []) {
    const v = d[f]
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) errors.push(`${d._id}: required field "${f}" is empty`)
  }
  walkValue(d, d._id, '')
}
if (allIds.size !== docs.length) errors.push('duplicate document IDs')

/* ------------------------------------------------------------------ */
/* 11. Write                                                           */
/* ------------------------------------------------------------------ */

const clean = (v) => JSON.parse(JSON.stringify(v)) // drops undefined values
fs.writeFileSync(OUT, docs.map((d) => JSON.stringify(clean(d))).join('\n') + '\n')

const count = (t) => docs.filter((d) => d._type === t).length
const refCount = docs.reduce((n, d) => n + (JSON.stringify(d).match(/"_type":"reference"/g) || []).length, 0)
console.log(`Wrote ${path.relative(process.cwd(), OUT)}

  Documentation Homepage  ${count('docsHomepage')}
  Categories              ${count('category')}  (${docs.filter((d) => d._type === 'category' && d.parent).length} nested)
  Concepts                ${count('concept')}
  Guides                  ${count('guide')}
  Journeys                ${count('journey')}
  Release notes           ${count('releaseNote')}
  ─────────────────────────────
  Documents               ${docs.length}
  References              ${refCount}
`)
if (warnings.length) console.log(`Notes (${warnings.length}):\n  ${warnings.join('\n  ')}\n`)
if (errors.length) {
  console.error(`Problems (${errors.length}):\n  ${errors.join('\n  ')}`)
  process.exit(1)
}
console.log('All self-checks passed: required fields present, every reference resolves, every array item has a unique _key.')
