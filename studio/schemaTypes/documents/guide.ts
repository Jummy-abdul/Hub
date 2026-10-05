import {defineArrayMember, defineField, defineType} from 'sanity'
import {WrenchIcon} from '@sanity/icons/Wrench'

import {ARTICLE_GROUPS, notSelf} from '../constants'
import {categoryField, keywordsField, orderField, slugField, summaryField, titleField, updatedField} from '../fields'

/**
 * Guide: "Show me how."
 * Helps someone complete one task. Every guide has the same structure so
 * readers always know where to look.
 */
export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  icon: WrenchIcon,
  groups: ARTICLE_GROUPS,
  fields: [
    titleField(),
    summaryField(),
    defineField({
      name: 'timeToComplete',
      title: 'Time to complete',
      type: 'string',
      group: 'content',
      description: 'For example “20 minutes” or “10 minutes per device”.',
    }),
    defineField({
      name: 'role',
      title: 'Required role',
      type: 'string',
      group: 'content',
      description: 'The minimum Fixiam administrator role, for example “Application administrator or higher”.',
    }),
    defineField({
      name: 'accomplish',
      title: 'What you will accomplish',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'prerequisites',
      title: 'Prerequisites',
      type: 'array',
      group: 'content',
      description: 'One item per requirement. Links to other pages are allowed.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Paragraph', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [{title: 'Code', value: 'code'}],
            annotations: [
              {
                name: 'internalLink',
                title: 'Link to documentation page',
                type: 'object',
                fields: [{name: 'reference', type: 'reference', to: [{type: 'concept'}, {type: 'guide'}]}],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'guideStep'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'expectedResult',
      title: 'Expected result',
      type: 'richText',
      group: 'content',
      description: 'What the reader should see when they have finished.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'troubleshooting',
      title: 'Troubleshooting',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'troubleshootingItem'})],
    }),

    slugField(),
    categoryField('guide'),
    orderField(),

    defineField({
      name: 'relatedGuides',
      title: 'Related guides',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'reference', to: [{type: 'guide'}], options: {filter: notSelf}})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'relatedConcepts',
      title: 'Learn the concepts',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'reference', to: [{type: 'concept'}]})],
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
