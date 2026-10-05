/*
 * Documentation search.
 * Builds an in-memory index from every content type and ranks results by
 * where the query matches (title > keywords > summary > section > body).
 * Results are grouped by documentation type.
 */
(function () {
  const M = FX.model;
  const { esc } = FX.h;
  const strip = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const norm = (s) => strip(s).toLowerCase().replace(/[‘’]/g, "'").replace(/[-_/]/g, ' ').replace(/\s+/g, ' ');

  let INDEX = null;

  function build() {
    const items = [];
    ['concept', 'guide', 'journey'].forEach((type) => {
      const sec = FX.content[type];
      Object.entries(sec.pages).forEach(([slug, p]) => {
        const anc = M.ancestors(type, slug);
        const section = type === 'journey' ? 'Journeys' : `${FX.TYPES[type].plural} › ${anc.map((a) => a.title).join(' › ')}`;
        let body = '';
        if (p.sections) body += p.sections.map((s) => s.title + ' ' + s.html).join(' ');
        if (p.terms) body += p.terms.map((t) => t.term + ' ' + t.def).join(' ');
        if (p.steps) body += p.steps.map((s) => (typeof s === 'string' ? s : s.title + ' ' + s.html)).join(' ');
        if (p.stages) body += p.stages.map((s) => s.title + ' ' + s.html).join(' ');
        if (p.troubleshooting) body += p.troubleshooting.map((t) => t.q + ' ' + t.a).join(' ');
        items.push({
          type, slug, href: M.href(type, slug), title: p.title, summary: p.summary, section,
          t: norm(p.title), k: norm((p.keywords || []).join(' | ')), s: norm(p.summary), c: norm(section), b: norm(body),
        });
      });
    });
    FX.releases.forEach((r) => {
      const ym = r.date.slice(0, 7);
      items.push({
        type: 'release', slug: r.id, href: `/release-notes/${ym}?section=${r.id}`, title: r.title, summary: r.summary,
        section: `Release Notes › ${M.monthLabel(ym)} › ${FX.RN_CATEGORIES[r.category].label}`, category: r.category, date: r.date,
        t: norm(r.title), k: norm(r.area + ' ' + r.category), s: norm(r.summary), c: norm(r.area), b: norm(r.details),
      });
    });
    INDEX = items;
  }

  const stem = (w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
  const hasWord = (hay, w) => new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(hay);

  // Each query token becomes a set of alternatives (the token, its stem and synonyms).
  function terms(q) {
    return norm(q)
      .split(' ')
      .filter(Boolean)
      .map((tok) => {
        const alts = new Set([tok, stem(tok)]);
        (FX.SYNONYMS[tok] || FX.SYNONYMS[stem(tok)] || []).forEach((s) => alts.add(s));
        return [...alts];
      });
  }

  function scoreField(hay, alts, weight, exactWeight) {
    let best = 0;
    alts.forEach((a, i) => {
      const synonym = i > 1;
      if (hasWord(hay, a)) best = Math.max(best, (exactWeight || weight) * (synonym ? 0.6 : 1));
      else if (hay.includes(a)) best = Math.max(best, weight * 0.5 * (synonym ? 0.6 : 1));
    });
    return best;
  }

  const ORDER = ['concept', 'guide', 'journey', 'release'];

  FX.search = function (q) {
    if (!INDEX) build();
    const ts = terms(q);
    if (!ts.length) return [];
    const res = [];
    INDEX.forEach((it) => {
      let total = 0;
      for (const alts of ts) {
        const s =
          scoreField(it.t, alts, 10, 14) + scoreField(it.k, alts, 6, 8) + scoreField(it.s, alts, 3, 4) + scoreField(it.c, alts, 2) + scoreField(it.b, alts, 1);
        if (!s) return; // every token must match somewhere
        total += s;
      }
      if (norm(q).trim() === it.t) total += 20;
      if (it.type === 'release') total *= 0.8; // prefer evergreen docs
      res.push({ ...it, score: total });
    });
    return res.sort((a, b) => b.score - a.score);
  };

  FX.searchGroups = function (results) {
    return ORDER.map((type) => ({ type, items: results.filter((r) => r.type === type) })).filter((g) => g.items.length);
  };

  // Highlight query words in a string.
  FX.highlight = function (text, q) {
    let out = esc(text);
    const words = norm(q).split(' ').filter((w) => w.length > 1);
    if (!words.length) return out;
    const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return out.replace(re, '<mark>$1</mark>');
  };
})();
