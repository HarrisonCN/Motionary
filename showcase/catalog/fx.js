import { C, H, K } from './make.js';

export const category = K('fx', '✨', 'Effects (plugin API)', '特效（插件 API）',
  'One way to register and play every effect (5.0): registerEffect({ name, kind, run }), playEffect(el, name), bindEffect(el, name, { trigger }) or <usa-fx effect trigger>. Built-ins: every timeline entrance, attention seekers and click effects — reduced-motion safe.',
  '统一的效果注册与播放方式（5.0）：registerEffect({ name, kind, run })、playEffect(el, name)、bindEffect(el, name, { trigger }) 或 <usa-fx effect trigger>。内置：全部时间线入场效果、吸引注意效果与点击效果 —— 兼容“减少动态效果”。');

const FX = (id, en, zh, descEn, descZh, tags, usage, demo, controls) => C('usa-fx', 'fx', en, zh, descEn, descZh, tags, usage, demo, { id, define: 'defineFx', controls });

export const components = [
  FX('fx', 'Attention seekers', '吸引注意', 
    '<usa-fx> plays any registered effect on its child: pulse, pop, jelly, wiggle, heartbeat, bounce, flash (≤ 2 per second), tada, shake. Click the button.',
    '<usa-fx> 在子元素上播放任意已注册效果：脉冲、弹出、果冻、摇摆、心跳、弹跳、闪烁（每秒 ≤ 2 次）、庆祝、抖动。点击按钮试试。',
    ['attention', 'pulse', 'jelly', 'bounce', 'tada'],
    '<usa-fx effect="jelly" trigger="click">\n  <button>Press me</button>\n</usa-fx>',
    '<usa-fx effect="jelly" trigger="click"><button type="button" class="demo-btn">Press me</button></usa-fx>',
    [{ key: 'effect', values: ['jelly', 'pop', 'pulse', 'wiggle', 'heartbeat', 'bounce', 'flash', 'tada', 'shake'] }]),
  FX('fx-click', 'Click effects', '点击特效',
    'Registered click effects — burst, confetti and ink ripple — start at the pointer.',
    '已注册的点击效果 —— 粒子爆裂、彩带与墨水涟漪 —— 从指针位置开始。',
    ['click', 'burst', 'confetti', 'ripple'],
    '<usa-fx effect="confetti">\n  <button>Celebrate</button>\n</usa-fx>',
    '<usa-fx effect="burst" trigger="click"><button type="button" class="demo-btn">Click</button></usa-fx>',
    [{ key: 'effect', values: ['burst', 'confetti', 'ripple'] }]),
  FX('fx-enter', 'Entrances on scroll', '滚动入场',
    'Every timeline preset is also an enter effect: trigger="enter" plays it when the element scrolls into view (once).',
    '每个时间线预设同时也是入场效果：trigger="enter" 在元素滚动进入视口时播放（一次）。',
    ['enter', 'reveal', 'fade-up', 'clip'],
    '<usa-fx effect="fade-up" trigger="enter">\n  <h2>Hello</h2>\n</usa-fx>',
    '<usa-fx effect="clip-up" trigger="enter"><div class="demo-tile">Hello</div></usa-fx>',
    [{ key: 'effect', values: ['clip-up', 'fade-up', 'fade-left', 'scale', 'blur', 'rotate', 'clip-right'] }]),
];

export const helpers = [
  H('register-effect', 'fx', 'registerEffect',
    'Add your own effect once and use it everywhere — playEffect(), bindEffect(), <usa-fx>. ctx.animate() already applies reduced motion, motion sensitivity, intensity and the animation budget.',
    '注册一次自定义效果，处处可用 —— playEffect()、bindEffect()、<usa-fx>。ctx.animate() 已自动处理减少动态效果、运动敏感度、强度与动画预算。',
    ['plugin', 'registry', 'custom effect'],
    "import { registerEffect, playEffect } from 'use-scroll-animate/components/fx';\n\nregisterEffect({\n  name: 'spin-pop',\n  kind: 'attention',\n  run: (el, o, ctx) => ctx.animate(el, [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.2) rotate(180deg)' }, { transform: 'scale(1) rotate(360deg)' }], { duration: 700 }),\n});\nplayEffect(document.querySelector('.logo'), 'spin-pop');",
    '<div class="demo-row"><span class="demo-pill" data-fx-target>✦</span><button type="button" class="demo-link" data-fx-go>playEffect(el, "spin-pop")</button></div><p class="demo-note" data-fx-list></p>'),
];

export const wire = {
  'register-effect': (stage, lib) => {
    if (!lib.hasEffect('spin-pop'))
      lib.registerEffect({ name: 'spin-pop', kind: 'attention', run: (el, o, ctx) => ctx.animate(el, [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.3) rotate(180deg)' }, { transform: 'scale(1) rotate(360deg)' }], { duration: 700, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }) });
    stage.querySelector('[data-fx-list]').textContent = `${lib.listEffects().length} effects registered`;
    stage.querySelector('[data-fx-go]').addEventListener('click', () => lib.playEffect(stage.querySelector('[data-fx-target]'), 'spin-pop'));
  },
};
