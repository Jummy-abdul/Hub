import {defineField, defineType} from 'sanity'
import {OlistIcon} from '@sanity/icons/Olist'

/** One numbered step in a guide. Steps are numbered automatically in order. */
export const guideStep = defineType({
  name: 'guideStep',
  title: 'Step',
  type: 'object',
  icon: OlistIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Step title',
      type: 'string',
      description: 'Start with a verb, for example “Open the application’s sign-on settings”.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'body', title: 'Instructions', type: 'richText'}),
    defineField({
      name: 'screenshot',
      title: 'Screenshot',
      type: 'figure',
      description: 'Optional. Shown below the instructions.',
    }),
  ],
  preview: {
    select: {title: 'title', media: 'screenshot'},
  },
})
