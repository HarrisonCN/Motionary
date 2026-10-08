import { registerBuiltinEffects } from './fx.js';
import { P as PALETTE, o as overlay, a as all, b as origin, s as spawn, r as rand, f as fxLayer } from '../chunks/shared-CkKHWrtJ.js';
import { y as defineElement, p as prefersReducedMotion, v as adoptStyles } from '../chunks/base-DchG4q_S.js';
import { c as canvasBackground, h as hexRgb, G as GENERATIVE_FX } from '../chunks/generative-2LhxG5BJ.js';
export { n as noise2 } from '../chunks/generative-2LhxG5BJ.js';
import { p as playEffect, b as bindEffect, c as registerEffects } from '../chunks/registry-Bu5NrAyA.js';
import { applyMotionTokens, motionTokensToVars, mergeMotionTokens } from './tokens.js';
import { T as TIMELINE_PRESETS } from '../chunks/core-DVyTlo9Q.js';
import '../chunks/fx-DUMVKSvg.js';

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

/**
 * 5.4 — `<usa-story template="…">` scroll-storytelling templates.
 *
 * - `pin` — a sticky `[data-stage]` while `[data-step]` sections scroll past; the
 *   step in view gets `data-active`, the stage gets `data-active-step="<index>"`.
 * - `gallery` — a horizontal `[data-track]` slides sideways as you scroll down.
 * - `zoom` — the `[data-stage]` zooms toward the viewer (`zoom="6"`) and fades.
 * - `compare` — before / after (`[data-before]`, `[data-after]`) wipe driven by
 *   scroll, plus a draggable, keyboard-accessible handle (`role="slider"`).
 * - `counter` — `[data-count="1234"]` numbers count up when they enter view.
 * - `highlight` — paragraphs dim except the one crossing the viewport center.
 *
 * Every template sets `--usa-story-progress` (0–1) on the host and dispatches
 * `usa-story-step` (`detail: { index }`). Reduced motion: no sliding / zooming
 * (the gallery stacks vertically), counters show final values, the rest is
 * class changes only.
 */
