import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThListIcon} from '@sanity/icons/ThList'

/**
 * A simple table, as used for comparisons and field mappings in articles.
 * The first row is the header row. On the site, the first column of each
 * body row is shown as a row heading.
 */
export const table = defineType({
  name: 'table',
  title: 'Table',
  type: 'object',
  icon: ThListIcon,
  fields: [
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      description: 'The first row is the header row. Every row should have the same number of cells.',
      of: [
        defineArrayMember({
          name: 'tableRow',
          title: 'Row',
          type: 'object',
          fields: [defineField({name: 'cells', title: 'Cells', type: 'array', of: [{type: 'string'}]})],
          preview: {
            select: {cells: 'cells'},
            prepare: ({cells}) => ({title: (cells || []).filter(Boolean).join(' · ') || 'Empty row'}),
          },
        }),
      ],
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'compact',
      title: 'Compact',
      type: 'boolean',
      description: 'Smaller text and padding, for tables inside steps.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {rows: 'rows'},
    prepare: ({rows}) => ({
      title: rows?.[0]?.cells?.filter(Boolean).join(' · ') || 'Table',
      subtitle: `${Math.max((rows?.length || 1) - 1, 0)} rows`,
    }),
  },
})
