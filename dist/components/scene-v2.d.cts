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
declare const SCENE_V2_VERSION = 2;
/** 14.0: the official motion document (was 'draft' in 13.9). */
declare const SCENE_V2_STATUS = "stable";
declare const SCENE_V2_LIMITS: {
    readonly layers: 1000;
    readonly keyframes: 100000;
    readonly props: 64;
    readonly idLength: 128;
    readonly stringLength: 2048;
    readonly time: 10000000;
    readonly depth: 32;
    readonly textBytes: 5000000;
};
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
interface SceneProblem {
    path: string;
    message: string;
}
/** Whether `v` is a token reference (`"{duration.fast}"`). */
declare const isTokenRef: (v: unknown) => v is string;
/**
 * Every problem with a scene v2 document (an object or JSON text). Never throws —
 * not on wrong types, circular objects, or invalid JSON; `[]` means valid.
 */
declare function validateSceneV2(input: unknown): SceneProblem[];
/** Whether `input` is a valid scene v2 document. */
declare const isSceneV2: (input: unknown) => input is SceneV2Doc;
type MotionSourceFormat = 'motionary-scene@2' | 'motionary-timeline@1' | 'animation@1' | 'playground' | 'unknown';
/** Which motion document `input` (object or JSON text) looks like. Never throws. */
declare function detectMotionFormat(input: unknown): MotionSourceFormat;
/** Canonical form of a valid scene: fixed key order, keyframes sorted by time (stable), prop names sorted, defaults omitted. */
declare function normalizeSceneV2(doc: SceneV2Doc): SceneV2Doc;
/** Canonical JSON text of a scene. */
declare const serializeSceneV2: (doc: SceneV2Doc, space?: number | string) => string;
/** `motionary-timeline` v1 → scene v2. Lossless: `sceneV2ToTimeline(sceneV2FromTimeline(d))` equals the canonical `d`. */
declare function sceneV2FromTimeline(doc: TimelineDoc): SceneV2Doc;
/** Animation JSON v1 (`<usa-player>`) → scene v2: one track layer per player track (keyframe, preset and effect tracks all kept). */
declare function sceneV2FromAnimation(a: AnimationJSON, sourceFormat?: string): SceneV2Doc;
/** Replace every token reference with its value (scene tokens first, then `tokens`, default the built-in scale). */
declare function resolveSceneTokens(doc: SceneV2Doc, tokens?: MotionTokens): SceneV2Doc;
/** What a scene loses when converted back to a 13.x format. */
interface SceneLoss {
    path: string;
    message: string;
}
/**
 * Scene v2 → `motionary-timeline` v1 (for the 13.x Timeline editor). Token
 * references are resolved; preset / effect / component layers and `loop`,
 * `tokens`, track `start` / `duration` / `easing` have no v1 equivalent and
 * are listed in `lost`.
 */
declare function sceneV2ToTimeline(doc: SceneV2Doc): {
    doc: TimelineDoc;
    lost: SceneLoss[];
};
/**
 * Scene v2 → `<usa-player>` animation JSON v1 (what 13.x plays). Token references
 * are resolved; groups, lock / mute / solo state, ids, seed and components are editor
 * state and listed in `lost`; muted layers (and non-solo layers when any is solo) are left out.
 */
declare function sceneV2ToAnimation(doc: SceneV2Doc): {
    animation: AnimationJSON;
    lost: SceneLoss[];
};
/**
 * A scene layer that binds a component's motion props (`duration`, `delay`,
 * `easing`, …), optionally replacing literal values with matching token references.
 */
declare function sceneV2ComponentLayer(id: string, tag: string, props: Record<string, SceneValue>, o?: {
    target?: string;
    tokenize?: boolean;
    tokens?: MotionTokens;
}): SceneLayer;
/** The token reference for a literal duration (ms) / easing that equals a token value, else the literal. */
declare function tokenizeValue(prop: string, v: SceneValue, tokens?: MotionTokens): SceneValue;
interface MigrationReport {
    from: MotionSourceFormat;
    /** What the migration changed, in plain words. */
    changes: string[];
    /** Data that did not carry over (empty for timeline and animation v1 sources). */
    lost: SceneLoss[];
    warnings: string[];
    stats: {
        layers: number;
        keyframes: number;
        tokenized: number;
    };
}
interface MigrationResult {
    ok: boolean;
    doc?: SceneV2Doc;
    problems: SceneProblem[];
    report: MigrationReport;
}
interface MigrateOptions {
    /** Replace literal durations / easings equal to a motion token with `{group.name}` references. Default false. */
    tokenize?: boolean;
    tokens?: MotionTokens;
}
/**
 * Migrate a 13.x motion document (object or JSON text) — `motionary-timeline` v1,
 * `<usa-player>` animation JSON v1, or the legacy playground state — to scene v2.
 * A scene v2 input is validated and normalized. Never throws: on failure `ok` is
 * false and `problems` says why.
 */
