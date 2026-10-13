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

interface TimelineFrame {
    /** The sampled time (clamped to 0…duration). */
    time: number;
    /** Active track id → property → value. */
    layers: Record<string, Record<string, TimelineValue>>;
}

/**
 * 14.5 project & asset workflow (`motionary/studio/assets`): image, SVG, font, video and audio references in a Studio
 * project, relative path resolution confined to the project directory, an offline project pack (one JSON file holding
 * the project and every referenced local asset) and missing-asset reports / relinking after a project moved to another
 * device. Pure: no DOM, no network, no file system — callers pass bytes and file lists in and get bytes and reports out.
 * Nothing is ever executed: script-like files (`.js`, `.html`, `.wasm`, …) are reported and never packed, unpacked
 * or suggested.
 */

type AssetFiles = Record<string, Uint8Array> | Map<string, Uint8Array>;

/**
 * 14.7 output & preview reliability — `motionary/studio/export` (= `motionary/components/studio-export`).
 *
 * - `bakeScene` turns a Studio project / Scene v2 / timeline document into per-property points: linear segments the
 *   browser interpolates exactly like the preview keep only their end points, every other segment (eased, discrete,
 *   custom properties) is sampled at each frame with `sampleTimelineDoc`, so the value at every frame time is the
 *   reference value. `random()` is resolved by seed.
 * - `exportStandalone` writes a work that plays without the editor and without a network: `index.html`, `scene.css`
 *   (CSS `@keyframes`, works with scripts off), `scene.js` (a small player, optional) and `assets/` (or one inline
 *   HTML file). Deterministic to the byte. Values, selectors, titles and stage markup are checked so nothing can
 *   leave its CSS declaration or HTML element; unsafe asset paths become `about:invalid`.
 * - `frameDigest` fingerprints "the same animation" (every frame at a frame rate).
 * - `createFrameExportJob` feeds frames to an adapter (the seam for GIF / video encoders) and can fail, keep a
 *   checkpoint and resume — fully independent of the basic export.
 *
 * Pure: the exporter reads no DOM, opens no network and evaluates nothing. The player is a string.
 */

