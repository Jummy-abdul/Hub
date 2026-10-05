import {defineArrayMember, defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'

/**
 * One stage of a journey. A stage explains what to achieve and points to the
 * concepts to learn and the guides to complete. It never holds the
 * step-by-step instructions itself; those live in guides.
 */
export const journeyStage = defineType({
  name: 'journeyStage',
  title: 'Stage',
  type: 'object',
  icon: PinIcon,
  fields: [
    defineField({name: 'title', title: 'Stage title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'body', title: 'Explanation', type: 'richText', validation: (rule) => rule.required()}),
    defineField({
      name: 'learn',
      title: 'Learn (concepts)',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'concept'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'do',
      title: 'Do (guides)',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'guide'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'checklist',
      title: 'Before you move on',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description: 'Optional checklist shown at the end of the stage.',
    }),
  ],
  preview: {
    select: {title: 'title', learn: 'learn', do: 'do'},
    prepare: ({title, learn, do: doo}) => ({
      title,
      subtitle: `${learn?.length || 0} concepts · ${doo?.length || 0} guides`,
    }),
  },
})
