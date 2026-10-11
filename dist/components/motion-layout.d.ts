type MotionPlayState = 'idle' | 'running' | 'paused' | 'finished';
/** The one controller interface of Motion Engine v2 (animate, sequence, parallel, stagger, spring and timeline all return it). */
interface MotionControls {
    /** Total length in ms (`Infinity` with `repeat: Infinity`). */
    readonly duration: number;
    /** Playhead in ms; setting it seeks. */
    currentTime: number;
    /** Playhead as 0–1 of `duration`; setting it seeks. */
    progress: number;
    /** Speed and direction (negative = reversed). Default 1. */
    playbackRate: number;
    readonly playState: MotionPlayState;
    /** Resolves (with these controls) when playback reaches its end — or 0 when reversed; rejects with an `AbortError` on `cancel()`. A new promise after each finish. */
    readonly finished: Promise<MotionControls>;
    play(): MotionControls;
    pause(): MotionControls;
    /** Jump to `ms` (clamped to 0–duration) and render it. */
    seek(ms: number): MotionControls;
    /** Flip the direction (and play). */
    reverse(): MotionControls;
    /** Jump to the end (or 0 when reversed) and resolve `finished`. */
    finish(): MotionControls;
    /** Stop, remove every effect this motion applied, reject `finished`. */
    cancel(): void;
}
interface ControlOptions {
    /** Start playing right away (default `true`). */
    autoplay?: boolean;
    /** Speed (default 1; negative plays backwards). */
    playbackRate?: number;
    /** `'respect'` (default): under `prefers-reduced-motion` playing jumps to the end. `'ignore'`: always animate. */
    reducedMotion?: 'respect' | 'ignore';
    /** Called after each rendered frame / seek with the 0–1 progress. */
    onUpdate?: (progress: number) => void;
    /** Called when playback finishes. */
    onComplete?: () => void;
}

type EasingInput = string | ((p: number) => number);

/** Layout Motion generation (14.2 = 2). */
declare const LAYOUT_MOTION_VERSION = 2;
/** A box in scroll-independent px (document space; viewport space under sticky / fixed). */
interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}
/** A layout transform: translate (local px) + scale, origin top-left. */
interface LayoutDelta {
    x: number;
    y: number;
    sx: number;
    sy: number;
}
type LayoutTargets = string | Element | Iterable<Element> | ArrayLike<Element>;
type ReducedMotionMode = 'respect' | 'instant' | 'crossfade' | 'ignore';
interface LayoutOptions extends Omit<ControlOptions, 'reducedMotion'> {
    /** ms or a duration token (`'{duration.fast}'`, `'fast'`). Default 300. */
    duration?: number | string;
    delay?: number;
    /** CSS easing, easing token or function. Default `cubic-bezier(0.22, 1, 0.36, 1)`. */
    easing?: EasingInput;
    /** Animate size changes as scale (default true); false = position only. */
    scale?: boolean;
    /** Counter-scale children of a scaling element: true (default) = direct children, a selector = matching descendants, false = none. */
    correct?: boolean | string;
    /** Correct border-radius for the current scale (default true). */
    radius?: boolean;
    /** Under `prefers-reduced-motion`: `'instant'` (default; `'respect'` is the same), `'crossfade'` (opacity only), `'ignore'` (animate anyway). */
    reducedMotion?: ReducedMotionMode;
}
/** The transform that shows an element laid out at `to` at the box `from` (`ps` = ancestor scale). */
declare function layoutDelta(from: Box, to: Box, ps?: {
    x: number;
    y: number;
}): LayoutDelta;
/** Interpolate two boxes. */
declare function mixBox(a: Box, b: Box, p: number): Box;
/**
 * The transform that shows an element laid out at `to` at the box `want`. With `parent` (an animated layout
 * ancestor: its layout box `to` and the box it is `shown` at) the result is in the parent's frame, so a child
 * that should look untouched is counter-scaled (scale correction).
 */
declare function solveLayoutTransform(want: Box, to: Box, parent?: {
    shown: Box;
    to: Box;
} | null, ps?: {
    x: number;
    y: number;
}): LayoutDelta;
/** `translate3d(x, y, 0) scale(sx, sy)`; `''` at identity. */
declare function layoutTransform(d: LayoutDelta): string;
/** Border-radius (visible px) that looks right on an element shown at scale `sx`, `sy`. */
declare function correctRadius(r: number | [number, number], sx: number, sy: number): string;
/** The element's box as rendered, in scroll-independent coordinates (see {@link Box}). */
declare function measureLayout(el: Element): Box;
/** Is a layout animation of this package running on `el`? */
declare function isLayoutAnimating(el: Element): boolean;
interface LayoutSnapshot {
    readonly elements: HTMLElement[];
    /** Measure again and animate every element from its captured box. */
    animate(options?: LayoutOptions): MotionControls;
}
/** Capture the boxes of `targets` (taking over running layout animations); call `animate()` after the DOM changed. */
declare function snapshotLayout(targets: LayoutTargets, defaults?: LayoutOptions): LayoutSnapshot;
/**
 * FLIP: measure `targets`, run `update()` (synchronous DOM change), measure again and animate each element
 * from its old box to the new one with transforms (scale + children + border-radius corrected).
 */
