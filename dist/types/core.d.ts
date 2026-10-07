/**
 * use-scroll-animate - Core Implementation
 * Uses IntersectionObserver + Web Animations API for zero-dependency,
 * high-performance scroll-triggered animations.
 */
import type { ScrollAnimateConfig, ScrollAnimateInstance } from './types';
type Target = string | Element | NodeList | Element[];
declare const hasDOM: () => boolean;
/** @internal */
export declare const supportsObserver: () => boolean;
/** @internal Whether the user asked the OS/browser to reduce motion. */
export declare function prefersReducedMotion(): boolean;
declare function resolveTargets(target: Target | null | undefined): Element[];
/**
 * Apply `offset` to the bottom edge of a rootMargin, preserving the other
 * three sides. `offset: 100` means "trigger 100px later" (bottom -100px).
 * @internal
 */
export declare function applyOffset(rootMargin: string, offset: number): string;
/**
 * True scroll progress of `el` through the viewport (or `root`): 0 when its top
 * edge reaches the bottom of the viewport, 1 when its bottom edge passes the top.
 * Works for elements taller than the viewport. Returns 0 without a DOM.
 */
export declare function getScrollProgress(el: Element, root?: Element | null): number;
/**
 * Interpolate two CSS values at `t`. Numbers interpolate directly; strings
 * interpolate when they share the same structure (e.g. `translateY(40px)` ->
 * `translateY(0px)`, or `scale(0.8)` -> `scale(1)`). Otherwise snaps at 0.5.
 * @internal
 */
export declare function interpolateValue(from: string | number, to: string | number, t: number): string | number;
/** @internal Cancel a running/pending animation and make the element visible. */
export declare function stopAnimation(el: Element, config?: ScrollAnimateConfig): void;
/** @internal Resolve a selector / Element / NodeList / Element[] to elements (SSR-safe). */
export { resolveTargets, hasDOM };
/** @internal Whether animations should be skipped entirely. */
export declare function motionDisabled(config: Pick<ScrollAnimateConfig, 'disabled'>): boolean;
/** @internal Hide an element before its entrance animation, unless motion is off. */
export declare function prepareElement(el: Element, config?: ScrollAnimateConfig): void;
export declare function createScrollAnimate(userConfig?: ScrollAnimateConfig): ScrollAnimateInstance;
