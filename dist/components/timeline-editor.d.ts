interface AnimationTrack {
    /** Selector inside the player (`:scope` = the player). */
    target?: string;
    /** Start time in ms. */
    start?: number;
    duration?: number;
    /** A timeline preset (`fade-up`, `scale`, `blur`…). */
    preset?: string;
    keyframes?: Keyframe[];
    easing?: string;
    /** A registered effect fired at `start` (instead of keyframes). */
    effect?: string;
    options?: Record<string, unknown>;
    label?: string;
}
interface AnimationJSON {
    format?: string;
    version?: number;
    name?: string;
    loop?: boolean;
    /** Total length; defaults to the end of the last track. */
    duration?: number;
    tracks: AnimationTrack[];
}

declare const TIMELINE_DOC_FORMAT = "motionary-timeline";
declare const TIMELINE_DOC_VERSION = 1;
/** Hard limits a document must stay within (parse rejects anything larger). */
declare const TIMELINE_DOC_LIMITS: {
    readonly layers: 1000;
    readonly keyframes: 100000;
    readonly props: 64;
    readonly idLength: 128;
    readonly stringLength: 2048;
    readonly time: 10000000;
    readonly depth: 32;
    readonly textBytes: 5000000;
};
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
interface TimelineProblem {
    path: string;
    message: string;
}
declare class TimelineDocError extends Error {
    readonly problems: TimelineProblem[];
    constructor(problems: TimelineProblem[]);
}
/** Whether `easing` is one the preview can evaluate (named ease, `cubic-bezier()`, `steps()`). */
declare function isValidEasing(easing: unknown): boolean;
/** Every problem with `doc` (an object, e.g. fresh from `JSON.parse`). Never throws; `[]` = valid. */
declare function validateTimelineDoc(doc: unknown): TimelineProblem[];
/** The canonical form of a valid document: fixed key order, keyframes sorted by time (stable), prop names sorted, defaults omitted. */
declare function normalizeTimelineDoc(doc: TimelineDoc): TimelineDoc;
/**
 * Parse a document (JSON text or object): checks size and shape, throws a
 * `TimelineDocError` listing every problem, returns the canonical form.
 */
declare function parseTimelineDoc(input: string | unknown): TimelineDoc;
/** Canonical JSON text: `parseTimelineDoc(serializeTimelineDoc(d))` deep-equals `parseTimelineDoc(d)`, and serializing that again gives the same text. */
declare function serializeTimelineDoc(doc: TimelineDoc, space?: number | string): string;
/** An empty document. */
declare function createTimelineDoc(init?: Partial<Omit<TimelineDoc, 'format' | 'version'>>): TimelineDoc;
/** A layer is locked when it or any group above it is locked. */
declare const isLayerLocked: (doc: TimelineDoc, id: string) => boolean;
/** Whether a layer plays: not muted (nor any group above it) and, when any layer is solo, it or a group above it is solo. */
declare function isLayerActive(doc: TimelineDoc, id: string): boolean;
/** Total length: `duration` or the last keyframe. */
declare const timelineDocDuration: (doc: TimelineDoc) => number;
/** mulberry32: a deterministic PRNG, `() => [0, 1)`. */
declare function createSeededRandom(seed?: number): () => number;
/**
 * Replace `random(a, b)` in a value with a number that depends only on the
 * seed and `key` (layer / keyframe / property), never on call order.
 */
declare function resolveRandom(value: TimelineValue, seed: number, key: string): TimelineValue;
/**
 * Export the playable part as `<usa-player>` animation JSON (format
 * `use-scroll-animate/animation` v1): one track per active track layer,
 * `random()` resolved with the seed. Lossy by design (groups, locks and ids
 * are editor state) — save `serializeTimelineDoc` for a lossless copy.
 */
declare function timelineDocToAnimation(doc: TimelineDoc): AnimationJSON;
/**
 * Import `<usa-player>` animation JSON as a timeline document: one track layer
 * per keyframe / preset track (absolute keyframe times). Effect tracks have no
 * keyframes and are reported in `skipped`.
 */
declare function timelineDocFromAnimation(input: AnimationJSON | string): {
    doc: TimelineDoc;
    skipped: number[];
};

