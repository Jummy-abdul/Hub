/*
 * App shell: header, router, search palette and page behaviours.
 *
 * Routing uses the URL hash (#/guides/add-user?journey=...) so the prototype
 * runs from any static host or straight from the file system. The router also
 * keeps its own copy of the current route, so navigation still works in
 * sandboxed viewers that do not allow hash changes.
 */
(function () {
  const U = FX.ui;
  const M = FX.model;
  const { icons, esc } = FX.h;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------------- Recently viewed ---------------- */
  FX.rememberRecent = (item) => {
    const list = FX.store.get('recent', []).filter((r) => r.href !== item.href);
    list.unshift(item);
    FX.store.set('recent', list.slice(0, 6));
  };

  /* ---------------- Toast ---------------- */
  let toastTimer;
  FX.toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 2800);
  };

  /* ---------------- Theme ---------------- */
  const root = document.documentElement;
  const savedTheme = FX.store.get('theme', null);
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  const isDark = () => root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);

  /* ---------------- Header ---------------- */
  const logo = `<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" class="logo-bg"/><path d="M11 8.5h11M11 8.5v15M11 15.5h7.5" class="logo-f"/><circle cx="22" cy="22.5" r="2.4" class="logo-dot"/></svg>`;

  function renderHeader() {
    $('#header').innerHTML = `
      <div class="topbar-inner">
        <button type="button" class="icon-btn menu-btn" data-open-nav aria-label="Open navigation">${icons.menu}</button>
        <a class="brand" href="#/" aria-label="Fixiam Documentation home">${logo}<span class="brand-name">Fixiam</span><span class="brand-docs">Documentation</span></a>
        <nav class="primary-nav" aria-label="Primary" id="primary-nav"></nav>
        <div class="topbar-actions">
          <button type="button" class="search-trigger" data-open-search aria-label="Search documentation">${icons.search}<span class="st-text">Search Fixiam documentation...</span><kbd>/</kbd></button>
          <a class="proto-pill" href="#/about" title="About this prototype">Prototype</a>
          <button type="button" class="icon-btn" data-annotate aria-pressed="false" title="Template view: label reusable components">${icons.grid}<span class="sr-only">Template view</span></button>
          <button type="button" class="icon-btn" data-theme-toggle title="Switch theme"><span class="sr-only">Switch theme</span><span class="theme-icon"></span></button>
          <a class="btn btn-secondary btn-sm console-link" href="#" data-toast="Prototype: this would open the Fixiam Admin Console.">Admin Console</a>
        </div>
      </div>`;
    updateThemeIcon();
  }
  const updateThemeIcon = () => {
    const el = $('.theme-icon');
    if (el) el.innerHTML = isDark() ? icons.sun : icons.moon;
  };

  /* ---------------- Router ---------------- */
  let currentRoute = null;
  const parse = (r) => {
    const [path, qs] = r.split('?');
    return { path: path.replace(/\/+$/, '') || '/', query: Object.fromEntries(new URLSearchParams(qs || '')) };
  };
  const hashRoute = () => (location.hash.startsWith('#/') ? decodeURI(location.hash.slice(1)) : null);

  FX.go = (to, { replace = false } = {}) => {
    const prev = currentRoute;
    currentRoute = to;
    try {
      if (replace) history.replaceState(null, '', '#' + to);
      else if (hashRoute() !== to) location.hash = to;
    } catch (e) {}
    render({ samePage: prev && parse(prev).path === parse(to).path });
  };

  window.addEventListener('hashchange', () => {
    const r = hashRoute();
    if (r && r !== currentRoute) {
      const prev = currentRoute;
      currentRoute = r;
      render({ samePage: prev && parse(prev).path === parse(r).path });
    }
  });

  function resolve(path, query) {
    const seg = path.split('/').filter(Boolean);
    if (!seg.length) return { page: FX.tpl.home(), section: 'home' };
    const [a, b, ...rest] = seg;
    if (rest.length) return { page: FX.tpl.notFound() };
    if (a === 'concepts') return { page: b ? FX.tpl.article('concept', b, query) : FX.tpl.landing('concept'), section: 'concept' };
    if (a === 'guides') return { page: b ? FX.tpl.article('guide', b, query) : FX.tpl.landing('guide'), section: 'guide' };
    if (a === 'journeys') return { page: b ? FX.tpl.journey(b, query) : FX.tpl.journeysLanding(), section: 'journey' };
    if (a === 'release-notes') return { page: FX.tpl.releases(b, query), section: 'release' };
    if (a === 'search' && !b) return { page: FX.tpl.search(query) };
    if (a === 'about' && !b) return { page: FX.tpl.about() };
    return { page: FX.tpl.notFound() };
  }

  function render({ samePage } = {}) {
    if (!FX.content) return renderStatusPage();
    const { path, query } = parse(currentRoute || '/');
    const { page, section } = resolve(path, query);
    const app = $('#app');
    const prevScroll = window.scrollY;
    app.innerHTML = page.html;
    document.title = page.title;
    $('#primary-nav').innerHTML = U.primaryNav(section);
    document.body.classList.remove('nav-open');
    document.body.classList.toggle('is-home', !!page.home);
    closePalette(true);
    enhance();

    const target = query.section || (query.stage ? 'stage-' + query.stage : null);
    if (target && document.getElementById(target)) {
      requestAnimationFrame(() => scrollToId(target, { flash: true, smooth: false }));
    } else if (samePage) {
      window.scrollTo(0, prevScroll);
    } else {
      window.scrollTo(0, 0);
      const main = $('#main');
      if (main) main.focus({ preventScroll: true });
    }
    spy();
  }

  function scrollToId(id, { flash = false, smooth = true } = {}) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' });
    if (flash) {
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
    }
  }

  /* ---------------- Scroll spy for On this page / stepper ---------------- */
  let spyLinks = [];
  function spy() {
    spyLinks = $$('.rail [data-scroll]');
    onScroll();
  }
  function onScroll() {
    if (!spyLinks.length) return;
    let active = null;
    for (const a of spyLinks) {
      const el = document.getElementById(a.dataset.scroll);
      if (el && el.getBoundingClientRect().top < 140) active = a;
    }
    if (!active) active = spyLinks[0];
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) active = spyLinks[spyLinks.length - 1];
    spyLinks.forEach((a) => a.classList.toggle('active', a === active));
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  }, { passive: true });

  /* ---------------- Search box behaviour (palette + hero) ---------------- */
  function attachSearch(input, panel, { perGroup = 4, onClose } = {}) {
    let idx = -1;
    const items = () => $$('[data-result]', panel);
    const setActive = (i) => {
      const list = items();
      idx = list.length ? (i + list.length) % list.length : -1;
      list.forEach((el, j) => el.classList.toggle('active', j === idx));
      if (idx >= 0) list[idx].scrollIntoView({ block: 'nearest' });
    };
    const update = () => {
      panel.innerHTML = U.searchCompact(input.value, perGroup);
      idx = -1;
    };
    input.addEventListener('input', update);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(idx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(idx - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const list = items();
        if (idx >= 0 && list[idx]) FX.go(list[idx].getAttribute('href').slice(1));
        else if (input.value.trim()) FX.go('/search?q=' + encodeURIComponent(input.value.trim()));
      } else if (e.key === 'Escape') onClose && onClose();
    });
    panel.addEventListener('click', (e) => {
      const s = e.target.closest('[data-suggest]');
      if (s) {
        e.preventDefault();
        input.value = s.dataset.suggest;
        update();
        input.focus();
      }
    });
    return { update };
  }

  // Palette
  let palette;
  let lastFocus;
  function openPalette(prefill = '') {
    const p = $('#palette');
    lastFocus = document.activeElement;
    p.hidden = false;
    document.body.classList.add('palette-open');
    const input = $('#palette-input');
    input.value = prefill;
    palette.update();
    input.focus();
  }
  function closePalette(silent) {
    const p = $('#palette');
    if (!p || p.hidden) return;
    p.hidden = true;
    document.body.classList.remove('palette-open');
    if (!silent && lastFocus) lastFocus.focus();
  }

  function renderPalette() {
    $('#palette').innerHTML = `
      <div class="palette-backdrop" data-close-search></div>
      <div class="palette-panel" role="dialog" aria-modal="true" aria-label="Search documentation" data-c="Search palette">
        <div class="palette-input">${icons.search}<label for="palette-input" class="sr-only">Search Fixiam documentation</label><input id="palette-input" type="search" placeholder="Search Fixiam documentation..." autocomplete="off" aria-controls="palette-results"><button type="button" class="kbd-btn" data-close-search>Esc</button></div>
        <div class="palette-results sr-panel" id="palette-results" role="listbox"></div>
        <div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
      </div>`;
    palette = attachSearch($('#palette-input'), $('#palette-results'), { onClose: () => closePalette() });
    // Keep focus inside the dialog
    $('#palette').addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('#palette input, #palette a, #palette button').filter((el) => el.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  /* ---------------- Per-page enhancements ---------------- */
  function enhance() {
    // Hero search dropdown
    const hero = $('#hero-q');
    if (hero) {
      const panel = $('#hero-results');
      const close = () => { panel.hidden = true; hero.setAttribute('aria-expanded', 'false'); };
      const s = attachSearch(hero, panel, { perGroup: 3, onClose: close });
      const open = () => { s.update(); panel.hidden = false; hero.setAttribute('aria-expanded', 'true'); };
      hero.addEventListener('focus', open);
      hero.addEventListener('input', open);
      document.addEventListener('click', function off(e) {
        if (!document.body.contains(hero)) return document.removeEventListener('click', off);
        if (!e.target.closest('.hero-search')) close();
      });
    }

    // Search page form
    const sp = $('[data-search-page]');
    if (sp) sp.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#sp-q').value.trim();
      FX.go('/search?q=' + encodeURIComponent(v), { replace: true });
    });

    // Sidebar filter
    const filter = $('#nav-filter');
    if (filter) filter.addEventListener('input', () => {
      const v = filter.value.trim().toLowerCase();
      const tree = $('.sidebar .tree');
      tree.classList.toggle('filtering', !!v);
      $$('.tree-link', tree).forEach((a) => {
        const hit = !v || a.classList.contains('tree-overview') ? !v : a.textContent.toLowerCase().includes(v);
        a.parentElement.hidden = !!v && !hit;
      });
      $$('.tree-group', tree).forEach((g) => {
        const any = $$('.tree-link', g).some((a) => !a.parentElement.hidden);
        g.hidden = !!v && !any;
        g.classList.toggle('filter-open', !!v && any);
      });
      let empty = $('.tree-empty', tree.parentElement);
      const none = v && !$$('.tree-link', tree).some((a) => !a.parentElement.hidden);
      if (none && !empty) tree.insertAdjacentHTML('afterend', `<p class="tree-empty">No pages match “${esc(filter.value)}”. <a href="#/search?q=${encodeURIComponent(filter.value)}">Search all documentation</a></p>`);
      else if (!none && empty) empty.remove();
      else if (none && empty) empty.innerHTML = `No pages match “${esc(filter.value)}”. <a href="#/search?q=${encodeURIComponent(filter.value)}">Search all documentation</a>`;
    });

    // Release note selects
    const yearSel = $('#rn-year'), monthSel = $('#rn-month');
    if (yearSel) {
      yearSel.addEventListener('change', () => FX.go(FX.rnBuild({ year: yearSel.value, ym: '' }), { replace: true }));
      monthSel.addEventListener('change', () => FX.go(FX.rnBuild({ ym: monthSel.value, year: monthSel.value ? monthSel.value.slice(0, 4) : yearSel.value }), { replace: true }));
    }
  }

  /* ---------------- Global delegated events ---------------- */
  document.addEventListener('click', (e) => {
    const t = e.target;

    if (t.closest('.skip-link')) {
      e.preventDefault();
      const m = $('#main');
      if (m) m.focus();
      return;
    }

    const scrollLink = t.closest('[data-scroll]');
    if (scrollLink) {
      e.preventDefault();
      scrollToId(scrollLink.dataset.scroll);
      const det = scrollLink.closest('details.toc-inline');
      if (det) det.open = false;
      return;
    }

    const toastEl = t.closest('[data-toast]');
    if (toastEl) { e.preventDefault(); FX.toast(toastEl.dataset.toast); return; }

    const a = t.closest('a[href^="#/"]');
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      FX.go(a.getAttribute('href').slice(1), { replace: a.hasAttribute('data-replace') });
      return;
    }

    if (t.closest('[data-open-search]')) { openPalette(); return; }
    if (t.closest('[data-close-search]')) { closePalette(); return; }
    if (t.closest('[data-open-nav]')) { document.body.classList.add('nav-open'); const f = $('#sidebar a, #sidebar button'); f && f.focus(); return; }
    if (t.closest('[data-close-nav]')) { document.body.classList.remove('nav-open'); return; }

    const toggle = t.closest('.tree-toggle');
    if (toggle) {
      const g = toggle.parentElement;
      const open = !g.classList.contains('open');
      g.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
      if (open) FX.navOpen.add(g.dataset.node);
      else FX.navOpen.delete(g.dataset.node);
      U.saveOpen();
      return;
    }

    if (t.closest('[data-theme-toggle]')) {
      const next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      FX.store.set('theme', next);
      updateThemeIcon();
      return;
    }

    const ann = t.closest('[data-annotate]');
    if (ann) {
      const on = root.classList.toggle('annotate');
      $$('[data-annotate]').forEach((b) => b.setAttribute('aria-pressed', on));
      FX.toast(on ? 'Template view on. Components are outlined and labelled.' : 'Template view off.');
      return;
    }

    const copyCode = t.closest('[data-copy-code]');
    if (copyCode) {
      const code = copyCode.closest('.code').querySelector('code');
      copyText(code.textContent, code);
      return;
    }
    if (t.closest('[data-copy-link]')) {
      copyText(location.href.split('#')[0] + '#' + currentRoute, null, 'Link copied');
      return;
    }

    const tab = t.closest('[data-tab]');
    if (tab) {
      const wrap = tab.closest('[data-tabs]');
      $$('[data-tab]', wrap).forEach((b) => b.setAttribute('aria-selected', b === tab));
      $$('[data-panel]', wrap).forEach((p) => (p.hidden = p.dataset.panel !== tab.dataset.tab));
      return;
    }

    const fb = t.closest('[data-fb]');
    if (fb) {
      const box = fb.closest('[data-feedback]');
      const v = fb.dataset.fb;
      if (v === 'yes') { $('.fb-ask', box).hidden = true; $('.fb-thanks', box).hidden = false; }
      else if (v === 'no') { $('.fb-ask', box).hidden = true; $('.fb-form', box).hidden = false; $('#fb-text', box).focus(); }
      else if (v === 'cancel') { $('.fb-ask', box).hidden = false; $('.fb-form', box).hidden = true; }
      return;
    }

    const stageBtn = t.closest('[data-stage-toggle]');
    if (stageBtn) {
      const slug = parse(currentRoute).path.split('/')[2];
      const n = +stageBtn.dataset.stageToggle;
      const set = U.journeyDone(slug);
      const marking = !set.has(n);
      if (marking) set.add(n); else set.delete(n);
      U.setJourneyDone(slug, set);
      const total = M.page('journey', slug).stages.length;
      render({ samePage: true });
      if (marking && n < total) FX.toast(`Stage ${n} complete. Next: stage ${n + 1}.`);
      else if (marking) FX.toast('Journey complete.');
      return;
    }

    if (t.closest('[data-journey-reset]')) {
      const slug = parse(currentRoute).path.split('/')[2];
      U.setJourneyDone(slug, new Set());
      render({ samePage: true });
      FX.toast('Progress reset.');
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.matches('.fb-form')) {
      e.preventDefault();
      form.hidden = true;
      form.parentElement.querySelector('.fb-thanks').hidden = false;
    } else if (form.matches('[data-hero-search]')) {
      e.preventDefault();
    }
  });

  function copyText(text, selectEl, msg = 'Copied to clipboard') {
    const fallback = () => {
      if (selectEl) {
        const r = document.createRange();
        r.selectNodeContents(selectEl);
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
        FX.toast('Press Ctrl+C to copy');
      } else FX.toast('Copy is not available here');
    };
    try {
      navigator.clipboard.writeText(text).then(() => FX.toast(msg), fallback);
    } catch (err) {
      fallback();
    }
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      if ($('#palette').hidden) openPalette();
      else closePalette();
    } else if (e.key === 'Escape') {
      if (!$('#palette').hidden) closePalette();
      document.body.classList.remove('nav-open');
    }
  });

  /* ---------------- Content loading states ---------------- */
  // Shown while content loads, or if it cannot be loaded at all.
  function renderStatusPage() {
    const failed = FX.contentStatus === 'error';
    $('#primary-nav').innerHTML = U.primaryNav(null);
    $('#app').innerHTML = failed
      ? `<div class="page-narrow"><main id="main" tabindex="-1"><div class="no-results status-page" role="alert">
          <div class="nr-icon">${icons.info}</div>
          <p class="nr-title">Documentation is temporarily unavailable</p>
          <p class="nr-text">We couldn’t load the documentation content. Check your connection and try again in a moment.</p>
          <button type="button" class="btn btn-sm" data-retry>Try again</button>
        </div></main></div>`
      : `<div class="page-narrow"><main id="main" tabindex="-1" aria-busy="true"><p class="loading-msg" role="status"><span class="spinner" aria-hidden="true"></span>Loading documentation…</p></main></div>`;
  }

  // A slim notice when the site is showing this browser's saved copy.
  function renderContentNotice() {
    if (FX.contentStatus !== 'offline' || $('.content-notice')) return;
    $('#header').insertAdjacentHTML(
      'afterend',
      `<div class="content-notice" role="status">${icons.info}<span>You’re viewing a saved copy of the documentation. The latest content couldn’t be loaded.</span><button type="button" class="btn btn-ghost btn-sm" data-retry>Try again</button></div>`
    );
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-retry]')) location.reload();
  });

  /* ---------------- Boot ---------------- */
  renderHeader();
  renderPalette();
  $('#year').textContent = FX.SITE.today.slice(0, 4);
  currentRoute = hashRoute() || '/';
  renderStatusPage();
  FX.loadContent().then(() => {
    renderContentNotice();
    render();
  });
})();
