/**
 * use-scroll-animate showcase — "Animation Store".
 * No framework, no build step. Every demo is driven by the library itself,
 * imported from ../dist (falls back to the published build on a CDN).
 */
import { ITEMS, CATEGORIES, findItem, matches } from './catalog.js';
import { TABS, INSTALL, EASINGS, defaultState, generate, defaultTab, highlight, presetDistance, revealOptions, animationValue, easingValue } from './codegen.js';
import { t as tr } from './i18n.js';

/* ------------------------------------------------------------------ */
/* Environment                                                         */
/* ------------------------------------------------------------------ */

const LOCAL = new URL('../dist/', import.meta.url).href;
const CDN = 'https://unpkg.com/use-scroll-animate@6/dist/';
const KEY = 'usa-showcase:';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const rmq = matchMedia('(prefers-reduced-motion: reduce)');
const touchq = matchMedia('(hover: none)');
const reduced = () => rmq.matches;
const canVT = () => typeof document.startViewTransition === 'function' && !reduced();
const store = {
  get: (k, d) => {
    try {
      const v = localStorage.getItem(KEY + k);
      return v === null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(KEY + k, JSON.stringify(v));
    } catch {
      /* private mode */
    }
  },
};
const legacy = (k, d) => {
  // theme/lang are written raw by the inline <head> script
  try {
    return localStorage.getItem(KEY + k) || d;
  } catch {
    return d;
  }
};

let lib = null; // the use-scroll-animate namespace (index.js)
let svelteMod = null;
let base = LOCAL;
let sa = null; // instance used by the previews

const ui = {
  lang: document.documentElement.lang.startsWith('zh') ? 'zh' : 'en',
  query: '',
  cat: 'all',
  favs: new Set(store.get('favs', [])),
  tab: store.get('tab', null),
  pm: store.get('pm', 'npm'),
};
const T = (key, vars) => tr(ui.lang, key, vars);
const L = (obj) => (obj ? obj[ui.lang] || obj.en : '');

async function loadLibrary() {
  try {
    lib = await import(LOCAL + 'index.js');
  } catch {
    base = CDN;
    lib = await import(CDN + 'index.js');
  }
  // Entry points used to dogfood the Web Component and the Svelte action
  const [el, sv] = await Promise.allSettled([import(base + 'element.js'), import(base + 'svelte.js')]);
  if (el.status === 'fulfilled') el.value.defineScrollAnimate();
  if (sv.status === 'fulfilled') svelteMod = sv.value;
  sa = lib.createScrollAnimate();
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(children)) if (c) el.append(c);
  return el;
}

const ICON = {
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.2 4.5c2 0 3.6 1.2 4.8 2.9 1.2-1.7 2.8-2.9 4.8-2.9 3.3 0 5.6 3.1 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5l12 7-12 7Z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  scroll: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 7v4"/></svg>',
};

function pop(el) {
  if (reduced() || !el.animate) return;
  el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
}

let toastTimer = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = h('textarea', { style: 'position:fixed;opacity:0;top:0', readonly: true });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

async function copyWithFeedback(btn, text, msg = T('toast.copied')) {
  const ok = await copyText(text);
  toast(ok ? msg : T('toast.copyFail'));
  if (!ok || !btn) return;
  btn.classList.add('done');
  pop(btn);
  clearTimeout(btn._t);
  btn._t = setTimeout(() => btn.classList.remove('done'), 1600);
}

/* ------------------------------------------------------------------ */
/* Demos — every one is driven by the library                         */
/* ------------------------------------------------------------------ */

const presetNames = () => Object.keys(lib.PRESETS);

function reversed(animation) {
  const kf = lib.resolvePreset(animation);
  return { from: { ...kf.to }, to: { ...kf.from } };
}

