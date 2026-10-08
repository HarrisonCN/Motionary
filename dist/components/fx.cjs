'use strict';

var base = require('../chunks/base-BaQV-2ha.cjs');
var core = require('../chunks/core-BGAyaY6L.cjs');
var fx = require('../chunks/fx-lBGVtQO1.cjs');
require('./tokens.cjs');

/**
 * 5.0 — unified plugin-style effect registration. Every effect (built-in or
 * yours) is a plain object registered once and played the same way:
 * `playEffect(el, name)`, `bindEffect(el, name, { trigger })` or
 * `<usa-fx effect="name" trigger="click">`. Effects get a context that
 * already applies reduced motion, motion sensitivity, intensity and the
 * animation budget.
 */
const EFFECT_KINDS = ['enter', 'exit', 'attention', 'click', 'hover', 'card', 'loop', 'page', 'background', 'text', 'cursor', 'scroll'];
const EFFECT_TRIGGERS = ['click', 'hover', 'enter', 'load', 'loop', 'manual'];
const registry = new Map();
/** Register an effect (throws on a duplicate name unless `override`). Returns an unregister function. */
function registerEffect(def, opts = {}) {
    if (!/^[a-z][a-z0-9-]*$/.test(def.name))
        throw new Error(`[motionary] invalid effect name "${def.name}"`);
    if (!EFFECT_KINDS.includes(def.kind))
        throw new Error(`[motionary] unknown effect kind "${def.kind}"`);
    if (registry.has(def.name) && !opts.override)
        throw new Error(`[motionary] effect "${def.name}" is already registered`);
    registry.set(def.name, def);
    return () => {
        if (registry.get(def.name) === def)
            registry.delete(def.name);
    };
}
/** Register several effects at once (already-registered names are skipped). */
function registerEffects(defs) {
    for (const d of defs)
        if (!registry.has(d.name))
            registerEffect(d);
}
const getEffect = (name) => registry.get(name);
const hasEffect = (name) => registry.has(name);
/** Registered effects (optionally of one kind), sorted by name. */
function listEffects(kind) {
    return Array.from(registry.values())
        .filter((d) => !kind || d.kind === kind)
        .sort((a, b) => a.name.localeCompare(b.name));
}
const SKIP_BY_DEFAULT = ['loop', 'background', 'cursor'];
function context(event) {
    const cleanups = [];
    return {
        reduced: base.prefersReducedMotion(),
        sensitivity: base.getMotionSensitivity(),
        event,
        animate: base.animateWithMotion,
        onCleanup: (fn) => cleanups.push(fn),
        cleanups,
    };
}
/**
 * Play a registered effect once on `el`. Resolves when it finishes (or
 * immediately for fire-and-forget effects). Unknown names reject.
 */
async function playEffect(el, name, options = {}, event) {
    const def = registry.get(name);
    if (!def)
        throw new Error(`[motionary] unknown effect "${name}" — registered: ${Array.from(registry.keys()).join(', ')}`);
    const ctx = context(event);
    if (ctx.reduced && (def.reduced ?? (SKIP_BY_DEFAULT.includes(def.kind) ? 'skip' : 'run')) === 'skip')
        return;
    const out = def.run(el, { ...(def.defaults || {}), ...options }, ctx);
    if (out && typeof out.finished?.then === 'function')
        await out.finished.catch(() => undefined);
    else if (out && typeof out.then === 'function')
        await out;
}
/**
 * Bind an effect to a trigger on `el`: `click`, `hover` (pointerenter / focus),
 * `enter` (scrolls into view; `once` by default), `load` (now), `loop`
 * (starts now, cleanup stops it) or `manual` (nothing). Returns an unbind.
 */
