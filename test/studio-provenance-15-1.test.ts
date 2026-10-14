// 15.1.0 — AI edit provenance (`motionary/studio/provenance` = `motionary/components/studio-provenance`).
// Every AI change carries { generator, model?, requestId?, at } in the document (same undo step), an unaccepted proposal
// writes nothing, requestId follows the MCP Gateway correlation-id rule so it joins Gateway 15.1 (canary) lineage.
// Tests first: this file must fail before src/components/studio/provenance.ts exists.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  STUDIO_PROVENANCE_VERSION, PROVENANCE_META_KEY, REQUEST_ID_RE, validateProvenance, recordProvenance, provenanceOf,
  aiChanges, changedLayers, withProvenance, matchLineage, createProvenancePanel,
} from '../src/components/studio/provenance';
import { createTimelineHistory } from '../src/components/timeline/editor/history';
import { createAiReview, proposeAiEdit, createMockProvider } from '../src/components/studio/ai';

const doc0 = (): any => ({
  format: 'motionary-scene', version: 2, name: 'hero',
  layers: [
    { id: 'title', type: 'track', target: '#title', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 400, props: { opacity: 1 } }] },
    { id: 'card', type: 'track', target: '.card', keyframes: [] },
  ],
});
const AT = '2026-10-14T12:00:00.000Z';
const P = { generator: 'motionary/studio/ai', model: 'mock-1', requestId: 'req-15.1:abc_1', at: AT };

describe('15.1 provenance records', () => {
  it('versioned, meta key and the gateway request-id rule', () => {
    expect(STUDIO_PROVENANCE_VERSION).toBe(1);
    expect(PROVENANCE_META_KEY).toBe('motionary:provenance');
    expect(REQUEST_ID_RE.test('req-15.1:abc_1')).toBe(true);
    expect(REQUEST_ID_RE.test('a'.repeat(129))).toBe(false);
    expect(REQUEST_ID_RE.test('has space')).toBe(false);
  });
  it('validates generator / model / requestId / at', () => {
    expect(validateProvenance(P)).toEqual([]);
    expect(validateProvenance(null)).toEqual(['expected an object']);
    expect(validateProvenance({ generator: '' })[0]).toMatch(/generator/);
    expect(validateProvenance({ generator: 'x', requestId: 'bad id' })[0]).toMatch(/requestId/);
    expect(validateProvenance({ generator: 'x', at: 'yesterday' })[0]).toMatch(/at/);
  });
  it('recordProvenance is pure and appends; invalid input throws', () => {
    const d = doc0();
    const d1 = recordProvenance(d, P, { label: 'AI: fade', layers: ['title'] });
    expect(provenanceOf(d)).toEqual([]);
    expect(provenanceOf(d1)).toEqual([{ id: 'p1', generator: P.generator, at: AT, model: 'mock-1', requestId: P.requestId, label: 'AI: fade', layers: ['title'] }]);
    expect(provenanceOf(recordProvenance(d1, { generator: 'me', at: AT })).map((r) => r.id)).toEqual(['p1', 'p2']);
    expect(() => recordProvenance(d, { generator: 'x', requestId: 'no spaces allowed' })).toThrow(/provenance/);
  });
  it('changedLayers lists added / edited / removed ids', () => {
    const a = doc0();
    const b = { ...a, layers: [{ ...a.layers[0], target: '#t2' }, { id: 'new', type: 'track', target: '#n', keyframes: [] }] };
    expect(changedLayers(a, b)).toEqual(['card', 'new', 'title']);
  });
  it('aiChanges filters by aiOnly / requestId / generator', () => {
    let d = recordProvenance(doc0(), P);
    d = recordProvenance(d, { generator: 'keyboard', at: AT });
    d = recordProvenance(d, { generator: 'motionary-mcp/propose_edit', requestId: 'r2', at: AT });
    expect(aiChanges(d, { aiOnly: true }).map((r) => r.id)).toEqual(['p1', 'p3']);
    expect(aiChanges(d, { requestId: 'r2' }).map((r) => r.id)).toEqual(['p3']);
    expect(aiChanges(d, { generator: 'keyboard' }).map((r) => r.id)).toEqual(['p2']);
  });
});

