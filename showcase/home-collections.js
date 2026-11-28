/**
 * motionary showcase — the "Collections" section of the store page (17.12; 17.13 adds the studio tab, 17.14 the icons tab, 17.16 the micro-interaction tab, 17.17 the spring parts tab, 17.18 the damped parts tab, 17.19 the fling parts tab, 17.20 the snap and swing tab).
 *
 * Every release page (17.14 icons, 17.13 studio, 17.12 parts, 17.11 blocks, looks, 17.10 kit, 17.9 moments, 17.7 forms, 17.6 matter, 17.5 activity,
 * 17.4 luminous) gets a tab with a handful of its widgets running live, so most of them can be tried without leaving
 * the home page. The full pages stay as deep links. Nothing is loaded until the section comes near the screen: then only
 * the open tab's widget entries are imported from ../dist (or the CDN build as a fallback), one module per widget, and
 * the other tabs load when they are opened.
 *
 * 17.17: every card (and every look tile) has the code drawer of the component gallery and the Store: it opens
 * into HTML / ES module / React / Vue / desktop code with a copy button.
 */
import { components as springs } from './catalog/springs.js';
import { components as snap } from './catalog/snap.js';
import { components as fling } from './catalog/fling.js';
import { components as damped } from './catalog/damped.js';
import { components as micro } from './catalog/micro.js';
import { components as toolkit } from './catalog/toolkit.js';
import { components as icons } from './catalog/icons.js';
import { components as studio } from './catalog/studio.js';
import { components as parts } from './catalog/parts.js';
import { components as blocks } from './catalog/blocks.js';
import { components as kit } from './catalog/kit.js';
import { components as moments } from './catalog/moments.js';
import { components as tactile, wire as tactileWire } from './catalog/tactile.js';
import { components as forms, wire as formsWire } from './catalog/forms.js';
import { components as matter } from './catalog/matter.js';
import { components as activity } from './catalog/activity.js';
import { components as luminous } from './catalog/luminous.js';
import { createDrawer, lookSnippets, LOOK_TABS } from './code-drawer.js';

const LOCAL = new URL('../dist/', import.meta.url).href;
const CDN = 'https://unpkg.com/motionary@17/dist/';
const WIRES = { ...tactileWire, ...formsWire };

const pick = (list, ids) => ids.split(' ').map((id) => list.find((c) => c.id === id)).filter((c) => c && !c.requires);

