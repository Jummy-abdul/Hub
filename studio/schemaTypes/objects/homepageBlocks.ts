import {defineField, defineType} from 'sanity'
import {DocumentsIcon} from '@sanity/icons/Documents'
import {StarIcon} from '@sanity/icons/Star'

import {LINKABLE_TYPES} from '../constants'

/** One of the four discovery cards on the documentation homepage. */
export const discoveryCard = defineType({
  name: 'discoveryCard',
  title: 'Discovery card',
  type: 'object',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'section',
      title: 'Links to',
      type: 'string',
      options: {
        list: [
          {title: 'Concepts', value: 'concept'},
          {title: 'Guides', value: 'guide'},
          {title: 'Journeys', value: 'journey'},
          {title: 'Release Notes', value: 'release'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 2, validation: (rule) => rule.required()}),
    defineField({name: 'ctaLabel', title: 'Button text', type: 'string', validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'ctaLabel'}},
})

/** A shortcut in the homepage "Popular topics" grid. */
export const popularTopic = defineType({
  name: 'popularTopic',
  title: 'Popular topic',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Task-style wording, for example “Set up Single Sign On”.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'page', title: 'Opens', type: 'reference', to: LINKABLE_TYPES, validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'label', subtitle: 'page.title'}},
})
