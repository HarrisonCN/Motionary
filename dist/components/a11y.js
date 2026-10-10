import { B as deprecate, F as FOCUSABLE, g as getMotionSensitivity, M as MOTION_SENSITIVITY_LEVELS, c as configureComponents, C as adoptStyles } from '../chunks/base-nzeN_ux7.js';
export { l as adaptKeyframes } from '../chunks/base-nzeN_ux7.js';
import { C as COMPONENT_CATEGORIES } from '../chunks/index-tags-B-JBecYg.js';

/**
 * 4.9 — the 5.0 modern-browser baseline. `baselineReport()` lists which
 * required / progressive features this browser has; `warnBaseline()` logs
 * once in development when a required one is missing.
 */
/** Required in 5.0: Custom Elements, WAAPI, IntersectionObserver, ResizeObserver, adoptedStyleSheets. Progressive: View Transitions, scroll-driven animations, WebGL. */
function baselineReport() {
    const w = (typeof window !== 'undefined' ? window : {});
    const d = (typeof document !== 'undefined' ? document : {});
    const css = (q) => typeof w.CSS?.supports === 'function' && w.CSS.supports(q);
    return [
        { id: 'custom-elements', required: true, supported: !!w.customElements },
        { id: 'web-animations', required: true, supported: typeof w.Element?.prototype?.animate === 'function' },
        { id: 'intersection-observer', required: true, supported: typeof w.IntersectionObserver === 'function' },
        { id: 'resize-observer', required: true, supported: typeof w.ResizeObserver === 'function' },
        { id: 'adopted-stylesheets', required: true, supported: 'adoptedStyleSheets' in d },
        { id: 'view-transitions', required: false, supported: typeof d.startViewTransition === 'function' },
        { id: 'scroll-driven-animations', required: false, supported: css('animation-timeline: view()') },
        { id: 'webgl', required: false, supported: !!(d.createElement && (() => { try {
                return d.createElement('canvas').getContext('webgl');
            }
            catch {
                return null;
            } })()) },
    ];
}
/** Log (once) which required 5.0 features are missing here. Returns the missing ids. */
function warnBaseline() {
    const missing = baselineReport().filter((f) => f.required && !f.supported).map((f) => f.id);
    if (missing.length)
        deprecate('baseline', `this browser lacks ${missing.join(', ')}; motionary 5.0 requires them (modern-browser baseline, see docs/upgrading-5.md).`);
    return missing;
}

/**
 * motionary/components/a11y — accessibility toolkit (4.4).
 *
 * - Motion-sensitivity levels: `setMotionSensitivity('full' | 'gentle' | 'minimal' | 'static')`.
 * - Static alternatives: what every component shows when motion is off, and
 *   `staticAlternative(root)` to freeze any subtree at its final state.
 * - `aria-live` conventions: one shared polite and one assertive region,
 *   `announce(message, { politeness })`.
 * - `auditMotionA11y(root)`: the rules the automated regression tests run
 *   over every `<usa-*>` element — usable in your own tests too.
 *
 * ```ts
 * import { setMotionSensitivity, announce, auditMotionA11y } from 'motionary/components/a11y';
 * setMotionSensitivity('gentle', true);           // no spins / zooms / parallax, remembered
 * announce('3 items added to cart');               // polite live region
 * expect(auditMotionA11y(document.body).errors).toEqual([]);
 * ```
 */
const KEY = 'usa:sensitivity';
/** What each level allows, for docs and settings UIs. */
const MOTION_SENSITIVITY = {
    full: { en: 'All motion', zh: '全部动效', allows: ['fade', 'translate', 'scale', 'rotate', 'parallax', 'loop', 'flash'] },
    gentle: { en: 'Gentle — no spins, zooms or parallax', zh: '温和 —— 无旋转、缩放与视差', allows: ['fade', 'translate', 'loop'] },
    minimal: { en: 'Minimal — fades only', zh: '最少 —— 仅淡入淡出', allows: ['fade'] },
    static: { en: 'Static — no animation', zh: '静态 —— 无动画', allows: [] },
};
/** CSS applied at the `static` / `minimal` / `gentle` levels (also stops your own CSS animations under `static`). */
const SENSITIVITY_CSS = 'html[data-usa-sensitivity="static"] *,html[data-usa-sensitivity="static"] *::before,html[data-usa-sensitivity="static"] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' +
    'html[data-usa-sensitivity="minimal"] *,html[data-usa-sensitivity="minimal"] *::before,html[data-usa-sensitivity="minimal"] *::after{animation-duration:1ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}' +
    'html[data-usa-sensitivity="gentle"]{--usa-parallax:0;--usa-tilt:0}';
