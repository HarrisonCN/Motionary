import { registerBuiltinEffects } from './fx.js';
import { P as PALETTE, o as overlay, a as all, b as origin, s as spawn, r as rand, f as fxLayer } from '../chunks/shared-CkKHWrtJ.js';
import { d as defineStory, a as definePlayer } from '../chunks/player-BfHMNtiM.js';
export { A as ANIMATION_FORMAT, S as STORY_TEMPLATES, c as createPlayer, f as formatCount, n as normalizeAnimation, s as storyProgress } from '../chunks/player-BfHMNtiM.js';
import { c as canvasBackground, h as hexRgb, G as GENERATIVE_FX } from '../chunks/generative-2LhxG5BJ.js';
export { n as noise2 } from '../chunks/generative-2LhxG5BJ.js';
import { A as AUDIO_FX, d as defineAudio } from '../chunks/audio-CWt1xdZB.js';
export { b as bindBeat, c as createBeatDetector, a as disableAudio, e as enableAudio, g as getAudio, o as onBeat } from '../chunks/audio-CWt1xdZB.js';
import { playEffect, bindEffect, registerEffects } from '../chunks/registry-BKzyg1JV.js';
import { f as defineElement, C as adoptStyles } from '../chunks/base-BTev8qxg.js';
import { applyMotionTokens, motionTokensToVars, mergeMotionTokens } from './tokens.js';
import '../chunks/builtins-CPmS6aDB.js';
import '../chunks/core-BviA7nFa.js';
import '../chunks/fx-CgWKqVsn.js';

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

