'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var indexTags = require('../chunks/index-tags-hLIF2Clq.cjs');

/**
 * motionary/components/perf — performance toolkit (4.5).
 *
 * - One shared rAF scheduler for every component loop (`onFrame()`, `schedulerStats()`).
 * - Animation budget: `setAnimationBudget(n)` caps concurrent component
 *   animations; extra ones land on their final frame.
 * - `autoDegrade()`: watches frame rate and animation count and steps motion
 *   down (`low`, then a tighter budget) while the device struggles, restoring
 *   it when frames recover.
 * - On-demand CSS: `loadCategoryStyles()` / `onDemandStyles()` — used by
 *   `motionary/components/lite`, the build without inlined CSS.
 */
/**
 * Watch frame rate and animation count; while the device struggles, set
 * motion intensity to `low` and cap concurrent animations at `maxActive / 2`,
 * then restore the previous settings once frames recover. Dispatches
 * `usa:degrade` on `document`. Returns a stop function (restores settings).
 */
function autoDegrade(options = {}) {
    const { minFps = 45, maxActive = 40, sample = 1000, patience = 2, recovery = 3, onChange } = options;
    let frames = 0;
    let elapsed = 0;
    let bad = 0;
    let good = 0;
    let prev = null;
    const state = { degraded: false, fps: 60, active: 0, reason: '' };
    const set = (degraded, reason) => {
        if (degraded === state.degraded)
            return;
        state.degraded = degraded;
        state.reason = reason;
        if (degraded) {
            prev = { intensity: base.getMotionIntensity(), budget: base.animationBudget() };
            base.configureComponents({ motionIntensity: 'low' });
            base.setAnimationBudget(Math.max(4, Math.floor(maxActive / 2)));
        }
        else if (prev) {
            base.configureComponents({ motionIntensity: prev.intensity });
            base.setAnimationBudget(prev.budget);
            prev = null;
        }
        onChange?.({ ...state });
        if (typeof document !== 'undefined')
            document.dispatchEvent(new CustomEvent('usa:degrade', { detail: { ...state } }));
    };
    const stop = base.onFrame((_t, dt) => {
        frames++;
        elapsed += Math.min(dt, 250);
        if (elapsed < sample)
            return;
        state.fps = Math.round((frames * 1000) / elapsed);
        state.active = base.activeAnimations();
        frames = 0;
        elapsed = 0;
        const reason = state.fps < minFps ? 'fps' : state.active > maxActive ? 'count' : '';
        if (reason) {
            good = 0;
            if (++bad >= patience)
                set(true, reason);
        }
        else {
            bad = 0;
            if (++good >= recovery)
                set(false, '');
        }
    });
    return () => {
        stop();
        set(false, '');
    };
}
const TAG_CATEGORY = {};
for (const [cat, tags] of Object.entries(indexTags.COMPONENT_CATEGORIES))
    for (const t of tags)
        TAG_CATEGORY[t] = cat;
/** The category of a default `<usa-*>` tag. */
const categoryOf = (tag) => TAG_CATEGORY[tag];
const loaded = /*#__PURE__*/ new Set();
/**
 * Add `<link rel="stylesheet" href="{base}components/{category}.css">` once.
 * `base` is the URL of the package's `dist/` folder.
 */
function loadCategoryStyles(category, base) {
    if (typeof document === 'undefined' || loaded.has(category))
        return null;
    loaded.add(category);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${base.replace(/\/?$/, '/')}${category === 'all' ? 'components.css' : `components/${category}.css`}`;
    link.setAttribute('data-usa-css', category);
    document.head.appendChild(link);
    return link;
}
/**
 * Load each category's CSS the first time one of its elements connects
 * (custom tags fall back to the full stylesheet). Returns an undo.
 */
function onDemandStyles(base$1) {
    base.setStyleLoader((tag) => loadCategoryStyles(categoryOf(tag) || 'all', base$1));
    return () => base.setStyleLoader(null);
}
/** Categories whose CSS has been requested so far. */
const loadedStyles = () => Array.from(loaded);

exports.activeAnimations = base.activeAnimations;
exports.animationBudget = base.animationBudget;
exports.onFrame = base.onFrame;
exports.schedulerStats = base.schedulerStats;
exports.setAnimationBudget = base.setAnimationBudget;
exports.autoDegrade = autoDegrade;
exports.categoryOf = categoryOf;
exports.loadCategoryStyles = loadCategoryStyles;
exports.loadedStyles = loadedStyles;
exports.onDemandStyles = onDemandStyles;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.0.0/dist/components/perf.cjs.map