describe('15.1 withProvenance + AI review: 0 writes without acceptance, one undo step with', () => {
  it('a change through the wrapped history records provenance in the same step; undo removes both', () => {
    const h = createTimelineHistory(doc0() as any);
    const w = withProvenance(h, P);
    w.apply((d: any) => ({ ...d, layers: d.layers.filter((l: any) => l.id !== 'card') }), { label: 'remove card' });
    expect(h.doc.layers.map((l: any) => l.id)).toEqual(['title']);
    expect(provenanceOf(h.doc as any)).toMatchObject([{ generator: P.generator, requestId: P.requestId, label: 'remove card', layers: ['card'] }]);
    expect(h.undo()).toBe(true);
    expect(h.doc.layers.length).toBe(2);
    expect(provenanceOf(h.doc as any)).toEqual([]);
  });
  it('a no-op change writes nothing', () => {
    const h = createTimelineHistory(doc0() as any);
    const before = h.doc;
    withProvenance(h, P).apply((d) => d);
    expect(h.doc).toBe(before);
    expect(h.canUndo).toBe(false);
  });
  it('an AI proposal that is not accepted leaves the project byte-identical; accepting writes one step with provenance', async () => {
    const h = createTimelineHistory(doc0() as any);
    const before = JSON.stringify(h.doc);
    const pr = await proposeAiEdit(h.doc as any, 'fade up the card', { provider: createMockProvider() });
    expect(pr.ok).toBe(true);
    const review = createAiReview(withProvenance(h, () => ({ ...P, at: AT })), pr);
    review.rejectAll?.();
    expect(JSON.stringify(h.doc)).toBe(before);
    expect(h.canUndo).toBe(false);
    const review2 = createAiReview(withProvenance(h, () => ({ ...P, at: AT })), pr);
    review2.acceptAll?.();
    const res = review2.apply();
    expect(res.applied).toBeGreaterThan(0);
    expect(provenanceOf(h.doc as any)).toHaveLength(1);
    expect(h.undo()).toBe(true);
    expect(JSON.stringify(h.doc)).toBe(before);
  });
});

describe('15.1 package entry', () => {
  it('motionary/studio/provenance and motionary/components/studio-provenance are exported with a size line', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.exports['./studio/provenance'].import.default).toBe('./dist/components/studio-provenance.js');
    expect(pkg.exports['./components/studio-provenance'].require.default).toBe('./dist/components/studio-provenance.cjs');
    const sizes = JSON.parse(readFileSync('size-budget.json', 'utf8'));
    const list = Array.isArray(sizes) ? sizes : sizes.budgets || sizes.entries || Object.values(sizes);
    expect(JSON.stringify(list)).toMatch(/components\/studio-provenance/);
  });
});

describe('15.1 Gateway lineage join (Gateway 15.1 canary)', () => {
  it('matches by correlationId, falls back to requestId, reports missing / unattributed', () => {
    let d = recordProvenance(doc0(), P);
    d = recordProvenance(d, { generator: 'motionary-mcp/propose_edit', requestId: 'gone', at: AT });
    d = recordProvenance(d, { generator: 'keyboard', at: AT });
    const r = matchLineage(provenanceOf(d), [{ correlationId: P.requestId, tool: 'motionary.propose_edit' }, { requestId: 'other' }]);
    expect(r.matched.map((m) => m.record.id)).toEqual(['p1']);
    expect(r.missing.map((m) => m.id)).toEqual(['p2']);
    expect(r.unattributed.map((m) => m.id)).toEqual(['p3']);
  });
  it('accepts the Gateway 15.1 canary response body { lineage, total } as returned by GET /api/v1/admin/ops/lineage?correlationId=', () => {
    const d = recordProvenance(doc0(), P);
    const body = { lineage: [{ requestId: 'gw-1', correlationId: P.requestId, at: AT, target: { serverId: 'motionary', tool: 'propose_edit', kind: 'tool', via: 'mcp' }, decision: { outcome: 'ok' } }], total: 1 };
    const r = matchLineage(provenanceOf(d), body as any);
    expect(r.matched).toHaveLength(1);
    expect(r.matched[0].lineage.requestId).toBe('gw-1');
    expect(matchLineage(provenanceOf(d), { lineage: [{ requestId: 'gw-2', correlationId: null }] } as any).missing).toHaveLength(1);
  });
  it('docs name the Gateway 15.1 canary, never Gateway 15 GA', () => {
    const md = readFileSync('docs/studio-provenance.md', 'utf8');
    expect(md).toMatch(/Gateway 15\.1 canary/);
    expect(md).not.toMatch(/Gateway 15(\.0)? GA|Gateway 15\.0\.0\b(?!-rc)/);
  });
});

describe('15.1 provenance panel (DOM)', () => {
  it('lists records newest first, filters AI-only and by request id, follows undo, destroy removes it', () => {
    const h = createTimelineHistory(doc0() as any);
    withProvenance(h, { generator: 'keyboard', at: AT }).apply((d: any) => ({ ...d, layers: d.layers.map((l: any) => (l.id === 'card' ? { ...l, target: '.card2' } : l)) }), { label: 'retarget' });
    withProvenance(h, P).apply((d: any) => ({ ...d, layers: d.layers.slice(1) }), { label: 'AI: remove title' });
    const root = document.createElement('div');
    const panel = createProvenancePanel(root, h);
    const rows = () => [...root.querySelectorAll('[data-prov="list"] li')].map((li) => (li as HTMLElement).dataset.record);
    expect(rows()).toEqual(['p2', 'p1']);
    const only = root.querySelector('[data-prov="ai-only"]') as HTMLInputElement;
    only.checked = true; only.dispatchEvent(new Event('change'));
    expect(rows()).toEqual(['p2']);
    only.checked = false; only.dispatchEvent(new Event('change'));
    const q = root.querySelector('[data-prov="request"]') as HTMLInputElement;
    q.value = P.requestId; q.dispatchEvent(new Event('input'));
    expect(rows()).toEqual(['p2']);
    q.value = ''; q.dispatchEvent(new Event('input'));
    h.undo();
    expect(rows()).toEqual(['p1']);
    panel.destroy();
    expect(root.querySelector('.usa-provenance')).toBeNull();
  });
});
