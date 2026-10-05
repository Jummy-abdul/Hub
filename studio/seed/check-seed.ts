/**
 * Checks seed/fixiam-seed.ndjson against the Studio's real schema, offline.
 *
 *   npx sanity exec seed/check-seed.ts
 *
 * For every document it confirms that each field exists in the schema, each
 * value has the right type, array items are allowed members, option lists are
 * respected and rich text only uses the configured styles, lists, decorators
 * and link types. It does not contact Sanity.
 */
import fs from 'node:fs'
import path from 'node:path'
import {createSchema} from 'sanity'

import {schemaTypes} from '../schemaTypes'

type AnyType = {
  name: string
  jsonType: string
  type?: AnyType
  fields?: {name: string; type: AnyType}[]
  of?: AnyType[]
  options?: {list?: (string | {value: string})[]}
}

const schema = createSchema({name: 'seed-check', types: schemaTypes})
const file = path.resolve(process.cwd(), 'seed/fixiam-seed.ndjson')
const docs = fs.readFileSync(file, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
const errors: string[] = []

const is = (t: AnyType | undefined, name: string): boolean => {
  for (let cur = t; cur; cur = cur.type) if (cur.name === name) return true
  return false
}
const listValues = (t: AnyType) => t.options?.list?.map((o) => (typeof o === 'string' ? o : o.value))
const IGNORED_KEYS = new Set(['_type', '_key', '_id', '_rev', '_createdAt', '_updatedAt'])

function checkBlock(value: any, t: AnyType, at: string) {
  const field = (n: string) => t.fields!.find((f) => f.name === n)!.type
  const styles = listValues(field('style'))
  if (styles && !styles.includes(value.style)) errors.push(`${at}: style "${value.style}" is not allowed`)
  const lists = listValues(field('listItem'))
  if (value.listItem && !lists?.includes(value.listItem)) errors.push(`${at}: list "${value.listItem}" is not allowed`)
  const span = field('children').of![0] as AnyType & {annotations?: AnyType[]; decorators?: {value: string}[]}
  const decorators = new Set((span.decorators || []).map((d) => d.value))
  const annotations = span.annotations || []
  const defKeys = new Set<string>()
  for (const def of value.markDefs || []) {
    const ann = annotations.find((a) => a.name === def._type)
    if (!ann) errors.push(`${at}: link type "${def._type}" is not allowed here`)
    else checkValue(def, ann, `${at}.markDefs`)
    defKeys.add(def._key)
  }
  for (const child of value.children || []) {
    if (child._type !== 'span' || typeof child.text !== 'string') errors.push(`${at}: invalid span`)
    for (const m of child.marks || []) if (!decorators.has(m) && !defKeys.has(m)) errors.push(`${at}: mark "${m}" is not allowed`)
  }
}

function checkValue(value: any, t: AnyType, at: string) {
  if (value === undefined || value === null) return
  if (is(t, 'block')) return checkBlock(value, t, at)
  if (is(t, 'reference')) {
    if (value._type !== 'reference' || typeof value._ref !== 'string') errors.push(`${at}: expected a reference`)
    return
  }
  switch (t.jsonType) {
    case 'string': {
      if (typeof value !== 'string') return void errors.push(`${at}: expected text, got ${typeof value}`)
      const allowed = listValues(t)
      if (allowed && !allowed.includes(value)) errors.push(`${at}: "${value}" is not one of ${allowed.join(', ')}`)
      if (is(t, 'date') && !/^\d{4}-\d{2}-\d{2}$/.test(value)) errors.push(`${at}: invalid date "${value}"`)
      return
    }
    case 'number':
    case 'boolean':
      if (typeof value !== t.jsonType) errors.push(`${at}: expected ${t.jsonType}`)
      return
    case 'array': {
      if (!Array.isArray(value)) return void errors.push(`${at}: expected a list`)
      value.forEach((item, i) => {
        const member =
          item && typeof item === 'object'
            ? t.of!.find((m) => m.name === item._type || (item._type === 'reference' && is(m, 'reference')) || (item._type === 'block' && is(m, 'block')))
            : t.of!.find((m) => m.jsonType === typeof item)
        if (!member) errors.push(`${at}[${i}]: "${item?._type ?? typeof item}" is not allowed in this list`)
        else checkValue(item, member, `${at}[${i}]`)
      })
      return
    }
    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value)) return void errors.push(`${at}: expected an object`)
      for (const [k, v] of Object.entries(value)) {
        if (IGNORED_KEYS.has(k)) continue
        const f = t.fields?.find((fd) => fd.name === k)
        if (!f) errors.push(`${at}: unknown field "${k}" for type ${t.name}`)
        else checkValue(v, f.type, `${at}.${k}`)
      }
      return
    }
  }
}

const counts: Record<string, number> = {}
for (const doc of docs) {
  const t = schema.get(doc._type) as AnyType | undefined
  if (!t) {
    errors.push(`${doc._id}: unknown document type "${doc._type}"`)
    continue
  }
  counts[doc._type] = (counts[doc._type] || 0) + 1
  checkValue(doc, t, doc._id)
}

console.log(`Checked ${docs.length} documents against the Studio schema:`, counts)
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n  ${errors.slice(0, 50).join('\n  ')}`)
  process.exit(1)
}
console.log('Every field, value type, list item, rich text style, mark and link type matches the schema.')
