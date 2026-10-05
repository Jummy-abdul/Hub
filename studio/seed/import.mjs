#!/usr/bin/env node
/**
 * Imports seed/fixiam-seed.ndjson into Sanity using the official CLI.
 *
 *   node seed/import.mjs            create seed documents that do not exist yet (safe to repeat)
 *   node seed/import.mjs --replace  overwrite seed documents with the prototype content
 *
 * Authentication: the CLI uses your local `sanity login` session. In CI, set
 * SANITY_IMPORT_TOKEN in the environment instead. No token is read from or
 * written to any file.
 */
import {spawnSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.join(HERE, 'fixiam-seed.ndjson')
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'idpyt5ut'
const dataset = process.env.SANITY_STUDIO_DATASET || 'fixiam_docs_sandbox'
const replace = process.argv.includes('--replace')

if (!fs.existsSync(FILE)) {
  console.error('seed/fixiam-seed.ndjson is missing. Run `npm run seed:build` first.')
  process.exit(1)
}
const count = fs.readFileSync(FILE, 'utf8').trim().split('\n').length

console.log(`
Importing ${count} documents
  Project   ${projectId}
  Dataset   ${dataset}
  Mode      ${replace ? 'REPLACE: seed documents are overwritten with prototype content. Edits you made to them in the Studio are lost. Other documents are not touched.' : 'MISSING: only documents that do not exist yet are created. Existing documents, including your edits, are left alone.'}
  Auth      ${process.env.SANITY_IMPORT_TOKEN ? 'SANITY_IMPORT_TOKEN from the environment' : 'your local `sanity login` session'}
`)

const result = spawnSync(
  'npx',
  ['sanity', 'dataset', 'import', FILE, '--dataset', dataset, '--project-id', projectId, replace ? '--replace' : '--missing'],
  {stdio: 'inherit', cwd: path.resolve(HERE, '..')},
)
process.exit(result.status ?? 1)