/** A full-viewport, aria-hidden, pointer-blocking (while covering) transition layer. */
function screen(css = '') {
    const s = document.createElement('div');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('data-usa-page-fx', '');
    s.style.cssText = `position:fixed;inset:0;z-index:2147483001;pointer-events:auto;${css}`;
    document.body.appendChild(s);
    return s;
}
const wait = (a) => (a ? a.finished.catch(() => undefined) : Promise.resolve());
const call = async (fn) => {
    if (typeof fn === 'function')
        await fn();
};
/** Reduced-motion version of every transition: a quick cross-fade through the cover colour. */
async function crossFade(o, ctx) {
    const s = screen(`background:${o.color};opacity:0`);
    await wait(ctx.animate(s, [{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: 'forwards' }));
    await call(o.onCovered);
    await wait(ctx.animate(s, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }));
    s.remove();
}
/** Build a transition from a cover layer and cover / reveal animations of its parts. */
function transition(build) {
    return async (el, o, ctx) => {
        if (ctx.reduced)
            return crossFade(o, ctx);
        const s = screen('pointer-events:auto');
        const { parts, cover, delay } = build(s, o, ctx, el);
        const frames = (i) => (typeof cover === 'function' ? cover(i) : cover);
        const half = o.duration / 2;
        await Promise.all(parts.map((p, i) => wait(ctx.animate(p, frames(i), { duration: half, delay: delay?.(i) ?? 0, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' }))));
        await call(o.onCovered);
        if (o.hold)
            await new Promise((r) => setTimeout(r, o.hold));
        await Promise.all(parts.map((p, i) => wait(ctx.animate(p, [...frames(i)].reverse(), { duration: half, delay: delay?.(i) ?? 0, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' }))));
        s.remove();
    };
}
const part = (s, css) => {
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;${css}`;
    s.appendChild(p);
    return p;
};
const TRANSITION_DEFAULTS = { color: '#0f0f1a', duration: 1000, hold: 0, onCovered: undefined };
const PAGE_FX = [
    {
        name: 'curtain',
        kind: 'page',
        description: 'Two curtain panels close from the sides, call onCovered(), then open.',
        reduced: 'run',
        defaults: TRANSITION_DEFAULTS,
        run: transition((s, o) => ({
            parts: [part(s, `top:0;bottom:0;left:0;width:50.5%;background:${o.color}`), part(s, `top:0;bottom:0;right:0;width:50.5%;background:${o.color}`)],
            cover: (i) => [{ transform: `translateX(${i ? 100 : -100}%)` }, { transform: 'translateX(0)' }],
        })),
    },
    {
        name: 'iris',
        kind: 'page',
        description: 'A circle closes on the click point (or the element’s center), calls onCovered(), then opens.',
        reduced: 'run',
        defaults: TRANSITION_DEFAULTS,
        run: transition((s, o, ctx, el) => {
            const { x, y } = origin(el, ctx);
            const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 2;
            // a huge box-shadow ring around a hole: the hole shrinks to 0 to cover
            const p = part(s, `left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;box-shadow:0 0 0 ${Math.ceil(r)}px ${o.color}`);
            s.style.background = 'transparent';
            return { parts: [p], cover: [{ width: `${r * 2}px`, height: `${r * 2}px`, margin: `${-r}px 0 0 ${-r}px` }, { width: '0px', height: '0px', margin: '0px 0 0 0px' }] };
        }),
    },
    {
        name: 'pixel-dissolve',
        kind: 'page',
        description: 'The screen fills with pixels in random order, calls onCovered(), then dissolves (`cols` × `rows`).',
        reduced: 'run',
        defaults: { ...TRANSITION_DEFAULTS, cols: 16, rows: 10 },
        run: transition((s, o) => {
            const n = o.cols * o.rows;
            const order = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
            const parts = Array.from({ length: n }, (_, i) => part(s, `left:${((i % o.cols) * 100) / o.cols}%;top:${(Math.floor(i / o.cols) * 100) / o.rows}%;width:${100 / o.cols + 0.2}%;height:${100 / o.rows + 0.2}%;background:${o.color};opacity:0`));
            return { parts, cover: [{ opacity: 0 }, { opacity: 1 }], delay: (i) => (order[i] / n) * (o.duration / 2) * 0.6 };
        }),
    },
    {
        name: 'blinds',
        kind: 'page',
        description: 'Horizontal slats rotate shut like venetian blinds, call onCovered(), then open (`slats`).',
        reduced: 'run',
        defaults: { ...TRANSITION_DEFAULTS, slats: 8 },
        run: transition((s, o) => ({
            parts: Array.from({ length: o.slats }, (_, i) => part(s, `left:0;right:0;top:${(i * 100) / o.slats}%;height:${100 / o.slats + 0.3}%;background:${o.color};transform-origin:top`)),
            cover: [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
            delay: (i) => i * 30,
        })),
    },
    {
        name: 'velocity-skew',
        kind: 'scroll',
        description: 'Skews the element with scroll velocity and eases back when scrolling stops (persistent).',
        defaults: { max: 8, factor: 0.25 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            let last = scrollY;
            let skew = 0;
            let raf = 0;
            const tick = () => {
                const y = scrollY;
                const target = Math.max(-o.max, Math.min(o.max, (y - last) * o.factor));
                last = y;
                skew += (target - skew) * 0.2;
                el.style.transform = `skewY(${skew.toFixed(3)}deg)`;
                raf = Math.abs(skew) > 0.01 || Math.abs(target) > 0.01 ? requestAnimationFrame(tick) : 0;
                if (!raf)
                    el.style.transform = '';
            };
            const onScroll = () => {
                if (!raf)
                    raf = requestAnimationFrame(tick);
            };
            addEventListener('scroll', onScroll, { passive: true });
            return () => {
                removeEventListener('scroll', onScroll);
                cancelAnimationFrame(raf);
                el.style.transform = '';
            };
        },
    },
    {
        name: 'spotlight',
        kind: 'cursor',
        description: 'Dims the page except a soft circle that follows the pointer (persistent; `radius`, `dim`).',
        defaults: { radius: 180, dim: 0.72 },
        run: (_el, o, ctx) => {
            if (ctx.reduced)
                return;
            const s = screen(`pointer-events:none;background:radial-gradient(circle ${o.radius}px at var(--x,50%) var(--y,50%),transparent 0,transparent 60%,rgba(0,0,0,${o.dim}) 100%)`);
            const move = (e) => {
                s.style.setProperty('--x', `${e.clientX}px`);
                s.style.setProperty('--y', `${e.clientY}px`);
            };
            addEventListener('pointermove', move, { passive: true });
            return () => {
                removeEventListener('pointermove', move);
                s.remove();
            };
        },
    },
    {
        name: 'edge-glow',
        kind: 'scroll',
        description: 'A soft glow lights the top / bottom edge of the viewport while scrolling in that direction (persistent).',
        defaults: { color: '#7c5cff', size: 90 },
        run: (_el, o, ctx) => {
            if (ctx.reduced)
                return;
            const s = screen('pointer-events:none;opacity:0;transition:opacity .35s ease-out');
            let last = scrollY;
            let t = 0;
            const onScroll = () => {
                const down = scrollY >= last;
                last = scrollY;
                s.style.background = `linear-gradient(${down ? 'to top' : 'to bottom'},${o.color}55,transparent ${o.size}px)`;
                s.style.opacity = '1';
                clearTimeout(t);
                t = setTimeout(() => (s.style.opacity = '0'), 160);
            };
            addEventListener('scroll', onScroll, { passive: true });
            return () => {
                removeEventListener('scroll', onScroll);
                clearTimeout(t);
                s.remove();
            };
        },
    },
];

const touchOk = (e, o) => o.touch || e.pointerType !== 'touch';
/** A fixed, viewport-sized canvas in the fx layer, redrawn while `draw` returns true. */
function overlayCanvas(draw) {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    fxLayer().appendChild(c);
    const g = c.getContext('2d');
    let raf = 0;
    const frame = (now) => {
        raf = 0;
        if (!g)
            return;
        const w = innerWidth;
        const h = innerHeight;
        const dpr = Math.min(2, devicePixelRatio || 1);
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
            c.width = Math.round(w * dpr);
            c.height = Math.round(h * dpr);
        }
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);
        if (draw(g, w, h, now))
            raf = requestAnimationFrame(frame);
    };
    return {
        kick: () => {
            if (!raf && g)
                raf = requestAnimationFrame(frame);
        },
        stop: () => {
            cancelAnimationFrame(raf);
            raf = 0;
            c.remove();
        },
    };
}
/** Pointer trail on `el`: keeps the last `life` ms of points and redraws them. */
function trail(el, o, paint) {
    const pts = [];
    const oc = overlayCanvas((g, _w, _h, now) => {
        while (pts.length && now - pts[0].t > o.life)
            pts.shift();
        if (pts.length > 1)
            paint(g, pts, now);
        return pts.length > 0;
    });
    const move = (e) => {
        if (!touchOk(e, o))
            return;
        pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (pts.length > 64)
            pts.shift();
        oc.kick();
    };
    el.addEventListener('pointermove', move, { passive: true });
    return () => {
        el.removeEventListener('pointermove', move);
        oc.stop();
    };
}
const CURSOR_FX = [
    {
        name: 'comet-trail',
        kind: 'cursor',
        description: 'A glowing comet tail follows the pointer over the element (persistent; `color`, `width`, `life`).',
        defaults: { color: '#7c5cff', width: 10, life: 320, touch: false },
        run: (el, o) => trail(el, o, (g, pts, now) => {
            const [r, gg, b] = hexRgb(o.color);
            g.lineCap = 'round';
            for (let i = 1; i < pts.length; i++) {
                const k = 1 - (now - pts[i].t) / o.life;
                g.strokeStyle = `rgba(${r},${gg},${b},${(k * 0.9).toFixed(3)})`;
                g.lineWidth = Math.max(0.5, o.width * k);
                g.beginPath();
                g.moveTo(pts[i - 1].x, pts[i - 1].y);
                g.lineTo(pts[i].x, pts[i].y);
                g.stroke();
            }
        }),
    },
    {
        name: 'ribbon-trail',
        kind: 'cursor',
        description: 'A smooth rainbow ribbon flows behind the pointer (persistent; `width`, `life`).',
        defaults: { width: 18, life: 600, touch: false },
        run: (el, o) => trail(el, o, (g, pts, now) => {
            for (let i = 2; i < pts.length; i++) {
                const k = 1 - (now - pts[i].t) / o.life;
                const a = pts[i - 2];
                const m = pts[i - 1];
                const b = pts[i];
                g.strokeStyle = `hsla(${(pts[i].t / 6) % 360},90%,62%,${(k * 0.85).toFixed(3)})`;
                g.lineWidth = Math.max(0.5, o.width * k * Math.sin(Math.PI * Math.min(1, (i / pts.length) * 1.1)));
                g.lineCap = 'round';
                g.beginPath();
                g.moveTo((a.x + m.x) / 2, (a.y + m.y) / 2);
                g.quadraticCurveTo(m.x, m.y, (m.x + b.x) / 2, (m.y + b.y) / 2);
                g.stroke();
            }
        }),
    },
    {
        name: 'sparkle-trail',
        kind: 'cursor',
        description: 'Little stars twinkle off the pointer as it moves (persistent; `colors`, `spacing` px between stars).',
        defaults: { colors: PALETTE, spacing: 14, size: 14, touch: false },
        run: (el, o, ctx) => {
            let lx = -1e4;
            let ly = -1e4;
            const move = (e) => {
                if (!touchOk(e, o) || Math.hypot(e.clientX - lx, e.clientY - ly) < o.spacing)
                    return;
                lx = e.clientX;
                ly = e.clientY;
                const s = o.size * rand(0.6, 1.2);
                spawn(e.clientX - s / 2, e.clientY - s / 2, `font-size:${s}px;line-height:1;color:${o.colors[Math.floor(rand(0, o.colors.length))]}`, ctx, [{ transform: 'translate(0,0) scale(0) rotate(0deg)', opacity: 1 }, { transform: `translate(${rand(-14, 14)}px,${rand(4, 26)}px) scale(1) rotate(${rand(-90, 90)}deg)`, opacity: 0 }], { duration: rand(500, 800), easing: 'ease-out' }, '✦');
            };
            el.addEventListener('pointermove', move, { passive: true });
            return () => el.removeEventListener('pointermove', move);
        },
    },
    {
        name: 'magnetic-dots',
        kind: 'cursor',
        description: 'A grid of dots behind the content leans toward the pointer like iron filings to a magnet (persistent; `gap`, `radius`, `color`).',
        defaults: { gap: 22, radius: 120, color: '#7c5cff', background: 'transparent', touch: false },
        reduced: 'skip',
        run: (el, o, ctx) => {
            const p = { x: -1e4, y: -1e4 };
            const move = (e) => {
                if (!touchOk(e, o))
                    return;
                const r = el.getBoundingClientRect();
                p.x = e.clientX - r.left;
                p.y = e.clientY - r.top;
            };
            const leave = () => ((p.x = -1e4), (p.y = -1e4));
            el.addEventListener('pointermove', move, { passive: true });
            el.addEventListener('pointerleave', leave);
            const off = canvasBackground(el, ctx, {
                draw: ({ ctx: g, w, h }) => {
                    g.clearRect(0, 0, w, h);
                    if (o.background !== 'transparent') {
                        g.fillStyle = o.background;
                        g.fillRect(0, 0, w, h);
                    }
                    g.fillStyle = o.color;
                    for (let y = o.gap / 2; y < h; y += o.gap)
                        for (let x = o.gap / 2; x < w; x += o.gap) {
                            const dx = p.x - x;
                            const dy = p.y - y;
                            const d = Math.hypot(dx, dy);
                            const k = d < o.radius ? (1 - d / o.radius) ** 2 : 0;
                            const s = 1.5 + k * 3;
                            g.globalAlpha = 0.35 + k * 0.65;
                            g.fillRect(x + dx * k * 0.35 - s / 2, y + dy * k * 0.35 - s / 2, s, s);
                        }
                    g.globalAlpha = 1;
                },
            }, o);
            return () => {
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerleave', leave);
                off();
            };
        },
    },
    {
        name: 'spotlight-cursor',
        kind: 'cursor',
        description: 'A soft light follows the pointer across the element, easing behind it (persistent; `color`, `size`).',
        defaults: { color: '#ffffff', size: 260, ease: 0.18, touch: false },
        run: (el, o) => {
            const [r, g, b] = hexRgb(o.color);
            const s = document.createElement('span');
            s.setAttribute('aria-hidden', 'true');
            s.style.cssText = `position:absolute;inset:0;pointer-events:none;border-radius:inherit;opacity:0;transition:opacity .25s;mix-blend-mode:soft-light;background:radial-gradient(circle ${o.size / 2}px at var(--sx,50%) var(--sy,50%),rgba(${r},${g},${b},.75),transparent)`;
            const restore = el.style.position;
            if (getComputedStyle(el).position === 'static')
                el.style.position = 'relative';
            el.appendChild(s);
            let tx = 0;
            let ty = 0;
            let x = 0;
            let y = 0;
            let raf = 0;
            const tick = () => {
                x += (tx - x) * o.ease;
                y += (ty - y) * o.ease;
                s.style.setProperty('--sx', `${x.toFixed(1)}px`);
                s.style.setProperty('--sy', `${y.toFixed(1)}px`);
                raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
            };
            const move = (e) => {
                if (!touchOk(e, o))
                    return;
                const rc = el.getBoundingClientRect();
                tx = e.clientX - rc.left;
                ty = e.clientY - rc.top;
                if (s.style.opacity !== '1')
                    ((x = tx), (y = ty), (s.style.opacity = '1'));
                if (!raf)
                    raf = requestAnimationFrame(tick);
            };
            const leave = () => (s.style.opacity = '0');
            el.addEventListener('pointermove', move, { passive: true });
            el.addEventListener('pointerleave', leave);
            return () => {
                cancelAnimationFrame(raf);
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerleave', leave);
                s.remove();
                el.style.position = restore;
            };
        },
    },
];
// --- gestures → effects ------------------------------------------------------
const GESTURES = ['fling', 'twist', 'long-press'];
/** Release velocity (px/ms) from recent pointer samples: uses the last `window` ms (pure). */
function flingVelocity(pts, window = 90) {
    if (pts.length < 2)
        return { vx: 0, vy: 0, speed: 0 };
    const last = pts[pts.length - 1];
    let first = pts[0];
    for (let i = pts.length - 2; i >= 0; i--) {
        first = pts[i];
        if (last.t - pts[i].t >= window)
            break;
    }
    const dt = Math.max(1, last.t - first.t);
    const vx = (last.x - first.x) / dt;
    const vy = (last.y - first.y) / dt;
    return { vx, vy, speed: Math.hypot(vx, vy) };
}
/** Signed smallest difference between two angles in degrees, in (-180, 180] (pure). */
function angleDelta(a, b) {
    let d = (b - a) % 360;
    if (d > 180)
        d -= 360;
    if (d <= -180)
        d += 360;
    return d;
}
/**
 * Fire `effect` (a registered effect name, or a callback) when `gesture`
 * happens on `el`. Returns an unbind.
 */
function bindGesture(el, gesture, effect, o = {}) {
    const { velocity = 0.8, angle = 30, duration = 650, tolerance = 10, effectOptions = {} } = o;
    const pts = new Map();
    let path = [];
    let base = null;
    let press = null;
    const fire = (d, e) => {
        el.dispatchEvent(new CustomEvent('usa-gesture', { detail: d, bubbles: true }));
        if (typeof effect === 'function')
            effect(d, e);
        else
            playEffect(el, effect, effectOptions, e).catch(() => undefined);
    };
    const twistAngle = () => {
        const [a, b] = [...pts.values()];
        return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    };
    const charge = (k) => {
        el.style.setProperty('--usa-charge', k.toFixed(3));
        el.toggleAttribute('data-charging', k > 0 && k < 1);
    };
    const endPress = () => {
        if (!press)
            return;
        cancelAnimationFrame(press.raf);
        press = null;
        charge(0);
    };
    const down = (e) => {
        pts.set(e.pointerId ?? 1, { x: e.clientX, y: e.clientY });
        if (gesture === 'fling')
            path = [{ x: e.clientX, y: e.clientY, t: e.timeStamp || performance.now() }];
        if (gesture === 'twist' && pts.size === 2)
            base = twistAngle();
        if (gesture === 'long-press' && pts.size === 1) {
            press = { x: e.clientX, y: e.clientY, t0: performance.now(), raf: 0 };
            const step = (now) => {
                if (!press)
                    return;
                const k = Math.min(1, (now - press.t0) / duration);
                charge(k);
                if (k >= 1) {
                    endPress();
                    el.style.setProperty('--usa-charge', '1');
                    fire({ gesture, charge: 1 }, e);
                }
                else
                    press.raf = requestAnimationFrame(step);
            };
            press.raf = requestAnimationFrame(step);
        }
    };
    const move = (e) => {
        if (!pts.has(e.pointerId ?? 1))
            return;
        pts.set(e.pointerId ?? 1, { x: e.clientX, y: e.clientY });
        if (gesture === 'fling') {
            path.push({ x: e.clientX, y: e.clientY, t: e.timeStamp || performance.now() });
            if (path.length > 20)
                path.shift();
        }
        else if (gesture === 'twist' && pts.size >= 2 && base !== null) {
            const now = twistAngle();
            const d = angleDelta(base, now);
            if (Math.abs(d) >= angle) {
                base = now;
                fire({ gesture, angle: d, direction: d > 0 ? 'cw' : 'ccw' }, e);
            }
        }
        else if (gesture === 'long-press' && press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > tolerance)
            endPress();
    };
    const up = (e) => {
        pts.delete(e.pointerId ?? 1);
        if (gesture === 'fling' && path.length) {
            path.push({ x: e.clientX, y: e.clientY, t: e.timeStamp || performance.now() });
            const v = flingVelocity(path);
            path = [];
            if (v.speed >= velocity) {
                const direction = Math.abs(v.vx) > Math.abs(v.vy) ? (v.vx > 0 ? 'right' : 'left') : v.vy > 0 ? 'down' : 'up';
                fire({ gesture, ...v, direction }, e);
            }
        }
        if (pts.size < 2)
            base = null;
        endPress();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    if (gesture === 'twist' && !el.style.touchAction)
        el.style.touchAction = 'none';
    return () => {
        endPress();
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
    };
}
/**
 * `<usa-gesture-fx gesture="fling | twist | long-press" effect="tada"
 * options='{"…"}' velocity angle duration>` — plays `effect` on its first
 * child (or itself with `self`) when the gesture happens.
 */
function defineGestureFx(tag = 'usa-gesture-fx') {
    return defineElement(tag, (Base) => class UsaGestureFx extends Base {
        static get observedAttributes() {
            return ['gesture', 'effect', 'options'];
        }
        get gesture() {
            const g = this.str('gesture', 'fling');
            return GESTURES.includes(g) ? g : 'fling';
        }
        mount() {
            let effectOptions = {};
            try {
                effectOptions = JSON.parse(this.str('options', '{}')) || {};
            }
            catch {
                /* ignore bad JSON */
            }
            const target = this.flag('self') ? this : this.firstElementChild || this;
            const effect = this.str('effect', 'pulse');
            this.onCleanup(bindGesture(this, this.gesture, (_d, e) => void playEffect(target, effect, effectOptions, e).catch(() => undefined), {
                velocity: this.num('velocity', 0.8),
                angle: this.num('angle', 30),
                duration: this.num('duration', 650),
            }));
        }
    }, { id: 'usa-gesture-fx', text: 'usa-gesture-fx{display:inline-block;touch-action:none;user-select:none}' });
}

const saved = new WeakMap();
/** Toggle `aria-pressed` (or set it) and return the new state. */
function togglePressed(el, force) {
    const on = force ?? el.getAttribute('aria-pressed') !== 'true';
    el.setAttribute('aria-pressed', String(on));
    return on;
}
/** Swap `el`'s label for `ms` (polite live region), then restore it. */
function swapLabel(el, text, ms) {
    if (!saved.has(el))
        saved.set(el, el.innerHTML);
    el.setAttribute('aria-live', 'polite');
    el.textContent = text;
    return new Promise((r) => setTimeout(() => {
        el.innerHTML = saved.get(el);
        saved.delete(el);
        el.removeAttribute('aria-live');
        r();
    }, ms));
}
/** Add `delta` to the number in `[data-count]` (or `el`), keeping it in `data-count`. Returns the new value. */
function bumpCount(el, delta, ctx) {
    const t = el.querySelector('[data-count]') || el;
    const n = (Number(t.dataset.count ?? (t.textContent || '').replace(/[^\d.-]/g, '')) || 0) + delta;
    t.dataset.count = String(n);
    t.textContent = String(n);
    ctx?.animate(t, [{ transform: `translateY(${delta > 0 ? 60 : -60}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    return n;
}
const pop = (el, ctx, s = 1.25, d = 380) => ctx.animate(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})`, offset: 0.4 }, { transform: 'scale(1)' }], { duration: d, easing: 'cubic-bezier(.2,1.4,.4,1)' });
/** A few glyphs flying out of the pointer / centre. */
function burst(el, ctx, glyph, color, n = 6, rise = false) {
    const { x, y } = origin(el, ctx);
    return all(Array.from({ length: n }, (_, i) => {
        const a = rise ? -Math.PI / 2 + rand(-0.6, 0.6) : (i / n) * Math.PI * 2;
        const d = rand(28, 56);
        return spawn(x - 7, y - 7, `font-size:14px;line-height:1;color:${color}`, ctx, [{ transform: 'translate(0,0) scale(.4)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(1)`, opacity: 0 }], { duration: rand(500, 750), easing: 'cubic-bezier(.2,.8,.3,1)' }, glyph);
    }));
}
const click = (name, description, defaults, run) => ({ name, kind: 'click', description, defaults, run });
const attn = (name, description, defaults, run) => ({ name, kind: 'attention', description, defaults, run });
const MICRO_FX = [
    click('copy-success', 'Copies `text` (or `data-copy` / the target of `for`) to the clipboard and swaps the label to "Copied ✓".', { text: '', label: 'Copied ✓', ms: 1500 }, (el, o, ctx) => {
        const src = el.getAttribute('for') ? document.getElementById(el.getAttribute('for')) : null;
        const text = o.text || el.dataset.copy || src?.value || src?.textContent || '';
        navigator.clipboard?.writeText(text).catch(() => undefined);
        pop(el, ctx, 1.08);
        return swapLabel(el, o.label, o.ms);
    }),
    click('toggle-morph', 'Toggles `aria-pressed` with a squash-and-stretch morph.', {}, (el, _o, ctx) => {
        const on = togglePressed(el);
        return ctx.animate(el, [{ transform: 'scale(1,1)' }, { transform: `scale(${on ? 1.15 : 0.85},${on ? 0.85 : 1.15})`, offset: 0.35 }, { transform: 'scale(1,1)' }], { duration: 360, easing: 'ease-out' });
    }),
    click('password-reveal', 'Shows / hides the password input (`for` id, or the previous input) with an eye blink.', { show: 'Hide password', hide: 'Show password' }, (el, o, ctx) => {
        const input = (el.getAttribute('for') ? document.getElementById(el.getAttribute('for')) : el.previousElementSibling);
        if (!input || !('type' in input))
            return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        togglePressed(el, show);
        el.setAttribute('aria-label', show ? o.show : o.hide);
        return ctx.animate(el, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)', offset: 0.5 }, { transform: 'scaleY(1)' }], { duration: 240, easing: 'ease-in-out' });
    }),
    click('favorite-star', 'Toggles a favourite: the star pops and throws little stars (`color`).', { color: '#facc15' }, (el, o, ctx) => {
        const on = togglePressed(el);
        return Promise.all([pop(el, ctx, on ? 1.35 : 0.85)?.finished, on ? burst(el, ctx, '★', o.color) : null]);
    }),
    click('like-heart', 'Toggles a like: the heart beats and hearts float up (`color`).', { color: '#ff5c8a' }, (el, o, ctx) => {
        const on = togglePressed(el);
        return Promise.all([pop(el, ctx, on ? 1.3 : 0.9)?.finished, on ? burst(el, ctx, '♥', o.color, 5, true) : null]);
    }),
    click('bookmark-flip', 'Toggles a bookmark with a 3D flip.', {}, (el, _o, ctx) => {
        togglePressed(el);
        return ctx.animate(el, [{ transform: 'perspective(400px) rotateY(0)' }, { transform: 'perspective(400px) rotateY(180deg)' }, { transform: 'perspective(400px) rotateY(360deg)' }], { duration: 520, easing: 'ease-in-out' });
    }),
    click('download-progress', 'Fills a progress bar over `duration` ms, then shows "Done ✓" (`aria-busy` while running; fires `usa-done`).', { duration: 1600, label: 'Done ✓', color: '#34d399' }, (el, o, ctx) => {
        if (el.getAttribute('aria-busy') === 'true')
            return;
        el.setAttribute('aria-busy', 'true');
        const [bar, remove] = overlay(el, `background:${o.color}55;transform-origin:left;transform:scaleX(0)`);
        const a = ctx.animate(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: o.duration, easing: 'linear', fill: 'forwards' });
        const done = a ? a.finished.catch(() => undefined) : Promise.resolve();
        return done.then(() => {
            remove();
            el.removeAttribute('aria-busy');
            el.dispatchEvent(new CustomEvent('usa-done', { bubbles: true }));
            return swapLabel(el, o.label, 1400);
        });
    }),
    click('submit-loading', 'Shows "Sending…" with pulsing dots for `duration` ms, then "Sent ✓" (`aria-busy`, `usa-done`).', { duration: 1200, loading: 'Sending…', label: 'Sent ✓' }, (el, o, ctx) => {
        if (el.getAttribute('aria-busy') === 'true')
            return;
        el.setAttribute('aria-busy', 'true');
        const t = swapLabel(el, o.loading, o.duration);
        const a = ctx.animate(el, [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }], { duration: 600, iterations: Math.max(1, Math.round(o.duration / 600)) });
        return t.then(() => {
            a?.cancel();
            el.removeAttribute('aria-busy');
            el.dispatchEvent(new CustomEvent('usa-done', { bubbles: true }));
            return swapLabel(el, o.label, 1400);
        });
    }),
    click('send-plane', 'A paper plane ✈ takes off from the button.', { color: '#22d3ee' }, (el, o, ctx) => {
        const r = el.getBoundingClientRect();
        pop(el, ctx, 0.92, 200);
        return spawn(r.left + r.width / 2 - 8, r.top + r.height / 2 - 8, `font-size:16px;color:${o.color}`, ctx, [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(40px,-10px) rotate(-10deg)', opacity: 1, offset: 0.4 }, { transform: 'translate(160px,-90px) rotate(-25deg)', opacity: 0 }], { duration: 800, easing: 'ease-in' }, '✈')?.finished;
    }),
    click('add-to-cart', 'Bumps `[data-count]` by one and floats a "+1" (`text`).', { text: '+1', color: '#34d399' }, (el, o, ctx) => {
        bumpCount(el, 1, ctx);
        const { x, y } = origin(el, ctx);
        return spawn(x - 10, y - 10, `font:700 14px system-ui;color:${o.color}`, ctx, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-40px)', opacity: 0 }], { duration: 700, easing: 'ease-out' }, o.text)?.finished;
    }),
    click('counter-bump', 'Adds `step` to `[data-count]` with a rolling number.', { step: 1 }, (el, o, ctx) => void bumpCount(el, Number(o.step) || 1, ctx)),
    click('upvote', 'Toggles an upvote: the arrow nudges up and `[data-count]` ±1.', {}, (el, _o, ctx) => {
        const on = togglePressed(el);
        bumpCount(el, on ? 1 : -1, ctx);
        return ctx.animate(el, [{ transform: 'translateY(0)' }, { transform: `translateY(${on ? -6 : 4}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 320, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    }),
    click('clap', 'Counts claps in `[data-count]` with a 👏 burst on every press.', {}, (el, _o, ctx) => {
        bumpCount(el, 1, ctx);
        return Promise.all([pop(el, ctx, 1.15, 240)?.finished, burst(el, ctx, '👏', 'inherit', 3, true)]);
    }),
    click('emoji-react', 'Pops one `emoji` up from the pointer (reaction button).', { emoji: '🎉' }, (el, o, ctx) => burst(el, ctx, o.emoji, 'inherit', 1, true)),
    click('refresh-spin', 'Spins the icon one turn (`turns`).', { turns: 1 }, (el, o, ctx) => ctx.animate(el, [{ transform: 'rotate(0)' }, { transform: `rotate(${360 * o.turns}deg)` }], { duration: 600 * o.turns, easing: 'cubic-bezier(.4,0,.2,1)' })),
    click('trash-shake', 'Shakes, then drops and fades (`remove: true` removes the element afterwards).', { remove: false }, (el, o, ctx) => {
        const a = ctx.animate(el, [{ transform: 'none', opacity: 1 }, { transform: 'rotate(-6deg)', offset: 0.15 }, { transform: 'rotate(6deg)', offset: 0.3 }, { transform: 'rotate(0)', offset: 0.45, opacity: 1 }, { transform: 'translateY(30px) scale(.8)', opacity: 0 }], { duration: 650, easing: 'ease-in', fill: 'forwards' });
        const end = () => (o.remove ? el.remove() : a?.cancel());
        return a ? a.finished.then(end, end) : void end();
    }),
    click('check-toggle', 'Toggles a check mark (`aria-checked` for role=checkbox, else `aria-pressed`) that scales in.', {}, (el, _o, ctx) => {
        const attr = el.getAttribute('role') === 'checkbox' ? 'aria-checked' : 'aria-pressed';
        const on = el.getAttribute(attr) !== 'true';
        el.setAttribute(attr, String(on));
        return ctx.animate(el, on ? [{ transform: 'scale(.6)' }, { transform: 'scale(1.15)', offset: 0.6 }, { transform: 'scale(1)' }] : [{ transform: 'scale(1)' }, { transform: 'scale(.85)' }, { transform: 'scale(1)' }], { duration: 280, easing: 'ease-out' });
    }),
    attn('input-shake', 'Shakes an invalid field side to side and sets `aria-invalid` (`color` outline flash).', { color: '#ff5c8a' }, (el, o, ctx) => {
        el.setAttribute('aria-invalid', 'true');
        const prev = el.style.outline;
        el.style.outline = `2px solid ${o.color}`;
        setTimeout(() => (el.style.outline = prev), 900);
        return ctx.animate(el, [0, -8, 8, -6, 6, -3, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 420, easing: 'ease-out' });
    }),
    attn('error-flash', 'Flashes the element red once (no more than one flash per call).', { color: '#ff5c8a' }, (el, o, ctx) => ctx.animate(el, [{ boxShadow: `0 0 0 0 ${o.color}00` }, { boxShadow: `0 0 0 4px ${o.color}`, offset: 0.3 }, { boxShadow: `0 0 0 0 ${o.color}00` }], { duration: 700 })),
    attn('success-check', 'A green ✓ badge pops over the element and fades.', { color: '#34d399' }, (el, o, ctx) => {
        const [b, remove] = overlay(el, `display:grid;place-items:center;font:700 22px system-ui;color:#fff;background:${o.color}d0`);
        b.textContent = '✓';
        const a = ctx.animate(b, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)', offset: 0.3 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 1100, easing: 'ease-out' });
        return a ? a.finished.then(remove, remove) : void setTimeout(remove, 900);
    }),
    attn('nudge-hint', 'A small sideways nudge that says "try me" (`distance`).', { distance: 6 }, (el, o, ctx) => ctx.animate(el, [0, o.distance, 0, o.distance / 2, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 700, easing: 'ease-in-out' })),
    attn('focus-pulse', 'A ring pulses around the element to draw focus to it (`color`).', { color: '#7c5cff' }, (el, o, ctx) => ctx.animate(el, [{ boxShadow: `0 0 0 0 ${o.color}aa` }, { boxShadow: `0 0 0 12px ${o.color}00` }], { duration: 900, iterations: 2, easing: 'ease-out' })),
    attn('notify-badge', 'Bumps the badge count (`[data-count]`, `step`) with a pop — for new notifications.', { step: 1 }, (el, o, ctx) => {
        bumpCount(el, Number(o.step) || 1, ctx);
        return pop(el, ctx, 1.3, 320);
    }),
];

const THEME_ROLES = ['enter', 'hover', 'click', 'attention', 'background'];
const P = (enter, hover, click, attention, background) => ({
    enter: { effect: enter },
    hover: { effect: hover },
    click: { effect: click },
    attention: { effect: attention },
    background: { effect: background },
});
const MOTION_THEMES = {
    neon: {
        name: 'neon',
        vars: { bg: '#07070c', fg: '#e8e8ff', accent: '#22d3ee', 'accent-2': '#ff2bd6', surface: '#11111c', border: '1px solid #22d3ee', radius: '10px', shadow: '0 0 18px #22d3ee66, inset 0 0 12px #ff2bd622', font: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
        motion: { duration: { fast: 120, normal: 220 }, easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)' } },
        presets: P('fade-up', 'neon-flicker', 'shockwave', 'neon-flicker', 'starfield'),
    },
    paper: {
        name: 'paper',
        vars: { bg: '#f6f1e7', fg: '#2b2721', accent: '#c2410c', 'accent-2': '#0f766e', surface: '#fffdf8', border: '1px solid #e3dccd', radius: '4px', shadow: '0 1px 0 #0000000d, 0 10px 24px -14px #00000040', font: 'Georgia, "Times New Roman", serif' },
        motion: { duration: { fast: 200, normal: 380, slow: 700 }, easing: { standard: 'cubic-bezier(0, 0, 0, 1)' } },
        presets: P('paper-fold', 'wiggle', 'ink-splash', 'nudge-hint', 'contours'),
    },
    glass: {
        name: 'glass',
        vars: { bg: 'linear-gradient(135deg, #1e1b4b, #0e7490)', fg: '#f8fafc', accent: '#a5f3fc', 'accent-2': '#c4b5fd', surface: '#ffffff1f', border: '1px solid #ffffff40', radius: '18px', shadow: '0 8px 32px #0000003d', font: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
        motion: { duration: { normal: 320 }, easing: { standard: 'cubic-bezier(0.22, 1, 0.36, 1)' } },
        presets: P('blur', 'glass-shine', 'ripple', 'focus-pulse', 'mesh-gradient'),
    },
    retro: {
        name: 'retro',
        vars: { bg: '#1d1135', fg: '#ffe9a8', accent: '#ff6b35', 'accent-2': '#2ec4b6', surface: '#2a1b4d', border: '3px solid #ffe9a8', radius: '0', shadow: '4px 4px 0 #ff6b35', font: '"Courier New", ui-monospace, monospace' },
        motion: { duration: { normal: 300 }, easing: { standard: 'steps(6, end)' } },
        presets: P('clip-up', 'rubber-band', 'star-burst', 'tada', 'retro-scanlines'),
    },
    brutalist: {
        name: 'brutalist',
        vars: { bg: '#ffffff', fg: '#000000', accent: '#ff3b00', 'accent-2': '#0047ff', surface: '#fff200', border: '3px solid #000000', radius: '0', shadow: '6px 6px 0 #000000', font: '"Arial Black", Arial, sans-serif' },
        motion: { duration: { fast: 80, normal: 160 }, easing: { standard: 'linear' } },
        presets: P('drop-bounce', 'jelly', 'brutal-shift', 'shake', 'voronoi'),
    },
};
const MOTION_THEME_NAMES = Object.keys(MOTION_THEMES);
const BASE_CSS = `[data-usa-theme]{background:var(--usa-theme-bg);color:var(--usa-theme-fg);font-family:var(--usa-theme-font)}
[data-usa-theme] .usa-surface{background:var(--usa-theme-surface);border:var(--usa-theme-border);border-radius:var(--usa-theme-radius);box-shadow:var(--usa-theme-shadow)}
[data-usa-theme] .usa-accent{color:var(--usa-theme-accent)}
[data-usa-theme=glass] .usa-surface{-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}`;
const pack = (t) => {
    const p = typeof t === 'string' ? MOTION_THEMES[t] : t;
    if (!p)
        throw new Error(`[motionary] unknown theme "${String(t)}" — ${MOTION_THEME_NAMES.join(', ')}`);
    return p;
};
/** The CSS custom properties of a theme (design + motion tokens). */
function themeVars(t) {
    const p = pack(t);
    const out = {};
    for (const [k, v] of Object.entries(p.vars))
        out[`--usa-theme-${k}`] = v;
    return { ...out, ...motionTokensToVars(mergeMotionTokens(p.motion)) };
}
/** A theme as a CSS rule (`selector` default `[data-usa-theme=<name>]`) — for SSR / static CSS. */
function themeCss(t, selector) {
    const p = pack(t);
    return `${selector || `[data-usa-theme=${p.name}]`}{${Object.entries(themeVars(p)).map(([k, v]) => `${k}:${v}`).join(';')}}`;
}
/** Apply a 5.8 motion theme to `root` (default `<html>`). Returns an undo (8.9). */
function applyMotionTheme(t, root) {
    const p = pack(t);
    const el = root || document.documentElement;
    adoptStyles('usa-theme', BASE_CSS);
    const prevAttr = el.getAttribute('data-usa-theme');
    el.setAttribute('data-usa-theme', p.name);
    const vars = Object.entries(p.vars).map(([k, v]) => [`--usa-theme-${k}`, v]);
    const old = vars.map(([k]) => [k, el.style.getPropertyValue(k)]);
    for (const [k, v] of vars)
        el.style.setProperty(k, v);
    let undoMotion;
    if (el === document.documentElement)
        undoMotion = applyMotionTokens(p.motion, el);
    else {
        const mv = Object.entries(motionTokensToVars(mergeMotionTokens(p.motion)));
        const mold = mv.map(([k]) => [k, el.style.getPropertyValue(k)]);
        for (const [k, v] of mv)
            el.style.setProperty(k, v);
        undoMotion = () => mold.forEach(([k, v]) => (v ? el.style.setProperty(k, v) : el.style.removeProperty(k)));
    }
    return () => {
        undoMotion();
        old.forEach(([k, v]) => (v ? el.style.setProperty(k, v) : el.style.removeProperty(k)));
        if (prevAttr === null)
            el.removeAttribute('data-usa-theme');
        else
            el.setAttribute('data-usa-theme', prevAttr);
    };
}
/** The effect preset of a theme for a role. */
function themePreset(t, role) {
    return pack(t).presets[role];
}
/** Play the preset for `role` of the theme on the closest `[data-usa-theme]` (or `theme`). */
function playThemeEffect(el, role, theme) {
    const name = theme || el.closest('[data-usa-theme]')?.getAttribute('data-usa-theme') || 'neon';
    const pr = themePreset(name, role);
    return playEffect(el, pr.effect, pr.options);
}
const THEME_FX = [
    {
        name: 'neon-flicker',
        kind: 'attention',
        description: 'A neon tube flickering on — dims (never blacks out) twice, well under 3 flashes per second.',
        defaults: { color: '#22d3ee' },
        run: (el, o, ctx) => ctx.animate(el, [{ opacity: 1, filter: 'none' }, { opacity: 0.55, offset: 0.2 }, { opacity: 1, filter: `drop-shadow(0 0 6px ${o.color})`, offset: 0.35 }, { opacity: 0.7, offset: 0.6 }, { opacity: 1, filter: `drop-shadow(0 0 10px ${o.color})` }], { duration: 900, easing: 'linear' }),
    },
    {
        name: 'paper-fold',
        kind: 'enter',
        description: 'Unfolds like a sheet of paper hinged at the top.',
        defaults: { duration: 600 },
        run: (el, o, ctx) => ctx.animate(el, [{ transform: 'perspective(800px) rotateX(-85deg)', transformOrigin: 'top', opacity: 0 }, { transform: 'perspective(800px) rotateX(12deg)', transformOrigin: 'top', opacity: 1, offset: 0.7 }, { transform: 'perspective(800px) rotateX(0)', transformOrigin: 'top', opacity: 1 }], { duration: o.duration, easing: 'ease-out', fill: 'backwards' }),
    },
    {
        name: 'glass-shine',
        kind: 'hover',
        description: 'A bright diagonal shine sweeps across frosted glass.',
        defaults: { duration: 700 },
        run: (el, o, ctx) => {
            const [s, remove] = overlay(el, 'overflow:hidden;background:linear-gradient(105deg,transparent 35%,#ffffff8c 50%,transparent 65%);background-size:250% 100%;background-position:120% 0');
            const a = ctx.animate(s, [{ backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0' }], { duration: o.duration, easing: 'ease-in-out' });
            return a ? a.finished.then(remove, remove) : void remove();
        },
    },
    {
        name: 'retro-scanlines',
        kind: 'background',
        description: 'CRT scanlines with a slow roll (static lines under reduced motion; persistent).',
        reduced: 'run',
        defaults: { opacity: 0.18 },
        run: (el, o, ctx) => {
            const [s, remove] = overlay(el, `opacity:${o.opacity};background:repeating-linear-gradient(0deg,#000 0 1px,transparent 1px 3px);mix-blend-mode:multiply`);
            const a = ctx.reduced ? null : ctx.animate(s, [{ backgroundPosition: '0 0' }, { backgroundPosition: '0 30px' }], { duration: 2400, iterations: Infinity, easing: 'linear' });
            return () => {
                a?.cancel();
                remove();
            };
        },
    },
    {
        name: 'brutal-shift',
        kind: 'click',
        description: 'Presses into its hard drop shadow and springs back (brutalist buttons).',
        defaults: { offset: 6 },
        run: (el, o, ctx) => ctx.animate(el, [{ transform: 'translate(0,0)' }, { transform: `translate(${o.offset}px,${o.offset}px)`, boxShadow: '0 0 0 #000', offset: 0.3 }, { transform: 'translate(0,0)' }], { duration: 260, easing: 'ease-out' }),
    },
];
/** `<usa-theme name="neon | paper | glass | retro | brutalist">` — a themed subtree. */
function defineMotionTheme(tag = 'usa-motion-theme') {
    return defineElement(tag, (Base) => class UsaTheme extends Base {
        static get observedAttributes() {
            return ['name'];
        }
        get theme() {
            const n = this.str('name', 'neon');
            return MOTION_THEMES[n] ? n : 'neon';
        }
        mount() {
            this.onCleanup(applyMotionTheme(this.theme, this));
            this.querySelectorAll('[data-theme-fx]').forEach((el) => {
                const role = (el.dataset.themeFx || 'click');
                if (!THEME_ROLES.includes(role))
                    return;
                const pr = themePreset(this.theme, role);
                const trigger = role === 'attention' ? 'click' : role === 'background' ? 'load' : role;
                try {
                    this.onCleanup(bindEffect(el, pr.effect, { ...(pr.options || {}), trigger }));
                }
                catch {
                    /* effect not registered: call registerAllEffects() */
                }
            });
        }
    }, { id: 'usa-theme-el', text: 'usa-theme{display:block}' });
}

/**
 * motionary/components/effects — the 5.x effect packs, all
 * registered through `registerEffect()` (5.0) and playable with
 * `playEffect()`, `bindEffect()` or `<usa-fx>`. Kept out of
 * `motionary/components` / `components/lite` so their size budgets
 * hold; the UMD bundle registers everything.
 *
 * ```ts
 * import { registerAllEffects } from 'motionary/components/effects';
 * registerAllEffects();
 * ```
 */
/** The effect packs by version, in release order. */
const EFFECT_PACKS = {
    'cards-click': [...CARD_FX, ...CLICK_FX],
    physics: PHYSICS_FX,
    page: PAGE_FX,
    generative: GENERATIVE_FX,
    audio: AUDIO_FX,
    cursor: CURSOR_FX,
    micro: MICRO_FX,
    themes: THEME_FX,
};
/** 5.1: card & click effects 2.0. */
function registerCardClickEffects() {
    registerEffects(EFFECT_PACKS['cards-click']);
}
/** 5.2: bounce & physics micro-interactions. */
function registerPhysicsEffects() {
    registerEffects(EFFECT_PACKS.physics);
}
/** 5.3: page-wide transitions and effects. */
function registerPageEffects() {
    registerEffects(EFFECT_PACKS.page);
}
/** 5.5: generative Canvas 2D backgrounds. */
function registerGenerativeEffects() {
    registerEffects(EFFECT_PACKS.generative);
}
/** 5.6: sound-reactive (Web Audio) backgrounds. */
function registerAudioEffects() {
    registerEffects(EFFECT_PACKS.audio);
}
/** 5.7: cursor trails, magnetic dots, spotlight cursor. */
function registerCursorEffects() {
    registerEffects(EFFECT_PACKS.cursor);
}
/** 5.8: micro-interactions + theme-pack effects. */
function registerMicroEffects() {
    registerEffects(EFFECT_PACKS.micro);
    registerEffects(EFFECT_PACKS.themes);
}
/** Define the 5.x elements of this entry (`<usa-story>`, …) under their default tags. */
function defineEffectElements() {
    defineStory();
    defineAudio();
    defineGestureFx();
    defineMotionTheme();
    definePlayer();
}
/** Register the built-ins and every pack (idempotent). */
function registerAllEffects() {
    registerBuiltinEffects();
    for (const defs of Object.values(EFFECT_PACKS))
        registerEffects(defs);
}

export { AUDIO_FX, CARD_FX, CLICK_FX, CURSOR_FX, EFFECT_PACKS, GENERATIVE_FX, GESTURES, MICRO_FX, MOTION_THEMES, MOTION_THEME_NAMES, PAGE_FX, PHYSICS_FX, THEME_FX, THEME_ROLES, angleDelta, applyMotionTheme, bindGesture, bounceKeyframes, bumpCount, canvasBackground, defineAudio, defineEffectElements, defineGestureFx, defineMotionTheme, definePlayer, defineStory, flingVelocity, fxLayer, hexRgb, playThemeEffect, registerAllEffects, registerAudioEffects, registerCardClickEffects, registerCursorEffects, registerGenerativeEffects, registerMicroEffects, registerPageEffects, registerPhysicsEffects, solveSpring, springKeyframes, swapLabel, themeCss, themePreset, themeVars, togglePressed };
//# sourceMappingURL=effects.js.map
