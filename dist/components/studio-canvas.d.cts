declare const TIMELINE_DOC_FORMAT = "motionary-timeline";
type TimelineValue = number | string;
interface TimelineKeyframe {
    /** Unique within the document. */
    id: string;
    /** ms from the start of the timeline. */
    time: number;
    /** CSS property → value (`opacity: 0`, `transform: 'translateX(20px)'`, `--x: 4`). */
    props: Record<string, TimelineValue>;
    /** Easing of the segment from this keyframe to the next (CSS easing / named ease). Default `linear`. */
    easing?: string;
}
interface TimelineLayer {
    id: string;
    type: 'track' | 'group';
    name?: string;
    /** Id of the group this layer belongs to. */
    parent?: string;
    /** Locked layers (or layers in a locked group) are not changed by editing operations. */
    locked?: boolean;
    /** Muted layers (or layers in a muted group) are left out of the preview and exports. */
    muted?: boolean;
    /** When any layer is solo, only solo layers (and their children) play. */
    solo?: boolean;
    /** Tracks: selector inside the preview root (`:scope` = the root). */
    target?: string;
    /** Tracks: keyframes, kept sorted by time. */
    keyframes?: TimelineKeyframe[];
}
interface TimelineDoc {
    format: typeof TIMELINE_DOC_FORMAT;
    version: 1;
    name?: string;
    /** Total length in ms (default: the last keyframe). */
    duration?: number;
    /** Seed for `random(a, b)` values (default 1). */
    seed?: number;
    /** Layers, top to bottom; a group's children follow it. */
    layers: TimelineLayer[];
    /** Anything JSON — kept verbatim through parse / serialize. */
    meta?: unknown;
}

/**
 * 13.6: undo / redo for timeline editing. Documents are immutable, so an entry
 * is a pair of snapshots (cheap: unchanged layers are shared). Drags either
 * run inside `begin()` … `commit()` or pass the same `coalesce` key on every
 * step: one gesture = one undo step. The stack is bounded (`limit`).
 */

interface ApplyOptions {
    /** Label for the step (`'Move keyframes'`) — shown by undo / redo UI. */
    label?: string;
    /** Merge with the previous step when it has the same key and is recent (drags, typing). */
    coalesce?: string;
}
interface TimelineHistory {
    readonly doc: TimelineDoc;
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    readonly undoLabel: string | undefined;
    readonly redoLabel: string | undefined;
    /** Undo steps currently stored. */
    readonly size: number;
    /** Apply a change (a new document or a function of the current one). No-op changes add no step. */
    apply(change: TimelineDoc | ((doc: TimelineDoc) => TimelineDoc), o?: ApplyOptions): TimelineDoc;
    /** Start a gesture: `apply()` calls update the document without adding steps until `commit()` / `cancel()`. */
    begin(label?: string): void;
    /** End the gesture as one step (none when nothing changed). */
    commit(): void;
    /** End the gesture and restore the document from `begin()`. */
    cancel(): void;
    undo(): boolean;
    redo(): boolean;
    /** Replace the document and forget every step (e.g. after loading a file). */
    reset(doc: TimelineDoc): void;
    /** Called after every change of `doc`; returns an unsubscribe function. */
    subscribe(fn: (doc: TimelineDoc) => void): () => void;
}

/**
 * motionary/components/tokens — motion design tokens (4.2).
 *
 * One source of truth for durations, easings and springs: as CSS custom
 * properties (`--usa-duration-fast`, `--usa-easing-emphasized`,
 * `--usa-spring-bouncy-stiffness`…), as W3C Design Tokens JSON, and importable
 * from Figma Tokens (Tokens Studio) or Style Dictionary exports.
 *
 * ```ts
 * import { applyMotionTokens, importMotionTokens, motionToken } from 'motionary/components/tokens';
 * applyMotionTokens(importMotionTokens(await (await fetch('/tokens.json')).json()));
 * el.animate(frames, { duration: motionToken('duration', 'slow'), easing: motionToken('easing', 'emphasized') });
 * ```
 */