/** Ping-pong auto-scroll of a mini scroll container (the thing being demoed is scrolling). */
function autoScroll(scroller, axis = 'y', period = 4200) {
  let raf = 0;
  let last = 0;
  let elapsed = 0;
  let paused = false;
  let pausedUntil = 0;
  const pause = () => (pausedUntil = performance.now() + 2500);
  const maxOf = () => (axis === 'x' ? scroller.scrollWidth - scroller.clientWidth : scroller.scrollHeight - scroller.clientHeight);
  scroller.addEventListener('wheel', pause, { passive: true });
  scroller.addEventListener('pointerdown', pause, { passive: true });
  scroller.addEventListener('touchstart', pause, { passive: true });
  const step = (now) => {
    const dt = last ? now - last : 0;
    last = now;
    const max = maxOf();
    if (now < pausedUntil) paused = true;
    else {
      if (paused) {
        // Resume from wherever the user left it (inverse of the cosine curve)
        const p = max > 0 ? Math.min(1, Math.max(0, (axis === 'x' ? scroller.scrollLeft : scroller.scrollTop) / max)) : 0;
        elapsed = (Math.acos(1 - 2 * p) / (Math.PI * 2)) * period;
        paused = false;
      }
      elapsed += dt;
      const p = (1 - Math.cos((elapsed / period) * Math.PI * 2)) / 2;
      if (axis === 'x') scroller.scrollLeft = p * max;
      else scroller.scrollTop = p * max;
    }
    raf = requestAnimationFrame(step);
  };
  return {
    start() {
      if (raf || reduced()) return;
      last = 0;
      paused = true; // pick up from the current position
      pausedUntil = 0;
      raf = requestAnimationFrame(step);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

/**
 * Build a demo for `item` inside `host`.
 * Returns { play(), startLoop(), stopLoop(), update(state), destroy(), cycle() }.
 * `firstReveal`: let the library reveal it the first time it scrolls into view.
 */
function createDemo(item, host, state, { firstReveal = false } = {}) {
  let st = { ...state };
  let loopTimer = 0;
  let looping = false;
  let timers = [];
  const cleanups = [];
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  let api;

  if (item.recipe === 'reveal') {
    const isElement = item.framework === 'element';
    // The real <scroll-animate> element on cards; a plain div in the detail stage (driven by animate())
    const el = isElement && firstReveal && customElements.get('scroll-animate') ? h('scroll-animate') : h('div');
    el.className = 'obj' + (item.glyph ? ' glyph' : '');
    if (item.glyph) el.textContent = item.glyph;
    host.append(el);
    const opts = () => revealOptions(lib.PRESETS, st);
    if (firstReveal) {
      const { exit, repeat, ...timed } = opts();
      if (isElement && el.localName === 'scroll-animate') {
        // Real <scroll-animate>: attributes in, animation out
        el.setAttribute('animation', typeof timed.animation === 'string' ? timed.animation : 'zoom-in');
        el.setAttribute('duration', String(timed.duration));
        if (typeof timed.easing === 'string') el.setAttribute('easing', timed.easing);
      } else if (item.framework === 'svelte' && svelteMod) {
        const action = svelteMod.scrollAnimate(el, timed); // the real Svelte action, no Svelte needed
        cleanups.push(() => action && action.destroy && action.destroy());
      } else sa.observe(el, timed);
    }
    const total = () => {
      const o = opts();
      return (o.delay || 0) + o.duration + (o.exit ? o.duration + 500 : 0);
    };
    api = {
      play() {
        clearTimers();
        const { exit, repeat, ...timed } = opts();
        sa.animate(el, timed);
        if (exit) {
          const out = reversed(exit === true ? timed.animation : exit);
          timers.push(setTimeout(() => sa.animate(el, { animation: out, duration: timed.duration, easing: timed.easing }), (timed.delay || 0) + timed.duration + 500));
        }
      },
      cycle: () => total() + 1600,
      targets: [el],
    };
  } else if (item.recipe === 'stagger') {
    const row = h('div', { class: 'obj-row' });
    for (let i = 0; i < 6; i++) row.append(h('div', { class: 'obj' }));
    host.append(row);
    const opts = () => ({ animation: animationValue(lib.PRESETS, st), duration: Number(st.duration), easing: easingValue(st.easing) });
    if (firstReveal) cleanups.push(lib.staggerChildren(row, { ...opts(), stagger: Number(st.stagger) }, sa));
    api = {
      play() {
        Array.from(row.children).forEach((c, i) => sa.animate(c, { ...opts(), delay: i * Number(st.stagger) }));
      },
      cycle: () => 5 * Number(st.stagger) + Number(st.duration) + 1600,
      targets: Array.from(row.children),
    };
  } else if (item.recipe === 'sequence') {
    const seq = h('div', { class: 'seq' }, [h('span'), h('span'), h('span')]);
    host.append(seq);
    let tl = null;
    const build = () => {
      tl?.cancel();
      const [a, b, c] = seq.children;
      const gap = Number(st.gap);
      const at = gap ? `${gap < 0 ? '-' : '+'}=${Math.abs(gap)}` : undefined;
      tl = lib.timeline({ defaults: { duration: Number(st.duration), easing: 'ease-out' } }).to(a, 'fade-up').to(b, 'fade-up', { at }).to(c, 'scale', { at });
      tl.seek(0);
      return tl;
    };
    if (firstReveal) {
      build();
      const io = new IntersectionObserver(([e]) => e.isIntersecting && (io.disconnect(), tl.play()));
      io.observe(host);
      cleanups.push(() => io.disconnect());
    }
    api = {
      play() {
        build().play();
      },
      cycle: () => (tl ? tl.duration : 3 * Number(st.duration)) + 1600,
      targets: Array.from(seq.children),
    };
    cleanups.push(() => tl && tl.cancel());
  } else {
    // Scroll-linked recipes run in a mini scroll container (root option)
    let scroller;
    let inner = null;
    let stops = [];
    let scroll;
    const build = () => {
      stops.forEach((s) => s());
      stops = [];
      if (inner) inner.destroy();
      if (scroll) scroll.stop();
      host.textContent = '';
      const axis = item.recipe === 'parallax' ? st.axis : 'y';
      scroller = h('div', { class: 'scroller' + (axis === 'x' ? ' is-x' : ''), tabindex: '-1' });
      const track = h('div', { class: 'scroller-track' });
      scroller.append(track);
      host.append(scroller);
      inner = lib.createScrollAnimate({ root: scroller });
      if (item.recipe === 'parallax') {
        const back = h('div', { class: 'layer layer-back' });
        const mid = h('div', { class: 'layer layer-mid' });
        const front = h('div', { class: 'layer layer-front' });
        // A frame one box tall/wide, centred on a track twice the box size: it crosses the box as it scrolls
        track.style.display = 'block';
        if (axis === 'x') track.style.width = track.style.height = '';
        track.classList.add('para-track');
        const frame = h('div', { class: 'para-frame' }, [back, mid, front]);
        track.append(frame);
        // parallax() measures in vh/vw of the window; scale the speed so the drift fits this small box
        const size = axis === 'x' ? host.clientWidth || 300 : host.clientHeight || 220;
        const k = size / (axis === 'x' ? innerWidth : innerHeight);
        const speed = Number(st.speed) * k;
        stops.push(lib.parallax(back, { speed, axis, root: scroller }));
        stops.push(lib.parallax(front, { speed: (-speed / 2), axis, root: scroller }));
      } else if (item.recipe === 'progress') {
        track.style.display = 'block';
        const sec = h('div', { class: 'psec' });
        const bar = h('div', { class: 'pbar' });
        const num = h('div', { class: 'pnum', text: '0%' });
        sec.append(bar, num);
        track.append(sec);
        inner.observe(sec, {
          progressVar: '--sa-progress',
          progressMode: st.progressMode,
          onProgress: (_el, p) => (num.textContent = `${Math.round(p * 100)}%`),
        });
      } else if (item.recipe === 'engine') {
        const rows = h('div', { class: 'erow' });
        for (let i = 0; i < 5; i++) rows.append(h('div', { class: 'obj' }));
        track.style.height = 'auto';
        track.append(rows);
        const opts = { animation: animationValue(lib.PRESETS, st), engine: st.engine };
        if (st.engine !== 'js') opts.viewRange = [st.viewStart, st.viewEnd];
        else opts.duration = Number(st.duration);
        // Without native support (or with the JS engine) replay on re-entry so the loop stays visible
        if (st.engine === 'js' || !lib.supportsScrollTimeline()) opts.repeat = true;
        inner.observe(Array.from(rows.children), opts);
      }
      scroll = autoScroll(scroller, axis);
      if (looping) scroll.start();
    };
    build();
    api = {
      play() {
        scroll.start();
      },
      rebuild: build,
      cycle: () => 0,
      targets: [],
      scroller: () => scroller,
      scrollLinked: true,
      stopScroll: () => scroll.stop(),
    };
    cleanups.push(() => {
      scroll.stop();
      stops.forEach((s) => s());
      inner && inner.destroy();
    });
  }

  const loop = () => {
    if (!looping) return;
    api.play();
    loopTimer = setTimeout(loop, Math.max(1200, api.cycle()));
  };
  return {
    ...api,
    get looping() {
      return looping;
    },
    startLoop(offset = 0) {
      if (looping || reduced()) return;
      looping = true;
      if (api.scrollLinked) api.play();
      else if (offset) loopTimer = setTimeout(loop, offset);
      else loop();
    },
    stopLoop() {
      looping = false;
      clearTimeout(loopTimer);
      if (api.scrollLinked) api.stopScroll();
    },
    update(next) {
      st = { ...next };
      if (api.rebuild) api.rebuild();
    },
    destroy() {
      this.stopLoop();
      clearTimers();
      cleanups.forEach((fn) => fn());
      (api.targets || []).forEach((el) => {
        try {
          sa.unobserve(el);
        } catch {
          /* not observed */
        }
      });
    },
  };
}

/* ------------------------------------------------------------------ */
/* Grid                                                                */
/* ------------------------------------------------------------------ */

const cards = new Map(); // id -> { el, demo }

function kindLabel(item) {
  if (item.kind === 'preset') return ui.lang === 'zh' ? '预设' : 'Preset';
  if (item.kind === 'feature') return ui.lang === 'zh' ? '功能' : 'Feature';
  return ui.lang === 'zh' ? '框架' : 'Framework';
}

function favButton(item) {
  const on = ui.favs.has(item.id);
  const btn = h('button', {
    class: 'fav',
    type: 'button',
    'aria-pressed': String(on),
    'aria-label': T(on ? 'card.unfav' : 'card.fav'),
    'data-fav': item.id,
    html: ICON.heart,
  });
  return btn;
}

function toggleFav(id) {
  const on = !ui.favs.has(id);
  if (on) ui.favs.add(id);
  else ui.favs.delete(id);
  store.set('favs', Array.from(ui.favs));
  $$(`[data-fav="${CSS.escape(id)}"]`).forEach((b) => {
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', T(on ? 'card.unfav' : 'card.fav'));
    pop(b);
  });
  toast(T(on ? 'toast.fav' : 'toast.unfav'));
  renderChips();
  if (ui.cat === 'fav') applyFilter(true);
}

function buildCard(item) {
  const stage = h('div', { class: 'card-stage', 'data-cat': item.category, 'data-fw': item.framework });
  const el = h('article', { class: 'card', 'data-id': item.id, 'data-cat': item.category }, [
    stage,
    h('span', { class: 'badge', text: kindLabel(item) }),
    h('div', { class: 'card-body' }, [
      h('h3', { class: 'card-title' }, [h('span', { class: 'ttl', text: L(item.title) }), h('code', { text: item.id })]),
      h('p', { class: 'card-desc', text: L(item.desc) }),
      h('ul', { class: 'tags' }, (item.tags || []).slice(0, 3).map((tg) => h('li', { class: 'tag', text: tg }))),
      h('div', { class: 'card-foot' }, [h('span', { class: 'price', text: T('card.free') }), h('span', { class: 'get', html: `<span>${T('card.get')}</span>${ICON.arrow}` })]),
    ]),
    h('a', { class: 'card-link', href: `#${item.id}`, 'aria-label': T('card.open', { name: L(item.title) }) }),
    favButton(item),
  ]);
  const demo = createDemo(item, stage, defaultState(item), { firstReveal: true });
  return { el, demo, stage };
}

function updateCardText(item, card) {
  $('.ttl', card.el).textContent = L(item.title);
  $('.card-desc', card.el).textContent = L(item.desc);
  $('.badge', card.el).textContent = kindLabel(item);
  $('.price', card.el).textContent = T('card.free');
  $('.get span', card.el).textContent = T('card.get');
  $('.card-link', card.el).setAttribute('aria-label', T('card.open', { name: L(item.title) }));
  const fav = $('.fav', card.el);
  fav.setAttribute('aria-label', T(ui.favs.has(item.id) ? 'card.unfav' : 'card.fav'));
}

function renderGrid() {
  const grid = $('#grid');
  grid.textContent = '';
  ITEMS.forEach((item) => {
    const card = buildCard(item);
    cards.set(item.id, card);
    grid.append(card.el);
  });
  // Cards enter with the library's own stagger as they scroll into view
  lib.default.observe(
    Array.from(cards.values()).map((c) => c.el),
    { animation: 'fade-in-up', duration: 600, easing: 'soft-spring', stagger: 60, threshold: 0.05 }
  );
  wirePreviews();
}

function wirePreviews() {
  // Desktop: loop while hovered / focused. Touch: loop while (mostly) on screen.
  const hoverIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const card = cards.get(e.target.dataset.id);
        if (!card) return;
        // de-synchronise neighbouring cards so the grid doesn't blink in unison
        if (touchq.matches && e.isIntersecting && e.intersectionRatio >= 0.55) card.demo.startLoop(400 + Math.random() * 1200);
        else if (touchq.matches) card.demo.stopLoop();
      });
    },
    { threshold: [0, 0.55, 1] }
  );
  cards.forEach((card) => {
    hoverIO.observe(card.el);
    card.el.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && card.demo.startLoop());
    card.el.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && card.demo.stopLoop());
    card.el.addEventListener('focusin', () => card.demo.startLoop());
    card.el.addEventListener('focusout', () => card.demo.stopLoop());
  });
}

