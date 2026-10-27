/* Sneak Beat storefront — vanilla JS, no build step.
   Views render into <main id="app">; overlays (bag, search, auth, menu) live in index.html. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const C = window.CONFIG;
  const P = window.PRODUCTS;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- persistence (localStorage can be missing — keep an in-memory copy) ---------- */
  const mem = {};
  const store = {
    get(k, d) {
      if (k in mem) return mem[k];
      try { const v = localStorage.getItem('sb_' + k); mem[k] = v ? JSON.parse(v) : d; } catch (e) { mem[k] = d; }
      return mem[k];
    },
    set(k, v) { mem[k] = v; try { localStorage.setItem('sb_' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- language ---------- */
  let lang = store.get('lang', null) || (navigator.language || 'en').slice(0, 2);
  if (!['en', 'ru', 'hy'].includes(lang)) lang = 'hy';
  const t = (k, vars = {}) => {
    let s = (I18N[lang] && I18N[lang][k]) ?? I18N.en[k] ?? k;
    for (const [a, b] of Object.entries(vars)) s = s.split('{' + a + '}').join(b);
    return s;
  };
  const L = obj => (obj && typeof obj === 'object') ? (obj[lang] || obj.en) : obj;

  /* ---------- money: one source for every price and fee ---------- */
  const fmt = n => n.toLocaleString('en-US').replace(/,/g, ' ') + ' ֏';
  const subtotal = () => cart().reduce((s, i) => s + byId(i.id).price * i.qty, 0);
  function deliveryFee(method, sub) {
    if (method === 'pickup') return 0;
    if (method === 'regions') return C.delivery.regionsFee;
    return sub >= C.delivery.freeOver ? 0 : C.delivery.courierFee;
  }

  /* ---------- catalogue helpers ---------- */
  const byId = id => P.find(p => p.id === id);
  const bySlug = s => P.find(p => p.slug === s);
  const siblings = p => P.filter(x => x.model === p.model);
  const genderLabel = g => t('filter.' + g);
  const subtitle = p => `${genderLabel(p.gender)} · ${t('style.' + p.style)}`;
  const pairs = n => t(n === 1 && I18N[lang]['plp.result1'] ? 'plp.result1' : 'plp.results', { n });
  const fullName = p => p.name.toLowerCase().includes(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`;
  const abc = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' });
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- state ---------- */
  const cart = () => store.get('cart', []);
  const setCart = c => { store.set('cart', c); updateBadges(); };
  const favs = () => store.get('favs', []);
  const session = () => store.get('session', null);
  const users = () => store.get('users', {});
  const orders = () => store.get('orders', []);

  /* ---------- icons ---------- */
  const I = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.5-4.6-9.2-9.4C1.6 7.4 3.8 4 7.3 4c2 0 3.5 1.1 4.7 2.7C13.2 5.1 14.7 4 16.7 4c3.5 0 5.7 3.4 4.5 6.9-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3.5l1.5 4.5-2 1.3a11 11 0 0 0 6.2 6.2l1.3-2 4.5 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/></svg>',
    tg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 4.5L3.5 11l5.5 2 2 6 3-4 4.5 3.5 2-14z"/><path d="M9 13l8-6"/></svg>',
    truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
    swap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/></svg>',
    card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19"/></svg>'
  };

  /* ================================================================
     COMPONENTS
     ================================================================ */
  function badgeOf(p) {
    if (p.badge) return `<span class="badge">${t('badge.' + p.badge)}</span>`;
    return '';
  }

  function card(p, opts = {}) {
    const sib = siblings(p);
    const isFav = favs().includes(p.id);
    const alt = p.images[1] ? `<img class="card-alt" src="${p.images[1]}" alt="" loading="lazy" decoding="async">` : '';
    return `
    <article class="card${opts.rail ? ' card--rail' : ''}" data-id="${p.id}">
      <a class="card-media" href="#/p/${p.slug}" tabindex="-1" aria-hidden="true">
        <img src="${p.images[0]}" alt="" loading="lazy" decoding="async">${alt}
      </a>
      <button class="fav-btn${isFav ? ' is-on' : ''}" data-fav="${p.id}" aria-pressed="${isFav}" aria-label="${t('pdp.fav')}: ${esc(p.name)}">${I.heart}</button>
      <div class="card-meta">
        ${badgeOf(p)}
        <h3 class="card-title"><a href="#/p/${p.slug}">${esc(fullName(p))}</a></h3>
        <p class="card-sub">${subtitle(p)}</p>
        ${sib.length > 1 ? `<p class="card-sub">${t('common.colours', { n: sib.length })}</p>` : ''}
        <p class="card-price">${fmt(p.price)}</p>
      </div>
    </article>`;
  }

  function rail(items, id) {
    return `
    <div class="rail" data-rail="${id}">
      <div class="rail-track" tabindex="0">${items.map(p => card(p, { rail: true })).join('')}</div>
      <div class="rail-ctrl">
        <button class="icon-btn" data-rail-prev aria-label="Previous">${I.arrowL}</button>
        <button class="icon-btn" data-rail-next aria-label="Next">${I.arrowR}</button>
      </div>
    </div>`;
  }

  /* ================================================================
     VIEWS
     ================================================================ */
  function Home() {
    const newest = [...P].sort((a, b) => b.added.localeCompare(a.added)).filter(uniqueModel()).slice(0, 10);
    return {
      title: `Sneak Beat — ${t('hero.eyebrow')}`,
      html: `
      ${heroFilm()}

      <section class="trust wrap" aria-label="Sneak Beat">
        <div class="trust-item">${I.shield}<span>${t('home.trust1')}</span></div>
        <div class="trust-item">${I.truck}<span>${t('home.trust2')}</span></div>
        <div class="trust-item">${I.pin}<span>${t('home.trust3')}</span></div>
        <div class="trust-item">${I.clock}<span>${t('home.trust4')}</span></div>
      </section>

      <section class="section wrap reveal">
        <header class="section-head">
          <div><h2 class="h2">${t('home.new')}</h2><p class="section-sub">${t('home.newSub')}</p></div>
          <a class="link-arrow" href="#/shop?sort=newest">${t('common.viewAll')} ${I.arrowR}</a>
        </header>
        ${rail(newest, 'new')}
      </section>

      <section class="section reveal band-sec" aria-labelledby="brands-h">
        <header class="section-head wrap"><h2 class="h2" id="brands-h">${t('home.brands')}</h2></header>
        <div class="band" data-band aria-hidden="true"></div>
        <nav class="band-list wrap" aria-label="${t('nav.brands')}">
          ${C.brands.map(b => P.some(p => p.brand === b)
            ? `<a href="#/shop?brand=${encodeURIComponent(b)}">${esc(b)}</a>`
            : `<a href="#/store" class="is-store">${esc(b)}</a>`).join('')}
        </nav>
      </section>

      <section class="story reveal" aria-labelledby="story-h">
        <div class="story-media">${C.store.images.map((src, i) => `<img src="${src}" alt="" loading="lazy" style="--i:${i}">`).join('')}</div>
        <div class="story-copy">
          <p class="eyebrow">${t('home.storyEyebrow')}</p>
          <h2 class="h1" id="story-h">${t('home.storyTitle')}</h2>
          <p>${t('home.storyText')}</p>
          <ul class="story-facts">
            <li>${I.pin}<span>${L(C.store.address)}</span></li>
            <li>${I.clock}<span>${t('store.daily')} · ${C.store.hours}</span></li>
            <li>${I.phone}<a href="tel:${C.store.phone.replace(/\s/g, '')}">${C.store.phone}</a></li>
          </ul>
          <a class="btn btn--light" href="#/store">${t('home.storyCta')}</a>
        </div>
      </section>

      <section class="section wrap reveal">
        <header class="section-head">
          <div><h2 class="h2">${t('home.feed')}</h2><p class="section-sub">${t('home.feedSub', { handle: '@' + C.instagram })}</p></div>
          <a class="link-arrow" href="https://www.instagram.com/${C.instagram}/" target="_blank" rel="noopener">${I.ig} @${C.instagram}</a>
        </header>
        <div class="feed">
          ${C.feed.filter(f => !C.store.images.includes(f.src)).map(f => `<a href="${f.url}" target="_blank" rel="noopener" class="feed-item" aria-label="Instagram"><img src="${f.src}" alt="" loading="lazy"><span class="feed-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span></a>`).join('')}
        </div>
      </section>

      <section class="alert wrap reveal" aria-labelledby="alert-h">
        <div class="alert-inner">
          <div>
            <h2 class="h2" id="alert-h">${t('home.alertTitle')}</h2>
            <p class="section-sub">${t('home.alertText')}</p>
          </div>
          <form class="alert-form" data-form="alerts" novalidate>
            <label class="field field--inline">
              <input type="email" name="email" required autocomplete="email" placeholder=" ">
              <span>${t('auth.email')}</span>
            </label>
            <button class="btn" type="submit">${t('home.alertCta')}</button>
            <p class="form-msg" aria-live="polite"></p>
          </form>
        </div>
      </section>`,
      mount() { mountFilm(); mountRails(); mountAlertForm(); mountBand($('[data-band]')); }
    };
  }

  /* ---------- hero: one quiet film, On-style ----------
     Muted looping video, headline and two buttons bottom-left, pause bottom-right.
     Reduced motion → the poster frame only. Paused while off screen. */
  function heroFilm() {
    const f = C.film;
    const d = C.drop;                                   // this week's drop, set by the SMM team in data.js
    return `
      <section class="film" aria-labelledby="hero-h">
        <video class="film-video" muted loop playsinline preload="metadata" poster="${f.poster}" aria-hidden="true" data-film>
          <source src="${f.src}" type="video/mp4">
        </video>
        <div class="film-shade" aria-hidden="true"></div>
        <div class="film-copy wrap">
          <h1 class="film-title" id="hero-h">${d ? esc(L(d.title)) : t('film.title')}</h1>
          <p class="film-sub">${d ? esc(L(d.sub)) : t('film.sub')}</p>
          <a class="btn btn--lg btn--light" href="${d ? d.link : '#/shop?sort=newest'}">${t(d ? 'film.cta' : 'hero.cta')}</a>
        </div>
        <button class="icon-btn film-toggle" type="button" data-film-toggle aria-pressed="false" aria-label="${t('film.pause')}">
          <svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>
          <svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>
        </button>
      </section>`;
  }

  function mountFilm(root = $('.film')) {
    const v = $('[data-film]', root);
    if (!root || !v) return;
    const btn = $('[data-film-toggle]', root);
    let wanted = !reduceMotion;                       // what the visitor asked for
    const sync = () => {
      root.classList.toggle('is-paused', !wanted);
      btn.setAttribute('aria-pressed', !wanted);
      btn.setAttribute('aria-label', t(wanted ? 'film.pause' : 'film.play'));
    };
    const play = () => { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); };
    btn.addEventListener('click', () => { wanted = !wanted; wanted ? play() : v.pause(); sync(); });
    const io = new IntersectionObserver(([en]) => { en.isIntersecting && wanted ? play() : v.pause(); });
    io.observe(root);
    if (wanted) { v.preload = 'auto'; play(); }
    sync();
    cleanup.push(() => { io.disconnect(); v.pause(); });
  }

  /* ---------- curved brand band ----------
     Ported from the "tilted grid hero" idea to plain JS. One row of logo cards runs right to left round the inside
     of a cylinder: flat in the centre, curling toward you at the ends, fading out. A card can't bend, so each is cut
     into SLICES vertical strips, each a flat facet turned its own few degrees round the cylinder's axis; the card
     (preserve-3d) is what moves, one rotateY carrying it along the arc. Transform-only, so it runs on the compositor.
     Unlike the original it is clickable: cards link to brand pages, and the band keeps swinging under the pointer / finger. */
  const BAND = { SLICES: 14, CAMERA: 1.6, MAX_WIDTH: 46, MAX_WIDTH_PHONE: 62, speed: 4, tileHeight: 46, aspect: 1.5, gap: 9, axis: 52, curve: 66, fade: 11 };
  const arc = bend => (BAND.CAMERA - 1 + Math.cos(bend)) / (2 * BAND.CAMERA * Math.sin(bend));
  // a card may be at most this share of the band's width — wider on phones so the cards fill the full-screen section
  const bandMaxWidth = width => width < 640 ? BAND.MAX_WIDTH_PHONE : BAND.MAX_WIDTH;
  function bandLayout(width, height) {
    const { tileHeight, aspect, gap } = BAND, MAX_WIDTH = bandMaxWidth(width), bend = BAND.curve * Math.PI / 180;
    const h = Math.min(tileHeight / 100 * height, MAX_WIDTH / 100 * width / aspect);
    const radius = width * arc(bend);
    if (!(h > 0) || !(radius > 0)) return null;
    const deg = r => r * 180 / Math.PI;
    const unit = deg(h / radius), pitch = (aspect + gap / 100) * unit, limit = deg(bend) + aspect * unit / 2;
    const columns = Math.min(40, Math.max(2, Math.ceil(2 * limit / pitch)));
    const round = n => +n.toFixed(4);
    const sweep = round(columns * pitch / 2);
    return { columns, sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
  }
  let bandSeq = 0;
  function mountBand(root) {
    if (!root) return;
    const brands = C.brands.filter(b => C.logos[b]);
    const href = b => P.some(p => p.brand === b) ? '#/shop?brand=' + encodeURIComponent(b) : '#/store';
    const id = 'sbband' + (++bandSeq);
    const { SLICES, CAMERA, speed, tileHeight, aspect, axis, fade } = BAND;
    const r = 100 * arc(BAND.curve * Math.PI / 180);
    const radius = `${+r.toFixed(3)}cqw`;
    const turn = d => `translateZ(${radius}) rotateY(${+d.toFixed(4)}deg) translateZ(-${radius})`;
    const share = aspect / SLICES;
    const logo = b => { const l = C.logos[b]; return `<img src="${l.src}" alt="" draggable="false" class="band-logo" style="width:${l.w}%">`; };
    let current = '', ro;

    const build = () => {
      const L = bandLayout(root.clientWidth, root.clientHeight);
      if (!L) return;
      const maxW = bandMaxWidth(root.clientWidth);
      const u = n => `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(maxW / aspect).toFixed(4)}cqw))`;
      const key = `${L.columns}|${L.sweep}|${L.unit}`;
      if (key === current) return;
      current = key;
      const { columns, sweep, unit, limit } = L;
      const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
      const duration = columns * speed;
      const css = `@keyframes ${id}{from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
        `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
        `.${id}{animation:${id} ${duration}s linear infinite}`;
      const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)`;
      root.innerHTML = `<style>${css}</style>
        <div class="band-stage" style="perspective:${+(r * CAMERA).toFixed(3)}cqw;perspective-origin:50% ${axis}%;-webkit-mask-image:${mask};mask-image:${mask}">
          ${Array.from({ length: columns }, (_, t) => {
            const first = columns - 1 - t, b = brands[first % brands.length];
            return `<a class="band-tile ${id}" href="${href(b)}" tabindex="-1" data-t="${t}" data-first="${first}"
              style="left:calc(50% - ${u(aspect / 2)});top:calc(${axis}% - ${u(0.5)});width:${u(aspect)};height:${u(1)};animation-delay:${-t * speed}s">
              ${Array.from({ length: SLICES }, (_, k) => `<span class="band-slice${k === 0 ? ' is-first' : ''}${k === SLICES - 1 ? ' is-last' : ''}"
                style="left:${u((aspect - share) / 2)};width:${k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`};height:${u(1)};transform:${turn((aspect / 2 - (k + 0.5) * share) * unit)}">
                <span class="band-face" style="left:${u(-k * share)};width:${u(aspect)};height:${u(1)}">${logo(b)}</span></span>`).join('')}
            </a>`; }).join('')}
        </div>`;
      // a card takes the next brand each time it wraps — always off-screen, so nothing swaps in view
      $$('.band-tile', root).forEach(tile => tile.addEventListener('animationiteration', e => {
        const lap = Math.round(e.elapsedTime / duration);
        const b = brands[(lap * columns + +tile.dataset.first) % brands.length];
        if (tile.dataset.brand === b) return;
        tile.dataset.brand = b;
        tile.href = href(b);
        $$('.band-face', tile).forEach(f => { f.innerHTML = logo(b); });
      }));
      root.classList.add('is-ready');
    };

    for (const b of brands) new Image().src = C.logos[b].src;
    build();
    ro = new ResizeObserver(() => build());
    ro.observe(root);
    cleanup.push(() => { ro.disconnect(); });
  }

  function uniqueModel() { const seen = new Set(); return p => !seen.has(p.model) && seen.add(p.model); }

  /* ---------- Shop / PLP ---------- */
  const PRICE_BANDS = [[0, 40000], [40000, 60000], [60000, 80000], [80000, Infinity]];
  const priceLabel = ([a, b]) => a === 0 ? t('filter.under', { amount: fmt(b) }) : b === Infinity ? t('filter.over', { amount: fmt(a) }) : t('filter.between', { a: fmt(a), b: fmt(b) });

  function readFilters(q) {
    const list = k => (q.get(k) || '').split(',').filter(Boolean);
    return { gender: list('gender'), brand: list('brand'), size: list('size'), color: list('color'), style: list('style'), price: list('price'), sort: q.get('sort') || 'featured', q: q.get('q') || '' };
  }
  function applyFilters(f) {
    let r = P.filter(p =>
      (!f.gender.length || f.gender.includes(p.gender) || (p.gender === 'unisex' && f.gender.length)) &&
      (!f.brand.length || f.brand.includes(p.brand)) &&
      (!f.size.length || f.size.some(s => (p.sizes[s] || 0) > 0)) &&
      (!f.color.length || f.color.includes(p.color)) &&
      (!f.style.length || f.style.includes(p.style)) &&
      (!f.price.length || f.price.some(i => { const [a, b] = PRICE_BANDS[i]; return p.price >= a && p.price < b; })) &&
      (!f.q || matches(p, f.q)));
    const s = { newest: (a, b) => b.added.localeCompare(a.added), priceAsc: (a, b) => a.price - b.price, priceDesc: (a, b) => b.price - a.price }[f.sort];
    if (s) r = [...r].sort(s);
    return r;
  }
  function matches(p, q) {
    const hay = `${fullName(p)} ${p.colorway} ${p.color} ${p.style} ${p.gender} ${p.sku}`.toLowerCase();
    return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
  }
  function filterQS(f) {
    const q = new URLSearchParams();
    for (const k of ['gender', 'brand', 'size', 'color', 'style', 'price']) if (f[k].length) q.set(k, f[k].join(','));
    if (f.sort !== 'featured') q.set('sort', f.sort);
    if (f.q) q.set('q', f.q);
    return q.toString();
  }

  function Shop(q) {
    const f = readFilters(q);
    const headingOf = f => f.q ? `“${esc(f.q)}”` : f.gender.length === 1 ? t('nav.' + f.gender[0]) : f.brand.length === 1 ? esc(f.brand[0]) : f.sort === 'newest' ? t('nav.new') : t('nav.shopAll');
    const heading = f.q ? `“${esc(f.q)}”` : f.gender.length === 1 ? t('nav.' + f.gender[0]) : f.brand.length === 1 ? esc(f.brand[0]) : f.sort === 'newest' ? t('nav.new') : t('nav.shopAll');
    return {
      title: `${heading.replace(/[“”]/g, '')} — Sneak Beat`,
      html: `
      <div data-brand-hero></div>
      <div class="plp wrap" data-filters-open="${matchMedia('(min-width: 1024px)').matches}">
        <div data-brand-head></div>
        <div class="plp-bar">
          <h1 class="h2 plp-title">${heading} <span class="plp-count" data-count></span></h1>
          <div class="plp-tools">
            <button class="tool-btn" data-toggle-filters><span class="when-open">${t('plp.hideFilters')}</span><span class="when-closed">${t('plp.showFilters')}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg></button>
            <label class="tool-btn select-wrap"><span>${t('plp.sort')}:</span>
              <select data-sort aria-label="${t('plp.sort')}">
                ${['featured', 'newest', 'priceAsc', 'priceDesc'].map(s => `<option value="${s}"${f.sort === s ? ' selected' : ''}>${t('sort.' + s)}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
        <div class="chips" data-chips></div>
        <div class="plp-body">
          <aside class="filters" aria-label="${t('plp.showFilters')}">
            <div class="filters-head"><span class="h3">${t('plp.showFilters')}</span><button class="icon-btn" data-close-filters aria-label="${t('common.close')}">${I.close}</button></div>
            <div class="filters-scroll" data-facets></div>
            <div class="filters-foot">
              <button class="btn btn--secondary" data-clear>${t('filter.clear')}</button>
              <button class="btn" data-close-filters data-apply></button>
            </div>
          </aside>
          <div class="filters-scrim" data-close-filters></div>
          <section class="grid" data-grid aria-live="polite"></section>
        </div>
        <div data-brand-foot></div>
      </div>`,
      mount() {
        let state = f, heroOf = null;
        const root = $('.plp');
        const draw = () => {
          const items = applyFilters(state);
          const brandMode = state.brand.length === 1 && !state.q;
          const b = brandMode ? state.brand[0] : null;
          if (b !== heroOf) {
            heroOf = b;
            const hero = $('[data-brand-hero]');
            hero.innerHTML = b ? brandHero(b) : '';
            if ($('[data-film]', hero)) mountFilm($('.film', hero));
            $('[data-brand-foot]').innerHTML = b ? brandFoot(b) : '';
          }
          $('[data-brand-head]').innerHTML = brandMode ? brandHead(state.brand[0]) : '';
          root.classList.toggle('is-brand', brandMode);
          $('.plp-title').firstChild.textContent = (brandMode ? pairs(items.length) : headingOf(state).replace(/&amp;/g, '&')) + ' ';
          $('[data-count]').textContent = brandMode ? '' : `(${items.length})`;
          $('[data-apply]').textContent = t('filter.apply', { n: items.length });
          $('[data-grid]').innerHTML = items.length
            ? items.map(p => card(p)).join('')
            : `<div class="empty"><p>${t('plp.empty')}</p><button class="btn" data-clear>${t('plp.emptyCta')}</button></div>`;
          $('[data-facets]').innerHTML = facetsHTML(state);
          $('[data-chips]').innerHTML = chipsHTML(state);
          history.replaceState(null, '', '#/shop' + (filterQS(state) ? '?' + filterQS(state) : ''));
        };
        const toggle = (k, v) => {
          const s = { ...state, [k]: state[k].includes(v) ? state[k].filter(x => x !== v) : [...state[k], v] };
          state = s; draw();
        };
        root.addEventListener('click', e => {
          const fb = e.target.closest('[data-facet]');
          if (fb) { toggle(fb.dataset.facet, fb.dataset.value); return; }
          const chip = e.target.closest('[data-chip]');
          if (chip) { toggle(chip.dataset.chip, chip.dataset.value); return; }
          if (e.target.closest('[data-clear]')) { state = { ...state, gender: [], brand: [], size: [], color: [], style: [], price: [], q: '' }; draw(); return; }
          if (e.target.closest('[data-toggle-filters]')) { root.dataset.filtersOpen = root.dataset.filtersOpen !== 'true'; lockScroll(root.dataset.filtersOpen === 'true' && innerWidth < 1024); return; }
          if (e.target.closest('[data-close-filters]')) { root.dataset.filtersOpen = 'false'; lockScroll(false); }
        });
        $('[data-sort]').addEventListener('change', e => { state = { ...state, sort: e.target.value }; draw(); });
        draw();
      }
    };
  }

  // Gender has no counts: unisex pairs belong to both Men and Women, so the numbers would add up to more
  // than the catalogue (Nike shows none here either). Brand, size, colour and price counts stay.
  /* brand page, Nike / END. style: a wide brand photo (or quiet film) edge to edge under the header, with the name,
     one line and quick links bottom-left in white. Set `hero` per brand in data.js; brands without one keep the
     text header with the store's Instagram photo beside it. */
  const bhLinks = b => {
    const enc = encodeURIComponent(b);
    return `<div class="bh-links">
            <a class="chip" href="#/shop?brand=${enc}&sort=newest">${t('nav.new')}</a>
            <a class="chip" href="#/shop?brand=${enc}&gender=men">${t('nav.men')}</a>
            <a class="chip" href="#/shop?brand=${enc}&gender=women">${t('nav.women')}</a>
          </div>`;
  };
  function brandHero(b) {
    const info = C.brandInfo[b] || {}, h = info.hero;
    if (!h) return '';
    const pos = `--pos:${h.pos || '50% 50%'};--pos-phone:${h.posPhone || h.pos || '50% 50%'}`;
    return `
      <section class="film film--brand${h.light ? ' film--light' : ''}" aria-labelledby="bh-name">
        ${h.video
          ? `<video class="film-video" muted loop playsinline preload="metadata" poster="${h.image}" aria-hidden="true" data-film style="${pos}"><source src="${h.video}" type="video/mp4"></video>`
          : `<img class="film-video" src="${h.image}" alt="" style="${pos}">`}
        <div class="film-shade" aria-hidden="true"></div>
        <div class="film-copy wrap bh-copy">
          <p class="eyebrow">${t('brand.eyebrow')}</p>
          <h1 class="bh-name" id="bh-name">${esc(b)}</h1>
          <p class="bh-story">${esc(L(info.story) || '')}</p>
          ${bhLinks(b)}
        </div>
        ${h.video ? `<button class="icon-btn film-toggle" type="button" data-film-toggle aria-pressed="false" aria-label="${t('film.pause')}">
          <svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>
          <svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>
        </button>` : ''}
      </section>`;
  }
  // with a wide photo on top, the store's own Instagram photo moves below the products
  function brandFoot(b) {
    const info = C.brandInfo[b] || {};
    if (!info.hero || !info.image) return '';
    return `
      <a class="bf" href="${info.post || 'https://www.instagram.com/' + C.instagram + '/'}" target="_blank" rel="noopener">
        <img src="${info.image}" alt="" loading="lazy">
        <span class="bf-copy"><span class="bf-ig">${I.ig}</span><span class="h3">${t('brand.seen', { handle: '@' + C.instagram })}</span></span>
      </a>`;
  }
  function brandHead(b) {
    const info = C.brandInfo[b] || {};
    const listed = C.brands.filter(x => P.some(p => p.brand === x));
    const switcher = `
      <nav class="brand-switch" aria-label="${t('nav.brands')}">
        ${listed.map(x => `<a href="#/shop?brand=${encodeURIComponent(x)}" class="${x === b ? 'is-on' : ''}" ${x === b ? 'aria-current="page"' : ''}>${esc(x)}</a>`).join('')}
      </nav>`;
    if (info.hero) return switcher;
    return `
      <header class="bh${info.image ? '' : ' bh--text'}">
        <div class="bh-copy">
          <p class="eyebrow">${t('brand.eyebrow')}</p>
          <h1 class="bh-name">${esc(b)}</h1>
          <p class="bh-story">${esc(L(info.story) || '')}</p>
          ${bhLinks(b)}
        </div>
        ${info.image ? `<a class="bh-media" href="${info.post || 'https://www.instagram.com/' + C.instagram + '/'}" target="_blank" rel="noopener">
          <img src="${info.image}" alt="">
          <span class="bh-cap">${I.ig}<span class="cap-long">${t('brand.seen', { handle: '@' + C.instagram })}</span><span class="cap-short">@${C.instagram}</span></span>
        </a>` : ''}
      </header>${switcher}`;
  }

  function facetsHTML(f) {
    const count = (k, v) => applyFilters({ ...f, [k]: [v] }).length;
    const group = (k, title, opts, kind = 'check') => `
      <details class="facet" ${f[k].length || ['gender', 'brand', 'size'].includes(k) ? 'open' : ''}>
        <summary>${title}${f[k].length ? ` <span class="facet-n">(${f[k].length})</span>` : ''}</summary>
        <div class="facet-opts facet-opts--${kind}">
          ${opts.map(o => {
            const on = f[k].includes(String(o.value));
            if (kind === 'size') return `<button class="size-opt${on ? ' is-on' : ''}" data-facet="${k}" data-value="${o.value}" aria-pressed="${on}">${o.label}</button>`;
            if (kind === 'swatch') return `<button class="swatch-opt${on ? ' is-on' : ''}" data-facet="${k}" data-value="${o.value}" aria-pressed="${on}"><span class="swatch" style="--c:${o.hex}"></span>${o.label}</button>`;
            return `<button class="check-opt${on ? ' is-on' : ''}" data-facet="${k}" data-value="${o.value}" role="checkbox" aria-checked="${on}"><span class="box">${I.check}</span>${o.label}${k === 'gender' ? '' : `<span class="n">${count(k, String(o.value))}</span>`}</button>`;
          }).join('')}
        </div>
      </details>`;
    const brands = [...new Set(P.map(p => p.brand))].sort(abc);
    const styles = [...new Set(P.map(p => p.style))];
    const colors = C.colors.filter(c => P.some(p => p.color === c.value));
    return [
      group('gender', t('filter.gender'), ['men', 'women', 'unisex'].filter(g => P.some(p => p.gender === g)).map(g => ({ value: g, label: t('filter.' + g) }))),
      group('brand', t('filter.brand'), brands.map(b => ({ value: b, label: esc(b) }))),
      group('size', t('filter.size'), C.sizeRange.map(s => ({ value: s, label: s })), 'size'),
      group('price', t('filter.price'), PRICE_BANDS.map((b, i) => ({ value: String(i), label: priceLabel(b) }))),
      group('color', t('filter.colour'), colors.map(c => ({ value: c.value, label: L(c.label), hex: c.hex })), 'swatch'),
      group('style', t('filter.style'), styles.map(s => ({ value: s, label: t('style.' + s) })))
    ].join('');
  }
  function chipsHTML(f) {
    const chips = [];
    for (const k of ['gender', 'brand', 'size', 'price', 'color', 'style']) for (const v of f[k]) {
      const label = k === 'gender' ? t('filter.' + v) : k === 'size' ? 'EU ' + v : k === 'price' ? priceLabel(PRICE_BANDS[v]) : k === 'color' ? L(C.colors.find(c => c.value === v)?.label) : k === 'style' ? t('style.' + v) : v;
      chips.push(`<button class="chip" data-chip="${k}" data-value="${esc(v)}">${esc(label)} ${I.close}</button>`);
    }
    if (chips.length > 1) chips.push(`<button class="chip chip--clear" data-clear>${t('filter.clear')}</button>`);
    return chips.join('');
  }

  /* ---------- Product / PDP ---------- */
  function PDP(slug) {
    const p = bySlug(slug);
    if (!p) return NotFound();
    const sib = siblings(p);
    const isFav = favs().includes(p.id);
    const sizes = Object.entries(p.sizes);
    const related = P.filter(x => x.model !== p.model && (x.style === p.style || x.brand === p.brand)).filter(uniqueModel()).slice(0, 8);
    const model = C.models[p.model] || {};
    return {
      title: `${fullName(p)} — Sneak Beat`,
      html: `
      <nav class="crumbs wrap" aria-label="Breadcrumb">
        <a href="#/shop">${t('nav.shopAll')}</a><span>/</span><a href="#/shop?brand=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a><span>/</span><span aria-current="page">${esc(p.name)}</span>
      </nav>
      <div class="pdp wrap">
        <div class="gallery" data-gallery>
          <div class="thumbs" role="tablist">
            ${p.images.map((src, i) => `<button class="thumb${i ? '' : ' is-on'}" role="tab" aria-selected="${!i}" data-thumb="${i}"><img src="${src}" alt=""></button>`).join('')}
          </div>
          <div class="stage">
            <div class="stage-track" data-track>
              ${p.images.map((src, i) => `<figure class="slide"><img src="${src}" alt="${esc(fullName(p))} — ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} data-zoom="${i}"></figure>`).join('')}
            </div>
            ${p.images.length > 1 ? `
            <button class="icon-btn stage-prev" data-step="-1" aria-label="Previous image">${I.arrowL}</button>
            <button class="icon-btn stage-next" data-step="1" aria-label="Next image">${I.arrowR}</button>
            <span class="stage-count" data-count>1 / ${p.images.length}</span>` : ''}
          </div>
        </div>

        <div class="buy">
          <div class="buy-sticky">
            ${badgeOf(p)}
            <h1 class="h2 buy-title">${esc(fullName(p))}</h1>
            <p class="buy-sub">${subtitle(p)}</p>
            <p class="buy-price">${fmt(p.price)}</p>

            ${sib.length > 1 ? `
            <div class="ways" aria-label="${t('pdp.colour')}">
              ${sib.map(s => `<a class="way${s.id === p.id ? ' is-on' : ''}" href="#/p/${s.slug}" aria-label="${esc(s.colorway)}" ${s.id === p.id ? 'aria-current="true"' : ''}><img src="${s.images[0]}" alt=""></a>`).join('')}
            </div>` : ''}

            <fieldset class="sizes-pick" data-sizes>
              <legend><span>${t('pdp.selectSize')}</span><button type="button" class="link" data-size-guide>${t('pdp.sizeGuide')}</button></legend>
              <div class="size-grid">
                ${sizes.map(([s, n]) => `<button type="button" class="size-btn" data-size="${s}" ${n > 0 ? '' : 'data-out="true"'} aria-pressed="false">EU ${s}</button>`).join('')}
              </div>
              <p class="size-msg" data-size-msg aria-live="polite"></p>
            </fieldset>

            <div class="buy-actions">
              <button class="btn btn--lg btn--block" data-add>${t('pdp.add')}</button>
              <button class="btn btn--lg btn--block btn--secondary fav-big${isFav ? ' is-on' : ''}" data-fav="${p.id}" aria-pressed="${isFav}">${t(isFav ? 'pdp.faved' : 'pdp.fav')} ${I.heart}</button>
            </div>
            <p class="reassure">${t('pdp.reassure')}</p>

            <div class="acc">
              <details open><summary>${t('pdp.details')}</summary>
                <div class="acc-body">
                  <p>${esc(L(model.desc) || '')}</p>
                  <ul class="specs">
                    <li><span>${t('pdp.colour')}</span><span>${esc(p.colorway)}</span></li>
                    <li><span>${t('pdp.style')}</span><span>${esc(p.sku)}</span></li>
                  </ul>
                </div>
              </details>
              <details><summary>${t('pdp.delivery')}</summary><div class="acc-body"><p>${t('pdp.deliveryText', { fee: fmt(C.delivery.courierFee), amount: fmt(C.delivery.freeOver), dphone: `<a href="tel:${C.store.deliveryPhone.replace(/\s/g, '')}">${C.store.deliveryPhone}</a>` })}</p></div></details>
              <details><summary>${t('pdp.fit')}</summary><div class="acc-body"><p>${t('pdp.fitText')}</p><button class="link" data-size-guide>${t('pdp.sizeGuide')}</button></div></details>
              <details><summary>${t('pdp.reviews')}</summary>
                <!-- Review slot: render real reviews here (name, date, size bought, text). Never placeholder stars. -->
                <div class="acc-body"><p>${t('pdp.reviewsEmpty')}</p></div>
              </details>
            </div>
          </div>
        </div>
      </div>

      ${related.length ? `
      <section class="section wrap reveal">
        <header class="section-head"><h2 class="h2">${t('pdp.also')}</h2></header>
        ${rail(related, 'also')}
      </section>` : ''}

      <div class="sticky-buy" data-sticky aria-hidden="true">
        <span class="pic sticky-pic"><img src="${p.images[0]}" alt=""></span>
        <div class="sticky-info"><strong>${esc(p.name)}</strong><span data-sticky-sel>${fmt(p.price)}</span></div>
        <button class="btn" data-add tabindex="-1">${t('pdp.addShort')}</button>
      </div>`,
      mount() { mountPDP(p); mountRails(); }
    };
  }

  function mountPDP(p) {
    let size = null;
    const addBtns = $$('[data-add]');
    const msg = $('[data-size-msg]');
    const label = () => size ? `${t('pdp.add')} · EU ${size}` : t('pdp.add');

    $('[data-sizes]').addEventListener('click', e => {
      const b = e.target.closest('[data-size]');
      if (!b) return;
      if (b.dataset.out) {
        msg.innerHTML = `${t('pdp.soldOut')} — <button class="link" data-notify="${b.dataset.size}">${t('pdp.notify')}</button>`;
        msg.classList.remove('is-error');
        return;
      }
      $$('.size-btn').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
      size = b.dataset.size;
      $('[data-sizes]').classList.remove('is-error');
      msg.textContent = ''; msg.classList.remove('is-error');
      addBtns.forEach(a => a.textContent = a.closest('[data-sticky]') ? t('pdp.addShort') : label());
      $('[data-sticky-sel]').textContent = `EU ${size} · ${fmt(p.price)}`;
    });
    msg.addEventListener('click', e => {
      const n = e.target.closest('[data-notify]');
      if (!n) return;
      const s = session();
      if (s) { msg.textContent = t('pdp.notifyDone', { size: n.dataset.notify }); return; }
      openAuth(() => { msg.textContent = t('pdp.notifyDone', { size: n.dataset.notify }); });
    });

    addBtns.forEach(btn => btn.addEventListener('click', () => {
      if (!size) {
        const fs = $('[data-sizes]');
        fs.classList.remove('is-error'); void fs.offsetWidth; fs.classList.add('is-error');
        msg.textContent = t('pdp.sizeError'); msg.classList.add('is-error');
        if (btn.closest('[data-sticky]')) fs.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      addToCart(p.id, size);
      const img = $('.slide img') || $('.sticky-buy .pic img');
      flyToBag(btn.closest('[data-sticky]') ? $('.sticky-buy .pic img') : img).then(() => openBag(p.id));
    }));

    // gallery
    const track = $('[data-track]');
    const count = $('[data-count]');
    const go = i => {
      const n = p.images.length;
      i = (i + n) % n;
      track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    let cur = 0;
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i === cur) return;
      cur = i;
      if (count) count.textContent = `${i + 1} / ${p.images.length}`;
      $$('.thumb').forEach((th, j) => { th.classList.toggle('is-on', j === i); th.setAttribute('aria-selected', j === i); });
    }, { passive: true });
    $('[data-gallery]').addEventListener('click', e => {
      const th = e.target.closest('[data-thumb]'); if (th) go(+th.dataset.thumb);
      const st = e.target.closest('[data-step]'); if (st) go(cur + +st.dataset.step);
      const z = e.target.closest('[data-zoom]'); if (z && innerWidth >= 768) openZoom(p, +z.dataset.zoom);
    });
    $$('.thumb').forEach(th => th.addEventListener('mouseenter', () => go(+th.dataset.thumb)));

    // sticky add-to-bag: only when the inline button has left the viewport, mobile only
    const sticky = $('[data-sticky]');
    const inline = $('.buy-actions');
    const io = new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0 && innerWidth < 768;
      sticky.classList.toggle('is-on', show);
      sticky.setAttribute('aria-hidden', !show);
      $('button', sticky).tabIndex = show ? 0 : -1;
    });
    io.observe(inline);
    cleanup.push(() => io.disconnect());
  }

  function openZoom(p, i) {
    const z = $('#zoom');
    z.innerHTML = `<button class="icon-btn zoom-close" data-close aria-label="${t('common.close')}">${I.close}</button>
      <div class="zoom-track">${p.images.map(src => `<img src="${src}" alt="">`).join('')}</div>`;
    openLayer(z);
    requestAnimationFrame(() => { const tr = $('.zoom-track', z); tr.scrollTop = i * tr.clientHeight; });
  }

  /* ---------- Checkout ---------- */
  function Checkout() {
    const items = cart();
    if (!items.length) { location.hash = '#/shop'; return { html: '' }; }
    const s = session();
    const u = s ? users()[s] : null;
    return {
      title: `${t('ck.title')} — Sneak Beat`,
      html: `
      <div class="ck wrap">
        <form class="ck-form" novalidate data-ck>
          <h1 class="h2">${t('ck.title')}</h1>
          ${s ? '' : `<p class="ck-guest">${t('ck.guest')} <button type="button" class="link" data-signin>${t('ck.signin')}</button></p>`}

          <fieldset class="ck-step"><legend class="h3">${t('ck.contact')}</legend>
            <div class="row2">
              ${field('first', t('ck.first'), 'text', u?.first, 'given-name')}
              ${field('last', t('ck.last'), 'text', u?.last, 'family-name')}
            </div>
            ${field('email', t('ck.email'), 'email', s || '', 'email')}
            ${field('phone', t('ck.phone'), 'tel', u?.phone || '+374 ', 'tel')}
          </fieldset>

          <fieldset class="ck-step"><legend class="h3">${t('ck.delivery')}</legend>
            <div class="opts">
              ${opt('ship', 'courier', t('ck.courier'), t('ck.courierSub'), true)}
              ${opt('ship', 'regions', t('ck.regions'), t('ck.regionsSub'))}
              ${opt('ship', 'pickup', t('ck.pickup'), t('ck.pickupSub'))}
            </div>
            <div class="addr" data-addr>
              ${field('address', t('ck.address'), 'text', '', 'street-address')}
              <div class="row2">
                ${field('apt', t('ck.apt'), 'text', '', 'address-line2', false)}
                ${field('city', t('ck.city'), 'text', lang === 'hy' ? 'Երևան' : lang === 'ru' ? 'Ереван' : 'Yerevan', 'address-level2')}
              </div>
              ${field('note', t('ck.note'), 'text', '', 'off', false)}
            </div>
            <div class="pickup-note" data-pickup hidden>${I.pin}<span>${L(C.store.address)} · ${C.store.hours}</span></div>
          </fieldset>

          <fieldset class="ck-step"><legend class="h3">${t('ck.payment')}</legend>
            <div class="opts">
              ${opt('pay', 'card', t('ck.card'), t('ck.cardSub'), true)}
              ${opt('pay', 'idram', t('ck.idram'), t('ck.idramSub'))}
              ${opt('pay', 'telcell', t('ck.telcell'), t('ck.telcellSub'))}
              ${opt('pay', 'cod', t('ck.cod'), t('ck.codSub'))}
            </div>
          </fieldset>

          <label class="check"><input type="checkbox" name="marketing"><span class="box">${I.check}</span>${t('ck.marketing')}</label>
          <button class="btn btn--lg btn--block" type="submit" data-place></button>
          <p class="fine">${t('ck.terms')}</p>
        </form>

        <aside class="ck-summary">
          <div class="ck-summary-in">
            <h2 class="h3">${t('ck.summary')}</h2>
            <ul class="ck-items">
              ${items.map(i => { const p = byId(i.id); return `
              <li><span class="pic"><img src="${p.images[0]}" alt=""></span><div><strong>${esc(fullName(p))}</strong><span>${t('bag.size', { size: 'EU ' + i.size })} · ${t('bag.qty')} ${i.qty}</span></div><span>${fmt(p.price * i.qty)}</span></li>`; }).join('')}
            </ul>
            <dl class="totals" data-totals></dl>
            <p class="fine">${t('bag.returns')}</p>
          </div>
        </aside>
      </div>`,
      mount: mountCheckout
    };
  }
  function field(name, label, type, value = '', ac = 'on', required = true) {
    return `<label class="field"><input name="${name}" type="${type}" value="${esc(value || '')}" placeholder=" " autocomplete="${ac}" ${required ? 'required' : ''} ${type === 'tel' ? 'inputmode="tel"' : ''}><span>${label}</span><em class="err" aria-live="polite"></em></label>`;
  }
  function opt(group, value, title, sub, checked) {
    return `<label class="opt"><input type="radio" name="${group}" value="${value}" ${checked ? 'checked' : ''}><span class="opt-dot"></span><span class="opt-txt"><strong>${title}</strong><span>${sub}</span></span><span class="opt-price" data-fee="${group === 'ship' ? value : ''}"></span></label>`;
  }

  function mountCheckout() {
    const form = $('[data-ck]');
    if (!form) return;
    const sub = subtotal();
    const update = () => {
      const ship = form.ship.value;
      const fee = deliveryFee(ship, sub);
      $$('[data-fee]', form).forEach(el => { if (el.dataset.fee) { const f = deliveryFee(el.dataset.fee, sub); el.textContent = f ? fmt(f) : t('bag.free'); } });
      $('[data-addr]').hidden = ship === 'pickup';
      $('[data-pickup]').hidden = ship !== 'pickup';
      $$('[data-addr] input[name=address], [data-addr] input[name=city]').forEach(i => i.required = ship !== 'pickup');
      $('[data-totals]').innerHTML = `<div><dt>${t('bag.subtotal')}</dt><dd>${fmt(sub)}</dd></div><div><dt>${t('bag.delivery')}</dt><dd>${fee ? fmt(fee) : t('bag.free')}</dd></div><div class="grand"><dt>${t('bag.total')}</dt><dd>${fmt(sub + fee)}</dd></div>`;
      $('[data-place]').textContent = t('ck.place', { total: fmt(sub + fee) });
    };
    form.addEventListener('change', update);
    update();
    const validate = input => {
      const err = input.parentElement.querySelector('.err');
      let m = '';
      const v = input.value.trim();
      if (input.required && (!v || (input.type === 'tel' && v.replace(/\D/g, '').length < 3))) m = t('ck.required');
      else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = t('ck.invalidEmail');
      else if (input.type === 'tel' && v && v.replace(/\D/g, '').length < 8) m = t('ck.invalidPhone');
      if (err) err.textContent = m;
      input.parentElement.classList.toggle('is-error', !!m);
      input.setAttribute('aria-invalid', !!m);
      return !m;
    };
    form.addEventListener('focusout', e => { if (e.target.matches('.field input') && e.target.value) validate(e.target); });
    form.addEventListener('input', e => { if (e.target.closest('.is-error')) validate(e.target); });
    $('[data-signin]', form)?.addEventListener('click', () => openAuth(() => render()));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = $$('.field input', form).filter(i => !$('[data-addr]').hidden || !i.closest('[data-addr]')).filter(i => !validate(i));
      if (bad.length) { bad[0].focus(); return; }
      const btn = $('[data-place]');
      btn.disabled = true; btn.classList.add('is-loading');
      const fd = new FormData(form);
      const fee = deliveryFee(fd.get('ship'), sub);
      const order = {
        id: 'SB-' + String(Date.now()).slice(-6), date: new Date().toISOString(), email: fd.get('email').trim(),
        name: fd.get('first').trim(), phone: fd.get('phone').trim(), ship: fd.get('ship'), pay: fd.get('pay'),
        items: cart(), subtotal: sub, fee, total: sub + fee
      };
      // Prototype: here the real build posts the order to the backend and, for card/Idram/Telcell, redirects to the provider.
      setTimeout(() => {
        store.set('orders', [order, ...orders()]);
        setCart([]);
        location.hash = '#/order/' + order.id;
      }, 900);
    });
  }

  function OrderDone(id) {
    const o = orders().find(x => x.id === id);
    if (!o) return NotFound();
    return {
      title: `${o.id} — Sneak Beat`,
      html: `
      <section class="done wrap">
        <span class="done-mark">${I.check}</span>
        <h1 class="h1">${t('ck.doneTitle', { name: esc(o.name) })}</h1>
        <p class="lede">${t('ck.doneText', { id: `<strong>${o.id}</strong>`, phone: esc(o.phone) })}</p>
        <ul class="ck-items done-items">
          ${o.items.map(i => { const p = byId(i.id); return `<li><span class="pic"><img src="${p.images[0]}" alt=""></span><div><strong>${esc(fullName(p))}</strong><span>${t('bag.size', { size: 'EU ' + i.size })} · ${t('bag.qty')} ${i.qty}</span></div><span>${fmt(p.price * i.qty)}</span></li>`; }).join('')}
        </ul>
        <dl class="totals"><div class="grand"><dt>${t('bag.total')}</dt><dd>${fmt(o.total)}</dd></div></dl>
        <a class="btn btn--lg" href="#/shop?sort=newest">${t('ck.doneCta')}</a>
      </section>`
    };
  }

  /* ---------- Favourites / Account / Store ---------- */
  function Favorites() {
    const list = favs().map(byId).filter(Boolean);
    return {
      title: `${t('fav.title')} — Sneak Beat`,
      html: `
      <section class="page wrap">
        <h1 class="h1">${t('fav.title')}</h1>
        ${session() ? '' : `<p class="lede">${t('fav.signin')} <button class="link" data-open-auth>${t('auth.signin')}</button></p>`}
        ${list.length ? `<div class="grid grid--full">${list.map(p => card(p)).join('')}</div>` : `<div class="empty"><p>${t('fav.empty')}</p><a class="btn" href="#/shop?sort=newest">${t('bag.emptyCta')}</a></div>`}
      </section>`
    };
  }

  function Account(tab = 'orders') {
    const s = session();
    if (!s) { setTimeout(() => openAuth(() => render()), 0); return Favorites(); }
    const u = users()[s];
    const mine = orders().filter(o => o.email === s);
    const since = new Date(u.created).toLocaleDateString(lang === 'hy' ? 'hy-AM' : lang === 'ru' ? 'ru-RU' : 'en-GB', { month: 'long', year: 'numeric' });
    const favList = favs().map(byId).filter(Boolean);
    return {
      title: `${t('nav.account')} — Sneak Beat`,
      html: `
      <section class="page wrap acct">
        <header class="acct-head">
          <span class="avatar" aria-hidden="true">${esc((u.first[0] || '') + (u.last[0] || ''))}</span>
          <div><h1 class="h1">${t('acc.hi', { name: esc(u.first) })}</h1><p class="lede">${t('acc.member', { date: since })}</p></div>
        </header>
        <nav class="tabs" role="tablist">
          ${['orders', 'favorites', 'profile'].map(k => `<a role="tab" href="#/account/${k}" class="${tab === k ? 'is-on' : ''}" aria-selected="${tab === k}">${t('acc.' + k)}</a>`).join('')}
          <button class="link tabs-out" data-signout>${t('acc.signout')}</button>
        </nav>
        <div class="tab-body">
          ${tab === 'orders' ? (mine.length ? `<ul class="orders">${mine.map(o => `
            <li><div><strong>${o.id}</strong><span>${new Date(o.date).toLocaleDateString()}</span></div>
              <div class="order-thumbs">${o.items.map(i => `<span class="pic"><img src="${byId(i.id).images[0]}" alt=""></span>`).join('')}</div>
              <strong>${fmt(o.total)}</strong></li>`).join('')}</ul>` : `<div class="empty"><p>${t('acc.noOrders')}</p><a class="btn" href="#/shop?sort=newest">${t('bag.emptyCta')}</a></div>`) : ''}
          ${tab === 'favorites' ? (favList.length ? `<div class="grid grid--full">${favList.map(p => card(p)).join('')}</div>` : `<div class="empty"><p>${t('fav.empty')}</p></div>`) : ''}
          ${tab === 'profile' ? `<dl class="profile">
              <div><dt>${t('auth.first')}</dt><dd>${esc(u.first)} ${esc(u.last)}</dd></div>
              <div><dt>${t('auth.email')}</dt><dd>${esc(s)}</dd></div>
              ${u.birthday ? `<div><dt>${t('auth.birthday')}</dt><dd>${esc(u.birthday)}</dd></div>` : ''}
            </dl>` : ''}
        </div>
      </section>`,
      mount() {
        $('[data-signout]').addEventListener('click', () => { store.set('session', null); toast(t('toast.signedOut')); updateBadges(); location.hash = '#/'; });
      }
    };
  }

  function Store() {
    const st = C.store;
    const q = encodeURIComponent(st.mapQuery);
    const tel = (n, label) => `<a class="tel" href="tel:${n.replace(/\s/g, '')}">${I.phone}<span>${n}</span><em>${label}</em></a>`;
    return {
      title: `${t('store.title')} — Sneak Beat`,
      html: `
      <section class="store-top wrap">
        <div class="store-info">
          <p class="eyebrow">${t('nav.store')}</p>
          <h1 class="display display--md">${t('store.title')}</h1>
          <p class="lede">${t('store.lede')}</p>
          <dl class="store-dl">
            <div><dt>${t('store.address')}</dt><dd>${L(st.address)}</dd></div>
            <div><dt>${t('store.hours')}</dt><dd>${t('store.daily')} · ${st.hours}</dd></div>
            <div><dt>${t('store.contact')}</dt><dd class="contact-links">
              ${tel(st.phone, t('store.phoneStore'))}
              ${tel(st.deliveryPhone, t('store.phoneDelivery'))}
              <a class="tel" href="https://www.instagram.com/${C.instagram}/" target="_blank" rel="noopener">${I.ig}<span>@${C.instagram}</span><em>Instagram</em></a>
            </dd></div>
          </dl>
          <a class="btn btn--lg" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">${t('store.directions')} ${I.arrowR}</a>
        </div>
        <div class="store-media store-front" role="img" aria-label="${esc(t('store.title'))} — ${esc(L(st.address))}">${st.front.map((src, i) => `<img src="${src}" alt="" ${i ? '' : 'fetchpriority="high"'}>`).join('')}</div>
      </section>
      <section class="section wrap">
        <div class="map">
          <iframe title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${q}&z=17&output=embed"></iframe>
        </div>
      </section>
      <section class="section wrap">
        <div class="feed feed--store">${C.feed.slice(0, 4).map(f => `<a class="feed-item" href="${f.url}" target="_blank" rel="noopener" aria-label="Instagram"><img src="${f.src}" alt="" loading="lazy"></a>`).join('')}</div>
      </section>`
    };
  }

  function Help(open = 'delivery') {
    const st = C.store;
    const sections = {
      delivery: [t('footer.delivery'), t('pdp.deliveryText', { fee: fmt(C.delivery.courierFee), amount: fmt(C.delivery.freeOver), dphone: `<a href="tel:${st.deliveryPhone.replace(/\s/g, '')}">${st.deliveryPhone}</a>` }).split('<br><br>').slice(0, 2).join('<br><br>')],
      returns: [t('footer.returns'), t('help.returnsText')],
      payment: [t('footer.payment'), t('help.paymentText')],
      sizes: [t('footer.sizes'), `${t('sg.text')}<br><br><button class="link" data-size-guide>${t('pdp.sizeGuide')}</button><br><br>${t('pdp.fitText')}`],
      contact: [t('footer.contact'), `${t('help.contactText')}<br><br><a href="tel:${st.phone.replace(/\s/g, '')}">${st.phone}</a> — ${t('store.phoneStore')}<br><a href="tel:${st.deliveryPhone.replace(/\s/g, '')}">${st.deliveryPhone}</a> — ${t('store.phoneDelivery')}<br><a href="https://www.instagram.com/${C.instagram}/" target="_blank" rel="noopener">@${C.instagram}</a><br>${L(st.address)}`]
    };
    return {
      title: `${t('help.title')} — Sneak Beat`,
      html: `
      <section class="page wrap help">
        <h1 class="display display--md">${t('help.title')}</h1>
        <div class="acc acc--lg">
          ${Object.entries(sections).map(([k, [h, body]]) => `<details id="help-${k}" ${k === open ? 'open' : ''}><summary>${h}</summary><div class="acc-body"><p>${body}</p></div></details>`).join('')}
        </div>
      </section>`
    };
  }

  function NotFound() {
    return { title: 'Sneak Beat', html: `<section class="page wrap empty"><h1 class="h1">404</h1><a class="btn" href="#/">Sneak Beat</a></section>` };
  }

  /* ================================================================
     ROUTER
     ================================================================ */
  let cleanup = [];
  function render() {
    cleanup.forEach(f => f()); cleanup = [];
    const raw = location.hash.slice(1) || '/';
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const q = new URLSearchParams(qs || '');
    let v;
    switch (parts[0]) {
      case undefined: v = Home(); break;
      case 'shop': v = Shop(q); break;
      case 'p': v = PDP(parts[1]); break;
      case 'checkout': v = Checkout(); break;
      case 'order': v = OrderDone(parts[1]); break;
      case 'favorites': v = Favorites(); break;
      case 'account': v = Account(parts[1]); break;
      case 'store': v = Store(); break;
      case 'help': v = Help(parts[1]); break;
      default: v = NotFound();
    }
    const app = $('#app');
    app.innerHTML = v.html;
    app.classList.remove('view-in'); void app.offsetWidth; app.classList.add('view-in');
    document.title = v.title || 'Sneak Beat';
    document.body.dataset.route = parts[0] || 'home';
    v.mount && v.mount();
    observeReveal();
    closeLayers();
    updateOver();
    setActiveNav(parts[0], q);
    window.scrollTo(0, 0);
  }

  function setActiveNav(route, q) {
    $$('.nav-main a').forEach(a => a.classList.remove('is-on'));
    let key = route === 'store' ? 'store' : route === 'shop' ? (q.get('brand') ? 'brands' : 'shop') : route === 'p' ? 'shop' : null;
    if (key) $(`.nav-main a[data-nav="${key}"]`)?.classList.add('is-on');
  }

  /* ================================================================
     SHELL: header, mega menu, layers, bag, search, auth
     ================================================================ */
  function applyStaticI18n() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n, { amount: fmt(C.delivery.freeOver) }); });
    $$('[data-i18n-label]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
    $$('[data-i18n-ph]').forEach(el => el.setAttribute('placeholder', t(el.dataset.i18nPh)));
    $$('[data-lang]').forEach(b => { b.classList.toggle('is-on', b.dataset.lang === lang); b.setAttribute('aria-pressed', b.dataset.lang === lang); });
    $$('[data-lang-current]').forEach(el => { el.textContent = { hy: 'ՀԱՅ', ru: 'РУС', en: 'ENG' }[lang]; });
    $('#year').textContent = new Date().getFullYear();
    buildMega();
    buildMobileMenu();
  }

  function setLang(l) {
    if (l === lang) return;
    lang = l; store.set('lang', l);
    applyStaticI18n();
    render();
    renderBag();
    updateBadges();
    asLabels();
  }

  function buildMega() {
    const brands = [...new Set(P.map(p => p.brand))].sort(abc);
    const styles = [...new Set(P.map(p => p.style))];
    const col = (title, links) => `<div class="mega-col"><p class="mega-h">${title}</p>${links.join('')}</div>`;
    // Shop menu (Nike / adidas pattern, interactive): main categories on the left; hovering one swaps the
    // styles, brands and newest pairs on the right to that category. Plain text font, black text, no fading.
    const sp = $('#mega-shop');
    if (sp) {
      const tabs = [
        { key: 'new', label: t('nav.new'), q: 'sort=newest', items: [...P] },
        { key: 'men', label: t('nav.men'), q: 'gender=men', items: P.filter(p => p.gender !== 'women') },
        { key: 'women', label: t('nav.women'), q: 'gender=women', items: P.filter(p => p.gender !== 'men') },
        { key: 'all', label: t('nav.allShoes'), q: '', items: [...P] }
      ];
      const href = (q, extra) => '#/shop' + ([q, extra].filter(Boolean).length ? '?' + [q, extra].filter(Boolean).join('&') : '');
      const pane = tab => {
        const st = styles.filter(x => tab.items.some(p => p.style === x));
        const br = brands.filter(x => tab.items.some(p => p.brand === x));
        const fresh = [...tab.items].sort((a, b) => b.added.localeCompare(a.added)).filter(uniqueModel()).slice(0, 2);
        return `<div class="mm-pane" data-pane="${tab.key}" role="tabpanel" ${tab.key === 'new' ? '' : 'hidden'}>
          <div class="mm-col"><p class="mm-h">${t('filter.style')}</p>${st.map(x => `<a href="${href(tab.q, 'style=' + x)}">${t('style.' + x)}</a>`).join('')}</div>
          <div class="mm-col"><p class="mm-h">${t('nav.brands')}</p>${br.map(x => `<a href="${href(tab.q, 'brand=' + encodeURIComponent(x))}">${esc(x)}</a>`).join('')}</div>
          <div class="mm-fresh">
            <div class="mm-fresh-head"><p class="mm-h">${t('home.new')}</p><a class="mm-all" href="${href(tab.q)}">${t('common.viewAll')} ${I.arrowR}</a></div>
            <div class="mm-cards">${fresh.map(p => `<a class="mm-card" href="#/p/${p.slug}">
              <span class="mm-img"><img src="${p.images[0]}" alt="" loading="lazy"></span>
              <span class="mm-name">${esc(fullName(p))}</span><span class="mm-price">${fmt(p.price)}</span></a>`).join('')}</div>
          </div>
        </div>`;
      };
      sp.innerHTML = `<div class="mega-in mm wrap">
          <div class="mm-rail" role="tablist" aria-orientation="vertical">
            ${tabs.map((tab, i) => `<a href="${href(tab.q)}" role="tab" data-tab="${tab.key}" aria-selected="${!i}" class="${i ? '' : 'is-on'}">${tab.label}${I.arrowR}</a>`).join('')}
          </div>
          <div class="mm-panes">${tabs.map(pane).join('')}</div>
        </div>`;
      wireRail(sp, 'new');
    }
    // Brands menu — same pattern as Shop: brands on the left, hovering one shows its story and newest pairs.
    const bp = $('#mega-brands');
    if (bp) {
      const info = b => C.brandInfo[b] || {};
      const pane = (b, i) => {
        const items = P.filter(p => p.brand === b);
        const fresh = [...items].sort((x, y) => y.added.localeCompare(x.added)).filter(uniqueModel()).slice(0, 3);
        return `<div class="mm-pane mb-pane" data-pane="${esc(b)}" role="tabpanel" ${i ? 'hidden' : ''}>
          <div class="mb-info">
            <p class="mb-name">${esc(b)}</p>
            <p class="mb-story">${esc(L(info(b).story) || '')}</p>
            ${items.length
              ? `<a class="mm-all" href="#/shop?brand=${encodeURIComponent(b)}">${t('brand.shopAll', { brand: esc(b) })} · ${pairs(items.length)} ${I.arrowR}</a>`
              : `<a class="mm-all" href="#/store">${t('brand.inStore')} · ${t('brand.visit')} ${I.arrowR}</a>`}
          </div>
          <div class="mb-cards">${fresh.map(p => `<a class="mm-card" href="#/p/${p.slug}">
            <span class="mm-img"><img src="${p.images[0]}" alt="" loading="lazy"></span>
            <span class="mm-name">${esc(p.name)}</span><span class="mm-price">${fmt(p.price)}</span></a>`).join('')}</div>
        </div>`;
      };
      bp.innerHTML = `<div class="mega-in mm wrap">
          <div class="mm-rail mm-rail--brands" role="tablist" aria-orientation="vertical">
            ${C.brands.map((b, i) => { const n = P.some(p => p.brand === b);
              return `<a href="${n ? '#/shop?brand=' + encodeURIComponent(b) : '#/store'}" role="tab" data-tab="${esc(b)}" aria-selected="${!i}" class="${i ? '' : 'is-on'}${n ? '' : ' is-store'}">${esc(b)}${n ? I.arrowR : `<em>${t('nav.store')}</em>`}</a>`; }).join('')}
          </div>
          <div class="mm-panes">${C.brands.map(pane).join('')}</div>
        </div>`;
      wireRail(bp, C.brands[0]);
    }
  }

  // hover / focus / arrow keys switch the right-hand pane; closing the menu resets it to the first tab
  function wireRail(panel, first) {
    const rail = $('.mm-rail', panel);
    let tm;
    const activate = key => {
      $$('[data-tab]', rail).forEach(a => { const on = a.dataset.tab === key; a.classList.toggle('is-on', on); a.setAttribute('aria-selected', on); });
      $$('[data-pane]', panel).forEach(p => { p.hidden = p.dataset.pane !== key; });
    };
    $$('[data-tab]', rail).forEach(a => {
      a.addEventListener('pointerenter', () => { clearTimeout(tm); tm = setTimeout(() => activate(a.dataset.tab), 70); });
      a.addEventListener('pointerleave', () => clearTimeout(tm));
      a.addEventListener('focus', () => activate(a.dataset.tab));
      a.addEventListener('keydown', e => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const list = $$('[data-tab]', rail), i = list.indexOf(a);
        list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length].focus();
      });
    });
    panel.addEventListener('mega:close', () => activate(first));
  }

  // Phone menu (Footpatrol / Nike app pattern): full-width rows with dividers and chevrons; each section opens
  // its own panel with a "‹ Back" bar and the section name, so you always know where you are.
  function buildMobileMenu() {
    const m = $('#menu-panels');
    const styles = [...new Set(P.map(p => p.style))];
    const row = (href, label, extra = '') => `<a class="mp-row" href="${href}">${extra}<span class="mp-label">${label}</span>${I.arrowR}</a>`;
    const head = title => `<div class="mp-bar"><button class="mp-back" type="button" data-panel-back>${I.arrowL}<span>${t('common.back')}</span></button><p class="mp-title">${title}</p></div>`;
    const keyShoe = b => { const items = P.filter(p => p.brand === b); return items.find(p => p.badge === 'best') || [...items].sort((x, y) => y.added.localeCompare(x.added))[0]; };
    m.innerHTML = `
      <div class="mp is-on" data-panel="root">
        <nav class="mp-list" aria-label="${t('nav.menu')}">
          ${row('#/shop?sort=newest', t('nav.new'))}
          <button class="mp-row" type="button" data-panel-go="shop"><span class="mp-label">${t('nav.shop')}</span>${I.arrowR}</button>
          <button class="mp-row" type="button" data-panel-go="brands"><span class="mp-label">${t('nav.brands')}</span>${I.arrowR}</button>
          ${row('#/store', t('nav.store'))}
        </nav>
        <div class="mp-foot">
          <a class="mp-mini" href="#/favorites">${I.heart}<span>${t('nav.favorites')}</span></a>
          <button class="mp-mini" type="button" data-open-auth><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c.9-3.9 3.9-6 7.5-6s6.6 2.1 7.5 6"/></svg><span>${session() ? t('nav.account') : t('auth.signin')}</span></button>
          <a class="mp-mini" href="#/help">${I.shield}<span>${t('footer.help')}</span></a>
          <a class="mp-mini" href="https://www.instagram.com/${C.instagram}/" target="_blank" rel="noopener">${I.ig}<span>@${C.instagram}</span></a>
        </div>
      </div>

      <div class="mp" data-panel="shop">
        ${head(t('nav.shop'))}
        <nav class="mp-list">
          ${row('#/shop?sort=newest', t('nav.new'))}
          ${row('#/shop?gender=men', t('nav.men'))}
          ${row('#/shop?gender=women', t('nav.women'))}
          ${row('#/shop', t('nav.allShoes'))}
        </nav>
        <p class="mp-group">${t('filter.style')}</p>
        <nav class="mp-list mp-list--sub">
          ${styles.map(x => row('#/shop?style=' + x, t('style.' + x))).join('')}
        </nav>
      </div>

      <div class="mp" data-panel="brands">
        ${head(t('nav.brands'))}
        <nav class="mp-list">
          ${C.brands.map(b => { const k = P.some(p => p.brand === b) ? keyShoe(b) : null;
            return k
              ? row('#/shop?brand=' + encodeURIComponent(b), esc(b), `<span class="pic mp-pic"><img src="${k.images[0]}" alt="" loading="lazy"></span>`)
              : `<a class="mp-row is-store" href="#/store"><span class="pic mp-pic mp-pic--empty"></span><span class="mp-label">${esc(b)}</span><em>${t('brand.inStore')}</em></a>`; }).join('')}
        </nav>
      </div>`;
  }

  /* layers: one open at a time, Esc closes, focus returns to opener */
  let opener = null;
  function openLayer(el) {
    closeLayers(true);
    opener = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-open'));
    document.body.classList.add('has-layer');
    lockScroll(true);
    setTimeout(() => (el.querySelector('[autofocus], input, button, a') || el).focus({ preventScroll: true }), 60);
  }
  function closeLayers(keepLock) {
    $$('.layer.is-open').forEach(el => {
      el.classList.remove('is-open');
      setTimeout(() => { if (!el.classList.contains('is-open')) el.hidden = true; }, 380);
    });
    document.body.classList.remove('has-layer');
    if (!keepLock) { lockScroll(false); if (opener && document.contains(opener)) opener.focus({ preventScroll: true }); opener = null; }
  }
  function lockScroll(on) { document.documentElement.classList.toggle('no-scroll', !!on); }

  /* ---------- bag ---------- */
  function addToCart(id, size) {
    const c = cart();
    const ex = c.find(i => i.id === id && i.size === size);
    if (ex) ex.qty = Math.min(ex.qty + 1, 5); else c.push({ id, size, qty: 1 });
    setCart(c);
  }
  function renderBag(highlightId) {
    const c = cart();
    const body = $('#bag-body');
    const sub = subtotal();
    const fee = deliveryFee('courier', sub);
    const left = C.delivery.freeOver - sub;
    $('#bag-count').textContent = c.reduce((s, i) => s + i.qty, 0) || '';
    if (!c.length) {
      body.innerHTML = `<div class="empty"><p>${t('bag.empty')}</p><a class="btn" href="#/shop?sort=newest">${t('bag.emptyCta')}</a></div>`;
      $('#bag-foot').hidden = true;
      return;
    }
    $('#bag-foot').hidden = false;
    // Free-delivery bar is display only: threshold and fee come from deliveryFee(), the same function checkout charges with.
    const pct = Math.min(100, Math.round(sub / C.delivery.freeOver * 100));
    body.innerHTML = `
      <div class="ship-bar">
        <p>${left > 0 ? t('bag.freeLeft', { amount: `<strong>${fmt(left)}</strong>` }) : `${I.check} ${t('bag.freeDone')}`}</p>
        <div class="ship-track"><span style="transform:scaleX(${pct / 100})"></span></div>
      </div>
      <ul class="bag-items">
        ${c.map((i, idx) => { const p = byId(i.id); return `
        <li class="bag-item${i.id === highlightId ? ' is-new' : ''}">
          <a href="#/p/${p.slug}" class="bag-img"><img src="${p.images[0]}" alt=""></a>
          <div class="bag-info">
            <a href="#/p/${p.slug}" class="bag-name">${esc(fullName(p))}</a>
            <span class="bag-sub">${esc(p.colorway)}</span>
            <span class="bag-sub">${t('bag.size', { size: 'EU ' + i.size })}</span>
            <div class="qty" aria-label="${t('bag.qty')}">
              <button data-qty="${idx}" data-d="-1" aria-label="−">${i.qty > 1 ? I.minus : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4.5h6V7M7 7l1 13h8l1-13"/></svg>'}</button>
              <span>${i.qty}</span>
              <button data-qty="${idx}" data-d="1" aria-label="+" ${i.qty >= 5 ? 'disabled' : ''}>${I.plus}</button>
            </div>
          </div>
          <span class="bag-price">${fmt(p.price * i.qty)}</span>
        </li>`; }).join('')}
      </ul>`;
    $('#bag-totals').innerHTML = `
      <div><dt>${t('bag.subtotal')}</dt><dd>${fmt(sub)}</dd></div>
      <div><dt>${t('bag.delivery')}</dt><dd>${fee ? fmt(fee) : t('bag.free')}</dd></div>
      <div class="grand"><dt>${t('bag.total')}</dt><dd>${fmt(sub + fee)}</dd></div>`;
  }
  function openBag(highlightId) { renderBag(highlightId); openLayer($('#bag')); }

  function updateBadges() {
    const n = cart().reduce((s, i) => s + i.qty, 0);
    $$('[data-bag-count]').forEach(el => { el.textContent = n || ''; el.hidden = !n; });
    const f = favs().length;
    $$('[data-fav-count]').forEach(el => { el.hidden = !f; });
    const s = session();
    $$('[data-account-label]').forEach(el => el.textContent = s ? (users()[s]?.first || t('nav.account')) : t('auth.signin'));
  }

  /* fly-to-bag: clone the photo, send it to the bag icon, then bounce the icon */
  function flyToBag(img) {
    const target = $('.hdr [data-open-bag]');
    if (reduceMotion || !img || !target || !img.animate) return Promise.resolve();
    const a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
    const size = Math.min(a.width, 220);
    const ghost = img.cloneNode();
    Object.assign(ghost.style, { position: 'fixed', left: a.left + a.width / 2 - size / 2 + 'px', top: a.top + a.height / 2 - size / 2 + 'px', width: size + 'px', height: size + 'px', objectFit: 'cover', borderRadius: '12px', zIndex: 300, pointerEvents: 'none', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,.18))' });
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = ghost.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .15}px, ${dy * .15 - 30}px) scale(.9)`, opacity: 1, offset: .25 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: .3 }
    ], { duration: 700, easing: 'cubic-bezier(.6,-0.28,.74,.05)' });
    return anim.finished.then(() => {
      ghost.remove();
      target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 240, easing: 'ease-out' });
    });
  }

  /* ---------- favourites ---------- */
  function toggleFav(id, btn) {
    const f = favs();
    const on = !f.includes(id);
    store.set('favs', on ? [...f, id] : f.filter(x => x !== id));
    $$(`[data-fav="${id}"]`).forEach(b => {
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on);
      if (b.classList.contains('fav-big')) b.innerHTML = `${t(on ? 'pdp.faved' : 'pdp.fav')} ${I.heart}`;
      if (on && !reduceMotion) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    });
    toast(t(on ? 'toast.fav' : 'toast.unfav'));
    updateBadges();
    if (!on && document.body.dataset.route === 'favorites') render();
  }

  /* ---------- search ---------- */
  function mountSearch() {
    const input = $('#search-input');
    const out = $('#search-results');
    const popular = C.popularSearches;
    const draw = () => {
      const q = input.value.trim();
      if (!q) {
        out.innerHTML = `<p class="mega-h">${t('search.popular')}</p><div class="chips">${popular.map(s => `<a class="chip" href="#/shop?q=${encodeURIComponent(s)}">${esc(s)}</a>`).join('')}</div>`;
        return;
      }
      const r = P.filter(p => matches(p, q)).filter(uniqueModel()).slice(0, 6);
      out.innerHTML = r.length
        ? `<p class="mega-h">${t('search.products')}</p><div class="search-grid">${r.map(p => `<a class="search-item" href="#/p/${p.slug}"><span class="pic"><img src="${p.images[0]}" alt=""></span><span><strong>${esc(fullName(p))}</strong><span>${fmt(p.price)}</span></span></a>`).join('')}</div>`
        : `<p class="lede">${t('search.none', { q: esc(q) })}</p>`;
    };
    input.addEventListener('input', draw);
    $('#search-form').addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); if (q) location.hash = '#/shop?q=' + encodeURIComponent(q); });
    return () => { input.value = ''; draw(); };
  }

  /* ---------- auth: email first, then sign in or join ---------- */
  let authDone = null;
  async function hash(s) {
    try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('sb:' + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
    catch (e) { let h = 0; for (const c of 'sb:' + s) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h; }
  }
  function openAuth(cb) {
    if (session() && !cb) { location.hash = '#/account'; return; }
    authDone = cb || null;
    authStep('email');
    openLayer($('#auth'));
  }
  function authStep(step, email = '') {
    const box = $('#auth-body');
    const head = `<p class="auth-logo">SNEAK BEAT</p>`;
    if (step === 'email') {
      box.innerHTML = `${head}<h2 class="h2" id="auth-title">${t('auth.title')}</h2>
        <form data-auth="email" novalidate>
          ${field('email', t('auth.email'), 'email', email, 'email')}
          <p class="fine">${t('auth.agree')}</p>
          <button class="btn btn--lg btn--block">${t('common.continue')}</button>
        </form>
        <p class="auth-perks">${t('auth.perks')}</p>`;
    } else if (step === 'signin') {
      box.innerHTML = `${head}<h2 class="h2" id="auth-title">${t('auth.welcome')}</h2>
        <p class="auth-email">${esc(email)} <button class="link" data-auth-edit>${t('auth.edit')}</button></p>
        <form data-auth="signin" novalidate>
          ${pwField('password', t('auth.password'), 'current-password')}
          <button type="button" class="link auth-forgot">${t('auth.forgot')}</button>
          <button class="btn btn--lg btn--block">${t('auth.signin')}</button>
        </form>`;
    } else {
      box.innerHTML = `${head}<h2 class="h2" id="auth-title">${t('auth.join')}</h2>
        <p class="auth-email">${esc(email)} <button class="link" data-auth-edit>${t('auth.edit')}</button></p>
        <form data-auth="join" novalidate>
          <div class="row2">${field('first', t('auth.first'), 'text', '', 'given-name')}${field('last', t('auth.last'), 'text', '', 'family-name')}</div>
          ${pwField('password', t('auth.newPassword'), 'new-password')}
          <ul class="pw-rules" data-pw-rules><li data-rule="len">8+</li><li data-rule="mix">A·1</li></ul>
          <p class="hint">${t('auth.pwHint')}</p>
          <label class="field"><input name="birthday" type="date" placeholder=" " autocomplete="bday"><span>${t('auth.birthday')}</span></label>
          <p class="hint">${t('auth.birthdayHint')}</p>
          <label class="check"><input type="checkbox" name="news"><span class="box">${I.check}</span>${t('auth.news')}</label>
          <p class="fine">${t('auth.agree')}</p>
          <button class="btn btn--lg btn--block">${t('auth.create')}</button>
        </form>`;
    }
    box.dataset.email = email;
    setTimeout(() => $('input', box)?.focus(), 50);
  }
  function pwField(name, label, ac) {
    return `<label class="field field--pw"><input name="${name}" type="password" placeholder=" " autocomplete="${ac}" required minlength="8"><span>${label}</span>
      <button type="button" class="pw-toggle" data-pw-toggle aria-label="Show password"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button><em class="err" aria-live="polite"></em></label>`;
  }
  function mountAuth() {
    const box = $('#auth-body');
    const setErr = (input, m) => { const l = input.closest('.field'); l.classList.toggle('is-error', !!m); $('.err', l).textContent = m || ''; input.setAttribute('aria-invalid', !!m); if (m) input.focus(); };
    box.addEventListener('click', e => {
      if (e.target.closest('[data-auth-edit]')) authStep('email', box.dataset.email);
      const tg = e.target.closest('[data-pw-toggle]');
      if (tg) { const i = tg.parentElement.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; }
    });
    box.addEventListener('input', e => {
      if (e.target.name === 'password' && $('[data-pw-rules]', box)) {
        const v = e.target.value;
        $('[data-rule=len]', box).classList.toggle('is-ok', v.length >= 8);
        $('[data-rule=mix]', box).classList.toggle('is-ok', /[a-zA-Zա-ֆԱ-Ֆа-яА-Я]/.test(v) && /\d/.test(v));
      }
      if (e.target.closest('.is-error')) setErr(e.target, '');
    });
    box.addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target, kind = f.dataset.auth, email = box.dataset.email;
      if (kind === 'email') {
        const v = f.email.value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setErr(f.email, t('ck.invalidEmail'));
        authStep(users()[v] ? 'signin' : 'join', v);
      } else if (kind === 'signin') {
        const u = users()[email];
        if (u.pw !== await hash(f.password.value)) return setErr(f.password, t('auth.wrong'));
        finishAuth(email);
      } else {
        if (!f.first.value.trim()) return setErr(f.first, t('ck.required'));
        if (!f.last.value.trim()) return setErr(f.last, t('ck.required'));
        const pw = f.password.value;
        if (pw.length < 8 || !/\d/.test(pw) || !/\D/.test(pw)) return setErr(f.password, t('auth.pwHint'));
        const all = users();
        all[email] = { first: f.first.value.trim(), last: f.last.value.trim(), pw: await hash(pw), birthday: f.birthday.value, news: f.news.checked, created: new Date().toISOString() };
        store.set('users', all);
        finishAuth(email);
      }
    });
  }
  function finishAuth(email) {
    store.set('session', email);
    closeLayers();
    toast(t('toast.signedIn', { email }));
    updateBadges();
    buildMobileMenu();
    const cb = authDone; authDone = null;
    if (cb) cb(); else if (['favorites', 'account'].includes(document.body.dataset.route)) render();
  }

  /* ---------- small things ---------- */
  let toastT;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('is-on'), 2200);
  }

  function mountRails() {
    $$('[data-rail]').forEach(r => {
      const tr = $('.rail-track', r);
      const prev = $('[data-rail-prev]', r), next = $('[data-rail-next]', r);
      const upd = () => { prev.disabled = tr.scrollLeft < 8; next.disabled = tr.scrollLeft + tr.clientWidth > tr.scrollWidth - 8; };
      prev.onclick = () => tr.scrollBy({ left: -tr.clientWidth * .8, behavior: reduceMotion ? 'auto' : 'smooth' });
      next.onclick = () => tr.scrollBy({ left: tr.clientWidth * .8, behavior: reduceMotion ? 'auto' : 'smooth' });
      tr.addEventListener('scroll', upd, { passive: true });
      upd();
    });
  }

  function mountAlertForm() {
    const f = $('[data-form=alerts]');
    if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const v = f.email.value.trim();
      const m = $('.form-msg', f);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { m.textContent = t('ck.invalidEmail'); m.classList.add('is-error'); f.email.focus(); return; }
      store.set('alerts', [...new Set([...store.get('alerts', []), v])]);
      f.innerHTML = `<p class="form-done">${I.check} ${t('home.alertDone')}</p>`;
    });
  }

  let revealIO;
  function observeReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) { $$('.reveal').forEach(el => el.classList.add('is-in')); return; }
    revealIO?.disconnect();
    revealIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(el => revealIO.observe(el));
  }

  function sizeGuide() {
    const rows = C.sizeChart.map(r => `<tr><td>${r.eu}</td><td>${r.us}</td><td>${r.uk}</td><td>${r.cm}</td></tr>`).join('');
    $('#sg-body').innerHTML = `<h2 class="h2">${t('sg.title')}</h2><p class="lede">${t('sg.text')}</p>
      <table class="sg"><thead><tr><th>EU</th><th>US M</th><th>UK</th><th>cm</th></tr></thead><tbody>${rows}</tbody></table>`;
    openLayer($('#size-guide'));
  }

  /* header: hide on scroll down, return on scroll up */
  function updateOver() {
    const h = $('.hdr'), film = $('.film');
    const over = document.body.dataset.route === 'home' && film && !h.classList.contains('mega-open') && scrollY < film.offsetHeight - h.offsetHeight;
    h.classList.toggle('is-over', !!over);
  }

  function mountHeader() {
    const h = $('.hdr');
    let last = scrollY, ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        h.classList.toggle('is-scrolled', y > 8);
        updateOver();
        if (!document.body.classList.contains('has-layer') && !h.matches(':hover') && !h.contains(document.activeElement)) {
          const hide = y > last && y > 160;
          h.classList.toggle('is-hidden', hide);
          document.body.classList.toggle('hdr-hidden', hide);
        }
        last = y; ticking = false;
      });
    }, { passive: true });

    // mega menu with hover intent
    let tOpen, tClose;
    const panels = $$('.mega');
    const show = id => { panels.forEach(p => { if (p.classList.contains('is-open') && p.id !== id) p.dispatchEvent(new Event('mega:close')); p.classList.toggle('is-open', p.id === id); }); h.classList.toggle('mega-open', !!id); updateOver(); $$('[data-mega]').forEach(a => a.setAttribute('aria-expanded', a.dataset.mega === id?.replace('mega-', ''))); };
    $$('[data-mega]').forEach(a => {
      a.addEventListener('mouseenter', () => { clearTimeout(tClose); tOpen = setTimeout(() => show('mega-' + a.dataset.mega), 120); });
      a.addEventListener('mouseleave', () => clearTimeout(tOpen));
      a.addEventListener('focus', () => show('mega-' + a.dataset.mega));
    });
    $$('.nav-main > li > a:not([data-mega])').forEach(a => a.addEventListener('mouseenter', () => { clearTimeout(tOpen); show(null); }));
    h.addEventListener('mouseleave', () => { clearTimeout(tOpen); tClose = setTimeout(() => show(null), 160); });
    h.addEventListener('mouseenter', () => clearTimeout(tClose));
    h.addEventListener('click', e => { if (e.target.closest('.mega a')) show(null); });
    addEventListener('hashchange', () => show(null));

    // rotating promo line
    const promos = $$('.promo-msg');
    let i = 0;
    if (promos.length > 1 && !reduceMotion) setInterval(() => { promos[i].classList.remove('is-on'); i = (i + 1) % promos.length; promos[i].classList.add('is-on'); }, 4500);
  }

  /* ================================================================
     ASSISTANT (END.-style floating panel)
     Demo engine: answers from the store's own data — catalogue search, size conversion, delivery / exchange /
     payment / address questions — in HY · RU · EN, and hands off to Instagram or phone when unsure.
     To connect a real model later, replace `reply()` with a call to a small server that holds the API key.
     ================================================================ */
  const AS = { open: false, log: [] };
  const KW = {
    delivery: ['deliver', 'shipping', 'ship', 'courier', 'доставк', 'курьер', 'առաք'],
    returns: ['return', 'exchange', 'refund', 'обмен', 'возврат', 'փոխանակ', 'վերադարձ'],
    payment: ['pay', 'card', 'idram', 'telcell', 'cash', 'оплат', 'карт', 'налич', 'վճար', 'քարտ', 'կանխիկ'],
    store: ['where', 'address', 'location', 'hours', 'open', 'адрес', 'где', 'часы', 'работа', 'находит', 'հասցե', 'որտեղ', 'ժամ', 'բաց', 'խանութ'],
    contact: ['phone', 'call', 'contact', 'whatsapp', 'телефон', 'позвон', 'звон', 'связ', 'հեռախոս', 'զանգ', 'կապ'],
    size: ['size', 'fit', 'размер', 'маломер', 'большемер', 'չափս', 'նստվածք'],
    hello: ['hi', 'hello', 'hey', 'привет', 'здравств', 'բարև', 'բարեւ'],
    shoe: ['sneaker', 'shoe', 'pair', 'show', 'find', 'recommend', 'кросс', 'обув', 'пар', 'покаж', 'найд', 'посовет', 'սնիքեր', 'կոշիկ', 'զույգ', 'ցույց', 'գտ']
  };
  const FACETS = {
    color: { white: ['white', 'бел', 'սպիտակ'], black: ['black', 'черн', 'սև'], grey: ['grey', 'gray', 'сер', 'մոխր'], beige: ['beige', 'беж', 'բեժ'],
             brown: ['brown', 'коричн', 'շագանակ'], red: ['red', 'красн', 'կարմիր'], blue: ['blue', 'голуб', 'син', 'կապույտ'] },
    style: { running: ['run', 'бег', 'вазк', 'վազք'], basketball: ['basket', 'баскет', 'բասկետ'], lifestyle: ['lifestyle', 'everyday', 'casual', 'повседн', 'ամենօր'], skate: ['skate', 'скейт', 'սքեյթ'] },
    gender: { women: ['women', 'woman', 'female', 'girl', 'жен', 'девуш', 'կին', 'կանաց', 'կանանց', 'աղջ'], men: ['men', 'man', 'male', 'муж', 'парн', 'տղամարդ', 'տղա'] }
  };
  const has = (txt, list) => list.some(w => txt.includes(w));
  const pick = (txt, map) => Object.keys(map).filter(k => has(txt, map[k]));

  function reply(raw) {
    const txt = ' ' + raw.toLowerCase().replace(/[^\p{L}\p{N}\s.]/gu, ' ') + ' ';
    const st = C.store;
    const ig = `<a href="https://www.instagram.com/${C.instagram}/" target="_blank" rel="noopener">@${C.instagram}</a>`;
    const tel = n => `<a href="tel:${n.replace(/\s/g, '')}">${n}</a>`;

    // size: "EU 42", "us 9", "42 размер", or just a size question
    const sizeQ = has(txt, KW.size);
    const us = txt.match(/\bus\s*(\d{1,2}(?:\.5)?)\b/), uk = txt.match(/\buk\s*(\d{1,2}(?:\.5)?)\b/), eu = txt.match(/\b(3[5-9]|4[0-7])\b/);
    const nearest = (key, v) => C.sizeChart.reduce((a, r) => Math.abs(+r[key] - v) < Math.abs(+a[key] - v) ? r : a);
    const row = us ? nearest('us', +us[1]) : uk ? nearest('uk', +uk[1]) : eu ? nearest('eu', +eu[1]) : null;
    if (row && (sizeQ || us || uk || /\beu\b/.test(txt))) return { html: t('as.sizeAns', row) + ` <button class="link" data-size-guide>${t('pdp.sizeGuide')}</button>` };
    if (sizeQ && !pick(txt, FACETS.color).length) return { html: t('as.sizeAsk') };

    if (has(txt, KW.delivery)) return { html: t('pdp.deliveryText', { fee: fmt(C.delivery.courierFee), amount: fmt(C.delivery.freeOver), dphone: tel(st.deliveryPhone) }).split('<br><br>').slice(0, 2).join('<br><br>') };
    if (has(txt, KW.returns)) return { html: t('help.returnsText') };
    if (has(txt, KW.payment)) return { html: t('help.paymentText') };
    if (has(txt, KW.store) && !has(txt, KW.shoe)) return { html: `${L(st.address)}<br>${t('store.daily')} · ${st.hours}<br><a href="#/store">${t('store.directions')}</a>` };
    if (has(txt, KW.contact)) return { html: `${t('help.contactText')}<br>${tel(st.phone)} · ${ig}` };

    // product search
    const brands = [...new Set(P.map(p => p.brand))].filter(b => txt.includes(b.toLowerCase()) || (b === 'New Balance' && /\bnb\b/.test(txt)));
    const colors = pick(txt, FACETS.color), styles = pick(txt, FACETS.style);
    const genders = pick(txt, FACETS.gender).filter((g, _, all) => !(g === 'men' && all.includes('women') && !/\bmen\b|муж|տղամարդ/.test(txt)));
    let max = null, min = null;
    const num = txt.match(/(\d[\d\s]{1,7})\s*(k|к|тыс|հազ)?/);
    if (num) { let n = +num[1].replace(/\s/g, ''); if (num[2] || n < 1000) n *= 1000; if (n >= 10000 && n <= 500000) { if (/over|more than|from|от|больше|ավել|սկսած/.test(txt)) min = n; else max = n; } }
    const asked = brands.length || colors.length || styles.length || genders.length || max || min || has(txt, KW.shoe);
    if (asked) {
      const all = P.filter(p => (!brands.length || brands.includes(p.brand)) && (!colors.length || colors.includes(p.color)) && (!styles.length || styles.includes(p.style)) &&
        (!genders.length || genders.includes(p.gender) || p.gender === 'unisex') && (!max || p.price <= max) && (!min || p.price >= min));
      const items = all.filter(uniqueModel());   // one card per model; the link counts every colourway, like the shop
      const q = new URLSearchParams();
      if (brands.length) q.set('brand', brands.join(',')); if (colors.length) q.set('color', colors.join(',')); if (styles.length) q.set('style', styles.join(',')); if (genders.length) q.set('gender', genders.join(','));
      // carry the price over when it matches the shop's price filter exactly, so the count on the link is the count you get
      let priceOk = true;
      if (max || min) {
        const bands = PRICE_BANDS.map((r, i) => i).filter(i => (!max || PRICE_BANDS[i][1] <= max) && (!min || PRICE_BANDS[i][0] >= min));
        const lo = bands.length ? PRICE_BANDS[bands[0]][0] : null, hi = bands.length ? PRICE_BANDS[bands.at(-1)][1] : null;
        priceOk = bands.length && (!max || hi === max) && (!min || lo === min) && (max ? lo === 0 : hi === Infinity);
        if (priceOk) q.set('price', bands.join(','));
      }
      if (!items.length) return { html: t('as.none') + `<br>${ig}` };
      const href = '#/shop' + (q.toString() ? '?' + q : '');
      return { html: t('as.found'), cards: items.slice(0, 4), more: { n: priceOk ? all.length : null, href } };
    }
    if (has(txt, KW.hello)) return { html: t('as.hi') };
    return { html: t('as.fallback', { ig, phone: tel(st.phone) }) };
  }

  function asMsg(m) {
    if (m.from === 'me') return `<div class="as-msg as-me">${esc(m.text)}</div>`;
    return `<div class="as-msg as-bot"><div>${m.html}</div>
      ${m.cards ? `<div class="as-cards">${m.cards.map(p => `<a class="as-card" href="#/p/${p.slug}"><span class="pic"><img src="${p.images[0]}" alt=""></span><span><strong>${esc(fullName(p))}</strong><span>${fmt(p.price)}</span></span></a>`).join('')}</div>` : ''}
      ${m.more ? `<a class="as-more" href="${m.more.href}">${m.more.n ? t('as.seeAll', { n: m.more.n }) : t('common.viewAll')} ${I.arrowR}</a>` : ''}</div>`;
  }

  function asRender() {
    const box = $('#assistant');
    if (!box) return;
    const empty = !AS.log.length;
    box.classList.toggle('is-empty', empty);
    $('.as-thread', box).innerHTML = empty
      ? `<div class="as-intro"><p class="as-mark">SNEAK BEAT</p><p class="as-hello">${t('as.hello')}</p>
          <div class="as-chips">${['as.s1', 'as.s2', 'as.s3', 'as.s4'].map(k => `<button type="button" class="as-chip" data-ask="${esc(t(k))}">${t(k)}</button>`).join('')}</div></div>`
      : AS.log.map(asMsg).join('');
    const th = $('.as-thread', box); th.scrollTop = th.scrollHeight;
  }

  function asLabels() {
    const box = $('#assistant');
    if (!box) return;
    $('.as-launch span', document).textContent = t('as.launch');
    $('.as-input', box).placeholder = t('as.placeholder');
    $('.as-input', box).setAttribute('aria-label', t('as.placeholder'));
    $('[data-as-send]', box).setAttribute('aria-label', t('as.send'));
    $('[data-as-close]', box).setAttribute('aria-label', t('common.close'));
    $('[data-as-bag]', box).setAttribute('aria-label', t('nav.bag'));
    $('[data-as-new]', box).setAttribute('aria-label', t('as.new'));
    $('.as-about', box).textContent = t('as.about');
    $('.as-note', box).textContent = t('as.note');
    box.setAttribute('aria-label', t('as.title'));
    asRender();
  }

  function asAsk(text) {
    text = text.trim();
    if (!text) return;
    AS.log.push({ from: 'me', text });
    asRender();
    const th = $('#assistant .as-thread');
    th.insertAdjacentHTML('beforeend', '<div class="as-msg as-bot as-typing" aria-hidden="true"><i></i><i></i><i></i></div>');
    th.scrollTop = th.scrollHeight;
    setTimeout(() => { AS.log.push({ from: 'bot', ...reply(text) }); asRender(); }, reduceMotion ? 0 : 650);
  }

  function asToggle(open) {
    AS.open = open;
    const box = $('#assistant'), btn = $('.as-launch');
    box.hidden = !open;
    requestAnimationFrame(() => box.classList.toggle('is-open', open));
    btn.setAttribute('aria-expanded', open);
    document.documentElement.classList.toggle('as-locked', open && innerWidth < 640);
    if (open) setTimeout(() => $('.as-input', box).focus({ preventScroll: true }), 80); else btn.focus({ preventScroll: true });
  }

  function mountAssistant() {
    document.body.insertAdjacentHTML('beforeend', `
      <button class="as-launch" type="button" aria-controls="assistant" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-7.5L7 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z"/></svg><span></span>
      </button>
      <section class="as-panel" id="assistant" role="dialog" aria-modal="false" hidden>
        <div class="as-top">
          <button class="icon-btn as-round" type="button" data-as-new><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/></svg></button>
          <span class="as-top-spacer"></span>
          <button class="icon-btn as-round" type="button" data-as-bag><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12.5H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg></button>
          <button class="icon-btn as-round" type="button" data-as-close>${I.close}</button>
        </div>
        <div class="as-thread" aria-live="polite"></div>
        <form class="as-form" autocomplete="off">
          <input class="as-input" type="text" enterkeyhint="send">
          <button class="as-send" type="submit" data-as-send><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/></svg></button>
        </form>
        <details class="as-foot"><summary class="as-about"></summary><p class="as-note"></p></details>
      </section>`);
    const box = $('#assistant');
    $('.as-launch').addEventListener('click', () => asToggle(!AS.open));
    box.addEventListener('click', e => {
      if (e.target.closest('[data-as-close]')) return asToggle(false);
      if (e.target.closest('[data-as-bag]')) { asToggle(false); return openBag(); }
      if (e.target.closest('[data-as-new]')) { AS.log = []; return asRender(); }
      const chip = e.target.closest('[data-ask]'); if (chip) return asAsk(chip.dataset.ask);
      if (e.target.closest('a[href^="#/"]') && innerWidth < 640) asToggle(false);
    });
    $('.as-form', box).addEventListener('submit', e => { e.preventDefault(); const i = $('.as-input', box); asAsk(i.value); i.value = ''; });
    box.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); asToggle(false); } });
    asLabels();
  }

  /* ================================================================
     BOOT
     ================================================================ */
  function boot() {
    // drop bag/favourite entries whose product left the catalogue (discontinued, renamed)
    store.set('cart', cart().filter(i => byId(i.id)));
    store.set('favs', favs().filter(id => byId(id)));
    applyStaticI18n();
    mountHeader();
    mountAuth();
    const resetSearch = mountSearch();
    mountAssistant();
    updateBadges();

    document.addEventListener('click', e => {
      const fav = e.target.closest('[data-fav]');
      if (fav) { e.preventDefault(); toggleFav(fav.dataset.fav, fav); return; }
      if (e.target.closest('[data-open-bag]')) { e.preventDefault(); openBag(); return; }
      if (e.target.closest('[data-open-search]')) { e.preventDefault(); resetSearch(); openLayer($('#search')); return; }
      if (e.target.closest('[data-open-auth]')) { e.preventDefault(); session() ? (location.hash = '#/account') : openAuth(); return; }
      if (e.target.closest('[data-open-menu]')) { e.preventDefault(); $$('.mp').forEach(p => p.classList.toggle('is-on', p.dataset.panel === 'root')); openLayer($('#menu')); return; }
      if (e.target.closest('[data-size-guide]')) { e.preventDefault(); sizeGuide(); return; }
      const lt = e.target.closest('[data-lang-toggle]');
      const lm = $('[data-lang-menu]');
      if (lt) { lm.hidden = !lm.hidden; lt.setAttribute('aria-expanded', !lm.hidden); return; }
      if (lm && !lm.hidden && !e.target.closest('[data-lang-menu]')) { lm.hidden = true; $('[data-lang-toggle]').setAttribute('aria-expanded', false); }
      const lb = e.target.closest('[data-lang]');
      if (lb) { if (lm) { lm.hidden = true; $('[data-lang-toggle]').setAttribute('aria-expanded', false); } setLang(lb.dataset.lang); return; }
      const go = e.target.closest('[data-panel-go]');
      if (go) { $$('.mp').forEach(p => p.classList.toggle('is-on', p.dataset.panel === go.dataset.panelGo)); return; }
      if (e.target.closest('[data-panel-back]')) { $$('.mp').forEach(p => p.classList.toggle('is-on', p.dataset.panel === 'root')); return; }
      const q = e.target.closest('[data-qty]');
      if (q) {
        const c = cart(), it = c[+q.dataset.qty];
        it.qty += +q.dataset.d;
        setCart(it.qty < 1 ? c.filter(x => x !== it) : c);
        renderBag();
        return;
      }
      if (e.target.closest('[data-close]') || e.target.classList.contains('layer-scrim')) { closeLayers(); return; }
      if (e.target.closest('.layer a[href^="#"]')) closeLayers();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { const lm = $('[data-lang-menu]'); if (lm && !lm.hidden) { lm.hidden = true; $('[data-lang-toggle]').setAttribute('aria-expanded', false); $('[data-lang-toggle]').focus(); return; } closeLayers(); }
      if (e.key === '/' && !e.target.closest('input, textarea')) { e.preventDefault(); resetSearch(); openLayer($('#search')); }
      if (e.key === 'Tab') {
        const layer = $('.layer.is-open');
        if (!layer) return;
        const f = $$('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])', layer).filter(x => x.offsetParent);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
      }
    });
    addEventListener('hashchange', render);
    render();
  }

  boot();
})();
