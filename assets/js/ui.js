/*
 * Reusable components. Every page template is assembled from these.
 * Each component root has a data-c attribute naming it, which the
 * "Template view" toggle in the header reveals.
 */
(function () {
  const M = FX.model;
  const { esc, icons } = FX.h;
  const T = FX.TYPES;
  const U = {};

  /* ---------- Local storage, guarded ---------- */
  FX.store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('fx:' + k);
        return v == null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('fx:' + k, JSON.stringify(v));
      } catch (e) {}
    },
  };

  U.typeIcon = { concept: icons.book, guide: icons.wrench, journey: icons.route, release: icons.spark };

  U.badge = (type, withTagline) =>
    `<span class="badge badge-${type}" data-c="Type badge">${T[type].label}${withTagline ? `<span class="badge-tag">${T[type].tagline}</span>` : ''}</span>`;

  U.crumbs = (list) =>
    `<nav class="crumbs" aria-label="Breadcrumb" data-c="Breadcrumb"><ol>${list
      .map((c, i) => {
        const last = i === list.length - 1;
        const inner = c[1] && !last ? `<a href="#${c[1]}">${esc(c[0])}</a>` : `<span${last ? ' aria-current="page"' : ''}>${esc(c[0])}</span>`;
        return `<li>${inner}</li>`;
      })
      .join('')}</ol></nav>`;

  /* ---------- Sidebar navigation tree ---------- */
  FX.navOpen = new Set(FX.store.get('navOpen', []));
  const saveOpen = () => FX.store.set('navOpen', [...FX.navOpen]);
  U.saveOpen = saveOpen;

  function treeItems(type, items, activeSlug, path, query) {
    return items
      .map((it) => {
        if (typeof it === 'string') {
          const p = M.page(type, it);
          if (!p) return '';
          const active = it === activeSlug;
          const href = M.href(type, it) + (query || '');
          return `<li><a class="tree-link${active ? ' active' : ''}" href="#${href}"${active ? ' aria-current="page"' : ''}>${esc(p.title)}</a></li>`;
        }
        const id = `${type}:${path}/${it.id}`;
        return treeGroup(type, it, id, activeSlug, path + '/' + it.id, true);
      })
      .join('');
  }

  function treeGroup(type, node, id, activeSlug, path, nested) {
    const containsActive = activeSlug && M.ancestors(type, activeSlug).some((a) => a.id === node.id);
    if (containsActive) FX.navOpen.add(id);
    const open = FX.navOpen.has(id);
    return `<li class="tree-group${open ? ' open' : ''}${nested ? ' nested' : ''}${containsActive ? ' has-active' : ''}" data-node="${esc(id)}">
      <button type="button" class="tree-toggle" aria-expanded="${open}">${icons.chevron}<span>${esc(node.title)}</span>${nested ? '' : `<span class="tree-count">${M.countItems(node.items)}</span>`}</button>
      <ul class="tree-children">${treeItems(type, node.items, activeSlug, path)}</ul>
    </li>`;
  }

  U.tree = (type, activeSlug, { landingActive } = {}) => {
    const sec = FX.content[type];
    let groups;
    if (type === 'journey') {
      groups = treeItems(type, sec.categories[0].items, activeSlug, '');
    } else {
      groups = sec.categories.map((cat) => treeGroup(type, cat, `${type}:/${cat.id}`, activeSlug, '/' + cat.id, false)).join('');
    }
    saveOpen();
    return `<ul class="tree" role="list">
      <li><a class="tree-link tree-overview${landingActive ? ' active' : ''}" href="#${T[type].base}"${landingActive ? ' aria-current="page"' : ''}>Overview</a></li>
      ${groups}
    </ul>`;
  };

  U.primaryNav = (activeId) =>
    FX.SECTIONS.map((s) => `<a href="#${s.route}" class="pnav-link${s.id === activeId ? ' active' : ''}"${s.id === activeId ? ' aria-current="page"' : ''}>${s.label}</a>`).join('');

  U.sidebar = (type, inner, { filter = true } = {}) => `
    <aside class="sidebar is-sticky" id="sidebar" aria-label="${type ? T[type].plural : 'Documentation'} navigation" data-c="Sidebar navigation">
      <div class="sidebar-inner">
        <div class="sidebar-mobile-head"><span>Menu</span><button type="button" class="icon-btn" data-close-nav aria-label="Close navigation">${icons.x}</button></div>
        <nav class="sidebar-primary" aria-label="Primary">${U.primaryNav(type || 'home')}</nav>
        ${
          type
            ? `<div class="sidebar-head"><a href="#${T[type].base}" class="sidebar-title">${U.typeIcon[type]}${T[type].plural}</a><span class="sidebar-tagline">${T[type].tagline}</span></div>
        ${filter ? `<div class="sidebar-filter"><label class="sr-only" for="nav-filter">Filter ${T[type].plural.toLowerCase()}</label>${icons.search}<input id="nav-filter" type="search" placeholder="Filter ${T[type].plural.toLowerCase()}" autocomplete="off"></div>` : ''}`
            : ''
        }
        ${inner || ''}
      </div>
    </aside>
    <div class="scrim" data-close-nav></div>`;

  /* ---------- On this page ---------- */
  U.toc = (items, title = 'On this page') =>
    items.length
      ? `<nav class="toc" aria-label="${title}" data-c="On this page"><div class="toc-title">${title}</div><ul>${items
          .map((it) => `<li class="lvl-${it.level || 2}"><a href="#${it.id}" data-scroll="${it.id}">${esc(it.title)}</a></li>`)
          .join('')}</ul></nav>`
      : '';

  U.tocInline = (items) =>
    items.length
      ? `<details class="toc-inline" data-c="On this page · compact"><summary>On this page</summary><ul>${items
          .filter((i) => (i.level || 2) === 2)
          .map((it) => `<li><a href="#${it.id}" data-scroll="${it.id}">${esc(it.title)}</a></li>`)
          .join('')}</ul></details>`
      : '';

  /* ---------- Cards ---------- */
  U.docCard = (type, slug, { query = '', showBadge = true } = {}) => {
    const p = M.page(type, slug);
    if (!p) return '';
    return `<a class="doc-card" href="#${M.href(type, slug)}${query}" data-c="Doc card">
      ${showBadge ? U.badge(type) : ''}
      <span class="doc-card-title">${esc(p.title)}</span>
      <span class="doc-card-desc">${esc(p.summary)}</span>
    </a>`;
  };

  U.linkRow = (type, slug, query = '') => {
    const p = M.page(type, slug);
    if (!p) return '';
    return `<a class="link-row" href="#${M.href(type, slug)}${query}"><span class="link-row-icon t-${type}">${U.typeIcon[type]}</span><span class="link-row-text"><span class="link-row-title">${esc(p.title)}</span><span class="link-row-desc">${esc(p.summary)}</span></span>${icons.chevron}</a>`;
  };

  /* ---------- Previous / next ---------- */
  U.prevNext = (type, slug) => {
    const { prev, next } = M.prevNext(type, slug);
    const card = (s, dir) => {
      if (!s) return '<span></span>';
      const p = M.page(type, s);
      return `<a class="pn pn-${dir}" href="#${M.href(type, s)}" rel="${dir}"><span class="pn-label">${dir === 'prev' ? icons.arrowLeft + 'Previous' : 'Next' + icons.arrowRight}</span><span class="pn-title">${esc(p.title)}</span></a>`;
    };
    return `<nav class="prevnext" aria-label="Previous and next ${T[type].plural.toLowerCase()}" data-c="Previous / next">${card(prev, 'prev')}${card(next, 'next')}</nav>`;
  };

  /* ---------- Feedback ---------- */
  U.feedback = () => `
    <section class="feedback" data-feedback data-c="Feedback">
      <div class="fb-ask">
        <span class="fb-q">Was this page helpful?</span>
        <div class="fb-btns">
          <button type="button" class="btn btn-secondary btn-sm" data-fb="yes">${icons.thumbUp}Yes</button>
          <button type="button" class="btn btn-secondary btn-sm" data-fb="no">${icons.thumbDown}No</button>
        </div>
      </div>
      <form class="fb-form" hidden>
        <fieldset>
          <legend>What went wrong?</legend>
          <label><input type="radio" name="fb-reason" id="fb-r1" value="missing" checked> Information is missing</label>
          <label><input type="radio" name="fb-reason" id="fb-r2" value="unclear"> Instructions were unclear</label>
          <label><input type="radio" name="fb-reason" id="fb-r3" value="wrong"> Something is out of date or incorrect</label>
        </fieldset>
        <label class="fb-label" for="fb-text">Tell us more (optional)</label>
        <textarea id="fb-text" rows="3" placeholder="What were you trying to do?"></textarea>
        <div class="fb-actions"><button type="submit" class="btn btn-sm">Send feedback</button><button type="button" class="btn btn-ghost btn-sm" data-fb="cancel">Cancel</button></div>
      </form>
      <p class="fb-thanks" hidden role="status">Thanks for your feedback. It helps us improve Fixiam Documentation.</p>
    </section>`;

  /* ---------- Journey progress ---------- */
  U.journeyDone = (slug) => new Set(FX.store.get('journey:' + slug, []));
  U.setJourneyDone = (slug, set) => FX.store.set('journey:' + slug, [...set]);

  U.progressBar = (done, total, label = true) => {
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `<div class="progress" data-c="Progress"><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="Journey progress"><span style="width:${pct}%"></span></div>${label ? `<span class="progress-label">${done} of ${total} stages complete</span>` : ''}</div>`;
  };

  // Shown on a concept or guide opened from a journey stage.
  U.journeyBanner = (q) => {
    const j = q.journey && M.page('journey', q.journey);
    if (!j) return '';
    const n = Math.min(Math.max(parseInt(q.stage, 10) || 1, 1), j.stages.length);
    const stage = j.stages[n - 1];
    const nextStage = j.stages[n];
    const base = M.href('journey', q.journey);
    const dots = j.stages.map((_, i) => `<i class="${i + 1 < n ? 'past' : i + 1 === n ? 'now' : ''}"></i>`).join('');
    return `<aside class="journey-banner" data-c="Journey context banner" aria-label="Journey context">
      <div class="jb-main">
        <span class="jb-eyebrow">${icons.route}Journey · Stage ${n} of ${j.stages.length}</span>
        <a class="jb-title" href="#${base}?stage=${n}">${esc(j.title)}</a>
        <span class="jb-stage">${esc(stage.title)}</span>
        <span class="jb-dots" aria-hidden="true">${dots}</span>
      </div>
      <div class="jb-actions">
        <a class="btn btn-secondary btn-sm" href="#${base}?stage=${n}">${icons.arrowLeft}Back to journey</a>
        ${nextStage ? `<a class="btn btn-sm" href="#${base}?stage=${n + 1}">Next stage${icons.arrowRight}</a>` : ''}
      </div>
    </aside>`;
  };

  /* ---------- Search results ---------- */
  U.searchItem = (r, q, extraAttrs = '') => `
    <a class="sr-item" href="#${r.href}" data-result ${extraAttrs}>
      <span class="sr-icon t-${r.type}">${U.typeIcon[r.type]}</span>
      <span class="sr-text">
        <span class="sr-title">${FX.highlight(r.title, q)}</span>
        <span class="sr-desc">${FX.highlight(r.summary, q)}</span>
        <span class="sr-meta">${U.badge(r.type)}<span class="sr-section">${esc(r.section)}</span></span>
      </span>
    </a>`;

  U.noResults = (q, compact) => `
    <div class="no-results${compact ? ' compact' : ''}" data-c="Search · no results">
      <div class="nr-icon">${icons.search}</div>
      <p class="nr-title">No results for “${esc(q)}”</p>
      <p class="nr-text">Check the spelling, try a more general term, or search for a product area such as users, applications or devices.</p>
      <div class="chips">${FX.POPULAR_SEARCHES.map((s) => `<a class="chip" href="#/search?q=${encodeURIComponent(s)}" data-suggest="${esc(s)}">${esc(s)}</a>`).join('')}</div>
      ${compact ? '' : `<p class="nr-text">Or browse <a href="#/concepts">Concepts</a>, <a href="#/guides">Guides</a> or <a href="#/journeys">Journeys</a>.</p>`}
    </div>`;

  U.searchCompact = (q, perGroup = 4) => {
    if (!q.trim()) {
      const recent = FX.store.get('recent', []).slice(0, 4);
      return `<div class="sr-empty">
        <div class="sr-group-h">Popular searches</div>
        <div class="chips">${FX.POPULAR_SEARCHES.map((s) => `<button type="button" class="chip" data-suggest="${esc(s)}">${esc(s)}</button>`).join('')}</div>
        ${recent.length ? `<div class="sr-group-h">Recently viewed</div>${recent.map((r) => `<a class="sr-recent" href="#${r.href}" data-result>${U.badge(r.type)}<span>${esc(r.title)}</span></a>`).join('')}` : ''}
      </div>`;
    }
    const results = FX.search(q);
    if (!results.length) return U.noResults(q, true);
    const groups = FX.searchGroups(results);
    return (
      groups
        .map(
          (g) => `<div class="sr-group" role="group" aria-label="${T[g.type].plural}"><div class="sr-group-h">${T[g.type].plural}<span>${g.items.length}</span></div>${g.items
            .slice(0, perGroup)
            .map((r) => U.searchItem(r, q))
            .join('')}</div>`
        )
        .join('') + `<a class="sr-all" href="#/search?q=${encodeURIComponent(q)}" data-result>See all ${results.length} result${results.length === 1 ? '' : 's'} for “${esc(q)}”${icons.arrowRight}</a>`
    );
  };

  FX.ui = U;
})();