function visibleItems() {
  return ITEMS.filter((item) => {
    if (ui.cat === 'fav' && !ui.favs.has(item.id)) return false;
    if (ui.cat !== 'all' && ui.cat !== 'fav' && item.category !== ui.cat) return false;
    return matches(item, ui.query);
  });
}

function applyFilter(animate) {
  const show = new Set(visibleItems().map((i) => i.id));
  const update = () => {
    cards.forEach((card, id) => {
      const hide = !show.has(id);
      if (card.el.hidden !== hide) card.el.hidden = hide;
      if (hide) card.demo.stopLoop();
    });
    $('#results').textContent = show.size === 1 ? T('results.one') : T('results.count', { n: show.size });
    $('#empty').hidden = show.size > 0;
  };
  if (animate && canVT() && !detailOpen()) {
    const named = [];
    cards.forEach((card, id) => {
      if (!card.el.hidden || show.has(id)) {
        card.el.style.viewTransitionName = `card-${id}`;
        named.push(card.el);
      }
    });
    const vt = document.startViewTransition(update);
    vt.finished.finally(() => named.forEach((el) => (el.style.viewTransitionName = '')));
  } else update();
}

function renderChips() {
  const chips = $('#chips');
  const counts = {};
  ITEMS.forEach((i) => (counts[i.category] = (counts[i.category] || 0) + 1));
  const defs = [
    { id: 'all', label: T('filter.all'), n: ITEMS.length },
    { id: 'fav', label: `♥ ${T('filter.favorites')}`, n: ui.favs.size },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c[ui.lang] || c.en, n: counts[c.id] || 0 })),
  ];
  chips.textContent = '';
  defs.forEach((d) => {
    chips.append(
      h('button', { class: 'chip', type: 'button', 'aria-pressed': String(ui.cat === d.id), 'data-cat': d.id }, [
        h('span', { text: d.label }),
        h('span', { class: 'count', text: String(d.n) }),
      ])
    );
  });
}

