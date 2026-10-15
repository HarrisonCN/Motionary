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
import type { TimelineDoc, TimelineHistory, ApplyOptions } from '../timeline/editor/index';

export const STUDIO_PROVENANCE_VERSION = 1;
export const PROVENANCE_META_KEY = 'motionary:provenance';
/** The gateway's rule for client correlation ids (MCP Gateway 15.1 `X-Request-Id`). */
export const REQUEST_ID_RE = /^[A-Za-z0-9._:-]{1,128}$/;
export const PROVENANCE_LIMITS = { records: 500, text: 200 } as const;

export interface Provenance {
  /** Who made the change: `motionary/studio/ai`, `motionary-mcp/propose_edit`, your tool's name. */
  generator: string;
  model?: string;
  /** The correlation id of the call (MCP Gateway lineage). */
  requestId?: string;
  /** ISO time; default now. */
  at?: string;
}
export interface ProvenanceRecord extends Required<Pick<Provenance, 'generator' | 'at'>> {
  id: string;
  model?: string;
  requestId?: string;
  label?: string;
  /** Layer ids the change added, removed or edited. */
  layers: string[];
}
export interface LineageEntry { correlationId?: string; requestId?: string; [k: string]: unknown }

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const clip = (s: unknown) => String(s).slice(0, PROVENANCE_LIMITS.text);

/** Problems with a provenance value ([] = fine). */
export function validateProvenance(p: unknown): string[] {
  const out: string[] = [];
  if (!isObj(p)) return ['expected an object'];
  if (typeof p.generator !== 'string' || !p.generator.trim()) out.push('generator: required');
  if (p.model !== undefined && typeof p.model !== 'string') out.push('model: expected a string');
  if (p.requestId !== undefined && !(typeof p.requestId === 'string' && REQUEST_ID_RE.test(p.requestId))) out.push('requestId: 1–128 characters of A–Z a–z 0–9 . _ : -');
  if (p.at !== undefined && !(typeof p.at === 'string' && !Number.isNaN(Date.parse(p.at)))) out.push('at: expected an ISO date');
  return out;
}

/** The provenance records of a document, oldest first (copies). */
export function provenanceOf(doc: TimelineDoc): ProvenanceRecord[] {
  const m = doc && isObj(doc.meta) ? (doc.meta as any)[PROVENANCE_META_KEY] : undefined;
  return Array.isArray(m) ? m.filter(isObj).map((r) => JSON.parse(JSON.stringify(r))) : [];
}

/** Records filtered by generator / request id / "AI only" (generator mentions ai, mcp or a model). */
export function aiChanges(doc: TimelineDoc, f: { generator?: string; requestId?: string; aiOnly?: boolean } = {}): ProvenanceRecord[] {
  return provenanceOf(doc).filter((r) => (!f.generator || r.generator === f.generator) && (!f.requestId || r.requestId === f.requestId) && (!f.aiOnly || !!r.model || /\b(ai|mcp)\b|propose/i.test(r.generator)));
}

const layerKey = (d: TimelineDoc) => new Map(d.layers.map((l) => [l.id, JSON.stringify(l)]));
/** Layer ids that differ between two documents. */
export function changedLayers(before: TimelineDoc, after: TimelineDoc): string[] {
  const a = layerKey(before), b = layerKey(after), out: string[] = [];
  for (const [id, v] of b) if (a.get(id) !== v) out.push(id);
  for (const id of a.keys()) if (!b.has(id)) out.push(id);
  return out.sort();
}

/** `doc` with one more record (pure). Throws on an invalid provenance. */
export function recordProvenance(doc: TimelineDoc, p: Provenance, o: { label?: string; layers?: string[]; id?: string } = {}): TimelineDoc {
  const bad = validateProvenance(p);
  if (bad.length) throw new Error(`[motionary] provenance: ${bad.join('; ')}`);
  const list = provenanceOf(doc);
  const rec: ProvenanceRecord = { id: o.id || `p${list.length + 1}`, generator: clip(p.generator), at: p.at || new Date().toISOString(), layers: o.layers || [] };
  if (p.model) rec.model = clip(p.model);
  if (p.requestId) rec.requestId = p.requestId;
  if (o.label) rec.label = clip(o.label);
  const next = list.concat(rec).slice(-PROVENANCE_LIMITS.records);
  const meta = isObj(doc.meta) ? { ...(doc.meta as object) } : {};
  (meta as any)[PROVENANCE_META_KEY] = next;
  return { ...doc, meta };
}

/**
 * A history whose `apply()` records `info` (or `info()` evaluated per change) with the change, in the same undo step.
 * Everything else (undo / redo / begin / commit / subscribe …) is the wrapped history.
 */
export function withProvenance(history: TimelineHistory, info: Provenance | (() => Provenance)): TimelineHistory {
  const wrapped = Object.create(history) as TimelineHistory;
  Object.defineProperty(wrapped, 'doc', { get: () => history.doc });
  for (const k of ['canUndo', 'canRedo', 'undoLabel', 'redoLabel', 'size'] as const) Object.defineProperty(wrapped, k, { get: () => (history as any)[k] });
  wrapped.apply = (change, a: ApplyOptions = {}) => {
    const before = history.doc;
    const next = typeof change === 'function' ? change(before) : change;
    if (!next || next === before) return before;
    const p = typeof info === 'function' ? info() : info;
    return history.apply(recordProvenance(next, p, { label: a.label, layers: changedLayers(before, next) }), a);
  };
  return wrapped;
}

/**
 * Join records with MCP Gateway lineage entries (`correlationId`, falling back to `requestId`). Takes the entries or the
 * response body of `GET /api/v1/admin/ops/lineage?correlationId=` (`{ lineage, total }`, Gateway 15.1 canary).
 */
export function matchLineage(records: ProvenanceRecord[], lineage: LineageEntry[] | { lineage: LineageEntry[] }): { matched: { record: ProvenanceRecord; lineage: LineageEntry }[]; missing: ProvenanceRecord[]; unattributed: ProvenanceRecord[] } {
  const by = new Map<string, LineageEntry>();
  const list = Array.isArray(lineage) ? lineage : isObj(lineage) && Array.isArray((lineage as any).lineage) ? (lineage as any).lineage : [];
  for (const l of list) {
    if (!isObj(l)) continue;
    const k = l.correlationId || l.requestId;
    if (typeof k === 'string' && !by.has(k)) by.set(k, l);
  }
  const matched: { record: ProvenanceRecord; lineage: LineageEntry }[] = [], missing: ProvenanceRecord[] = [], unattributed: ProvenanceRecord[] = [];
  for (const r of records) {
    if (!r.requestId) unattributed.push(r);
    else if (by.has(r.requestId)) matched.push({ record: r, lineage: by.get(r.requestId)! });
    else missing.push(r);
  }
  return { matched, missing, unattributed };
}

export interface ProvenancePanel { readonly el: HTMLElement; refresh(): void; destroy(): void }
/** A list of the document's provenance records, newest first, with an "AI only" toggle and a request-id filter. */
export function createProvenancePanel(root: HTMLElement, history: TimelineHistory): ProvenancePanel {
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
      if (r.requestId) li.dataset.request = r.requestId;
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
