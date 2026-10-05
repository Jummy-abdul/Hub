import {defineArrayMember, defineField, defineType} from 'sanity'
import {BookIcon} from '@sanity/icons/Book'

import {ARTICLE_GROUPS, notSelf} from '../constants'
import {categoryField, keywordsField, orderField, slugField, summaryField, titleField, updatedField} from '../fields'

/**
 * Concept: "Teach me."
 * Explains what something is and how it works. Concepts should not contain
 * step-by-step configuration; link to the relevant guides instead.
 */
export const concept = defineType({
  name: 'concept',
  title: 'Concept',
  type: 'document',
  icon: BookIcon,
  groups: ARTICLE_GROUPS,
  fields: [
    titleField(),
    summaryField(),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      description: 'Each section heading appears in “On this page”.',
      of: [defineArrayMember({type: 'articleSection'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'terms',
      title: 'Common terminology',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'glossaryTerm'})],
    }),

    slugField(),
    categoryField('concept'),
    orderField(),

    defineField({
      name: 'relatedConcepts',
      title: 'Related concepts',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'reference', to: [{type: 'concept'}], options: {filter: notSelf}})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'relatedGuides',
      title: 'Related guides',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'reference', to: [{type: 'guide'}]})],
      validation: (rule) => rule.unique(),
    }),

    updatedField(),
    keywordsField(),
  ],
  orderings: [
    {title: 'Sidebar order', name: 'order', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Title', name: 'title', by: [{field: 'title', direction: 'asc'}]},
    {title: 'Recently updated', name: 'updated', by: [{field: 'updated', direction: 'desc'}]},
  ],
  preview: {select: {title: 'title', subtitle: 'category.title'}},
})
