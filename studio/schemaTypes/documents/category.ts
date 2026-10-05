import {defineField, defineType} from 'sanity'
import {FolderIcon} from '@sanity/icons/Folder'

import {DOC_SECTIONS} from '../constants'

/**
 * A sidebar group within Concepts, Guides or Journeys, for example
 * "Applications" in Guides. A category can sit inside another category
 * to create nested groups, such as Applications › Single Sign On.
 */
export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used for links to this category on the section landing page. Must be unique within its section.',
      options: {
        source: 'title',
        maxLength: 64,
        // The same slug may be used in different sections, for example
        // "authentication" in both Concepts and Guides.
        isUnique: async (slug, context) => {
          const {document, getClient} = context
          const id = document?._id.replace(/^drafts\./, '') || ''
          const count = await getClient({apiVersion: '2025-10-01'}).fetch<number>(
            'count(*[_type == "category" && slug.current == $slug && section == $section && !(_id in [$id, $draftId])])',
            {slug, section: (document as {section?: string})?.section || '', id, draftId: `drafts.${id}`},
          )
          return count === 0
        },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      options: {list: DOC_SECTIONS, layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Shown on the section landing page.',
    }),
    defineField({
      name: 'parent',
      title: 'Parent category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Optional. Choose a parent to nest this category inside another one in the sidebar.',
      options: {
        filter: ({document}) => {
          const id = document._id.replace(/^drafts\./, '')
          return {
            filter: 'section == $section && !defined(parent) && !(_id in [$id, $draftId])',
            params: {section: (document as {section?: string}).section || '', id, draftId: `drafts.${id}`},
          }
        },
      },
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first in the sidebar.',
      initialValue: 100,
    }),
  ],
  orderings: [
    {title: 'Section, then order', name: 'sectionOrder', by: [{field: 'section', direction: 'asc'}, {field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', section: 'section', parent: 'parent.title'},
    prepare: ({title, section, parent}) => ({
      title,
      subtitle: [DOC_SECTIONS.find((s) => s.value === section)?.title, parent].filter(Boolean).join(' › '),
    }),
  },
})
