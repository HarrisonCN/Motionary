'use strict';

/**
 * Motion intent parser (10.7; 11.6: moved to Motion Core, re-exported by `motionary/tooling/ai`) — turns a short
 * natural-language description ("fade the cards up slowly when they scroll
 * into view, one after another") into a motion spec: effect, direction,
 * distance, duration, delay, easing, trigger, repeat, stagger, Web
 * Animations keyframes + options, a CSS rule and the Motionary components
 * that do it. English and Chinese phrases. A small deterministic parser —
 * no model, no network — shared by `<usa-motion-prompt>` and the
 * `suggest_motion` tool of `motionary-mcp` (which runs an evaluation set of
 * prompts against it in CI).
 *
 * Pure: no DOM access — safe in Node, workers and SSR.
 */
const R = (re, v) => ({ re, v });
// effects, most specific first ("slide" before "fade" so "slide and fade in" picks slide as the main motion)
const EFFECTS = [
    R(/type ?writer|typing|types? (?:out|in)|打字/, 'typewriter'),
    R(/count(?:s|ing)? up|counter|tick(?:s|ing)? up|number(?:s)? (?:roll|count)|数字(?:滚动|增长)|计数/, 'count'),
    R(/confetti|particles?|sparkles?|粒子|彩带|烟花/, 'particles'),
    R(/marquee|ticker tape|scroll(?:s|ing)? (?:sideways|horizontally) (?:forever|endlessly)|跑马灯/, 'marquee'),
    R(/parallax|视差/, 'parallax'),
    R(/magnet(?:ic)?|follows? the (?:cursor|mouse|pointer)|磁吸|跟随(?:鼠标|光标)/, 'magnetic'),
    R(/ripple|涟漪|水波/, 'ripple'),
    R(/tilt|3d hover|倾斜/, 'tilt'),
    R(/shake|wiggle|jiggle|wobble|tremble|抖动|摇晃|晃动/, 'shake'),
    R(/pulse|pulsate|heartbeat|throb|breath(?:e|ing)|脉冲|呼吸|心跳/, 'pulse'),
    R(/bounce|bouncing|bouncy entrance|弹跳|弹起|蹦/, 'bounce'),
    R(/flip|翻转/, 'flip'),
    R(/spin|rotate|rotating|rotation|turn(?:s|ing)? around|旋转|转动/, 'rotate'),
    R(/reveal|wipe|unmask|clip(?:-| )path|揭示|遮罩|擦除/, 'reveal'),
    R(/blur|unblur|focus in|模糊/, 'blur'),
    R(/zoom|scale|grow|shrink|pop(?:s)? (?:in|out|up)|enlarge|缩放|放大|缩小|弹出/, 'zoom'),
    R(/slide|slides|sliding|move(?:s)? in|fly(?:ing)? in|swoop|滑入|滑动|飞入|移入/, 'slide'),
    R(/fade|fades|fading|appear|disappear|dissolve|淡入|淡出|渐显|渐隐|出现/, 'fade'),
];
const DIRS = [
    // explicit "from the …" first, so "slide in from the left" is not caught by the bare \bleft\b rule below
    R(/from (?:the )?left|从左/, 'right'),
    R(/from (?:the )?right|从右/, 'left'),
    R(/from (?:the )?(?:top|above)|从上/, 'down'),
    R(/from (?:the )?(?:bottom|below)|\bup\b|upward|rise|rises|从下(?:方|面)?|向上|上浮|升起/, 'up'),
    R(/from (?:the )?(?:top|above)|\bdown\b|downward|drop(?:s)? (?:in|down)|fall(?:s)? in|从上(?:方|面)?|向下|落下/, 'down'),
    R(/from (?:the )?right|\bleft(?:ward)?\b|向左|从右/, 'left'),
    R(/from (?:the )?left|\bright(?:ward)?\b|向右|从左/, 'right'),
];
const TRIGGERS = [
    R(/hover|mouse ?over|on mouse|pointer (?:over|enter)|悬停|鼠标(?:移入|悬浮|经过)/, 'hover'),
    R(/click|tap|press|点击|按下|轻触/, 'click'),
    R(/scroll|in(?:to)? view|on screen|viewport|visible|as (?:you|the user) scroll|滚动|进入(?:视口|视野|屏幕)|可见/, 'scroll'),
    R(/forever|infinite(?:ly)?|endless(?:ly)?|loop(?:s|ing)?|continuous(?:ly)?|repeat(?:s|edly|ing)?(?! once)|always|循环|一直|无限|反复/, 'loop'),
    R(/on (?:page )?load|when the page loads|on (?:start|mount)|at start|页面加载|加载时|进入页面/, 'load'),
];
const EASINGS = [
    R(/spring(?:y)?|elastic|弹簧|弹性/, ['spring', 'cubic-bezier(0.34, 1.56, 0.64, 1)']),
    R(/bouncy|overshoot|playful|回弹|俏皮/, ['bouncy', 'cubic-bezier(0.68, -0.55, 0.27, 1.55)']),
    R(/linear(?:ly)?|constant speed|steady|匀速|线性/, ['linear', 'linear']),
    R(/snappy|crisp|quick and sharp|干脆|利落/, ['snappy', 'cubic-bezier(0.2, 0.9, 0.1, 1)']),
    R(/ease[- ]?in[- ]?out|smooth(?:ly)?|gentle|gently|soft(?:ly)?|subtle|平滑|柔和|顺滑|轻柔/, ['smooth', 'cubic-bezier(0.65, 0, 0.35, 1)']),
    R(/ease[- ]?in\b|accelerat|speeds? up|加速/, ['ease-in', 'cubic-bezier(0.4, 0, 1, 1)']),
    R(/ease[- ]?out|decelerat|slows? down|减速/, ['ease-out', 'cubic-bezier(0, 0, 0.2, 1)']),
];
const num = (s) => parseFloat(s.replace(',', '.'));
function parseDuration(t, matched) {
    const m = /(\d+(?:[.,]\d+)?)\s*(ms|milliseconds?|毫秒|s\b|secs?|seconds?|秒)/.exec(t);
    if (m) {
        matched.push(m[0]);
        return Math.round(/^(ms|millisecond|毫秒)/.test(m[2]) ? num(m[1]) : num(m[1]) * 1000);
    }
    const w = [
        [/very slow(?:ly)?|really slow|非常慢|很慢/, 1600],
        [/slow(?:ly)?|leisurely|缓慢|慢慢|慢/, 1000],
        [/very fast|really fast|instant(?:ly)?|非常快|很快|瞬间/, 180],
        [/fast|quick(?:ly)?|rapid(?:ly)?|snappy|brisk|快速|快/, 300],
    ];
    for (const [re, v] of w) {
        const x = re.exec(t);
        if (x) {
            matched.push(x[0]);
            return v;
        }
    }
    return null;
}
function parseDelay(t, matched) {
    const m = /(?:after|delay(?:ed)?(?: by| of)?|wait(?:s|ing)?|延迟|等待)\s*(\d+(?:[.,]\d+)?)\s*(ms|毫秒|s\b|secs?|seconds?|秒)/.exec(t) ||
        // "after a 300ms delay", "a 1 s delay", "延迟 300 毫秒" handled above; the number-first form here
        /(?:after )?(?:a |an )?(\d+(?:[.,]\d+)?)\s*(ms|毫秒|s\b|secs?|seconds?|秒)\s*(?:-\s*)?(?:delay|pause|wait|后)/.exec(t);
    if (!m)
        return 0;
    matched.push(m[0]);
    return Math.round(/^(ms|毫秒)/.test(m[2]) ? num(m[1]) : num(m[1]) * 1000);
}
function parseStagger(t, matched) {
    const m = /(\d+)\s*ms\s*(?:apart|between|stagger)|stagger(?:ed)?(?: by)?\s*(\d+)\s*ms/.exec(t);
    if (m) {
        matched.push(m[0]);
        return +(m[1] || m[2]);
    }
    const w = /one (?:after|by) (?:another|one)|stagger(?:ed)?|in sequence|sequentially|each (?:card|item|word|letter|line) in turn|一个接一个|依次|逐个|交错/.exec(t);
    if (w) {
        matched.push(w[0]);
        return 80;
    }
    return 0;
}
function parseIterations(t, trigger, matched) {
    const m = /(\d+|once|twice|three times|一次|两次|三次)\s*(?:times|次)?/.exec(t.replace(/\d+(?:[.,]\d+)?\s*(?:ms|s\b|secs?|seconds?|毫秒|秒|px|%|deg|°)/g, ''));
    if (trigger === 'loop')
        return Infinity;
    if (m && /once|一次/.test(m[1]))
        return 1;
    if (m && /twice|两次/.test(m[1]))
        return (matched.push(m[0]), 2);
    if (m && /three|三次/.test(m[1]))
        return (matched.push(m[0]), 3);
    if (m && /^\d+$/.test(m[1]) && /times|次/.test(m[0]))
        return (matched.push(m[0]), +m[1]);
    return 1;
}
function parseAmount(t, effect) {
    const px = /(\d+)\s*(?:px|pixels?|像素)/.exec(t);
    const deg = /(\d+)\s*(?:deg|degrees?|°|度)/.exec(t);
    const pct = /(\d+)\s*%/.exec(t);
    if (effect === 'slide' || effect === 'fade' || effect === 'bounce' || effect === 'shake')
        return px ? +px[1] : effect === 'shake' ? 8 : effect === 'bounce' ? 24 : 32;
    if (effect === 'rotate' || effect === 'flip')
        return deg ? +deg[1] : effect === 'flip' ? 180 : /half/.test(t) ? 180 : 360;
    if (effect === 'zoom') {
        if (pct)
            return +pct[1] / 100;
        return /shrink|out\b|缩小/.test(t) ? 1.2 : 0.8;
    }
    if (effect === 'pulse')
        return pct ? 1 + +pct[1] / 100 : 1.06;
    if (effect === 'blur')
        return px ? +px[1] : 8;
    return 0;
}
const DIR_XY = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] };
function keyframesFor(i) {
    const [dx, dy] = DIR_XY[i.direction || 'up'];
    const fade = i.effect === 'fade' || i.also.includes('fade');
    const from = {}, to = {};
    const tf = [], tt = [];
    switch (i.effect) {
        case 'slide':
        case 'fade':
            if (i.effect === 'slide' || i.direction) {
                tf.push(`translate(${dx * i.amount}px, ${dy * i.amount}px)`);
                tt.push('translate(0px, 0px)');
            }
            break;
        case 'zoom':
            tf.push(`scale(${i.amount})`);
            tt.push('scale(1)');
            break;
        case 'rotate':
            tf.push(`rotate(${i.direction === 'left' ? -i.amount : i.amount}deg)`);
            tt.push('rotate(0deg)');
            break;
        case 'flip':
            tf.push(`perspective(600px) rotate${i.direction === 'left' || i.direction === 'right' ? 'Y' : 'X'}(${i.amount}deg)`);
            tt.push(`perspective(600px) rotate${i.direction === 'left' || i.direction === 'right' ? 'Y' : 'X'}(0deg)`);
            break;
        case 'blur':
            from.filter = `blur(${i.amount}px)`;
            to.filter = 'blur(0px)';
            break;
        case 'reveal':
            from.clipPath = i.direction === 'left' ? 'inset(0 0 0 100%)' : i.direction === 'right' ? 'inset(0 100% 0 0)' : i.direction === 'down' ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)';
            to.clipPath = 'inset(0 0 0 0)';
            break;
        case 'bounce':
            return [
                { transform: `translateY(${-i.amount}px)`, opacity: fade ? 0 : 1, offset: 0 },
                { transform: 'translateY(0px)', opacity: 1, offset: 0.55 },
                { transform: `translateY(${-i.amount * 0.35}px)`, offset: 0.75 },
                { transform: 'translateY(0px)', offset: 1 },
            ];
        case 'shake':
            return [0, 1, -1, 1, -1, 0].map((k, n, a) => ({ transform: `translateX(${k * i.amount}px)`, offset: n / (a.length - 1) }));
        case 'pulse':
            return [{ transform: 'scale(1)' }, { transform: `scale(${i.amount})` }, { transform: 'scale(1)' }];
    }
    if (i.also.includes('zoom') && i.effect !== 'zoom')
        (tf.push('scale(0.85)'), tt.push('scale(1)'));
    if (i.also.includes('rotate') && i.effect !== 'rotate')
        (tf.push('rotate(-8deg)'), tt.push('rotate(0deg)'));
    if (i.also.includes('blur') && i.effect !== 'blur')
        (from.filter = 'blur(6px)'), (to.filter = 'blur(0px)');
    if (tf.length)
        (from.transform = tf.join(' ')), (to.transform = tt.join(' '));
    if (fade || ['slide', 'zoom', 'blur', 'flip'].includes(i.effect))
        (from.opacity = 0), (to.opacity = 1);
    return [from, to];
}
const COMPONENTS = {
    typewriter: [['usa-typewriter', 'types text out character by character', '<usa-typewriter text="Hello, Motionary"></usa-typewriter>']],
    count: [['usa-counter', 'animates a number up when it scrolls into view', '<usa-counter to="1280" duration="1200"></usa-counter>']],
    particles: [['usa-particles', 'particle field (Canvas 2D)', '<usa-particles count="80"></usa-particles>'], ['usa-gpu-particles', 'tens of thousands of GPU particles', '<usa-gpu-particles count="20000" mode="swirl"></usa-gpu-particles>']],
    marquee: [['usa-marquee', 'endless horizontal scroller', '<usa-marquee speed="40"><span>…</span></usa-marquee>']],
    parallax: [['usa-parallax-layers', 'layers move at different speeds while scrolling', '<usa-parallax-layers><img data-depth="0.2" src="…"></usa-parallax-layers>']],
    magnetic: [['usa-magnetic', 'element follows the pointer a little', '<usa-magnetic><button>Hover me</button></usa-magnetic>']],
    ripple: [['usa-ripple', 'material-style click ripple', '<usa-ripple><button>Click</button></usa-ripple>']],
    tilt: [['usa-tilt', '3D tilt towards the pointer', '<usa-tilt><div class="card">…</div></usa-tilt>']],
    reveal: [['usa-mask-reveal', 'clip-path reveal on scroll', '<usa-mask-reveal><img src="…"></usa-mask-reveal>'], ['usa-reveal', 'reveal on scroll', '<usa-reveal><div>…</div></usa-reveal>']],
    scroll: [['usa-reveal', 'plays the entrance when the element scrolls into view', '<usa-reveal><div>…</div></usa-reveal>']],
};
/** Parse a natural-language motion description. */
function describeMotion(input) {
    const text = String(input || '').trim();
    const t = text.toLowerCase();
    const matched = [];
    const hits = EFFECTS.filter((r) => {
        const m = r.re.exec(t);
        if (m)
            matched.push(m[0]);
        return !!m;
    }).map((r) => r.v);
    let effect = hits[0] || 'fade';
    // "fade in and slide up": the slide is the motion, the fade rides along
    if (effect === 'fade' && hits.includes('slide'))
        effect = 'slide';
    const also = hits.filter((h) => h !== effect);
    let direction = null;
    for (const r of DIRS) {
        const m = r.re.exec(t);
        if (m && !/(?:in|out)$/.test(m[0]) && !(effect === 'zoom' && /\bup\b/.test(m[0]) && /pop/.test(t))) {
            direction = r.v;
            matched.push(m[0]);
            break;
        }
    }
    if (!direction && effect === 'slide')
        direction = 'up';
    let trigger = 'load';
    const trig = TRIGGERS.filter((r) => r.re.test(t)).map((r) => r.v);
    if (trig.length)
        trigger = trig.includes('hover') ? 'hover' : trig.includes('click') ? 'click' : trig.includes('scroll') && !(trig.includes('loop') && /forever|infinite|endless|无限|一直/.test(t)) ? 'scroll' : trig[0];
    if (['shake', 'pulse'].includes(effect) && trigger === 'load' && /attention|notify|提醒|注意/.test(t))
        trigger = 'loop';
    if (effect === 'marquee')
        trigger = 'loop';
    const easingHit = EASINGS.find((r) => r.re.test(t));
    const easingName = easingHit ? easingHit.v[0] : effect === 'bounce' ? 'bouncy' : effect === 'shake' || effect === 'pulse' ? 'smooth' : 'ease-out';
    const easing = easingHit ? easingHit.v[1] : easingName === 'bouncy' ? 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' : easingName === 'smooth' ? 'cubic-bezier(0.65, 0, 0.35, 1)' : 'cubic-bezier(0, 0, 0.2, 1)';
    if (easingHit)
        matched.push(easingHit.re.exec(t)[0]);
    const duration = parseDuration(t, matched) ?? (effect === 'shake' ? 500 : effect === 'pulse' ? 1200 : effect === 'typewriter' ? 1800 : effect === 'count' ? 1200 : 600);
    const delay = parseDelay(t, matched);
    const stagger = parseStagger(t, matched);
    const iterations = parseIterations(t, trigger, matched);
    const alternate = /back and forth|alternat|yoyo|ping[- ]?pong|往返|来回/.test(t) || (effect === 'pulse' && trigger === 'loop' && false);
    const amount = parseAmount(t, effect);
    const kf = keyframesFor({ effect, also, direction, amount });
    const options = { duration, delay, easing, fill: 'both', iterations, ...(alternate ? { direction: 'alternate' } : {}) };
    const css = cssFor(kf, options, trigger, stagger);
    const comps = [];
    for (const key of [effect, trigger])
        for (const [tag, why, snippet] of COMPONENTS[key] || [])
            if (!comps.some((c) => c.tag === tag))
                comps.push({ tag, why, snippet });
    if (stagger)
        comps.push({ tag: 'usa-stagger', why: 'staggers its children', snippet: `<usa-stagger delay="${stagger}"><div>…</div><div>…</div></usa-stagger>` });
    const understood = matched.join(' ').length;
    const confidence = Math.max(0.1, Math.min(1, (hits.length ? 0.5 : 0.15) + Math.min(0.5, understood / Math.max(12, t.length))));
    return { text, effect, also, direction, amount, duration, delay, easing, easingName, trigger, iterations, alternate, stagger, reducedMotion: 'respect', keyframes: kf, options, css, components: comps, confidence: Math.round(confidence * 100) / 100, matched };
}
const kebab = (k) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
function cssFor(kf, o, trigger, stagger) {
    const name = 'usa-motion';
    const frames = kf.map((f, i) => {
        const pct = f.offset != null ? Math.round(f.offset * 100) : Math.round((i / Math.max(1, kf.length - 1)) * 100);
        const props = Object.entries(f).filter(([k]) => k !== 'offset' && k !== 'easing').map(([k, v]) => `${kebab(k)}: ${v};`).join(' ');
        return `  ${pct}% { ${props} }`;
    });
    const it = o.iterations === Infinity ? 'infinite' : String(o.iterations ?? 1);
    const anim = `${name} ${o.duration}ms ${o.easing} ${o.delay || 0}ms ${it}${o.direction === 'alternate' ? ' alternate' : ''} both`;
    const sel = trigger === 'hover' ? '.target:hover' : trigger === 'click' ? '.target.is-active' : trigger === 'scroll' ? '.target.is-visible' : '.target';
    return [
        `@keyframes ${name} {`,
        ...frames,
        '}',
        `${sel} { animation: ${anim}; }`,
        ...(stagger ? [`.target:nth-child(n) { animation-delay: calc(var(--i, 0) * ${stagger}ms); }`] : []),
        '@media (prefers-reduced-motion: reduce) { .target { animation: none; } }',
    ].join('\n');
}
/** Turn an intent into ready code for one element: CSS, WAAPI or a Motionary component. */
function motionSnippet(i, style = 'waapi') {
    if (style === 'css')
        return i.css;
    if (style === 'component')
        return i.components[0]?.snippet || `<usa-reveal><div class="target">…</div></usa-reveal>`;
    const opts = JSON.stringify({ ...i.options, iterations: i.iterations === Infinity ? 'Infinity' : i.iterations }).replace('"Infinity"', 'Infinity');
    const play = `el.animate(${JSON.stringify(i.keyframes)}, ${opts});`;
    const guard = `if (!matchMedia('(prefers-reduced-motion: reduce)').matches) `;
    switch (i.trigger) {
        case 'hover':
            return `const el = document.querySelector('.target');\nel.addEventListener('pointerenter', () => { ${guard}${play} });`;
        case 'click':
            return `const el = document.querySelector('.target');\nel.addEventListener('click', () => { ${guard}${play} });`;
        case 'scroll':
            return `const io = new IntersectionObserver((entries) => entries.forEach((e, n) => {\n  if (!e.isIntersecting) return;\n  const el = e.target; io.unobserve(el);\n  ${guard}el.animate(${JSON.stringify(i.keyframes)}, { ...${opts}, delay: ${i.delay} + n * ${i.stagger} });\n}), { threshold: 0.2 });\ndocument.querySelectorAll('.target').forEach((el) => io.observe(el));`;
        default:
            return `const el = document.querySelector('.target');\n${guard}${play}`;
    }
}
// ---------------------------------------------------------------------------------------------------------------
// 11.6: optional, user-supplied LLM provider. The local parser above stays the default (offline, deterministic,
// low latency). A provider is only called when the caller passes one; its output must validate against
// MOTION_SPEC_SCHEMA (JSON Schema) or the local result is used. This module never performs a network request itself.
const MOTION_EFFECTS = ['fade', 'slide', 'zoom', 'rotate', 'flip', 'bounce', 'shake', 'pulse', 'blur', 'reveal', 'typewriter', 'count', 'tilt', 'magnetic', 'ripple', 'parallax', 'marquee', 'particles'];
const MOTION_TRIGGERS = ['load', 'scroll', 'hover', 'click', 'loop'];
const EASING_BY_NAME = /*#__PURE__*/ Object.fromEntries(EASINGS.map((r) => r.v));
const EASING_RE = '^(?:linear|ease|ease-in|ease-out|ease-in-out|spring|bouncy|snappy|smooth|cubic-bezier\\(\\s*-?[\\d.]+\\s*,\\s*-?[\\d.]+\\s*,\\s*-?[\\d.]+\\s*,\\s*-?[\\d.]+\\s*\\)|steps\\(\\s*\\d+\\s*(?:,\\s*(?:start|end|jump-[a-z]+)\\s*)?\\))$';
/** JSON Schema (2020-12) every provider answer must satisfy. */
const MOTION_SPEC_SCHEMA = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Motionary motion spec',
    type: 'object',
    additionalProperties: false,
    required: ['effect'],
    properties: {
        effect: { type: 'string', enum: MOTION_EFFECTS },
        also: { type: 'array', items: { type: 'string', enum: MOTION_EFFECTS }, maxItems: 4 },
        direction: { enum: ['up', 'down', 'left', 'right', null] },
        amount: { type: 'number', minimum: 0, maximum: 2000 },
        duration: { type: 'number', minimum: 0, maximum: 20000 },
        delay: { type: 'number', minimum: 0, maximum: 20000 },
        easing: { type: 'string', maxLength: 80, pattern: EASING_RE },
        trigger: { type: 'string', enum: MOTION_TRIGGERS },
        iterations: { anyOf: [{ type: 'integer', minimum: 1, maximum: 1000 }, { const: 'infinite' }] },
        alternate: { type: 'boolean' },
        stagger: { type: 'number', minimum: 0, maximum: 5000 },
    },
};
const typeOk = (t, v) => t === 'integer' ? Number.isInteger(v) : t === 'number' ? typeof v === 'number' && Number.isFinite(v) : t === 'array' ? Array.isArray(v) : t === 'object' ? !!v && typeof v === 'object' && !Array.isArray(v) : t === 'null' ? v === null : typeof v === t;
/** Validate a value against the JSON Schema subset used by MOTION_SPEC_SCHEMA (type, enum, const, required,
 * additionalProperties, properties, items, anyOf, minimum, maximum, maxItems, maxLength, pattern). Returns the errors. */
