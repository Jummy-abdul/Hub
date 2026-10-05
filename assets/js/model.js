/*
 * Content model helpers. Every template reads content through these functions,
 * so the shape of the content files can change without touching templates.
 */
(function () {
  const M = {};
  const C = () => FX.content;

  M.href = (type, slug) => (slug ? `${FX.TYPES[type].base}/${slug}` : FX.TYPES[type].base);
  M.page = (type, slug) => C()[type] && C()[type].pages[slug];
  M.exists = (type, slug) => !!M.page(type, slug);

  // Walk a category tree. Visitor receives (node, ancestors).
  function walk(items, ancestors, fn) {
    items.forEach((it) => {
      if (typeof it === 'string') fn(it, ancestors);
      else walk(it.items, ancestors.concat(it), fn);
    });
  }

  // Ordered list of slugs in navigation order; drives previous/next links.
  M.order = (type) => {
    const out = [];
    C()[type].categories.forEach((cat) => walk(cat.items, [cat], (slug) => out.push(slug)));
    return out;
  };

  // Ancestors (category, then any nested groups) of a page.
  M.ancestors = (type, slug) => {
    let found = [];
    C()[type].categories.forEach((cat) =>
      walk(cat.items, [cat], (s, anc) => {
        if (s === slug) found = anc;
      })
    );
    return found;
  };

  M.category = (type, slug) => M.ancestors(type, slug)[0];

  M.countItems = (items) => {
    let n = 0;
    walk(items, [], () => n++);
    return n;
  };

  M.prevNext = (type, slug) => {
    const o = M.order(type);
    const i = o.indexOf(slug);
    return { prev: i > 0 ? o[i - 1] : null, next: i >= 0 && i < o.length - 1 ? o[i + 1] : null };
  };

  // Journeys that reference a page in any stage. Used for "Part of these journeys".
  M.journeysUsing = (type, slug) => {
    const out = [];
    const key = type === 'concept' ? 'learn' : 'do';
    Object.entries(C().journey.pages).forEach(([jslug, j]) => {
      j.stages.forEach((s, i) => {
        if ((s[key] || []).includes(slug) && !out.find((o) => o.slug === jslug)) out.push({ slug: jslug, journey: j, stage: i + 1 });
      });
    });
    return out;
  };

  // Release notes
  M.releaseMonths = () => {
    const map = new Map();
    FX.releases.forEach((r) => {
      const ym = r.date.slice(0, 7);
      if (!map.has(ym)) map.set(ym, []);
      map.get(ym).push(r);
    });
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  };

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  M.MONTHS = MONTHS;
  M.monthLabel = (ym) => `${MONTHS[+ym.slice(5, 7) - 1]} ${ym.slice(0, 4)}`;
  M.fmtDate = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`;
  };
  M.fmtDateLong = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  };

  // Rough reading time from rendered text length.
  M.readingTime = (html) => {
    const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(2, Math.round(words / 200));
  };

  FX.model = M;
})();
