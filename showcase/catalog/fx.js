import { C, H, K } from './make.js';

export const category = K('fx', '✨', 'Effects (plugin API)', '特效（插件 API）',
  'One way to register and play every effect (5.0): registerEffect({ name, kind, run }), playEffect(el, name), bindEffect(el, name, { trigger }) or <usa-fx effect trigger>. Built-ins: every timeline entrance, attention seekers and click effects — reduced-motion safe.',
  '统一的效果注册与播放方式（5.0）：registerEffect({ name, kind, run })、playEffect(el, name)、bindEffect(el, name, { trigger }) 或 <usa-fx effect trigger>。内置：全部时间线入场效果、吸引注意效果与点击效果 —— 兼容“减少动态效果”。');

const FX = (id, en, zh, descEn, descZh, tags, usage, demo, controls, pack) => C('usa-fx', 'fx', en, zh, descEn, descZh, tags, usage, demo, { id, define: 'defineFx', controls, pack });
/** A 5.x effect-pack card (registers use-scroll-animate/components/effects in its code). */
const PK = (id, en, zh, descEn, descZh, tags, usage, demo, controls) => FX(id, en, zh, descEn, descZh, tags, usage, demo, controls, true);

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
  PK('fx-holo', 'Holographic card', '全息镭射卡',
    '5.1: a rainbow foil sheen and 3D tilt follow the pointer (trigger="load" keeps it on). Under reduced motion the sheen stays static.',
    '5.1：彩虹镭射光泽与 3D 倾斜跟随指针（trigger="load" 常驻）。减少动态效果时光泽静止。',
    ['card', 'holographic', 'foil', 'tilt'],
    '<usa-fx effect="holo" trigger="load">\n  <article class="card">…</article>\n</usa-fx>',
    '<usa-fx effect="holo" trigger="load"><div class="demo-tile demo-holo">✦ Rare card</div></usa-fx>'),
  PK('fx-card-moves', 'Card moves', '卡片动作',
    '5.1: glare sweep, book-open peek, card fan (children spread like a hand of cards), topple-and-spring — hover the card.',
    '5.1：扫光、翻书窥视、卡牌扇形展开（子元素像手牌一样散开）、倾倒回弹 —— 悬停卡片试试。',
    ['card', 'glare', 'book', 'fan', 'topple'],
    '<usa-fx effect="glare-sweep" trigger="hover">\n  <article class="card">…</article>\n</usa-fx>',
    '<usa-fx effect="card-fan" trigger="hover"><div class="demo-row demo-fan"><span class="demo-pill">A</span><span class="demo-pill">K</span><span class="demo-pill">Q</span><span class="demo-pill">J</span></div></usa-fx>',
    [{ key: 'effect', values: ['card-fan', 'glare-sweep', 'book-open', 'topple', 'jelly', 'tada'] }]),
  PK('fx-click2', 'Click effects 2.0', '点击特效 2.0',
    '5.1: shockwave rings, ink splash, spinning star burst, jelly press, water ring ripple and emoji rain — all from the click point.',
    '5.1：冲击波环、墨水飞溅、旋转星星爆裂、果冻按压、水波环涟漪与表情雨 —— 全部从点击处发出。',
    ['click', 'shockwave', 'ink', 'stars', 'emoji'],
    '<usa-fx effect="shockwave">\n  <button>Boom</button>\n</usa-fx>',
    '<usa-fx effect="shockwave"><button type="button" class="demo-btn">Click me</button></usa-fx>',
    [{ key: 'effect', values: ['shockwave', 'ink-splash', 'star-burst', 'jelly-press', 'ring-ripple', 'emoji-rain'] }]),
  PK('fx-physics', 'Bounce & physics', '弹跳与物理',
    '5.2: spring-solved bounce-in, rubber band, drop-and-bounce under gravity, damped bell swing — click the button.',
    '5.2：弹簧求解的弹入、橡皮筋、重力掉落回弹、阻尼摇摆铃铛 —— 点击按钮试试。',
    ['physics', 'spring', 'bounce', 'gravity', 'bell'],
    '<usa-fx effect="drop-bounce" trigger="enter">\n  <img src="badge.svg" alt="New">\n</usa-fx>',
    '<usa-fx effect="bounce-in"><button type="button" class="demo-btn">🔔 Play</button></usa-fx>',
    [{ key: 'effect', values: ['bounce-in', 'rubber-band', 'drop-bounce', 'bell-swing'] }]),
  PK('fx-gravity-text', 'Gravity text', '重力文字',
    '5.2: every character drops in under gravity and bounces, staggered; the text keeps an aria-label.',
    '5.2：每个字符在重力下逐个掉落并回弹；文本保留 aria-label。',
    ['text', 'gravity', 'bounce', 'stagger'],
    '<usa-fx effect="gravity-text" trigger="enter">\n  <h2>Falling letters</h2>\n</usa-fx>',
    '<usa-fx effect="gravity-text" trigger="hover"><p class="demo-split-line">Falling letters</p></usa-fx>'),
  PK('fx-spring-hover', 'Elastic hover & spring follow', '弹性悬停与弹簧跟随',
    '5.2: elastic-hover lifts with a springy overshoot; spring-follow chases the pointer across its parent (both persistent, trigger="load").',
    '5.2：elastic-hover 悬停时带弹性回弹地抬起；spring-follow 在父元素内弹簧般追随指针（均为常驻，trigger="load"）。',
    ['hover', 'spring', 'follow', 'cursor'],
    '<usa-fx effect="spring-follow" trigger="load">\n  <span class="dot"></span>\n</usa-fx>',
    '<usa-fx effect="elastic-hover" trigger="load"><div class="demo-tile">Hover me</div></usa-fx>',
    [{ key: 'effect', values: ['elastic-hover', 'spring-follow'] }]),
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
