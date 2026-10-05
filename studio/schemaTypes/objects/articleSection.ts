import {defineField, defineType} from 'sanity'
import {BlockContentIcon} from '@sanity/icons/BlockContent'

/**
 * A titled section of a concept page. Each section heading appears in the
 * page's "On this page" navigation.
 */
export const articleSection = defineType({
  name: 'articleSection',
  title: 'Section',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({name: 'title', title: 'Heading', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'anchor',
      title: 'Anchor',
      type: 'slug',
      description: 'Used for links to this section, for example #how-sso-works.',
      options: {source: (_doc, context) => (context.parent as {title?: string})?.title || ''},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'body', title: 'Content', type: 'richText', validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'anchor.current'}, prepare: ({title, subtitle}) => ({title, subtitle: subtitle ? `#${subtitle}` : ''})},
})