/**
 * 13.6: editing operations on a `motionary-timeline` document. Every operation
 * is pure: it returns a new document (unchanged layers are shared, so history
 * snapshots stay cheap) and never edits a locked layer.
 */

/** A fresh id `prefix<n>` unused by any layer or keyframe of `doc`. */
declare function uniqueId(doc: TimelineDoc, prefix?: string, taken?: Set<string>): string;
/** Ids of a layer and every layer below it in its groups. */
declare function layerSubtree(doc: TimelineDoc, id: string): string[];
interface AddLayerOptions {
    /** Insert before the layer at this index of `doc.layers` (default: the end, or the end of the parent group). */
    index?: number;
}
/** Add a track or group layer (`id` defaults to a fresh one). */
declare function addLayer(doc: TimelineDoc, layer: Partial<TimelineLayer> & {
    type?: 'track' | 'group';
}, o?: AddLayerOptions): TimelineDoc;
/** Remove layers (a group takes its children with it). Locked layers stay. */
declare function removeLayers(doc: TimelineDoc, ids: string[]): TimelineDoc;
/** Change layer fields (`name`, `locked`, `muted`, `solo`, `target`). On a locked layer only `locked`, `muted` and `solo` change (playback state, not content). */
declare function updateLayers(doc: TimelineDoc, ids: string[], patch: Partial<Pick<TimelineLayer, 'name' | 'locked' | 'muted' | 'solo' | 'target'>>): TimelineDoc;
/** Put layers into a new group placed where the first of them was. Returns the document and the group id. */
declare function groupLayers(doc: TimelineDoc, ids: string[], group?: {
    id?: string;
    name?: string;
}): {
    doc: TimelineDoc;
    id: string;
};
/** Dissolve a group: its children move up to the group's parent. */
declare function ungroupLayer(doc: TimelineDoc, groupId: string): TimelineDoc;
/**
 * Move a layer (with its children) so it sits at `toIndex` among its siblings
 * (layers with the same parent), or into another group with `{ parent }`.
 */
declare function moveLayer(doc: TimelineDoc, id: string, toIndex: number, o?: {
    parent?: string | null;
}): TimelineDoc;
/** Selected keyframe ids that can be edited (exist, layer not locked). */
declare function editableKeyframes(doc: TimelineDoc, ids: string[]): string[];
/** Add a keyframe to a track (`id` defaults to a fresh one). */
declare function addKeyframe(doc: TimelineDoc, layerId: string, kf: Omit<TimelineKeyframe, 'id'> & {
    id?: string;
}): TimelineDoc;
/** Change one keyframe's props (merged; `null` removes a prop). */
declare function setKeyframeProps(doc: TimelineDoc, id: string, props: Record<string, TimelineValue | null>): TimelineDoc;
/** Delete keyframes. */
declare const removeKeyframes: (doc: TimelineDoc, ids: string[]) => TimelineDoc;
/** Move keyframes by `dt` ms, keeping their spacing (the move stops at 0). */
declare function shiftKeyframes(doc: TimelineDoc, ids: string[], dt: number): TimelineDoc;
/** Scale keyframe times by `factor` (> 0) around `pivot` (default: the earliest selected keyframe). */
declare function scaleKeyframes(doc: TimelineDoc, ids: string[], factor: number, pivot?: number): TimelineDoc;
/** Set the easing of every selected keyframe (`'linear'` clears it). */
declare function setKeyframeEasing(doc: TimelineDoc, ids: string[], easing: string): TimelineDoc;
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
/** Copy keyframes (relative times) for `pasteKeyframes`. */
declare function copyKeyframes(doc: TimelineDoc, ids: string[]): KeyframeClip;
/**
 * Paste a clip at `at` ms: onto its source layers, or all onto `layer`.
 * Returns the document and the new keyframe ids (fresh, deterministic).
 */
declare function pasteKeyframes(doc: TimelineDoc, clip: KeyframeClip, o: {
    at: number;
    layer?: string;
}): {
    doc: TimelineDoc;
    ids: string[];
};

/**
 * 13.6: undo / redo for timeline editing. Documents are immutable, so an entry
 * is a pair of snapshots (cheap: unchanged layers are shared). Drags either
 * run inside `begin()` … `commit()` or pass the same `coalesce` key on every
 * step: one gesture = one undo step. The stack is bounded (`limit`).
 */

