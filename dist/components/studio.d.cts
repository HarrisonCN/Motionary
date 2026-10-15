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

/**
 * 13.6: editing operations on a `motionary-timeline` document. Every operation
 * is pure: it returns a new document (unchanged layers are shared, so history
 * snapshots stay cheap) and never edits a locked layer.
 */

interface KeyframeClip {
    format: 'motionary-timeline-clip';
    version: 1;
    /** Keyframes with times relative to the earliest one, grouped by source layer. */
    items: {
        layer: string;
        time: number;
        props: Record<string, TimelineValue>;
        easing?: string;
    }[];
}

interface TimelineFrame {
    /** The sampled time (clamped to 0…duration). */
    time: number;
    /** Active track id → property → value. */
    layers: Record<string, Record<string, TimelineValue>>;
}

/** What a scene loses when opened as a timeline v1 document. */
interface SceneLoss {
    path: string;
    message: string;
}

/** `[x1, y1, x2, y2]` — the two control points of a CSS `cubic-bezier()`. */
type Bezier = [number, number, number, number];
interface SpringParams {
    stiffness: number;
    damping: number;
    mass: number;
}
/** Curve editor presets (the CSS keywords plus a few common shapes). */
declare const CURVE_PRESETS: Record<string, Bezier>;
/** The control points of an easing: a preset / CSS keyword or `cubic-bezier(…)` (`undefined` = linear). `null` for anything else (`steps()`, named eases like `bounce-out`). */
declare function parseBezier(easing: string | undefined): Bezier | null;
/** The easing string for control points: `linear`, else `cubic-bezier(x1, y1, x2, y2)` (x clamped to 0…1, 3 decimals). */
declare function bezierEasing(b: Bezier): string;
/** Spring parameters with defaults (stiffness 170, damping 26, mass 1) for anything missing or invalid. */
declare const springParams: (s?: Partial<SpringParams>) => SpringParams;
/**
 * The cubic-bezier closest to a spring (unit step, from rest), and the time the spring takes to settle (ms). A cubic
 * curve can overshoot once, so an underdamped spring keeps its first overshoot and loses later wobbles.
 * Deterministic: a fixed-step simulation and a fixed search grid.
 */
declare function springBezier(input: Partial<SpringParams>): {
    easing: string;
    bezier: Bezier;
    duration: number;
};

/**
 * 14.4 Motion Studio: save / load. A Studio project is `{ format: 'motionary-studio', version: 1, scene, studio }`:
 * `scene` is the document as Scene Format v2 (`timelineDocToScene`, lossless), `studio` is editor state (time, zoom,
 * fps, collapsed groups, spring parameters). `parseStudioProject` also opens a bare Scene v2 document, a
 * `motionary-timeline` v1 document or `<usa-player>` animation JSON, checks size and shape (never evaluates input) and
 * drops editor state that does not match the document. `sampleFrames` is the reference for "same animation":
 * every frame at a fixed frame rate, a pure function of the document.
 */

declare const STUDIO_PROJECT_FORMAT = "motionary-studio";
declare const STUDIO_PROJECT_VERSION = 1;
/** Editor state saved with a project. */
interface StudioUiState {
    /** Playhead (ms). */
    time?: number;
    /** Timeline zoom (px per second). */
    zoom?: number;
    fps?: number;
    /** Collapsed group ids. */
    collapsed?: string[];
    /** Keyframe id → the spring its easing was fitted from. */
    springs?: Record<string, SpringParams>;
}
interface StudioProject {
    format: typeof STUDIO_PROJECT_FORMAT;
    version: 1;
    scene: SceneV2Doc;
    studio: StudioUiState;
}
/** `ms` snapped to the nearest frame at `fps` (4 decimals, like the editor model). */
declare const frameTime: (ms: number, fps?: number) => number;
/** Every frame of the document at `fps` from `from` to `to` (default 0 … duration): the reference for "same animation". */
declare function sampleFrames(doc: TimelineDoc, o?: {
    fps?: number;
    from?: number;
    to?: number;
}): TimelineFrame[];
/** Editor state checked against the document: unknown ids, bad numbers and stale springs are dropped. */
declare function cleanUiState(doc: TimelineDoc, s: unknown): StudioUiState;
/** The project as JSON text (stable: the same document and state always give the same text). */
declare function serializeStudioProject(doc: TimelineDoc, ui?: StudioUiState, space?: number | string): string;
/**
 * Open a Studio project, a Scene v2 document, a timeline v1 document or animation JSON (object or text). Throws a
 * `TimelineDocError` for anything malformed or over the limits; `lost` lists what a scene had that the editor cannot hold.
 */
declare function parseStudioProject(input: unknown): {
    doc: TimelineDoc;
    ui: StudioUiState;
    lost: SceneLoss[];
};