function validateMotionSpec(value, schema = MOTION_SPEC_SCHEMA, path = '$') {
    const e = [];
    if (schema.anyOf) {
        if (!schema.anyOf.some((s) => !validateMotionSpec(value, s, path).length))
            e.push(`${path}: matches none of the allowed forms`);
        return e;
    }
    if ('const' in schema && value !== schema.const)
        return [`${path}: must be ${JSON.stringify(schema.const)}`];
    if (schema.enum && !schema.enum.includes(value))
        return [`${path}: must be one of ${schema.enum.map((x) => JSON.stringify(x)).join(', ')}`];
    if (schema.type && !typeOk(schema.type, value))
        return [`${path}: must be ${schema.type}`];
    if (typeof value === 'number') {
        if (schema.minimum != null && value < schema.minimum)
            e.push(`${path}: must be ≥ ${schema.minimum}`);
        if (schema.maximum != null && value > schema.maximum)
            e.push(`${path}: must be ≤ ${schema.maximum}`);
    }
    if (typeof value === 'string') {
        if (schema.maxLength != null && value.length > schema.maxLength)
            e.push(`${path}: longer than ${schema.maxLength}`);
        if (schema.pattern && !new RegExp(schema.pattern).test(value))
            e.push(`${path}: does not match ${schema.pattern}`);
    }
    if (Array.isArray(value)) {
        if (schema.maxItems != null && value.length > schema.maxItems)
            e.push(`${path}: more than ${schema.maxItems} items`);
        if (schema.items)
            value.forEach((v, i) => e.push(...validateMotionSpec(v, schema.items, `${path}[${i}]`)));
    }
    if (schema.type === 'object' && value && typeof value === 'object') {
        const o = value;
        for (const k of schema.required || [])
            if (!(k in o))
                e.push(`${path}.${k}: required`);
        for (const [k, v] of Object.entries(o)) {
            const s = schema.properties?.[k];
            if (!s) {
                if (schema.additionalProperties === false)
                    e.push(`${path}.${k}: not allowed`);
            }
            else
                e.push(...validateMotionSpec(v, s, `${path}.${k}`));
        }
    }
    return e;
}
/** The decisions of an intent, in MotionSpec form (what a provider is asked to improve). */
function specOf(i) {
    return { effect: i.effect, also: i.also, direction: i.direction, amount: i.amount, duration: i.duration, delay: i.delay, easing: i.easingName || i.easing, trigger: i.trigger, iterations: i.iterations === Infinity ? 'infinite' : i.iterations, alternate: i.alternate, stagger: i.stagger };
}
/** Build a full intent (keyframes, WAAPI options, CSS, components) from a validated spec; unset fields come from `base`. */
function intentFromSpec(text, spec, base = describeMotion(text)) {
    const effect = spec.effect;
    const also = (spec.also || []).filter((x) => x !== effect);
    const direction = spec.direction !== undefined ? spec.direction : effect === base.effect ? base.direction : effect === 'slide' ? 'up' : null;
    const amount = spec.amount ?? (effect === base.effect ? base.amount : parseAmount('', effect));
    const trigger = spec.trigger || base.trigger;
    const easingName = spec.easing ? (EASING_BY_NAME[spec.easing] ? spec.easing : '') : base.easingName;
    const easing = spec.easing ? EASING_BY_NAME[spec.easing] || spec.easing : base.easing;
    const iterations = spec.iterations === 'infinite' ? Infinity : spec.iterations ?? base.iterations;
    const alternate = spec.alternate ?? base.alternate;
    const duration = spec.duration ?? base.duration;
    const delay = spec.delay ?? base.delay;
    const stagger = spec.stagger ?? base.stagger;
    const kf = keyframesFor({ effect, also, direction, amount });
    const options = { duration, delay, easing, fill: 'both', iterations, ...(alternate ? { direction: 'alternate' } : {}) };
    const comps = [];
    for (const key of [effect, trigger])
        for (const [tag, why, snippet] of COMPONENTS[key] || [])
            if (!comps.some((c) => c.tag === tag))
                comps.push({ tag, why, snippet });
    if (stagger)
        comps.push({ tag: 'usa-stagger', why: 'staggers its children', snippet: `<usa-stagger delay="${stagger}"><div>…</div><div>…</div></usa-stagger>` });
    return { text: String(text || '').trim(), effect, also, direction, amount, duration, delay, easing, easingName, trigger, iterations, alternate, stagger, reducedMotion: 'respect', keyframes: kf, options, css: cssFor(kf, options, trigger, stagger), components: comps, confidence: 1, matched: ['provider'] };
}
const MOTION_SYSTEM_PROMPT = 'You turn a short description of a UI animation into a JSON object that matches the given JSON Schema. Answer with the JSON object only. Durations, delays and stagger are milliseconds; amount is px for slides, a scale factor for zooms and degrees for rotations / flips.';
/**
 * Suggest a motion for a description. Without `provider`: the local deterministic parser (no network).
 * With `provider`: asks it for a MotionSpec, validates the answer against MOTION_SPEC_SCHEMA and falls back to the
 * local result on any error, timeout (default 8 s) or abort.
 */
