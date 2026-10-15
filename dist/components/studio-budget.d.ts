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

/**
 * 16.3: performance budget in Studio. While you edit, measure what the export will cost — the bytes of the 14.7
 * standalone export (raw, and gzip where `CompressionStream` exists) and a frame cost from the baked tracks (each
 * property changing in a frame adds its class cost: composite 1, paint 4, layout 10) — check it against your limits,
 * block "publish export" when it is over budget (the publish callback is never called), and show a small live meter.
 * Opt-in entry `motionary/studio/budget` (= `motionary/components/studio-budget`); not in lite or studio.
 */

type PropClass = 'composite' | 'paint' | 'layout';
declare const PROP_COST: Record<PropClass, number>;
interface FrameCost {
    /** Highest frame cost, the start time (ms) of its first frame, and how many frames were checked. */
    peak: number;
    peakAt: number;
    frames: number;
    /** `target property` pairs that animate layout / paint properties (in document order). */
    layout: string[];
    paint: string[];
}
interface BudgetMeasure {
    bytes: number;
    gzipBytes: number | null;
    files: Record<string, number>;
    cost: FrameCost;
}
interface BudgetLimits {
    /** Raw export size limit in KB (1024 bytes). */
    kb?: number;
    /** Gzip size limit in KB, checked only where gzip could be measured. */
    gzipKb?: number;
    frameCost?: number;
    /** `false` = no layout property may animate. */
    layout?: boolean;
}
interface BudgetOver {
    metric: 'kb' | 'gzipKb' | 'frameCost' | 'layout';
    value: number;
    limit: number;
}
interface BudgetCheck {
    ok: boolean;
    over: BudgetOver[];
}
interface GuardResult<R> {
    ok: boolean;
    value?: R;
    over?: BudgetOver[];
    measure: BudgetMeasure;
}
/** Rendering class of a CSS property (camelCase or kebab-case); unknown and custom properties count as paint. */
declare function propClass(prop: string): PropClass;
/** Cost of every frame at `fps` (default 60): the sum of the costs of the properties whose value changes in it. */
declare function frameCost(input: ExportInput, o?: {
    fps?: number;
}): FrameCost;
/** Measure the standalone export of a project (same options as `exportStandalone`). Deterministic. */
declare function measureExport(input: ExportInput, o?: ExportOptions): Promise<BudgetMeasure>;
/** Every metric over its limit (order: kb, gzipKb, frameCost, layout). */
declare function checkBudget(m: BudgetMeasure, l: BudgetLimits): BudgetCheck;
/** "Publish export" with a budget: over budget → `{ ok: false, over }` and `publish` is not called. */
declare function guardPublish<R>(input: ExportInput, limits: BudgetLimits, publish: (files: Map<string, string | Uint8Array>, measure: BudgetMeasure) => R | Promise<R>, o?: ExportOptions): Promise<GuardResult<Awaited<R>>>;
/** A live meter (`role="status"`, polite): "12.3 KB / 20 KB · gzip 4.1 KB · cost 14 / 30"; `data-over` names the first metric over. */
declare function createBudgetMeter(el: HTMLElement, limits: BudgetLimits): {
    update(m: BudgetMeasure): BudgetCheck;
    destroy(): void;
};

export { PROP_COST, checkBudget, createBudgetMeter, frameCost, guardPublish, measureExport, propClass };
export type { BudgetCheck, BudgetLimits, BudgetMeasure, BudgetOver, FrameCost, GuardResult, PropClass };
