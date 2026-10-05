import {defineField, defineType} from 'sanity'
import {CodeIcon} from '@sanity/icons/Code'

/** Preformatted code with a language label and a copy button on the site. */
export const codeBlock = defineType({
  name: 'codeBlock',
  title: 'Code block',
  type: 'object',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Shown above the code, for example XML, Command Prompt or Attribute mapping.',
    }),
    defineField({
      name: 'code',
      title: 'Code',
      type: 'text',
      rows: 8,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {label: 'label', code: 'code'},
    prepare: ({label, code}) => ({title: label || 'Code block', subtitle: code?.split('\n')[0]}),
  },
})
