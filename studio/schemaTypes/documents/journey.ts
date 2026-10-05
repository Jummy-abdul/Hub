import {defineArrayMember, defineField, defineType} from 'sanity'
import {RocketIcon} from '@sanity/icons/Rocket'

import {ARTICLE_GROUPS, notSelf} from '../constants'
import {categoryField, keywordsField, orderField, slugField, summaryField, titleField, updatedField} from '../fields'

/**
 * Journey: "Take me from beginning to end."
 * An ordered path of stages toward a larger outcome. Stages link to concepts
 * and guides rather than repeating their content.
 */
export const journey = defineType({
  name: 'journey',
  title: 'Journey',
  type: 'document',
  icon: RocketIcon,
  groups: ARTICLE_GROUPS,
  fields: [
    titleField(),
    summaryField(),
    defineField({
      name: 'audience',
      title: 'Who it is for',
      type: 'string',
      group: 'content',
      description: 'For example “IT administrators and identity teams”.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'effort',
      title: 'Effort',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: 'Low', value: 'low'},
          {title: 'Medium', value: 'medium'},
          {title: 'High', value: 'high'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'duration',
      title: 'Typical duration',
      type: 'string',
      group: 'content',
      description: 'For example “2 to 6 weeks”.',
    }),
    defineField({
      name: 'outcomes',
      title: 'By the end of this journey',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'stages',
      title: 'Stages',
      type: 'array',
      group: 'content',
      description: 'In order. Stage numbers are added automatically.',
      of: [defineArrayMember({type: 'journeyStage'})],
      validation: (rule) => rule.required().min(2),
    }),

    slugField(),
    categoryField('journey', 'navigation', false),
    orderField(),

    defineField({
      name: 'nextJourneys',
      title: 'Where to go next',
      type: 'array',
      group: 'related',
      of: [defineArrayMember({type: 'reference', to: [{type: 'journey'}], options: {filter: notSelf}})],
      validation: (rule) => rule.unique(),
    }),

    updatedField(),
    keywordsField(),
  ],
  orderings: [
    {title: 'Order', name: 'order', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Title', name: 'title', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', stages: 'stages', effort: 'effort'},
    prepare: ({title, stages, effort}) => ({
      title,
      subtitle: [`${stages?.length || 0} stages`, effort && `${effort} effort`].filter(Boolean).join(' · '),
    }),
  },
})
