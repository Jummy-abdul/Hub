/**
 * GET /api/content
 *
 * Returns the published Fixiam documentation from Sanity, shaped for the
 * website. Runs on the server (Vercel Function), so the optional read token
 * is never sent to browsers, and the browser only ever talks to this site.
 */
import {getContentBundle} from './_lib/content.js'

// Last successful response in this function instance. Served if Sanity is
// briefly unreachable, so visitors keep seeing documentation.
let lastGood = null

const json = (body, status, cacheControl) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Short shared cache: published changes appear within about 10 seconds.
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
    },
  })

export async function GET() {
  try {
    const bundle = await getContentBundle()
    if (bundle.meta.skipped.length) console.warn('[content] skipped documents', bundle.meta.skipped)
    lastGood = bundle
    return json(bundle, 200, 'public, max-age=0, s-maxage=10')
  } catch (err) {
    console.error('[content] could not load content from Sanity:', err?.message || err)
    if (lastGood) return json({...lastGood, meta: {...lastGood.meta, stale: true}}, 200, 'no-store')
    return json({error: 'content_unavailable', message: 'The documentation content service is temporarily unavailable.'}, 503, 'no-store')
  }
}