/**
 * Set the motion-sensitivity level for every `<usa-*>` component and the page:
 * sets `data-usa-sensitivity` on `<html>`, adapts component keyframes, and
 * with `persist` remembers the choice (`restoreMotionSensitivity()`).
 * Dispatches `usa:sensitivity` on `document`.
 */
function setMotionSensitivity(level, persist = false) {
    if (!MOTION_SENSITIVITY_LEVELS.includes(level))
        return;
    configureComponents({ motionSensitivity: level });
    adoptStyles('a11y-sensitivity', SENSITIVITY_CSS);
    if (persist) {
        try {
            localStorage.setItem(KEY, level);
        }
        catch {
            /* private mode */
        }
    }
    if (level === 'static' && typeof document !== 'undefined')
        staticAlternative(document.documentElement);
    if (typeof document !== 'undefined')
        document.dispatchEvent(new CustomEvent('usa:sensitivity', { detail: { level } }));
}
/** Re-apply a persisted level (call early on page load). Returns the active level. */
function restoreMotionSensitivity() {
    try {
        const v = localStorage.getItem(KEY);
        if (v && MOTION_SENSITIVITY_LEVELS.includes(v))
            setMotionSensitivity(v);
    }
    catch {
        /* ignore */
    }
    return getMotionSensitivity();
}
/** `true` when the current level allows a kind of motion (`'rotate'`, `'parallax'`, `'loop'`…). */
function motionAllowed(kind, level = getMotionSensitivity()) {
    return MOTION_SENSITIVITY[level].allows.includes(kind);
}
/** The static alternative of each category: what its elements show without motion. */
const STATIC_ALTERNATIVES = {
    reveal: 'Content visible in place; progress bars show the current value.',
    text: 'Full final text (screen readers always get a plain copy).',
    interaction: 'Normal hover / focus styles; no tilt, magnet or ripple.',
    feedback: 'Spinners become a static busy indicator; progress shows its value; toasts appear without sliding.',
    background: 'A still frame of the background (gradient / pattern); particles and marquees stop.',
    transitions: 'Dialogs, accordions and views switch instantly.',
    physics: 'Values jump to their target; drag still works, without inertia.',
    cards: 'Cards are shown flat and fully readable; stacks become lists.',
    click: 'Clicks work and states are announced; no bursts, confetti or deformation.',
    ui: 'Tabs, drawers, sheets and popovers open instantly with focus management intact.',
    page: 'Page transitions are instant; cursors and ambient layers are hidden.',
    timeline: 'Every step is shown at its final state.',
    gesture: 'Buttons / keys provide the same actions as swipes and pinches.',
    svg: 'Drawings and icons are shown complete.',
    webgl: 'A static poster image or CSS gradient instead of the shader.',
    depth: 'Flat, front-facing layout.',
    layout: 'Items reflow instantly.',
    packs: 'Roles are styled but not animated.',
    fx: 'Effects are skipped or reduced to a short fade; the content is unchanged.',
};
/**
 * Freeze a subtree at its static alternative: finishes running animations
 * (`finish()`, so content lands on its final state), marks the root with
 * `data-usa-static` and returns an undo that removes the mark.
 */
function staticAlternative(root) {
    const getAll = root.getAnimations;
    if (typeof getAll === 'function') {
        for (const a of getAll.call(root, { subtree: true })) {
            try {
                const it = a.effect?.getComputedTiming().iterations;
                if (it === Infinity)
                    a.cancel();
                else
                    a.finish();
            }
            catch {
                /* finished already */
            }
        }
    }
    root.setAttribute('data-usa-static', '');
    return () => root.removeAttribute('data-usa-static');
}
/** The ids of the shared live regions. */
const LIVE_REGION_IDS = { polite: 'usa-live-polite', assertive: 'usa-live-assertive' };
/** The shared live region (created once, visually hidden, `role="status"` / `role="alert"`). */
function liveRegion(politeness = 'polite') {
    if (typeof document === 'undefined' || !document.body)
        return null;
    const id = LIVE_REGION_IDS[politeness];
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.className = 'usa-sr';
        el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
        el.setAttribute('aria-live', politeness);
        el.setAttribute('aria-atomic', 'true');
        document.body.appendChild(el);
    }
    return el;
}
let lastMsg = '';
let lastAt = 0;
/**
 * Announce a message through the shared live region. Conventions: `polite`
 * for results of the user's own actions (added, saved, copied), `assertive`
 * only for errors that block them. Identical messages within `dedupe` ms
 * (default 500) are dropped; the region is cleared first so repeats are read.
 */
