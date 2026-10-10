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
 * `motionary/runtime/drag-snap` (10.8) — pointer drag with inertia and snap
 * points, for carousels, sheets, sliders and pickers (own implementation).
 *
 * - one axis (`x` / `y`) per controller; pointer, touch and pen through
 *   Pointer Events, a movement threshold before a drag starts (so clicks
 *   inside still work), `touch-action` set for the other axis;
 * - velocity from the last 100 ms of samples; release projects the throw
 *   with constant deceleration and snaps to the nearest point (or to the
 *   next / previous point for a fast flick, `flick`), with a critically
 *   damped spring on the shared ticker;
 * - bounds with rubber-band resistance past the ends;
 * - `createDragSnap(el, options)`; `snapTo(index)`, `setPosition(px)`, `setSnapPoints([...])`; reduced
 *   motion: no inertia, snaps without the spring.
 *
 * The maths (`projectThrow`, `nearestSnap`, `rubberband`, `springStep`,
 * `velocityTracker`) is pure and exported for tests / workers.
 */

type Num = number;
interface DragSnap {
    readonly position: Num;
    readonly index: Num;
    readonly dragging: boolean;
    readonly moving: boolean;
    snapTo(index: Num, animate?: boolean): void;
    setPosition(px: Num, animate?: boolean): void;
    setSnapPoints(points: Num[], bounds?: [Num, Num]): void;
    /** Where a release at `velocity` would come to rest (index). */
    targetFor(position: Num, velocity: Num): Num;
    dispose(): void;
}

/**
 * `<usa-snap-carousel>` (10.8) — a drag / swipe carousel with inertia and
 * snap points on **`motionary/runtime/drag-snap`** (requires `use(dragSnap)`
 * before it mounts). Each child is a slide; slides keep their own width
 * (CSS `--usa-sc-size`, default 80 %), so several can be visible ("peek").
 *
 * Its own entry point — `motionary/components/snap-carousel` — and **not**
 * part of `motionary/components/widgets` or `motionary/components/lite`
 * (10.8+ components ship as individual entry points so the bundles stay put).
 *
 * Attributes: `align` (start · center, default center), `gap` (px, default
 * 16), `index` (start slide), `autoplay` (ms; pauses on hover, focus, press,
 * off screen and under reduced motion; wraps), `no-controls`, `no-dots`,
 * `label` (accessible name, default "Carousel"). Keyboard: ←/→, Home / End
 * on the focused viewport. Without the runtime module the slides stay a
 * native CSS scroll-snap strip (plus the clear notice).
 *
 * API: `index`, `length`, `controller` (the DragSnap), `next()`, `prev()`,
 * `goTo(i, animate = true)`; `usa:change` { index, from }.
 */
interface UsaSnapCarouselElement extends UsaElement {
    index: number;
    readonly length: number;
    readonly controller: DragSnap | null;
    next(): void;
    prev(): void;
    goTo(i: number, animate?: boolean): void;
}
declare function defineSnapCarousel(tag?: string): CustomElementConstructor | undefined;
declare global {
    interface HTMLElementTagNameMap {
        'usa-snap-carousel': UsaSnapCarouselElement;
    }
}

export { defineSnapCarousel };
export type { UsaSnapCarouselElement };
