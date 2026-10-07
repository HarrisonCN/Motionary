import { C, H, K } from './make.js';

export const category = K('click', '✦', 'Click & tap', '点击与轻触',
  'Click effects and button deformation (按钮点击形变): ripples, particle bursts, confetti, squash & stretch, elastic wobble, gooey liquid, press dents, shape and icon morphs, submit → loading → success, likes, hold-to-confirm, double-tap hearts, animated checkboxes and haptics.',
  '点击效果与按钮点击形变：水波纹、粒子迸发、彩带、挤压拉伸、弹性圆角、液态粘滞、按压凹陷、形状与图标变形、提交→加载→成功、点赞、长按确认、双击爱心、动画复选框与触感反馈。');

const btn = (label, extra = '') => `<button class="demo-btn" type="button"${extra}>${label}</button>`;

export const components = [
  C('usa-click', 'click', 'Click effects', '点击效果',
    'Wrap anything: ripple, burst (circle, star, heart, emoji), confetti, squish, press-spring and error shake — combinable, keyboard-friendly, optional haptics.',
    '包裹任意元素：水波纹、迸发粒子（圆点、星星、爱心、表情）、彩带、挤压、按压回弹与错误抖动——可组合、支持键盘，可选触感反馈。',
    ['ripple', 'burst', 'confetti', 'shake', 'haptics'],
    '<usa-click effect="press-spring burst" shape="star">\n  <button>Celebrate</button>\n</usa-click>',
    `<usa-click effect="press-spring burst" shape="star">${btn('Click me')}</usa-click>`,
    { controls: [{ key: 'effect', values: ['press-spring burst', 'ripple', 'confetti', 'squish', 'squish burst', 'shake'] }, { key: 'shape', values: ['star', 'circle', 'square', 'heart', '🎉'] }] }),
  C('usa-button', 'click', 'Button deformation', '按钮点击形变',
    'Spring-driven button click deformation: squash & stretch, elastic border-radius wobble, gooey liquid droplets, and a dent toward the pressed point. Combine them with deform="squash wobble".',
    '弹簧驱动的按钮点击形变：挤压拉伸、弹性圆角晃动、液态粘滞水滴、朝按压点凹陷。可组合：deform="squash wobble"。',
    ['squash', 'wobble', 'gooey', 'dent', 'spring'],
    '<usa-button deform="squash">\n  <button>Squash</button>\n</usa-button>\n<usa-button deform="gooey"><button>Gooey</button></usa-button>\n<usa-button deform="dent"><button>Dent</button></usa-button>',
    `<div class="demo-row"><usa-button deform="squash">${btn('Squash')}</usa-button><usa-button deform="wobble">${btn('Wobble')}</usa-button><usa-button deform="gooey">${btn('Gooey')}</usa-button><usa-button deform="dent">${btn('Dent')}</usa-button></div>`,
    { id: 'button-deform' }),
  C('usa-button', 'click', 'Shape morph', '形状变形',
    'The button morphs between pill, circle and icon-only with a spring — label and icon cross-fade. Click to cycle.',
    '按钮在胶囊、圆形与仅图标之间以弹簧变形——文字与图标交叉淡入。点击循环切换。',
    ['pill', 'circle', 'icon-only', 'morphTo()'],
    '<usa-button shape="pill">\n  <button><span data-icon>＋</span> <span data-label>New file</span></button>\n</usa-button>\n<script>btn.morphTo(\'icon\');</script>',
    `<usa-button shape="pill" deform="squash" data-shape-demo><button class="demo-btn" type="button" data-shape="pill"><span data-icon>＋</span> <span data-label>New file</span></button></usa-button>`,
    { id: 'button-shape' }),
  C('usa-button', 'click', 'Submit → loading → success', '提交 → 加载 → 成功',
    'morph="submit": click shrinks the button into a spinner (aria-busy), then a drawn check (or a shake + cross on error) and back. Call event.detail.done(ok) from usa:submit.',
    'morph="submit"：点击后按钮收缩为加载圈（aria-busy），随后绘出对勾（失败时抖动并显示叉号），再恢复。在 usa:submit 中调用 event.detail.done(ok)。',
    ['submit', 'loading', 'success', 'error'],
    '<usa-button morph="submit" deform="squash">\n  <button>Pay $20</button>\n</usa-button>\n<script>\n  btn.addEventListener(\'usa:submit\', async (e) => e.detail.done(await pay()));\n</script>',
    `<div class="demo-row"><usa-button morph="submit" deform="squash" data-submit="ok">${btn('Pay $20')}</usa-button><usa-button morph="submit" data-submit="fail">${btn('Fail me', ' style="background:#334155"')}</usa-button></div>`,
    { id: 'button-submit' }),
  C('usa-icon-morph', 'click', 'Icon morph', '图标变形',
    'Icons that morph point-by-point with a spring: play ↔ pause, menu ↔ close, plus ↔ minus, check, arrow. toggle makes it a button with per-icon labels.',
    '按点逐一插值、以弹簧变形的图标：播放 ↔ 暂停、菜单 ↔ 关闭、加 ↔ 减、对勾、箭头。toggle 使其成为带逐图标标签的按钮。',
    ['play/pause', 'menu/close', 'SVG', 'spring'],
    '<usa-icon-morph icons="play,pause" labels="Play,Pause" toggle></usa-icon-morph>\n<usa-icon-morph icons="menu,close" labels="Open menu,Close menu" toggle></usa-icon-morph>',
    '<div class="demo-row demo-icons"><usa-icon-morph icons="play,pause" labels="Play,Pause" toggle size="36"></usa-icon-morph><usa-icon-morph icons="menu,close" labels="Open menu,Close menu" toggle size="36"></usa-icon-morph><usa-icon-morph icons="plus,minus" labels="Expand,Collapse" toggle size="36"></usa-icon-morph><usa-icon-morph icons="arrow-right,check" labels="Next,Done" toggle size="36"></usa-icon-morph></div>'),
  C('usa-like', 'click', 'Like button', '点赞按钮',
    'A heart that pops with a spring and bursts into particles; aria-pressed, optional count.',
    '以弹簧弹起并迸发粒子的爱心；aria-pressed，可选计数。',
    ['heart', 'burst', 'aria-pressed'],
    '<usa-like count="128"></usa-like>',
    '<div class="demo-row"><usa-like count="128" size="30"></usa-like><usa-like liked count="9" size="30" color="#7c5cff" label="Favourite"></usa-like></div>'),
  C('usa-hold', 'click', 'Hold to confirm', '长按确认',
    'Press and hold (pointer, Space or Enter) while a ring fills; releasing early rewinds. For destructive actions.',
    '按住（指针、空格或回车）直到圆环填满；提前松开会回退。适合危险操作。',
    ['long-press', 'progress ring', 'confirm'],
    '<usa-hold duration="1200" label="Delete project">Hold to delete</usa-hold>',
    '<usa-hold class="demo-btn demo-btn-alt" duration="1200" label="Delete project">Hold to delete</usa-hold>'),
  C('usa-double-tap', 'click', 'Double tap', '双击点赞',
    'Double tap or double click a photo to pop a heart (or any emoji) at the tap point. L for keyboard users.',
    '双击照片，在点击处弹出爱心（或任意表情）。键盘用户按 L。',
    ['double tap', 'heart', 'touch'],
    '<usa-double-tap>\n  <img src="photo.jpg" alt="…">\n</usa-double-tap>',
    '<usa-double-tap class="demo-photo" tabindex="0"><div class="demo-face">Double-tap me</div></usa-double-tap>'),
  C('usa-checkbox', 'click', 'Animated checkbox', '动画复选框',
    'Form-associated checkbox: the box springs and the check draws itself; indeterminate state, circle shape.',
    '可参与表单的复选框：方框弹动，对勾自绘；支持半选状态与圆形。',
    ['form', 'role=checkbox', 'indeterminate'],
    '<usa-checkbox name="terms">I agree</usa-checkbox>',
    '<div class="demo-stack"><usa-checkbox checked>Spring physics</usa-checkbox><usa-checkbox>Card effects</usa-checkbox><usa-checkbox indeterminate shape="circle">Some selected</usa-checkbox></div>'),
];

