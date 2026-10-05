/*
 * Content helpers. Content files call these to produce consistent,
 * reusable components (callouts, code blocks, screenshot placeholders, tables)
 * instead of hand-writing markup. Each component carries a data-c attribute so
 * the "Template view" toggle can label it for engineers.
 */
(function () {
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const I = (d, extra = '') =>
    `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;

  const icons = {
    info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    tip: I('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
    warn: I('<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>'),
    shield: I('<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3z"/>'),
    check: I('<path d="m5 12 4.5 4.5L19 7"/>'),
    checkCircle: I('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
    arrowRight: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    arrowLeft: I('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    chevron: I('<path d="m9 6 6 6-6 6"/>'),
    chevronDown: I('<path d="m6 9 6 6 6-6"/>'),
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    copy: I('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'),
    link: I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    book: I('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>'),
    wrench: I('<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L14 2l-2.3 2.3"/><path d="M3 21l6-6"/>'),
    route: I('<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>'),
    spark: I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: I('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'),
    menu: I('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    user: I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    layers: I('<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>'),
    calendar: I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    grid: I('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
    thumbUp: I('<path d="M7 11v9H4v-9h3zM7 11l4-8a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.3 20H7"/>'),
    thumbDown: I('<path d="M17 13V4h3v9h-3zM17 13l-4 8a2 2 0 0 1-2-2v-4H5.5a2 2 0 0 1-2-2.3l1.2-7A2 2 0 0 1 6.7 4H17"/>'),
    rss: I('<path d="M5 19h.01M5 11a8 8 0 0 1 8 8M5 4a15 15 0 0 1 15 15"/>'),
    external: I('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    flag: I('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    play: I('<path d="M7 4v16l13-8L7 4z"/>'),
  };

  const callout = (kind, defaultTitle, icon) => (body, title = defaultTitle) =>
    `<div class="callout callout-${kind}" data-c="Callout · ${kind}" role="note"><div class="callout-title">${icons[icon]}<span>${title}</span></div><div class="callout-body">${body}</div></div>`;

  const code = (src, lang = '') =>
    `<div class="code" data-c="Code block"><div class="code-head"><span class="code-lang">${esc(lang)}</span><button class="code-copy" type="button" data-copy-code>${icons.copy}<span>Copy</span></button></div><pre><code>${esc(src.trim())}</code></pre></div>`;

  const table = (head, rows, opts = {}) =>
    `<div class="table-wrap" data-c="Table"><table${opts.compact ? ' class="compact"' : ''}><thead><tr>${head
      .map((h) => `<th scope="col">${h}</th>`)
      .join('')}</tr></thead><tbody>${rows
      .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`)
      .join('')}</tbody></table></div>`;

  // Admin Console screenshot placeholder. Renders a lightweight mock of the
  // console so steps feel real; replace with real screenshots later.
  const CONSOLE_NAV = ['Dashboard', 'Users', 'Applications', 'Authentication', 'Lifecycle', 'Devices', 'Access', 'Reports', 'Settings'];
  const shot = ({ area = 'Dashboard', title, path = '', kind = 'form', fields = [], cols = [], rows = [], items = [], button, mark, caption }) => {
    let body = '';
    if (kind === 'form') {
      body = `<div class="mock-form">${fields
        .map((f, i) => {
          const fo = typeof f === 'string' ? { label: f } : f;
          const isMark = mark === i + 1;
          let ctl;
          if (fo.type === 'toggle') ctl = `<span class="mock-toggle${fo.on ? ' on' : ''}"></span>`;
          else if (fo.type === 'radio')
            ctl = `<span class="mock-radios">${fo.options
              .map((o, j) => `<span class="mock-radio${j === 0 ? ' on' : ''}">${esc(o)}</span>`)
              .join('')}</span>`;
          else ctl = `<span class="mock-input${fo.type === 'select' ? ' select' : ''}">${esc(fo.value || '')}</span>`;
          return `<div class="mock-field${isMark ? ' marked' : ''}"><span class="mock-label">${esc(fo.label)}</span>${ctl}${isMark ? '<span class="mock-mark">1</span>' : ''}</div>`;
        })
        .join('')}</div>`;
    } else if (kind === 'table') {
      body = `<div class="mock-table"><div class="mock-tr head">${cols.map((c) => `<span>${esc(c)}</span>`).join('')}</div>${rows
        .map((r) => `<div class="mock-tr">${r.map((c) => `<span>${c}</span>`).join('')}</div>`)
        .join('')}</div>`;
    } else if (kind === 'tiles') {
      body = `<div class="mock-tiles">${items
        .map((t, i) => `<div class="mock-tile${mark === i + 1 ? ' marked' : ''}"><span class="mock-tile-logo">${esc(t[0])}</span><span>${esc(t)}</span>${mark === i + 1 ? '<span class="mock-mark">1</span>' : ''}</div>`)
        .join('')}</div>`;
    } else if (kind === 'qr') {
      const cells = Array.from({ length: 81 }, (_, i) => {
        const x = i % 9, y = Math.floor(i / 9);
        const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
        const on = finder ? !(x % 6 === 1 && y % 6 === 1) : (x * 7 + y * 3 + x * y) % 3 === 0;
        return `<i class="${on ? 'on' : ''}"></i>`;
      }).join('');
      body = `<div class="mock-qr-wrap"><div class="mock-qr">${cells}</div><div class="mock-qr-text"><strong>Scan with Fixiam Verify</strong><span>Or enter this setup key</span><code>FXM4 Q7KD 2PLA 9WXE</code></div></div>`;
    }
    const nav = CONSOLE_NAV.map((n) => `<span class="${n === area ? 'on' : ''}">${n}</span>`).join('');
    return `<figure class="shot" data-c="Screenshot placeholder">
      <div class="shot-window" aria-hidden="true">
        <div class="shot-bar"><i></i><i></i><i></i><span class="shot-url">admin.fixiam.com/${esc(path)}</span></div>
        <div class="shot-body">
          <div class="shot-nav"><span class="shot-logo">Fixiam</span>${nav}</div>
          <div class="shot-main">
            <div class="shot-crumb">${esc(area)}${title ? ' › ' + esc(title) : ''}</div>
            <div class="shot-title">${esc(title || area)}</div>
            ${body}
            ${button ? `<div class="shot-actions"><span class="mock-btn ghost">Cancel</span><span class="mock-btn">${esc(button)}</span></div>` : ''}
          </div>
        </div>
      </div>
      <figcaption><span class="shot-tag">Screenshot placeholder</span>${caption ? esc(caption) : ''}</figcaption>
    </figure>`;
  };

  // Inline UI label, for example: Select ${ui('Save')}
  const ui = (t) => `<span class="ui-label">${t}</span>`;
  const kbd = (t) => `<kbd>${t}</kbd>`;

  FX.h = {
    esc,
    icons,
    note: callout('note', 'Note', 'info'),
    tip: callout('tip', 'Tip', 'tip'),
    warn: callout('warning', 'Warning', 'warn'),
    important: callout('important', 'Important', 'shield'),
    code,
    table,
    shot,
    ui,
    kbd,
  };
})();