/* ------------------------------------------------------------------ */
/* Detail view                                                         */
/* ------------------------------------------------------------------ */

const detail = {
  id: null,
  item: null,
  state: null,
  demo: null,
  scrollTest: null,
  mode: 'play',
  tab: 'vanilla',
  pushed: false,
  lastFocus: null,
  replayTimer: 0,
};
const detailOpen = () => !!detail.id;

const SELECT = (values, labels) => ({ type: 'select', values, labels });
function controlDefs() {
  const names = presetNames();
  return {
    animation: { ...SELECT(names), label: 'opt.animation' },
    duration: { type: 'range', min: 100, max: 2500, step: 50, unit: 'ms', label: 'opt.duration' },
    delay: { type: 'range', min: 0, max: 1500, step: 50, unit: 'ms', label: 'opt.delay' },
    easing: { ...SELECT(EASINGS), label: 'opt.easing' },
    distance: { type: 'range', min: 0, max: 200, step: 5, unit: 'px', label: 'opt.distance' },
    mode: { type: 'seg', values: ['once', 'repeat'], labels: [T('opt.once'), T('opt.repeat')], label: 'opt.mode' },
    exit: { ...SELECT(['none', 'reverse', ...names], [T('opt.exitNone'), T('opt.exitReverse'), ...names]), label: 'opt.exit' },
    stagger: { type: 'range', min: 0, max: 300, step: 10, unit: 'ms', label: 'opt.stagger' },
    speed: { type: 'range', min: -0.6, max: 0.6, step: 0.05, unit: '', label: 'opt.speed' },
    axis: { type: 'seg', values: ['y', 'x'], labels: ['Y', 'X'], label: 'opt.axis' },
    progressMode: { type: 'seg', values: ['scroll', 'ratio'], labels: ['scroll', 'ratio'], label: 'opt.progressMode' },
    engine: { type: 'seg', values: ['css', 'auto', 'js'], labels: ['css', 'auto', 'js'], label: 'opt.engine' },
    viewStart: { ...SELECT(['entry 0%', 'entry 50%', 'cover 0%', 'cover 20%']), label: 'opt.viewStart' },
    viewEnd: { ...SELECT(['entry 100%', 'cover 40%', 'cover 50%', 'contain 50%']), label: 'opt.viewEnd' },
    gap: { type: 'range', min: -500, max: 400, step: 50, unit: 'ms', label: 'opt.gap' },
  };
}

function controlsFor(item) {
  switch (item.recipe) {
    case 'stagger':
      return ['animation', 'stagger', 'duration', 'easing'];
    case 'parallax':
      return ['speed', 'axis'];
    case 'progress':
      return ['progressMode'];
    case 'engine':
      return ['animation', 'engine', 'viewStart', 'viewEnd'];
    case 'sequence':
      return ['duration', 'gap'];
    default: {
      const list = item.kind === 'preset' || Array.isArray(item.preset) ? [] : ['animation'];
      list.push('duration', 'delay', 'easing');
      if (presetDistance(lib.PRESETS, detail.state.preset) !== null) list.push('distance');
      list.push('mode', 'exit');
      return list;
    }
  }
}

function controlValue(key) {
  const st = detail.state;
  if (key === 'animation') return st.preset;
  if (key === 'distance') return st.distance ?? presetDistance(lib.PRESETS, st.preset);
  return st[key];
}

function renderControls(box) {
  const defs = controlDefs();
  box.textContent = '';
  const keys = controlsFor(detail.item);
  keys.forEach((key) => {
    const def = defs[key];
    const id = `ctl-${key}`;
    const value = controlValue(key);
    const wrap = h('div', { class: 'ctl' });
    if (def.type === 'range') {
      const out = h('output', { for: id, text: `${value}${def.unit}` });
      const input = h('input', { id, type: 'range', min: def.min, max: def.max, step: def.step, value, 'data-key': key });
      wrap.append(h('label', { for: id }, [h('span', { text: T(def.label) }), out]), input);
    } else if (def.type === 'select') {
      const sel = h('select', { id, 'data-key': key });
      def.values.forEach((v, i) => sel.append(h('option', { value: v, text: def.labels ? def.labels[i] : v, selected: String(v) === String(value) })));
      wrap.append(h('label', { for: id }, [h('span', { text: T(def.label) })]), sel);
    } else {
      const seg = h('div', { class: 'seg', role: 'group', 'aria-labelledby': `${id}-l` });
      def.values.forEach((v, i) =>
        seg.append(h('button', { type: 'button', 'data-key': key, 'data-value': v, 'aria-pressed': String(v === value), text: def.labels[i] }))
      );
      if (key === 'mode' && detail.state.exit !== 'none') {
        // exit implies repeat
        seg.querySelectorAll('button').forEach((b) => (b.disabled = true));
      }
      wrap.append(h('span', { class: 'lbl', id: `${id}-l` }, [h('span', { text: T(def.label) })]), seg);
    }
    box.append(wrap);
  });
  box.append(h('button', { class: 'reset ctl wide', type: 'button', 'data-reset': true, text: T('opt.reset') }));
}

