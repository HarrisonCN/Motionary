/**
 * motionary showcase — the <usa-*> component gallery catalog.
 * Pure data + pure functions (no DOM, no library import) so it can be
 * unit-tested; kept in sync with COMPONENT_CATEGORIES in src/components.
 *
 * item.usage is the minimal markup shown in the code tabs; item.demo is the
 * (richer) markup rendered in the live preview.
 */

import { C } from './catalog/make.js';
import { EXTENSIONS } from './catalog/index.js';

import { prereqFor } from './catalog/prereqs.js';

export const VERSION_RANGE = '13';

/** Component categories, in display order (ids match the subpath exports). */
export const COMPONENT_CATEGORIES = [
  {
    id: 'reveal',
    icon: '↧',
    en: 'Entrance & scroll',
    zh: '入场与滚动',
    desc: { en: 'Reveal content as it scrolls in, track reading progress, pin a graphic while steps scroll by.', zh: '内容滚入时出现、阅读进度条、滚动叙事时固定图形。' },
  },
  {
    id: 'text',
    icon: 'T',
    en: 'Text',
    zh: '文字',
    desc: { en: 'Typewriters, cascading letters, decoding, counters and shimmering headlines — all screen-reader friendly.', zh: '打字机、逐字揭示、解码、数字滚动与流光标题——对读屏软件友好。' },
  },
  {
    id: 'interaction',
    icon: '☝',
    en: 'Interaction',
    zh: '交互反馈',
    desc: { en: 'Micro-interactions for pointers, touch and keyboard: ripples, magnetic buttons, 3D tilt, Fluent reveal highlight.', zh: '鼠标、触摸与键盘的微交互：水波纹、磁吸按钮、3D 倾斜、Fluent 光照高亮。' },
  },
  {
    id: 'feedback',
    icon: '◌',
    en: 'Loading & feedback',
    zh: '加载与反馈',
    desc: { en: 'Windows-style progress rings and dots, skeletons, progress bars, toasts and animated result icons.', zh: 'Windows 风格进度环与圆点、骨架屏、进度条、Toast 通知与结果动画图标。' },
  },
  {
    id: 'background',
    icon: '✺',
    en: 'Background & decoration',
    zh: '背景与装饰',
    desc: { en: 'Aurora gradients, particle fields, film grain, infinite marquees and Fluent acrylic / mica materials.', zh: '极光渐变、粒子场、胶片颗粒、无限滚动跑马灯与 Fluent 亚克力 / 云母材质。' },
  },
  {
    id: 'transitions',
    icon: '⇄',
    en: 'Transitions',
    zh: '过渡动画',
    desc: { en: 'Modals and drawers, accordions, FLIP list reorders, view switching and connected (shared-element) animations.', zh: '弹窗与抽屉、手风琴、FLIP 列表重排、视图切换与连接（共享元素）动画。' },
  },
];

const pills = (n, cls = 'demo-pill') => Array.from({ length: n }, (_, i) => `<span class="${cls}">${i + 1}</span>`).join('');