interface SpringToken {
    stiffness: number;
    damping: number;
    mass: number;
}
interface MotionTokens {
    /** Durations in ms. */
    duration: Record<string, number>;
    /** CSS easing strings. */
    easing: Record<string, string>;
    /** Spring physics parameters. */
    spring: Record<string, SpringToken>;
}

declare const SCENE_V2_FORMAT = "motionary-scene";
/** A literal, or a token reference such as `"{duration.fast}"`, `"{easing.standard}"`. */
type SceneValue = number | string;
interface SceneKeyframe {
    id: string;
    /** ms from the start of the scene. */
    time: number;
    props: Record<string, SceneValue>;
    /** Easing of the segment to the next keyframe (CSS / named ease / `"{easing.x}"`). Default linear. */
    easing?: string;
    /** Web Animations composite of this keyframe (kept from player JSON). */
    composite?: 'replace' | 'add' | 'accumulate';
}
interface SceneComponentBinding {
    /** Custom element tag, e.g. `usa-fade-up`. */
    tag: string;
    /** Motion props (`duration`, `delay`, `easing`, `spring`, …): literals or token references. */
    props: Record<string, SceneValue>;
}
interface SceneLayer {
    id: string;
    type: 'track' | 'group';
    name?: string;
    parent?: string;
    locked?: boolean;
    muted?: boolean;
    solo?: boolean;
    /** Tracks: selector inside the scene root (`:scope` = the root). */
    target?: string;
    /** Tracks: when the layer starts (ms). Keyframe times stay absolute; preset / effect tracks need it. */
    start?: number;
    /** Tracks: length (ms) of a preset track, or the span player JSON gave a keyframe track. */
    duration?: number;
    /** Tracks: default easing for segments without their own. */
    easing?: string;
    keyframes?: SceneKeyframe[];
    /** Tracks: a named timeline preset (`fade-up`, `scale`, …) instead of keyframes. */
    preset?: string;
    /** Tracks: a registered effect fired at `start` instead of keyframes. */
    effect?: string;
    options?: Record<string, unknown>;
    /** Tracks: a component whose motion props this layer drives. */
    component?: SceneComponentBinding;
}
interface SceneV2Doc {
    format: typeof SCENE_V2_FORMAT;
    version: 2;
    name?: string;
    /** Total length in ms (default: the end of the last layer). */
    duration?: number;
    loop?: boolean;
    /** Seed for `random(a, b)` values (default 1). */
    seed?: number;
    /** Scene-local motion tokens; references fall back to the active token set. */
    tokens?: Partial<{
        [K in keyof MotionTokens]: Partial<MotionTokens[K]>;
    }>;
    layers: SceneLayer[];
    /** Where the document came from (set by `migrateToSceneV2`). */
    source?: {
        format: string;
        version?: number;
    };
    meta?: unknown;
}

declare const STUDIO_CANVAS_VERSION = 1;
interface CanvasRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
/** A layer's box on the canvas: the unrotated rect, rotated by `rotation` degrees around its centre. */
interface CanvasBox extends CanvasRect {
    rotation: number;
}
/** What the document says about a layer's geometry at a time: the translate offset, size overrides, rotation. */
interface CanvasGeometry {
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation: number;
}
type CanvasOp = {
    op: 'add-keyframe';
    layer: string;
    keyframe: {
        id: string;
        time: number;
        props: Record<string, string>;
    };
} | {
    op: 'set-props';
    layer: string;
    keyframe: string;
    props: Record<string, string>;
} | {
    op: 'update-layers';
    ids: string[];
    patch: {
        locked?: boolean;
        muted?: boolean;
    };
} | {
    op: 'move-layer';
    layer: string;
    index: number;
};
/** The new document and the ops that turn the old one into it (empty when nothing changed: `doc` is the same object). */
interface CanvasEdit {
    doc: TimelineDoc;
    ops: CanvasOp[];
}
type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
interface SnapLines {
    x: number[];
    y: number[];
}
/**
 * A track's geometry at `time` (held from the last keyframe at or before it). `null` for groups, unknown ids, and
 * values the canvas cannot represent (`10%`, `calc()`, numbers …): such layers stay read-only instead of being rewritten.
 */
