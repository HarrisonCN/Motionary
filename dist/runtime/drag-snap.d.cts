/** A runtime module: `{ id, version, api }`, registered with `use()`. */
interface RuntimeModule<A = unknown> {
    /** Module id: 'core', 'format-css', 'scroll', … (import path `motionary/runtime/<id>`). */
    id: string;
    version: string;
    /** Other modules this one needs (registered first by `use()` callers). */
    requires?: string[];
    /** The module's public API (what `requireModule(id)` returns). */
    api: A;
    /** Optional one-time setup, called on first registration. */
    setup?(registry: RuntimeRegistry): void;
}
interface RuntimeRegistry {
    version: string;
    modules: Map<string, RuntimeModule>;
    /** Shared per-page state slots (the ticker lives here). */
    slots: Record<string, unknown>;
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
/** Where a throw at `velocity` (px/s) ends with constant `deceleration` (px/s²). */
declare function projectThrow(position: Num, velocity: Num, deceleration?: number): Num;
/** Index of the snap point nearest to `p` (points in any order). */
declare function nearestSnap(points: Num[], p: Num): Num;
/** Rubber-band: how far content moves when dragged `over` px past an edge of a `size` px viewport. */
declare function rubberband(over: Num, size: Num, c?: number): Num;
/** One semi-implicit Euler step of a damped spring towards `target`. Returns [position, velocity]. */
declare function springStep(x: Num, v: Num, target: Num, dt: Num, stiffness?: number, damping?: number): [Num, Num];
/** Velocity estimate (units/s) from the samples of the last `window` ms. */
declare function velocityTracker(window?: number): {
    add(t: Num, p: Num): void;
    velocity(now?: Num): Num;
    reset(): void;
};
interface DragSnapOptions {
    /** 'x' (default) or 'y'. */
    axis?: 'x' | 'y';
    /** Snap points in px (content offsets, usually ≤ 0 for a track moved left). Empty = free drag. */
    snap?: Num[];
    /** [min, max] position; defaults to the snap point range. */
    bounds?: [Num, Num];
    /** Throw with inertia on release (default true; off under reduced motion). */
    inertia?: boolean;
    /** Deceleration of a throw in px/s² (default 3000). */
    deceleration?: Num;
    /** A release faster than this (px/s) moves at least one snap point (default 400). */
    flick?: Num;
    /** Spring stiffness (default 260) and damping (default critical). */
    stiffness?: Num;
    damping?: Num;
    /** px before a press becomes a drag (default 4). */
    threshold?: Num;
    /** Rubber-band strength past the bounds (0 = hard stop, default 0.55). */
    resistance?: Num;
    /** Start position (px). */
    position?: Num;
    /** Skip the spring / inertia (reduced motion). */
    reducedMotion?: boolean;
    onUpdate?(position: Num): void;
    onSnap?(index: Num, position: Num): void;
    onDragStart?(): void;
    onDragEnd?(velocity: Num): void;
}
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
/** Make `el` draggable along one axis; `onUpdate(px)` applies the position (e.g. a transform). */
declare function createDragSnap(el: HTMLElement, o?: DragSnapOptions): DragSnap;
interface DragSnapApi {
    createDragSnap: typeof createDragSnap;
    projectThrow: typeof projectThrow;
    nearestSnap: typeof nearestSnap;
    rubberband: typeof rubberband;
    springStep: typeof springStep;
    velocityTracker: typeof velocityTracker;
}
/** The module object: `use(dragSnap)`. */
declare const dragSnap: RuntimeModule<DragSnapApi>;

export { createDragSnap, dragSnap, nearestSnap, projectThrow, rubberband, springStep, velocityTracker };
export type { DragSnap, DragSnapApi, DragSnapOptions };
