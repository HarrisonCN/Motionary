import { registerEffects } from '../chunks/registry-CYojuxi5.js';
import '../chunks/base-zSGb8ujt.js';

const CAMERA_MOVES = ['dolly-in', 'dolly-out', 'pan-left', 'pan-right', 'tilt-up', 'tilt-down', 'zoom-in', 'zoom-out', 'orbit'];
/** Transform of camera `move` at progress `p` (0–1, clamped), `strength` 0–2 (9.1). */
function cameraFrame(move, p, strength = 1) {
    const t = Math.min(1, Math.max(0, p));
    const k = Math.min(2, Math.max(0, strength));
    const f = (n) => Math.round(n * 1000) / 1000;
    switch (move) {
        case 'dolly-in':
            return `scale(${f(1 + 0.18 * k * t)})`;
        case 'dolly-out':
            return `scale(${f(1 + 0.18 * k * (1 - t))})`;
        case 'pan-left':
            return `scale(${f(1 + 0.12 * k)}) translateX(${f(6 * k - 12 * k * t)}%)`;
        case 'pan-right':
            return `scale(${f(1 + 0.12 * k)}) translateX(${f(-6 * k + 12 * k * t)}%)`;
        case 'tilt-up':
            return `scale(${f(1 + 0.12 * k)}) translateY(${f(-6 * k + 12 * k * t)}%)`;
        case 'tilt-down':
            return `scale(${f(1 + 0.12 * k)}) translateY(${f(6 * k - 12 * k * t)}%)`;
        case 'zoom-in':
            return `scale(${f(1 + 0.4 * k * t * t)})`;
        case 'zoom-out':
            return `scale(${f(1 + 0.4 * k * (1 - t) * (1 - t))})`;
        case 'orbit':
            return `perspective(900px) rotateY(${f(-12 * k + 24 * k * t)}deg) scale(${f(1 + 0.08 * k)})`;
        default:
            return 'none';
    }
}
const fade = (el, ctx) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 })?.finished.catch(() => undefined);
const CINEMA_FX = [
    {
        name: 'dolly-in',
        kind: 'enter',
        description: 'A slow camera push: starts slightly large and soft, settles sharp (`duration`).',
        defaults: { duration: 1600 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            return ctx.animate(el, [{ transform: 'scale(1.14)', filter: 'blur(6px)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'scale(1)', filter: 'blur(0)', opacity: 1 }], { duration: o.duration, delay: o.delay, easing: 'cubic-bezier(.16,.84,.3,1)', fill: 'backwards' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'pan-reveal',
        kind: 'enter',
        description: 'The camera pans across the element while a wipe uncovers it (`from`).',
        defaults: { from: 'left', duration: 1200 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            const r = o.from === 'right';
            return ctx.animate(el, [{ clipPath: r ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', transform: `translateX(${r ? 4 : -4}%) scale(1.06)` }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }], { duration: o.duration, delay: o.delay, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'letterbox',
        kind: 'enter',
        description: 'Cinema bars slide in, hold, then open up to reveal the element (`hold`).',
        defaults: { duration: 1400, hold: 0.35 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            const h = Math.min(0.8, Math.max(0, Number(o.hold) || 0));
            const a = 0.25;
            const b = Math.min(0.95, a + h);
            return ctx.animate(el, [{ clipPath: 'inset(50% 0 50% 0)', opacity: 0.6 }, { clipPath: 'inset(12% 0 12% 0)', opacity: 1, offset: a }, { clipPath: 'inset(12% 0 12% 0)', offset: b }, { clipPath: 'inset(0 0 0 0)' }], { duration: o.duration, delay: o.delay, easing: 'ease-in-out', fill: 'backwards' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'rack-focus',
        kind: 'attention',
        description: "Focus pulls from the element's first child to the rest and back, like racking focus between subjects.",
        defaults: { duration: 1800 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const kids = Array.from(el.children);
            if (kids.length < 2)
                return ctx.animate(el, [{ filter: 'blur(0)' }, { filter: 'blur(4px)', offset: 0.5 }, { filter: 'blur(0)' }], { duration: o.duration })?.finished.catch(() => undefined);
            const [first, ...rest] = kids;
            const runs = [ctx.animate(first, [{ filter: 'blur(0)' }, { filter: 'blur(5px)', offset: 0.35 }, { filter: 'blur(5px)', offset: 0.65 }, { filter: 'blur(0)' }], { duration: o.duration, easing: 'ease-in-out' }), ...rest.map((k) => ctx.animate(k, [{ filter: 'blur(5px)' }, { filter: 'blur(0)', offset: 0.35 }, { filter: 'blur(0)', offset: 0.65 }, { filter: 'blur(5px)' }, { filter: 'blur(0)' }], { duration: o.duration, easing: 'ease-in-out' }))];
            return Promise.all(runs.map((r) => r?.finished.catch(() => undefined))).then(() => undefined);
        },
    },
];
/** Register dolly-in, pan-reveal, letterbox and rack-focus (9.1). */
function registerCinemaPack() {
    registerEffects(CINEMA_FX);
}

export { CAMERA_MOVES, CINEMA_FX, cameraFrame, registerCinemaPack };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.3.0/dist/components/fx-cinema.js.map