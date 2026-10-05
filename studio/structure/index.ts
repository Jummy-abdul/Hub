import type {StructureResolver} from 'sanity/structure'
import {BookIcon} from '@sanity/icons/Book'
import {FolderIcon} from '@sanity/icons/Folder'
import {HomeIcon} from '@sanity/icons/Home'
import {RocketIcon} from '@sanity/icons/Rocket'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {WrenchIcon} from '@sanity/icons/Wrench'

/** Document types that exist exactly once. */
export const SINGLETON_TYPES = new Set(['docsHomepage'])

const SECTIONS = [
  {type: 'concept', title: 'Concepts', icon: BookIcon},
  {type: 'guide', title: 'Guides', icon: WrenchIcon},
  {type: 'journey', title: 'Journeys', icon: RocketIcon},
] as const

/**
 * Studio navigation. Mirrors the documentation site: the homepage first,
 * then one entry per section, then categories.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Fixiam Documentation')
    .items([
      S.listItem()
        .title('Documentation Homepage')
        .id('docsHomepage')
        .icon(HomeIcon)
        .child(S.document().schemaType('docsHomepage').documentId('docsHomepage').title('Documentation Homepage')),
      S.divider(),

      ...SECTIONS.map(({type, title, icon}) =>
        S.listItem()
          .title(title)
          .icon(icon)
          .child(
            S.list()
              .title(title)
              .items([
                S.listItem()
                  .title(`All ${title.toLowerCase()}`)
                  .icon(icon)
                  .child(S.documentTypeList(type).title(`All ${title.toLowerCase()}`).defaultOrdering([{field: 'title', direction: 'asc'}])),
                S.listItem()
                  .title('By category')
                  .icon(FolderIcon)
                  .child(
                    S.documentTypeList('category')
                      .title(`${title} categories`)
                      .filter('_type == "category" && section == $section')
                      .params({section: type})
                      .defaultOrdering([{field: 'order', direction: 'asc'}])
                      .child((categoryId) =>
                        S.documentList()
                          .title(title)
                          .schemaType(type)
                          .filter('_type == $type && category._ref == $categoryId')
                          .params({type, categoryId})
                          .defaultOrdering([{field: 'order', direction: 'asc'}])
                          .initialValueTemplates([S.initialValueTemplateItem(`${type}-in-category`, {categoryId})])
                      )
                  ),
              ])
          )
      ),

      S.listItem()
        .title('Release Notes')
        .icon(SparklesIcon)
        .child(S.documentTypeList('releaseNote').title('Release Notes').defaultOrdering([{field: 'date', direction: 'desc'}])),

      S.divider(),
      S.listItem()
        .title('Categories')
        .icon(FolderIcon)
        .child(
          S.list()
            .title('Categories')
            .items([
              ...SECTIONS.map(({type, title, icon}) =>
                S.listItem()
                  .title(`${title} categories`)
                  .icon(icon)
                  .child(
                    S.documentTypeList('category')
                      .title(`${title} categories`)
                      .filter('_type == "category" && section == $section')
                      .params({section: type})
                      .defaultOrdering([{field: 'order', direction: 'asc'}])
                      .initialValueTemplates([S.initialValueTemplateItem('category-by-section', {section: type})])
                  )
              ),
              S.divider(),
              S.listItem().title('All categories').icon(FolderIcon).child(S.documentTypeList('category').title('All categories')),
            ])
        ),
    ])
