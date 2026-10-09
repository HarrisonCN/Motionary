'use strict';

var core = require('./core-KIvPGg0c.cjs');
var fx = require('./fx-BaPAanPW.cjs');

/**
 * 5.0 built-in effects, all registered through `registerEffect()`:
 * every timeline preset as an `enter` effect, attention seekers, and the
 * click effects (burst, confetti, shake, ripple).
 */
const enter = /*#__PURE__*/ Object.entries(core.TIMELINE_PRESETS).map(([name, frames]) => ({
    name,
    kind: 'enter',
    description: `Entrance: ${name} (same keyframes as the timeline preset).`,
    defaults: { duration: 600, delay: 0, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    run: (el, o, ctx) => ctx.animate(el, ctx.reduced ? [{ opacity: 0 }, { opacity: 1 }] : frames, { duration: o.duration, delay: o.delay, easing: o.easing, fill: 'backwards' }),
}));
const A = (name, description, frames, duration = 700, easing = 'ease-in-out') => ({
    name,
    kind: 'attention',
    description,
    defaults: { duration, iterations: 1 },
    run: (el, o, ctx) => (ctx.reduced ? ctx.animate(el, [{ opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }], { duration: 400 }) : ctx.animate(el, frames, { duration: o.duration, easing, iterations: o.iterations })),
});
const attention = [
    A('pulse', 'Gentle scale pulse.', [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], 600),
    A('pop', 'Quick overshoot pop.', [{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: 0.4 }, { transform: 'scale(0.96)', offset: 0.7 }, { transform: 'scale(1)' }], 450, 'cubic-bezier(0.34, 1.56, 0.64, 1)'),
    A('jelly', 'Rubbery squash-and-stretch.', [{ transform: 'scale(1,1)' }, { transform: 'scale(1.25,0.75)', offset: 0.3 }, { transform: 'scale(0.75,1.25)', offset: 0.4 }, { transform: 'scale(1.15,0.85)', offset: 0.5 }, { transform: 'scale(0.95,1.05)', offset: 0.65 }, { transform: 'scale(1.05,0.95)', offset: 0.75 }, { transform: 'scale(1,1)' }], 900),
    A('wiggle', 'Playful rotate wiggle.', [{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)', offset: 0.2 }, { transform: 'rotate(7deg)', offset: 0.4 }, { transform: 'rotate(-5deg)', offset: 0.6 }, { transform: 'rotate(3deg)', offset: 0.8 }, { transform: 'rotate(0)' }], 650),
    A('heartbeat', 'Double-beat heart pulse.', [{ transform: 'scale(1)' }, { transform: 'scale(1.2)', offset: 0.14 }, { transform: 'scale(1)', offset: 0.28 }, { transform: 'scale(1.2)', offset: 0.42 }, { transform: 'scale(1)', offset: 0.7 }], 1100),
    A('bounce', 'Hop up and settle with a squash.', [{ transform: 'translateY(0) scale(1,1)' }, { transform: 'translateY(-22px) scale(0.95,1.05)', offset: 0.35 }, { transform: 'translateY(0) scale(1.08,0.92)', offset: 0.6 }, { transform: 'translateY(-6px) scale(1,1)', offset: 0.8 }, { transform: 'translateY(0) scale(1,1)' }], 800),
    A('flash', 'Two soft flashes (well under 3 per second).', [{ opacity: 1 }, { opacity: 0.25, offset: 0.25 }, { opacity: 1, offset: 0.5 }, { opacity: 0.25, offset: 0.75 }, { opacity: 1 }], 1400),
    A('tada', 'Scale + shake celebration.', [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(0.9) rotate(-3deg)', offset: 0.1 }, { transform: 'scale(1.1) rotate(3deg)', offset: 0.3 }, { transform: 'scale(1.1) rotate(-3deg)', offset: 0.5 }, { transform: 'scale(1.1) rotate(3deg)', offset: 0.7 }, { transform: 'scale(1) rotate(0)' }], 1000),
];
const click = [
    {
        name: 'burst',
        kind: 'click',
        description: 'Particle burst from the click point (or `x` / `y`, or the element center).',
        defaults: { count: 12 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const r = el.getBoundingClientRect();
            const e = ctx.event;
            fx.burst(o.x ?? e?.clientX ?? r.left + r.width / 2, o.y ?? e?.clientY ?? r.top + r.height / 2, o);
        },
    },
    {
        name: 'confetti',
        kind: 'click',
        description: 'Confetti cannon from the element.',
        defaults: { count: 80 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const r = el.getBoundingClientRect();
            fx.confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...o });
        },
    },
    {
        name: 'shake',
        kind: 'attention',
        description: 'Horizontal "no" shake (errors, wrong password).',
        defaults: { intensity: 8, duration: 480 },
        run: (el, o, ctx) => (ctx.reduced ? ctx.animate(el, [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }], { duration: 300 }) : fx.shake(el, o.intensity, o.duration)),
    },
    {
        name: 'ripple',
        kind: 'click',
        description: 'Material-style ink ripple from the pointer.',
        defaults: { color: 'currentColor', duration: 600 },
        run: (el, o, ctx) => {
            var _a;
            if (ctx.reduced)
                return;
            const r = el.getBoundingClientRect();
            const e = ctx.event;
            const d = Math.hypot(r.width, r.height) * 2;
            const dot = document.createElement('span');
            dot.setAttribute('aria-hidden', 'true');
            Object.assign(dot.style, { position: 'absolute', left: `${(e?.clientX ?? r.left + r.width / 2) - r.left - d / 2}px`, top: `${(e?.clientY ?? r.top + r.height / 2) - r.top - d / 2}px`, width: `${d}px`, height: `${d}px`, borderRadius: '50%', background: o.color, opacity: '0.25', pointerEvents: 'none' });
            if (getComputedStyle(el).position === 'static')
                el.style.position = 'relative';
            (_a = el.style).overflow || (_a.overflow = 'hidden');
            el.appendChild(dot);
            const a = ctx.animate(dot, [{ transform: 'scale(0)', opacity: 0.3 }, { transform: 'scale(1)', opacity: 0 }], { duration: o.duration, easing: 'ease-out' });
            const done = () => dot.remove();
            if (a)
                a.finished.then(done, done);
            else
                done();
            return a;
        },
    },
];
/** Every built-in 5.0 effect definition. */
const BUILTIN_EFFECTS = [...enter, ...attention, ...click];

exports.BUILTIN_EFFECTS = BUILTIN_EFFECTS;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.3.0/dist/chunks/builtins-Cz3iufK6.cjs.map