// 16.3.0 — performance budget in Studio (tests first; failing-before: v16.3.0/failing-before.txt).
// motionary/studio/budget measures what an export will cost while you edit — the bytes of the 14.7 standalone export
// (raw + gzip) and a per-frame cost from the baked tracks (composite < paint < layout properties) — checks it
// against limits, blocks "publish export" when over budget (publish is never called), and renders a small live meter.
import { describe, it, expect, vi } from 'vitest';
import * as B from '../src/components/studio/budget';
import { exportStandalone } from '../src/components/studio/export';
import { createTimelineDoc } from '../src/components/timeline/editor/index';

const track = (id: string, props: [Record<string, any>, Record<string, any>], t0 = 0, t1 = 1000) => ({ id, type: 'track', target: '#' + id, keyframes: [{ id: id + '1', time: t0, props: props[0] }, { id: id + '2', time: t1, props: props[1] }] });
const doc = (layers: any[]) => createTimelineDoc({ name: 'b', layers });
const fade = () => doc([track('a', [{ opacity: 0 }, { opacity: 1 }])]);

describe('16.3 property classes and frame cost', () => {
  it('classifies properties as composite / paint / layout', () => {
    expect(['opacity', 'transform', 'translate', 'rotate', 'scale'].map(B.propClass)).toEqual(Array(5).fill('composite'));
    expect(['background-color', 'color', 'box-shadow', 'filter', 'clip-path', '--x', 'borderRadius'].map(B.propClass)).toEqual(Array(7).fill('paint'));
    expect(['width', 'height', 'top', 'left', 'margin-top', 'padding', 'fontSize', 'line-height', 'inset'].map(B.propClass)).toEqual(Array(9).fill('layout'));
    expect(B.PROP_COST).toEqual({ composite: 1, paint: 4, layout: 10 });
  });
  it('frame cost = the sum of the costs of the properties changing in a frame; the peak and when it happens', () => {
    expect(B.frameCost(fade(), { fps: 10 })).toMatchObject({ peak: 1, frames: 10 });
    const d = doc([
      track('a', [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1)' }]),
      track('b', [{ width: '10px', color: '#000000' }, { width: '20px', color: '#ffffff' }], 500, 800),
    ]);
    const c = B.frameCost(d, { fps: 10 });
    expect(c.peak).toBe(2 + 10 + 4);
    expect(c.peakAt).toBeGreaterThanOrEqual(500);
    expect(c.peakAt).toBeLessThan(800);
    expect(c.layout).toEqual(['#b width']);
    expect(c.paint).toEqual(['#b color']);
  });
  it('a property that does not change (same value at both ends) costs nothing', () => {
    expect(B.frameCost(doc([track('a', [{ width: '10px' }, { width: '10px' }])]), { fps: 10 }).peak).toBe(0);
  });
});

describe('16.3 measureExport / checkBudget', () => {
  it('counts the bytes of the standalone export (raw + gzip) and is deterministic', async () => {
    const files = exportStandalone(fade(), { js: false }).files;
    let raw = 0;
    for (const v of files.values()) raw += typeof v === 'string' ? new TextEncoder().encode(v).length : v.length;
    const m = await B.measureExport(fade(), { js: false });
    expect(m.bytes).toBe(raw);
    expect(Object.keys(m.files).sort()).toEqual([...files.keys()].sort());
    if (typeof CompressionStream === 'function') { expect(m.gzipBytes).toBeGreaterThan(0); expect(m.gzipBytes!).toBeLessThan(m.bytes + 64); } else expect(m.gzipBytes).toBeNull();
    expect(m.cost.peak).toBe(1);
    expect(await B.measureExport(fade(), { js: false })).toEqual(m);
  });
  it('checkBudget lists every metric over its limit', async () => {
    const m = await B.measureExport(doc([track('a', [{ width: '0px' }, { width: '9px' }])]), { js: false });
    expect(B.checkBudget(m, { kb: 1000, frameCost: 50 })).toEqual({ ok: true, over: [] });
    const r = B.checkBudget(m, { kb: 0.01, frameCost: 5, layout: false });
    expect(r.ok).toBe(false);
    expect(r.over.map((o) => o.metric)).toEqual(['kb', 'frameCost', 'layout']);
    expect(r.over[1]).toMatchObject({ metric: 'frameCost', value: 10, limit: 5 });
  });
  it('gzipKb is checked only when gzip could be measured', () => {
    const m = { bytes: 100, gzipBytes: null, files: {}, cost: { peak: 0, peakAt: 0, frames: 1, layout: [], paint: [] } } as B.BudgetMeasure;
    expect(B.checkBudget(m, { gzipKb: 0.001 }).ok).toBe(true);
    expect(B.checkBudget({ ...m, gzipBytes: 2048 }, { gzipKb: 1 }).over).toEqual([{ metric: 'gzipKb', value: 2, limit: 1 }]);
  });
});

describe('16.3 guardPublish', () => {
  it('blocks publishing over budget (publish is not called)', async () => {
    const publish = vi.fn(() => 'url');
    const r = await B.guardPublish(fade(), { kb: 0.01 }, publish, { js: false });
    expect(r.ok).toBe(false);
    expect(publish).not.toHaveBeenCalled();
    expect(r.over![0].metric).toBe('kb');
  });
  it('publishes within budget with the exported files', async () => {
    const publish = vi.fn((files: Map<string, string | Uint8Array>) => Promise.resolve(files.size));
    const r = await B.guardPublish(fade(), { kb: 500 }, publish, { js: false });
    expect(r).toMatchObject({ ok: true, value: exportStandalone(fade(), { js: false }).files.size });
    expect(publish).toHaveBeenCalledTimes(1);
  });
});

describe('16.3 createBudgetMeter', () => {
  it('shows size + frame cost against the limits, marks over-budget, announces politely', async () => {
    const el = document.createElement('div');
    const meter = B.createBudgetMeter(el, { kb: 100, frameCost: 5 });
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
    const ok = meter.update(await B.measureExport(fade(), { js: false }));
    expect(ok.ok).toBe(true);
    expect(el.textContent).toMatch(/KB \/ 100 KB/);
    expect(el.textContent).toMatch(/cost 1 \/ 5/);
    expect(el.hasAttribute('data-over')).toBe(false);
    const bad = meter.update(await B.measureExport(doc([track('a', [{ width: '0px' }, { width: '9px' }])]), { js: false }));
    expect(bad.ok).toBe(false);
    expect(el.getAttribute('data-over')).toBe('frameCost');
    meter.destroy();
    expect(el.textContent).toBe('');
    expect(el.hasAttribute('role')).toBe(false);
  });
});
