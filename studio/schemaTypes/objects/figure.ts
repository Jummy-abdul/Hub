import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

/**
 * A documentation image: a screenshot or any other picture, stored in Sanity's
 * image asset library. Used for guide step screenshots and for images placed
 * anywhere in rich text (concepts, guides, journey stages, release notes).
 *
 * The site shows the image at its natural aspect ratio, scaled to fit the
 * article column, with the caption underneath. A field without an uploaded
 * image shows nothing on the site.
 */
export const figure = defineType({
  name: 'figure',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  description: 'Upload a PNG, JPG, WebP or GIF. Screenshots should be full size; the site scales them down to fit.',
  options: {
    hotspot: true,
    accept: 'image/png, image/jpeg, image/webp, image/gif',
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text (describes the image for accessibility)',
      type: 'string',
      description:
        'Required. Describe what the image shows for people who use screen readers or cannot see it. For example: “Salesforce sign-on settings with the ACS URL field highlighted”.',
      // Only required once an image has been uploaded, so an empty
      // screenshot field never blocks publishing.
      validation: (rule) =>
        rule.custom((alt, context) => {
          const parent = context.parent as {asset?: unknown} | undefined
          if (parent?.asset && !(alt && alt.trim())) return 'Add alt text that describes the image.'
          return true
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
      description: 'Shown under the image on the site. Leave empty for no caption.',
    }),
  ],
  preview: {
    select: {media: 'asset', alt: 'alt', caption: 'caption'},
    prepare: ({media, alt, caption}) => ({
      title: caption || alt || (media ? 'Image' : 'Image (no file uploaded)'),
      subtitle: media ? (caption && alt ? alt : undefined) : 'Upload an image to show it on the site',
      media,
    }),
  },
})