declare function readCanvasGeometry(doc: TimelineDoc, id: string, time: number): CanvasGeometry | null;
/** The canvas box: the layer's untransformed layout box (`base`, canvas px) moved by the translate, with size overrides. */
declare const canvasBox: (base: CanvasRect, g: CanvasGeometry) => CanvasBox;
/** The axis-aligned bounds of a (rotated) box. */
declare function canvasBounds(b: CanvasBox): CanvasRect;
/** Whether two rects overlap (touching counts). */
declare const rectsIntersect: (a: CanvasRect, b: CanvasRect) => boolean;
/** Ids whose (rotated) box the marquee touches (`'intersect'`) or fully holds (`'contain'`), in the order given. */
declare function marqueeHits(boxes: Record<string, CanvasBox>, m: CanvasRect, mode?: 'intersect' | 'contain'): string[];
/** Snap lines: the edges and centres of `rects` plus the guides, sorted, unique. */
declare function snapLines(rects: CanvasRect[], guides?: {
    x?: number[];
    y?: number[];
}): SnapLines;
/** The nearest line within `threshold` (a tie goes to the first); none → `{ value }` unchanged. */
declare function snapValue(v: number, lines: number[], threshold: number): {
    value: number;
    line?: number;
};
/** `v` on a grid of `grid` px (0 = off). */
declare const snapToGrid: (v: number, grid: number) => number;
/**
 * How far to move `rect` so its left / centre / right (top / middle / bottom) lands on the nearest line within
 * `threshold`; on an axis with no line the left (top) edge goes to the grid when one is set. `x` / `y` name the line hit.
 */
declare function snapRect(rect: CanvasRect, lines: SnapLines, o: {
    threshold: number;
    grid?: number;
}): {
    dx: number;
    dy: number;
    x?: number;
    y?: number;
};
/**
 * Resize `box` by dragging `handle` by (dx, dy) canvas px: the dragged edges follow the pointer in the box's own
 * (rotated) frame and the opposite edges stay where they are. `keepAspect` scales both sides; `min` (default 1) px.
 */
declare function resizeBox(box: CanvasBox, handle: ResizeHandle, dx: number, dy: number, o?: {
    keepAspect?: boolean;
    min?: number;
}): CanvasBox;
/** The rotation after dragging from `start` to `p` around the box centre, from `r0`; `step` snaps (Shift: 15). (-180, 180]. */
declare function rotationFromPointer(box: CanvasRect, start: {
    x: number;
    y: number;
}, p: {
    x: number;
    y: number;
}, r0: number, step?: number): number;
/** Set a layer's box (any of x / y / width / height / rotation) at `time`; only what changed is written. Locked → no-op. */
declare function canvasSetBox(doc: TimelineDoc, id: string, time: number, base: CanvasRect, box: Partial<CanvasBox>): CanvasEdit;
/** Move layers by (dx, dy) canvas px at `time`. Locked layers, layers in locked groups and read-only geometry stay. */
declare function canvasMove(doc: TimelineDoc, ids: string[], time: number, bases: Record<string, CanvasRect>, dx: number, dy: number): CanvasEdit;
/** Lock / unlock layers (`locked`; a locked group locks its children). */
declare const canvasSetLocked: (doc: TimelineDoc, ids: string[], locked: boolean) => CanvasEdit;
/** Hide / show layers (`muted`: hidden on the canvas and left out of preview and export). */
declare const canvasSetHidden: (doc: TimelineDoc, ids: string[], hidden: boolean) => CanvasEdit;
/** Change a layer's place among its siblings: the first layer is in front. Locked layers stay. */
declare function canvasReorder(doc: TimelineDoc, id: string, to: 'forward' | 'backward' | 'front' | 'back'): CanvasEdit;
/**
 * Replay canvas ops on a Scene v2 document (pure; throws `TimelineDocError` on an op that does not apply). Everything the
 * ops do not name is kept as it is — preset / effect / component layers, tokens, loop, keyframe `composite`.
 */
