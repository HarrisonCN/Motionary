const STUDIO_PROVENANCE_VERSION = 1;
const PROVENANCE_META_KEY = 'motionary:provenance';
/** The gateway's rule for client correlation ids (MCP Gateway 15.1 `X-Request-Id`). */
const REQUEST_ID_RE = /^[A-Za-z0-9._:-]{1,128}$/;
const PROVENANCE_LIMITS = { records: 500, text: 200 };
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const clip = (s) => String(s).slice(0, PROVENANCE_LIMITS.text);
/** Problems with a provenance value ([] = fine). */
function validateProvenance(p) {
    const out = [];
    if (!isObj(p))
        return ['expected an object'];
    if (typeof p.generator !== 'string' || !p.generator.trim())
        out.push('generator: required');
    if (p.model !== undefined && typeof p.model !== 'string')
        out.push('model: expected a string');
    if (p.requestId !== undefined && !(typeof p.requestId === 'string' && REQUEST_ID_RE.test(p.requestId)))
        out.push('requestId: 1–128 characters of A–Z a–z 0–9 . _ : -');
    if (p.at !== undefined && !(typeof p.at === 'string' && !Number.isNaN(Date.parse(p.at))))
        out.push('at: expected an ISO date');
    return out;
}
/** The provenance records of a document, oldest first (copies). */
function provenanceOf(doc) {
    const m = doc && isObj(doc.meta) ? doc.meta[PROVENANCE_META_KEY] : undefined;
    return Array.isArray(m) ? m.filter(isObj).map((r) => JSON.parse(JSON.stringify(r))) : [];
}
/** Records filtered by generator / request id / "AI only" (generator mentions ai, mcp or a model). */
function aiChanges(doc, f = {}) {
    return provenanceOf(doc).filter((r) => (!f.generator || r.generator === f.generator) && (!f.requestId || r.requestId === f.requestId) && (!f.aiOnly || !!r.model || /\b(ai|mcp)\b|propose/i.test(r.generator)));
}
const layerKey = (d) => new Map(d.layers.map((l) => [l.id, JSON.stringify(l)]));
/** Layer ids that differ between two documents. */
function changedLayers(before, after) {
    const a = layerKey(before), b = layerKey(after), out = [];
    for (const [id, v] of b)
        if (a.get(id) !== v)
            out.push(id);
    for (const id of a.keys())
        if (!b.has(id))
            out.push(id);
    return out.sort();
}
/** `doc` with one more record (pure). Throws on an invalid provenance. */
function recordProvenance(doc, p, o = {}) {
    const bad = validateProvenance(p);
    if (bad.length)
        throw new Error(`[motionary] provenance: ${bad.join('; ')}`);
    const list = provenanceOf(doc);
    const rec = { id: o.id || `p${list.length + 1}`, generator: clip(p.generator), at: p.at || new Date().toISOString(), layers: o.layers || [] };
    if (p.model)
        rec.model = clip(p.model);
    if (p.requestId)
        rec.requestId = p.requestId;
    if (o.label)
        rec.label = clip(o.label);
    const next = list.concat(rec).slice(-PROVENANCE_LIMITS.records);
    const meta = isObj(doc.meta) ? { ...doc.meta } : {};
    meta[PROVENANCE_META_KEY] = next;
    return { ...doc, meta };
}
/**
 * A history whose `apply()` records `info` (or `info()` evaluated per change) with the change, in the same undo step.
 * Everything else (undo / redo / begin / commit / subscribe …) is the wrapped history.
 */
function withProvenance(history, info) {
    const wrapped = Object.create(history);
    Object.defineProperty(wrapped, 'doc', { get: () => history.doc });
    for (const k of ['canUndo', 'canRedo', 'undoLabel', 'redoLabel', 'size'])
        Object.defineProperty(wrapped, k, { get: () => history[k] });
    wrapped.apply = (change, a = {}) => {
        const before = history.doc;
        const next = typeof change === 'function' ? change(before) : change;
        if (!next || next === before)
            return before;
        const p = typeof info === 'function' ? info() : info;
        return history.apply(recordProvenance(next, p, { label: a.label, layers: changedLayers(before, next) }), a);
    };
    return wrapped;
}
/**
 * Join records with MCP Gateway lineage entries (`correlationId`, falling back to `requestId`). Takes the entries or the
 * response body of `GET /api/v1/admin/ops/lineage?correlationId=` (`{ lineage, total }`, Gateway 15.1 canary).
 */
function matchLineage(records, lineage) {
    const by = new Map();
    const list = Array.isArray(lineage) ? lineage : isObj(lineage) && Array.isArray(lineage.lineage) ? lineage.lineage : [];
    for (const l of list) {
        if (!isObj(l))
            continue;
        const k = l.correlationId || l.requestId;
        if (typeof k === 'string' && !by.has(k))
            by.set(k, l);
    }
    const matched = [], missing = [], unattributed = [];
    for (const r of records) {
        if (!r.requestId)
            unattributed.push(r);
        else if (by.has(r.requestId))
            matched.push({ record: r, lineage: by.get(r.requestId) });
        else
            missing.push(r);
    }
    return { matched, missing, unattributed };
}
/** A list of the document's provenance records, newest first, with an "AI only" toggle and a request-id filter. */
function createProvenancePanel(root, history) {
    const d = root.ownerDocument;
    const el = d.createElement('section');
    el.className = 'usa-provenance';
    el.setAttribute('aria-label', 'Change history');
    const only = d.createElement('input');
    only.type = 'checkbox';
    only.dataset.prov = 'ai-only';
    const lab = d.createElement('label');
    lab.append(only, ' AI changes only');
    const q = d.createElement('input');
    q.type = 'search';
    q.dataset.prov = 'request';
    q.setAttribute('aria-label', 'Request id');
    q.placeholder = 'request id';
    const list = d.createElement('ol');
    list.dataset.prov = 'list';
    el.append(lab, q, list);
    root.append(el);
    const refresh = () => {
        const rows = aiChanges(history.doc, { aiOnly: only.checked, requestId: q.value.trim() || undefined }).reverse();
        list.replaceChildren(...rows.map((r) => {
            const li = d.createElement('li');
            li.dataset.record = r.id;
            if (r.requestId)
                li.dataset.request = r.requestId;
            li.textContent = `${r.label || 'Change'} — ${r.generator}${r.model ? ` (${r.model})` : ''}${r.requestId ? ` · ${r.requestId}` : ''} · ${r.at} · ${r.layers.join(', ') || 'document'}`;
            return li;
        }));
    };
    only.addEventListener('change', refresh);
    q.addEventListener('input', refresh);
    const off = history.subscribe(refresh);
    refresh();
    return { el, refresh, destroy() { off(); el.remove(); } };
}

export { PROVENANCE_LIMITS, PROVENANCE_META_KEY, REQUEST_ID_RE, STUDIO_PROVENANCE_VERSION, aiChanges, changedLayers, createProvenancePanel, matchLineage, provenanceOf, recordProvenance, validateProvenance, withProvenance };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v15.9.0/dist/components/studio-provenance.js.map