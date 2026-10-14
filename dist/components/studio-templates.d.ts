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

/**
 * 14.8 templates & extension ecosystem — `motionary/studio/templates` (= `motionary/components/studio-templates`).
 *
 * A template file (`motionary-template` v1) is data only: a manifest (id, name, SemVer version, SPDX license, author,
 * required Motionary modules, an optional token theme and preview time), a 14.5 studio pack (the project + its asset
 * files) and a `sha256-…` integrity value over both, optionally signed by its publisher (Ed25519, WebCrypto).
 *
 * - `parseTemplate` checks shape, limits, integrity and every packed file (scripts and out-of-project paths refused)
 *   and never throws; `verifyTemplate` adds the publisher signature against your trusted keys.
 * - `installTemplate` adds the template's layers to an editor history as ONE undo step (layer / keyframe ids prefixed,
 *   assets under `templates/<id>/`, a record in `meta['motionary:templates']`); `uninstallTemplate` removes exactly
 *   that, so the serialized project is byte-identical to the one before the install.
 * - `previewTemplate` renders the template with the 14.7 standalone export as one inline HTML file without scripts
 *   (CSS only, frozen at the preview time) for a sandboxed iframe.
 *
 * Pure: no DOM, no network, nothing evaluated. SHA-256 is plain JS (sync); only signatures use WebCrypto.
 */