function onControl(key, raw) {
  const st = detail.state;
  const defs = controlDefs();
  const def = defs[key];
  const value = def.type === 'range' ? Number(raw) : raw;
  let rerender = false;
  if (key === 'animation') {
    st.preset = value;
    st.distance = null;
    rerender = true;
  } else st[key] = value;
  if (key === 'exit' || key === 'animation') rerender = true;
  if (def.type === 'range') {
    const out = $(`output[for="ctl-${key}"]`);
    if (out) out.textContent = `${value}${def.unit}`;
  }
  if (rerender) renderControls($('#controls'));
  else if (def.type === 'seg') $$(`button[data-key="${key}"]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
  refreshCode();
  scheduleReplay();
}

function scheduleReplay() {
  clearTimeout(detail.replayTimer);
  detail.replayTimer = setTimeout(() => {
    if (!detail.demo) return;
    detail.demo.update(detail.state);
    if (detail.mode === 'scroll') buildScrollTest();
    else if (!detail.demo.scrollLinked) detail.demo.play();
    else if (detail.demo.looping) {
      detail.demo.stopLoop();
      detail.demo.startLoop();
    }
    renderKeyframes();
  }, 220);
}

function snippets() {
  return generate(detail.item, detail.state, lib.PRESETS);
}

function refreshCode() {
  const code = snippets()[detail.tab];
  const pre = $('#code-pre');
  if (!pre) return;
  pre.innerHTML = highlight(code);
  pre.dataset.raw = code;
}

function renderKeyframes() {
  const box = $('#keyframes');
  if (!box) return;
  const anim = animationValue(lib.PRESETS, detail.state);
  const kf = lib.resolvePreset(anim);
  const fmt = (o) => Object.entries(o).map(([k, v]) => `${k}: ${v}`).join('\n');
  box.querySelector('[data-from]').textContent = fmt(kf.from);
  box.querySelector('[data-to]').textContent = fmt(kf.to);
}

function selectTab(id, focus) {
  detail.tab = id;
  if (!detail.item.framework) {
    ui.tab = id;
    store.set('tab', id);
  }
  $$('.tab').forEach((b) => {
    const on = b.dataset.tab === id;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
    if (on && focus) b.focus();
  });
  $('#code-pre').setAttribute('aria-labelledby', `tab-${id}`);
  refreshCode();
}

function buildScrollTest() {
  const stage = $('#big-stage');
  if (detail.scrollTest) detail.scrollTest.destroy();
  stage.textContent = '';
  const track = h('div', { class: 'scroll-track', tabindex: '0', 'aria-label': T('detail.scrollHint') });
  const inner = h('div', { class: 'scroll-track-inner' });
  for (let i = 0; i < 3; i++) inner.append(h('div', { class: 'obj', 'data-cat': detail.item.category, 'data-fw': detail.item.framework }));
  track.append(inner);
  stage.append(h('span', { class: 'scroll-hint', text: T('detail.scrollHint') }), track);
  // Exactly the options shown in the code, on an instance scoped to this box
  const inst = lib.createScrollAnimate({ root: track });
  const opts = revealOptions(lib.PRESETS, detail.state);
  inst.observe(Array.from(inner.children), opts);
  const scroll = autoScroll(track, 'y', 6000);
  detail.scrollTest = {
    destroy() {
      scroll.stop();
      inst.destroy();
    },
    scroll,
  };
}

function setMode(mode) {
  detail.mode = mode;
  $$('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  const stage = $('#big-stage');
  if (mode === 'scroll') {
    detail.demo && detail.demo.stopLoop();
    buildScrollTest();
  } else {
    if (detail.scrollTest) detail.scrollTest.destroy();
    detail.scrollTest = null;
    mountDetailDemo(stage);
    detail.demo.play();
  }
  updateLoopButton();
}

function mountDetailDemo(stage) {
  if (detail.demo) detail.demo.destroy();
  stage.textContent = '';
  stage.dataset.cat = detail.item.category;
  if (detail.item.framework) stage.dataset.fw = detail.item.framework;
  else delete stage.dataset.fw;
  detail.demo = createDemo(detail.item, stage, detail.state);
}

function updateLoopButton() {
  const btn = $('[data-loop]');
  if (!btn) return;
  const on = detail.mode === 'scroll' ? false : !!(detail.demo && detail.demo.looping);
  btn.setAttribute('aria-pressed', String(on));
  btn.innerHTML = `${on ? ICON.pause : ICON.play}<span>${T(on ? 'detail.pause' : 'detail.play')}</span>`;
}

function liveNote(item) {
  if (item.framework === 'element') return T('detail.live', { what: '<scroll-animate> (dist/element.js)' });
  if (item.framework === 'svelte') return T('detail.live', { what: 'scrollAnimate action (dist/svelte.js)' }) + ' ' + T('detail.demoNote');
  if (item.framework) return T('detail.demoNote');
  if (item.recipe === 'parallax') return T('detail.live', { what: 'parallax()' }) + ' ' + T('detail.paraNote');
  if (item.recipe === 'engine') return T('detail.engineInfo', { v: T(lib.supportsScrollTimeline() ? 'detail.yes' : 'detail.no') });
  const what = { stagger: 'staggerChildren()', parallax: 'parallax()', progress: 'progressVar', sequence: 'timeline()' }[item.recipe] || 'ScrollAnimate.animate() / observe()';
  return T('detail.live', { what });
}

function renderDetail(item, keepState) {
  const sheet = $('#detail-sheet');
  if (!keepState) {
    detail.state = defaultState(item);
    detail.mode = 'play';
    detail.tab = item.framework ? defaultTab(item) : ui.tab || defaultTab(item);
  }
  detail.item = item;
  detail.id = item.id;
  if (detail.demo) detail.demo.destroy();
  if (detail.scrollTest) detail.scrollTest.destroy();
  detail.demo = null;
  detail.scrollTest = null;
  sheet.textContent = '';

  const fav = favButton(item);
  const head = h('div', { class: 'detail-head' }, [
    h('button', { class: 'back-btn', type: 'button', 'data-close': true, html: `${ICON.back}<span>${T('detail.back')}</span>` }),
    h('h2', { id: 'detail-title' }, [document.createTextNode(L(item.title) + ' ')]),
    h('button', { class: 'pill-btn copy', type: 'button', 'data-copylink': true, 'aria-label': T('detail.copyLink'), html: `${ICON.link}<span class="idle">${T('detail.copyLink')}</span><span class="ok">${T('detail.copied')}</span>` }),
    fav,
  ]);
  const stage = h('div', { class: 'big-stage', id: 'big-stage' });
  const isReveal = item.recipe === 'reveal';
  const bar = h('div', { class: 'stage-bar' });
  if (item.recipe === 'parallax' || item.recipe === 'progress' || item.recipe === 'engine') {
    bar.append(h('button', { class: 'pill-btn primary', type: 'button', 'data-loop': true }));
  } else {
    bar.append(h('button', { class: 'pill-btn primary', type: 'button', 'data-replay': true, html: `${ICON.replay}<span>${T('detail.replay')}</span>` }));
    bar.append(h('button', { class: 'pill-btn', type: 'button', 'data-loop': true }));
  }
  if (isReveal) {
    bar.append(
      h('div', { class: 'seg', role: 'group', 'aria-label': 'Mode' }, [
        h('button', { type: 'button', 'data-mode': 'play', 'aria-pressed': 'true', text: T('detail.modePlay') }),
        h('button', { type: 'button', 'data-mode': 'scroll', 'aria-pressed': 'false', text: T('detail.modeScroll') }),
      ])
    );
  }
  const left = h('div', { class: 'detail-left' }, [stage, bar, h('p', { class: 'stage-note', text: liveNote(item) })]);

  const right = h('div', { class: 'detail-right' });
  right.append(
    h('div', {}, [
      h('p', { class: 'detail-desc', text: L(item.desc) }),
      h('ul', { class: 'tags', style: 'margin-top:10px' }, [item.id, ...(item.tags || [])].map((tg) => h('li', { class: 'tag', text: tg }))),
    ])
  );
  if (isReveal || item.recipe === 'stagger' || item.recipe === 'engine') {
    right.append(
      h('section', { id: 'keyframes' }, [
        h('h3', { class: 'section-title', text: T('detail.keyframes') }),
        h('div', { class: 'kf' }, [h('pre', { 'data-from': true }), h('span', { class: 'arrow', html: ICON.arrow }), h('pre', { 'data-to': true })]),
      ])
    );
  }
  right.append(
    h('section', {}, [h('h3', { class: 'section-title', text: T('detail.options') }), h('div', { class: 'controls', id: 'controls' })]),
    h('section', {}, [
      h('h3', { class: 'section-title', text: T('detail.install') }),
      h('div', { class: 'install' }, [
        h('div', { class: 'seg', role: 'group', 'aria-label': T('detail.install') }, Object.keys(INSTALL).map((pm) => h('button', { type: 'button', 'data-pm': pm, 'aria-pressed': String(pm === ui.pm), text: pm }))),
        h('code', { id: 'install-cmd', text: INSTALL[ui.pm] }),
        h('button', { class: 'pill-btn copy', type: 'button', 'data-copy-install': true, html: `${ICON.copy}<span class="idle">${T('detail.copy')}</span><span class="ok">${T('detail.copied')}</span>` }),
      ]),
    ]),
    h('section', {}, [
      h('h3', { class: 'section-title', text: T('detail.code') }),
      h(
        'div',
        { class: 'tabs', role: 'tablist', 'aria-label': T('detail.code') },
        TABS.map((tb) => h('button', { class: 'tab', role: 'tab', id: `tab-${tb.id}`, type: 'button', 'data-tab': tb.id, 'aria-controls': 'code-pre', 'aria-selected': 'false', tabindex: '-1', text: tb.label }))
      ),
      h('div', { class: 'code-box' }, [
        h('pre', { id: 'code-pre', role: 'tabpanel', tabindex: '0' }),
        h('button', { class: 'pill-btn copy', type: 'button', 'data-copy-code': true, html: `${ICON.copy}<span class="idle">${T('detail.copy')}</span><span class="ok">${T('detail.copied')}</span>` }),
      ]),
    ])
  );
  const related = ITEMS.filter((i) => i.category === item.category && i.id !== item.id).slice(0, 6);
  if (related.length) {
    right.append(
      h('section', {}, [
        h('h3', { class: 'section-title', text: T('detail.related') }),
        h(
          'div',
          { class: 'related' },
          related.map((r) =>
            h('a', { class: 'mini', href: `#${r.id}`, 'data-related': r.id }, [
              h('div', { class: 'mini-stage', 'data-cat': r.category, 'data-fw': r.framework }, [h('div', { class: 'obj' + (r.glyph ? ' glyph' : ''), text: r.glyph || '' })]),
              h('span', { text: L(r.title) }),
            ])
          )
        ),
      ])
    );
  }
  right.append(
    h('div', { class: 'detail-links' }, [
      h('a', { href: 'https://github.com/HarrisonCN/use-scroll-animate/blob/main/docs/API.md', target: '_blank', rel: 'noopener', text: `${T('detail.docs')} ↗` }),
      h('a', { href: 'https://github.com/HarrisonCN/use-scroll-animate', target: '_blank', rel: 'noopener', text: 'GitHub ↗' }),
    ])
  );

  sheet.append(head, h('div', { class: 'detail-body' }, [left, right]));
  mountDetailDemo(stage);
  renderControls($('#controls', sheet));
  if (isReveal || item.recipe === 'stagger' || item.recipe === 'engine') renderKeyframes();
  selectTab(detail.tab);
  updateLoopButton();
  if (detail.mode === 'scroll') setMode('scroll');
}

