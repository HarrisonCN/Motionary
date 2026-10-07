import { C, H, K } from './make.js';

const BLOB_A = 'M50 10 C75 10 90 30 90 50 C90 75 70 90 50 90 C25 90 10 70 10 50 C10 30 25 10 50 10 Z';
const BLOB_B = 'M50 4 C80 20 96 26 86 54 C78 84 64 96 44 86 C14 80 4 64 14 44 C20 20 30 0 50 4 Z';
const BLOB_C = 'M50 20 C64 4 96 18 88 46 C96 76 72 98 52 84 C26 96 2 78 16 52 C2 26 30 10 50 20 Z';

export const category = K('svg', '✒', 'SVG', 'SVG 动画',
  'Line drawing, path morphing, mask reveals and animated icons — resolution-independent and tiny.',
  '线条描绘、路径变形、遮罩揭示与动画图标 —— 矢量清晰、体积极小。');

export const components = [
  C('usa-draw', 'svg', 'Line drawing', '线条描绘',
    'Every stroke of the SVG inside draws itself — on view, hover, click or scrubbed with scroll — staggered between shapes, optional fill afterwards. No getTotalLength() needed.',
    '内部 SVG 的每条描边自行绘制 —— 进入视口、悬停、点击或随滚动擦洗触发，形状间错峰，可在绘制后填充。无需 getTotalLength()。',
    ['stroke', 'draw', 'signature', 'scrub'],
    '<usa-draw duration="1800" stagger="0.3" fill>\n  <svg viewBox="0 0 100 40">…</svg>\n</usa-draw>',
    '<usa-draw duration="1600" stagger="0.3" repeat><svg viewBox="0 0 120 60" width="180" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M10 50 C30 0 50 0 60 30 S90 60 110 10"/><circle cx="20" cy="15" r="8"/><path d="M80 52 h30"/></svg></usa-draw>',
    { controls: [{ key: 'trigger', values: ['view', 'hover', 'click', 'scrub'] }], replay: true }),
  C('usa-morph', 'svg', 'Path morph', '路径变形',
    'Morph an SVG path through a list of shapes (paths="A | B | C") on click, hover, in view or automatically. Same-structure paths morph point by point.',
    '在一组形状间变形 SVG 路径（paths="A | B | C"），可点击、悬停、进入视口或自动循环。结构相同的路径逐点变形。',
    ['morph', 'blob', 'shape', 'path'],
    `<usa-morph trigger="auto" interval="1800"\n  paths="${BLOB_A} | ${BLOB_B}"></usa-morph>`,
    `<div class="demo-row"><usa-morph class="demo-morph" style="width:96px;height:96px" paths="${BLOB_A} | ${BLOB_B} | ${BLOB_C}"></usa-morph><usa-morph class="demo-morph" style="width:96px;height:96px" trigger="auto" interval="1600" paths="${BLOB_C} | ${BLOB_A}"></usa-morph></div>`),
  C('usa-mask-reveal', 'svg', 'Mask reveal', '遮罩揭示',
    'Reveal images or sections through a growing mask: circle, diamond, star, iris or wipes, from any origin.',
    '通过逐渐扩大的遮罩揭示图片或区块：圆形、菱形、星形、光圈或擦除，可设定起点。',
    ['mask', 'clip-path', 'reveal', 'image'],
    '<usa-mask-reveal shape="circle" at="20% 30%">\n  <img src="hero.jpg" alt="…">\n</usa-mask-reveal>',
    '<usa-mask-reveal shape="star" repeat><div class="demo-tile demo-tile--lg">Revealed ✦</div></usa-mask-reveal>',
    { controls: [{ key: 'shape', values: ['circle', 'diamond', 'star', 'iris', 'wipe', 'wipe-up'] }], replay: true }),
  C('usa-anim-icon', 'svg', 'Animated icons', '动画图标',
    'Stroke icons that move: the bell rings, the heart beats, the check draws, the gear turns. Hover, click, in view or loop; decorative unless labelled.',
    '会动的描边图标：铃铛摇响、爱心跳动、对勾描绘、齿轮转动。悬停、点击、进入视口或循环；未设 label 时为装饰性。',
    ['icon', 'bell', 'heart', 'micro-interaction'],
    '<usa-anim-icon name="bell" label="Notifications"></usa-anim-icon>\n<usa-anim-icon name="heart" trigger="click"></usa-anim-icon>',
    '<div class="demo-row demo-icons"><usa-anim-icon name="bell" size="32"></usa-anim-icon><usa-anim-icon name="heart" size="32"></usa-anim-icon><usa-anim-icon name="check" size="32"></usa-anim-icon><usa-anim-icon name="arrow" size="32"></usa-anim-icon><usa-anim-icon name="star" size="32"></usa-anim-icon><usa-anim-icon name="gear" size="32"></usa-anim-icon><usa-anim-icon name="search" size="32"></usa-anim-icon><usa-anim-icon name="download" size="32"></usa-anim-icon></div>'),
];

export const helpers = [
  H('morph-to', 'svg', 'morphTo',
    'morphTo(path, d, { duration }) animates any <path> to new data; interpolatePath(a, b, t) gives the in-between shape for your own loop or scroll progress.',
    'morphTo(path, d, { duration }) 将任意 <path> 变形为新数据；interpolatePath(a, b, t) 返回中间形状，可用于自定义循环或滚动进度。',
    ['morph', 'interpolate', 'path'],
    "import { morphTo, interpolatePath } from 'use-scroll-animate/components/svg';\n\nawait morphTo(path, 'M10 10 L90 90 …', { duration: 600 });\npath.setAttribute('d', interpolatePath(a, b, progress));",
    `<svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true"><path fill="currentColor" d="${BLOB_A}" data-morph-path></path></svg><button type="button" class="demo-link" data-morph-btn>Morph</button>`),
];

export const wire = {
  'morph-to': (stage, lib) => {
    const p = stage.querySelector('[data-morph-path]');
    const shapes = [BLOB_B, BLOB_C, BLOB_A];
    let i = 0;
    stage.querySelector('[data-morph-btn]').addEventListener('click', () => lib.morphTo(p, shapes[i++ % 3], { duration: 600 }));
  },
};
