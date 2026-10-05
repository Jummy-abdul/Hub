import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

/** One entry in a concept page's "Common terminology" list. */
export const glossaryTerm = defineType({
  name: 'glossaryTerm',
  title: 'Term',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({name: 'term', title: 'Term', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'definition', title: 'Definition', type: 'text', rows: 2, validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'term', subtitle: 'definition'}},
})