function startDetailMotion() {
  if (!detail.demo || reduced()) return;
  if (detail.demo.scrollLinked) detail.demo.startLoop();
  else {
    detail.demo.startLoop();
  }
  updateLoopButton();
}

function setInert(on) {
  ['main', '.topbar', '.footer'].forEach((sel) => {
    const el = $(sel);
    if (!el) return;
    if (on) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
}

function cardFor(id) {
  const c = cards.get(id);
  return c && !c.el.hidden ? c : null;
}

function openDetail(id, { fromCard = true } = {}) {
  const item = findItem(id);
  if (!item) return;
  const root = $('#detail');
  const sheet = $('#detail-sheet');
  const switching = detailOpen();
  if (detail.id === id) return;
  detail.id = id; // claim it now: popstate + hashchange both call route()
  detail.lastFocus = switching ? detail.lastFocus : document.activeElement;
  cards.forEach((c) => c.demo.stopLoop());
  const card = fromCard ? cardFor(id) : null;

  const show = () => {
    renderDetail(item);
    root.hidden = false;
    document.documentElement.classList.add('locked');
    setInert(true);
  };
  const after = () => {
    $('.back-btn', sheet)?.focus({ preventScroll: true });
    startDetailMotion();
  };

  if (switching) {
    // Related item: cross-fade the sheet
    const vt = canVT() ? document.startViewTransition(show) : null;
    if (!vt) show();
    (vt ? vt.finished : Promise.resolve()).finally(after);
    return;
  }

  if (canVT() && card) {
    card.el.style.viewTransitionName = 'sa-sheet';
    card.stage.style.viewTransitionName = 'sa-stage';
    const vt = document.startViewTransition(() => {
      card.el.style.viewTransitionName = '';
      card.stage.style.viewTransitionName = '';
      show();
      sheet.style.viewTransitionName = 'sa-sheet';
      $('#big-stage').style.viewTransitionName = 'sa-stage';
    });
    vt.finished.finally(() => {
      sheet.style.viewTransitionName = '';
      const bs = $('#big-stage');
      if (bs) bs.style.viewTransitionName = '';
      after();
    });
    return;
  }

  show();
  if (!reduced()) flipIn(card);
  after();
}

/** FLIP fallback: grow the sheet out of the card with transform + opacity only. */
function flipIn(card) {
  const sheet = $('#detail-sheet');
  const backdrop = $('.detail-backdrop');
  backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
  const to = sheet.getBoundingClientRect();
  let first;
  if (card) {
    const r = card.el.getBoundingClientRect();
    first = `translate(${r.left - to.left}px, ${r.top - to.top}px) scale(${r.width / to.width}, ${r.height / to.height})`;
  } else first = 'translateY(24px) scale(0.98)';
  sheet.animate([{ transform: first, opacity: card ? 0.6 : 0 }, { transform: 'none', opacity: 1 }], { duration: 440, easing: 'cubic-bezier(.2,.8,.2,1)' });
  Array.from(sheet.children).forEach((c) => c.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration: 460, easing: 'ease-out' }));
}

