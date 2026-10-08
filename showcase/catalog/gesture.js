import { C, H, K } from './make.js';

export const category = K('gesture', '✋', 'Gestures', '手势',
  'One recognizer for pan, swipe, pinch, long-press, tap and double-tap (mouse, touch, pen, trackpad), with release velocities handed straight to springs.',
  '统一识别拖动、轻扫、双指缩放、长按、单击与双击（鼠标、触摸、手写笔、触控板），松手速度直接交给弹簧。');

export const components = [
  C('usa-swipeable', 'gesture', 'Swipeable', '滑动删除',
    'Swipe-to-dismiss and swipe actions: content follows the finger, flies out on a fast swipe or past the distance, otherwise springs home with your release velocity. Delete / arrow keys work too.',
    '滑动删除与滑动操作：内容跟随手指，快速轻扫或超过距离即飞出，否则带着松手速度弹回原位。也支持 Delete / 方向键。',
    ['swipe', 'dismiss', 'spring', 'keyboard'],
    '<usa-swipeable distance="120" dismiss>\n  <div class="card">Swipe me away</div>\n</usa-swipeable>',
    '<div class="demo-stack"><usa-swipeable distance="90"><span class="demo-tile">← Swipe →</span></usa-swipeable><usa-swipeable distance="90" preset="wobbly"><span class="demo-tile">Wobbly</span></usa-swipeable></div>',
    { controls: [{ key: 'preset', values: ['default', 'wobbly', 'stiff', 'gentle'] }] }),
  C('usa-pinch-zoom', 'gesture', 'Pinch zoom', '双指缩放',
    'Pinch with two fingers or Ctrl + wheel / trackpad pinch, pan while zoomed, double-tap to toggle; scale and position spring back inside the bounds.',
    '双指或 Ctrl + 滚轮 / 触控板捏合缩放，放大后可拖动，双击切换；缩放与位置会弹回边界内。',
    ['pinch', 'zoom', 'double tap', 'trackpad'],
    '<usa-pinch-zoom max="4">\n  <img src="photo.jpg" alt="…">\n</usa-pinch-zoom>',
    '<usa-pinch-zoom max="3" class="demo-zoom"><div class="demo-tile demo-tile--lg">Pinch · Ctrl+wheel · double-tap · + / −</div></usa-pinch-zoom>'),
];

export const helpers = [
  H('gesture-api', 'gesture', 'gesture',
    'gesture(el, { onPan, onSwipe, onPinch, onLongPress, onTap, onDoubleTap }, { axis }) — pan states carry vx / vy so a spring can continue the motion: spring.set(0, vx).',
    'gesture(el, { onPan, onSwipe, onPinch, onLongPress, onTap, onDoubleTap }, { axis }) —— 拖动状态带有 vx / vy，可交给弹簧继续运动：spring.set(0, vx)。',
    ['pan', 'swipe', 'long press', 'velocity', 'spring'],
    "import { gesture } from 'motionary/components/gesture';\nimport { createSpring } from 'motionary/components/physics';\n\nconst x = createSpring({ spring: 'wobbly', onUpdate: (v) => (card.style.translate = `${v}px`) });\ngesture(card, {\n  onPan: ({ dx, vx, last }) => (last ? x.set(0, vx) : x.jump(dx)),\n  onLongPress: () => card.classList.add('picked'),\n}, { axis: 'x' });",
    '<div class="demo-row"><span class="demo-tile" data-gesture-box>Drag · flick · hold</span></div><p class="demo-note" data-gesture-log aria-live="polite">—</p>'),
];

export const wire = {
  'gesture-api': (stage, lib) => {
    const box = stage.querySelector('[data-gesture-box]');
    const log = stage.querySelector('[data-gesture-log]');
    const x = lib.createSpring({ spring: 'wobbly', onUpdate: (v) => (box.style.translate = `${v}px`) });
    lib.gesture(box, {
      onPan: ({ dx, vx, last }) => (last ? x.set(0, vx) : x.jump(dx)),
      onSwipe: ({ direction, velocity }) => (log.textContent = `swipe ${direction} · ${Math.round(velocity)} px/s`),
      onLongPress: () => (log.textContent = 'long-press'),
      onDoubleTap: () => (log.textContent = 'double-tap'),
    }, { axis: 'x' });
  },
};
