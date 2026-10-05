import {defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'

/** A problem and its fix, shown in a guide's Troubleshooting accordion. */
export const troubleshootingItem = defineType({
  name: 'troubleshootingItem',
  title: 'Troubleshooting item',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'problem',
      title: 'Problem',
      type: 'string',
      description: 'What the person sees, ideally the exact error message.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'solution', title: 'Solution', type: 'richText', validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'problem'}},
})