interface HistoryOptions {
    /** Most undo steps kept (oldest dropped first). Default 100. */
    limit?: number;
    /** Steps with the same `coalesce` key within this many ms merge into one. Default 1000. */
    coalesceMs?: number;
    /** Clock for coalescing (default `Date.now`); inject a fixed clock in tests. */
    now?: () => number;
}
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
declare function createTimelineHistory(initial: TimelineDoc, o?: HistoryOptions): TimelineHistory;
/** Keys `bindHistoryKeys` maps: ⌘/Ctrl+Z undo, ⇧⌘/Ctrl+Shift+Z or Ctrl+Y redo. */
declare function historyKeyAction(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>): 'undo' | 'redo' | null;
/**
 * Wire the undo / redo shortcuts on `target` (an editor root or `document`).
 * Ignored while typing in a text field (its own undo wins). Returns an unbind function.
 */
declare function bindHistoryKeys(target: EventTarget, history: Pick<TimelineHistory, 'undo' | 'redo'>): () => void;

interface TimelineFrame {
    /** The sampled time (clamped to 0…duration). */
    time: number;
    /** Active track id → property → value. */
    layers: Record<string, Record<string, TimelineValue>>;
}
/**
 * Interpolate two values at `p` (0–1): numbers, and strings whose non-numeric
 * parts match (`translateX(10px) scale(1)`, `rgb(…)`, `#hex` colours); anything
 * else switches at the midpoint (like CSS discrete animation). `p` outside 0–1
 * (overshooting easings) extrapolates numbers.
 */
declare function interpolateValue(a: TimelineValue, b: TimelineValue, p: number): TimelineValue;
/** The frame state at `time` ms (active tracks only; mute / solo applied; `random()` resolved by seed). */
declare function sampleTimelineDoc(doc: TimelineDoc, time: number): TimelineFrame;
interface FixedClock {
    /** Current time in ms. */
    readonly time: number;
    /** The step in ms. */
    readonly step: number;
    /** Advance `n` steps (default 1); returns the new time. */
    tick(n?: number): number;
    /** Jump to a time (snapped to the step grid). */
    set(ms: number): number;
}
/** A clock that only moves in fixed steps (default 1000/60 ms) — frame n is always at n × step. */
declare function createFixedClock(o?: {
    step?: number;
    start?: number;
}): FixedClock;
interface TimelinePreview {
    readonly time: number;
    readonly duration: number;
    /** Render the frame at `ms` (pure: no state carried over from earlier seeks). */
    seek(ms: number): TimelineFrame;
    /** Swap the document (e.g. after an edit or undo) and re-render the current time. */
    setDoc(doc: TimelineDoc): void;
    /** Play from the current time on the shared frame scheduler, or step a `FixedClock` with `advance()`. */
    play(): void;
    pause(): void;
    /** Advance the attached fixed clock by `n` steps and render. */
    advance(n?: number): TimelineFrame;
    /** Remove every inline style the preview set and stop. */
    destroy(): void;
}
/**
 * Drive the elements under `root` from a timeline document. Each `seek()`
 * writes the full frame state (and clears properties no longer animated), so
 * the DOM at time t is the same however you got there.
 */
declare function createTimelinePreview(root: Element, doc: TimelineDoc, o?: {
    clock?: FixedClock;
    onFrame?: (f: TimelineFrame) => void;
}): TimelinePreview;