/** The tabs, newest first. `page` is the full demo page each one links to. */
export const COLLECTIONS = [
  {
    id: 'snap', since: '17.20', page: './snap.html',
    title: { en: 'Snap & swing', zh: '吸附与摆动' },
    blurb: { en: 'Rulers, dials, grids, tabs, a chat head and a hanging sign you can fling, spin and drag: they keep your speed, then snap into place or swing to a stop on real physics.', zh: '刻度尺、拨盘、网格、标签页、悬浮头像和挂牌都能甩、转、拖：保留手上的速度，再吸附到位，或按真实物理摆动后停下。' },
    items: pick(snap, 'fling-ruler fling-dial spring-grid chat-head fling-tabs swing-sign'),
    total: snap.length,
  },
  {
    id: 'fling', since: '17.19', page: './fling.html',
    title: { en: 'Fling & settle', zh: '甩动回弹' },
    blurb: { en: 'Windows, pills, previews, scrollbars and marquees you can grab and throw: they keep your speed, stretch at the edges and settle on a spring.', zh: '小窗、胶囊、预览、滚动条和跑马灯都能抓住甩出去：保留手上的速度，碰到边缘有阻力，最后沿弹簧回稳。' },
    items: pick(fling, 'spring-pip spring-island slide-confirm fling-marquee spring-peek spring-scrollbar spring-chain'),
    total: fling.length,
  },
  {
    id: 'damped', since: '17.18', page: './damped.html',
    title: { en: 'Damped parts', zh: '阻尼部件' },
    blurb: { en: 'Panels, sheets, pages and piles that open with a damped, physical slide: they follow the finger, stretch at the ends and settle instead of stopping dead.', zh: '面板、抽屉、分页和卡片堆都带阻尼滑动：跟手、两端有橡皮筋阻力，停下时轻轻回稳而不是戛然而止。' },
    items: pick(damped, 'spring-collapse spring-sheet spring-pager spring-stack read-more elastic-scroll'),
    total: damped.length,
  },
  {
    id: 'springs', since: '17.17', page: './springs.html',
    title: { en: 'Spring parts', zh: '弹簧部件' },
    blurb: { en: 'Ten everyday parts on the spring core: likes that burst, stars that pop, lists that make room, toasts that pile up.', zh: '十个常用部件跑在弹簧核心上：点赞会炸开、星星会弹起、列表会让位、通知会叠成一摞。' },
    items: pick(springs, 'spring-like spring-rating spring-copy spring-counter spring-tags spring-code spring-list spring-swipe spring-accordion'),
    total: springs.length,
  },
  {
    id: 'micro', since: '17.16', page: './micro.html',
    title: { en: 'Micro-interactions', zh: '微交互' },
    blurb: { en: 'Spring physics for every press, toggle, drag and error: interruptible, velocity-aware, calm under reduced motion.', zh: '按压、切换、拖拽、报错都用真实弹簧：可打断、保留速度，减少动态效果时安静切换。' },
    items: pick(micro, 'micro-switch micro-checkbox micro-segmented micro-slider micro-stepper micro-button micro-input micro'),
    total: micro.length,
  },
  {
    id: 'toolkit', since: '17.15', page: './toolkit.html',
    title: { en: 'New in 17.15', zh: '17.15 新品' },
    blurb: { en: 'Everyday UI parts and five more data charts.', zh: '常用界面部件与五种数据图表。' },
    items: pick(toolkit, 'bar-race comparison-table calendar-strip radial-bars bullet-chart slope-chart dot-plot toggle-group time-picker color-swatches radial-menu hover-card'),
    total: toolkit.length,
  },
  {
    id: 'icons', since: '17.14', page: './icons.html',
    title: { en: '753 icons', zh: '753 个图标' },
    blurb: { en: 'Original line icons in 34 categories, with a searchable picker and twelve motions.', zh: '34 类原创线条图标，带可搜索的选择器和 12 种动效。' },
    items: pick(icons, 'icon-picker icon'),
    total: icons.length,
  },
  {
    id: 'studio', since: '17.13', page: './studio.html',
    title: { en: 'New in 17.13', zh: '17.13 新品' },
    blurb: { en: 'Collaboration parts, data charts and playful motion.', zh: '协作部件、数据图表与趣味动效。' },
    items: pick(studio, 'line-chart funnel-chart treemap waffle-chart gantt diff-viewer comment-thread mention-input emoji-picker wheel-picker signature-pad scratch-card page-flip split-flap circular-text pixel-transition text-pressure shuffle-grid'),
    total: studio.length,
  },
  {
    id: 'parts', since: '17.12', page: './parts.html',
    title: { en: 'New in 17.12', zh: '17.12 新品' },
    blurb: { en: 'Docs parts, data components and background motion.', zh: '文档部件、数据组件与背景动效。' },
    items: pick(parts, 'progress-tabs code-tabs donut-chart rating-bars sortable-list checklist helpful-vote share-button inline-edit orbit-rings letter-swap meteors connect-beam heatmap'),
    total: parts.length,
  },
  {
    id: 'blocks', since: '17.11', page: './blocks.html',
    title: { en: 'Blocks & depth', zh: '页面块与纵深' },
    blurb: { en: 'Page blocks, app parts and depth surfaces.', zh: '页面块、界面部件与纵深动效。' },
    items: pick(blocks, 'search-bar subscribe download-button split-pane stack-slider morph-card context-menu elastic-frame border-beam shape-divider orbit-gallery'),
    total: blocks.length,
  },
  {
    id: 'looks', since: '17.11', page: './looks.html',
    title: { en: '2040 looks', zh: '2040 种外观' },
    blurb: { en: 'Forty palettes × seventeen treatments in each of three families (17.17 added 510, and a feel for each). Click one to try it.', zh: '四十种配色 × 每类十七种处理，共三类（17.17 新增 510 种，每种还带手感）。点一个试试。' },
    items: [],
    total: 2040,
  },
  {
    id: 'kit', since: '17.10', page: './kit.html',
    title: { en: 'UI kit', zh: '界面套件' },
    blurb: { en: 'Pricing, bento, tables, carousels and motion surfaces.', zh: '价格表、便当格、表格、轮播与动效表面。' },
    items: pick(kit, 'pricing bento filter-chips data-table fan-carousel expand-cards json-viewer liquid-glass cut-reveal hover-reveal-list empty-state'),
    total: kit.length,
  },
  {
    id: 'moments', since: '17.9', page: './moments.html',
    title: { en: 'Moments & tactile', zh: '瞬间与触感' },
    blurb: { en: 'Small delightful controls, loaders and squishy keys.', zh: '有趣的小控件、加载动画和软糯按键。' },
    items: [...pick(moments, 'eclipse-toggle hue-orbit notch-slider copy-button jelly-button groove-toggle plan-picker chip-input strength-meter elastic-accordion breath-orb infinity-loop'), ...pick(tactile, 'squish-key analog-stick')],
    total: moments.length + tactile.length,
  },
  {
    id: 'forms', since: '17.7', page: './forms.html',
    title: { en: 'Form atelier', zh: '表单工坊' },
    blurb: { en: 'Selects, comboboxes, steppers and sliders that stay native.', zh: '保持原生语义的选择器、组合框、步进器和滑杆。' },
    items: pick(forms, 'select combobox multi-select number-stepper password range-slider textarea'),
    total: forms.length,
  },
  {
    id: 'matter', since: '17.6', page: './matter.html',
    title: { en: 'Matter & motion', zh: '物质与运动' },
    blurb: { en: 'Liquids, fields and springs you can poke.', zh: '可以戳一戳的液体、力场和弹簧。' },
    items: pick(matter, 'gravity-well liquid-metal ink-flow fluid-type spring-lab hold-action scrub-number text-loupe'),
    total: matter.length,
  },
  {
    id: 'activity', since: '17.5', page: './activity.html',
    title: { en: 'Live activities', zh: '实时活动' },
    blurb: { en: 'Flight, delivery, ride and timer cards.', zh: '航班、快递、打车和计时卡片。' },
    items: pick(activity, 'flight-status delivery-tracker coffee-timer status-pill ride-status sun-timeline meter-countdown workout-player'),
    total: activity.length,
  },
  {
    id: 'luminous', since: '17.4', page: './luminous.html',
    title: { en: 'Luminous controls', zh: '发光控件' },
    blurb: { en: 'Glass switches, particle icons and halo sliders.', zh: '玻璃开关、粒子图标和光晕滑杆。' },
    items: pick(luminous, 'luminous-switch particle-icon particle-button halo-segmented halo-slider orbit-progress'),
    total: luminous.length,
  },
];