export const helpers = [
  H('confetti-api', 'click', 'confetti',
    'confetti(), burst(x, y), shake(el) and haptic(ms) — the click-effect engine as functions, for your own buttons and events.',
    'confetti()、burst(x, y)、shake(el) 与 haptic(ms)——以函数形式提供点击效果引擎，用于你自己的按钮与事件。',
    ['confetti', 'burst', 'shake', 'vibrate'],
    "import { confetti, burst, shake, haptic } from 'use-scroll-animate/components/click';\n\nconfetti({ count: 120 });\nburst(e.clientX, e.clientY, { shape: '★' });\nshake(form);\nhaptic(15);",
    '<div class="demo-row"><button class="demo-btn" type="button" data-confetti>Confetti 🎉</button><button class="demo-btn demo-btn-alt" type="button" data-shake>Shake</button></div>'),
];

const SHAPES = ['pill', 'circle', 'icon'];

export const wire = {
  'button-shape': (stage) => {
    const b = stage.querySelector('usa-button');
    let i = 0;
    b.addEventListener('click', () => b.morphTo(SHAPES[(i = (i + 1) % SHAPES.length)]));
  },
  'button-submit': (stage) => {
    stage.addEventListener('usa:submit', (e) => {
      const ok = e.target.dataset.submit === 'ok';
      setTimeout(() => e.detail.done(ok), 1200);
    });
  },
  'confetti-api': (stage, lib) => {
    stage.querySelector('[data-confetti]').addEventListener('click', (e) => {
      lib.confetti({ x: e.clientX, y: e.clientY, count: 90 });
      lib.haptic(12);
    });
    stage.querySelector('[data-shake]').addEventListener('click', (e) => lib.shake(e.currentTarget));
  },
};
