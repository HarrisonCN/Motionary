/** The component categories and their default tags. */
declare const COMPONENT_CATEGORIES: {
    readonly reveal: readonly ["usa-reveal", "usa-stagger", "usa-scroll-progress", "usa-scrolly"];
    readonly text: readonly ["usa-typewriter", "usa-split-text", "usa-scramble", "usa-counter", "usa-shimmer-text", "usa-text-rotate", "usa-wave-text", "usa-glitch", "usa-gradient-text", "usa-handwriting", "usa-scroll-highlight"];
    readonly interaction: readonly ["usa-ripple", "usa-magnetic", "usa-tilt", "usa-spotlight", "usa-press", "usa-toggle"];
    readonly feedback: readonly ["usa-spinner", "usa-skeleton", "usa-progress", "usa-toaster", "usa-check"];
    readonly background: readonly ["usa-aurora", "usa-particles", "usa-grain", "usa-marquee", "usa-acrylic", "usa-grid-glow", "usa-blobs", "usa-water-ripple", "usa-dot-network"];
    readonly transitions: readonly ["usa-dialog", "usa-accordion", "usa-view-switch"];
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
    readonly packs: readonly ["usa-pack"];
};

/**
 * use-scroll-animate/components/jsx — JSX typings for the raw `<usa-*>` tags (v2.9).
 *
 * ```ts
 * // src/usa-jsx.d.ts (React 18/19)
 * import type { UsaIntrinsicElements } from 'use-scroll-animate/components/jsx';
 * declare module 'react' { namespace JSX { interface IntrinsicElements extends UsaIntrinsicElements {} } }
 * // Solid / Preact / other JSX: extend their JSX.IntrinsicElements the same way.
 * ```
 */

type Tags = (typeof COMPONENT_CATEGORIES)[keyof typeof COMPONENT_CATEGORIES][number];
/** Attributes accepted by every `<usa-*>` element (all component attributes are strings / booleans). */
interface UsaAttributes {
    [attr: string]: unknown;
    class?: string;
    className?: string;
    id?: string;
    style?: unknown;
    slot?: string;
    variant?: 'minimal' | 'neon' | 'glass' | 'brutalist' | 'fluent' | 'material' | (string & {});
    children?: unknown;
    ref?: unknown;
}
type UsaIntrinsicElements = {
    [K in Tags]: UsaAttributes;
};
type UsaTag = Tags;

export type { UsaAttributes, UsaIntrinsicElements, UsaTag };
