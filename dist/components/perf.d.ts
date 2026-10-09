/** Run `fn(time, dt)` every frame on the shared scheduler until the returned function is called. */
declare function onFrame(fn: (t: number, dt: number) => void): () => void;
/** Scheduler counters: frames flushed, callbacks run, peak callbacks in one frame, pending now. */
declare function schedulerStats(): {
    frames: number;
    callbacks: number;
    peak: number;
    pending: number;
    loops: number;
};
/** Number of component animations running right now. */
declare const activeAnimations: () => number;
/** Cap concurrent component animations; extra ones jump to their final frame (`Infinity` = no cap). */
declare function setAnimationBudget(max: number): void;
/** The current cap. */
declare const animationBudget: () => number;

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

interface AutoDegradeOptions {
    /** Frame rate below which motion is degraded (default 45). */
    minFps?: number;
    /** Concurrent animations above which motion is degraded (default 40). */
    maxActive?: number;
    /** Sample window in ms (default 1000). */
    sample?: number;
    /** Bad samples in a row before degrading (default 2). */
    patience?: number;
    /** Good samples in a row before restoring (default 3). */
    recovery?: number;
    /** Called on every change. */
    onChange?: (state: DegradeState) => void;
}
interface DegradeState {
    degraded: boolean;
    fps: number;
    active: number;
    reason: '' | 'fps' | 'count';
}
/**
 * Watch frame rate and animation count; while the device struggles, set
 * motion intensity to `low` and cap concurrent animations at `maxActive / 2`,
 * then restore the previous settings once frames recover. Dispatches
 * `usa:degrade` on `document`. Returns a stop function (restores settings).
 */
declare function autoDegrade(options?: AutoDegradeOptions): () => void;
/** The category of a default `<usa-*>` tag. */
declare const categoryOf: (tag: string) => ComponentCategory | undefined;
/**
 * Add `<link rel="stylesheet" href="{base}components/{category}.css">` once.
 * `base` is the URL of the package's `dist/` folder.
 */
declare function loadCategoryStyles(category: ComponentCategory | 'all', base: string): HTMLLinkElement | null;
/**
 * Load each category's CSS the first time one of its elements connects
 * (custom tags fall back to the full stylesheet). Returns an undo.
 */
declare function onDemandStyles(base: string): () => void;
/** Categories whose CSS has been requested so far. */
declare const loadedStyles: () => string[];

export { activeAnimations, animationBudget, autoDegrade, categoryOf, loadCategoryStyles, loadedStyles, onDemandStyles, onFrame, schedulerStats, setAnimationBudget };
export type { AutoDegradeOptions, DegradeState };
