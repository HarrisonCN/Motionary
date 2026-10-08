/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

/**
 * `<usa-auto-animate>` — wraps `autoAnimate()`: any change to its children
 * (add, remove, re-order, filter, size) animates. Attributes `duration`
 * (300), `no-scale`. Works for lists and CSS grids alike.
 */
interface UsaAutoAnimateElement extends UsaElement {
    enable(): void;
    disable(): void;
}
declare function defineAutoAnimate(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-masonry>` — a masonry (Pinterest-style) grid: children are placed in
 * the shortest column and glide to new spots when the width, the items or
 * their sizes change. Attributes `columns` (fixed count) or `min` (min
 * column width px, 220), `gap` (16). Without JS layout support it is a
 * plain CSS multi-column flow. Reduced motion: no glide.
 */
interface UsaMasonryElement extends UsaElement {
    layout(): void;
}
declare function defineMasonry(tag?: string): CustomElementConstructor | undefined;

type Box = {
    left: number;
    top: number;
    width: number;
    height: number;
};
/** FLIP keyframes from a previous box to the current one (pure). */
declare function flipFrames(from: Box, to: Box, scale?: boolean): Keyframe[];
interface AutoAnimateOptions {
    duration?: number;
    easing?: string;
    /** Also animate size changes (default true). */
    scale?: boolean;
}
/**
 * Auto-animate a container: children that are added fade / scale in, removed
 * ones fade out in place, and moved ones (re-sort, filter, reflow, resize)
 * glide to their new spot — no extra code at the call site. Returns
 * `{ disable, enable, stop }`. Reduced motion: changes apply instantly.
 *
 * @example
 * const ctl = autoAnimate(document.querySelector('ul'));
 * list.append(item); // animates
 */
declare function autoAnimate(parent: HTMLElement, o?: AutoAnimateOptions): {
    enable(): void;
    disable(): void;
    stop(): void;
};
/** Masonry placement: shortest-column-first positions for item heights (pure). */
declare function masonryLayout(heights: number[], columns: number, columnWidth: number, gap: number): {
    x: number;
    y: number;
}[] & {
    height?: number;
};
interface SharedOptions {
    duration?: number;
    easing?: string;
}
/**
 * Shared-element transition between two states of the page: every element
 * with `data-shared="id"` before `update()` flies to the element with the
 * same id afterwards (size and position), the rest cross-fades. Uses the
 * View Transitions API when present (with `view-transition-name` per id),
 * otherwise a FLIP fallback. Reduced motion: just runs `update()`.
 */
declare function sharedTransition(update: () => void | Promise<void>, root?: ParentNode, o?: SharedOptions): Promise<void>;

/**
 * motionary/components/layout — layout animation (v3.6).
 * `autoAnimate()` / `<usa-auto-animate>` (list & grid reflow),
 * `<usa-masonry>`, and `sharedTransition()` for shared-element transitions
 * (View Transitions API with a FLIP fallback).
 */

/** Register every component of this category under its default tag. */
declare function defineLayoutComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-auto-animate': UsaAutoAnimateElement;
        'usa-masonry': UsaMasonryElement;
    }
}

export { autoAnimate, defineAutoAnimate, defineLayoutComponents, defineMasonry, flipFrames, masonryLayout, sharedTransition };
export type { AutoAnimateOptions, SharedOptions, UsaAutoAnimateElement, UsaMasonryElement };