export const COMPONENTS = [
  // ---------------------------------------------------------------- reveal
  C('usa-reveal', 'reveal', 'Reveal', '滚动揭示',
    'Fade, slide, zoom, blur or flip content in as it enters the viewport. 12 effects, replay on re-entry with repeat.',
    '内容进入视口时淡入、滑入、缩放、模糊或翻转出现。12 种效果，repeat 可重复播放。',
    ['IntersectionObserver', 'WAAPI', '12 effects'],
    '<usa-reveal effect="fade-up" duration="700">\n  <h2>Hello</h2>\n</usa-reveal>',
    '<usa-reveal effect="fade-up" repeat><div class="demo-tile">Hello</div></usa-reveal>',
    { controls: [{ key: 'effect', values: ['fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in', 'zoom-out', 'blur', 'blur-up', 'flip-up', 'flip-left', 'rise'] }], replay: true }),
  C('usa-stagger', 'reveal', 'Stagger list', '错峰列表',
    'Reveals direct children one after another — lists, grids, feature rows.',
    '让子元素依次出现——列表、网格、功能行都适用。',
    ['children', 'interval'],
    '<usa-stagger effect="rise" interval="80">\n  <li>One</li>\n  <li>Two</li>\n  <li>Three</li>\n</usa-stagger>',
    `<usa-stagger effect="rise" interval="80" repeat class="demo-row">${pills(5)}</usa-stagger>`,
    { controls: [{ key: 'effect', values: ['rise', 'fade-up', 'zoom-in', 'blur', 'flip-up', 'fade-left'] }], replay: true }),
  C('usa-scroll-progress', 'reveal', 'Scroll progress bar', '滚动进度条',
    'Reading progress of the page or of one article. Compositor-only scaleX, role="progressbar".',
    '页面或单篇文章的阅读进度。仅使用合成层 scaleX，带 role="progressbar"。',
    ['scaleX', 'a11y', 'target'],
    '<usa-scroll-progress></usa-scroll-progress>\n<!-- or for one article -->\n<usa-scroll-progress target="#post" position="bottom"></usa-scroll-progress>',
    '<div class="demo-stack"><usa-scroll-progress position="inline" class="demo-progress" label="Page progress"></usa-scroll-progress><p class="demo-note" data-progress-out>Scroll the page ↕</p></div>'),
  C('usa-scrolly', 'reveal', 'Sticky scrollytelling', '粘性滚动叙事',
    'A pinned graphic while [data-step] blocks scroll past; the active step drives the graphic via attributes, a CSS variable and events.',
    '[data-step] 滚过时固定图形；当前步骤通过属性、CSS 变量和事件驱动图形。',
    ['position: sticky', 'steps', 'events'],
    '<usa-scrolly>\n  <figure data-sticky>…</figure>\n  <section data-step="intro">…</section>\n  <section data-step="detail">…</section>\n</usa-scrolly>',
    '<a class="demo-jump" href="#scrolly-demo"><span>Live demo below</span><b aria-hidden="true">↓</b></a>'),

  // ---------------------------------------------------------------- text
  C('usa-typewriter', 'text', 'Typewriter', '打字机',
    'Types text, or cycles through phrases with delete and pause. Full text stays available to screen readers.',
    '逐字打出文字，或循环多句并删除、停顿。读屏软件始终读到完整文本。',
    ['words', 'loop', 'caret'],
    '<usa-typewriter words="Hello, Windows.|Hello, web." loop></usa-typewriter>',
    '<usa-typewriter class="demo-big" words="Hello, Windows.|Hello, web.|Hello, Electron.|你好，世界。" speed="60"></usa-typewriter>'),
  C('usa-split-text', 'text', 'Split-text reveal', '逐字揭示',
    'Splits a headline into letters or words and cascades them in: rise, fade, blur, flip or pop. Words never break.',
    '把标题拆成字母或单词并依次出现：上浮、淡入、模糊、翻转或弹出。单词不会被拆行。',
    ['chars', 'words', 'CSS'],
    '<usa-split-text effect="rise">Animated headline</usa-split-text>',
    '<usa-split-text class="demo-big" effect="rise" repeat>Split every letter</usa-split-text>',
    { controls: [{ key: 'effect', values: ['rise', 'fade', 'blur', 'flip', 'pop'] }], replay: true }),
  C('usa-scramble', 'text', 'Scramble / decode', '乱码解码',
    'Decodes text out of random glyphs, left to right. Trigger on view, hover/focus or manually.',
    '从随机字符中自左向右“解码”出文字，可在可见、悬停/聚焦或手动时触发。',
    ['hover', 'glyphs'],
    '<usa-scramble trigger="hover">ACCESS GRANTED</usa-scramble>',
    '<usa-scramble class="demo-big demo-mono" trigger="hover" duration="1000">HOVER TO DECODE</usa-scramble>',
    { replay: true }),
  C('usa-counter', 'text', 'Number counter', '数字滚动',
    'Counts up to a number when visible, locale-formatted with tabular digits. Set .value to animate live dashboards.',
    '可见时滚动到目标数字，按地区格式化并使用等宽数字。设置 .value 可为实时仪表盘做动画。',
    ['Intl.NumberFormat', '.value'],
    '<usa-counter to="128490" prefix="$" duration="2000"></usa-counter>',
    '<usa-counter class="demo-huge" to="128490" prefix="$" duration="2000" locale="en-US"></usa-counter>',
    { replay: true }),
  C('usa-shimmer-text', 'text', 'Shimmer text', '流光文字',
    'A light sweep across gradient-filled text. CSS only; colours and speed via attributes or custom properties.',
    '渐变文字上的流光扫过。纯 CSS，颜色与速度可通过属性或 CSS 变量设置。',
    ['background-clip', 'CSS'],
    '<usa-shimmer-text shine="#fff">Premium</usa-shimmer-text>',
    '<usa-shimmer-text class="demo-huge" color="#8b7bff" shine="#ffffff">Premium</usa-shimmer-text>'),
  C('usa-text-rotate', 'text', 'Rotating words', '轮换词语',
    'Cycles words in place — the box keeps the width of the longest word, so nothing around it reflows.',
    '原地轮换词语——宽度固定为最长词，周围内容不会重排。',
    ['no reflow', 'slide', 'flip'],
    'Build <usa-text-rotate words="fast|tiny|typed"></usa-text-rotate> apps',
    '<p class="demo-big">Build <usa-text-rotate class="demo-accent" words="fast|tiny|typed|fluent" interval="1800"></usa-text-rotate> apps</p>'),

  // ---------------------------------------------------------------- interaction
  C('usa-ripple', 'interaction', 'Ripple', '水波纹',
    'Ink ripple from the pointer — or from the centre for Space/Enter — on any button, list item or card.',
    '从指针位置（键盘按下时从中心）扩散的水波纹，适用于任意按钮、列表项或卡片。',
    ['pointer', 'keyboard'],
    '<usa-ripple><button>Click me</button></usa-ripple>',
    '<usa-ripple class="demo-btn-wrap" color="#fff"><button class="demo-btn" type="button">Click me</button></usa-ripple>'),
  C('usa-magnetic', 'interaction', 'Magnetic button', '磁吸按钮',
    'Content leans toward the pointer when it comes near and springs back. Fine pointers only; off under reduced motion.',
    '指针靠近时内容被“吸”过去，离开后弹回。仅精确指针设备；减少动态效果时关闭。',
    ['pointer', 'spring'],
    '<usa-magnetic strength="0.4"><button>Hover near me</button></usa-magnetic>',
    '<usa-magnetic strength="0.45" radius="70"><button class="demo-btn" type="button">Hover near me</button></usa-magnetic>'),
  C('usa-tilt', 'interaction', '3D tilt card', '3D 倾斜卡片',
    'Tilts toward the pointer in 3D with an optional glare; exposes --usa-tilt-x/y for parallax layers inside.',
    '随指针 3D 倾斜，可选反光；提供 --usa-tilt-x/y 供内部视差层使用。',
    ['perspective', 'glare'],
    '<usa-tilt glare max="12">\n  <div class="card">…</div>\n</usa-tilt>',
    '<usa-tilt class="demo-tilt" glare max="16"><div class="demo-card3d"><b>3D</b><span>tilt me</span></div></usa-tilt>'),
  C('usa-spotlight', 'interaction', 'Reveal highlight', '光照高亮',
    'The Windows Fluent “Reveal” effect: a light follows the pointer, lighting the borders of nearby items and the hovered one.',
    'Windows Fluent 的 “Reveal” 效果：光随指针移动，点亮附近项目的边框与悬停项。',
    ['Fluent', 'Windows'],
    '<usa-spotlight>\n  <button>Mail</button>\n  <button>Calendar</button>\n  <button>Photos</button>\n</usa-spotlight>',
    `<usa-spotlight class="demo-fluent-grid">${['Mail', 'Calendar', 'Photos', 'Files', 'Music', 'Settings'].map((t) => `<button type="button">${t}</button>`).join('')}</usa-spotlight>`),
  C('usa-press', 'interaction', 'Press feedback', '按压反馈',
    'Tactile press: dips while pressed and springs back, or bounces once with bounce. Mouse, touch, pen and keyboard.',
    '触感按压：按下时下沉、松开回弹，bounce 时弹跳一次。支持鼠标、触摸、笔与键盘。',
    ['spring', 'touch'],
    '<usa-press bounce><button>Press</button></usa-press>',
    '<div class="demo-row"><usa-press><button class="demo-btn" type="button">Press</button></usa-press><usa-press bounce><button class="demo-btn demo-btn-alt" type="button">Bounce</button></usa-press></div>'),

  // ---------------------------------------------------------------- feedback
  C('usa-spinner', 'feedback', 'Spinners', '加载动画',
    'Six indeterminate indicators: the WinUI progress ring, the Windows 10 orbiting dots, ring, typing dots, pulse and bars.',
    '六种加载指示器：WinUI 进度环、Windows 10 环绕圆点、圆环、打字圆点、脉冲与柱状。',
    ['Windows', 'Fluent', 'CSS'],
    '<usa-spinner kind="fluent"></usa-spinner>\n<usa-spinner kind="windows" size="40"></usa-spinner>',
    '<div class="demo-spinners">' + ['fluent', 'windows', 'ring', 'dots', 'pulse', 'bars'].map((v) => `<figure><usa-spinner kind="${v}" size="34"></usa-spinner><figcaption>${v}</figcaption></figure>`).join('') + '</div>'),
  C('usa-skeleton', 'feedback', 'Skeleton', '骨架屏',
    'Shimmering placeholders while loading; remove loading and the real content fades in. aria-busy included.',
    '加载时显示流光占位；移除 loading 后真实内容淡入，自动设置 aria-busy。',
    ['shimmer', 'aria-busy'],
    '<usa-skeleton loading avatar lines="3">\n  <article>…</article>\n</usa-skeleton>',
    '<div class="demo-stack demo-wide"><usa-skeleton loading avatar lines="3"><div class="demo-profile"><span class="demo-avatar">W</span><div><b>Winston</b><p>Loaded content fades in.</p></div></div></usa-skeleton><button class="demo-link" type="button" data-act="skeleton">Toggle loading</button></div>'),
  C('usa-progress', 'feedback', 'Progress bar', '进度条',
    'Determinate bars glide between values; without a value it shows the Fluent indeterminate animation. Paused / error states.',
    '确定进度时平滑过渡；无数值时显示 Fluent 不确定动画。支持暂停 / 错误状态。',
    ['Fluent', 'role=progressbar'],
    '<usa-progress value="40"></usa-progress>\n<usa-progress indeterminate></usa-progress>',
    '<div class="demo-stack demo-wide"><usa-progress value="10" data-act="progress" label="Download"></usa-progress><usa-progress indeterminate label="Loading"></usa-progress><usa-progress value="60" state="paused" label="Paused"></usa-progress><usa-progress value="35" state="error" label="Failed"></usa-progress></div>'),
  C('usa-toaster', 'feedback', 'Toasts', 'Toast 通知',
    'toast("Saved") slides a notification in; it pauses on hover, stacks with FLIP and announces politely (errors assertively).',
    'toast("已保存") 滑入通知；悬停暂停、FLIP 堆叠，礼貌播报（错误为紧急播报）。',
    ['toast()', 'aria-live'],
    "<usa-toaster position=\"bottom-right\"></usa-toaster>\n<script type=\"module\">\n  import { toast } from 'motionary/components/feedback';\n  toast('Saved', { type: 'success' });\n</script>",
    '<div class="demo-row"><button class="demo-btn" type="button" data-toast="success">Success</button><button class="demo-btn demo-btn-alt" type="button" data-toast="info">Info</button><button class="demo-btn demo-btn-alt" type="button" data-toast="error">Error</button></div>',
    { define: 'defineToaster' }),
  C('usa-check', 'feedback', 'Result icon', '结果图标',
    'The circle draws itself, then a check, cross or exclamation strokes in with a pop. Great after a payment or upload.',
    '圆圈自绘，随后对勾、叉号或感叹号描入并弹一下。适合支付或上传完成后。',
    ['SVG', 'stroke'],
    '<usa-check kind="success" label="Payment complete"></usa-check>',
    '<div class="demo-row"><usa-check kind="success"></usa-check><usa-check kind="error"></usa-check><usa-check kind="warning"></usa-check></div>',
    { replay: true }),

  // ---------------------------------------------------------------- background
  C('usa-aurora', 'background', 'Aurora', '极光背景',
    'A slow drifting gradient mesh behind its content. Transforms only, paused off-screen, still under reduced motion.',
    '内容背后缓慢漂移的渐变网格。仅用 transform，离屏暂停，减少动态效果时静止。',
    ['gradient', 'GPU'],
    '<usa-aurora colors="#7c5cff,#22d3ee,#f472b6">\n  <h1>Hero</h1>\n</usa-aurora>',
    '<usa-aurora class="demo-fill" speed="1.6"><strong class="demo-big">Aurora</strong></usa-aurora>'),
  C('usa-particles', 'background', 'Particles', '粒子背景',
    'A canvas constellation that drifts away from the pointer. Runs only while visible, DPR ≤ 2, a still frame under reduced motion.',
    '会躲避指针的 canvas 星座粒子。仅在可见时运行，DPR ≤ 2，减少动态效果时为静止画面。',
    ['canvas', 'interactive'],
    '<usa-particles count="80" links="120" interactive></usa-particles>',
    '<usa-particles class="demo-fill demo-particles" count="70" interactive></usa-particles>'),
  C('usa-grain', 'background', 'Film grain', '胶片颗粒',
    'An SVG-noise grain overlay — no image to ship. animated makes it jitter like film.',
    'SVG 噪点颗粒叠加层——无需图片。animated 让它像胶片一样抖动。',
    ['noise', 'overlay'],
    '<usa-grain animated opacity="0.15">\n  <img src="hero.jpg" alt="">\n</usa-grain>',
    '<usa-grain class="demo-fill demo-grain" animated opacity="0.35"><strong class="demo-big">Grain</strong></usa-grain>'),
  C('usa-marquee', 'background', 'Marquee', '无限跑马灯',
    'A seamless infinite ticker with constant speed, pause on hover, soft edges and vertical mode. Clones are hidden from AT.',
    '匀速无缝循环滚动，悬停暂停、柔和边缘、支持纵向。克隆内容对读屏隐藏。',
    ['infinite', 'logos'],
    '<usa-marquee speed="50" pause-on-hover fade>\n  <img src="logo-a.svg" alt="A">\n  <img src="logo-b.svg" alt="B">\n</usa-marquee>',
    '<div class="demo-stack demo-wide"><usa-marquee fade pause-on-hover speed="45">' + ['Electron', 'Tauri', 'WebView2', 'WinUI 3', 'PWA', 'React', 'Vue', 'Svelte'].map((t) => `<span class="demo-chip">${t}</span>`).join('') + '</usa-marquee><usa-marquee fade direction="right" speed="30">' + ['Web Components', 'WAAPI', 'CSS', 'TypeScript', 'SSR-safe', 'a11y'].map((t) => `<span class="demo-chip demo-chip-alt">${t}</span>`).join('') + '</usa-marquee></div>'),
  C('usa-acrylic', 'background', 'Acrylic & Mica', '亚克力与云母',
    'Windows Fluent materials: frosted acrylic (backdrop blur + tint + noise) and mica. Solid fallback when transparency is reduced.',
    'Windows Fluent 材质：磨砂亚克力（背景模糊 + 着色 + 噪点）与云母。减少透明度时回退为纯色。',
    ['Fluent', 'Windows', 'backdrop-filter'],
    '<usa-acrylic shimmer="hover">\n  <nav>…</nav>\n</usa-acrylic>\n<usa-acrylic kind="mica">…</usa-acrylic>',
    '<div class="demo-fill demo-acrylic-bg"><i></i><i></i><usa-acrylic class="demo-acrylic" shimmer="hover" tint="#1f1f2b" tint-opacity="0.45">Acrylic</usa-acrylic><usa-acrylic class="demo-acrylic" kind="mica" tint="#ffffff" tint-opacity="0.7">Mica</usa-acrylic></div>'),

  // ---------------------------------------------------------------- transitions
  C('usa-dialog', 'transitions', 'Modal & drawer', '弹窗与抽屉',
    'Animated modal, side drawers and bottom sheet on the native <dialog>: top layer, focus trap, Esc, backdrop click.',
    '基于原生 <dialog> 的动画弹窗、侧边抽屉和底部面板：顶层、焦点锁定、Esc、点击遮罩关闭。',
    ['<dialog>', 'Fluent', 'drawer'],
    '<usa-dialog id="dlg" kind="modal" label="Settings">\n  <h2>Settings</h2>\n  <button data-close>Done</button>\n</usa-dialog>\n<button onclick="dlg.show()">Open</button>',
    '<div class="demo-row"><button class="demo-btn" type="button" data-dialog="modal">Modal</button><button class="demo-btn demo-btn-alt" type="button" data-dialog="drawer-end">Drawer</button><button class="demo-btn demo-btn-alt" type="button" data-dialog="sheet">Sheet</button></div>'),
  C('usa-accordion', 'transitions', 'Accordion', '手风琴',
    'Smooth expand / collapse for native <details> — semantics, keyboard and find-in-page kept; no wrapper elements.',
    '为原生 <details> 增加平滑展开 / 收起——保留语义、键盘与页内查找，不添加包裹元素。',
    ['<details>', 'height'],
    '<usa-accordion>\n  <details><summary>Shipping</summary><p>…</p></details>\n  <details><summary>Returns</summary><p>…</p></details>\n</usa-accordion>',
    '<usa-accordion class="demo-accordion"><details open><summary>Does it work in Electron?</summary><p>Yes — and in Tauri, WebView2 and any modern browser.</p></details><details><summary>Dependencies?</summary><p>None. Custom Elements + CSS + WAAPI.</p></details><details><summary>Reduced motion?</summary><p>Respected everywhere.</p></details></usa-accordion>'),
  C('usa-view-switch', 'transitions', 'View switch', '视图切换',
    'One view at a time with direction-aware slide, fade, scale or drill transitions — tabs, wizards, app pages.',
    '一次显示一个视图，支持方向感知的滑动、淡入、缩放或钻取过渡——标签页、向导、应用页面。',
    ['tabs', 'Fluent'],
    '<usa-view-switch active="home">\n  <section data-view="home">…</section>\n  <section data-view="about">…</section>\n</usa-view-switch>',
    '<div class="demo-stack demo-wide"><div class="demo-tabs" role="tablist"><button type="button" role="tab" data-view-btn="0" aria-selected="true">Home</button><button type="button" role="tab" data-view-btn="1">Library</button><button type="button" role="tab" data-view-btn="2">Settings</button></div><usa-view-switch class="demo-views"><section>🏠 Home</section><section>📚 Library</section><section>⚙️ Settings</section></usa-view-switch></div>'),
];

