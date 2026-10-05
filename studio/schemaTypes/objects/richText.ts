import {defineArrayMember, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

import {LINKABLE_TYPES} from '../constants'

/**
 * Rich text used for article bodies. It supports the same building blocks the
 * prototype renders: paragraphs, subheadings, lists, inline code, links to
 * other documentation pages, callouts, code blocks, figures, tables and
 * built-in diagrams.
 */
export const richText = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraph', value: 'normal'},
        {title: 'Subheading', value: 'h3'},
        {title: 'Minor heading', value: 'h4'},
      ],
      lists: [
        {title: 'Bullets', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
          {title: 'Code', value: 'code'},
        ],
        annotations: [
          {
            name: 'internalLink',
            title: 'Link to documentation page',
            type: 'object',
            icon: LinkIcon,
            fields: [
              {name: 'reference', title: 'Page', type: 'reference', to: LINKABLE_TYPES, validation: (rule) => rule.required()},
            ],
          },
          {
            name: 'link',
            title: 'External link',
            type: 'object',
            fields: [
              {
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) => rule.required().uri({scheme: ['https', 'http', 'mailto']}),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({type: 'callout'}),
    defineArrayMember({type: 'codeBlock'}),
    defineArrayMember({type: 'figure'}),
    defineArrayMember({type: 'table'}),
    defineArrayMember({type: 'diagram'}),
  ],
})
