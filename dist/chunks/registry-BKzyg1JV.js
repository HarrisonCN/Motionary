import { e as animateWithMotion, g as getMotionSensitivity, p as prefersReducedMotion } from './base-BTev8qxg.js';

var _a;
const EFFECT_KINDS = ['enter', 'exit', 'attention', 'click', 'hover', 'card', 'loop', 'page', 'background', 'text', 'cursor', 'scroll'];
const EFFECT_TRIGGERS = ['click', 'hover', 'enter', 'load', 'loop', 'manual'];
// 6.2: one table per page (Symbol.for), shared by every bundle that registers effects —
// e.g. dist/components.umd.js and dist/widgets.umd.js on the same page.
const REG_KEY = Symbol.for('use-scroll-animate.effects');
const registry = ((_a = globalThis)[REG_KEY] || (_a[REG_KEY] = new Map()));
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
        reduced: prefersReducedMotion(),
        sensitivity: getMotionSensitivity(),
        event,
        animate: animateWithMotion,
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

export { EFFECT_KINDS, EFFECT_TRIGGERS, bindEffect, getEffect, hasEffect, listEffects, playEffect, registerEffect, registerEffects };
//# sourceMappingURL=registry-BKzyg1JV.js.map