const STR = {
  en: {
    kicker: 'Collections',
    title: 'Try every release right here.',
    lead: 'Live widgets from each release page. Pick a tab; the widgets load only when you open it.',
    tabs: 'Releases',
    open: 'Open the full page',
    more: '{n} more on that page',
    morePages: 'More pages',
    loading: 'Loading…',
    failed: 'Could not load these widgets.',
    looksLabel: 'Look',
  },
  zh: {
    kicker: '合集',
    title: '每一版的新东西，都能在这里直接试。',
    lead: '各版本页面里的部件在这里直接运行。选一个标签，打开时才加载。',
    tabs: '版本',
    open: '打开完整页面',
    more: '完整页面还有 {n} 个',
    morePages: '更多页面',
    loading: '加载中…',
    failed: '这些部件没能加载。',
    looksLabel: '外观',
  },
};

/** Demos that need more room than one grid column. */
const WIDE = new Set(['fling-tabs', 'chat-head', 'spring-pip', 'fling-marquee', 'spring-chain', 'spring-sheet', 'spring-pager', 'spring-list', 'spring-accordion', 'bar-race', 'comparison-table', 'calendar-strip', 'icon-picker', 'line-chart', 'gantt', 'diff-viewer', 'comment-thread', 'progress-tabs', 'heatmap', 'connect-beam', 'pricing', 'bento', 'data-table', 'expand-cards', 'orbit-gallery', 'split-pane', 'form-stepper', 'sun-timeline', 'workout-player']);

