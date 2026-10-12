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

/** What a scene loses when opened as a timeline v1 document. */
interface SceneLoss {
    path: string;
    message: string;
}

interface SpringParams {
    stiffness: number;
    damping: number;
    mass: number;
}

/**
 * 14.4 Motion Studio: save / load. A Studio project is `{ format: 'motionary-studio', version: 1, scene, studio }`:
 * `scene` is the document as Scene Format v2 (`timelineDocToScene`, lossless), `studio` is editor state (time, zoom,
 * fps, collapsed groups, spring parameters). `parseStudioProject` also opens a bare Scene v2 document, a
 * `motionary-timeline` v1 document or `<usa-player>` animation JSON, checks size and shape (never evaluates input) and
 * drops editor state that does not match the document. `sampleFrames` is the reference for "same animation":
 * every frame at a fixed frame rate, a pure function of the document.
 */

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

/**
 * 14.5 project & asset workflow (`motionary/studio/assets`): image, SVG, font, video and audio references in a Studio
 * project, relative path resolution confined to the project directory, an offline project pack (one JSON file holding
 * the project and every referenced local asset) and missing-asset reports / relinking after a project moved to another
 * device. Pure: no DOM, no network, no file system — callers pass bytes and file lists in and get bytes and reports out.
 * Nothing is ever executed: script-like files (`.js`, `.html`, `.wasm`, …) are reported and never packed, unpacked
 * or suggested.
 */

declare const STUDIO_ASSETS_VERSION = 1;
declare const STUDIO_PACK_FORMAT = "motionary-studio-pack";
/** Hard limits: assets per project / pack, path length, bytes per file, pack text length. */
declare const ASSET_LIMITS: {
    readonly assets: 2000;
    readonly pathLength: 1024;
    readonly fileBytes: 50000000;
    readonly packBytes: 200000000;
};
type AssetKind = 'image' | 'svg' | 'font' | 'video' | 'audio' | 'data' | 'script' | 'other';
type AssetPathReason = 'empty' | 'length' | 'control' | 'encoding' | 'absolute' | 'scheme' | 'outside' | 'directory' | 'forbidden';
interface AssetUse {
    layer: string;
    keyframe: string;
    prop: string;
}
interface AssetRef {
    path: string;
    kind: AssetKind;
    uses: AssetUse[];
}
interface AssetEntry {
    path: string;
    kind: AssetKind;
    bytes?: number;
    crc32?: number;
}
interface RejectedRef extends AssetUse {
    ref: string;
    reason: AssetPathReason;
}
interface AssetRefReport {
    assets: AssetRef[];
    external: (AssetUse & {
        ref: string;
    })[];
    rejected: RejectedRef[];
}
type AssetFiles = Record<string, Uint8Array> | Map<string, Uint8Array>;
type AssetAvailability = AssetFiles | Iterable<string> | ((path: string) => boolean);
interface AssetCheck {
    ok: boolean;
    found: string[];
    missing: AssetEntry[];
    changed: AssetEntry[];
    rejected: RejectedRef[];
    messages: string[];
}
interface RelinkSuggestion {
    from: string;
    to: string;
    by: 'content' | 'name';
}
interface PackResult {
    text: string;
    missing: string[];
    skipped: {
        path: string;
        reason: string;
    }[];
}
interface UnpackProblem {
    path: string;
    reason: string;
}
interface UnpackResult {
    project: {
        doc: TimelineDoc;
        ui: StudioUiState;
        lost: SceneLoss[];
    };
    files: Map<string, Uint8Array>;
    problems: UnpackProblem[];
}
declare class AssetPathError extends Error {
    readonly path: string;
    readonly reason: AssetPathReason;
    constructor(path: string, reason: AssetPathReason);
}
/** Kind of an asset by its extension (case-insensitive; query and hash ignored). */
declare function assetKind(path: string): AssetKind;
/** `https:` and `data:` references: external, never resolved or packed. */
declare const isExternalAsset: (ref: string) => boolean;
/** A project-relative POSIX path (`./`, inner `..`, `//` and `\` normalized). Throws `AssetPathError` for anything that leaves the project, is absolute, has a scheme or control characters. */
declare const normalizeAssetPath: (path: string) => string;
/** `ref` resolved relative to the project file that holds it (`from`, e.g. `scenes/intro.json`), still confined to the project root. */
declare function resolveAssetPath(ref: string, from?: string): string;
/** Asset references in a document: `url(…)` in any string value and whole values of `*src` props (`--src`, `--font-src`). */
declare function collectAssetRefs(doc: TimelineDoc): AssetRef[];
declare function collectAssetRefs(doc: TimelineDoc, o: {
    report: true;
}): AssetRefReport;
/** The document's assets with size and CRC-32 for the files that exist. */
declare function createAssetManifest(doc: TimelineDoc, files?: AssetFiles): AssetEntry[];
/** Which assets of a manifest (or a document) are available, missing, changed (size / CRC differ) or rejected (unsafe path). */
declare function checkAssets(target: AssetEntry[] | TimelineDoc, available: AssetAvailability): AssetCheck;
/** New locations for missing assets: by content (size + CRC-32) when exactly one file matches, else by a unique file name. Never a script or an unsafe path. */
declare function relinkAssets(manifest: AssetEntry[], available: AssetFiles): RelinkSuggestion[];
/** One JSON file with the project and every referenced local asset (deterministic). External URLs stay references; scripts are never packed. */
declare function packStudioProject(project: string | {
    doc: TimelineDoc;
    ui?: StudioUiState;
}, files: AssetFiles): PackResult;
/** Open a pack: the project (checked like `parseStudioProject`) and the files whose path, size, CRC-32 and data check out; the rest are listed in `problems`. */
declare function unpackStudioProject(text: string): UnpackResult;
/** CRC-32 (IEEE, as zip / PNG). */
declare function crc32(b: Uint8Array): number;
/** Standard base64 (with padding). */
declare function toBase64(b: Uint8Array): string;
/** Strict base64 decode (throws on bad length, characters or padding). */
declare function fromBase64(s: string): Uint8Array;

export { ASSET_LIMITS, AssetPathError, STUDIO_ASSETS_VERSION, STUDIO_PACK_FORMAT, assetKind, checkAssets, collectAssetRefs, crc32, createAssetManifest, fromBase64, isExternalAsset, normalizeAssetPath, packStudioProject, relinkAssets, resolveAssetPath, toBase64, unpackStudioProject };
export type { AssetAvailability, AssetCheck, AssetEntry, AssetFiles, AssetKind, AssetPathReason, AssetRef, AssetRefReport, AssetUse, PackResult, RejectedRef, RelinkSuggestion, UnpackProblem, UnpackResult };