function announce(message, options = {}) {
    const { politeness = 'polite', dedupe = 500 } = options;
    const t = Date.now();
    if (!message || (message === lastMsg && t - lastAt < dedupe))
        return false;
    lastMsg = message;
    lastAt = t;
    const el = liveRegion(politeness);
    if (!el)
        return false;
    el.textContent = '';
    el.textContent = message;
    return true;
}
const NAMED_ROLES = ['button', 'switch', 'checkbox', 'slider', 'tab', 'progressbar', 'radiogroup', 'dialog'];
function accessibleName(el) {
    const label = el.getAttribute('aria-label');
    if (label)
        return label;
    const by = el.getAttribute('aria-labelledby');
    if (by)
        return by.split(/\s+/).map((id) => el.ownerDocument.getElementById(id)?.textContent || '').join(' ').trim();
    return (el.textContent || el.getAttribute('title') || '').trim();
}
/**
 * Check a subtree against the library's motion-a11y rules:
 * - `aria-hidden-focusable` (error): focusable content inside `aria-hidden`.
 * - `role-name` (error): a widget role without an accessible name.
 * - `range-value` (error): a slider / determinate progressbar without `aria-valuenow`.
 * - `img-alt` (error): an `<img>` without `alt`.
 * - `assertive-live` (warning): `aria-live="assertive"` outside `role="alert"`.
 * - `infinite-no-control` (warning, WCAG 2.2.2): an endless animation on a
 *   page with no way to pause motion (`<usa-motion-switch>` or `[data-usa-pause]`).
 */
function auditMotionA11y(root) {
    const issues = [];
    const add = (rule, level, element, message) => issues.push({ rule, level, element, message });
    const scope = root;
    scope.querySelectorAll('[aria-hidden="true"]').forEach((h) => {
        const f = (h.matches(FOCUSABLE) ? [h] : Array.from(h.querySelectorAll(FOCUSABLE))).filter((x) => !x.closest('[inert]'));
        f.forEach((x) => add('aria-hidden-focusable', 'error', x, `focusable <${x.tagName.toLowerCase()}> inside aria-hidden`));
    });
    scope.querySelectorAll('[role]').forEach((el) => {
        const role = el.getAttribute('role');
        if (NAMED_ROLES.includes(role) && !accessibleName(el))
            add('role-name', 'error', el, `role="${role}" has no accessible name`);
        if (role === 'slider' && !el.hasAttribute('aria-valuenow'))
            add('range-value', 'error', el, 'slider without aria-valuenow');
    });
    scope.querySelectorAll('img:not([alt])').forEach((el) => add('img-alt', 'error', el, '<img> without alt'));
    scope.querySelectorAll('[aria-live="assertive"]').forEach((el) => {
        if (el.getAttribute('role') !== 'alert')
            add('assertive-live', 'warning', el, 'assertive live region outside role="alert"');
    });
    const doc = root.ownerDocument || root;
    const anims = typeof root.getAnimations === 'function' ? root.getAnimations({ subtree: true }) : [];
    const control = doc && (doc.querySelector('usa-motion-switch, [data-usa-pause]') || doc.documentElement.hasAttribute('data-usa-sensitivity'));
    if (!control)
        anims.forEach((a) => {
            try {
                if (a.effect?.getComputedTiming().iterations === Infinity) {
                    const t = a.effect.target;
                    if (t)
                        add('infinite-no-control', 'warning', t, 'endless animation and no motion control on the page');
                }
            }
            catch {
                /* ignore */
            }
        });
    return { errors: issues.filter((i) => i.level === 'error'), warnings: issues.filter((i) => i.level === 'warning') };
}
/** Every `<usa-*>` tag, for sweeping audits. */
const ALL_TAGS = Object.values(COMPONENT_CATEGORIES).flat();

export { ALL_TAGS, LIVE_REGION_IDS, MOTION_SENSITIVITY, MOTION_SENSITIVITY_LEVELS, SENSITIVITY_CSS, STATIC_ALTERNATIVES, announce, auditMotionA11y, baselineReport, getMotionSensitivity, liveRegion, motionAllowed, restoreMotionSensitivity, setMotionSensitivity, staticAlternative, warnBaseline };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.1.0/dist/components/a11y.js.map