function flipOut(card) {
  const sheet = $('#detail-sheet');
  const backdrop = $('.detail-backdrop');
  const from = sheet.getBoundingClientRect();
  let last = 'translateY(24px) scale(0.98)';
  if (card) {
    const r = card.el.getBoundingClientRect();
    last = `translate(${r.left - from.left}px, ${r.top - from.top}px) scale(${r.width / from.width}, ${r.height / from.height})`;
  }
  backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
  Array.from(sheet.children).forEach((c) => c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }));
  return sheet.animate([{ transform: 'none', opacity: 1 }, { transform: last, opacity: card ? 0.5 : 0 }], { duration: 360, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished;
}

function closeDetail() {
  if (!detailOpen()) return;
  const id = detail.id;
  detail.id = null; // closing (guards the second route() from hashchange)
  const root = $('#detail');
  const sheet = $('#detail-sheet');
  const card = cardFor(id);
  clearTimeout(detail.replayTimer);
  const hide = () => {
    if (detail.demo) detail.demo.destroy();
    if (detail.scrollTest) detail.scrollTest.destroy();
    detail.demo = detail.scrollTest = null;
    if (!detail.id) detail.item = null;
    root.hidden = true;
    sheet.textContent = '';
    sheet.getAnimations().forEach((a) => a.cancel());
    $$('.detail-backdrop, #detail-sheet > *').forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    document.documentElement.classList.remove('locked');
    setInert(false);
  };
  const focusBack = () => {
    const target = card ? $('.card-link', card.el) : detail.lastFocus;
    if (target && target.focus) target.focus({ preventScroll: true });
  };
  if (card) {
    const r = card.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) card.el.scrollIntoView({ block: 'center' });
  }
  if (canVT() && card) {
    sheet.style.viewTransitionName = 'sa-sheet';
    const bs = $('#big-stage');
    if (bs) bs.style.viewTransitionName = 'sa-stage';
    const vt = document.startViewTransition(() => {
      hide();
      sheet.style.viewTransitionName = '';
      card.el.style.viewTransitionName = 'sa-sheet';
      card.stage.style.viewTransitionName = 'sa-stage';
    });
    vt.finished.finally(() => {
      card.el.style.viewTransitionName = '';
      card.stage.style.viewTransitionName = '';
      focusBack();
    });
    return;
  }
  if (reduced()) {
    hide();
    focusBack();
    return;
  }
  flipOut(card).finally(() => {
    hide();
    focusBack();
  });
}

/* ------------------------------------------------------------------ */
/* Routing: #preset-name deep links, back/forward without reload       */
/* ------------------------------------------------------------------ */

function hashId() {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return '';
  }
}

function route() {
  const id = hashId();
  if (id && findItem(id)) {
    if (detail.id !== id) openDetail(id, { fromCard: !detailOpen() });
  } else if (detailOpen()) closeDetail();
}

function navigateTo(id) {
  if (detailOpen()) history.replaceState({ sa: id }, '', `#${id}`);
  else {
    history.pushState({ sa: id }, '', `#${id}`);
    detail.pushed = true;
  }
  openDetail(id);
}

function requestClose() {
  if (detail.pushed && history.state && history.state.sa) {
    detail.pushed = false;
    history.back(); // popstate -> route() -> closeDetail()
  } else {
    history.replaceState(null, '', location.pathname + location.search);
    closeDetail();
  }
}

/* ------------------------------------------------------------------ */
/* i18n / theme                                                        */
/* ------------------------------------------------------------------ */

function applyLang() {
  document.documentElement.lang = ui.lang === 'zh' ? 'zh-CN' : 'en';
  $$('[data-i18n]').forEach((el) => (el.textContent = T(el.dataset.i18n)));
  $$('[data-i18n-html]').forEach((el) => (el.innerHTML = T(el.dataset.i18nHtml)));
  $$('[data-i18n-placeholder]').forEach((el) => el.setAttribute('placeholder', T(el.dataset.i18nPlaceholder)));
  $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', T(el.dataset.i18nAria)));
  if (lib) {
    ITEMS.forEach((item) => cards.has(item.id) && updateCardText(item, cards.get(item.id)));
    renderChips();
    applyFilter(false);
    if (detailOpen()) {
      renderDetail(detail.item, true);
      startDetailMotion();
    }
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY + 'theme', theme);
  } catch {
    /* ignore */
  }
  $('meta[name="theme-color"]').setAttribute('content', theme === 'light' ? '#f6f7fb' : '#0b0d12');
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

