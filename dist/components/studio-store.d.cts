/**
 * `motionary/studio/store` (= `motionary/components/studio-store`, 15.5) — team projects.
 *
 * A `ProjectStore` keeps Studio projects with a revision history and optimistic concurrency: every write names the
 * revision it was based on (`baseRev`), and a write on a stale base is refused as a `conflict` instead of silently
 * overwriting a teammate's work. Motionary ships no server:
 *
 * - `createMemoryProjectStore()` — in memory (tests, demos, a single tab).
 * - `createIndexedDBProjectStore()` — in the browser, per origin.
 * - `createHttpProjectStore(baseUrl, { fetch, headers })` — your own backend, REST shape:
 *   `GET /projects` · `GET|PUT|DELETE /projects/:name` (`If-Match: <rev>`; 409 conflict, 403 forbidden,
 *   429 quota) · `GET /projects/:name/revisions[/:rev]`. Tenancy, auth, quotas and audit live in that backend (or in
 *   the gateway in front of it); `examples/project-store-server` is a reference implementation.
 *
 * `detectConflict` / `mergeProjects` compare three versions layer by layer: edits to different layers merge, the same
 * layer changed on both sides is a conflict. `toAppStorage(store)` plugs a store into `createStudioApp({ storage })`.
 */
declare const STUDIO_STORE_VERSION = 1;
declare const STORE_LIMITS: {
    readonly name: 128;
    readonly bytes: number;
    readonly revisions: 50;
};
type StoreErrorCode = 'conflict' | 'not-found' | 'forbidden' | 'quota' | 'invalid' | 'too-large' | 'network' | 'server';
declare class StoreError extends Error {
    readonly code: StoreErrorCode;
    /** On `conflict`: the revision the store holds now. */
    readonly currentRev?: string;
    constructor(code: StoreErrorCode, message: string, currentRev?: string);
}
interface ProjectInfo {
    name: string;
    rev: string;
    size: number;
    savedAt: string;
}
interface ProjectRecord {
    name: string;
    rev: string;
    text: string;
    savedAt: string;
}
interface RevisionInfo {
    rev: string;
    size: number;
    savedAt: string;
}
interface PutOptions {
    baseRev?: string;
}
/** Anything that keeps projects with revisions. All methods are async. */
interface ProjectStore {
    list(): Promise<ProjectInfo[]>;
    get(name: string): Promise<ProjectRecord | null>;
    put(name: string, text: string, o?: PutOptions): Promise<{
        rev: string;
    }>;
    delete(name: string, o?: PutOptions): Promise<void>;
    /** Newest first. */
    history(name: string): Promise<RevisionInfo[]>;
    getRevision(name: string, rev: string): Promise<ProjectRecord | null>;
}
/** FNV-1a 32-bit over the UTF-16 code units, hex — a short content tag inside revision ids (not a security hash). */
declare function contentTag(text: string): string;
/** In memory. `maxRevisions` (default 50) caps each project's history; `maxBytes` (default 4 MB) caps one project. */
declare function createMemoryProjectStore(o?: {
    maxRevisions?: number;
    maxBytes?: number;
}): ProjectStore;
/** In the browser's IndexedDB (database `dbName`, default "motionary-projects"; one object store "projects"). */
declare function createIndexedDBProjectStore(o?: {
    dbName?: string;
    maxRevisions?: number;
    maxBytes?: number;
    indexedDB?: IDBFactory;
}): ProjectStore;
/** Your own backend (see the module comment for the REST shape). `headers` go on every request (e.g. auth). */
declare function createHttpProjectStore(baseUrl: string, o?: {
    fetch?: typeof fetch;
    headers?: Record<string, string>;
}): ProjectStore;
/** Which layers each side changed (added, edited or removed) since `base`, and which both changed differently. */
declare function detectConflict(base: string, mine: string, theirs: string): {
    conflicts: string[];
    mine: string[];
    theirs: string[];
};
/**
 * Three-way merge at layer granularity. Starts from `theirs` (what the store holds now) and applies `mine`'s layer
 * changes. Same layer changed on both sides (differently) → `{ ok: false, conflicts }`, nothing merged. Document-level
 * fields other than layers (duration, meta, editor state) come from `mine` when only `mine` changed them, else `theirs`.
 */
declare function mergeProjects(base: string, mine: string, theirs: string): {
    ok: boolean;
    text?: string;
    conflicts: string[];
};
/**
 * A `createStudioApp({ storage })` adapter. `read` remembers the revision (and text) it returned; `write` saves on that
 * base. If someone else saved in between: `merge: 'refuse'` (default) throws a `conflict` StoreError ("saved by someone
 * else"); `merge: 'auto'` merges non-overlapping layer edits and saves the result, and throws on a real conflict.
 */
declare function toAppStorage(store: ProjectStore, o?: {
    merge?: 'refuse' | 'auto';
}): {
    read(name: string): Promise<string | null>;
    write(name: string, text: string): Promise<void>;
};

export { STORE_LIMITS, STUDIO_STORE_VERSION, StoreError, contentTag, createHttpProjectStore, createIndexedDBProjectStore, createMemoryProjectStore, detectConflict, mergeProjects, toAppStorage };
export type { ProjectInfo, ProjectRecord, ProjectStore, PutOptions, RevisionInfo, StoreErrorCode };