const STORY_TEMPLATES = ['pin', 'gallery', 'zoom', 'compare', 'counter', 'highlight'];
const CSS = `usa-story{display:block;position:relative}
usa-story[template=pin] [data-stage],usa-story[template=gallery] [data-sticky],usa-story[template=zoom] [data-stage],usa-story[template=compare] [data-sticky]{position:sticky;top:0}
usa-story[template=pin] [data-stage]{align-self:start}
usa-story[template=pin] [data-step]{min-height:80vh;opacity:.35;transition:opacity .3s}
usa-story[template=pin] [data-step][data-active]{opacity:1}
usa-story[template=gallery] [data-sticky]{height:100vh;overflow:hidden;display:flex;align-items:center}
usa-story[template=gallery] [data-track]{display:flex;gap:24px;will-change:transform}
usa-story[template=gallery][data-static] [data-sticky]{position:static;height:auto;overflow:visible}
usa-story[template=gallery][data-static] [data-track]{flex-direction:column;transform:none!important}
usa-story[template=zoom] [data-stage]{height:100vh;overflow:hidden;display:grid;place-items:center}
usa-story[template=compare] [data-sticky]{height:var(--usa-story-h,70vh);overflow:hidden}
usa-story[template=compare] [data-before],usa-story[template=compare] [data-after]{position:absolute;inset:0}
usa-story[template=compare] [data-after]{clip-path:inset(0 0 0 var(--usa-split,50%))}
usa-story [data-handle]{position:absolute;top:0;bottom:0;left:var(--usa-split,50%);width:4px;margin-left:-2px;background:#fff;box-shadow:0 0 0 1px #0003;cursor:ew-resize;touch-action:none}
usa-story [data-handle]:focus-visible{outline:3px solid #7c5cff;outline-offset:2px}
usa-story[template=highlight] p,usa-story[template=highlight] [data-step]{opacity:.3;transition:opacity .25s}
usa-story[template=highlight] [data-active]{opacity:1}`;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Progress of `el` through the viewport: 0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom. */
function storyProgress(el, vh = typeof innerHeight === 'number' ? innerHeight : 800) {
    const r = el.getBoundingClientRect();
    const span = r.height - vh;
    return span > 0 ? clamp(-r.top / span) : clamp((vh - r.top) / (vh + r.height));
}
/** Format a counted value like the target (`1,234`, `12.5`, prefix / suffix kept). */
function formatCount(target, t) {
    const m = target.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
    if (!m)
        return target;
    const [, pre, num, post] = m;
    const n = parseFloat(num.replace(/,/g, ''));
    const dec = (num.split('.')[1] || '').length;
    let s = (n * t).toFixed(dec);
    if (num.includes(','))
        s = Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return pre + s + post;
}
function defineStory(tag = 'usa-story') {
    return defineElement(tag, (Base) => class UsaStory extends Base {
        constructor() {
            super(...arguments);
            this.progress = 0;
            this.step = -1;
            this.frame = 0;
        }
        static get observedAttributes() {
            return ['template', 'zoom'];
        }
        get template() {
            const t = this.str('template', 'pin');
            return STORY_TEMPLATES.includes(t) ? t : 'pin';
        }
        steps() {
            const own = Array.from(this.querySelectorAll('[data-step]:not([data-stage])'));
            return own.length || this.template !== 'highlight' ? own : Array.from(this.querySelectorAll('p'));
        }
        setStep(i) {
            if (i === this.step)
                return;
            this.step = i;
            this.steps().forEach((s, k) => s.toggleAttribute('data-active', k === i));
            const stage = this.querySelector('[data-stage]');
            if (stage)
                stage.dataset.activeStep = String(i);
            this.dispatchEvent(new CustomEvent('usa-story-step', { detail: { index: i }, bubbles: true }));
        }
        /** Recompute from the current scroll position (called on scroll / resize). */
        update() {
            this.frame = 0;
            const p = (this.progress = storyProgress(this));
            this.style.setProperty('--usa-story-progress', p.toFixed(4));
            const t = this.template;
            const vh = innerHeight || 800;
            if (t === 'pin' || t === 'highlight') {
                const mid = vh / 2;
                let best = -1;
                let bestD = Infinity;
                this.steps().forEach((s, i) => {
                    const r = s.getBoundingClientRect();
                    const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
                    if (d < bestD)
                        (bestD = d), (best = i);
                });
                this.setStep(best);
            }
            else if (t === 'gallery' && !this.reduced) {
                const track = this.querySelector('[data-track]');
                const box = this.querySelector('[data-sticky]');
                if (track && box)
                    track.style.transform = `translateX(${(-p * Math.max(0, track.scrollWidth - box.clientWidth)).toFixed(1)}px)`;
            }
            else if (t === 'zoom' && !this.reduced) {
                const inner = this.querySelector('[data-stage] > *');
                if (inner) {
                    inner.style.transform = `scale(${(1 + p * (this.num('zoom', 6) - 1)).toFixed(3)})`;
                    inner.style.opacity = String(clamp(1.4 - p * 1.4).toFixed(3));
                }
            }
            else if (t === 'compare' && !this.hasAttribute('data-dragged')) {
                this.setSplit(p * 100);
            }
            else if (t === 'counter') {
                this.querySelectorAll('[data-count]:not([data-counted])').forEach((el) => {
                    const r = el.getBoundingClientRect();
                    if (r.top < vh * 0.9 && r.bottom > 0)
                        this.count(el);
                });
            }
        }
        setSplit(pct) {
            const v = clamp(pct, 0, 100);
            this.style.setProperty('--usa-split', `${v.toFixed(2)}%`);
            const h = this.querySelector('[data-handle]');
            if (h)
                h.setAttribute('aria-valuenow', String(Math.round(v)));
        }
        count(el) {
            el.dataset.counted = '';
            const target = el.dataset.count || el.textContent || '0';
            el.setAttribute('aria-label', target);
            if (this.reduced) {
                el.textContent = target;
                return;
            }
            const dur = Number(el.dataset.duration) || 1600;
            const t0 = performance.now();
            const tick = (now) => {
                const k = clamp((now - t0) / dur);
                el.textContent = formatCount(target, 1 - (1 - k) ** 3);
                if (k < 1)
                    requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }
        mount() {
            this.toggleAttribute('data-static', this.reduced);
            if (this.template === 'compare')
                this.mountCompare();
            const kick = () => {
                if (!this.frame)
                    this.frame = requestAnimationFrame(() => this.update());
            };
            this.listen(window, 'scroll', kick, { passive: true });
            this.listen(window, 'resize', kick);
            this.onCleanup(() => cancelAnimationFrame(this.frame));
            this.update();
        }
        mountCompare() {
            const box = this.querySelector('[data-sticky]') || this;
            let h = this.querySelector('[data-handle]');
            if (!h) {
                h = document.createElement('div');
                h.setAttribute('data-handle', '');
                box.appendChild(h);
                this.onCleanup(() => h.remove());
            }
            h.tabIndex = 0;
            h.setAttribute('role', 'slider');
            h.setAttribute('aria-label', this.str('label', 'Before / after'));
            h.setAttribute('aria-valuemin', '0');
            h.setAttribute('aria-valuemax', '100');
            const at = (e) => {
                const r = box.getBoundingClientRect();
                this.dataset.dragged = '';
                this.setSplit(((e.clientX - r.left) / (r.width || 1)) * 100);
            };
            let drag = false;
            this.listen(h, 'pointerdown', (e) => {
                drag = true;
                h.setPointerCapture?.(e.pointerId);
            });
            this.listen(h, 'pointermove', (e) => drag && at(e));
            this.listen(h, 'pointerup', () => (drag = false));
            this.listen(h, 'keydown', (e) => {
                const cur = parseFloat(h.getAttribute('aria-valuenow') || '50');
                const step = e.shiftKey ? 10 : 2;
                const next = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? cur - step : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? cur + step : e.key === 'Home' ? 0 : e.key === 'End' ? 100 : null;
                if (next == null)
                    return;
                e.preventDefault();
                this.dataset.dragged = '';
                this.setSplit(next);
            });
            this.setSplit(50);
        }
        unmount() {
            this.step = -1;
            delete this.dataset.dragged;
        }
    }, { id: 'usa-story', text: CSS });
}

let actx = null;
let current = null;
const mediaSources = new WeakMap();
/** The running analyser, if `enableAudio()` was called. */
const getAudio = () => current;
function audioContext() {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC)
        throw new Error('[motionary] Web Audio is not available');
    if (!actx || actx.state === 'closed')
        actx = new AC();
    return actx;
}
/**
 * Start analysing `input` and make it the source of every sound-reactive
 * effect. Call from a user gesture. Replaces a previous source.
 */
