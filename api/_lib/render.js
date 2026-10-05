/**
 * Renders Sanity Portable Text to HTML with the official @portabletext/to-html
 * renderer.
 *
 * Custom blocks (callouts, code blocks, tables, diagrams, images) are drawn by
 * the website's own component helpers in assets/js/helpers.js, so content from
 * Sanity produces exactly the same markup, and therefore the same design, as
 * the rest of the site. The helpers file is loaded once per function instance.
 */
import fs from 'node:fs'
import vm from 'node:vm'
import {toHTML} from '@portabletext/to-html'

let helpers
export function getHelpers() {
  if (!helpers) {
    const source = fs.readFileSync(new URL('../../assets/js/helpers.js', import.meta.url), 'utf8')
    const sandbox = {FX: {}}
    sandbox.window = sandbox
    vm.createContext(sandbox)
    vm.runInContext(source, sandbox, {filename: 'assets/js/helpers.js'})
    helpers = sandbox.FX.h
  }
  return helpers
}

const CALLOUTS = {note: 'note', tip: 'tip', warning: 'warn', important: 'important'}
const SAFE_LINK = /^(https?:|mailto:)/i

/**
 * @param {object} opts
 * @param {(id: string) => string | null} opts.routeFor  Route for a referenced document, or null if it is not published.
 * @param {(image: object) => {src: string, width?: number, height?: number} | null} opts.imageFor  URL for an image asset.
 */
export function createRenderer({routeFor, imageFor}) {
  const H = getHelpers()

  // Images without an uploaded file show the same screenshot placeholder the
  // prototype used, so editors can see where a screenshot belongs.
  const figureHtml = (value) => {
    if (!value) return ''
    const image = value.asset?._ref ? imageFor(value) : null
    if (image) return H.figure({...image, alt: value.alt || '', caption: value.caption})
    const where = String(value.alt || '').replace(/^Screenshot of the Fixiam Admin Console:\s*/i, '')
    const [area, ...rest] = where.split(' › ')
    return H.shot({area: area || 'Dashboard', title: rest.join(' › '), kind: 'none', caption: value.caption})
  }

  const components = {
    types: {
      callout: ({value}) => {
        const fn = H[CALLOUTS[value.tone] || 'note']
        const body = value.body || []
        // A one-paragraph callout is written inline, as the site's own callouts are.
        const single = body.length === 1 && body[0]._type === 'block' && (body[0].style || 'normal') === 'normal' && !body[0].listItem
        return fn(single ? inline(body) : blocks(body), value.title || undefined)
      },
      codeBlock: ({value}) => H.code(value.code || '', value.label || ''),
      table: ({value}) => {
        const rows = (value.rows || []).map((r) => (r.cells || []).map((c) => H.esc(c ?? '')))
        if (!rows.length) return ''
        return H.table(rows[0], rows.slice(1), {compact: !!value.compact})
      },
      diagram: ({value}) => H.diagram(value.variant, value.caption),
      figure: ({value}) => figureHtml(value),
    },
    marks: {
      internalLink: ({children, value}) => {
        const route = value?.reference?._ref ? routeFor(value.reference._ref) : null
        return route ? `<a href="#${route}">${children}</a>` : children
      },
      link: ({children, value}) => {
        const href = value?.href || ''
        return SAFE_LINK.test(href) ? `<a href="${H.esc(href)}" target="_blank" rel="noopener noreferrer">${children}</a>` : children
      },
    },
    unknownType: () => '',
    unknownMark: ({children}) => children,
    unknownBlockStyle: ({children}) => `<p>${children}</p>`,
  }

  /** Renders a rich text field as block HTML. */
  function blocks(value) {
    if (!Array.isArray(value) || !value.length) return ''
    return toHTML(value, {components, onMissingComponent: false})
  }

  /**
   * Renders rich text for places where the site expects inline HTML inside its
   * own paragraph (expected result, troubleshooting answers, prerequisites).
   */
  function inline(value) {
    if (!Array.isArray(value) || !value.length) return ''
    const parts = value
      .filter((b) => b && b._type === 'block')
      .map((b) => toHTML({...b, style: 'normal', listItem: undefined}, {components, onMissingComponent: false}).replace(/^<p>|<\/p>$/g, ''))
      .filter(Boolean)
    return parts.join('<br><br>')
  }

  return {blocks, inline, figureHtml, esc: H.esc}
}
