type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
declare const MOTION_SENSITIVITY_LEVELS: readonly MotionSensitivity[];
/** The current motion-sensitivity level (v4.4). */
declare function getMotionSensitivity(): MotionSensitivity;
/**
 * Adapt keyframes to the sensitivity level: `gentle` drops transforms that
 * spin, zoom or skew (and 3D), `minimal` keeps opacity only, `static` keeps
 * just the final frame. `full` returns them unchanged.
 */
declare function adaptKeyframes(frames: Keyframe[], level?: MotionSensitivity): Keyframe[];

/** The component categories and their default tags. */
declare const COMPONENT_CATEGORIES: {
    readonly reveal: readonly ["usa-reveal", "usa-stagger", "usa-scroll-progress", "usa-scrolly"];
    readonly text: readonly ["usa-typewriter", "usa-split-text", "usa-scramble", "usa-counter", "usa-shimmer-text", "usa-text-rotate", "usa-wave-text", "usa-glitch", "usa-gradient-text", "usa-handwriting", "usa-scroll-highlight"];
    readonly interaction: readonly ["usa-ripple", "usa-magnetic", "usa-tilt", "usa-spotlight", "usa-press"];
    readonly feedback: readonly ["usa-spinner", "usa-skeleton", "usa-progress", "usa-toaster", "usa-check"];
    readonly background: readonly ["usa-aurora", "usa-particles", "usa-grain", "usa-marquee", "usa-acrylic", "usa-grid-glow", "usa-blobs", "usa-water-ripple", "usa-dot-network"];
    readonly transitions: readonly ["usa-dialog", "usa-accordion", "usa-view-switch"];
    readonly physics: readonly ["usa-spring", "usa-draggable", "usa-overscroll"];
    readonly cards: readonly ["usa-card", "usa-card-stack", "usa-sticky-stack", "usa-carousel-3d"];
    readonly click: readonly ["usa-click", "usa-button", "usa-icon-morph", "usa-like", "usa-hold", "usa-double-tap", "usa-checkbox"];
    readonly ui: readonly ["usa-tabs", "usa-drawer", "usa-bottom-sheet", "usa-pull-refresh", "usa-fab", "usa-navbar", "usa-slider", "usa-popover", "usa-badge", "usa-avatar-stack"];
    readonly page: readonly ["usa-cursor", "usa-fullpage", "usa-loading-bar", "usa-back-to-top", "usa-ambient", "usa-splash", "usa-auto-skeleton", "usa-motion-switch"];
    readonly timeline: readonly ["usa-timeline"];
    readonly gesture: readonly ["usa-swipeable", "usa-pinch-zoom"];
    readonly svg: readonly ["usa-draw", "usa-morph", "usa-mask-reveal", "usa-anim-icon"];
    readonly webgl: readonly ["usa-shader", "usa-distort", "usa-liquid", "usa-post-fx"];
    readonly depth: readonly ["usa-cube", "usa-depth"];
    readonly layout: readonly ["usa-auto-animate", "usa-masonry"];
    readonly packs: readonly ["usa-pack"];
    readonly fx: readonly ["usa-fx"];
};
type ComponentCategory = keyof typeof COMPONENT_CATEGORIES;

interface BaselineFeature {
    id: string;
    required: boolean;
    supported: boolean;
}
/** Required in 5.0: Custom Elements, WAAPI, IntersectionObserver, ResizeObserver, adoptedStyleSheets. Progressive: View Transitions, scroll-driven animations, WebGL. */
declare function baselineReport(): BaselineFeature[];
/** Log (once) which required 5.0 features are missing here. Returns the missing ids. */
declare function warnBaseline(): string[];

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

/** What each level allows, for docs and settings UIs. */
declare const MOTION_SENSITIVITY: Record<MotionSensitivity, {
    en: string;
    zh: string;
    allows: string[];
}>;
/** CSS applied at the `static` / `minimal` / `gentle` levels (also stops your own CSS animations under `static`). */
declare const SENSITIVITY_CSS: string;
/**
 * Set the motion-sensitivity level for every `<usa-*>` component and the page:
 * sets `data-usa-sensitivity` on `<html>`, adapts component keyframes, and
 * with `persist` remembers the choice (`restoreMotionSensitivity()`).
 * Dispatches `usa:sensitivity` on `document`.
 */
declare function setMotionSensitivity(level: MotionSensitivity, persist?: boolean): void;
/** Re-apply a persisted level (call early on page load). Returns the active level. */
declare function restoreMotionSensitivity(): MotionSensitivity;
/** `true` when the current level allows a kind of motion (`'rotate'`, `'parallax'`, `'loop'`…). */
declare function motionAllowed(kind: string, level?: MotionSensitivity): boolean;
/** The static alternative of each category: what its elements show without motion. */
declare const STATIC_ALTERNATIVES: Record<ComponentCategory, string>;
/**
 * Freeze a subtree at its static alternative: finishes running animations
 * (`finish()`, so content lands on its final state), marks the root with
 * `data-usa-static` and returns an undo that removes the mark.
 */
declare function staticAlternative(root: Element): () => void;
type Politeness = 'polite' | 'assertive';
/** The ids of the shared live regions. */
declare const LIVE_REGION_IDS: Record<Politeness, string>;
/** The shared live region (created once, visually hidden, `role="status"` / `role="alert"`). */
declare function liveRegion(politeness?: Politeness): HTMLElement | null;
/**
 * Announce a message through the shared live region. Conventions: `polite`
 * for results of the user's own actions (added, saved, copied), `assertive`
 * only for errors that block them. Identical messages within `dedupe` ms
 * (default 500) are dropped; the region is cleared first so repeats are read.
 */
declare function announce(message: string, options?: {
    politeness?: Politeness;
    dedupe?: number;
}): boolean;
interface A11yIssue {
    rule: string;
    level: 'error' | 'warning';
    element: Element;
    message: string;
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
declare function auditMotionA11y(root: Element | Document): {
    errors: A11yIssue[];
    warnings: A11yIssue[];
};
/** Every `<usa-*>` tag, for sweeping audits. */
declare const ALL_TAGS: string[];

export { ALL_TAGS, LIVE_REGION_IDS, MOTION_SENSITIVITY, MOTION_SENSITIVITY_LEVELS, SENSITIVITY_CSS, STATIC_ALTERNATIVES, adaptKeyframes, announce, auditMotionA11y, baselineReport, getMotionSensitivity, liveRegion, motionAllowed, restoreMotionSensitivity, setMotionSensitivity, staticAlternative, warnBaseline };
export type { A11yIssue, BaselineFeature, MotionSensitivity, Politeness };
