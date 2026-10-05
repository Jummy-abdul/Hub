import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

/** Image with required alt text and an optional caption, used for screenshots and diagrams. */
export const figure = defineType({
  name: 'figure',
  title: 'Image or screenshot',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe what the image shows, for people using screen readers.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
  ],
})
