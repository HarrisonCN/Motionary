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
interface SceneProblem {
    path: string;
    message: string;
}
type MotionSourceFormat = 'motionary-scene@2' | 'motionary-timeline@1' | 'animation@1' | 'playground' | 'unknown';
/** What a scene loses when converted back to a 13.x format. */
interface SceneLoss {
    path: string;
    message: string;
}
interface MigrateOptions {
    /** Replace literal durations / easings equal to a motion token with `{group.name}` references. Default false. */
    tokenize?: boolean;
    tokens?: MotionTokens;
}

interface VariantLayer {
    muted?: boolean;
    distanceScale?: number;
    timeScale?: number;
}
interface MotionVariant {
    id: string;
    media: {
        minWidth?: number;
        maxWidth?: number;
    };
    layers?: Record<string, VariantLayer>;
}

/** A flat Scene v3 document (no comps / component layers / components) as Scene v2 (variants back to meta); `undefined` otherwise. */
declare function flatSceneV3ToV2(d: any): any;
/** Scene v2 → flat Scene v3 (16.0 write format): version 3, variants out of meta (an empty meta is dropped). */
declare function sceneV2ToFlatV3(d: any): any;

declare const SCENE_V3_FORMAT = "motionary-scene";
declare const SCENE_V3_VERSION = 3;
/** 15.9: draft. 16.0: stable — the write format. */
declare const SCENE_V3_STATUS = "stable";
declare const SCENE_V3_LIMITS: {
    readonly compDepth: 8;
    readonly components: 256;
    readonly rate: 16;
    readonly depth: 64;
    readonly layers: 1000;
    readonly keyframes: 100000;
    readonly props: 64;
    readonly idLength: 128;
    readonly stringLength: 2048;
    readonly time: 10000000;
    readonly textBytes: 5000000;
};
interface SceneTimeRemap {
    offset?: number;
    rate?: number;
}
interface SceneV3Override {
    target?: string;
    muted?: boolean;
    props?: Record<string, SceneValue>;
}
interface LayerBase {
    id: string;
    name?: string;
    parent?: string;
    locked?: boolean;
    muted?: boolean;
    solo?: boolean;
}
interface SceneV3Comp extends LayerBase {
    type: 'comp';
    start?: number;
    duration?: number;
    timeRemap?: SceneTimeRemap;
    layers: SceneV3Layer[];
}
interface SceneV3ComponentLayer extends LayerBase {
    type: 'component';
    ref: string;
    target?: string;
    start?: number;
    overrides?: Record<string, SceneV3Override>;
}
type SceneV3Layer = SceneLayer | SceneV3Comp | SceneV3ComponentLayer;
interface SceneV3Component {
    name?: string;
    layers: SceneV3Layer[];
}
interface SceneV3Doc {
    format: typeof SCENE_V3_FORMAT;
    version: 3;
    name?: string;
    duration?: number;
    loop?: boolean;
    seed?: number;
    tokens?: SceneV2Doc['tokens'];
    layers: SceneV3Layer[];
    components?: Record<string, SceneV3Component>;
    variants?: MotionVariant[];
    source?: {
        format: string;
        version?: number;
    };
    meta?: unknown;
}
/** One 16.0 change, announced in 15.9 (docs/deprecations-v16.md#<id>). */
interface Deprecation16 {
    id: string;
    removedIn: '16.0';
    what: string;
    fix: string;
    doc: string;
}
/** Everything 16.0 changes or removes. `doctor --v16` finds each, `migrate --to 16` handles what is mechanical. */
declare const DEPRECATIONS_V16: readonly Deprecation16[];
/**
 * Every problem with a Scene v3 document (object or JSON text). Never throws; `[]` means valid.
 * Track and group layers follow the v2 rules at every nesting level.
 */
declare function validateSceneV3(input: unknown): SceneProblem[];
/** Whether `input` is a valid Scene v3 document. */
declare const isSceneV3: (input: unknown) => input is SceneV3Doc;
/** Canonical form of a valid v3 document: fixed key order, v2 canonical track / group layers at every level. */
declare function normalizeSceneV3(doc: SceneV3Doc): SceneV3Doc;
/** Canonical JSON text of a v3 document. */
declare const serializeSceneV3: (doc: SceneV3Doc, space?: number | string) => string;
interface SceneV3MigrationReport {
    from: MotionSourceFormat | 'motionary-scene@3';
    /** true when nothing was lost (lost is empty). */
    lossless: boolean;
    changes: string[];
    lost: SceneLoss[];
    warnings: string[];
    stats: {
        layers: number;
        keyframes: number;
        variants: number;
    };
}
interface SceneV3MigrationResult {
    ok: boolean; /** always true in 15.x: a preview, nothing is written. */
    dryRun: true;
    doc?: SceneV3Doc;
    problems: SceneProblem[];
    report: SceneV3MigrationReport;
}
interface MigrateV3Options extends MigrateOptions {
    /** Accepted for the 16.0 signature; 15.9 always previews (nothing is written either way — the function is pure). */
    dryRun?: boolean;
}
/**
 * Preview the move of a motion document (Scene v2, or any 13.x format `migrateToSceneV2` reads) to Scene v3.
 * Never throws and never mutates `input`; `report.lossless` / `report.lost` say whether everything carried over.
 */
declare function migrateToSceneV3(input: unknown, o?: MigrateV3Options): SceneV3MigrationResult;
/**
 * Read a v3 document as Scene v2 (for 15.x consumers and every v2-only API). Compositions become groups with their
 * start / time remap baked into keyframe times; component instances are expanded (`<instance>/<layer>` ids, targets
 * scoped under the instance target, overrides applied); variants go back to meta. Every such step is listed in `lost`.
 */
declare function sceneV3ToV2(doc: SceneV3Doc): {
    doc: SceneV2Doc;
    lost: SceneLoss[];
};

export { DEPRECATIONS_V16, SCENE_V3_FORMAT, SCENE_V3_LIMITS, SCENE_V3_STATUS, SCENE_V3_VERSION, flatSceneV3ToV2, isSceneV3, migrateToSceneV3, normalizeSceneV3, sceneV2ToFlatV3, sceneV3ToV2, serializeSceneV3, validateSceneV3 };
export type { Deprecation16, MigrateV3Options, SceneTimeRemap, SceneV3Comp, SceneV3Component, SceneV3ComponentLayer, SceneV3Doc, SceneV3Layer, SceneV3MigrationReport, SceneV3MigrationResult, SceneV3Override };
