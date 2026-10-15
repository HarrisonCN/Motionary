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
const STUDIO_STORE_VERSION = 1;
const STORE_LIMITS = { name: 128, bytes: 4 * 1024 * 1024, revisions: 50 };
const NAME_RE = /^[^/\\\u0000-\u001f]{1,128}$/;
class StoreError extends Error {
    constructor(code, message, currentRev) {
        super(`[motionary] store: ${message}`);
        this.name = 'StoreError';
        this.code = code;
        this.currentRev = currentRev;
    }
}
/** FNV-1a 32-bit over the UTF-16 code units, hex — a short content tag inside revision ids (not a security hash). */
function contentTag(text) {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
}
const now = () => new Date().toISOString();
const byteLen = (t) => (typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(t).length : t.length);
function check(name, text, maxBytes) {
    if (typeof name !== 'string' || !NAME_RE.test(name) || name === '.' || name === '..' || name.includes('..'))
        throw new StoreError('invalid', `invalid project name ${JSON.stringify(String(name).slice(0, 40))}`);
    if (text !== undefined) {
        if (typeof text !== 'string')
            throw new StoreError('invalid', 'project text must be a string');
        if (byteLen(text) > maxBytes)
            throw new StoreError('too-large', `project ${name} is larger than ${maxBytes} bytes`);
    }
}
/** Shared logic over a tiny async key → value map (memory or IndexedDB). */
function storeOver(kv, o) {
    const maxRev = Math.max(1, o.maxRevisions ?? STORE_LIMITS.revisions), maxBytes = o.maxBytes ?? STORE_LIMITS.bytes;
    const head = (k) => k?.revs[0];
    let queue = Promise.resolve();
    const serial = (f) => { const p = queue.then(f, f); queue = p.catch(() => undefined); return p; };
    return {
        async list() {
            const out = [];
            for (const n of (await kv.keys()).sort()) {
                const h = head(await kv.get(n));
                if (h)
                    out.push({ name: n, rev: h.rev, size: byteLen(h.text), savedAt: h.savedAt });
            }
            return out;
        },
        async get(name) { check(name, undefined, maxBytes); const h = head(await kv.get(name)); return h ? { ...h } : null; },
        put: (name, text, po = {}) => serial(async () => {
            check(name, text, maxBytes);
            const k = await kv.get(name), h = head(k);
            if ((h?.rev ?? undefined) !== (po.baseRev ?? undefined))
                throw new StoreError('conflict', h ? `${name} was saved by someone else (now ${h.rev}, your base ${po.baseRev ?? 'none'})` : `${name} does not exist (base ${po.baseRev})`, h?.rev);
            const n = h ? parseInt(h.rev, 10) + 1 : 1;
            const rec = { name, rev: `${n}-${contentTag(text)}`, text, savedAt: now() };
            await kv.set(name, { revs: [rec, ...(k?.revs || [])].slice(0, maxRev) });
            return { rev: rec.rev };
        }),
        delete: (name, po = {}) => serial(async () => {
            check(name, undefined, maxBytes);
            const h = head(await kv.get(name));
            if (!h)
                throw new StoreError('not-found', `${name} not found`);
            if (h.rev !== po.baseRev)
                throw new StoreError('conflict', `${name} changed (now ${h.rev})`, h.rev);
            await kv.del(name);
        }),
        async history(name) { check(name, undefined, maxBytes); return ((await kv.get(name))?.revs || []).map((r) => ({ rev: r.rev, size: byteLen(r.text), savedAt: r.savedAt })); },
        async getRevision(name, rev) { check(name, undefined, maxBytes); const r = (await kv.get(name))?.revs.find((x) => x.rev === rev); return r ? { ...r } : null; },
    };
}
/** In memory. `maxRevisions` (default 50) caps each project's history; `maxBytes` (default 4 MB) caps one project. */
function createMemoryProjectStore(o = {}) {
    const m = new Map();
    return storeOver({ get: async (k) => m.get(k), set: async (k, v) => void m.set(k, v), del: async (k) => void m.delete(k), keys: async () => [...m.keys()] }, o);
}
/** In the browser's IndexedDB (database `dbName`, default "motionary-projects"; one object store "projects"). */
function createIndexedDBProjectStore(o = {}) {
    const idb = o.indexedDB || globalThis.indexedDB;
    if (!idb)
        throw new StoreError('invalid', 'IndexedDB is not available here');
    let db;
    const open = () => (db || (db = new Promise((res, rej) => {
        const r = idb.open(o.dbName || 'motionary-projects', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('projects');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(new StoreError('server', String(r.error)));
    })));
    const run = async (mode, f) => {
        const s = (await open()).transaction('projects', mode).objectStore('projects');
        return new Promise((res, rej) => { const q = f(s); q.onsuccess = () => res(q.result); q.onerror = () => rej(new StoreError('server', String(q.error))); });
    };
    return storeOver({
        get: (k) => run('readonly', (s) => s.get(k)),
        set: (k, v) => run('readwrite', (s) => s.put(v, k)),
        del: (k) => run('readwrite', (s) => s.delete(k)),
        keys: async () => (await run('readonly', (s) => s.getAllKeys())).map(String),
    }, o);
}
/** Your own backend (see the module comment for the REST shape). `headers` go on every request (e.g. auth). */
function createHttpProjectStore(baseUrl, o = {}) {
    const f = o.fetch || globalThis.fetch;
    const base = baseUrl.replace(/\/+$/, '');
    const url = (name, rest = '') => `${base}/projects${name === undefined ? '' : '/' + encodeURIComponent(name)}${rest}`;
    async function call(method, u, extra = {}, body, nullOn404 = false) {
        let r;
        try {
            r = await f(u, { method, headers: { accept: 'application/json', ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...o.headers, ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
        }
        catch (e) {
            throw new StoreError('network', `${method} ${u}: ${e?.message || e}`);
        }
        if (r.status === 404 && nullOn404)
            return null;
        if (r.status === 204)
            return undefined;
        let j = null;
        try {
            j = await r.json();
        }
        catch { /* empty body */ }
        if (r.ok)
            return j;
        const why = (j && (j.error || j.message)) || r.statusText || String(r.status);
        const code = r.status === 409 || r.status === 412 ? 'conflict' : r.status === 401 || r.status === 403 ? 'forbidden' : r.status === 429 || r.status === 507 ? 'quota' : r.status === 404 ? 'not-found' : r.status === 413 ? 'too-large' : r.status === 400 ? 'invalid' : 'server';
        throw new StoreError(code, `${method} ${u}: ${r.status} ${why}`, j?.currentRev);
    }
    const ifMatch = (rev) => (rev ? { 'if-match': rev } : {});
    return {
        list: () => call('GET', url()),
        get: (name) => { check(name, undefined, Infinity); return call('GET', url(name), {}, undefined, true); },
        put: (name, text, po = {}) => { check(name, text, Infinity); return call('PUT', url(name), ifMatch(po.baseRev), { text }); },
        delete: (name, po = {}) => { check(name, undefined, Infinity); return call('DELETE', url(name), ifMatch(po.baseRev)); },
        history: (name) => { check(name, undefined, Infinity); return call('GET', url(name, '/revisions')); },
        getRevision: (name, rev) => { check(name, undefined, Infinity); return call('GET', url(name, '/revisions/' + encodeURIComponent(rev)), {}, undefined, true); },
    };
}
function layersOf(text) {
    const root = JSON.parse(text);
    const host = root && root.format === 'motionary-studio' ? root.scene : root;
    if (!host || !Array.isArray(host.layers))
        throw new StoreError('invalid', 'not a Studio project or Scene document (no layers)');
    return { root, host, layers: host.layers };
}
const keyed = (ls) => new Map(ls.map((l) => [String(l.id), JSON.stringify(l)]));
function changed(base, side) {
    const out = new Set();
    for (const [id, v] of side)
        if (base.get(id) !== v)
            out.add(id);
    for (const id of base.keys())
        if (!side.has(id))
            out.add(id);
    return [...out];
}
/** Which layers each side changed (added, edited or removed) since `base`, and which both changed differently. */
function detectConflict(base, mine, theirs) {
    const b = keyed(layersOf(base).layers), m = keyed(layersOf(mine).layers), t = keyed(layersOf(theirs).layers);
    const cm = changed(b, m), ct = changed(b, t);
    const conflicts = cm.filter((id) => ct.includes(id) && m.get(id) !== t.get(id));
    return { conflicts, mine: cm, theirs: ct };
}
/**
 * Three-way merge at layer granularity. Starts from `theirs` (what the store holds now) and applies `mine`'s layer
 * changes. Same layer changed on both sides (differently) → `{ ok: false, conflicts }`, nothing merged. Document-level
 * fields other than layers (duration, meta, editor state) come from `mine` when only `mine` changed them, else `theirs`.
 */
function mergeProjects(base, mine, theirs) {
    const { conflicts, mine: cm } = detectConflict(base, mine, theirs);
    if (conflicts.length)
        return { ok: false, conflicts };
    const B = layersOf(base), M = layersOf(mine), T = layersOf(theirs);
    const mm = new Map(M.layers.map((l) => [String(l.id), l]));
    const out = T.layers.filter((l) => !cm.includes(String(l.id)) || mm.has(String(l.id))).map((l) => (cm.includes(String(l.id)) ? mm.get(String(l.id)) : l));
    // layers mine added: keep their position relative to mine's order (after the previous layer that exists in out)
    for (let i = 0; i < M.layers.length; i++) {
        const id = String(M.layers[i].id);
        if (out.some((l) => String(l.id) === id))
            continue;
        const prev = i ? String(M.layers[i - 1].id) : undefined;
        const j = prev === undefined ? -1 : out.findIndex((l) => String(l.id) === prev);
        out.splice(prev === undefined ? 0 : j < 0 ? out.length : j + 1, 0, M.layers[i]);
    }
    const pick = (b, m, t) => {
        const r = { ...t };
        for (const k of new Set([...Object.keys(b), ...Object.keys(m)]))
            if (k !== 'layers' && k !== 'scene' && JSON.stringify(b[k]) !== JSON.stringify(m[k])) {
                if (k in m)
                    r[k] = m[k];
                else
                    delete r[k];
            }
        return r;
    };
    const host = { ...pick(B.host, M.host, T.host), layers: out };
    const root = T.root.format === 'motionary-studio' ? { ...pick(B.root, M.root, T.root), scene: host } : host;
    return { ok: true, text: JSON.stringify(root), conflicts: [] };
}
/**
 * A `createStudioApp({ storage })` adapter. `read` remembers the revision (and text) it returned; `write` saves on that
 * base. If someone else saved in between: `merge: 'refuse'` (default) throws a `conflict` StoreError ("saved by someone
 * else"); `merge: 'auto'` merges non-overlapping layer edits and saves the result, and throws on a real conflict.
 */
function toAppStorage(store, o = {}) {
    const seen = new Map();
    return {
        async read(name) { const r = await store.get(name); if (r)
            seen.set(name, { rev: r.rev, text: r.text });
        else
            seen.delete(name); return r ? r.text : null; },
        async write(name, text) {
            const base = seen.get(name);
            try {
                const { rev } = await store.put(name, text, { baseRev: base?.rev });
                seen.set(name, { rev, text });
                return;
            }
            catch (e) {
                if (!(e instanceof StoreError) || e.code !== 'conflict')
                    throw e;
                const cur = await store.get(name);
                if (o.merge !== 'auto' || !base || !cur)
                    throw new StoreError('conflict', `${name} was saved by someone else (now ${e.currentRev ?? cur?.rev}); reopen it, or save under another name`, e.currentRev ?? cur?.rev);
                const m = mergeProjects(base.text, text, cur.text);
                if (!m.ok)
                    throw new StoreError('conflict', `${name} was saved by someone else and layers ${m.conflicts.join(', ')} changed on both sides`, cur.rev);
                const { rev } = await store.put(name, m.text, { baseRev: cur.rev });
                seen.set(name, { rev, text: m.text });
            }
        },
    };
}

export { STORE_LIMITS, STUDIO_STORE_VERSION, StoreError, contentTag, createHttpProjectStore, createIndexedDBProjectStore, createMemoryProjectStore, detectConflict, mergeProjects, toAppStorage };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v15.5.0/dist/components/studio-store.js.map