const LOOK_PICKS = ['solid-indigo', 'glass-ocean', 'neon-midnight', 'paper-amber', 'brutal-coral', 'terminal-forest', 'gradient-sunset', 'soft-rose', 'clay-cherry', 'neumorph-cobalt', 'retro-teal', 'synth-velvet', 'luxe-sand', 'editorial-olive', 'sketch-plum', 'pill-aurora'];

const lang = () => (document.documentElement.lang || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
const t = (key, vars = {}) => (STR[lang()][key] || STR.en[key]).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

let basePromise;
/** '../dist/' when the local build is there, else the CDN build; resolves once mo-* aliases are on. */
function base() {
  return (basePromise ||= (async () => {
    for (const b of [LOCAL, CDN]) {
      try {
        const mo = await import(b + 'components/mo.js');
        mo.defineMoAliases?.();
        return b;
      } catch { /* try the next one */ }
    }
    throw new Error('[motionary] showcase: no dist build reachable');
  })());
}

const defined = new Map();
/** Import one widget entry and run its define function (once per id). */
function define(item) {
  if (!defined.has(item.id)) {
    defined.set(item.id, base().then((b) => import(`${b}widgets/${item.id}.js`)).then((m) => { m[item.define]?.(); }));
  }
  return defined.get(item.id);
}

export function mountCollections(section) {
  if (!section || section.dataset.ready) return;
  section.dataset.ready = '';
  const head = section.querySelector('[data-col-head]');
  const host = section.querySelector('[data-col-root]');
  const linkRow = section.querySelector('[data-col-links]');
  const uid = 'col';
  const tablist = el('div', 'col-tabs');
  tablist.setAttribute('role', 'tablist');
  const panels = el('div', 'col-panels');
  const state = COLLECTIONS.map((c, i) => {
    const tab = el('button', 'col-tab');
    tab.type = 'button';
    tab.id = `${uid}-tab-${c.id}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${uid}-panel-${c.id}`);
    tab.dataset.col = c.id;
    const name = el('span', 'col-tab-name');
    const ver = el('span', 'col-tab-ver', c.since);
    tab.append(name, ver);
    tablist.append(tab);
    const panel = el('div', 'col-panel');
    panel.id = `${uid}-panel-${c.id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    panel.hidden = i !== 0;
    panel.dataset.col = c.id;
    const bar = el('div', 'col-bar');
    const blurb = el('p', 'col-blurb');
    const open = el('a', 'col-open');
    open.href = c.page;
    bar.append(blurb, open);
    const grid = el('div', 'col-grid');
    panel.append(bar, grid);
    panels.append(panel);
    return { c, tab, panel, name, blurb, open, grid, rendered: false };
  });
  host.replaceChildren(tablist, panels);

  let current = 0;
  let near = false;

  const paintText = () => {
    const L = lang();
    if (head) {
      head.querySelector('[data-col-kicker]').textContent = t('kicker');
      head.querySelector('[data-col-title]').textContent = t('title');
      head.querySelector('[data-col-lead]').textContent = t('lead');
    }
    tablist.setAttribute('aria-label', t('tabs'));
    for (const s of state) {
      s.name.textContent = s.c.title[L];
      s.blurb.textContent = s.c.blurb[L];
      const rest = s.c.total - s.c.items.length;
      s.open.textContent = `${t('open')} ↗`;
      s.open.title = rest > 0 && s.c.items.length ? t('more', { n: rest }) : '';
      for (const card of s.grid.querySelectorAll('[data-item]')) {
        const item = s.c.items.find((x) => x.id === card.dataset.item);
        if (!item) continue;
        card.querySelector('.col-name').textContent = item.title[L];
        card.querySelector('.col-desc').textContent = item.desc[L];
      }
    }
    if (linkRow) {
      linkRow.setAttribute('aria-label', t('morePages'));
      for (const a of linkRow.querySelectorAll('a[data-en]')) a.textContent = a.dataset[L] || a.dataset.en;
    }
  };

  const renderLooks = async (s) => {
    const grid = s.grid;
    grid.classList.add('col-looks');
    const status = el('p', 'col-status', t('loading'));
    grid.append(status);
    try {
      const b = await base();
      const w = await import(b + 'components/widgets.js');
      w.defineWidgets('17.11');
      w.adoptLooks();
      status.remove();
      for (const name of LOOK_PICKS) {
        const info = w.lookInfo(name);
        if (!info) continue;
        const tile = el('figure', 'col-look');
        tile.dataset.moLook = name;
        tile.style.setProperty('--look-bg', info.bg);
        tile.innerHTML = '<div class="col-look-stage"><mo-download-button duration="1200"></mo-download-button><mo-search-bar label="Search" shortcut="none"></mo-search-bar></div>';
        const cap = el('figcaption', 'col-look-name', name);
        tile.append(cap);
        const drawer = createDrawer({ tabs: LOOK_TABS, snippets: lookSnippets({ name, info, tokens: w.lookTokens?.(name) || {}, count: w.lookNames?.(info.family).length }) });
        if (drawer) tile.append(drawer.el);
        grid.append(tile);
      }
    } catch {
      status.textContent = t('failed');
    }
  };

  const render = async (s) => {
    if (s.rendered) return;
    s.rendered = true;
    if (s.c.id === 'looks') return renderLooks(s);
    const L = lang();
    const cards = s.c.items.map((item) => {
      const card = el('article', 'col-card');
      card.dataset.item = item.id;
      if (WIDE.has(item.id)) card.classList.add('col-wide');
      const stage = el('div', 'col-stage');
      stage.setAttribute('aria-busy', 'true');
      const meta = el('div', 'col-meta');
      const nm = el('h3', 'col-name', item.title[L]);
      const tag = el('code', 'col-tag', `<mo-${item.id}>`);
      const desc = el('p', 'col-desc', item.desc[L]);
      meta.append(nm, tag, desc);
      const drawer = createDrawer({ id: item.id });
      if (drawer) meta.append(drawer.el);
      card.append(stage, meta);
      s.grid.append(card);
      return { item, stage };
    });
    // Import the entries in parallel, then put each demo in place as soon as its element is defined.
    await Promise.all(cards.map(async ({ item, stage }) => {
      try {
        await define(item);
        // The store page owns the / key (effect search), so demo search bars get no shortcut here.
        stage.innerHTML = (item.demo || item.usage).replace(/<mo-search-bar(?![^>]*\bshortcut=)/g, '<mo-search-bar shortcut="none"');
        WIRES[item.id]?.(stage);
      } catch {
        stage.textContent = t('failed');
      } finally {
        stage.removeAttribute('aria-busy');
      }
    }));
  };

  const select = (i, focus = false) => {
    current = (i + state.length) % state.length;
    state.forEach((s, j) => {
      const on = j === current;
      s.tab.setAttribute('aria-selected', String(on));
      s.tab.tabIndex = on ? 0 : -1;
      s.panel.hidden = !on;
    });
    if (focus) state[current].tab.focus();
    if (near) void render(state[current]);
    const id = state[current].c.id;
    if (history.replaceState && location.hash.startsWith('#collections')) history.replaceState(null, '', `#collections-${id}`);
  };

  state.forEach((s, i) => s.tab.addEventListener('click', () => select(i)));
  tablist.addEventListener('keydown', (e) => {
    const i = state.findIndex((s) => s.tab === e.target);
    if (i < 0) return;
    const rtl = getComputedStyle(tablist).direction === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight', back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const to = e.key === fwd ? i + 1 : e.key === back ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? state.length - 1 : null;
    if (to == null) return;
    e.preventDefault();
    select(to, true);
  });

  // Deep link: #collections-blocks opens that tab.
  const fromHash = () => {
    const m = /^#collections-([a-z0-9-]+)$/.exec(location.hash);
    const i = m ? state.findIndex((s) => s.c.id === m[1]) : -1;
    return i;
  };
  const start = fromHash();
  select(start >= 0 ? start : 0);
  window.addEventListener('hashchange', () => { const i = fromHash(); if (i >= 0) { select(i); section.scrollIntoView({ block: 'start' }); } });

  const wake = () => {
    if (near) return;
    near = true;
    void render(state[current]);
  };
  if (start >= 0 || typeof IntersectionObserver === 'undefined') wake();
  else {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); wake(); }
    }, { rootMargin: '400px 0px' });
    io.observe(section);
  }

  new MutationObserver(paintText).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  paintText();
}

if (typeof document !== 'undefined') {
  const go = () => mountCollections(document.getElementById('collections'));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true });
  else go();
}