declare const STUDIO_EXPORT_VERSION = 1;
declare const BAKED_FORMAT = "motionary-baked";
declare const FRAME_JOB_FORMAT = "motionary-frame-job";
/** Hard limits: baked points per scene (all tracks and properties), frames per job, frame rate range. */
declare const EXPORT_LIMITS: {
    readonly points: 200000;
    readonly frames: 100000;
    readonly fpsMin: 1;
    readonly fpsMax: 240;
};
type BakedPoint = [time: number, value: TimelineValue];
interface BakedTrack {
    id: string;
    target: string;
    props: Record<string, BakedPoint[]>;
}
interface BakedScene {
    format: typeof BAKED_FORMAT;
    version: 1;
    duration: number;
    fps: number;
    seed: number;
    tracks: BakedTrack[];
}
type ExportInput = string | TimelineDoc | Record<string, unknown> | {
    pack: string;
};
interface ExportOptions {
    fps?: number;
    /** Project-relative path → bytes (the 14.5 asset files). A pack input brings its own. */
    assets?: AssetFiles;
    /** One HTML file: CSS, data and player inline, local assets as data: URIs. */
    inline?: boolean;
    /** Include the player (default true). `false` = CSS only, no script. */
    js?: boolean;
    title?: string;
    lang?: string;
    loop?: boolean;
    /** Your stage markup (what the tracks target). Scripts, frames, inline handlers and javascript: URLs are removed. Default: one element per simple `#id` / `.class` / tag target. */
    stage?: string;
}
interface ExportReport {
    ok: boolean;
    digest: string;
    duration: number;
    fps: number;
    tracks: number;
    points: number;
    stage: 'given' | 'generated';
    assets: {
        copied: string[];
        missing: string[];
        external: string[];
        rejected: {
            ref: string;
            reason: string;
            layer: string;
            prop: string;
        }[];
    };
    warnings: string[];
}
interface ExportResult {
    files: Map<string, string | Uint8Array>;
    report: ExportReport;
}
/** Per-property points of every active track; the value at each frame time at `fps` equals `sampleTimelineDoc`. */
declare function bakeScene(input: ExportInput, o?: {
    fps?: number;
}): BakedScene;
/** The baked scene at `time` (what the exported player writes; equals `sampleTimelineDoc` at every frame time). */
declare function sampleBaked(b: BakedScene, time: number): TimelineFrame;
/** Fingerprint of every frame at `fps` (default 60): `mfd1-<fps>-<frames>-<crc32>`. Same text ⇔ same frames. */
declare function frameDigest(input: ExportInput, o?: {
    fps?: number;
}): string;
/** Your stage markup with scripts, frames, embeds, inline handlers and javascript: URLs removed (a guard, not a sanitizer for untrusted HTML). */
declare function cleanStage(html: string): string;
/** Standalone HTML / CSS (+ player JS) + assets for a project; deterministic. Never throws for asset problems — they are in `report`. */
declare function exportStandalone(input: ExportInput, o?: ExportOptions): ExportResult;
interface FrameAdapter<R = unknown> {
    begin?(info: {
        fps: number;
        total: number;
        from: number;
        duration: number;
        digest: string;
    }): void | Promise<void>;
    frame(index: number, frame: TimelineFrame): void | Promise<void>;
    end?(): R | Promise<R>;
    abort?(reason?: unknown): void;
}
interface FrameJobCheckpoint {
    format: typeof FRAME_JOB_FORMAT;
    version: 1;
    digest: string;
    fps: number;
    next: number;
    total: number;
}
type FrameJobStatus = 'idle' | 'running' | 'failed' | 'done' | 'aborted';
interface FrameJobResult<R = unknown> {
    ok: boolean;
    status: FrameJobStatus;
    next: number;
    total: number;
    result?: R;
    error?: unknown;
}
interface FrameExportJob<R = unknown> {
    readonly status: FrameJobStatus;
    readonly next: number;
    readonly total: number;
    readonly error: unknown;
    /** Serializable: pass it to a new job for the same scene to continue after a reload. */
    readonly checkpoint: FrameJobCheckpoint;
    run(): Promise<FrameJobResult<R>>;
    /** Continue from the checkpoint (the failed frame is retried). */
    resume(): Promise<FrameJobResult<R>>;
    abort(reason?: unknown): void;
}
/** Feed every frame (`sampleTimelineDoc` at `fps`) to `adapter`; a failure keeps a checkpoint, `resume()` continues there. */
declare function createFrameExportJob<R = unknown>(input: ExportInput, o: {
    adapter: FrameAdapter<R>;
    fps?: number;
    checkpoint?: FrameJobCheckpoint;
    onProgress?: (next: number, total: number) => void;
}): FrameExportJob<R>;
/** A deterministic adapter that keeps every frame state (for tests, or to hand frames to another process). */
declare function createJsonFramesAdapter(): FrameAdapter<{
    fps: number;
    digest: string;
    frames: TimelineFrame[];
}> & {
    readonly frames: TimelineFrame[];
};
/**
 * The player inside an export (ES5, no dependencies, ~1.7 KB): reads the baked data from
 * `<script type="application/json" id="motionary-scene">`, writes each frame as inline styles under
 * `[data-motionary-export]` (the CSS fallback is switched off by `<html class="mo-js">`) and exposes
 * `motionary.{seek(ms), play(), pause(), duration, digest, time}`. `?t=<ms>` freezes a frame; reduced motion shows the
 * final frame.
 */
declare const PLAYER_JS: string;

export { BAKED_FORMAT, EXPORT_LIMITS, FRAME_JOB_FORMAT, PLAYER_JS, STUDIO_EXPORT_VERSION, bakeScene, cleanStage, createFrameExportJob, createJsonFramesAdapter, exportStandalone, frameDigest, sampleBaked };
export type { BakedPoint, BakedScene, BakedTrack, ExportInput, ExportOptions, ExportReport, ExportResult, FrameAdapter, FrameExportJob, FrameJobCheckpoint, FrameJobResult, FrameJobStatus };
