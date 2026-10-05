/**
 * Sanity project connection.
 * Values can be overridden with SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET
 * (for example in a .env.local file) so the same Studio can point at another dataset.
 */
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'idpyt5ut'
export const dataset = process.env.SANITY_STUDIO_DATASET || 'fixiam_docs_sandbox'
