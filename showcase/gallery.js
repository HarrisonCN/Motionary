/**
 * use-scroll-animate showcase — <usa-*> component gallery.
 * No build step: imports the component bundle from ../dist/ (dogfooding the
 * ESM build), falling back to the CDN. Every preview is a real element.
 */
import { COMPONENT_CATEGORIES, COMPONENTS, GALLERY, CODE_TABS, componentSnippets, matchesComponent, findComponent } from './components-catalog.js';
import { highlight } from './codegen.js';
import { GSTRINGS } from './gallery-i18n.js';
import { WIRES } from './catalog/index.js';

const COMPONENTS_COUNT = COMPONENTS.length;
const LOCAL = new URL('../dist/', import.meta.url).href;
const CDN = 'https://unpkg.com/use-scroll-animate@3/dist/';
const KEY = 'usa-showcase:';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const rmq = matchMedia('(prefers-reduced-motion: reduce)');

const store = {
  get: (k, d) => {
    try {
      const v = localStorage.getItem(KEY + k);
      return v === null ? d : v;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(KEY + k, v);
    } catch {
      /* private mode */
    }
  },
};

const ui = { lang: store.get('lang', (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'), cat: 'all', q: '', open: null };
const T = (k) => (GSTRINGS[ui.lang] || GSTRINGS.en)[k] ?? GSTRINGS.en[k] ?? k;
const L = (o) => (o ? o[ui.lang] || o.en : '');
let lib = null;

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

async function loadLibrary() {
  try {
    lib = await import(LOCAL + 'components.js');
  } catch {
    lib = await import(CDN + 'components.js');
  }
  lib.defineComponents();
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

function card(item) {
  const id = `c-${item.id}`;
  const stage = h('div', { class: 'ccard-stage', html: item.demo });
  const controls = h('div', { class: 'ccard-controls' });
  if (item.controls) {
    for (const c of item.controls) {
      const sel = h('select', { 'aria-label': c.key, 'data-control': c.key });
      const current = new RegExp(`\\b${c.key}="([^"]+)"`).exec(item.demo)?.[1];
      c.values.forEach((v) => sel.append(h('option', { value: v, text: v, selected: v === current })));
      sel.addEventListener('change', () => {
        $$(item.tag || '[data-usa-variant]', stage).forEach((el) => {
          if (sel.value === '' ) el.removeAttribute(c.key);
          else el.setAttribute(c.key, sel.value);
        });
        // live parameters flow into the copyable code
        item.live = { ...(item.live || {}), [c.key]: sel.value };
        const box = $('.ccard-code', el);
        if (box && !box.hidden) renderCode(item, box);
        replay(item, stage);
      });
      controls.append(sel);
    }
  }
  if (item.replay) controls.append(h('button', { class: 'chip-btn', type: 'button', 'data-i18n': 'card.replay', text: T('card.replay'), onclick: () => replay(item, stage) }));
  const codeBtn = h('button', { class: 'chip-btn code-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': `${id}-code`, html: `<span aria-hidden="true">&lt;/&gt;</span> <span data-i18n="card.code">${T('card.code')}</span>` });
  codeBtn.addEventListener('click', () => toggleCode(item, el));
  controls.append(codeBtn);
  const title = h('h3', { class: 'ccard-title' }, [h('span', { 'data-l': 'title', text: L(item.title) }), h('code', { text: item.kind === 'helper' ? item.fn + '()' : `<${item.tag}>` })]);
  const el = h('article', { class: 'ccard', id, 'data-id': item.id, 'data-category': item.category }, [
    stage,
    h('div', { class: 'ccard-body' }, [
      title,
      h('p', { class: 'ccard-desc', 'data-l': 'desc', text: L(item.desc) }),
      h('ul', { class: 'tags' }, (item.tags || []).map((t) => h('li', { class: 'tag', text: t }))),
      controls,
      h('div', { class: 'ccard-code', id: `${id}-code`, hidden: true }),
    ]),
  ]);
  wire(item, stage);
  return el;
}

function replay(item, stage) {
  for (const el of $$(item.tag, stage)) {
    if (typeof el.reset === 'function' && typeof el.reveal === 'function') {
      el.reset();
      requestAnimationFrame(() => el.reveal());
    } else if (item.tag === 'usa-counter') {
      el.textContent = '';
      el.play(0).then(() => el.play(Math.round(20000 + Math.random() * 900000)));
    } else if (typeof el.play === 'function') el.play();
  }
}

function renderCode(item, box) {
  const snips = componentSnippets(item);
  const tabs = h('div', { class: 'seg code-tabs', role: 'tablist' });
  const pre = h('pre', { tabindex: '0' });
  const copy = h('button', { class: 'chip-btn copy-btn', type: 'button', text: T('code.copy') });
  let current = store.get('ctab', 'html');
  if (!snips[current]) current = 'html';
  const show = (tab) => {
    current = tab;
    store.set('ctab', tab);
    $$('button', tabs).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    pre.innerHTML = `<code>${highlight(snips[tab])}</code>`;
  };
  CODE_TABS.forEach((t) => tabs.append(h('button', { type: 'button', role: 'tab', 'data-tab': t.id, text: t[ui.lang] || t.en, onclick: () => show(t.id) })));
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(snips[current]);
      lib?.toast(T('code.copied'), { type: 'success', duration: 1600 });
    } catch {
      lib?.toast(T('code.copyFail'), { type: 'warning', duration: 2000 });
    }
  });
  box.replaceChildren(tabs, h('div', { class: 'code-box' }, [pre, copy]));
  show(current);
}

async function toggleCode(item, el) {
  const box = $('.ccard-code', el);
  const btn = $('.code-btn', el);
  const open = box.hidden;
  const grid = el.parentElement;
  const mutate = () => {
    if (open) renderCode(item, box);
    box.hidden = !open;
    el.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  // Dogfood flip(): the grid re-flows smoothly when a card widens
  if (lib?.flip) await lib.flip(grid, mutate, { duration: 380 });
  else mutate();
  if (open) el.scrollIntoView({ block: 'nearest', behavior: rmq.matches ? 'auto' : 'smooth' });
}

/* ------------------------------------------------------------------ */
/* Interactive demos                                                   */
/* ------------------------------------------------------------------ */

function wire(item, stage) {
  switch (item.id) {
    case 'scroll-progress': {
      const out = $('[data-progress-out]', stage);
      $('usa-scroll-progress', stage).addEventListener('usa:progress', (e) => {
        out.textContent = `${Math.round(e.detail.progress * 100)}% · ${T('demo.scroll')}`;
      });
      break;
    }
    case 'skeleton':
      $('[data-act=skeleton]', stage).addEventListener('click', () => {
        const s = $('usa-skeleton', stage);
        s.loading = !s.loading;
      });
      break;
    case 'progress': {
      const bar = $('usa-progress[data-act=progress]', stage);
      let v = 10;
      setInterval(() => {
        if (!bar.isConnected || document.hidden) return;
        v = v >= 100 ? 0 : Math.min(100, v + 6 + Math.random() * 14);
        bar.value = Math.round(v);
      }, 900);
      break;
    }
    case 'toaster':
      stage.addEventListener('click', (e) => {
        const b = e.target.closest('[data-toast]');
        if (!b) return;
        const type = b.dataset.toast;
        lib.toast(T(`toast.${type}`), {
          type,
          action: type === 'error' ? { label: T('toast.retry'), onClick: () => lib.toast(T('toast.retrying'), { type: 'info' }) } : undefined,
        });
      });
      break;
    case 'dialog':
      stage.addEventListener('click', (e) => {
        const b = e.target.closest('[data-dialog]');
        if (!b) return;
        const dlg = $('#demo-dialog');
        dlg.setAttribute('kind', b.dataset.dialog);
        dlg.show();
      });
      break;
    case 'flip-list':
      $('[data-act=shuffle]', stage).addEventListener('click', () => {
        const list = $('usa-flip-list', stage);
        const kids = Array.from(list.children);
        for (let i = kids.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [kids[i], kids[j]] = [kids[j], kids[i]];
        }
        list.append(...kids); // the element animates the reorder by itself
      });
      break;
    case 'view-switch': {
      const vs = $('usa-view-switch', stage);
      stage.addEventListener('click', (e) => {
        const b = e.target.closest('[data-view-btn]');
        if (!b) return;
        $$('[data-view-btn]', stage).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
        vs.active = b.dataset.viewBtn;
      });
      break;
    }
    case 'view-transition': {
      const panel = $('[data-vt-panel]', stage);
      let n = 1;
      $('[data-act=vt]', stage).addEventListener('click', () => {
        lib.viewTransition(() => {
          n = (n % 4) + 1;
          panel.textContent = `${T('demo.page')} ${n}`;
          panel.dataset.n = String(n);
        }, { fallback: panel });
      });
      break;
    }
    case 'connected-animation': {
      const detail = $('[data-ca-detail]', stage);
      const thumbs = $('.demo-thumbs', stage);
      let from = null;
      thumbs.addEventListener('click', (e) => {
        const b = e.target.closest('[data-ca]');
        if (!b) return;
        from = b;
        detail.dataset.n = b.dataset.ca;
        detail.hidden = false;
        thumbs.setAttribute('inert', '');
        lib.connectedAnimation(b, detail);
      });
      $('[data-ca-close]', stage).addEventListener('click', async () => {
        detail.hidden = true;
        thumbs.removeAttribute('inert');
        if (from) {
          from.focus();
          await lib.connectedAnimation(detail, from, { hideSource: false, duration: 360 });
        }
      });
      break;
    }
    default:
      WIRES[item.id]?.(stage, lib, T);
  }
}

/* ------------------------------------------------------------------ */
/* Layout, filters, i18n                                               */
/* ------------------------------------------------------------------ */

function renderGallery() {
  const root = $('#gallery');
  root.replaceChildren();
  for (const cat of COMPONENT_CATEGORIES) {
    const items = GALLERY.filter((i) => i.category === cat.id);
    const section = h('section', { class: 'cat', id: `cat-${cat.id}`, 'data-category': cat.id, 'aria-labelledby': `cat-${cat.id}-title` }, [
      h('header', { class: 'cat-head' }, [
        h('span', { class: 'cat-icon', 'aria-hidden': 'true', text: cat.icon }),
        h('div', {}, [
          h('h2', { id: `cat-${cat.id}-title`, 'data-cat-name': cat.id, text: cat[ui.lang] || cat.en }),
          h('p', { 'data-cat-desc': cat.id, text: L(cat.desc) }),
        ]),
        h('code', { class: 'cat-import', text: `use-scroll-animate/components/${cat.id}` }),
      ]),
      h('div', { class: 'cgrid' }, items.map(card)),
    ]);
    root.append(section);
  }
}

function renderChips() {
  const box = $('#chips');
  box.replaceChildren();
  const mk = (id, label, count) =>
    h('button', { class: 'chip', type: 'button', 'aria-pressed': String(ui.cat === id), 'data-cat': id, onclick: () => setCat(id) }, [h('span', { text: label }), h('span', { class: 'count', text: String(count) })]);
  box.append(mk('all', T('filter.all'), GALLERY.length));
  COMPONENT_CATEGORIES.forEach((c) => box.append(mk(c.id, c[ui.lang] || c.en, GALLERY.filter((i) => i.category === c.id).length)));
}

function setCat(id, push = true) {
  ui.cat = id;
  $$('#chips .chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === id)));
  applyFilter();
  if (push) history.replaceState(null, '', id === 'all' ? location.pathname : `#cat-${id}`);
}

function applyFilter() {
  let shown = 0;
  for (const section of $$('#gallery .cat')) {
    const catOk = ui.cat === 'all' || section.dataset.category === ui.cat;
    let any = false;
    for (const el of $$('.ccard', section)) {
      const ok = catOk && matchesComponent(findComponent(el.dataset.id), ui.q);
      el.hidden = !ok;
      if (ok) {
        any = true;
        shown++;
      }
    }
    section.hidden = !any;
  }
  $('#results').textContent = T(shown === 1 ? 'results.one' : 'results.count').replace('{n}', String(shown));
  $('#empty').hidden = shown > 0;
}

function applyLang() {
  document.documentElement.lang = ui.lang === 'zh' ? 'zh-CN' : 'en';
  $$('[data-i18n]').forEach((el) => (el.textContent = T(el.dataset.i18n).replace('{n}', String(COMPONENTS_COUNT)).replace('{c}', String(COMPONENT_CATEGORIES.length))));
  $$('[data-i18n-placeholder]').forEach((el) => el.setAttribute('placeholder', T(el.dataset.i18nPlaceholder)));
  for (const el of $$('.ccard')) {
    const item = findComponent(el.dataset.id);
    $('[data-l=title]', el).textContent = L(item.title);
    $('[data-l=desc]', el).textContent = L(item.desc);
    const box = $('.ccard-code', el);
    if (!box.hidden) renderCode(item, box);
  }
  COMPONENT_CATEGORIES.forEach((c) => {
    const n = $(`[data-cat-name=${c.id}]`);
    if (n) n.textContent = c[ui.lang] || c.en;
    const d = $(`[data-cat-desc=${c.id}]`);
    if (d) d.textContent = L(c.desc);
  });
  renderChips();
  applyFilter();
}

function wireChrome() {
  $('#lang-toggle').addEventListener('click', () => {
    ui.lang = ui.lang === 'zh' ? 'en' : 'zh';
    store.set('lang', ui.lang);
    applyLang();
  });
  $('#theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    const apply = () => document.documentElement.setAttribute('data-theme', next);
    store.set('theme', next);
    if (lib?.viewTransition) lib.viewTransition(apply);
    else apply();
    $$('usa-particles').forEach((p) => p.reset?.());
  });
  const search = $('#search');
  search.addEventListener('input', () => {
    ui.q = search.value;
    applyFilter();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== search && !e.target.closest('input, textarea, select, [contenteditable]')) {
      e.preventDefault();
      search.focus();
    }
  });
  $('#clear-filters').addEventListener('click', () => {
    search.value = '';
    ui.q = '';
    setCat('all');
  });
  $('#hero-install').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('npm i use-scroll-animate');
      lib?.toast(T('code.copied'), { type: 'success', duration: 1600 });
    } catch {
      /* ignore */
    }
  });
  // scrollytelling demo: the active step drives the pinned figure
  const scrolly = $('.g-scrolly-body');
  scrolly?.addEventListener('usa:step', (e) => $('.g-scrolly-num', scrolly)?.play?.(e.detail.index + 1));
  const rm = $('#rm-notice');
  const syncRm = () => {
    rm.hidden = !rmq.matches;
    rm.textContent = T('rm.notice');
  };
  rmq.addEventListener?.('change', syncRm);
  syncRm();
}

function route() {
  const m = /^#cat-([a-z]+)$/.exec(location.hash);
  if (m && COMPONENT_CATEGORIES.some((c) => c.id === m[1])) setCat(m[1], false);
  const c = /^#c-([a-z-]+)$/.exec(location.hash);
  if (c && findComponent(c[1])) {
    const el = document.getElementById(`c-${c[1]}`);
    el?.scrollIntoView({ block: 'center' });
    el?.classList.add('is-target');
  }
}

async function boot() {
  try {
    await loadLibrary();
  } catch (err) {
    $('#gallery').textContent = T('load.error');
    console.error(err);
    return;
  }
  renderGallery();
  wireChrome();
  applyLang();
  route();
  window.addEventListener('hashchange', route);
  document.documentElement.classList.add('is-ready');
}

boot();
