#!/usr/bin/env node
/**
 * Local development server: serves the website and runs /api/content exactly
 * as Vercel does.
 *
 *   npm run dev                    content from Sanity (uses .env.local if present)
 *   npm run dev:offline            content from studio/seed/fixiam-seed.ndjson, no network
 *
 * Options:
 *   --port 3000                    port to listen on
 *   --fixture <file.ndjson>        answer the real GROQ query from a local export
 *                                  instead of Sanity (uses groq-js)
 *   --outage                       simulate Sanity being unavailable
 */
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

/** Loads KEY=value lines from .env.local and .env without overriding real env vars. */
function loadEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const file = path.join(ROOT, name)
    if (!fs.existsSync(file)) continue
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
}

/** A stand-in for the Sanity client that runs GROQ against a local NDJSON export. */
async function createFixtureClient(file) {
  const {parse, evaluate} = await import('groq-js')
  const docs = fs.readFileSync(path.resolve(ROOT, file), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
  return {
    docs,
    async fetch(query, params = {}) {
      const tree = parse(query, {params})
      return (await evaluate(tree, {dataset: docs, params})).get()
    },
  }
}

export async function startServer({port = 3000, fixture, outage = false, quiet = false} = {}) {
  loadEnvFiles()
  const {getContentBundle} = await import(pathToFileURL(path.join(ROOT, 'api/_lib/content.js')).href)
  const fixtureClient = fixture ? await createFixtureClient(fixture) : null
  const handlerModule = await import(pathToFileURL(path.join(ROOT, 'api/content.js')).href)
  const state = {outage, fixtureClient}

  const contentResponse = async () => {
    if (!fixtureClient && !state.outage) return handlerModule.GET()
    // Fixture and outage modes reuse the production code path with a different client.
    try {
      if (state.outage) throw new Error('Simulated Sanity outage')
      const bundle = await getContentBundle({client: fixtureClient})
      return new Response(JSON.stringify(bundle), {status: 200, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}})
    } catch (err) {
      return new Response(JSON.stringify({error: 'content_unavailable', message: err.message}), {status: 503, headers: {'Content-Type': 'application/json; charset=utf-8'}})
    }
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/api/content') {
      const r = await contentResponse()
      res.writeHead(r.status, Object.fromEntries(r.headers))
      res.end(Buffer.from(await r.arrayBuffer()))
      return
    }
    let rel = decodeURIComponent(url.pathname)
    if (rel.endsWith('/')) rel += 'index.html'
    const file = path.join(ROOT, rel)
    if (!file.startsWith(ROOT + path.sep) || /(^|\/)\.|\/(api|node_modules|studio)\//.test(rel) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.end('Not found')
      return
    }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'})
    fs.createReadStream(file).pipe(res)
  })

  await new Promise((resolve) => server.listen(port, resolve))
  const address = `http://localhost:${server.address().port}`
  if (!quiet) {
    console.log(`Fixiam Documentation running at ${address}`)
    console.log(fixture ? `Content: local fixture ${fixture} (offline)` : 'Content: Sanity (published content)')
    if (state.outage) console.log('Simulating a Sanity outage')
  }
  return {server, url: address, state, close: () => new Promise((r) => server.close(r))}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (name) => {
    const i = process.argv.indexOf(name)
    return i > -1 ? process.argv[i + 1] : undefined
  }
  startServer({port: Number(arg('--port') || 3000), fixture: arg('--fixture'), outage: process.argv.includes('--outage')})
}