function wireEvents() {
  $('#theme-toggle').addEventListener('click', (e) => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    const btn = e.currentTarget;
    if (canVT()) document.startViewTransition(() => setTheme(next));
    else setTheme(next);
    if (!reduced()) btn.animate([{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(180deg) scale(0.8)' }, { transform: 'rotate(360deg) scale(1)' }], { duration: 500, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  });
  $('#lang-toggle').addEventListener('click', (e) => {
    ui.lang = ui.lang === 'zh' ? 'en' : 'zh';
    try {
      localStorage.setItem(KEY + 'lang', ui.lang);
    } catch {
      /* ignore */
    }
    pop(e.currentTarget);
    applyLang();
  });
  $('#hero-install').addEventListener('click', (e) => copyWithFeedback(e.currentTarget, INSTALL.npm));

  let searchTimer = 0;
  const search = $('#search');
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      ui.query = search.value;
      applyFilter(true);
    }, 140);
  });
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && search.value) {
      search.value = '';
      ui.query = '';
      applyFilter(true);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !detailOpen() && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) {
      e.preventDefault();
      search.focus();
    }
    if (e.key === 'Escape' && detailOpen()) {
      e.preventDefault();
      requestClose();
    }
  });

  $('#chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    ui.cat = chip.dataset.cat;
    $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    pop(chip);
    applyFilter(true);
  });
  $('#clear-filters').addEventListener('click', () => {
    ui.cat = 'all';
    ui.query = '';
    search.value = '';
    renderChips();
    applyFilter(true);
  });

  $('#grid').addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      e.preventDefault();
      toggleFav(fav.dataset.fav);
      return;
    }
    const link = e.target.closest('.card-link');
    if (link && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button)) {
      e.preventDefault();
      navigateTo(link.closest('.card').dataset.id);
    }
  });

  const root = $('#detail');
  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-close]')) return requestClose();
    const fav = t.closest('[data-fav]');
    if (fav) return toggleFav(fav.dataset.fav);
    const rel = t.closest('[data-related]');
    if (rel && !(e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      return navigateTo(rel.dataset.related);
    }
    if (t.closest('[data-replay]')) {
      if (detail.mode === 'scroll') return buildScrollTest();
      return detail.demo && detail.demo.play();
    }
    if (t.closest('[data-loop]')) {
      if (detail.mode === 'scroll') setMode('play');
      if (detail.demo.looping) detail.demo.stopLoop();
      else detail.demo.startLoop();
      return updateLoopButton();
    }
    const mode = t.closest('[data-mode]');
    if (mode) return setMode(mode.dataset.mode);
    const seg = t.closest('button[data-key]');
    if (seg && !seg.disabled) return onControl(seg.dataset.key, seg.dataset.value);
    if (t.closest('[data-reset]')) {
      detail.state = defaultState(detail.item);
      renderControls($('#controls'));
      refreshCode();
      return scheduleReplay();
    }
    const pm = t.closest('[data-pm]');
    if (pm) {
      ui.pm = pm.dataset.pm;
      store.set('pm', ui.pm);
      $$('[data-pm]').forEach((b) => b.setAttribute('aria-pressed', String(b === pm)));
      $('#install-cmd').textContent = INSTALL[ui.pm];
      return;
    }
    const cbtn = t.closest('[data-copy-install]');
    if (cbtn) return copyWithFeedback(cbtn, INSTALL[ui.pm]);
    const code = t.closest('[data-copy-code]');
    if (code) return copyWithFeedback(code, $('#code-pre').dataset.raw);
    const link = t.closest('[data-copylink]');
    if (link) return copyWithFeedback(link, location.href, T('toast.link'));
    const tab = t.closest('.tab');
    if (tab) return selectTab(tab.dataset.tab);
  });
  root.addEventListener('input', (e) => {
    const k = e.target.dataset && e.target.dataset.key;
    if (k && (e.target.type === 'range')) onControl(k, e.target.value);
  });
  root.addEventListener('change', (e) => {
    const k = e.target.dataset && e.target.dataset.key;
    if (k && e.target.tagName === 'SELECT') onControl(k, e.target.value);
  });
  root.addEventListener('keydown', (e) => {
    const tab = e.target.closest && e.target.closest('.tab');
    if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const ids = TABS.map((x) => x.id);
      let i = ids.indexOf(tab.dataset.tab);
      if (e.key === 'ArrowLeft') i = (i - 1 + ids.length) % ids.length;
      if (e.key === 'ArrowRight') i = (i + 1) % ids.length;
      if (e.key === 'Home') i = 0;
      if (e.key === 'End') i = ids.length - 1;
      selectTab(ids[i], true);
    }
    if (e.key === 'Tab') {
      // keep focus inside the dialog
      const f = $$('button:not([disabled]), a[href], input, select, [tabindex="0"]', $('#detail-sheet')).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    }
  });

  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);
  rmq.addEventListener?.('change', () => {
    $('#rm-notice').hidden = !reduced();
    if (reduced()) cards.forEach((c) => c.demo.stopLoop());
  });
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

function heroMotion() {
  // Dogfooding on the page itself: staggered hero copy + parallax orbs
  lib.staggerChildren($('#hero-copy'), { animation: 'fade-in-up', duration: 700, easing: 'soft-spring', stagger: 90 });
  const orbs = $$('.orb');
  lib.default.observe(orbs, { animation: 'zoom-in', duration: 900, easing: 'spring', stagger: 120 });
  lib.parallax(orbs[0], { speed: 0.25 });
  lib.parallax(orbs[1], { speed: -0.15 });
  lib.parallax(orbs[2], { speed: 0.4 });
}

async function boot() {
  wireEvents();
  applyLang();
  $('#rm-notice').hidden = !reduced();
  try {
    await loadLibrary();
  } catch (err) {
    $('#grid').innerHTML = '';
    $('#results').textContent = 'Could not load use-scroll-animate (../dist or CDN).';
    console.error(err);
    return;
  }
  heroMotion();
  renderChips();
  renderGrid();
  applyFilter(false);
  document.documentElement.classList.add('ready');
  if (hashId() && findItem(hashId())) openDetail(hashId(), { fromCard: false });
  // expose for debugging / tests
  window.__showcase = { lib, ui, detail, cards };
}

boot();
