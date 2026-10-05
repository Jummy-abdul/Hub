import {defineField, defineType} from 'sanity'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'

const TONES = [
  {title: 'Note', value: 'note'},
  {title: 'Tip', value: 'tip'},
  {title: 'Warning', value: 'warning'},
  {title: 'Important', value: 'important'},
]

/** Highlighted box: Note, Tip, Warning or Important. */
export const callout = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'tone',
      title: 'Type',
      type: 'string',
      options: {list: TONES, layout: 'radio', direction: 'horizontal'},
      initialValue: 'note',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'title', title: 'Title', type: 'string', description: 'Optional. Defaults to the type name.'}),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
      of: [{type: 'block', styles: [{title: 'Paragraph', value: 'normal'}], lists: []}],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {tone: 'tone', title: 'title', body: 'body'},
    prepare: ({tone, title, body}) => ({
      title: title || TONES.find((t) => t.value === tone)?.title || 'Callout',
      subtitle: body?.[0]?.children?.map((c: {text?: string}) => c.text).join('') || '',
    }),
  },
})