declare function applyCanvasOps<T extends SceneV2Doc>(scene: T, ops: CanvasOp[]): T;
interface StudioCanvasOptions {
    /** The editor history (`createTimelineHistory`): every edit goes through it; undo / redo re-render the canvas. */
    history: TimelineHistory;
    /** Edit time in ms (default 0): geometry is read and written at this time. */
    time?: number;
    /** The element holding the layer elements; zoom / pan transform it. Default: the root. */
    stage?: HTMLElement;
    /** Grid in canvas px (0 = off, default). */
    grid?: number;
    /** Snapping (default on): `threshold` in screen px (default 6), and which targets: guides, siblings, grid. Alt disables it while dragging. */
    snap?: boolean | {
        threshold?: number;
        guides?: boolean;
        siblings?: boolean;
        grid?: boolean;
    };
    /** Guide lines in canvas px. */
    guides?: {
        x?: number[];
        y?: number[];
    };
    zoom?: number;
    /** Default 0.1. */
    minZoom?: number;
    /** Default 8. */
    maxZoom?: number;
    /** A layer element's untransformed layout box in canvas px (default: offsetLeft / offsetTop / offsetWidth / offsetHeight up to the stage). */
    measure?: (el: HTMLElement) => CanvasRect;
    /** Accessible name of the canvas (default "Canvas"). */
    label?: string;
    onSelect?: (ids: string[]) => void;
    /** Each committed edit with its ops (replay them on a Scene v2 document with `applyCanvasOps`). */
    onEdit?: (e: {
        label: string;
        ops: CanvasOp[];
    }) => void;
    onZoom?: (zoom: number) => void;
}
interface StudioCanvas {
    readonly root: HTMLElement;
    readonly selection: string[];
    readonly focused: string | undefined;
    readonly zoom: number;
    /** Canvas layer ids, front first. */
    layers(): string[];
    getBox(id: string): CanvasBox | undefined;
    select(ids: string[], o?: {
        add?: boolean;
        toggle?: boolean;
    }): void;
    selectAll(): void;
    clearSelection(): void;
    focus(id: string): void;
    /** Move layers (default: the selection) by (dx, dy) canvas px. Returns the ops (empty: nothing moved). */
    move(dx: number, dy: number, ids?: string[]): CanvasOp[];
    setBox(id: string, box: Partial<CanvasBox>): CanvasOp[];
    reorder(id: string, to: 'forward' | 'backward' | 'front' | 'back'): CanvasOp[];
    lock(ids?: string[], locked?: boolean): CanvasOp[];
    hide(ids?: string[], hidden?: boolean): CanvasOp[];
    setTime(ms: number): void;
    /** Zoom, keeping the client point `origin` fixed (default: the stage origin). */
    setZoom(zoom: number, origin?: {
        x: number;
        y: number;
    }): void;
    setGrid(px: number): void;
    setGuides(g: {
        x?: number[];
        y?: number[];
    }): void;
    /** Measure the layer elements again (after a layout change). */
    refresh(): void;
    /** End any gesture, remove every listener and restore every attribute and inline style the canvas touched. */
    destroy(): void;
}
/** Turn `root` into an editing canvas for the history's document. */
declare function createStudioCanvas(root: HTMLElement, o: StudioCanvasOptions): StudioCanvas;

export { STUDIO_CANVAS_VERSION, applyCanvasOps, canvasBounds, canvasBox, canvasMove, canvasReorder, canvasSetBox, canvasSetHidden, canvasSetLocked, createStudioCanvas, marqueeHits, readCanvasGeometry, rectsIntersect, resizeBox, rotationFromPointer, snapLines, snapRect, snapToGrid, snapValue };
export type { CanvasBox, CanvasEdit, CanvasGeometry, CanvasOp, CanvasRect, ResizeHandle, SnapLines, StudioCanvas, StudioCanvasOptions };
