import { C, H, K } from './make.js';

export const category = K('physics', '〰', 'Spring & physics', '弹簧与物理',
  'Real spring physics (stiffness, damping, mass): bounce-in, jelly and rubber-band effects, draggable cards with spring-back, inertia and snapping, elastic overscroll.',
  '真实弹簧物理（刚度、阻尼、质量）：弹入、果冻与橡皮筋效果，可拖拽并回弹、惯性滑动与吸附，弹性越界滚动。');

export const components = [
  C('usa-spring', 'physics', 'Spring effects', '弹簧效果',
    'bounce-in, pop and drop entrances with true spring timing (CSS linear() easing), plus jelly and rubber-band attention effects on view, hover or click.',
    '使用真实弹簧曲线（CSS linear() 缓动）的弹入、弹出与掉落入场，以及果冻、橡皮筋提醒效果，可由进入视口、悬停或点击触发。',
    ['spring', 'bounce', 'jelly', 'presets'],
    '<usa-spring effect="bounce-in" preset="bouncy">\n  <div class="card">Hello</div>\n</usa-spring>\n<usa-spring effect="jelly" trigger="click">\n  <button>Tap me</button>\n</usa-spring>',
    '<div class="demo-row"><usa-spring effect="bounce-in" repeat><span class="demo-pill">↑</span></usa-spring><usa-spring effect="jelly" trigger="click" tabindex="0"><span class="demo-tile">Tap</span></usa-spring></div>',
    { controls: [{ key: 'effect', values: ['bounce-in', 'pop', 'drop', 'jelly', 'rubber-band'] }, { key: 'preset', values: ['bouncy', 'wobbly', 'gentle', 'stiff', 'default'] }], replay: true }),
  C('usa-draggable', 'physics', 'Draggable', '可拖拽',
    'Drag with mouse, touch, pen or arrow keys. spring-back returns home with a wobble; inertia glides after a flick; snap to a grid or points; rubber-band bounds.',
    '支持鼠标、触摸、手写笔或方向键拖拽。spring-back 带弹性回到原位；inertia 甩出后惯性滑动；可吸附到网格或指定点；边界橡皮筋。',
    ['spring-back', 'inertia', 'snap', 'keyboard'],
    '<usa-draggable spring-back>\n  <div class="card">Drag me</div>\n</usa-draggable>\n<usa-draggable inertia snap="80" bounds="parent">…</usa-draggable>',
    '<div class="demo-row demo-drag-area"><usa-draggable spring-back preset="wobbly"><span class="demo-tile">Drag</span></usa-draggable><usa-draggable inertia snap="40" bounds="parent"><span class="demo-pill">⤧</span></usa-draggable></div>'),
  C('usa-overscroll', 'physics', 'Elastic overscroll', '弹性越界',
    'A scroll container whose edges stretch with iOS-style rubber-band resistance and spring back — touch, trackpad and wheel.',
    '滚动容器在边缘处以 iOS 式橡皮筋阻尼拉伸并弹回——支持触摸、触控板与滚轮。',
    ['rubber-band', 'scroll', 'iOS'],
    '<usa-overscroll style="height: 240px">\n  <ul>…</ul>\n</usa-overscroll>',
    '<usa-overscroll class="demo-scroll"><ul class="demo-list"><li>Pull past the top ↓</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li><li>Pull past the bottom ↑</li></ul></usa-overscroll>'),
];

export const helpers = [
  H('spring-api', 'physics', 'spring',
    'Animate anything with spring physics: presets gentle / wobbly / stiff / bouncy or your own stiffness, damping and mass. createSpring() gives an interruptible value for gestures.',
    '用弹簧物理驱动任意动画：预设 gentle / wobbly / stiff / bouncy，或自定义刚度、阻尼与质量。createSpring() 提供可打断的数值，适合手势。',
    ['stiffness', 'damping', 'mass', 'linear()'],
    "import { spring, createSpring } from 'use-scroll-animate/components/physics';\n\nspring(card, [{ transform: 'scale(0.6)' }, { transform: 'scale(1)' }], 'bouncy');\n\nconst x = createSpring({ spring: { stiffness: 300, damping: 18 }, onUpdate: (v) => (box.style.translate = `${v}px`) });\nx.set(240);",
    '<div class="demo-row"><button class="demo-btn" type="button" data-spring-demo>Spring it</button><span class="demo-tile" data-spring-box>●</span></div>'),
];

/** Live-demo wiring for the gallery (runs in the browser only). */
export const wire = {
  'spring-api': (stage, lib) => {
    const box = stage.querySelector('[data-spring-box]');
    let out = false;
    const x = lib.createSpring({ spring: 'wobbly', onUpdate: (v) => (box.style.transform = `translateX(${v}px)`) });
    stage.querySelector('[data-spring-demo]').addEventListener('click', () => {
      out = !out;
      x.set(out ? 90 : 0);
    });
  },
};
