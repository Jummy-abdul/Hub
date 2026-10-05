/**
 * Shared values. These mirror the prototype's config (assets/js/config.js) so
 * content in Sanity maps one-to-one onto the existing page templates.
 */

/** Documentation sections that use categories in the sidebar. */
export const DOC_SECTIONS = [
  {title: 'Concepts', value: 'concept'},
  {title: 'Guides', value: 'guide'},
  {title: 'Journeys', value: 'journey'},
]

/** Release note categories. Matches FX.RN_CATEGORIES in the prototype. */
export const RELEASE_CATEGORIES = [
  {title: 'New', value: 'new'},
  {title: 'Improved', value: 'improved'},
  {title: 'Fixed', value: 'fixed'},
  {title: 'Security', value: 'security'},
]

/** Document types that can be linked to from rich text and related lists. */
export const LINKABLE_TYPES = [{type: 'concept'}, {type: 'guide'}, {type: 'journey'}, {type: 'releaseNote'}]

/** Field groups shared by the article types, so editors see the same tabs everywhere. */
export const ARTICLE_GROUPS = [
  {name: 'content', title: 'Content', default: true},
  {name: 'navigation', title: 'Navigation'},
  {name: 'related', title: 'Related'},
  {name: 'meta', title: 'Search and metadata'},
]

/** Excludes the current document (and its draft) from a reference picker. */
export const notSelf = ({document}: {document: {_id: string}}) => {
  const id = document._id.replace(/^drafts\./, '')
  return {filter: '!(_id in [$id, $draftId])', params: {id, draftId: `drafts.${id}`}}
}