export const HELPERS = [
  {
    id: 'view-transition',
    kind: 'helper',
    category: 'transitions',
    fn: 'viewTransition',
    title: { en: 'viewTransition()', zh: 'viewTransition()' },
    desc: {
      en: 'Wrap any DOM update in the View Transitions API (Chromium: Electron, WebView2, Edge, Chrome) with a cross-fade fallback elsewhere.',
      zh: '用 View Transitions API 包裹任意 DOM 更新（Chromium：Electron、WebView2、Edge、Chrome），其他环境回退为淡入淡出。',
    },
    tags: ['View Transitions', 'fallback'],
    usage: "import { viewTransition } from 'motionary/components/transitions';\n\nviewTransition(() => {\n  panel.textContent = 'Next page';\n}, { fallback: panel });",
    demo: '<div class="demo-stack demo-wide"><div class="demo-vt" data-vt-panel>Page 1</div><button class="demo-link" type="button" data-act="vt">Next page</button></div>',
  },
  {
    id: 'flip',
    kind: 'helper',
    category: 'transitions',
    fn: 'flip',
    title: { en: 'flip()', zh: 'flip()' },
    desc: {
      en: 'FLIP any layout change: measure, mutate the DOM, and the elements glide from their old place. For whole lists use <usa-auto-animate>; for shared elements, sharedTransition().',
      zh: 'FLIP 任意布局变化：测量、修改 DOM，元素从旧位置平滑移动。整个列表请用 <usa-auto-animate>；共享元素请用 sharedTransition()。',
    },
    tags: ['FLIP', 'reorder', 'layout'],
    usage: "import { flip } from 'motionary/components/transitions';\n\nawait flip(list.children, () => list.append(...sorted));",
    demo: `<div class="demo-stack"><div class="demo-flip">${pills(8, 'demo-flip-item')}</div><button class="demo-link" type="button" data-act="shuffle">Shuffle</button></div>`,
  },
];

