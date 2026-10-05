import {defineField, defineType} from 'sanity'
import {SchemaIcon} from '@sanity/icons/Schema'

/**
 * A built-in diagram drawn by the website (not an uploaded image), so it stays
 * sharp, accessible and follows light and dark themes. Editors choose which
 * diagram to show and write its caption.
 */
export const DIAGRAMS = [
  {title: 'Single Sign On flow (user, application, Fixiam)', value: 'sso-flow'},
  {title: 'Where Fixiam fits (identity sources → Fixiam → applications)', value: 'identity-fit'},
  {title: 'Joiner, Mover and Leaver lifecycle', value: 'jml-lifecycle'},
]

export const diagram = defineType({
  name: 'diagram',
  title: 'Diagram',
  type: 'object',
  icon: SchemaIcon,
  fields: [
    defineField({
      name: 'variant',
      title: 'Diagram',
      type: 'string',
      options: {list: DIAGRAMS},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
  ],
  preview: {
    select: {variant: 'variant', caption: 'caption'},
    prepare: ({variant, caption}) => ({
      title: DIAGRAMS.find((d) => d.value === variant)?.title || 'Diagram',
      subtitle: caption,
    }),
  },
})