/**
 * motionary/studio (14.4) — Motion Studio 1.0: a timeline UI over the 13.6 timeline editor model, composed with the
 * 14.3 canvas (`motionary/studio/canvas`).
 *
 * - Timeline: tracks and track groups (collapse, mute, lock), a time ruler, a scrubbable playhead, zoom.
 * - Keyframes: drag, marquee, multi-select move, copy / paste, snapping to frames and to other keys (Alt: free).
 * - Curve editor: cubic-bezier handles, presets, spring parameters (fitted to a cubic-bezier).
 * - Inspector: the focused track's values at the playhead; editing adds a key there or changes the key there.
 * - Preview: frame by frame, play / pause, deterministic seek (`createTimelinePreview`: same time → same DOM).
 * - Undo / redo through the existing `createTimelineHistory` (one gesture = one step).
 * - Save / load: Scene Format v2 and the Studio project file (`serializeStudioProject` / `parseStudioProject`).
 *
 * Nothing is reimplemented: edits are the editor model's operations (`shiftKeyframes`, `addKeyframe`, …), playback is
 * its preview, the canvas is `createStudioCanvas`. Editor-only and opt-in: nothing in `motionary`, `motionary/core`,
 * `motionary/motion` or `components/lite` imports it. SSR-safe at import; no listeners on window / document: the
 * Studio listens on its own container, adds move / up / cancel listeners when a gesture starts and removes them when
 * it ends or on `destroy()`.
 */

declare const STUDIO_VERSION = 1;
interface StudioOptions {
    /** The editor history (`createTimelineHistory`): every edit goes through it. */
    history: TimelineHistory;
    /** The element the layer targets live in: previewed frame by frame and, unless `canvas: false`, edited by the canvas. */
    stage?: HTMLElement;
    /** Compose the 14.3 canvas on `stage` (default on when there is a stage); an object passes canvas options. */
    canvas?: boolean | Omit<StudioCanvasOptions, 'history' | 'time'>;
    /** Frames per second for snapping, frame steps and seeking (default 60). */
    fps?: number;
    /** Timeline zoom in px per second (default 100). */
    zoom?: number;
    /** Row height in px (default 24; 32 on coarse pointers). */
    rowHeight?: number;
    /** Shortest timeline length in ms, so an empty document can be scrubbed (default 2000). */
    length?: number;
    /** Snap keyframe drags to frames and to other keys (default true; Alt disables it while dragging). */
    snap?: boolean;
    /** Accessible name of the timeline grid (default "Timeline"). */
    label?: string;
}
interface Studio {
    /** The Studio's own container (inside the root you passed). */
    readonly el: HTMLElement;
    readonly canvas: StudioCanvas | undefined;
    readonly time: number;
    readonly zoom: number;
    readonly fps: number;
    readonly playing: boolean;
    /** Selected keyframe ids. */
    readonly selection: string[];
    readonly focusedLayer: string | undefined;
    readonly collapsed: string[];
    /** Move the playhead (snapped to frames, clamped to the timeline); returns the time. */
    setTime(ms: number): number;
    /** Step `n` frames (default 1). */
    step(n?: number): number;
    play(): void;
    pause(): void;
    setZoom(pxPerSecond: number): void;
    selectKeys(ids: string[], o?: {
        add?: boolean;
        toggle?: boolean;
    }): void;
    selectAllKeys(): void;
    clearSelection(): void;
    focusLayer(id: string | undefined): void;
    /** Move keyframes (default: the selection) by `dt` ms; `false` when nothing moved (locked, none). */
    moveKeys(dt: number, ids?: string[]): boolean;
    copy(): KeyframeClip | undefined;
    /** Paste the last copy at `at` (default: the playhead); returns the new keyframe ids (selected). */
    paste(at?: number): string[];
    deleteKeys(ids?: string[]): boolean;
    addTrack(t?: {
        name?: string;
        target?: string;
        parent?: string;
    }): string;
    addGroup(t?: {
        name?: string;
        parent?: string;
    }): string;
    collapse(id: string, collapsed?: boolean): void;
    mute(ids: string[], muted?: boolean): boolean;
    lock(ids: string[], locked?: boolean): boolean;
    /** A track's values at the playhead (mute / solo ignored). */
    valuesAt(layer: string): Record<string, TimelineValue>;
    /** Set a value at the playhead: changes the key there, or adds one. */
    setValue(layer: string, prop: string, value: TimelineValue): boolean;
    /** Remove `prop` (or the whole key) from the key at the playhead; an emptied key is removed. */
    removeKey(layer: string, prop?: string): boolean;
    setEasing(easing: string, ids?: string[]): boolean;
    setBezier(b: Bezier, ids?: string[]): boolean;
    setSpring(s: Partial<SpringParams>, ids?: string[]): boolean;
    /** Every frame of the document at the Studio's fps. */
    frames(): TimelineFrame[];
    /** The project as JSON text (Scene v2 + editor state). */
    save(): string;
    /**
     * The document as Scene v2. 15.9: called without `{ version: 2 }` it warns once that 16.0 returns Scene v3
     * (docs/deprecations-v16.md#scene-v2-write); `{ version: 2 }` keeps v2 in 16.x too and never warns.
     */
    exportScene(o?: {
        version?: 2;
    }): SceneV2Doc;
    /** Open a project / Scene v2 / timeline v1 / animation JSON; resets the history; returns what a scene lost. */
    load(input: unknown): SceneLoss[];
    undo(): boolean;
    redo(): boolean;
    destroy(): void;
}
declare function createStudio(root: HTMLElement, o: StudioOptions): Studio;

export { CURVE_PRESETS, STUDIO_PROJECT_FORMAT, STUDIO_PROJECT_VERSION, STUDIO_VERSION, bezierEasing, cleanUiState, createStudio, frameTime, parseBezier, parseStudioProject, sampleFrames, serializeStudioProject, springBezier, springParams };
export type { Bezier, SpringParams, Studio, StudioCanvas, StudioCanvasOptions, StudioOptions, StudioProject, StudioUiState };
