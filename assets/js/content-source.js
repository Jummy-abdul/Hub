/*
 * Content source: Sanity.
 *
 * Loads the published documentation once per visit from /api/content (a
 * server function that reads Sanity) and fills FX.content, FX.releases and
 * FX.home, the data the page templates render. The browser never talks to
 * Sanity directly and never holds a token.
 *
 * If the content service cannot be reached, the last copy this browser loaded
 * successfully is used and a notice is shown. If there is no saved copy, the
 * site shows a "temporarily unavailable" page instead of breaking.
 */
(function () {
  const ENDPOINT = 'api/content';
  const CACHE_KEY = 'content-cache-v1';
  const TIMEOUT_MS = 12000;

  FX.contentStatus = 'loading'; // loading · ready · stale · offline · error

  const emptySection = () => ({ categories: [], pages: {} });

  function apply(bundle) {
    const c = bundle.content || {};
    FX.content = { concept: c.concept || emptySection(), guide: c.guide || emptySection(), journey: c.journey || emptySection() };
    FX.releases = Array.isArray(bundle.releases) ? bundle.releases : [];
    FX.home = bundle.home || null;
    if (FX.home && FX.home.popularSearches && FX.home.popularSearches.length) FX.POPULAR_SEARCHES = FX.home.popularSearches;
    FX.contentMeta = bundle.meta || {};
  }

  async function fetchBundle() {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl && setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(ENDPOINT, { headers: { Accept: 'application/json' }, cache: 'no-cache', signal: ctrl && ctrl.signal });
      if (!res.ok) throw new Error(`Content service responded with ${res.status}`);
      const bundle = await res.json();
      if (!bundle || !bundle.content) throw new Error('Content service returned no content');
      return bundle;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  FX.loadContent = async function () {
    try {
      const bundle = await fetchBundle();
      apply(bundle);
      FX.store.set(CACHE_KEY, bundle);
      FX.contentStatus = bundle.meta && bundle.meta.stale ? 'stale' : 'ready';
    } catch (err) {
      console.warn('[Fixiam Docs] Could not load documentation content.', err);
      const saved = FX.store.get(CACHE_KEY, null);
      if (saved && saved.content) {
        apply(saved);
        FX.contentStatus = 'offline';
      } else {
        FX.contentStatus = 'error';
      }
    }
    return FX.contentStatus;
  };
})();