async function enableAudio(input = 'mic', opts = {}) {
    current?.stop();
    const ac = audioContext();
    if (ac.state === 'suspended')
        await ac.resume().catch(() => undefined);
    const analyser = ac.createAnalyser();
    analyser.fftSize = opts.fftSize || 512;
    analyser.smoothingTimeConstant = opts.smoothing ?? 0.8;
    let src;
    let release = () => { };
    const media = typeof input === 'string' && input !== 'mic' ? document.querySelector(input) : input;
    if (media === 'mic') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        src = ac.createMediaStreamSource(stream);
        src.connect(analyser); // never to the speakers: no feedback
        release = () => stream.getTracks().forEach((t) => t.stop());
    }
    else if (media && typeof media.play === 'function') {
        const m = media;
        let node = mediaSources.get(m);
        if (!node)
            mediaSources.set(m, (node = ac.createMediaElementSource(m)));
        try {
            node.disconnect();
        }
        catch {
            /* not connected */
        }
        src = node;
        src.connect(analyser);
        analyser.connect(ac.destination);
        release = () => {
            try {
                node.disconnect();
            }
            catch {
                /* already */
            }
            node.connect(ac.destination); // keep the media audible
        };
        if (m.paused)
            await m.play()?.catch?.(() => undefined);
    }
    else if (media && typeof media.getTracks === 'function') {
        src = ac.createMediaStreamSource(media);
        src.connect(analyser);
    }
    else
        throw new Error(`[motionary] enableAudio: no audio source for ${String(input)}`);
    const freq = new Uint8Array(analyser.frequencyBinCount);
    const wave = new Uint8Array(analyser.fftSize);
    const self = {
        context: ac,
        analyser,
        sample: () => {
            analyser.getByteFrequencyData(freq);
            analyser.getByteTimeDomainData(wave);
            let sq = 0;
            for (let i = 0; i < wave.length; i++)
                sq += ((wave[i] - 128) / 128) ** 2;
            const n = Math.max(1, Math.round(freq.length * 0.08));
            let b = 0;
            for (let i = 0; i < n; i++)
                b += freq[i];
            return { level: Math.min(1, Math.sqrt(sq / wave.length) * 2), bass: b / n / 255, freq, wave };
        },
        stop: () => {
            if (current === self) {
                current = null;
                if (raf && typeof cancelAnimationFrame === 'function')
                    cancelAnimationFrame(raf);
                raf = 0;
            }
            try {
                src.disconnect();
                analyser.disconnect();
            }
            catch {
                /* already */
            }
            release();
            setVars(0, 0);
        },
    };
    current = self;
    kick();
    return self;
}
/** Stop the current audio source (if any). */
function disableAudio() {
    current?.stop();
}
/** A pure beat detector: feed it energy (0–1) and a timestamp per frame; it answers "beat?". */
function createBeatDetector(o = {}) {
    const { threshold = 1.35, cooldown = 250, history = 43, floor = 0.08 } = o;
    const hist = [];
    let last = -Infinity;
    return (energy, now) => {
        const avg = hist.length ? hist.reduce((a, b) => a + b, 0) / hist.length : energy;
        const ready = hist.length >= 8;
        hist.push(energy);
        if (hist.length > history)
            hist.shift();
        if (ready && energy > floor && energy > avg * threshold && now - last >= cooldown) {
            last = now;
            return true;
        }
        return false;
    };
}
const listeners = new Set();
let raf = 0;
function setVars(level, bass) {
    if (typeof document === 'undefined')
        return;
    const s = document.documentElement.style;
    s.setProperty('--usa-audio-level', level.toFixed(3));
    s.setProperty('--usa-audio-bass', bass.toFixed(3));
}
function loop(now) {
    raf = 0;
    if (!current)
        return;
    const { level, bass } = current.sample();
    const reduced = prefersReducedMotion();
    setVars(reduced ? 0 : level, reduced ? 0 : bass);
    for (const l of Array.from(listeners))
        if (l.detect(bass, now))
            l.cb({ energy: bass, time: now });
    kick();
}
function kick() {
    if (!raf && current && typeof requestAnimationFrame === 'function')
        raf = requestAnimationFrame(loop);
}
/** Call `cb` on every detected beat of the current audio source. Returns an unsubscribe. */
function onBeat(cb, o = {}) {
    const l = { detect: createBeatDetector(o), cb };
    listeners.add(l);
    kick();
    return () => void listeners.delete(l);
}
/** Play the registered effect `name` on `el` at every beat (not under reduced motion). Returns an unbind. */
function bindBeat(el, name, options = {}) {
    const { threshold, cooldown, history, floor, ...fx } = options;
    return onBeat(() => {
        if (!prefersReducedMotion())
            playEffect(el, name, fx).catch(() => undefined);
    }, { threshold, cooldown, history, floor });
}
// --- visual effects ----------------------------------------------------------
/** The current sample, or a gentle synthetic one while no audio is enabled. */
function read(t, bins) {
    if (current)
        return { ...current.sample(), idle: false };
    const freq = new Uint8Array(bins);
    const wave = new Uint8Array(bins * 2);
    for (let i = 0; i < bins; i++)
        freq[i] = 70 + 50 * Math.sin(t * 2 + i * 0.35) * Math.cos(t * 0.7 + i * 0.11) * (1 - i / bins);
    for (let i = 0; i < wave.length; i++)
        wave[i] = 128 + 22 * Math.sin(t * 3 + i * 0.12);
    return { level: 0.25 + 0.1 * Math.sin(t * 2), bass: 0.35 + 0.2 * Math.sin(t * 2.4), freq, wave, idle: true };
}
const audioFx = (name, description, defaults, spec) => ({
    name,
    kind: 'background',
    description,
    reduced: 'skip',
    defaults: { colors: PALETTE, background: '#0b0d12', speed: 1, quality: 1, ...defaults },
    run: (el, o, ctx) => canvasBackground(el, ctx, spec, o),
});
const AUDIO_FX = [
    audioFx('spectrum-bars', 'Frequency bars dance to the audio (mirror them with `mirror: true`).', { bars: 48, gap: 2, mirror: false }, {
        draw: ({ ctx, w, h, t, o }) => {
            ctx.fillStyle = o.background;
            ctx.fillRect(0, 0, w, h);
            const s = read(t, o.bars);
            const per = Math.max(1, Math.floor((s.freq.length * 0.7) / o.bars));
            const bw = w / o.bars;
            for (let i = 0; i < o.bars; i++) {
                let v = 0;
                for (let k = 0; k < per; k++)
                    v += s.freq[Math.min(s.freq.length - 1, i * per + k)];
                const bh = (v / per / 255) * h * (o.mirror ? 0.5 : 0.9);
                ctx.fillStyle = o.colors[i % o.colors.length];
                ctx.fillRect(i * bw + o.gap / 2, o.mirror ? h / 2 - bh : h - bh, Math.max(1, bw - o.gap), o.mirror ? bh * 2 : bh);
            }
        },
    }),
    audioFx('pulse-ring', 'Glowing rings pulse with the bass.', { rings: 3, color: '#7c5cff' }, {
        draw: ({ ctx, w, h, t, o }) => {
            ctx.fillStyle = o.background;
            ctx.fillRect(0, 0, w, h);
            const s = read(t, 32);
            const [r, g, b] = hexRgb(o.color);
            const base = Math.min(w, h) * 0.18;
            for (let i = 0; i < o.rings; i++) {
                const rad = base * (1 + i * 0.55) * (1 + s.bass * 0.6);
                ctx.strokeStyle = `rgba(${r},${g},${b},${(0.9 - i * 0.25) * (0.4 + s.level)})`;
                ctx.lineWidth = 3 + s.bass * 10 - i;
                ctx.beginPath();
                ctx.arc(w / 2, h / 2, rad, 0, Math.PI * 2);
                ctx.stroke();
            }
        },
    }),
    audioFx('wave-ring', 'The live waveform wrapped into a circle.', { color: '#22d3ee', amplitude: 0.35 }, {
        draw: ({ ctx, w, h, t, o }) => {
            ctx.fillStyle = o.background;
            ctx.fillRect(0, 0, w, h);
            const s = read(t, 64);
            const n = s.wave.length;
            const base = Math.min(w, h) * 0.28;
            ctx.strokeStyle = o.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i <= n; i++) {
                const a = (i / n) * Math.PI * 2;
                const rad = base * (1 + ((s.wave[i % n] - 128) / 128) * o.amplitude * 2);
                const x = w / 2 + Math.cos(a) * rad;
                const y = h / 2 + Math.sin(a) * rad;
                if (i)
                    ctx.lineTo(x, y);
                else
                    ctx.moveTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        },
    }),
];
/**
 * `<usa-audio source="#track | mic" label="…">` — a toggle button (yours, as
 * `[data-audio-toggle]`, or one it renders) that enables the audio source on
 * click; children with `data-usa-beat="effect"` play that effect on every
 * beat (`data-usa-beat-options` JSON; `threshold` / `cooldown` attributes).
 * Emits `usa-beat` and `usa-audio-error`.
 */
