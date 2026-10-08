import { C, H, K } from './make.js';

export const category = K('depth', '⬢', '3D & depth', '3D 与景深',
  'CSS 3D without a 3D engine: a spring-driven cube, layered depth parallax from pointer, scroll or device tilt (gyroscope), plus the 3D ring carousel in Cards.',
  '无需 3D 引擎的 CSS 3D：弹簧驱动的立方体、由指针、滚动或设备倾斜（陀螺仪）驱动的分层景深视差；3D 环形轮播见“卡片”分类。');

export const components = [
  C('usa-cube', 'depth', '3D cube', '3D 立方体',
    'Up to six children become the faces of a CSS 3D cube. Drag / swipe, arrow keys, autoplay or show("top"); spring-driven, the front face is the only one exposed to screen readers.',
    '最多六个子元素成为 CSS 3D 立方体的各面。拖拽 / 轻扫、方向键、自动播放或 show("top")；弹簧驱动，仅正面对读屏可见。',
    ['cube', '3d', 'rotate', 'carousel'],
    '<usa-cube size="200" autoplay="3000">\n  <div>Front</div><div>Right</div><div>Back</div><div>Left</div>\n</usa-cube>',
    '<usa-cube size="140" class="demo-cube"><div class="demo-face">1</div><div class="demo-face">2</div><div class="demo-face">3</div><div class="demo-face">4</div><div class="demo-face">↑</div><div class="demo-face">↓</div></usa-cube>',
    { controls: [{ key: 'autoplay', values: ['0', '2500'] }] }),
  C('usa-depth', 'depth', 'Depth parallax', '景深视差',
    'Layers with data-depth (-1…1) shift and scale by depth as the pointer moves, the phone tilts (source="orientation") or the page scrolls; optional whole-scene rotation.',
    '带 data-depth（-1…1）的图层按深度随指针移动、手机倾斜（source="orientation"）或页面滚动而位移缩放；可选整体旋转。',
    ['parallax', 'depth', 'gyroscope', 'tilt', 'layers'],
    '<usa-depth source="pointer orientation" strength="40" rotate="6">\n  <div class="scene">\n    <img data-depth="-0.6" src="sky.png" alt="">\n    <img data-depth="0.2" src="hills.png" alt="">\n    <h2 data-depth="0.8">Title</h2>\n  </div>\n</usa-depth>',
    '<usa-depth strength="30" rotate="8" class="demo-depth"><div class="demo-depth__scene"><span class="demo-depth__l demo-depth__l--1" data-depth="-0.8"></span><span class="demo-depth__l demo-depth__l--2" data-depth="0.1"></span><span class="demo-tile" data-depth="0.9">Move me</span></div></usa-depth>'),
];

export const helpers = [
  H('device-tilt', 'depth', 'deviceTilt',
    'deviceTilt(cb, { range, smooth }) streams smoothed -1…1 tilt from the gyroscope; call requestOrientationPermission() from a tap first on iOS.',
    'deviceTilt(cb, { range, smooth }) 输出平滑后的 -1…1 陀螺仪倾斜值；在 iOS 上需先在点击中调用 requestOrientationPermission()。',
    ['gyroscope', 'device orientation', 'tilt', 'mobile'],
    "import { deviceTilt, requestOrientationPermission } from 'motionary/components/depth';\n\nbutton.onclick = async () => {\n  if (!(await requestOrientationPermission())) return;\n  deviceTilt(({ x, y }) => card.style.setProperty('transform', `rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`));\n};",
    '<button type="button" class="demo-link" data-tilt-btn>Enable tilt</button><p class="demo-note" data-tilt-out aria-live="polite">x 0 · y 0</p>'),
];

export const wire = {
  'device-tilt': (stage, lib) => {
    const out = stage.querySelector('[data-tilt-out]');
    stage.querySelector('[data-tilt-btn]').addEventListener('click', async () => {
      if (!lib.supportsOrientation() || !(await lib.requestOrientationPermission())) return (out.textContent = 'No motion sensor (desktop) — try on a phone');
      lib.deviceTilt(({ x, y }) => (out.textContent = `x ${x.toFixed(2)} · y ${y.toFixed(2)}`));
    });
  },
};
