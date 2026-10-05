import {defineArrayMember, defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'

/**
 * The documentation homepage. This is a singleton: there is exactly one,
 * with the fixed document ID "docsHomepage".
 */
export const docsHomepage = defineType({
  name: 'docsHomepage',
  title: 'Documentation Homepage',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'hero', title: 'Header and search', default: true},
    {name: 'sections', title: 'Sections'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      group: 'hero',
      initialValue: 'Fixiam Documentation',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Supporting text',
      type: 'string',
      group: 'hero',
      initialValue: 'Learn how to configure, manage and get the most out of Fixiam.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'searchPlaceholder',
      title: 'Search placeholder',
      type: 'string',
      group: 'hero',
      initialValue: 'Search Fixiam documentation...',
    }),
    defineField({
      name: 'popularSearches',
      title: 'Suggested searches',
      type: 'array',
      group: 'hero',
      description: 'Shown under the search field and in the empty search panel.',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'discoveryCards',
      title: 'Discovery cards',
      type: 'array',
      group: 'sections',
      of: [defineArrayMember({type: 'discoveryCard'})],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'popularTopics',
      title: 'Popular topics',
      type: 'array',
      group: 'sections',
      of: [defineArrayMember({type: 'popularTopic'})],
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: 'featuredJourneys',
      title: 'Featured journeys',
      type: 'array',
      group: 'sections',
      description: 'Shown under “Start with a journey”.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'journey'}]})],
      validation: (rule) => rule.unique().max(3),
    }),
  ],
  preview: {prepare: () => ({title: 'Documentation Homepage'})},
})
