import {defineArrayMember, defineField, defineType} from 'sanity'
import {SparklesIcon} from '@sanity/icons/Sparkles'

import {LINKABLE_TYPES, RELEASE_CATEGORIES} from '../constants'

/**
 * Release note: "What's changed?"
 * One entry per change. The site groups entries by month and filters them by
 * year, month and category.
 */
export const releaseNote = defineType({
  name: 'releaseNote',
  title: 'Release note',
  type: 'document',
  icon: SparklesIcon,
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required().max(120)}),
    defineField({
      name: 'date',
      title: 'Release date',
      type: 'date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: RELEASE_CATEGORIES, layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'area',
      title: 'Affected area',
      type: 'string',
      description: 'The product area, for example Device Management or Authentication.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Short description',
      type: 'text',
      rows: 2,
      validation: (rule) => [rule.required(), rule.max(240).warning('Keep it to one or two sentences.')],
    }),
    defineField({name: 'details', title: 'Detailed explanation', type: 'richText'}),
    defineField({
      name: 'relatedDocs',
      title: 'Related documentation',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: LINKABLE_TYPES.filter((t) => t.type !== 'releaseNote')})],
      validation: (rule) => rule.unique(),
    }),
  ],
  orderings: [{title: 'Newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', date: 'date', category: 'category', area: 'area'},
    prepare: ({title, date, category, area}) => ({
      title,
      subtitle: [date, RELEASE_CATEGORIES.find((c) => c.value === category)?.title, area].filter(Boolean).join(' · '),
    }),
  },
})