async function suggestMotion(text, options = {}) {
    const local = describeMotion(text);
    const p = options.provider;
    if (!p)
        return { intent: local, source: 'local', errors: [] };
    const name = typeof p === 'function' ? p.name || 'provider' : p.name || 'provider';
    const fail = (errors) => ({ intent: local, source: 'fallback', provider: name, errors });
    try {
        const req = { prompt: local.text, system: MOTION_SYSTEM_PROMPT, schema: MOTION_SPEC_SCHEMA, local: specOf(local), signal: options.signal };
        const call = Promise.resolve(typeof p === 'function' ? p(req) : p.complete(req));
        let timer;
        const ms = options.timeout ?? 8000;
        const timeout = new Promise((_, rej) => (timer = setTimeout(() => rej(new Error(`timed out after ${ms} ms`)), ms)));
        let raw;
        try {
            raw = await Promise.race([call, timeout]);
        }
        finally {
            clearTimeout(timer);
        }
        if (options.signal?.aborted)
            return fail(['aborted']);
        let value = raw;
        if (typeof raw === 'string') {
            const m = /\{[\s\S]*\}/.exec(raw.replace(/```(?:json)?/g, ''));
            try {
                value = JSON.parse(m ? m[0] : raw);
            }
            catch {
                return fail(['provider answer is not JSON']);
            }
        }
        const errors = validateMotionSpec(value);
        if (errors.length)
            return fail(errors);
        return { intent: intentFromSpec(local.text, value, local), source: 'provider', provider: name, errors: [] };
    }
    catch (err) {
        return fail([`provider error: ${err?.message || String(err)}`]);
    }
}

exports.MOTION_EFFECTS = MOTION_EFFECTS;
exports.MOTION_SPEC_SCHEMA = MOTION_SPEC_SCHEMA;
exports.MOTION_SYSTEM_PROMPT = MOTION_SYSTEM_PROMPT;
exports.MOTION_TRIGGERS = MOTION_TRIGGERS;
exports.describeMotion = describeMotion;
exports.intentFromSpec = intentFromSpec;
exports.motionSnippet = motionSnippet;
exports.specOf = specOf;
exports.suggestMotion = suggestMotion;
exports.validateMotionSpec = validateMotionSpec;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.1.0/dist/components/ai.cjs.map