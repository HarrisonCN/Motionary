'use strict';

var components_fx = require('./fx.cjs');
require('../chunks/base-B5i8qQPR.cjs');
require('../chunks/core-BDcszY4L.cjs');
require('./tokens.cjs');
require('../chunks/fx-B8hk1Fby.cjs');

let layer = null;
/** A fixed, pointer-transparent, aria-hidden layer for transient particles. */
function fxLayer() {
    if (layer?.isConnected)
        return layer;
    layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('data-usa-fx-layer', '');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2147483000;contain:strict';
    document.body.appendChild(layer);
    return layer;
}
/** Client point of the triggering pointer event, or the element's center. */
function origin(el, ctx) {
    const e = ctx.event;
    const r = el.getBoundingClientRect();
    return e && typeof e.clientX === 'number' && (e.clientX || e.clientY) ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
/** Spawn an absolutely positioned node in the fx layer at (x, y); removed when its animation ends. */
function spawn(x, y, css, ctx, frames, opts, text = '') {
    const n = document.createElement('span');
    n.style.cssText = `position:absolute;left:${x}px;top:${y}px;${css}`;
    if (text)
        n.textContent = text;
    fxLayer().appendChild(n);
    const a = ctx.animate(n, frames, { fill: 'forwards', ...opts });
    const rm = () => n.remove();
    if (a)
        a.finished.then(rm, rm);
    else
        rm();
    return a;
}
/** An overlay child covering `el` (makes `el` a positioning context). Returns it and a remover. */
function overlay(el, css) {
    const o = document.createElement('span');
    o.setAttribute('aria-hidden', 'true');
    o.style.cssText = `position:absolute;inset:0;pointer-events:none;border-radius:inherit;${css}`;
    if (getComputedStyle(el).position === 'static')
        el.style.position = 'relative';
    el.appendChild(o);
    return [o, () => o.remove()];
}
const PALETTE = ['#7c5cff', '#ff5c8a', '#22d3ee', '#facc15', '#34d399'];
const rand = (a, b) => a + Math.random() * (b - a);
/** Wait for all animations (ignoring nulls). */
const all = (anims) => Promise.all(anims.filter(Boolean).map((a) => a.finished.catch(() => undefined)));

const CARD_FX = [
    {
        name: 'holo',
        kind: 'card',
        description: 'Holographic foil: a rainbow sheen and sparkle that follow the pointer (persistent; bind with trigger="load").',
        reduced: 'run',
        defaults: { strength: 0.55 },
        run: (el, o, ctx) => {
            const [layer, remove] = overlay(el, `mix-blend-mode:color-dodge;opacity:${o.strength};background:linear-gradient(115deg,transparent 20%,#ff8bd855 35%,#8bf3ff55 45%,#fff58b55 55%,transparent 70%),repeating-linear-gradient(55deg,#ffffff10 0 2px,transparent 2px 6px);background-size:250% 250%,100% 100%;background-position:50% 50%;transition:background-position .2s ease-out`);
            if (ctx.reduced)
                return remove;
            const move = (e) => {
                const r = el.getBoundingClientRect();
                const x = ((e.clientX - r.left) / (r.width || 1)) * 100;
                const y = ((e.clientY - r.top) / (r.height || 1)) * 100;
                layer.style.backgroundPosition = `${x}% ${y}%, 0 0`;
                el.style.transform = `perspective(700px) rotateY(${(x - 50) / 8}deg) rotateX(${(50 - y) / 8}deg)`;
            };
            const leave = () => {
                layer.style.backgroundPosition = '50% 50%, 0 0';
                el.style.transform = '';
            };
            el.addEventListener('pointermove', move);
            el.addEventListener('pointerleave', leave);
            return () => {
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerleave', leave);
                leave();
                remove();
            };
        },
    },
    {
        name: 'glare-sweep',
        kind: 'card',
        description: 'A diagonal light streak sweeps across the card once.',
        defaults: { duration: 900, color: 'rgba(255,255,255,.55)' },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const [g, remove] = overlay(el, `overflow:hidden;background:linear-gradient(105deg,transparent 35%,${o.color} 50%,transparent 65%);background-size:250% 100%`);
            const a = ctx.animate(g, [{ backgroundPosition: '150% 0' }, { backgroundPosition: '-50% 0' }], { duration: o.duration, easing: 'ease-in-out' });
            if (a)
                a.finished.then(remove, remove);
            else
                remove();
            return a;
        },
    },
    {
        name: 'book-open',
        kind: 'card',
        description: 'The card opens like a book cover around its left edge, peeks and closes.',
        defaults: { angle: 35, duration: 1100 },
        run: (el, o, ctx) => {
            el.style.transformOrigin = 'left center';
            return ctx.animate(el, [{ transform: 'perspective(900px) rotateY(0)' }, { transform: `perspective(900px) rotateY(-${o.angle}deg)`, offset: 0.45 }, { transform: 'perspective(900px) rotateY(0)' }], { duration: o.duration, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)' });
        },
    },
    {
        name: 'card-fan',
        kind: 'card',
        description: 'The element’s children fan out like a hand of cards, then gather.',
        defaults: { spread: 14, duration: 900 },
        run: (el, o, ctx) => {
            const kids = Array.from(el.children);
            const mid = (kids.length - 1) / 2;
            return all(kids.map((k, i) => ctx.animate(k, [{ transform: 'none' }, { transform: `translateX(${(i - mid) * o.spread}px) rotate(${(i - mid) * (o.spread / 2)}deg)`, offset: 0.5 }, { transform: 'none' }], { duration: o.duration, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' })));
        },
    },
    {
        name: 'topple',
        kind: 'card',
        description: 'Tips backwards on its bottom edge and springs upright.',
        defaults: { duration: 1000 },
        run: (el, o, ctx) => {
            el.style.transformOrigin = 'bottom center';
            return ctx.animate(el, [{ transform: 'perspective(800px) rotateX(0)' }, { transform: 'perspective(800px) rotateX(55deg)', offset: 0.35 }, { transform: 'perspective(800px) rotateX(-12deg)', offset: 0.6 }, { transform: 'perspective(800px) rotateX(5deg)', offset: 0.8 }, { transform: 'perspective(800px) rotateX(0)' }], { duration: o.duration, easing: 'ease-out' });
        },
    },
    {
        name: 'float-tilt',
        kind: 'loop',
        description: 'Idle floating with a slow 3D sway (loop; stops under reduced motion).',
        defaults: { duration: 4200, distance: 8 },
        run: (el, o, ctx) => {
            const a = ctx.animate(el, [{ transform: 'translateY(0) rotateX(0) rotateY(0)' }, { transform: `translateY(-${o.distance}px) rotateX(4deg) rotateY(-5deg)` }, { transform: 'translateY(0) rotateX(0) rotateY(0)' }], { duration: o.duration, iterations: Infinity, easing: 'ease-in-out' });
            return () => a?.cancel();
        },
    },
];
const CLICK_FX = [
    {
        name: 'shockwave',
        kind: 'click',
        description: 'Two expanding rings from the click point.',
        defaults: { color: '#7c5cff', size: 160, duration: 700 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const { x, y } = origin(el, ctx);
            return all([0, 120].map((delay) => spawn(x, y, `width:${o.size}px;height:${o.size}px;margin:${-o.size / 2}px 0 0 ${-o.size / 2}px;border:3px solid ${o.color};border-radius:50%`, ctx, [{ transform: 'scale(0)', opacity: 0.9 }, { transform: 'scale(1)', opacity: 0 }], { duration: o.duration, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })));
        },
    },
    {
        name: 'ink-splash',
        kind: 'click',
        description: 'Ink blobs splatter from the click point and fade.',
        defaults: { count: 9, colors: PALETTE, duration: 800 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const { x, y } = origin(el, ctx);
            return all(Array.from({ length: o.count }, (_, i) => {
                const s = rand(6, 22);
                const ang = rand(0, Math.PI * 2);
                const d = rand(20, 70);
                return spawn(x, y, `width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;background:${o.colors[i % o.colors.length]};border-radius:${rand(40, 50)}% ${rand(50, 60)}% ${rand(40, 60)}% ${rand(45, 55)}%`, ctx, [{ transform: 'translate(0,0) scale(.3)', opacity: 1 }, { transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d}px) scale(1)`, opacity: 0.9, offset: 0.5 }, { transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d + 8}px) scale(1.1)`, opacity: 0 }], { duration: o.duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
            }));
        },
    },
    {
        name: 'star-burst',
        kind: 'click',
        description: 'Spinning stars burst outward.',
        defaults: { count: 10, colors: ['#facc15', '#fb923c', '#f472b6'], duration: 900 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const { x, y } = origin(el, ctx);
            return all(Array.from({ length: o.count }, (_, i) => {
                const ang = (i / o.count) * Math.PI * 2;
                const d = rand(40, 80);
                const s = rand(12, 22);
                return spawn(x, y, `font-size:${s}px;line-height:1;margin:${-s / 2}px 0 0 ${-s / 2}px;color:${o.colors[i % o.colors.length]}`, ctx, [{ transform: 'translate(0,0) rotate(0) scale(.2)', opacity: 1 }, { transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d}px) rotate(${rand(180, 360)}deg) scale(1)`, opacity: 0 }], { duration: o.duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }, '★');
            }));
        },
    },
    {
        name: 'jelly-press',
        kind: 'click',
        description: 'The pressed element squishes like jelly and wobbles back.',
        defaults: { duration: 650 },
        run: (el, o, ctx) => ctx.reduced ? ctx.animate(el, [{ opacity: 1 }, { opacity: 0.7 }, { opacity: 1 }], { duration: 250 }) : ctx.animate(el, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.15,.85)', offset: 0.2 }, { transform: 'scale(.9,1.1)', offset: 0.4 }, { transform: 'scale(1.05,.95)', offset: 0.6 }, { transform: 'scale(.98,1.02)', offset: 0.8 }, { transform: 'scale(1,1)' }], { duration: o.duration, easing: 'ease-out' }),
    },
    {
        name: 'ring-ripple',
        kind: 'click',
        description: 'Concentric outlined rings ripple out like water.',
        defaults: { rings: 3, color: '#22d3ee', size: 120, duration: 1000 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const { x, y } = origin(el, ctx);
            return all(Array.from({ length: o.rings }, (_, i) => spawn(x, y, `width:${o.size}px;height:${o.size}px;margin:${-o.size / 2}px 0 0 ${-o.size / 2}px;border:2px solid ${o.color};border-radius:50%`, ctx, [{ transform: 'scale(.1)', opacity: 0.8 }, { transform: 'scale(1)', opacity: 0 }], { duration: o.duration, delay: i * 160, easing: 'ease-out' })));
        },
    },
    {
        name: 'emoji-rain',
        kind: 'click',
        description: 'Emoji pop up and fall around the click (pass `emoji: "🎉✨💜"`).',
        defaults: { emoji: '🎉✨💜🔥', count: 14, duration: 1300 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const { x, y } = origin(el, ctx);
            const chars = Array.from(String(o.emoji));
            return all(Array.from({ length: o.count }, (_, i) => {
                const dx = rand(-90, 90);
                return spawn(x, y, `font-size:${rand(16, 28)}px;line-height:1`, ctx, [{ transform: 'translate(0,0) scale(.4)', opacity: 0 }, { transform: `translate(${dx * 0.6}px,${rand(-90, -50)}px) scale(1)`, opacity: 1, offset: 0.35 }, { transform: `translate(${dx}px,${rand(40, 90)}px) rotate(${rand(-60, 60)}deg) scale(.9)`, opacity: 0 }], { duration: o.duration, delay: i * 25, easing: 'cubic-bezier(0.33, 0, 0.67, 1)' }, chars[i % chars.length]);
            }));
        },
    },
];

/**
 * Sample a damped spring from 0 → 1 and return the progress values plus the
 * time (ms) it takes to settle. Pure, deterministic.
 */
function solveSpring({ stiffness = 180, damping = 12, mass = 1, steps = 40 } = {}) {
    const dt = 1 / 120;
    let x = 0;
    let v = 0;
    const trace = [];
    let t = 0;
    for (; t < 4; t += dt) {
        const a = (-stiffness * (x - 1) - damping * v) / mass;
        v += a * dt;
        x += v * dt;
        trace.push(x);
        if (t > 0.1 && Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01)
            break;
    }
    const values = Array.from({ length: steps + 1 }, (_, i) => +trace[Math.min(trace.length - 1, Math.round((i / steps) * (trace.length - 1)))].toFixed(4));
    values[0] = 0;
    values[steps] = 1;
    return { values, duration: Math.round(trace.length * dt * 1000) };
}
/** Keyframes for a property driven by a spring: `map(progress)` → keyframe. */
function springKeyframes(map, spring) {
    const { values, duration } = solveSpring(spring);
    return { frames: values.map(map), duration };
}
/** Height (0 = floor, 1 = drop height) of a ball dropped with restitution `bounce`, sampled `steps` times. */
function bounceKeyframes(bounce = 0.5, steps = 48) {
    // segment durations scale with sqrt(height); heights scale with bounce^2 per hop
    const hops = [1];
    let h = 1;
    while (hops.length < 6 && h > 0.01) {
        h *= bounce * bounce;
        hops.push(h);
    }
    const segT = hops.map((hh, i) => (i === 0 ? Math.sqrt(hh) : 2 * Math.sqrt(hh)));
    const total = segT.reduce((a, b) => a + b, 0);
    return Array.from({ length: steps + 1 }, (_, i) => {
        let t = (i / steps) * total;
        for (let k = 0; k < hops.length; k++) {
            if (t <= segT[k] || k === hops.length - 1) {
                const tt = Math.min(t, segT[k]);
                if (k === 0)
                    return +(1 - (tt / segT[0]) ** 2).toFixed(4);
                const half = segT[k] / 2;
                return +(hops[k] * (1 - ((tt - half) / half) ** 2)).toFixed(4);
            }
            t -= segT[k];
        }
        return 0;
    });
}
const fade = (el, ctx) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
const PHYSICS_FX = [
    {
        name: 'bounce-in',
        kind: 'enter',
        description: 'Springs in from small with an overshoot (spring solver; stiffness / damping options).',
        defaults: { stiffness: 220, damping: 11, from: 0.3 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            const { frames, duration } = springKeyframes((p) => ({ transform: `scale(${(o.from + (1 - o.from) * p).toFixed(4)})`, opacity: Math.min(1, p * 3) }), o);
            return ctx.animate(el, frames, { duration, easing: 'linear' });
        },
    },
    {
        name: 'rubber-band',
        kind: 'attention',
        description: 'Stretches wide, snaps back thin and settles like a rubber band.',
        defaults: { duration: 900, amount: 0.25 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const a = o.amount;
            return ctx.animate(el, [{ transform: 'scale(1,1)' }, { transform: `scale(${1 + a},${1 - a})`, offset: 0.3 }, { transform: `scale(${1 - a},${1 + a})`, offset: 0.4 }, { transform: `scale(${1 + a / 2},${1 - a / 2})`, offset: 0.5 }, { transform: `scale(${1 - a / 5},${1 + a / 5})`, offset: 0.65 }, { transform: `scale(${1 + a / 10},${1 - a / 10})`, offset: 0.75 }, { transform: 'scale(1,1)' }], { duration: o.duration });
        },
    },
    {
        name: 'elastic-hover',
        kind: 'hover',
        description: 'Hover lifts with a springy overshoot; leaving springs back (persistent; trigger="load").',
        defaults: { lift: 6, scale: 1.04, stiffness: 260, damping: 10 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const to = (on) => {
                const from = on ? 0 : 1;
                const { frames, duration } = springKeyframes((p) => {
                    const k = from + (on ? p : -p);
                    return { transform: `translateY(${(-o.lift * k).toFixed(2)}px) scale(${(1 + (o.scale - 1) * k).toFixed(4)})` };
                }, o);
                ctx.animate(el, frames, { duration, fill: 'forwards', easing: 'linear' });
            };
            const enter = () => to(true);
            const leave = () => to(false);
            el.addEventListener('pointerenter', enter);
            el.addEventListener('pointerleave', leave);
            return () => {
                el.removeEventListener('pointerenter', enter);
                el.removeEventListener('pointerleave', leave);
            };
        },
    },
    {
        name: 'drop-bounce',
        kind: 'enter',
        description: 'Falls in under gravity and bounces to rest (`height`, `bounce` restitution 0–0.9).',
        defaults: { height: 120, bounce: 0.5, duration: 1100 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            const hs = bounceKeyframes(Math.min(0.9, Math.max(0, o.bounce)));
            return ctx.animate(el, hs.map((h, i) => ({ transform: `translateY(${(-h * o.height).toFixed(1)}px)`, opacity: i === 0 ? 0 : 1 })), { duration: o.duration, easing: 'linear' });
        },
    },
    {
        name: 'gravity-text',
        kind: 'text',
        description: 'Each character drops in under gravity with a bounce, staggered (splits the text into aria-hidden spans; the label stays readable).',
        defaults: { height: 60, bounce: 0.45, duration: 900, stagger: 45 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            if (!el.dataset.usaSplit) {
                const text = el.textContent || '';
                el.setAttribute('aria-label', text);
                el.textContent = '';
                for (const ch of Array.from(text)) {
                    const s = document.createElement('span');
                    s.setAttribute('aria-hidden', 'true');
                    s.style.display = 'inline-block';
                    s.style.whiteSpace = 'pre';
                    s.textContent = ch;
                    el.appendChild(s);
                }
                el.dataset.usaSplit = '1';
            }
            const hs = bounceKeyframes(o.bounce, 32);
            return all(Array.from(el.children).map((s, i) => ctx.animate(s, hs.map((h) => ({ transform: `translateY(${(-h * o.height).toFixed(1)}px)` })), { duration: o.duration, delay: i * o.stagger, easing: 'linear', fill: 'backwards' })));
        },
    },
    {
        name: 'spring-follow',
        kind: 'cursor',
        description: 'The element springs toward the pointer while it moves over its parent, and back home on leave (persistent).',
        defaults: { stiffness: 0.12, damping: 0.75, range: 40 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const host = el.parentElement || el;
            let tx = 0;
            let ty = 0;
            let x = 0;
            let y = 0;
            let vx = 0;
            let vy = 0;
            let raf = 0;
            const tick = () => {
                vx = (vx + (tx - x) * o.stiffness) * o.damping;
                vy = (vy + (ty - y) * o.stiffness) * o.damping;
                x += vx;
                y += vy;
                el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
                raf = Math.abs(vx) + Math.abs(vy) + Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(tick) : 0;
            };
            const kick = () => {
                if (!raf)
                    raf = requestAnimationFrame(tick);
            };
            const move = (e) => {
                const r = host.getBoundingClientRect();
                const nx = (e.clientX - r.left) / (r.width || 1) - 0.5;
                const ny = (e.clientY - r.top) / (r.height || 1) - 0.5;
                tx = nx * 2 * o.range;
                ty = ny * 2 * o.range;
                kick();
            };
            const leave = () => {
                tx = ty = 0;
                kick();
            };
            host.addEventListener('pointermove', move);
            host.addEventListener('pointerleave', leave);
            return () => {
                host.removeEventListener('pointermove', move);
                host.removeEventListener('pointerleave', leave);
                cancelAnimationFrame(raf);
                el.style.translate = '';
            };
        },
    },
    {
        name: 'bell-swing',
        kind: 'attention',
        description: 'Swings from its top like a ringing bell with damped oscillation.',
        defaults: { angle: 22, stiffness: 120, damping: 4 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            el.style.transformOrigin = 'top center';
            const { frames, duration } = springKeyframes((p) => ({ transform: `rotate(${(o.angle * (1 - p)).toFixed(2)}deg)` }), { stiffness: o.stiffness, damping: o.damping, steps: 48 });
            frames[0] = { transform: 'rotate(0deg)' };
            return ctx.animate(el, frames, { duration: Math.min(duration, 2400), easing: 'linear' });
        },
    },
];

/**
 * use-scroll-animate/components/effects — the 5.x effect packs, all
 * registered through `registerEffect()` (5.0) and playable with
 * `playEffect()`, `bindEffect()` or `<usa-fx>`. Kept out of
 * `use-scroll-animate/components` / `components/lite` so their size budgets
 * hold; the UMD bundle registers everything.
 *
 * ```ts
 * import { registerAllEffects } from 'use-scroll-animate/components/effects';
 * registerAllEffects();
 * ```
 */
/** The effect packs by version, in release order. */
const EFFECT_PACKS = {
    'cards-click': [...CARD_FX, ...CLICK_FX],
    physics: PHYSICS_FX,
};
/** 5.1: card & click effects 2.0. */
function registerCardClickEffects() {
    components_fx.registerEffects(EFFECT_PACKS['cards-click']);
}
/** 5.2: bounce & physics micro-interactions. */
function registerPhysicsEffects() {
    components_fx.registerEffects(EFFECT_PACKS.physics);
}
/** Register the built-ins and every pack (idempotent). */
function registerAllEffects() {
    components_fx.registerBuiltinEffects();
    for (const defs of Object.values(EFFECT_PACKS))
        components_fx.registerEffects(defs);
}

exports.CARD_FX = CARD_FX;
exports.CLICK_FX = CLICK_FX;
exports.EFFECT_PACKS = EFFECT_PACKS;
exports.PHYSICS_FX = PHYSICS_FX;
exports.bounceKeyframes = bounceKeyframes;
exports.fxLayer = fxLayer;
exports.registerAllEffects = registerAllEffects;
exports.registerCardClickEffects = registerCardClickEffects;
exports.registerPhysicsEffects = registerPhysicsEffects;
exports.solveSpring = solveSpring;
exports.springKeyframes = springKeyframes;
//# sourceMappingURL=effects.cjs.map
