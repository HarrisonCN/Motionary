/** The component categories and their default tags. */
declare const COMPONENT_CATEGORIES: {
    readonly reveal: readonly ["usa-reveal", "usa-stagger", "usa-scroll-progress", "usa-scrolly"];
    readonly text: readonly ["usa-typewriter", "usa-split-text", "usa-scramble", "usa-counter", "usa-shimmer-text", "usa-text-rotate", "usa-wave-text", "usa-glitch", "usa-gradient-text", "usa-handwriting", "usa-scroll-highlight"];
    readonly interaction: readonly ["usa-ripple", "usa-magnetic", "usa-tilt", "usa-spotlight", "usa-press", "usa-toggle"];
    readonly feedback: readonly ["usa-spinner", "usa-skeleton", "usa-progress", "usa-toaster", "usa-check"];
    readonly background: readonly ["usa-aurora", "usa-particles", "usa-grain", "usa-marquee", "usa-acrylic", "usa-grid-glow", "usa-blobs", "usa-water-ripple", "usa-dot-network"];
    readonly transitions: readonly ["usa-dialog", "usa-accordion", "usa-flip-list", "usa-view-switch"];
    readonly physics: readonly ["usa-spring", "usa-draggable", "usa-overscroll"];
    readonly cards: readonly ["usa-card", "usa-card-stack", "usa-sticky-stack", "usa-carousel-3d"];
    readonly click: readonly ["usa-click", "usa-button", "usa-icon-morph", "usa-like", "usa-hold", "usa-double-tap", "usa-checkbox"];
    readonly ui: readonly ["usa-tabs", "usa-drawer", "usa-bottom-sheet", "usa-pull-refresh", "usa-fab", "usa-navbar", "usa-slider", "usa-rating", "usa-tooltip", "usa-popover", "usa-badge", "usa-avatar-stack"];
    readonly page: readonly ["usa-cursor", "usa-fullpage", "usa-loading-bar", "usa-back-to-top", "usa-ambient", "usa-splash", "usa-auto-skeleton", "usa-motion-switch"];
    readonly timeline: readonly ["usa-timeline"];
    readonly gesture: readonly ["usa-swipeable", "usa-pinch-zoom"];
    readonly svg: readonly ["usa-draw", "usa-morph", "usa-mask-reveal", "usa-anim-icon"];
    readonly webgl: readonly ["usa-shader", "usa-distort", "usa-liquid"];
    readonly depth: readonly ["usa-cube", "usa-depth"];
    readonly layout: readonly ["usa-auto-animate", "usa-masonry"];
};
type ComponentCategory = keyof typeof COMPONENT_CATEGORIES;

/**
 * use-scroll-animate/components/lazy — lazy, per-category registration (v2.9).
 *
 * `lazyDefine()` scans the page (and watches it with a MutationObserver) for
 * `<usa-*>` tags that are not registered yet and dynamically imports only the
 * categories they belong to. Bundlers split each category into its own chunk,
 * so a page that only uses `<usa-button>` loads just the click category.
 *
 * ```js
 * import { lazyDefine } from 'use-scroll-animate/components/lazy';
 * lazyDefine(); // returns a stop() function
 * ```
 */

/** Category of a tag (`usa-button` → `click`), or `null`. */
declare const categoryOfTag: (tag: string) => ComponentCategory | null;
/** Load and register one category (once). */
declare function loadCategory(cat: ComponentCategory): Promise<void>;
/** Register the categories needed by the `<usa-*>` tags under `root`. Resolves when they are defined. */
declare function defineUsed(root?: ParentNode): Promise<ComponentCategory[]>;
/** `defineUsed()` now and whenever new `<usa-*>` elements are added. Returns a stop function. */
declare function lazyDefine(root?: ParentNode): () => void;

export { categoryOfTag, defineUsed, lazyDefine, loadCategory };
