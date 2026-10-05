/*
 * Page templates. One template per page type:
 *   home · section landing (concepts, guides) · concept article · guide article
 *   journeys landing · journey · release notes · search · prototype notes · not found
 * Templates return { title, html } and never contain page-specific content.
 */
(function () {
  const M = FX.model;
  const U = FX.ui;
  const { esc, icons, note } = FX.h;
  const T = FX.TYPES;
  const TPL = {};

  const docsLayout = ({ sidebar, main, rail, wide, cls = '' }) => `
    <div class="docs${rail ? ' has-rail' : ''} ${cls}">
      ${sidebar}
      <div class="docs-content">
        <div class="docs-mobilebar"><button type="button" class="btn btn-secondary btn-sm" data-open-nav aria-controls="sidebar">${icons.menu}<span>Menu</span></button></div>
        <main id="main" class="docs-main${wide ? ' wide' : ''}" tabindex="-1">${main}</main>
      </div>
      ${rail ? `<aside class="rail is-sticky" aria-label="Page navigation">${rail}</aside>` : ''}
    </div>`;

  const h2 = (id, title) => `<h2 id="${id}" class="anchor-h">${esc(title)}<a class="anchor-link" href="#${id}" data-scroll="${id}" aria-label="Link to ${esc(title)}">#</a></h2>`;

  const pageHeader = ({ type, title, summary, meta = '', crumbs }) => `
    ${U.crumbs(crumbs)}
    <header class="page-head" data-c="Page header">
      ${type ? U.badge(type, true) : ''}
      <h1>${esc(title)}</h1>
      ${summary ? `<p class="lead">${summary}</p>` : ''}
      ${meta ? `<div class="meta-row">${meta}</div>` : ''}
    </header>`;

  const metaItem = (icon, text) => `<span class="meta">${icons[icon]}${text}</span>`;

  /* =========================== HOME =========================== */
  TPL.home = () => {
    // Homepage content comes from the "Documentation Homepage" document in
    // Sanity (FX.home). Sections without content are left out.
    const H = FX.home || {};
    const cards = (H.discoveryCards && H.discoveryCards.length
      ? H.discoveryCards
      : ['concept', 'guide', 'journey', 'release'].map((t) => ({ type: t, title: T[t].plural, desc: T[t].intro, cta: `Browse ${T[t].plural.toLowerCase()}` }))
    ).filter((c) => T[c.type]);
    const count = (type) => (type === 'release' ? `${FX.releases.length} updates` : `${Object.keys(FX.content[type].pages).length} ${type === 'journey' ? 'journeys' : 'articles'}`);
    const popular = (H.popular || []).filter((p) => p.route);
    const popularMeta = (p) => {
      const cat = p.type === 'concept' || p.type === 'guide' ? M.category(p.type, p.slug) : null;
      return `${T[p.type].label}${cat ? ' · ' + esc(cat.title) : ''}`;
    };
    const latest = FX.releases.slice(0, 4);
    const featured = (H.featured || []).filter((slug) => M.exists('journey', slug));
    const main = `
      <section class="hero" data-c="Home hero">
        <div class="hero-inner">
          <h1>${esc(H.title || FX.SITE.name)}</h1>
          <p class="lead">${esc(H.tagline || FX.SITE.tagline)}</p>
          <div class="hero-search" data-c="Search field">
            <form class="hero-form" role="search" data-hero-search>
              <label for="hero-q" class="sr-only">Search Fixiam documentation</label>
              ${icons.search}
              <input id="hero-q" type="search" placeholder="${esc(H.searchPlaceholder || 'Search Fixiam documentation...')}" autocomplete="off" aria-controls="hero-results" aria-expanded="false" role="combobox">
              <kbd class="hero-kbd">/</kbd>
            </form>
            <div class="sr-panel hero-panel" id="hero-results" role="listbox" hidden></div>
          </div>
          <div class="hero-try"><span>Try</span>${FX.POPULAR_SEARCHES.slice(0, 5).map((s) => `<a class="chip" href="#/search?q=${encodeURIComponent(s)}">${esc(s)}</a>`).join('')}</div>
        </div>
      </section>

      <div class="home-body">
        <section class="discover" aria-label="Documentation areas">
          ${cards
            .map(
              (c) => `<a class="discover-card t-${c.type}" href="#${T[c.type].base}" data-c="Discovery card">
              <span class="dc-top"><span class="dc-icon">${U.typeIcon[c.type]}</span><span class="dc-tag">${T[c.type].tagline}</span></span>
              <span class="dc-title">${esc(c.title)}</span>
              <span class="dc-desc">${esc(c.desc)}</span>
              <span class="dc-foot"><span class="dc-cta">${esc(c.cta)}${icons.arrowRight}</span><span class="dc-count">${count(c.type)}</span></span>
            </a>`
            )
            .join('')}
        </section>

        ${popular.length ? `<section class="home-section" aria-labelledby="popular-h">
          <div class="section-h"><h2 id="popular-h">Popular topics</h2><a href="#/guides" class="more-link">All guides${icons.arrowRight}</a></div>
          <div class="popular-grid" data-c="Popular topics">
            ${popular
              .map((p) => `<a class="popular" href="#${p.route}"><span class="popular-title">${esc(p.label)}</span><span class="popular-meta">${popularMeta(p)}</span></a>`)
              .join('')}
          </div>
        </section>` : ''}

        <div class="home-split">
          ${featured.length ? `<section class="home-section" aria-labelledby="journeys-h">
            <div class="section-h"><h2 id="journeys-h">Start with a journey</h2><a href="#/journeys" class="more-link">All journeys${icons.arrowRight}</a></div>
            <div class="stack">
              ${featured
                .map((s) => {
                  const j = M.page('journey', s);
                  return `<a class="journey-mini" href="#${M.href('journey', s)}"><span class="jm-stages">${j.stages.length}<small>stages</small></span><span><span class="jm-title">${esc(j.title)}</span><span class="jm-desc">${esc(j.summary)}</span></span></a>`;
                })
                .join('')}
            </div>
          </section>` : ''}
          <section class="home-section" aria-labelledby="new-h">
            <div class="section-h"><h2 id="new-h">What's new</h2><a href="#/release-notes" class="more-link">All release notes${icons.arrowRight}</a></div>
            <ul class="whatsnew" data-c="Latest release notes">
              ${latest
                .map((r) => `<li><a href="#/release-notes/${r.date.slice(0, 7)}?section=${r.id}"><span class="cat cat-${r.category}">${FX.RN_CATEGORIES[r.category].label}</span><span class="wn-title">${esc(r.title)}</span><time datetime="${r.date}">${M.fmtDate(r.date)}</time></a></li>`)
                .join('')}
            </ul>
          </section>
        </div>

        <section class="home-section" aria-labelledby="org-h">
          <div class="section-h"><h2 id="org-h">How the documentation is organized</h2></div>
          <div class="principles" data-c="Content type principles">
            ${['concept', 'guide', 'journey', 'release']
              .map((t) => `<div class="principle t-${t}"><span class="pr-quote">“${T[t].tagline}.”</span>${U.badge(t)}<p>${esc(T[t].intro)}</p></div>`)
              .join('')}
          </div>
        </section>
      </div>`;
    const sidebar = U.sidebar(null, '', { filter: false }).replace('class="sidebar is-sticky"', 'class="sidebar is-sticky drawer-only"');
    return { title: FX.SITE.name, html: `<div class="home">${sidebar}<main id="main" tabindex="-1">${main}</main></div>`, home: true };
  };

  /* ====================== SECTION LANDING ====================== */
  TPL.landing = (type) => {
    const sec = FX.content[type];
    const crumbs = [['Docs', '/'], [T[type].plural]];
    let body = '';
    if (type === 'guide') {
      const start = sec.categories[0];
      body += `<section class="start-here" aria-labelledby="start-h" data-c="Start here">
        <h2 id="start-h" class="h-small">New to Fixiam? Start here</h2>
        <ol class="start-list">${start.items.map((s, i) => `<li><a href="#${M.href(type, s)}"><span class="start-n">${i + 1}</span><span><strong>${esc(M.page(type, s).title)}</strong><span>${esc(M.page(type, s).summary)}</span></span></a></li>`).join('')}</ol>
      </section>
      <div class="area-grid">${sec.categories
        .map((cat) => {
          const list = (items, depth = 0) =>
            items
              .map((it) =>
                typeof it === 'string'
                  ? `<li><a href="#${M.href(type, it)}">${esc(M.page(type, it).title)}</a></li>`
                  : `<li class="area-sub"><span>${esc(it.title)}</span><ul>${list(it.items, depth + 1)}</ul></li>`
              )
              .join('');
          return `<section class="area-card" id="${cat.id}" data-c="Product area card"><h2 class="area-title">${esc(cat.title)}<span class="tree-count">${M.countItems(cat.items)}</span></h2><p>${esc(cat.desc)}</p><ul class="area-list">${list(cat.items)}</ul></section>`;
        })
        .join('')}</div>`;
    } else {
      body += sec.categories
        .map(
          (cat) => `<section class="cat-section" id="${cat.id}">${h2(cat.id + '-h', cat.title)}<p class="cat-desc">${esc(cat.desc)}</p><div class="card-grid">${cat.items.map((s) => U.docCard(type, s, { showBadge: false })).join('')}</div></section>`
        )
        .join('');
    }
    const main = `${pageHeader({ type, title: T[type].plural, summary: esc(T[type].intro), crumbs })}
      <p class="type-note">${icons.info}<span>${esc(T[type].notFor)}</span></p>
      ${body}`;
    const toc = sec.categories.map((c) => ({ id: type === 'guide' ? c.id : c.id + '-h', title: c.title }));
    return {
      title: `${T[type].plural} | ${FX.SITE.name}`,
      html: docsLayout({ sidebar: U.sidebar(type, U.tree(type, null, { landingActive: true })), main, rail: U.toc(toc, 'Categories'), wide: true }),
    };
  };

  /* ========================== ARTICLE ========================== */
  const relatedSection = (id, title, type, slugs, q = '') =>
    slugs && slugs.filter((s) => M.exists(type, s)).length
      ? `<section class="related" aria-labelledby="${id}" data-c="Related documentation">${h2(id, title)}<div class="link-rows">${slugs.map((s) => U.linkRow(type, s, q)).join('')}</div></section>`
      : '';

  const partOfJourneys = (type, slug) => {
    const js = M.journeysUsing(type, slug);
    if (!js.length) return '';
    return `<section class="part-of" data-c="Part of journeys"><div class="part-of-h">${icons.route}<span>This ${T[type].label.toLowerCase()} is part of ${js.length === 1 ? 'a journey' : js.length + ' journeys'}</span></div>
      <ul>${js.map((j) => `<li><a href="#${M.href('journey', j.slug)}?stage=${j.stage}">${esc(j.journey.title)}</a><span>Stage ${j.stage} of ${j.journey.stages.length} · ${esc(j.journey.stages[j.stage - 1].title)}</span></li>`).join('')}</ul></section>`;
  };

  function conceptBody(p) {
    const toc = [];
    let html = '';
    (p.sections || []).forEach((s) => {
      toc.push({ id: s.id, title: s.title });
      html += `<section class="prose-section">${h2(s.id, s.title)}${s.html}</section>`;
    });
    if (p.terms && p.terms.length) {
      toc.push({ id: 'terminology', title: 'Common terminology' });
      html += `<section class="prose-section">${h2('terminology', 'Common terminology')}<dl class="terms" data-c="Terminology list">${p.terms.map((t) => `<div><dt>${esc(t.term)}</dt><dd>${t.def}</dd></div>`).join('')}</dl></section>`;
    }
    if ((p.related.concepts || []).length) toc.push({ id: 'related-concepts', title: 'Related concepts' });
    if ((p.related.guides || []).length) toc.push({ id: 'related-guides', title: 'Related guides' });
    html += relatedSection('related-concepts', 'Related concepts', 'concept', p.related.concepts);
    html += relatedSection('related-guides', 'Related guides', 'guide', p.related.guides);
    return { html, toc };
  }

  function guideBody(p) {
    const toc = [];
    let html = '';
    const outline = p.steps.some((s) => typeof s === 'string');
    toc.push({ id: 'accomplish', title: 'What you will accomplish' });
    html += `<section class="accomplish" data-c="What you will accomplish">${h2('accomplish', 'What you will accomplish')}<ul class="check-list">${p.accomplish.map((a) => `<li>${icons.check}<span>${a}</span></li>`).join('')}</ul></section>`;
    toc.push({ id: 'prerequisites', title: 'Prerequisites' });
    html += `<section class="prose-section" data-c="Prerequisites">${h2('prerequisites', 'Prerequisites')}<ul class="prereq-list">${p.prereqs.map((a) => `<li><span class="box" aria-hidden="true"></span><span>${a}</span></li>`).join('')}</ul></section>`;
    toc.push({ id: 'steps', title: 'Steps' });
    html += `<section class="prose-section">${h2('steps', 'Steps')}${
      outline ? note('This is an outline sample page. Final instructions and screenshots will be added with the production content.', 'Sample outline') : ''
    }<ol class="steps" data-c="Numbered steps">${p.steps
      .map((s, i) => {
        const st = typeof s === 'string' ? { title: s } : s;
        const id = `step-${i + 1}`;
        toc.push({ id, title: `${i + 1}. ${st.title}`, level: 3 });
        return `<li class="step" id="${id}"><span class="step-n" aria-hidden="true">${i + 1}</span><div class="step-body"><h3>${esc(st.title)}</h3>${st.html || ''}${st.shot ? FX.h.shot(st.shot) : ''}${st.media || ''}</div></li>`;
      })
      .join('')}</ol></section>`;
    toc.push({ id: 'result', title: 'Expected result' });
    html += `<section class="prose-section">${h2('result', 'Expected result')}<div class="result-box" data-c="Expected result">${icons.checkCircle}<p>${p.result}</p></div></section>`;
    if (p.troubleshooting && p.troubleshooting.length) {
      toc.push({ id: 'troubleshooting', title: 'Troubleshooting' });
      html += `<section class="prose-section">${h2('troubleshooting', 'Troubleshooting')}<div class="accordion" data-c="Troubleshooting accordion">${p.troubleshooting
        .map((t) => `<details><summary>${t.q}${icons.chevronDown}</summary><div class="acc-body"><p>${t.a}</p></div></details>`)
        .join('')}</div></section>`;
    }
    if ((p.related.guides || []).length) toc.push({ id: 'related-guides', title: 'Related guides' });
    if ((p.related.concepts || []).length) toc.push({ id: 'related-concepts', title: 'Learn the concepts' });
    html += relatedSection('related-guides', 'Related guides', 'guide', p.related.guides);
    html += relatedSection('related-concepts', 'Learn the concepts', 'concept', p.related.concepts);
    return { html, toc };
  }

  TPL.article = (type, slug, q) => {
    const p = M.page(type, slug);
    if (!p) return TPL.notFound();
    const anc = M.ancestors(type, slug);
    const crumbs = [['Docs', '/'], [T[type].plural, T[type].base]];
    anc.forEach((a, i) => crumbs.push([a.title, i === 0 ? `${T[type].base}?section=${type === 'guide' ? a.id : a.id + '-h'}` : null]));
    crumbs.push([p.title]);

    const { html, toc } = type === 'concept' ? conceptBody(p) : guideBody(p);
    const read = M.readingTime(html);
    let meta = metaItem('calendar', `Updated <time datetime="${p.updated}">${M.fmtDateLong(p.updated)}</time>`);
    if (type === 'guide') meta += (p.time ? metaItem('clock', `About ${esc(p.time)}`) : '') + (p.role ? metaItem('user', esc(p.role)) : '');
    else meta += metaItem('book', `${read} min read`);
    meta += `<button type="button" class="meta meta-btn" data-copy-link>${icons.link}Copy link</button>`;

    FX.rememberRecent({ type, title: p.title, href: M.href(type, slug) });

    const main = `
      ${U.journeyBanner(q)}
      ${pageHeader({ type, title: p.title, summary: esc(p.summary), meta, crumbs })}
      ${U.tocInline(toc)}
      <div class="prose" data-c="${T[type].label} body">${html}</div>
      ${partOfJourneys(type, slug)}
      ${U.feedback()}
      ${U.prevNext(type, slug)}`;
    return {
      title: `${p.title} | ${FX.SITE.name}`,
      html: docsLayout({ sidebar: U.sidebar(type, U.tree(type, slug)), main, rail: U.toc(toc) + railHelp() }),
    };
  };

  const railHelp = () => `<div class="rail-help"><span>Need more help?</span><a href="#" data-toast="Prototype: this would open the Fixiam support portal.">Contact Fixiam support</a></div>`;

  /* ====================== JOURNEYS LANDING ====================== */
  TPL.journeysLanding = () => {
    const pages = FX.content.journey.pages;
    const crumbs = [['Docs', '/'], ['Journeys']];
    const cards = Object.keys(pages)
      .map((slug) => {
        const j = pages[slug];
        const done = U.journeyDone(slug).size;
        return `<a class="journey-card" href="#${M.href('journey', slug)}" data-c="Journey card">
          <span class="jc-top">${U.badge('journey')}${j.effort ? `<span class="effort effort-${j.effort.toLowerCase()}">${esc(j.effort)} effort</span>` : ''}</span>
          <span class="jc-title">${esc(j.title)}</span>
          <span class="jc-desc">${esc(j.summary)}</span>
          <dl class="jc-meta">
            <div><dt>Who it is for</dt><dd>${esc(j.audience)}</dd></div>
            <div><dt>Stages</dt><dd>${j.stages.length}</dd></div>
            <div><dt>Typical duration</dt><dd>${esc(j.duration)}</dd></div>
          </dl>
          <span class="jc-steps" aria-hidden="true">${j.stages.map((_, i) => `<i class="${i < done ? 'done' : ''}"></i>`).join('')}</span>
          <span class="jc-foot">${done ? `<span class="jc-progress">${done} of ${j.stages.length} complete</span>` : '<span></span>'}<span class="dc-cta">${done ? 'Continue journey' : 'Start journey'}${icons.arrowRight}</span></span>
        </a>`;
      })
      .join('');
    const compare = `<div class="compare" data-c="Content type comparison">
      <div><span class="cmp-k">${U.badge('concept')}</span><strong>Teach me</strong><span>One idea, explained.</span></div>
      <div><span class="cmp-k">${U.badge('guide')}</span><strong>Show me how</strong><span>One task, step by step.</span></div>
      <div class="is-current"><span class="cmp-k">${U.badge('journey')}</span><strong>Take me from beginning to end</strong><span>Several concepts and guides, in order, toward one outcome.</span></div>
    </div>`;
    const main = `${pageHeader({ type: 'journey', title: 'Journeys', summary: esc(T.journey.intro), crumbs })}${compare}<div class="journey-grid">${cards}</div>`;
    return { title: `Journeys | ${FX.SITE.name}`, html: docsLayout({ sidebar: U.sidebar('journey', U.tree('journey', null, { landingActive: true }), { filter: false }), main, wide: true }) };
  };

  /* ========================== JOURNEY ========================== */
  TPL.journey = (slug, q) => {
    const j = M.page('journey', slug);
    if (!j) return TPL.notFound();
    const done = U.journeyDone(slug);
    const current = j.stages.findIndex((_, i) => !done.has(i + 1)) + 1; // 0 if all done
    const crumbs = [['Docs', '/'], ['Journeys', '/journeys'], [j.title]];
    FX.rememberRecent({ type: 'journey', title: j.title, href: M.href('journey', slug) });

    const meta = `<dl class="journey-facts" data-c="Journey facts">
      <div><dt>Who it is for</dt><dd>${esc(j.audience)}</dd></div>
      <div><dt>Stages</dt><dd>${j.stages.length}</dd></div>
      ${j.effort ? `<div><dt>Effort</dt><dd><span class="effort effort-${j.effort.toLowerCase()}">${esc(j.effort)}</span></dd></div>` : ''}
      <div><dt>Typical duration</dt><dd>${esc(j.duration)}</dd></div>
    </dl>`;

    const stageLinks = (list, type, n) =>
      list.filter((s) => M.exists(type, s)).map((s) => `<a class="stage-link t-${type}" href="#${M.href(type, s)}?journey=${slug}&stage=${n}">${U.typeIcon[type]}<span>${esc(M.page(type, s).title)}</span></a>`).join('');

    const stages = j.stages
      .map((s, i) => {
        const n = i + 1;
        const state = done.has(n) ? 'done' : n === current ? 'current' : 'upcoming';
        const learn = stageLinks(s.learn || [], 'concept', n);
        const doo = stageLinks(s.do || [], 'guide', n);
        return `<li class="stage stage-${state}" id="stage-${n}" data-stage="${n}" data-c="Journey stage">
          <div class="stage-marker" aria-hidden="true"><span class="stage-dot">${state === 'done' ? icons.check : n}</span></div>
          <div class="stage-card">
            <div class="stage-head">
              <span class="stage-eyebrow">Stage ${n} of ${j.stages.length}${state === 'current' ? '<span class="stage-now">You are here</span>' : ''}${state === 'done' ? '<span class="stage-complete">Complete</span>' : ''}</span>
              <h2 class="stage-title">${esc(s.title)}</h2>
            </div>
            <div class="stage-text">${s.html}</div>
            ${learn || doo ? `<div class="stage-links">
              ${learn ? `<div class="stage-col"><span class="stage-col-h">Learn</span>${learn}</div>` : ''}
              ${doo ? `<div class="stage-col"><span class="stage-col-h">Do</span>${doo}</div>` : ''}
            </div>` : ''}
            ${s.checklist ? `<div class="stage-check"><span class="stage-col-h">Before you move on</span><ul>${s.checklist.map((c) => `<li>${icons.check}${esc(c)}</li>`).join('')}</ul></div>` : ''}
            <div class="stage-foot">
              <button type="button" class="btn ${state === 'done' ? 'btn-ghost' : state === 'current' ? '' : 'btn-secondary'} btn-sm" data-stage-toggle="${n}">${state === 'done' ? 'Mark as not complete' : `${icons.check}Mark stage complete`}</button>
            </div>
          </div>
        </li>`;
      })
      .join('');

    const next = (j.next || []).filter((s) => M.exists('journey', s));
    const allDone = done.size === j.stages.length;
    const main = `
      ${pageHeader({ type: 'journey', title: j.title, summary: esc(j.summary), crumbs, meta: metaItem('calendar', `Updated <time datetime="${j.updated}">${M.fmtDateLong(j.updated)}</time>`) })}
      ${meta}
      <section class="outcome" data-c="Journey outcome"><h2 class="h-small">By the end of this journey</h2><ul class="check-list">${j.outcome.map((o) => `<li>${icons.check}<span>${esc(o)}</span></li>`).join('')}</ul></section>
      <div class="journey-progress" data-c="Journey progress">
        ${U.progressBar(done.size, j.stages.length)}
        <div class="jp-actions">
          ${allDone ? '<span class="jp-done">Journey complete</span>' : `<a class="btn btn-sm" href="#${M.href('journey', slug)}?stage=${current}">${done.size ? 'Continue' : 'Start'} at stage ${current}${icons.arrowRight}</a>`}
          ${done.size ? '<button type="button" class="btn btn-ghost btn-sm" data-journey-reset>Reset progress</button>' : ''}
        </div>
      </div>
      <p class="type-note">${icons.info}<span>Each stage links to what to <strong>learn</strong> (concepts) and what to <strong>do</strong> (guides). Guides opened from a stage keep this journey in view so you can come back.</span></p>
      <ol class="stages">${stages}</ol>
      ${next.length ? `<section class="related">${h2('next-journeys', 'Where to go next')}<div class="link-rows">${next.map((s) => U.linkRow('journey', s)).join('')}</div></section>` : ''}
      ${U.feedback()}`;

    const stepper = `<nav class="stepper" aria-label="Journey stages" data-c="Journey stepper">
      <div class="toc-title">Journey stages</div>
      ${U.progressBar(done.size, j.stages.length, false)}
      <ol>${j.stages.map((s, i) => `<li class="${done.has(i + 1) ? 'done' : i + 1 === current ? 'current' : ''}"><a href="#stage-${i + 1}" data-scroll="stage-${i + 1}"><span class="sp-dot">${done.has(i + 1) ? icons.check : i + 1}</span><span>${esc(s.title)}</span></a></li>`).join('')}</ol>
    </nav>`;
    return {
      title: `${j.title} | ${FX.SITE.name}`,
      html: docsLayout({ sidebar: U.sidebar('journey', U.tree('journey', slug), { filter: false }), main, rail: stepper, cls: 'is-journey' }),
    };
  };

  /* ======================= RELEASE NOTES ======================= */
  TPL.releases = (ym, q) => {
    const months = M.releaseMonths();
    const years = [...new Set(months.map(([m]) => m.slice(0, 4)))];
    const year = ym ? ym.slice(0, 4) : q.year || '';
    const cat = q.cat || '';
    const validYm = ym && months.find(([m]) => m === ym);
    if (ym && !validYm) return TPL.notFound();

    const inScope = (r) => (!ym || r.date.startsWith(ym)) && (!year || r.date.startsWith(year));
    const scoped = FX.releases.filter(inScope);
    const shown = scoped.filter((r) => !cat || r.category === cat);
    const counts = { '': scoped.length };
    Object.keys(FX.RN_CATEGORIES).forEach((c) => (counts[c] = scoped.filter((r) => r.category === c).length));

    const build = (o) => {
      const y = o.year !== undefined ? o.year : year;
      const m = o.ym !== undefined ? o.ym : ym;
      const c = o.cat !== undefined ? o.cat : cat;
      const qs = new URLSearchParams();
      if (!m && y) qs.set('year', y);
      if (c) qs.set('cat', c);
      const s = qs.toString();
      return `/release-notes${m ? '/' + m : ''}${s ? '?' + s : ''}`;
    };
    FX.rnBuild = build;

    // Archive sidebar
    const archive = `<ul class="tree" role="list">
      <li><a class="tree-link tree-overview${!ym && !year ? ' active' : ''}" href="#/release-notes">All release notes</a></li>
      ${years
        .map((y) => {
          const id = 'release:/' + y;
          if (year === y || (!year && y === years[0])) FX.navOpen.add(id);
          const open = FX.navOpen.has(id);
          return `<li class="tree-group${open ? ' open' : ''}" data-node="${id}"><button type="button" class="tree-toggle" aria-expanded="${open}">${icons.chevron}<span>${y}</span><span class="tree-count">${FX.releases.filter((r) => r.date.startsWith(y)).length}</span></button>
          <ul class="tree-children">
            <li><a class="tree-link${!ym && year === y ? ' active' : ''}" href="#/release-notes?year=${y}">All of ${y}</a></li>
            ${months
              .filter(([m]) => m.startsWith(y))
              .map(([m, list]) => `<li><a class="tree-link${ym === m ? ' active' : ''}" href="#/release-notes/${m}"${ym === m ? ' aria-current="page"' : ''}>${M.MONTHS[+m.slice(5) - 1]}<span class="tree-count">${list.length}</span></a></li>`)
              .join('')}
          </ul></li>`;
        })
        .join('')}
    </ul>`;
    U.saveOpen();

    const monthsForYear = months.filter(([m]) => !year || m.startsWith(year));
    const filters = `<div class="rn-filters" data-c="Release note filters" role="search" aria-label="Filter release notes">
      <div class="rn-selects">
        <label class="field"><span>Year</span><select id="rn-year"><option value="">All years</option>${years.map((y) => `<option value="${y}"${y === year ? ' selected' : ''}>${y}</option>`).join('')}</select></label>
        <label class="field"><span>Month</span><select id="rn-month"><option value="">All months</option>${monthsForYear.map(([m]) => `<option value="${m}"${m === ym ? ' selected' : ''}>${M.monthLabel(m)}</option>`).join('')}</select></label>
      </div>
      <div class="chip-group" role="group" aria-label="Category">
        ${[['', 'All'], ...Object.entries(FX.RN_CATEGORIES).map(([k, v]) => [k, v.label])]
          .map(([k, label]) => `<a class="chip chip-filter${k ? ' cat-chip-' + k : ''}" href="#${build({ cat: k })}" aria-pressed="${cat === k}" data-replace>${label}<span>${counts[k]}</span></a>`)
          .join('')}
      </div>
    </div>`;

    const groups = M.releaseMonths()
      .map(([m, list]) => [m, list.filter((r) => shown.includes(r))])
      .filter(([, list]) => list.length);
    const entries = groups.length
      ? groups
          .map(
            ([m, list]) => `<section class="rn-month" aria-labelledby="m-${m}">
        <h2 id="m-${m}" class="rn-month-h"><a href="#/release-notes/${m}">${M.monthLabel(m)}</a><span>${list.length} update${list.length === 1 ? '' : 's'}</span></h2>
        <div class="rn-list">${list
          .map((r) => {
            const c = FX.RN_CATEGORIES[r.category];
            const links = r.links.filter((l) => l[1]);
            return `<article class="rn" id="${r.id}" data-c="Release note entry">
              <div class="rn-date"><time datetime="${r.date}">${M.fmtDate(r.date)}</time></div>
              <div class="rn-body">
                <div class="rn-tags"><span class="cat cat-${r.category}" title="${esc(c.desc)}">${c.label}</span><span class="rn-area">${esc(r.area)}</span></div>
                <h3 class="rn-title">${esc(r.title)}</h3>
                <p class="rn-summary">${esc(r.summary)}</p>
                <details class="rn-details"${q.section === r.id ? ' open' : ''}><summary>Details${icons.chevronDown}</summary>
                  <div class="rn-detail-body">${r.details}
                    <dl class="rn-facts"><div><dt>Affected area</dt><dd>${esc(r.area)}</dd></div><div><dt>Released</dt><dd>${M.fmtDateLong(r.date)}</dd></div></dl>
                    ${links.length ? `<div class="rn-links"><span>Related documentation</span>${links.map(([label, href]) => `<a href="#${href}">${esc(label)}${icons.arrowRight}</a>`).join('')}</div>` : ''}
                  </div>
                </details>
              </div>
            </article>`;
          })
          .join('')}</div>
      </section>`
          )
          .join('')
      : `<div class="no-results" data-c="Empty state"><p class="nr-title">No release notes match these filters</p><p class="nr-text">Try another category or month.</p><a class="btn btn-secondary btn-sm" href="#/release-notes">Clear filters</a></div>`;

    // Month-to-month archive navigation
    let monthNav = '';
    if (ym) {
      const idx = months.findIndex(([m]) => m === ym);
      const newer = months[idx - 1], older = months[idx + 1];
      monthNav = `<nav class="prevnext" aria-label="Archive">${older ? `<a class="pn pn-prev" href="#/release-notes/${older[0]}"><span class="pn-label">${icons.arrowLeft}Older</span><span class="pn-title">${M.monthLabel(older[0])}</span></a>` : '<span></span>'}${newer ? `<a class="pn pn-next" href="#/release-notes/${newer[0]}"><span class="pn-label">Newer${icons.arrowRight}</span><span class="pn-title">${M.monthLabel(newer[0])}</span></a>` : '<span></span>'}</nav>`;
    }

    const crumbs = [['Docs', '/'], ['Release Notes', ym || year ? '/release-notes' : null]];
    if (ym) crumbs.push([M.monthLabel(ym)]);
    else if (year) crumbs.push([year]);
    const title = ym ? `Release notes: ${M.monthLabel(ym)}` : year ? `Release notes: ${year}` : 'Release Notes';
    const main = `${pageHeader({ type: 'release', title, summary: esc(T.release.intro), crumbs })}${filters}<div class="rn-wrap">${entries}</div>${monthNav}`;

    const legend = `<div class="rn-legend" data-c="Category legend"><div class="toc-title">Categories</div><dl>${Object.entries(FX.RN_CATEGORIES)
      .map(([k, v]) => `<div><dt><span class="cat cat-${k}">${v.label}</span></dt><dd>${esc(v.desc)}</dd></div>`)
      .join('')}</dl></div>
      <div class="rn-subscribe"><div class="toc-title">Stay up to date</div><p>Get release notes by email or RSS.</p><button type="button" class="btn btn-secondary btn-sm" data-toast="Prototype: this would subscribe you to release note emails.">${icons.rss}Subscribe</button></div>`;
    return { title: `${title} | ${FX.SITE.name}`, html: docsLayout({ sidebar: U.sidebar('release', archive, { filter: false }), main, rail: legend }) };
  };

  /* =========================== SEARCH =========================== */
  TPL.search = (q) => {
    const query = q.q || '';
    const type = q.type || '';
    const results = query ? FX.search(query) : [];
    const groups = FX.searchGroups(results);
    const tabs = [['', 'All', results.length], ...['concept', 'guide', 'journey', 'release'].map((t) => [t, T[t].plural, results.filter((r) => r.type === t).length])];
    let body;
    if (!query) body = `<p class="muted">Enter a search term above, or try one of these: ${FX.POPULAR_SEARCHES.map((s) => `<a href="#/search?q=${encodeURIComponent(s)}">${esc(s)}</a>`).join(', ')}.</p>`;
    else if (!results.length) body = U.noResults(query);
    else {
      const visible = groups.filter((g) => !type || g.type === type);
      body = visible
        .map((g) => `<section class="sr-page-group" aria-labelledby="g-${g.type}"><h2 id="g-${g.type}" class="sr-page-h">${U.typeIcon[g.type]}${T[g.type].plural}<span>${g.items.length}</span></h2>${g.items.map((r) => U.searchItem(r, query)).join('')}</section>`)
        .join('');
    }
    const main = `
      ${U.crumbs([['Docs', '/'], ['Search']])}
      <header class="page-head"><h1>${query ? `Search results for “${esc(query)}”` : 'Search documentation'}</h1>${query ? `<p class="lead">${results.length} result${results.length === 1 ? '' : 's'} across Concepts, Guides, Journeys and Release Notes.</p>` : ''}</header>
      <form class="search-page-form" role="search" data-search-page>
        <label for="sp-q" class="sr-only">Search Fixiam documentation</label>${icons.search}
        <input id="sp-q" type="search" value="${esc(query)}" placeholder="Search Fixiam documentation..." autocomplete="off">
        <button class="btn btn-sm" type="submit">Search</button>
      </form>
      ${query && results.length ? `<div class="tabs-row" role="tablist" aria-label="Filter by documentation type" data-c="Search type filter">${tabs
        .map(([k, label, n]) => `<a role="tab" class="tab-pill" aria-selected="${type === k}" href="#/search?q=${encodeURIComponent(query)}${k ? '&type=' + k : ''}" data-replace>${label}<span>${n}</span></a>`)
        .join('')}</div>` : ''}
      <div class="sr-page" data-c="Search results">${body}</div>`;
    return { title: `Search | ${FX.SITE.name}`, html: `<div class="page-narrow"><main id="main" tabindex="-1">${main}</main></div>` };
  };

  /* ====================== PROTOTYPE NOTES ====================== */
  TPL.about = () => {
    const rows = [
      ['Home', '<code>/</code>', 'Entry point, search, discovery cards, popular topics'],
      ['Section landing', '<code>/concepts</code>, <code>/guides</code>', 'Category overview with cards or product-area lists'],
      ['Concept article', '<code>/concepts/:slug</code>', 'Sections, diagrams, terminology, related concepts and guides'],
      ['Guide article', '<code>/guides/:slug</code>', 'Accomplish, prerequisites, numbered steps, result, troubleshooting'],
      ['Journeys landing', '<code>/journeys</code>', 'Journey cards with audience, stages, effort, progress'],
      ['Journey', '<code>/journeys/:slug</code>', 'Stages with Learn and Do links, progress, stepper'],
      ['Release notes', '<code>/release-notes</code>, <code>/release-notes/:yyyy-mm</code>', 'Chronological entries with year, month and category filters'],
      ['Search', '<code>/search?q=</code>', 'Grouped results, type filter, no-results state'],
    ];
    const comps = ['Top navigation', 'Sidebar navigation tree', 'Breadcrumb', 'Type badge', 'Page header', 'On this page', 'Callout', 'Code block', 'Table', 'Tabs', 'Diagram', 'Screenshot placeholder', 'Numbered steps', 'Expected result', 'Troubleshooting accordion', 'Related documentation', 'Part of journeys', 'Journey context banner', 'Journey stage', 'Journey stepper', 'Release note entry', 'Search palette', 'Feedback', 'Previous / next'];
    const main = `
      ${U.crumbs([['Docs', '/'], ['Prototype notes']])}
      <header class="page-head"><h1>About this prototype</h1><p class="lead">This prototype shows how Fixiam Documentation should behave end to end. All content is realistic sample content and will be replaced.</p></header>
      <div class="prose">
        <section class="prose-section">${h2('templates', 'Page templates')}<p>Every page is rendered from one of these templates. Content comes from Sanity; templates never contain page content.</p>${FX.h.table(['Template', 'Route', 'Contains'], rows)}</section>
        <section class="prose-section">${h2('components', 'Reusable components')}<p>Turn on <button type="button" class="btn btn-secondary btn-sm" data-annotate>${icons.grid}Template view</button> to outline and label every component on any page.</p><div class="chips">${comps.map((c) => `<span class="chip static">${c}</span>`).join('')}</div></section>
        <section class="prose-section">${h2('content-model', 'Content model')}<p>Each type has a fixed shape so authors cannot blur Concepts, Guides and Journeys.</p>${FX.h.code(`guide: {
  title, summary, updated, time, role, keywords[],
  accomplish[], prereqs[],
  steps[{ title, html, shot? }],
  result, troubleshooting[{ q, a }],
  related: { concepts[], guides[] }
}`, 'Guide shape')}</section>
        <section class="prose-section">${h2('growth', 'Adding a Developers section later')}<p>Primary navigation is generated from <code>FX.SECTIONS</code> and content types from <code>FX.TYPES</code> in <code>assets/js/config.js</code>. A Developers section needs one entry in each, a content file, and a template if API reference pages need a different layout.</p></section>
        <section class="prose-section">${h2('flows', 'Flows to try')}<ul>
          <li>Search for <a href="#/search?q=SSO">SSO</a>, <a href="#/search?q=device">device</a> or <a href="#/search?q=kubernetes">kubernetes</a> (no results). Press <kbd>/</kbd> or <kbd>Ctrl</kbd> <kbd>K</kbd> anywhere.</li>
          <li>Open <a href="#/concepts/single-sign-on">Single Sign On</a>, then follow a related guide.</li>
          <li>Start <a href="#/journeys/roll-out-sso">Roll out SSO</a>, open a guide from stage 4, then return with the journey banner.</li>
          <li>Filter <a href="#/release-notes?cat=security">security release notes</a>, then browse the archive.</li>
        </ul></section>
      </div>`;
    return { title: `Prototype notes | ${FX.SITE.name}`, html: `<div class="page-narrow"><main id="main" tabindex="-1">${main}</main></div>` };
  };

  TPL.notFound = () => ({
    title: `Page not found | ${FX.SITE.name}`,
    html: `<div class="page-narrow"><main id="main" tabindex="-1">
      <header class="page-head nf"><span class="nf-code">404</span><h1>We couldn’t find that page</h1><p class="lead">The page may have moved, or the link may be incorrect. Try searching, or start from one of these sections.</p></header>
      <div class="card-grid">${['concept', 'guide', 'journey', 'release'].map((t) => `<a class="doc-card" href="#${T[t].base}">${U.badge(t)}<span class="doc-card-title">${T[t].plural}</span><span class="doc-card-desc">${esc(T[t].intro)}</span></a>`).join('')}</div>
    </main></div>`,
  });

  FX.tpl = TPL;
})();
