import { C } from './make.js';

/**
 * 6.x gallery cards: widgets (motionary/components/widgets) shown in their
 * natural categories, and the 6.x effect packs (one entry each) under "fx".
 * No own category: the gallery categories mirror src/components categories.
 */
/** A 6.x widget card (entry motionary/components/widgets). */
const W = (tag, cat, en, zh, descEn, descZh, tags, usage, demo, controls, extra = {}) => C(tag, cat, en, zh, descEn, descZh, tags, usage, demo, { entry: 'widgets', since: extra.since || '6.2', controls, ...extra });
/** A 6.x effect-pack card: <usa-fx> + register<Pack>Effects() from its own entry. */
const X = (id, reg, en, zh, descEn, descZh, tags, usage, demo, controls, since) => C('usa-fx', 'fx', en, zh, descEn, descZh, tags, usage, demo, { id, define: 'defineFx', reg, controls, since });

const slides = (n, words = ['Aurora', 'Nebula', 'Lagoon', 'Ember', 'Glacier']) => Array.from({ length: n }, (_, i) => `<div class="demo-slide demo-slide-${i % 5}">${words[i % words.length]}</div>`).join('');

export const components = [
  // ---- 6.2 -------------------------------------------------------------
  W('usa-carousel', 'ui', 'Carousel / slider', '轮播 / 滑块',
    '6.2: swipe, drag, arrow keys, dots and autoplay (pauses on hover, focus, off screen). Four transitions — slide, fade, scale and a 3D "cards" coverflow. Reduced motion: slides switch without movement.',
    '6.2：滑动、拖拽、方向键、圆点与自动播放（悬停、聚焦、离开视口时暂停）。四种切换 —— 平移、淡入、缩放与 3D “卡片”封面流。减少动态效果时直接切换。',
    ['carousel', 'slider', 'swipe', 'coverflow', 'autoplay'],
    '<usa-carousel effect="cards" loop autoplay="4000" label="Featured">\n  <img src="a.jpg" alt="…">\n  <img src="b.jpg" alt="…">\n  <img src="c.jpg" alt="…">\n</usa-carousel>',
    `<usa-carousel effect="cards" loop class="demo-carousel">${slides(5)}</usa-carousel>`,
    [{ key: 'effect', values: ['cards', 'slide', 'fade', 'scale'] }]),
  W('usa-tab-bar', 'ui', 'Tabs with animated indicator', '动画指示器标签页',
    '6.2: the indicator stretches from the old tab to the new one (leading edge first) and the panel slides in from the side of travel. Pill, underline, glow or gooey; full tablist keyboard support.',
    '6.2：指示器从旧标签“拉伸”到新标签（前缘先到），面板从移动方向滑入。胶囊、下划线、发光或粘滞四种样式；完整的 tablist 键盘支持。',
    ['tabs', 'indicator', 'segmented', 'underline', 'pill'],
    '<usa-tab-bar indicator="pill">\n  <button>Overview</button>\n  <button>Specs</button>\n  <button>Reviews</button>\n  <div data-panel>…</div>\n  <div data-panel>…</div>\n  <div data-panel>…</div>\n</usa-tab-bar>',
    '<usa-tab-bar indicator="pill" class="demo-tabbar"><button>Overview</button><button>Specs</button><button>Reviews</button><div data-panel>Fast, light, dependency-free.</div><div data-panel>8 kB gzip · Web Components.</div><div data-panel>★★★★★ “Buttery.”</div></usa-tab-bar>',
    [{ key: 'indicator', values: ['pill', 'underline', 'glow', 'gooey'] }]),
  W('usa-disclosure', 'transitions', 'Accordion 2.0', '手风琴 2.0',
    '6.2: native <details> that spring open and closed (height + fade) with an overshooting chevron; one open at a time unless multiple. Find-in-page and keyboard keep working.',
    '6.2：基于原生 <details>，以弹簧动画展开 / 收起（高度 + 淡入），箭头带回弹翻转；默认一次只展开一项（multiple 可多开）。页内查找与键盘操作保持可用。',
    ['accordion', 'details', 'collapse', 'faq', 'spring'],
    '<usa-disclosure variant="cards">\n  <details><summary>Shipping</summary><p>…</p></details>\n  <details><summary>Returns</summary><p>…</p></details>\n</usa-disclosure>',
    '<usa-disclosure variant="cards" class="demo-disclosure"><details open><summary>Is it free?</summary><p>Yes — MIT licensed, no dependencies.</p></details><details><summary>Does it work in React?</summary><p>Every widget is a Web Component, so it works anywhere.</p></details><details><summary>Reduced motion?</summary><p>Panels open instantly when the OS asks for less motion.</p></details></usa-disclosure>',
    [{ key: 'variant', values: ['cards', ''] }]),
  W('usa-stories', 'ui', 'Stories viewer', '快拍（Stories）浏览器',
    '6.2: segmented progress bars, auto-advance, tap left / right to step, press and hold to pause, plus a pause button. Under reduced motion it waits for the user instead of advancing.',
    '6.2：分段进度条、自动前进，点击左 / 右侧切换，长按暂停，并带暂停按钮。减少动态效果时不会自动前进。',
    ['stories', 'instagram', 'progress', 'autoplay', 'tap'],
    '<usa-stories duration="5000" loop>\n  <img src="1.jpg" alt="…">\n  <img src="2.jpg" alt="…">\n</usa-stories>',
    `<usa-stories duration="3000" loop class="demo-stories">${slides(4, ['Day 1', 'Day 2', 'Day 3', 'Day 4'])}</usa-stories>`),
  X('fx-gpu', ['fx-gpu', 'registerGpuEffects'], 'GPU backgrounds', 'GPU 背景',
    '6.2: WebGL2 shaders — fluid (swirls around the pointer), smoke, fire, ink in water and fireflies — with a Canvas 2D fallback when WebGL2 is missing or the context is lost. Renders only while visible, adapts its resolution; one still frame under reduced motion.',
    '6.2：WebGL2 着色器 —— 流体（围绕指针旋转）、烟雾、火焰、水中墨迹与萤火虫；没有 WebGL2 或上下文丢失时回退到 Canvas 2D。仅在可见时渲染并自适应分辨率；减少动态效果时只绘制一帧静态画面。',
    ['webgl2', 'shader', 'fluid', 'smoke', 'fire', 'ink', 'fireflies', 'gpu'],
    '<usa-fx effect="fluid" trigger="load" self class="hero">\n  <h1>Hello</h1>\n</usa-fx>',
    '<usa-fx effect="fluid" trigger="load"><div class="demo-tile demo-gen">GPU</div></usa-fx>',
    [{ key: 'effect', values: ['fluid', 'smoke', 'fire', 'ink', 'fireflies'] }], '6.2'),
  X('fx-nature', ['fx-gpu', 'registerGpuEffects'], 'Sakura, leaves & splash', '樱花、落叶与水花',
    '6.2: cherry-blossom petals and autumn leaves drift down behind the content (Canvas 2D), and splash throws water droplets from the click point.',
    '6.2：樱花花瓣与秋叶在内容后方飘落（Canvas 2D）；splash 从点击处溅起水滴。',
    ['sakura', 'petals', 'leaves', 'autumn', 'splash', 'water', 'particles'],
    '<usa-fx effect="sakura" trigger="load" self class="hero">\n  <h1>Spring</h1>\n</usa-fx>',
    '<usa-fx effect="sakura" trigger="load"><div class="demo-tile demo-gen demo-sky">Seasons</div></usa-fx>',
    [{ key: 'effect', values: ['sakura', 'leaves'] }], '6.2'),
  X('fx-splash', ['fx-gpu', 'registerGpuEffects'], 'Splash click', '水花点击',
    '6.2: a ring plus droplets that arc out of the click point and fall with gravity.',
    '6.2：一圈水环加上从点击处抛出、受重力下落的水滴。',
    ['click', 'splash', 'water', 'droplets'],
    '<usa-fx effect="splash">\n  <button>Splash</button>\n</usa-fx>',
    '<usa-fx effect="splash" trigger="click"><button type="button" class="demo-btn">Splash</button></usa-fx>', undefined, '6.2'),
];

/** item id → live-demo wiring. */
export const wire = {};
