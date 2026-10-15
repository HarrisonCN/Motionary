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
 * `motionary/studio/provenance` (= `motionary/components/studio-provenance`, 15.1) — where an edit came from.
 *
 * Every change an AI (or any generator) makes can carry `{ generator, model?, requestId?, at }`. The record is written
 * into the document itself (`meta['motionary:provenance']`, in the same undo step as the change), so it is saved with
 * the project, survives reopen, disappears again on undo, and shows up in the 14.7 export report.
 *
 * - `withProvenance(history, info)` wraps an editor history: every `apply()` through it records who made the change.
 *   Hand it to the 14.6 AI review / panel; their accept-as-one-step stays the only path that writes, so a proposal
 *   that was not accepted writes nothing — and leaves no record.
 * - `requestId` is the correlation id the call carried through MCP Gateway (`X-Request-Id` / `X-Correlation-Id`, or
 *   `params._meta.correlationId` on `/mcp`): same charset and length rule as the gateway (`[A-Za-z0-9._:-]{1,128}`), so
 *   `GET /api/v1/admin/ops/lineage?correlationId=<requestId>` (Gateway 15.1 canary) finds the call.
 *   `matchLineage()` joins records with lineage entries.
 * - `createProvenancePanel()` lists the changes, newest first, filterable (AI only, by request id).
 */

declare const STUDIO_PROVENANCE_VERSION = 1;
declare const PROVENANCE_META_KEY = "motionary:provenance";
/** The gateway's rule for client correlation ids (MCP Gateway 15.1 `X-Request-Id`). */
declare const REQUEST_ID_RE: RegExp;
declare const PROVENANCE_LIMITS: {
    readonly records: 500;
    readonly text: 200;
};
interface Provenance {
    /** Who made the change: `motionary/studio/ai`, `motionary-mcp/propose_edit`, your tool's name. */
    generator: string;
    model?: string;
    /** The correlation id of the call (MCP Gateway lineage). */
    requestId?: string;
    /** ISO time; default now. */
    at?: string;
}
interface ProvenanceRecord extends Required<Pick<Provenance, 'generator' | 'at'>> {
    id: string;
    model?: string;
    requestId?: string;
    label?: string;
    /** Layer ids the change added, removed or edited. */
    layers: string[];
}
interface LineageEntry {
    correlationId?: string;
    requestId?: string;
    [k: string]: unknown;
}
/** Problems with a provenance value ([] = fine). */
declare function validateProvenance(p: unknown): string[];
/** The provenance records of a document, oldest first (copies). */
declare function provenanceOf(doc: TimelineDoc): ProvenanceRecord[];
/** Records filtered by generator / request id / "AI only" (generator mentions ai, mcp or a model). */
declare function aiChanges(doc: TimelineDoc, f?: {
    generator?: string;
    requestId?: string;
    aiOnly?: boolean;
}): ProvenanceRecord[];
/** Layer ids that differ between two documents. */
declare function changedLayers(before: TimelineDoc, after: TimelineDoc): string[];
/** `doc` with one more record (pure). Throws on an invalid provenance. */
declare function recordProvenance(doc: TimelineDoc, p: Provenance, o?: {
    label?: string;
    layers?: string[];
    id?: string;
}): TimelineDoc;
/**
 * A history whose `apply()` records `info` (or `info()` evaluated per change) with the change, in the same undo step.
 * Everything else (undo / redo / begin / commit / subscribe …) is the wrapped history.
 */
declare function withProvenance(history: TimelineHistory, info: Provenance | (() => Provenance)): TimelineHistory;
/**
 * Join records with MCP Gateway lineage entries (`correlationId`, falling back to `requestId`). Takes the entries or the
 * response body of `GET /api/v1/admin/ops/lineage?correlationId=` (`{ lineage, total }`, Gateway 15.1 canary).
 */
declare function matchLineage(records: ProvenanceRecord[], lineage: LineageEntry[] | {
    lineage: LineageEntry[];
}): {
    matched: {
        record: ProvenanceRecord;
        lineage: LineageEntry;
    }[];
    missing: ProvenanceRecord[];
    unattributed: ProvenanceRecord[];
};
interface ProvenancePanel {
    readonly el: HTMLElement;
    refresh(): void;
    destroy(): void;
}
/** A list of the document's provenance records, newest first, with an "AI only" toggle and a request-id filter. */
declare function createProvenancePanel(root: HTMLElement, history: TimelineHistory): ProvenancePanel;

export { PROVENANCE_LIMITS, PROVENANCE_META_KEY, REQUEST_ID_RE, STUDIO_PROVENANCE_VERSION, aiChanges, changedLayers, createProvenancePanel, matchLineage, provenanceOf, recordProvenance, validateProvenance, withProvenance };
export type { LineageEntry, Provenance, ProvenancePanel, ProvenanceRecord };