declare function migrateToSceneV2(input: unknown, o?: MigrateOptions): MigrationResult;
interface JsonChange {
    path: string;
    op: 'add' | 'remove' | 'change';
    from?: unknown;
    to?: unknown;
}
/** A structural diff of two JSON values (paths like `layers[0].keyframes[1].time`). */
declare function diffJson(a: unknown, b: unknown, path?: string): JsonChange[];
/** Human-readable migration report (what `motionary migrate --report` prints). */
declare function formatMigrationReport(r: MigrationResult, file?: string): string;

declare const SCENE_V2_SCHEMA: {
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $id: "https://cdn.jsdelivr.net/npm/motionary@16/docs/scene-v2.schema.json";
    readonly title: "motionary-scene v2 (draft)";
    readonly description: "Draft of the 14.0 scene format: one document for timeline layers, <usa-player> tracks, component motion props and motion tokens. Values may reference tokens as \"{duration.fast}\".";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["format", "version", "layers"];
    readonly properties: {
        readonly format: {
            readonly const: "motionary-scene";
        };
        readonly version: {
            readonly const: 2;
        };
        readonly name: {
            readonly type: "string";
            readonly maxLength: 2048;
        };
        readonly duration: {
            type: string;
            minimum: number;
            maximum: number;
        };
        readonly loop: {
            readonly type: "boolean";
        };
        readonly seed: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly maximum: 4294967295;
        };
        readonly tokens: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly duration: {
                    readonly type: "object";
                    readonly propertyNames: {
                        pattern: string;
                    };
                    readonly additionalProperties: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                };
                readonly easing: {
                    readonly type: "object";
                    readonly propertyNames: {
                        pattern: string;
                    };
                    readonly additionalProperties: {
                        readonly type: "string";
                        readonly maxLength: 200;
                    };
                };
                readonly spring: {
                    readonly type: "object";
                    readonly propertyNames: {
                        pattern: string;
                    };
                    readonly additionalProperties: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["stiffness", "damping", "mass"];
                        readonly properties: {
                            readonly stiffness: {
                                readonly type: "number";
                                readonly minimum: 0;
                            };
                            readonly damping: {
                                readonly type: "number";
                                readonly minimum: 0;
                            };
                            readonly mass: {
                                readonly type: "number";
                                readonly minimum: 0;
                            };
                        };
                    };
                };
            };
        };
        readonly source: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["format"];
            readonly properties: {
                readonly format: {
                    readonly type: "string";
                    readonly maxLength: 200;
                };
                readonly version: {
                    readonly type: "integer";
                };
            };
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
                    readonly start: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    readonly duration: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    readonly easing: {
                        readonly type: "string";
                        readonly maxLength: 200;
                    };
                    readonly preset: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 200;
                    };
                    readonly effect: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 200;
                    };
                    readonly options: {
                        readonly type: "object";
                    };
                    readonly component: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["tag", "props"];
                        readonly properties: {
                            readonly tag: {
                                readonly type: "string";
                                readonly pattern: "^[a-z][a-z0-9]*-[a-z0-9-]*$";
                                readonly maxLength: 128;
                            };
                            readonly props: {
                                readonly type: "object";
                                readonly propertyNames: {
                                    pattern: string;
                                    not: {
                                        enum: string[];
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
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                readonly easing: {
                                    readonly type: "string";
                                    readonly maxLength: 200;
                                };
                                readonly composite: {
                                    readonly enum: readonly ["replace", "add", "accumulate"];
                                };
                                readonly props: {
                                    readonly type: "object";
                                    readonly maxProperties: 64;
                                    readonly propertyNames: {
                                        pattern: string;
                                        not: {
                                            enum: string[];
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
                readonly allOf: readonly [{
                    readonly if: {
                        readonly properties: {
                            readonly type: {
                                readonly const: "group";
                            };
                        };
                    };
                    readonly then: {
                        readonly not: {
                            readonly anyOf: {
                                required: string[];
                            }[];
                        };
                    };
                }, {
                    readonly not: {
                        readonly anyOf: readonly [{
                            readonly required: readonly ["keyframes", "preset"];
                        }, {
                            readonly required: readonly ["keyframes", "effect"];
                        }, {
                            readonly required: readonly ["preset", "effect"];
                        }];
                    };
                }];
            };
        };
    };
};

export { SCENE_V2_FORMAT, SCENE_V2_LIMITS, SCENE_V2_SCHEMA, SCENE_V2_STATUS, SCENE_V2_VERSION, detectMotionFormat, diffJson, formatMigrationReport, isSceneV2, isTokenRef, migrateToSceneV2, normalizeSceneV2, resolveSceneTokens, sceneV2ComponentLayer, sceneV2FromAnimation, sceneV2FromTimeline, sceneV2ToAnimation, sceneV2ToTimeline, serializeSceneV2, tokenizeValue, validateSceneV2 };
export type { JsonChange, MigrateOptions, MigrationReport, MigrationResult, MotionSourceFormat, SceneComponentBinding, SceneKeyframe, SceneLayer, SceneLoss, SceneProblem, SceneV2Doc, SceneValue };