for (const ext of EXTENSIONS) {
  if (ext.category) COMPONENT_CATEGORIES.push(ext.category);
  COMPONENTS.push(...ext.components);
  HELPERS.push(...(ext.helpers || []));
}

export const GALLERY = [...COMPONENTS, ...HELPERS];

export function findComponent(id) {
  return GALLERY.find((c) => c.id === id) || null;
}

export function categoryOf(id) {
  return COMPONENT_CATEGORIES.find((c) => c.id === id) || null;
}

/** Case-insensitive search over tag, titles, descriptions, tags and category. */
export function matchesComponent(item, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  const cat = categoryOf(item.category);
  const hay = [item.id, item.tag, item.fn, item.title.en, item.title.zh, item.desc.en, item.desc.zh, ...(item.tags || []), cat?.en, cat?.zh]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((part) => hay.includes(part));
}

const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');
const stripScripts = (html) => html.replace(/<script[\s\S]*?<\/script>\n?/g, '').trim();

/** HTML → JSX for the React tab (custom elements keep their attribute names). */
export const toJsx = (html) =>
  stripScripts(html)
    .replace(/\bclass="/g, 'className="')
    .replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}')
    .replace(/ onclick="([^"]*)"/g, ' onClick={() => document.getElementById(\'dlg\').show()}');

