'use strict';

var registry = require('./chunks/registry-VKfDCYYI.cjs');
var ticker = require('./chunks/ticker-Bx4j1lSk.cjs');
var tween$1 = require('./chunks/tween-DjySqWFm.cjs');
var ease = require('./chunks/ease-HwYZnZat.cjs');

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
    version: registry.RUNTIME_VERSION,
    tier: 'basic',
    api: { version: registry.RUNTIME_VERSION, getTicker: ticker.getTicker, tween, timeline: tween$1.timeline, Tween: tween$1.Tween, Timeline: tween$1.Timeline, EASES: ease.EASES, parseEase: ease.parseEase, cubicBezier: ease.cubicBezier, steps: ease.steps },
};
/** Tween targets (objects, elements, lists or a CSS selector). See `TweenOptions`. */
function tween(target, o) {
    return tween$1.tween(resolveTargets(target), o);
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
    return registry.register(core, ...mods);
}

exports.RUNTIME_CDN = registry.RUNTIME_CDN;
exports.RUNTIME_TIERS = registry.RUNTIME_TIERS;
exports.RUNTIME_VERSION = registry.RUNTIME_VERSION;
exports.RuntimeModuleError = registry.RuntimeModuleError;
exports.TIER_ORDER = registry.TIER_ORDER;
exports.hasModule = registry.hasModule;
exports.maxTier = registry.maxTier;
exports.missingMessage = registry.missingMessage;
exports.moduleCdn = registry.moduleCdn;
exports.modulePath = registry.modulePath;
exports.register = registry.register;
exports.registeredModules = registry.registeredModules;
exports.registry = registry.registry;
exports.requireModule = registry.requireModule;
exports.tierOf = registry.tierOf;
exports.getTicker = ticker.getTicker;
exports.Playable = tween$1.Playable;
exports.Timeline = tween$1.Timeline;
exports.Tween = tween$1.Tween;
exports.parseValue = tween$1.parseValue;
exports.timeline = tween$1.timeline;
exports.EASES = ease.EASES;
exports.cubicBezier = ease.cubicBezier;
exports.parseEase = ease.parseEase;
exports.steps = ease.steps;
exports.core = core;
exports.resolveTargets = resolveTargets;
exports.tween = tween;
exports.use = use;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.3.0/dist/runtime.cjs.map