function bindEffect(el, name, options = {}) {
    const { trigger = 'click', once, ...opts } = options;
    const def = registry.get(name);
    if (!def)
        throw new Error(`[motionary] unknown effect "${name}"`);
    const offs = [];
    let current = null;
    const fire = (e) => {
        const ctx = context(e);
        if (ctx.reduced && (def.reduced ?? (SKIP_BY_DEFAULT.includes(def.kind) ? 'skip' : 'run')) === 'skip')
            return;
        // A persistent effect (returns a cleanup) replaces its previous run instead of stacking.
        current?.();
        current = null;
        const out = def.run(el, { ...(def.defaults || {}), ...opts }, ctx);
        const stops = [...ctx.cleanups, ...(typeof out === 'function' ? [out] : [])];
        if (stops.length)
            current = () => stops.splice(0).forEach((f) => f());
    };
    offs.push(() => {
        current?.();
        current = null;
    });
    const on = (type, opt) => {
        el.addEventListener(type, fire, opt);
        offs.push(() => el.removeEventListener(type, fire, opt));
    };
    if (trigger === 'click')
        on('click', { once: !!once });
    else if (trigger === 'hover')
        (on('pointerenter'), on('focusin'));
    else if (trigger === 'load' || trigger === 'loop')
        fire();
    else if (trigger === 'enter' && typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver((entries) => {
            for (const en of entries)
                if (en.isIntersecting) {
                    fire();
                    if (once !== false)
                        io.disconnect();
                }
        }, { threshold: 0.15 });
        io.observe(el);
        offs.push(() => io.disconnect());
    }
    return () => offs.splice(0).reverse().forEach((f) => f());
}

function defineFx(tag = 'usa-fx') {
    return base.defineElement(tag, (Base) => class UsaFx extends Base {
        static get observedAttributes() {
            return ['effect', 'trigger', 'options'];
        }
        get target() {
            return this.flag('self') ? this : (this.firstElementChild || this);
        }
        opts() {
            try {
                return JSON.parse(this.str('options', '{}')) || {};
            }
            catch {
                return {};
            }
        }
        play() {
            return playEffect(this.target, this.str('effect', 'pop'), this.opts()).catch(() => undefined);
        }
        mount() {
            if (!this.style.display)
                this.style.display = 'inline-block';
            const name = this.str('effect', 'pop');
            const t = this.str('trigger', 'click');
            try {
                this.onCleanup(bindEffect(this.target, name, { ...this.opts(), trigger: EFFECT_TRIGGERS.includes(t) ? t : 'click', once: this.flag('once') }));
                this.removeAttribute('data-unknown');
            }
            catch {
                this.setAttribute('data-unknown', name); // not registered (yet)
            }
        }
    });
}

/**
 * 5.0 built-in effects, all registered through `registerEffect()`:
 * every timeline preset as an `enter` effect, attention seekers, and the
 * click effects (burst, confetti, shake, ripple).
 */
const enter = Object.entries(core.TIMELINE_PRESETS).map(([name, frames]) => ({
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

/**
 * motionary/components/fx — unified plugin-style effects (5.0).
 * `registerEffect({ name, kind, run })`, `playEffect(el, name)`,
 * `bindEffect(el, name, { trigger })`, `<usa-fx effect trigger>`. Built-ins:
 * every timeline preset (`enter`), `pulse` · `pop` · `jelly` · `wiggle` ·
 * `heartbeat` · `bounce` · `flash` · `tada` · `shake` (attention),
 * `burst` · `confetti` · `ripple` (click). More packs: `motionary/components/effects`.
 */
/** Register the built-in effects (idempotent; `defineFxComponents()` calls it). */
function registerBuiltinEffects() {
    registerEffects(BUILTIN_EFFECTS);
}
/** Register every component of this category under its default tag (+ the built-in effects). */
function defineFxComponents() {
    registerBuiltinEffects();
    defineFx();
}

exports.BUILTIN_EFFECTS = BUILTIN_EFFECTS;
exports.EFFECT_KINDS = EFFECT_KINDS;
exports.EFFECT_TRIGGERS = EFFECT_TRIGGERS;
exports.bindEffect = bindEffect;
exports.defineFx = defineFx;
exports.defineFxComponents = defineFxComponents;
exports.getEffect = getEffect;
exports.hasEffect = hasEffect;
exports.listEffects = listEffects;
exports.playEffect = playEffect;
exports.registerBuiltinEffects = registerBuiltinEffects;
exports.registerEffect = registerEffect;
exports.registerEffects = registerEffects;
//# sourceMappingURL=fx.cjs.map
