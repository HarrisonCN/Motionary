import { R as RUNTIME_VERSION, r as register } from './chunks/registry-jF8VIA_9.js';
export { a as RUNTIME_CDN, b as RuntimeModuleError, h as hasModule, m as missingMessage, c as moduleCdn, d as modulePath, e as registeredModules, f as registry, g as requireModule } from './chunks/registry-jF8VIA_9.js';
import { s as steps, c as cubicBezier, p as parseEase, E as EASES, T as Timeline, a as Tween, t as timeline, g as getTicker, b as tween$1 } from './chunks/tween-DDObu9iA.js';
export { P as Playable, d as parseValue } from './chunks/tween-DDObu9iA.js';

/**
 * `motionary/runtime` (10.1) — Motionary's own zero-dependency animation
 * runtime, the one prerequisite for runtime-powered components:
 *
 * - shared **ticker** (`getTicker()`): one rAF loop for everything;
 * - **tween + timeline** engine with easing (`tween()`, `timeline()`, `EASES`, `cubicBezier()`);
 * - **module registry** (`use()`, `requireModule()`, `hasModule()`) with a
 *   clear `RuntimeModuleError` (install / import / CDN instructions) when a
 *   component needs a module that was not registered.
 *
 * Every other module lives at its own subpath (`motionary/runtime/format-css`,
 * `motionary/runtime/format-motion`, …) so you only pay for what you import.
 * SSR-safe (no `window` access at import) and usable in Web Workers.
 *
 * ```ts
 * import { use, tween } from 'motionary/runtime';
 * use();                                   // registers the core (components can now find it)
 * tween('.box', { to: { x: 120, opacity: 1 }, duration: 500, ease: 'back-out' });
 * ```
 */
/** The core as a module object. */
const core = {
    id: 'core',
    version: RUNTIME_VERSION,
    api: { version: RUNTIME_VERSION, getTicker, tween, timeline, Tween, Timeline, EASES, parseEase, cubicBezier, steps },
};
/** Tween targets (objects, elements, lists or a CSS selector). See `TweenOptions`. */
function tween(target, o) {
    return tween$1(resolveTargets(target), o);
}
/** Selector strings become element lists (only where `document` exists). */
function resolveTargets(t) {
    if (typeof t === 'string') {
        if (typeof document === 'undefined')
            throw new Error('[motionary] selector targets need a document — pass objects or elements instead');
        return Array.from(document.querySelectorAll(t));
    }
    return t;
}
/**
 * Register the core plus any modules (`use(formatCss, formatMotion)`).
 * Call once at start-up, before runtime-powered components mount.
 */
function use(...mods) {
    return register(core, ...mods);
}

export { EASES, RUNTIME_VERSION, Timeline, Tween, core, cubicBezier, getTicker, parseEase, register, resolveTargets, steps, timeline, tween, use };
//# sourceMappingURL=runtime.js.map
