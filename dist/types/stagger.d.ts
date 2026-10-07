/**
 * use-scroll-animate - Staggered children
 * Reveal a container's children one after another when the container scrolls
 * into view, optionally also animating children that are added later.
 */
import type { AnimateOptions, ScrollAnimateInstance } from './types';
export interface StaggerOptions extends AnimateOptions {
    /** Delay between consecutive children in ms (default: 80) */
    stagger?: number;
    /**
     * Watch the container with a MutationObserver and animate children added
     * later (e.g. infinite lists). Children added after the container was
     * revealed animate when they scroll into view, staggered per batch.
     * (default: false)
     */
    observeChildren?: boolean;
}
/**
 * Animate the children of `container` with a stagger once it enters the
 * viewport. Returns a cleanup function. SSR-safe (no-op without a DOM).
 *
 * @example
 * const stop = staggerChildren(document.querySelector('ul'), { stagger: 60, observeChildren: true });
 */
export declare function staggerChildren(container: Element | null | undefined, options?: StaggerOptions, instance?: ScrollAnimateInstance): () => void;
