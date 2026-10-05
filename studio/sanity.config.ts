import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {dataset, projectId} from './env'
import {schemaTypes} from './schemaTypes'
import {SINGLETON_TYPES, structure} from './structure'

export default defineConfig({
  name: 'fixiam-docs',
  title: 'Fixiam Documentation',

  projectId,
  dataset,

  plugins: [
    structureTool({structure}),
    // GROQ query playground, for testing queries before the frontend is connected.
    visionTool({defaultApiVersion: '2025-10-01', defaultDataset: dataset}),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => [
      // Singletons cannot be created from the global "Create" menu.
      ...templates.filter(({schemaType}) => !SINGLETON_TYPES.has(schemaType)),
      // Prefilled templates used by the section and category lists in the sidebar.
      {
        id: 'category-by-section',
        title: 'Category',
        schemaType: 'category',
        parameters: [{name: 'section', type: 'string'}],
        value: ({section}: {section: string}) => ({section}),
      },
      ...['concept', 'guide', 'journey'].map((type) => ({
        id: `${type}-in-category`,
        title: `${type[0].toUpperCase()}${type.slice(1)} in category`,
        schemaType: type,
        parameters: [{name: 'categoryId', type: 'string'}],
        value: ({categoryId}: {categoryId: string}) => ({category: {_type: 'reference', _ref: categoryId}}),
      })),
    ],
  },

  document: {
    // Singletons can be edited and published, but not duplicated or deleted.
    actions: (actions, {schemaType}) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
})
