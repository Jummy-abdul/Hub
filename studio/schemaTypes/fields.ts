import {defineField} from 'sanity'

/**
 * Field factories shared by Concepts, Guides and Journeys, so every article
 * type has the same title, slug, summary, ordering and metadata fields.
 */

export const titleField = (group = 'content') =>
  defineField({
    name: 'title',
    title: 'Title',
    type: 'string',
    group,
    validation: (rule) => rule.required().max(120),
  })

export const slugField = (group = 'navigation') =>
  defineField({
    name: 'slug',
    title: 'URL slug',
    type: 'slug',
    group,
    description: 'Used in the page address, for example /guides/configure-saml-sso. Changing it breaks existing links.',
    options: {source: 'title', maxLength: 96},
    validation: (rule) => rule.required(),
  })

export const summaryField = (group = 'content') =>
  defineField({
    name: 'summary',
    title: 'Summary',
    type: 'text',
    rows: 3,
    group,
    description: 'One or two sentences. Shown under the title, on cards and in search results.',
    validation: (rule) => [rule.required(), rule.max(280).warning('Keep summaries short so they fit on cards.')],
  })

export const orderField = (group = 'navigation') =>
  defineField({
    name: 'order',
    title: 'Order in sidebar',
    type: 'number',
    group,
    description: 'Lower numbers appear first within the category. Also sets previous and next links.',
    initialValue: 100,
  })

export const updatedField = (group = 'meta') =>
  defineField({
    name: 'updated',
    title: 'Last updated',
    type: 'date',
    group,
    description: 'Shown as “Updated …” at the top of the page.',
    initialValue: () => new Date().toISOString().slice(0, 10),
    validation: (rule) => rule.required(),
  })

export const keywordsField = (group = 'meta') =>
  defineField({
    name: 'keywords',
    title: 'Search keywords',
    type: 'array',
    of: [{type: 'string'}],
    group,
    options: {layout: 'tags'},
    description: 'Extra words people might search for, such as abbreviations (SSO, MFA) or older product names.',
  })

export const categoryField = (section: 'concept' | 'guide' | 'journey', group = 'navigation', required = true) =>
  defineField({
    name: 'category',
    title: 'Category',
    type: 'reference',
    to: [{type: 'category'}],
    group,
    description: 'Where this page appears in the sidebar.',
    options: {filter: 'section == $section', filterParams: {section}},
    validation: (rule) => (required ? rule.required() : rule),
  })