declare const TIMELINE_DOC_SCHEMA: {
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $id: "https://cdn.jsdelivr.net/npm/motionary@14/docs/timeline-doc.schema.json";
    readonly title: "motionary-timeline v1";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["format", "version", "layers"];
    readonly properties: {
        readonly format: {
            readonly const: "motionary-timeline";
        };
        readonly version: {
            readonly const: 1;
        };
        readonly name: {
            readonly type: "string";
            readonly maxLength: 2048;
        };
        readonly duration: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 10000000;
        };
        readonly seed: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly maximum: 4294967295;
        };
        readonly meta: {};
        readonly layers: {
            readonly type: "array";
            readonly maxItems: 1000;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["id", "type"];
                readonly properties: {
                    readonly id: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    readonly type: {
                        readonly enum: readonly ["track", "group"];
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly maxLength: 2048;
                    };
                    readonly parent: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    readonly locked: {
                        readonly type: "boolean";
                    };
                    readonly muted: {
                        readonly type: "boolean";
                    };
                    readonly solo: {
                        readonly type: "boolean";
                    };
                    readonly target: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 512;
                    };
                    readonly keyframes: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["id", "time", "props"];
                            readonly properties: {
                                readonly id: {
                                    type: string;
                                    minLength: number;
                                    maxLength: number;
                                };
                                readonly time: {
                                    readonly type: "number";
                                    readonly minimum: 0;
                                    readonly maximum: 10000000;
                                };
                                readonly easing: {
                                    readonly type: "string";
                                    readonly maxLength: 200;
                                };
                                readonly props: {
                                    readonly type: "object";
                                    readonly maxProperties: 64;
                                    readonly propertyNames: {
                                        readonly pattern: "^(--[A-Za-z0-9_-]+|[a-zA-Z][A-Za-z0-9_-]*)$";
                                        readonly not: {
                                            readonly enum: readonly ["constructor", "prototype"];
                                        };
                                    };
                                    readonly additionalProperties: {
                                        oneOf: ({
                                            type: string;
                                            maxLength?: undefined;
                                        } | {
                                            type: string;
                                            maxLength: number;
                                        })[];
                                    };
                                };
                            };
                        };
                    };
                };
                readonly if: {
                    readonly properties: {
                        readonly type: {
                            readonly const: "group";
                        };
                    };
                };
                readonly then: {
                    readonly not: {
                        readonly anyOf: readonly [{
                            readonly required: readonly ["target"];
                        }, {
                            readonly required: readonly ["keyframes"];
                        }];
                    };
                };
            };
        };
    };
};

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

/** What a scene loses when opened as a timeline v1 document. */
interface SceneLoss {
    path: string;
    message: string;
}
/** The editor document as scene v2 (lossless: `timelineDocFromScene(timelineDocToScene(d)).doc` equals the canonical `d`). */
declare function timelineDocToScene(doc: TimelineDoc): SceneV2Doc;
/**
 * Open a scene v2 document in the editor. Token references resolve (scene tokens, then the
 * built-in scale); preset / effect / component layers, `loop`, `tokens`, keyframe `composite`
 * and track `start` / `duration` / `easing` have no v1 equivalent and are listed in `lost`.
 */
declare function timelineDocFromScene(scene: SceneV2Doc): {
    doc: TimelineDoc;
    lost: SceneLoss[];
};
/** Open any motion document (object or JSON text) as an editor document; throws `TimelineDocError` on anything else. */
declare function loadMotionDoc(input: unknown): {
    doc: TimelineDoc;
    lost: SceneLoss[];
};

export { TIMELINE_DOC_FORMAT, TIMELINE_DOC_LIMITS, TIMELINE_DOC_SCHEMA, TIMELINE_DOC_VERSION, TimelineDocError, addKeyframe, addLayer, bindHistoryKeys, copyKeyframes, createFixedClock, createSeededRandom, createTimelineDoc, createTimelineHistory, createTimelinePreview, editableKeyframes, groupLayers, historyKeyAction, interpolateValue, isLayerActive, isLayerLocked, isValidEasing, layerSubtree, loadMotionDoc, moveLayer, normalizeTimelineDoc, parseTimelineDoc, pasteKeyframes, removeKeyframes, removeLayers, resolveRandom, sampleTimelineDoc, scaleKeyframes, serializeTimelineDoc, setKeyframeEasing, setKeyframeProps, shiftKeyframes, timelineDocDuration, timelineDocFromAnimation, timelineDocFromScene, timelineDocToAnimation, timelineDocToScene, ungroupLayer, uniqueId, updateLayers, validateTimelineDoc };
export type { AddLayerOptions, ApplyOptions, FixedClock, HistoryOptions, KeyframeClip, SceneLoss, TimelineDoc, TimelineFrame, TimelineHistory, TimelineKeyframe, TimelineLayer, TimelinePreview, TimelineProblem, TimelineValue };