export const CODE_TABS = [
  { id: 'html', en: 'HTML (no build)', zh: 'HTML（免构建）' },
  { id: 'esm', en: 'ES module', zh: 'ES 模块' },
  { id: 'react', en: 'React', zh: 'React' },
  { id: 'vue', en: 'Vue', zh: 'Vue' },
  { id: 'desktop', en: 'Electron / Tauri / WebView2', zh: 'Electron / Tauri / WebView2' },
];

/** Code snippets for every tab. */
export function componentSnippets(item) {
  const sub = `motionary/components/${item.entry || item.category}`;
  const cdn = `https://unpkg.com/motionary@${VERSION_RANGE}/dist/components.umd.js`;
  if (item.kind === 'helper') {
    const body = item.usage.split('\n').slice(2).join('\n');
    return {
      html: `<script src="${cdn}"></script>\n<script>\n  // every helper is on window.UsaComponents\n  const { ${item.fn} } = UsaComponents;\n</script>`,
      esm: item.usage,
      react: `${item.usage.split('\n')[0]}\n\n// call it from an event handler or effect:\nasync function onOpen() {\n${indent(body, 2)}\n}`,
      vue: `<script setup>\n${item.usage}\n</script>`,
      desktop: desktopSnippet(item, sub),
    };
  }
  let markup = item.usage;
  // live parameter values chosen in the gallery (item.live) replace / add attributes on the first tag
  for (const [k, v] of Object.entries(item.live || {})) {
    const re = new RegExp(`(<${item.tag}\\b[^>]*?)\\s${k}="[^"]*"`);
    if (re.test(markup)) markup = markup.replace(re, v === '' ? '$1' : `$1 ${k}="${v}"`);
    else if (v !== '') markup = markup.replace(new RegExp(`<${item.tag}\\b`), `<${item.tag} ${k}="${v}"`);
  }
  const html = stripScripts(markup);
  // 10.1: runtime-powered components — prerequisites first (install / import + register / CDN)
  const pq = item.requires?.length ? prereqFor(item) : null;
  const pqEsm = pq ? pq.importAndRegister.split('\n').filter((l) => !l.includes(item.define + '(') && !l.includes(`{ ${item.define} }`)).join('\n').trim() + '\n' : '';
  // 5.1: effect-pack cards also register the packs (motionary/components/effects)
  let pre = item.pack && !item.entry ? `import { registerAllEffects } from 'motionary/components/effects';\n` : '';
  let preCall = item.pack && !item.entry ? 'registerAllEffects();\n' : '';
  // 6.2+: a 6.x effect pack (its own entry) — item.reg = [entry, registerFn]
  if (item.reg) {
    pre = `import { ${item.reg[1]} } from 'motionary/components/${item.reg[0]}';\n`;
    preCall = `${item.reg[1]}();\n`;
  }
  // 6.2+: widgets and 6.x packs ship in dist/widgets.umd.js for <script> pages
  const six = item.reg || item.entry === 'widgets';
  const scripts = six ? `<script src="${cdn}"></script>\n<!-- 6.x widgets + effect packs -->\n<script src="${cdn.replace('components.umd.js', 'widgets.umd.js')}"></script>` : `<script src="${cdn}"></script>`;
  return {
    html: pq ? `<!-- ${pq.badge} — ${pq.install} -->\n${pq.cdn}\n\n${markup}` : `<!-- registers every <usa-*> element and effect -->\n${scripts}\n\n${markup}`,
    esm: `${pqEsm}${pre}import { ${item.define} } from '${sub}';\n\n${preCall}${item.define}(); // registers <${item.tag}>\n\n/* then use it in your HTML:\n${html}\n*/`,
    react: `${pqEsm}${pre}import { ${item.define} } from '${sub}';\n\n${preCall}${item.define}();\n\nexport function Demo() {\n  return (\n    <>\n${indent(toJsx(markup), 6)}\n    </>\n  );\n}`,
    vue: `<!-- vite.config: vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('usa-') } } }) -->\n<script setup>\n${pqEsm}${pre}import { ${item.define} } from '${sub}';\n${preCall}${item.define}();\n</script>\n\n<template>\n${indent(html, 2)}\n</template>`,
    desktop: desktopSnippet(item, sub),
  };
}

function desktopSnippet(item, sub) {
  const what = item.kind === 'helper' ? item.fn : item.define;
  return [
    '// Renderer of an Electron / Tauri / WebView2 (WinUI, WPF, WinForms) app,',
    '// or an installed PWA — it is a normal web page, so bundle as usual:',
    `import { ${what} } from '${sub}';`,
    item.kind === 'helper' ? '' : `${what}();`,
    '',
    "// Strict CSP (style-src 'self')? Styles are adopted as constructable",
    '// stylesheets, which CSP allows. To ship a file instead:',
    "//   import 'motionary/components.css';",
    '//   configureComponents({ injectStyles: false });',
  ]
    .filter((l, i) => !(l === '' && i === 3))
    .join('\n');
}