function defineAudio(tag = 'usa-audio') {
    return defineElement(tag, (Base) => class UsaAudio extends Base {
        constructor() {
            super(...arguments);
            this.active = false;
            this.audio = null;
            this.off = null;
        }
        static get observedAttributes() {
            return ['source'];
        }
        button() {
            let b = this.querySelector('[data-audio-toggle]');
            if (!b) {
                b = document.createElement('button');
                b.type = 'button';
                b.setAttribute('data-audio-toggle', '');
                b.textContent = this.str('label', '🔊 Enable sound-reactive effects');
                this.prepend(b);
                this.onCleanup(() => b.remove());
            }
            return b;
        }
        async toggle() {
            const b = this.button();
            if (this.active)
                return this.stop();
            try {
                this.audio = await enableAudio(this.str('source', 'mic'));
                this.active = true;
                this.removeAttribute('data-audio-error');
                b.setAttribute('aria-pressed', 'true');
                this.off = onBeat((d) => {
                    this.dispatchEvent(new CustomEvent('usa-beat', { detail: d, bubbles: true }));
                    if (prefersReducedMotion())
                        return;
                    this.querySelectorAll('[data-usa-beat]').forEach((el) => {
                        let opts = {};
                        try {
                            opts = JSON.parse(el.dataset.usaBeatOptions || '{}') || {};
                        }
                        catch {
                            /* ignore bad JSON */
                        }
                        playEffect(el, el.dataset.usaBeat || 'pulse', opts).catch(() => undefined);
                    });
                }, { threshold: this.num('threshold', 1.35), cooldown: this.num('cooldown', 250) });
            }
            catch (err) {
                this.setAttribute('data-audio-error', '');
                this.dispatchEvent(new CustomEvent('usa-audio-error', { detail: { error: err }, bubbles: true }));
            }
        }
        stop() {
            this.off?.();
            this.off = null;
            if (this.audio && current === this.audio)
                this.audio.stop();
            this.audio = null;
            this.active = false;
            this.querySelector('[data-audio-toggle]')?.setAttribute('aria-pressed', 'false');
        }
        mount() {
            const b = this.button();
            b.setAttribute('aria-pressed', 'false');
            this.listen(b, 'click', () => void this.toggle());
            this.onCleanup(() => this.stop());
        }
    }, { id: 'usa-audio', text: 'usa-audio{display:block}usa-audio[data-audio-error] [data-audio-toggle]{outline:2px solid #ff5c8a}' });
}

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
const THEMES = {
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
const THEME_NAMES = Object.keys(THEMES);
const BASE_CSS = `[data-usa-theme]{background:var(--usa-theme-bg);color:var(--usa-theme-fg);font-family:var(--usa-theme-font)}
[data-usa-theme] .usa-surface{background:var(--usa-theme-surface);border:var(--usa-theme-border);border-radius:var(--usa-theme-radius);box-shadow:var(--usa-theme-shadow)}
[data-usa-theme] .usa-accent{color:var(--usa-theme-accent)}
[data-usa-theme=glass] .usa-surface{-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}`;
const pack = (t) => {
    const p = typeof t === 'string' ? THEMES[t] : t;
    if (!p)
        throw new Error(`[motionary] unknown theme "${String(t)}" — ${THEME_NAMES.join(', ')}`);
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
/** Apply a theme to `root` (default `<html>`). Returns an undo. */
function applyTheme(t, root) {
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
function defineTheme(tag = 'usa-theme') {
    return defineElement(tag, (Base) => class UsaTheme extends Base {
        static get observedAttributes() {
            return ['name'];
        }
        get theme() {
            const n = this.str('name', 'neon');
            return THEMES[n] ? n : 'neon';
        }
        mount() {
            this.onCleanup(applyTheme(this.theme, this));
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
 * 5.9 — `<usa-player>`: plays JSON animations.
 *
 * Format `use-scroll-animate/animation` v1:
 *
 * ```json
 * { "format": "use-scroll-animate/animation", "version": 1, "name": "Hero",
 *   "loop": false,
 *   "tracks": [
 *     { "target": "h1", "start": 0, "duration": 600, "preset": "fade-up" },
 *     { "target": ".cta", "start": 500, "duration": 500, "keyframes": [{ "opacity": 0 }, { "opacity": 1 }], "easing": "ease-out" },
 *     { "target": ".cta", "start": 1100, "effect": "jelly", "options": {} }
 *   ] }
 * ```
 *
 * A track animates `target` (a selector inside the player; `:scope` for the
 * player itself) with a timeline preset, its own keyframes, or fires any
 * registered effect at `start`. Playground presets (format
 * `use-scroll-animate/playground`) are accepted too — their tracks map to the
 * player's children in order.
 *
 * Keyframe tracks are WAAPI animations driven by one clock, so the player can
 * play, pause, seek, change rate and be scrubbed by scroll
 * (`trigger="scroll"`). Reduced motion: jumps to the end state, effects skipped.
 */
const ANIMATION_FORMAT = 'use-scroll-animate/animation';
function decodePlayground(state) {
    try {
        const b64 = state.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(escape(atob(b64)));
        const t = (JSON.parse(json).t || []);
        return t.map(([preset, start, duration, label], i) => ({ target: `:scope > :nth-child(${i + 1})`, preset, start, duration, label }));
    }
    catch {
        return [];
    }
}
/** Validate / normalise an animation (object or JSON text). Throws on anything unusable. */
function normalizeAnimation(input) {
    const d = typeof input === 'string' ? JSON.parse(input) : input;
    if (!d || typeof d !== 'object')
        throw new Error('[motionary] animation: expected an object');
    let tracks;
    if (d.format === 'use-scroll-animate/playground')
        tracks = decodePlayground(String(d.state || ''));
    else if (Array.isArray(d.tracks))
        tracks = d.tracks;
    else
        throw new Error('[motionary] animation: missing "tracks"');
    if (d.format && d.format !== ANIMATION_FORMAT && d.format !== 'use-scroll-animate/playground')
        throw new Error(`[motionary] animation: unknown format "${d.format}"`);
    if (d.version && d.version > 1 && d.format === ANIMATION_FORMAT)
        throw new Error(`[motionary] animation: version ${d.version} needs a newer motionary`);
    const out = tracks
        .filter((t) => t && (t.effect || t.preset || Array.isArray(t.keyframes)))
        .map((t) => ({ ...t, target: t.target || ':scope', start: Math.max(0, Number(t.start) || 0), duration: t.effect ? 0 : Math.max(1, Number(t.duration) || 600) }));
    const end = out.reduce((m, t) => Math.max(m, t.start + t.duration), 0);
    return { tracks: out, duration: Math.max(end, Number(d.duration) || 0), loop: !!d.loop, name: String(d.name || 'animation') };
}
const pick = (root, sel) => {
    if (sel === ':scope')
        return [root];
    try {
        return Array.from(root.querySelectorAll(sel));
    }
    catch {
        return [];
    }
};
/** Bind an animation to `root` and return its controller (paused at 0 unless `autoplay`). */
function createPlayer(root, animation, o = {}) {
    const a = normalizeAnimation(animation);
    const loop = o.loop ?? a.loop;
    const anims = [];
    const effects = [];
    for (const t of a.tracks) {
        const els = pick(root, t.target);
        if (t.effect)
            effects.push({ els, t, fired: false });
        else {
            const kf = t.keyframes || TIMELINE_PRESETS[t.preset] || TIMELINE_PRESETS.fade;
            for (const el of els) {
                if (typeof el.animate !== 'function')
                    continue;
                const an = el.animate(kf, { duration: t.duration, delay: t.start, easing: t.easing || 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' });
                an.pause();
                an.currentTime = 0;
                anims.push(an);
            }
        }
    }
    let time = 0;
    let playing = false;
    let raf = 0;
    let last = 0;
    let resolve;
    let finished = new Promise((r) => (resolve = r));
    const set = (ms) => {
        time = Math.min(a.duration, Math.max(0, ms));
        for (const an of anims)
            an.currentTime = time;
    };
    const fireDue = () => {
        if (prefersReducedMotion())
            return;
        for (const e of effects)
            if (!e.fired && time >= e.t.start) {
                e.fired = true;
                for (const el of e.els)
                    playEffect(el, e.t.effect, e.t.options || {}).catch(() => undefined);
            }
    };
    const done = () => {
        resolve();
        o.onFinish?.();
        finished = new Promise((r) => (resolve = r));
    };
    const frame = (now) => {
        raf = 0;
        if (!playing)
            return;
        set(time + (now - last) * player.rate);
        last = now;
        fireDue();
        if (time >= a.duration) {
            if (loop) {
                effects.forEach((e) => (e.fired = false));
                set(0);
            }
            else {
                playing = false;
                done();
                return;
            }
        }
        raf = requestAnimationFrame(frame);
    };
    const player = {
        get duration() {
            return a.duration;
        },
        get currentTime() {
            return time;
        },
        get playing() {
            return playing;
        },
        rate: o.rate ?? 1,
        get finished() {
            return finished;
        },
        play() {
            if (prefersReducedMotion()) {
                set(a.duration);
                effects.forEach((e) => (e.fired = true));
                done();
                return;
            }
            if (playing)
                return;
            if (time >= a.duration) {
                effects.forEach((e) => (e.fired = false));
                set(0);
            }
            playing = true;
            last = performance.now();
            fireDue();
            raf = requestAnimationFrame(frame);
        },
        pause() {
            playing = false;
            cancelAnimationFrame(raf);
            raf = 0;
        },
        seek(ms) {
            set(ms);
            effects.forEach((e) => (e.fired = e.t.start < time));
        },
        destroy() {
            player.pause();
            anims.forEach((an) => an.cancel());
        },
    };
    if (o.autoplay)
        player.play();
    return player;
}
/**
 * `<usa-player src="hero.json" | <script type="application/json"> child
 * trigger="load | view | scroll | click | manual" loop rate controls>`.
 * Emits `usa-player-ready` and `usa-player-finish`; sets `data-error` when the
 * animation cannot be loaded.
 */
function definePlayer(tag = 'usa-player') {
    return defineElement(tag, (Base) => class UsaPlayer extends Base {
        constructor() {
            super(...arguments);
            this.player = null;
            this.json = null;
        }
        static get observedAttributes() {
            return ['src', 'trigger', 'loop', 'rate'];
        }
        load(animation) {
            this.json = animation;
            this.start();
        }
        play() {
            this.player?.play();
        }
        pause() {
            this.player?.pause();
        }
        seek(ms) {
            this.player?.seek(ms);
        }
        start() {
            this.player?.destroy();
            this.player = null;
            if (!this.json)
                return;
            try {
                this.player = createPlayer(this, this.json, {
                    loop: this.hasAttribute('loop') ? true : undefined,
                    rate: this.num('rate', 1),
                    onFinish: () => this.dispatchEvent(new CustomEvent('usa-player-finish', { bubbles: true })),
                });
                this.removeAttribute('data-error');
            }
            catch (err) {
                this.setAttribute('data-error', String(err.message || err));
                return;
            }
            const p = this.player;
            this.dispatchEvent(new CustomEvent('usa-player-ready', { detail: { duration: p.duration }, bubbles: true }));
            const trig = this.str('trigger', 'view');
            if (trig === 'load')
                p.play();
            else if (trig === 'view')
                this.inView((v) => v && p.play(), { threshold: 0.25 });
            else if (trig === 'click')
                this.listen(this, 'click', () => (p.playing ? p.pause() : p.play()));
            else if (trig === 'scroll') {
                let f = 0;
                const upd = () => {
                    f = 0;
                    p.seek(storyProgress(this) * p.duration);
                };
                const kick = () => void (f || (f = requestAnimationFrame(upd)));
                this.listen(window, 'scroll', kick, { passive: true });
                this.listen(window, 'resize', kick);
                this.onCleanup(() => cancelAnimationFrame(f));
                upd();
            }
            if (this.flag('controls'))
                this.mountControls(p);
        }
        mountControls(p) {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('data-player-toggle', '');
            b.textContent = '▶︎ / ❚❚';
            b.setAttribute('aria-label', 'Play / pause animation');
            this.listen(b, 'click', (e) => {
                e.stopPropagation();
                if (p.playing)
                    p.pause();
                else
                    p.play();
                b.setAttribute('aria-pressed', String(p.playing));
            });
            this.append(b);
            this.onCleanup(() => b.remove());
        }
        changed(name) {
            if (name === 'src')
                this.json = null;
            super.changed(name);
        }
        mount() {
            this.onCleanup(() => {
                this.player?.destroy();
                this.player = null;
            });
            const inline = this.querySelector('script[type="application/json"]');
            const src = this.str('src');
            if (inline && !this.json)
                this.json = inline.textContent || '';
            if (src && !this.json) {
                fetch(src)
                    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
                    .then((t) => this.isConnected && this.load(t))
                    .catch((err) => this.setAttribute('data-error', String(err.message || err)));
                return;
            }
            this.start();
        }
    }, { id: 'usa-player', text: 'usa-player{display:block;position:relative}usa-player>script{display:none}usa-player [data-player-toggle]{position:absolute;right:8px;bottom:8px}' });
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
    defineTheme();
    definePlayer();
}
/** Register the built-ins and every pack (idempotent). */
function registerAllEffects() {
    registerBuiltinEffects();
    for (const defs of Object.values(EFFECT_PACKS))
        registerEffects(defs);
}

export { ANIMATION_FORMAT, AUDIO_FX, CARD_FX, CLICK_FX, CURSOR_FX, EFFECT_PACKS, GENERATIVE_FX, GESTURES, MICRO_FX, PAGE_FX, PHYSICS_FX, STORY_TEMPLATES, THEMES, THEME_FX, THEME_NAMES, THEME_ROLES, angleDelta, applyTheme, bindBeat, bindGesture, bounceKeyframes, bumpCount, canvasBackground, createBeatDetector, createPlayer, defineAudio, defineEffectElements, defineGestureFx, definePlayer, defineStory, defineTheme, disableAudio, enableAudio, flingVelocity, formatCount, fxLayer, getAudio, hexRgb, normalizeAnimation, onBeat, playThemeEffect, registerAllEffects, registerAudioEffects, registerCardClickEffects, registerCursorEffects, registerGenerativeEffects, registerMicroEffects, registerPageEffects, registerPhysicsEffects, solveSpring, springKeyframes, storyProgress, swapLabel, themeCss, themePreset, themeVars, togglePressed };
//# sourceMappingURL=effects.js.map