declare function flip(targets: LayoutTargets, update: () => void, options?: LayoutOptions): MotionControls;
interface LayoutGroup {
    /** Namespace for layoutIds (`setLayoutId(el, id, group)` → `"<group.id>/<id>"`). */
    readonly id?: string;
    /** Current members (selector members are re-queried each time). */
    readonly members: HTMLElement[];
    add(el: Element): LayoutGroup;
    remove(el: Element): LayoutGroup;
    snapshot(options?: LayoutOptions): LayoutSnapshot;
    /** FLIP every member around `update()`, so siblings reflow together. */
    flip(update: () => void, options?: LayoutOptions): MotionControls;
    /** Shared-element transition limited to this group's layoutIds. */
    shared(update: () => void | Promise<void>, options?: SharedLayoutOptions): Promise<MotionControls>;
}
/** A set of elements that animate together when any of them changes layout. */
declare function layoutGroup(members?: LayoutTargets, options?: LayoutOptions & {
    id?: string;
}): LayoutGroup;
/** Pair elements across states / routes: same layoutId = same element. `null` removes it. */
declare function setLayoutId(el: Element, id: string | null, group?: {
    id?: string;
}): void;
/** The layoutId (`data-layout-id`, or the 13.x `data-shared`). */
declare function getLayoutId(el: Element): string | null;
interface SharedLayoutOptions extends LayoutOptions {
    /** Where to look for layoutIds (default `document`). */
    root?: ParentNode;
    /** Only layoutIds starting with this prefix. */
    scope?: string;
    /** Old and new element both fly; the old fades out, the new fades in (when the old one stays in the DOM). */
    crossfade?: boolean;
    /** Elements whose layoutId only exists after the update: `'fade'` in (default) or `'none'`. */
    enter?: 'fade' | 'none';
}
/**
 * Shared-element transition (FLIP): elements with a layoutId before `update()` (sync or async — a route
 * change) fly to the element with the same layoutId afterwards.
 */
declare function sharedLayout(update: () => void | Promise<void>, options?: SharedLayoutOptions): Promise<MotionControls>;
/** Same-document View Transitions API available. */
declare function supportsViewTransitions(): boolean;
/** Cross-document view transitions (`@view-transition { navigation: auto }`, pageswap / pagereveal) available. */
declare function supportsCrossDocumentViewTransitions(): boolean;
/** `view-transition-name` for a layoutId (`mo-` + id with unsafe characters as `_`). */
declare function viewTransitionName(id: string): string;
interface LayoutTransitionOptions extends SharedLayoutOptions {
    /** `'auto'` (default): View Transitions API when supported, FLIP otherwise. */
    method?: 'auto' | 'view-transition' | 'flip';
    /** View transition types (`:active-view-transition-type()`), where supported. */
    types?: string[];
}
interface LayoutTransitionResult {
    /** What ran: the View Transitions API, the FLIP fallback, an instant update or a reduced-motion cross-fade. */
    method: 'view-transition' | 'flip' | 'instant' | 'crossfade';
    /** Resolves when the animation is over (never rejects). */
    finished: Promise<void>;
    /** The FLIP controller (FLIP and FLIP cross-fade). */
    controls?: MotionControls;
    /** The `ViewTransition` (View Transitions API). */
    viewTransition?: any;
    /** Jump to the end. */
    skip(): void;
}
/**
 * Animate a DOM change (sync or async: state change, route change) with shared elements: the View Transitions
 * API when present (layoutIds become `view-transition-name`s), FLIP otherwise or when it fails. A new transition
 * skips the running one. Resolves once the DOM is updated.
 */
declare function layoutTransition(update: () => void | Promise<void>, options?: LayoutTransitionOptions): Promise<LayoutTransitionResult>;
/** Save the viewport boxes of every layoutId (call on `pagehide` / before navigating) for {@link playLayoutSnapshot}. */
declare function saveLayoutSnapshot(root?: ParentNode, key?: string): void;
/** On the new page: FLIP every layoutId from the box saved on the previous page (once; ignored after `maxAge` ms, default 5000). */
declare function playLayoutSnapshot(root?: ParentNode, options?: SharedLayoutOptions & {
    key?: string;
    maxAge?: number;
}): MotionControls | null;
/**
 * Shared elements across page loads (MPA): native cross-document view transitions where supported (adds
 * `@view-transition { navigation: auto }` and names layoutIds on `pageswap` / `pagereveal`), otherwise the
 * sessionStorage FLIP fallback (save on `pagehide`, play on load). Include it on both pages, early (render-
 * blocking) for `pagereveal`. Returns an undo.
 */
declare function crossDocumentLayout(options?: SharedLayoutOptions & {
    method?: 'auto' | 'view-transition' | 'flip';
}): () => void;
interface LayoutTracker {
    /** Capture boxes — before the framework updates the DOM (event handler, `onBeforeUpdate`, `$effect.pre`, …). */
    snapshot(): void;
    /** After the DOM update (`useLayoutEffect`, `onUpdated`, `afterNextRender`, …): animate; null without a snapshot. */
    animate(): MotionControls | null;
    /** Drop the snapshot and cancel the running animation. */
    cancel(): void;
}
/** Framework-neutral FLIP helper: `snapshot()` before a render, `animate()` after it. */
declare function createLayoutTracker(targets: LayoutTargets | (() => LayoutTargets), options?: LayoutOptions): LayoutTracker;

export { LAYOUT_MOTION_VERSION, correctRadius, createLayoutTracker, crossDocumentLayout, flip, getLayoutId, isLayoutAnimating, layoutDelta, layoutGroup, layoutTransform, layoutTransition, measureLayout, mixBox, playLayoutSnapshot, saveLayoutSnapshot, setLayoutId, sharedLayout, snapshotLayout, solveLayoutTransform, supportsCrossDocumentViewTransitions, supportsViewTransitions, viewTransitionName };
export type { Box, LayoutDelta, LayoutGroup, LayoutOptions, LayoutSnapshot, LayoutTargets, LayoutTracker, LayoutTransitionOptions, LayoutTransitionResult, MotionControls, MotionPlayState, ReducedMotionMode, SharedLayoutOptions };