declare const STUDIO_TEMPLATES_VERSION = 1;
declare const TEMPLATE_FORMAT = "motionary-template";
/** Where installs are recorded in the project (`doc.meta`). */
declare const TEMPLATE_META_KEY = "motionary:templates";
/** Hard limits: template text, layers, keyframes, packed files, bytes per file, token theme (JSON chars), required modules. */
declare const TEMPLATE_LIMITS: {
    readonly textBytes: 10000000;
    readonly layers: 200;
    readonly keyframes: 20000;
    readonly files: 100;
    readonly fileBytes: 5000000;
    readonly tokensBytes: 64000;
    readonly requires: 32;
};
interface TemplateManifest {
    id: string;
    name: string;
    /** SemVer. */
    version: string;
    /** SPDX license expression (`MIT`, `Apache-2.0`, `MIT OR Apache-2.0`, `LicenseRef-…`, `UNLICENSED`). */
    license: string;
    author?: string;
    description?: string;
    homepage?: string;
    /** Motionary modules the template needs (`motionary/studio`, `motionary/runtime/text`, …). */
    requires?: string[];
    /** A `motionary/tokens` theme (JSON data). */
    tokens?: Record<string, unknown>;
    /** Time (ms) a still preview shows. */
    preview?: {
        time: number;
    };
}
interface TemplateSignature {
    alg: 'Ed25519';
    keyId: string;
    value: string;
}
interface MotionaryTemplate {
    format: typeof TEMPLATE_FORMAT;
    version: 1;
    manifest: TemplateManifest;
    integrity: string;
    pack: string;
    signature?: TemplateSignature;
}
type TemplateReason = 'size' | 'json' | 'format' | 'manifest' | 'id' | 'name' | 'semver' | 'license' | 'requires' | 'tokens' | 'preview' | 'integrity' | 'signature' | 'pack' | 'path' | 'script' | 'limit' | 'prefix' | 'conflict' | 'installed' | 'not-installed' | 'meta' | 'in-use' | 'invalid';
interface TemplateProblem {
    path: string;
    reason: TemplateReason;
    message: string;
}
interface TemplateInfo {
    id: string;
    name: string;
    version: string;
    license: string;
    author?: string;
    description?: string;
    homepage?: string;
    requires: string[];
    missing: string[];
    layers: number;
    files: number;
    duration: number;
    integrity: string;
    signed: boolean;
}
interface ParsedTemplate {
    ok: boolean;
    template?: MotionaryTemplate;
    info?: TemplateInfo;
    doc?: TimelineDoc;
    ui?: StudioUiState;
    files?: Map<string, Uint8Array>;
    errors: TemplateProblem[];
}
interface TemplateRecord {
    id: string;
    version: string;
    license: string;
    prefix: string;
    layers: string[];
    files: string[];
    at?: number;
    hostDuration?: number;
    createdMeta?: boolean;
    createdKey?: boolean;
}
interface InstallResult {
    ok: boolean;
    record?: TemplateRecord;
    doc?: TimelineDoc;
    files: Map<string, Uint8Array>;
    warnings: string[];
    errors: TemplateProblem[];
}
interface UninstallResult {
    ok: boolean;
    removed: string[];
    files: string[];
    doc?: TimelineDoc;
    errors: TemplateProblem[];
}
interface VerifyResult {
    ok: boolean;
    integrity: boolean;
    signature: 'valid' | 'invalid' | 'missing' | 'untrusted' | 'unsupported';
    errors: TemplateProblem[];
}
declare class TemplateError extends Error {
    readonly problems: TemplateProblem[];
    constructor(problems: TemplateProblem[]);
}
/** SHA-256 of `bytes` (pure JS, synchronous). */
declare function sha256(bytes: Uint8Array): Uint8Array;
/** The integrity value a template must carry: `sha256-` + base64 of SHA-256 over the canonical manifest and the pack text. */
declare function templateIntegrity(t: {
    manifest: unknown;
    pack: string;
}): string;
/** Check a template (text or object): shape, manifest, limits, integrity, every packed file. Never throws. */
declare function parseTemplate(input: string | Record<string, unknown> | MotionaryTemplate): ParsedTemplate;
/** A template from a Studio project (text or `{ doc, ui }`) and its asset files. Throws for a bad manifest, missing / script / unsafe assets or limits. */
declare function createTemplate(project: string | {
    doc: TimelineDoc;
    ui?: StudioUiState;
}, o: {
    manifest: TemplateManifest;
    assets?: AssetFiles;
}): MotionaryTemplate;
/** The template as JSON text (stable: canonical manifest, fixed key order). */
declare function serializeTemplate(t: MotionaryTemplate): string;
/** Id, version, license, author, required modules (and which of them are not in `available`), layer / file counts. Throws for an invalid template. */
declare function templateInfo(t: MotionaryTemplate | string, o?: {
    available?: Iterable<string>;
}): TemplateInfo;
/** Sign a template's integrity value with an Ed25519 private key (WebCrypto). */
declare function signTemplate(t: MotionaryTemplate, privateKey: CryptoKey, keyId: string): Promise<MotionaryTemplate>;
/** Integrity + (optional) publisher signature. `keys`: keyId → Ed25519 public key (raw 32 bytes as base64, or a CryptoKey). */
declare function verifyTemplate(t: MotionaryTemplate | string, o?: {
    keys?: Record<string, string | CryptoKey>;
    requireSignature?: boolean;
}): Promise<VerifyResult>;
/** Templates installed in a document (from its `meta`). */
declare const installedTemplates: (doc: TimelineDoc) => TemplateRecord[];
/** Add a template to the history's document as ONE undo step. Nothing changes on any error. `files` = the asset files to add next to the project. */
declare function installTemplate(history: TimelineHistory, t: MotionaryTemplate | string, o?: {
    prefix?: string;
    at?: number;
    available?: Iterable<string>;
}): InstallResult;
/** Remove exactly what `installTemplate` added (layers, record, duration / meta it created) as ONE undo step. `files` = asset paths to delete. */
declare function uninstallTemplate(history: TimelineHistory, id: string): UninstallResult;
/**
 * The template as one inline HTML file (14.7 export). Default: no scripts (CSS only, `sandbox: ''`), frozen at
 * `time` (default: the manifest's preview time; `null` = plays). `js: true` adds the player (`sandbox: 'allow-scripts'`).
 */
declare function previewTemplate(t: MotionaryTemplate | string, o?: {
    time?: number | null;
    fps?: number;
    js?: boolean;
}): {
    html: string;
    sandbox: string;
    time: number | null;
    report: ExportReport;
};

export { STUDIO_TEMPLATES_VERSION, TEMPLATE_FORMAT, TEMPLATE_LIMITS, TEMPLATE_META_KEY, TemplateError, createTemplate, installTemplate, installedTemplates, parseTemplate, previewTemplate, serializeTemplate, sha256, signTemplate, templateInfo, templateIntegrity, uninstallTemplate, verifyTemplate };
export type { InstallResult, MotionaryTemplate, ParsedTemplate, TemplateInfo, TemplateManifest, TemplateProblem, TemplateReason, TemplateRecord, TemplateSignature, UninstallResult, VerifyResult };
