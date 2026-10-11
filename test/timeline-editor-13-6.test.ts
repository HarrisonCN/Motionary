// 13.6.0 — Timeline editing model: motionary-timeline v1 format (validate / parse / canonical serialize, golden
// fixtures, malformed input), <usa-player> import / export, layers (group, lock, solo / mute, reorder), keyframe batch
// editing, undo / redo (coalescing, transactions, bounded, keys) and the reproducible preview.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as TE from '../src/components/timeline/editor/index';

const FIX = join(__dirname, 'fixtures/timeline');
const read = (f: string) => readFileSync(join(FIX, f), 'utf8');
const VALID = readdirSync(join(FIX, 'valid')).filter((f) => /^[\w-]+\.json$/.test(f) && !/\.(golden|frames)\.json$/.test(f));
const INVALID = readdirSync(join(FIX, 'invalid')).filter((f) => f.endsWith('.json'));
const TIMES = [-5, 0, 50, 100, 150, 250, 400, 500, 650, 750, 900, 1000, 1100, 1250, 1500, 99999];
const UPDATE = !!process.env.GOLDEN_UPDATE;

const doc = (layers: any[], extra: any = {}): TE.TimelineDoc => TE.parseTimelineDoc({ format: 'motionary-timeline', version: 1, layers, ...extra });
const track = (id: string, kfs: [string, number, Record<string, any>, string?][], more: any = {}) => ({
  id, type: 'track', target: `.${id}`, ...more,
  keyframes: kfs.map(([kid, time, props, easing]) => ({ id: kid, time, props, ...(easing ? { easing } : {}) })),
});
const times = (d: TE.TimelineDoc, layer: string) => d.layers.find((l) => l.id === layer)!.keyframes!.map((k) => [k.id, k.time]);

describe('13.6 format: golden fixtures', () => {
  it('has fixtures', () => {
    expect(VALID.length).toBeGreaterThanOrEqual(4);
    expect(INVALID.length).toBeGreaterThanOrEqual(20);
  });
  for (const f of VALID) {
    it(`valid/${f}: canonical text + frames match the golden files; round trip is lossless and idempotent`, () => {
      const src = read(`valid/${f}`);
      expect(TE.validateTimelineDoc(JSON.parse(src))).toEqual([]);
      const d = TE.parseTimelineDoc(src);
      const text = TE.serializeTimelineDoc(d);
      const frames = TIMES.map((t) => TE.sampleTimelineDoc(d, t));
      const g = join(FIX, 'valid', f.replace(/\.json$/, '.golden.json'));
      const fr = join(FIX, 'valid', f.replace(/\.json$/, '.frames.json'));
      if (UPDATE || !existsSync(g)) {
        writeFileSync(g, text);
        writeFileSync(fr, JSON.stringify(frames, null, 2) + '\n');
      }
      expect(text).toBe(readFileSync(g, 'utf8'));
      expect(JSON.parse(JSON.stringify(frames))).toEqual(JSON.parse(readFileSync(fr, 'utf8')));
      // lossless: everything in the source survives (key order and keyframe order aside)
      const again = TE.parseTimelineDoc(text);
      expect(again).toEqual(d);
      expect(TE.serializeTimelineDoc(again)).toBe(text);
      const raw = JSON.parse(src);
      expect(again.meta).toEqual(raw.meta);
      expect(again.layers.map((l) => l.id)).toEqual(raw.layers.map((l: any) => l.id));
      for (const l of raw.layers) {
        const n: any = again.layers.find((x) => x.id === l.id);
        for (const k of ['type', 'name', 'parent', 'target', 'locked', 'muted', 'solo']) if (l[k] !== undefined && l[k] !== false) expect(n[k]).toEqual(l[k]);
        for (const k of l.keyframes || []) {
          const m = n.keyframes.find((x: any) => x.id === k.id);
          expect(m.time).toBe(k.time);
          expect(m.props).toEqual(k.props);
          expect(m.easing ?? 'linear').toBe(k.easing ?? 'linear');
        }
      }
    });
  }
  for (const f of INVALID) {
    it(`invalid/${f} is rejected with a TimelineDocError (no throw from validate, no prototype pollution)`, () => {
      const src = read(`invalid/${f}`);
      let parsed: unknown;
      try { parsed = JSON.parse(src); } catch { parsed = undefined; }
      if (parsed !== undefined) expect(TE.validateTimelineDoc(parsed).length).toBeGreaterThan(0);
      let err: any;
      try { TE.parseTimelineDoc(src); } catch (e) { err = e; }
      expect(err).toBeInstanceOf(TE.TimelineDocError);
      expect(err.problems.length).toBeGreaterThan(0);
      expect(({} as any).polluted).toBeUndefined();
      expect(({} as any).x).toBeUndefined();
    });
  }
  it('names the problem path', () => {
    const p = (f: string) => TE.validateTimelineDoc(JSON.parse(read(`invalid/${f}.json`))).map((x) => x.path);
    expect(p('future-version')).toContain('version');
    expect(TE.validateTimelineDoc(JSON.parse(read('invalid/future-version.json')))[0].message).toMatch(/newer motionary/);
    expect(p('bad-easing')).toContain('layers[0].keyframes[0].easing');
    expect(p('group-cycle')).toContain('layers[0].parent');
    expect(p('duplicate-keyframe-ids')).toContain('layers[1].keyframes[0].id');
    expect(p('unknown-key')).toContain('script');
    expect(p('proto-pollution')).toContain('layers[0].keyframes[0].props.__proto__');
  });
  it('rejects oversized input and non-JSON values without throwing from validate', () => {
    expect(() => TE.parseTimelineDoc('x'.repeat(TE.TIMELINE_DOC_LIMITS.textBytes + 1))).toThrow(TE.TimelineDocError);
    expect(TE.validateTimelineDoc(null)).toHaveLength(1);
    expect(TE.validateTimelineDoc({ format: 'motionary-timeline', version: 1, layers: [], meta: { f: () => 1 } }).length).toBe(1);
    expect(TE.validateTimelineDoc({ format: 'motionary-timeline', version: 1, layers: [], meta: { n: NaN } }).length).toBe(1);
    let deep: any = {};
    const root = deep;
    for (let i = 0; i < 40; i++) deep = deep.a = {};
    expect(TE.validateTimelineDoc({ format: 'motionary-timeline', version: 1, layers: [], meta: root }).length).toBeGreaterThan(0);
    const many = Array.from({ length: 1001 }, (_, i) => ({ id: `l${i}`, type: 'track' }));
    expect(TE.validateTimelineDoc({ format: 'motionary-timeline', version: 1, layers: many })[0].message).toMatch(/more than 1000/);
  });
  it('schema: JSON Schema agrees with the validator on every fixture (ajv, dev only)', async () => {
    const { default: Ajv } = await import('ajv/dist/2020.js');
    const ajv = new (Ajv as any)({ strict: false, allErrors: true });
    const check = ajv.compile(TE.TIMELINE_DOC_SCHEMA);
    for (const f of VALID) expect(check(JSON.parse(read(`valid/${f}`))), f).toBe(true);
    const schemaCatches = ['wrong-format', 'future-version', 'unknown-key', 'group-keyframes', 'negative-time', 'string-time', 'huge-time', 'bad-prop-value', 'bad-prop-name', 'bad-seed', 'bad-flag', 'layers-missing', 'not-object'];
    for (const f of schemaCatches) expect(check(JSON.parse(read(`invalid/${f}.json`))), f).toBe(false);
    const file = JSON.parse(readFileSync(join(__dirname, '../docs/timeline-doc.schema.json'), 'utf8'));
    expect(file).toEqual(JSON.parse(JSON.stringify(TE.TIMELINE_DOC_SCHEMA)));
  });
});

describe('13.6 <usa-player> import / export', () => {
  it('exports active tracks with offsets, per-keyframe easing and seeded random', () => {
    const d = TE.parseTimelineDoc(read('valid/layers.json'));
    const a = TE.timelineDocToAnimation(d);
    expect(a.format).toBe('use-scroll-animate/animation');
    expect(a.duration).toBe(1500);
    // c1 is solo → only c1 (and nothing else) plays
    expect(a.tracks.map((t) => t.target)).toEqual(['.card:nth-child(1)']);
    const t = a.tracks[0];
    expect(t.start).toBe(200);
    expect(t.duration).toBe(600);
    expect(t.keyframes!.map((k: any) => k.offset)).toEqual([0, 1]);
    expect((t.keyframes![0] as any).easing).toBe('steps(4, end)');
    expect(typeof (t.keyframes![0] as any)['--x']).toBe('number');
    expect(TE.timelineDocToAnimation(d)).toEqual(a);
  });
  it('imports keyframe and preset tracks; effect tracks are reported', () => {
    const { doc: d, skipped } = TE.timelineDocFromAnimation({
      format: 'use-scroll-animate/animation', version: 1, name: 'x',
      tracks: [
        { target: '.a', start: 100, duration: 400, keyframes: [{ opacity: 0 }, { opacity: 0.5, offset: 0.25 }, { opacity: 1 }], easing: 'ease-in' },
        { target: '.b', start: 0, duration: 600, preset: 'fade-up', label: 'B' },
        { target: '.c', start: 50, effect: 'confetti' },
      ],
    });
    expect(skipped).toEqual([2]);
    expect(times(d, 't1')).toEqual([['t1k1', 100], ['t1k2', 200], ['t1k3', 500]]);
    expect(d.layers[1].name).toBe('B');
    expect(d.layers[1].keyframes!.length).toBe(2);
    expect(TE.validateTimelineDoc(d)).toEqual([]);
    // export → import → export is stable
    const a1 = TE.timelineDocToAnimation(d);
    const a2 = TE.timelineDocToAnimation(TE.timelineDocFromAnimation(a1).doc);
    expect(a2.tracks.map((t) => [t.target, t.start, t.duration, t.keyframes!.length])).toEqual(a1.tracks.map((t) => [t.target, t.start, t.duration, t.keyframes!.length]));
  });
  it('rejects unknown animation formats', () => {
    expect(() => TE.timelineDocFromAnimation({ format: 'nope', tracks: [] } as any)).toThrow(TE.TimelineDocError);
    expect(() => TE.timelineDocFromAnimation({} as any)).toThrow(TE.TimelineDocError);
  });
});

describe('13.6 layers', () => {
  const base = () => doc([track('a', [['a1', 0, { opacity: 0 }], ['a2', 100, { opacity: 1 }]]), track('b', [['b1', 0, { opacity: 0 }]]), track('c', [['c1', 50, { opacity: 1 }]])]);
  it('groups, ungroups, reorders (groups move with their children)', () => {
    const { doc: g, id } = TE.groupLayers(base(), ['b', 'c'], { name: 'BC' });
    expect(id).toBe('g1');
    expect(g.layers.map((l) => [l.id, l.parent])).toEqual([['a', undefined], ['g1', undefined], ['b', 'g1'], ['c', 'g1']]);
    expect(TE.validateTimelineDoc(g)).toEqual([]);
    const moved = TE.moveLayer(g, 'g1', 0);
    expect(moved.layers.map((l) => l.id)).toEqual(['g1', 'b', 'c', 'a']);
    const inner = TE.moveLayer(g, 'c', 0);
    expect(inner.layers.map((l) => l.id)).toEqual(['a', 'g1', 'c', 'b']);
    const into = TE.moveLayer(g, 'a', 1, { parent: 'g1' });
    expect(into.layers.map((l) => [l.id, l.parent])).toEqual([['g1', undefined], ['b', 'g1'], ['a', 'g1'], ['c', 'g1']]);
    expect(() => TE.moveLayer(g, 'g1', 0, { parent: 'b' })).toThrow();
    expect(TE.moveLayer(g, 'a', 0)).toBe(g);
    const un = TE.ungroupLayer(g, 'g1');
    expect(un.layers.map((l) => [l.id, l.parent])).toEqual([['a', undefined], ['b', undefined], ['c', undefined]]);
    expect(TE.removeLayers(g, ['g1']).layers.map((l) => l.id)).toEqual(['a']);
  });
  it('mute / solo decide what plays (inherited through groups)', () => {
    let d = TE.groupLayers(base(), ['b', 'c']).doc;
    expect(Object.keys(TE.sampleTimelineDoc(d, 50).layers)).toEqual(['a', 'b', 'c']);
    d = TE.updateLayers(d, ['g1'], { muted: true });
    expect(Object.keys(TE.sampleTimelineDoc(d, 50).layers)).toEqual(['a']);
    d = TE.updateLayers(d, ['g1'], { muted: false, solo: true });
    expect(Object.keys(TE.sampleTimelineDoc(d, 50).layers)).toEqual(['b', 'c']);
    expect(TE.isLayerActive(d, 'a')).toBe(false);
    d = TE.updateLayers(d, ['c'], { muted: true });
    expect(Object.keys(TE.sampleTimelineDoc(d, 50).layers)).toEqual(['b']);
    expect(d.layers.find((l) => l.id === 'g1')!.muted).toBeUndefined();
  });
  it('locked layers (and layers in locked groups) are not edited', () => {
    let d = TE.groupLayers(base(), ['b', 'c']).doc;
    d = TE.updateLayers(d, ['g1'], { locked: true });
    expect(TE.isLayerLocked(d, 'c')).toBe(true);
    expect(TE.updateLayers(d, ['b'], { name: 'x', target: '.y' })).toBe(d);
    expect(TE.updateLayers(d, ['b'], { muted: true }).layers[2].muted).toBe(true);
    expect(TE.removeLayers(d, ['c'])).toBe(d);
    expect(TE.moveLayer(d, 'b', 1)).toBe(d);
    expect(TE.shiftKeyframes(d, ['b1', 'c1'], 100)).toBe(d);
    const mixed = TE.shiftKeyframes(d, ['a1', 'b1'], 100);
    expect(times(mixed, 'a')).toEqual([['a1', 100], ['a2', 100]]);
    expect(times(mixed, 'b')).toEqual([['b1', 0]]);
    expect(TE.addKeyframe(d, 'b', { time: 5, props: {} })).toBe(d);
    expect(TE.updateLayers(d, ['g1'], { locked: false }).layers[1].locked).toBeUndefined();
  });
  it('addLayer: fresh ids, into groups, rejects duplicates', () => {
    let d = TE.addLayer(base(), { type: 'group', name: 'G' });
    d = TE.addLayer(d, { type: 'track', parent: 'g1', target: '.x' });
    expect(d.layers.slice(-2).map((l) => [l.id, l.parent])).toEqual([['g1', undefined], ['l1', 'g1']]);
    expect(() => TE.addLayer(d, { id: 'a' })).toThrow();
    expect(() => TE.addLayer(d, { parent: 'a' })).toThrow();
    expect(TE.validateTimelineDoc(d)).toEqual([]);
  });
});

describe('13.6 keyframe batch editing', () => {
  const d0 = () => doc([track('a', [['a1', 100, { opacity: 0 }], ['a2', 300, { opacity: 1 }], ['a3', 500, { opacity: 0.5 }]]), track('b', [['b1', 200, { x: 1 }]])]);
  it('shift keeps spacing and stops at 0; keyframes stay sorted', () => {
    const d = TE.shiftKeyframes(d0(), ['a1', 'a2', 'b1'], -150);
    expect(times(d, 'a')).toEqual([['a1', 0], ['a2', 200], ['a3', 500]]);
    expect(times(d, 'b')).toEqual([['b1', 100]]);
    const past = TE.shiftKeyframes(d0(), ['a2'], 300);
    expect(times(past, 'a')).toEqual([['a1', 100], ['a3', 500], ['a2', 600]]);
    expect(TE.shiftKeyframes(d0(), ['a1'], 0)).toEqual(d0());
  });
  it('scale around the first selected keyframe or a pivot', () => {
    expect(times(TE.scaleKeyframes(d0(), ['a1', 'a2', 'a3'], 2), 'a')).toEqual([['a1', 100], ['a2', 500], ['a3', 900]]);
    expect(times(TE.scaleKeyframes(d0(), ['a1', 'a3'], 0.5, 500), 'a')).toEqual([['a1', 300], ['a2', 300], ['a3', 500]]);
    expect(() => TE.scaleKeyframes(d0(), ['a1'], 0)).toThrow();
    expect(() => TE.scaleKeyframes(d0(), ['a1'], NaN)).toThrow();
  });
  it('apply easing to a selection; invalid easing rejected', () => {
    const d = TE.setKeyframeEasing(d0(), ['a1', 'b1'], 'ease-in-out');
    expect(d.layers[0].keyframes![0].easing).toBe('ease-in-out');
    expect(d.layers[1].keyframes![0].easing).toBe('ease-in-out');
    expect(d.layers[0].keyframes![1].easing).toBeUndefined();
    expect(TE.setKeyframeEasing(d, ['a1'], 'linear').layers[0].keyframes![0].easing).toBeUndefined();
    expect(() => TE.setKeyframeEasing(d0(), ['a1'], 'url(x)')).toThrow();
  });
  it('copy / paste: relative times, fresh deterministic ids, onto source or one layer', () => {
    const clip = TE.copyKeyframes(d0(), ['a2', 'a3', 'b1']);
    expect(clip.items.map((i) => [i.layer, i.time])).toEqual([['a', 100], ['a', 300], ['b', 0]]);
    const { doc: d, ids } = TE.pasteKeyframes(d0(), clip, { at: 1000 });
    expect(ids).toEqual(['k1', 'k2', 'k3']);
    expect(times(d, 'a').slice(-2)).toEqual([['k1', 1100], ['k2', 1300]]);
    expect(times(d, 'b')).toEqual([['b1', 200], ['k3', 1000]]);
    const onto = TE.pasteKeyframes(d0(), clip, { at: 0, layer: 'b' });
    expect(times(onto.doc, 'b').map(([, t]) => t)).toEqual([0, 100, 200, 300]);
    expect(TE.validateTimelineDoc(d)).toEqual([]);
    expect(TE.pasteKeyframes(d0(), clip, { at: 1000 })).toEqual({ doc: d, ids });
    expect(() => TE.pasteKeyframes(d0(), {} as any, { at: 0 })).toThrow();
  });
  it('remove, set props, untouched layers are shared (cheap snapshots)', () => {
    const a = d0();
    const d = TE.removeKeyframes(a, ['a2']);
    expect(times(d, 'a').map(([id]) => id)).toEqual(['a1', 'a3']);
    expect(d.layers[1]).toBe(a.layers[1]);
    const p = TE.setKeyframeProps(a, 'b1', { x: null, y: 'random(1, 2)' });
    expect(p.layers[1].keyframes![0].props).toEqual({ y: 'random(1, 2)' });
    expect(TE.removeKeyframes(a, ['nope'])).toBe(a);
    expect(TE.editableKeyframes(a, ['a1', 'zz'])).toEqual(['a1']);
  });
});

describe('13.6 undo / redo', () => {
  const d0 = () => doc([track('a', [['a1', 0, { opacity: 0 }], ['a2', 100, { opacity: 1 }]])]);
  it('undo / redo restore exact snapshots; new edits clear redo; no-ops add nothing', () => {
    const h = TE.createTimelineHistory(d0());
    const first = h.doc;
    h.apply((d) => TE.shiftKeyframes(d, ['a1'], 10), { label: 'Move' });
    const second = h.doc;
    h.apply((d) => TE.setKeyframeEasing(d, ['a1'], 'ease'), { label: 'Easing' });
    expect(h.size).toBe(2);
    expect(h.undoLabel).toBe('Easing');
    h.apply((d) => d);
    expect(h.size).toBe(2);
    expect(h.undo()).toBe(true);
    expect(h.doc).toBe(second);
    expect(h.redoLabel).toBe('Easing');
    h.undo();
    expect(h.doc).toBe(first);
    expect(h.undo()).toBe(false);
    h.redo();
    expect(h.doc).toBe(second);
    h.apply((d) => TE.removeKeyframes(d, ['a2']));
    expect(h.canRedo).toBe(false);
  });
  it('coalesces a drag (same key within the window) into one step', () => {
    let t = 0;
    const h = TE.createTimelineHistory(d0(), { coalesceMs: 500, now: () => t });
    const start = h.doc;
    for (let i = 0; i < 20; i++) { t += 16; h.apply((d) => TE.shiftKeyframes(d, ['a2'], 5), { coalesce: 'drag:a2' }); }
    expect(h.size).toBe(1);
    expect(times(h.doc, 'a')).toEqual([['a1', 0], ['a2', 200]]);
    t += 1000;
    h.apply((d) => TE.shiftKeyframes(d, ['a2'], 5), { coalesce: 'drag:a2' });
    expect(h.size).toBe(2);
    h.undo(); h.undo();
    expect(h.doc).toBe(start);
  });
  it('transactions: begin / commit = one step, cancel restores', () => {
    const h = TE.createTimelineHistory(d0());
    const start = h.doc;
    const seen: number[] = [];
    const off = h.subscribe((d) => seen.push(d.layers[0].keyframes![1].time));
    h.begin('Scale');
    h.apply((d) => TE.scaleKeyframes(d, ['a1', 'a2'], 2));
    h.apply((d) => TE.scaleKeyframes(d, ['a1', 'a2'], 1.5));
    expect(h.canUndo).toBe(false);
    h.commit();
    expect(h.size).toBe(1);
    expect(h.undoLabel).toBe('Scale');
    h.begin();
    h.apply((d) => TE.shiftKeyframes(d, ['a1', 'a2'], 50));
    h.cancel();
    expect(h.size).toBe(1);
    h.undo();
    expect(h.doc).toBe(start);
    off();
    expect(seen).toEqual([200, 300, 350, 300, 100]);
  });
  it('is bounded', () => {
    const h = TE.createTimelineHistory(d0(), { limit: 5 });
    for (let i = 0; i < 12; i++) h.apply((d) => TE.shiftKeyframes(d, ['a2'], 1));
    expect(h.size).toBe(5);
    while (h.undo());
    expect(times(h.doc, 'a')[1][1]).toBe(107);
    h.reset(d0());
    expect(h.canUndo || h.canRedo).toBe(false);
  });
  it('keyboard: Ctrl/Cmd+Z, Shift+Ctrl/Cmd+Z, Ctrl+Y; ignored in text fields', () => {
    expect(TE.historyKeyAction({ key: 'z', ctrlKey: true, metaKey: false, shiftKey: false, altKey: false })).toBe('undo');
    expect(TE.historyKeyAction({ key: 'Z', ctrlKey: false, metaKey: true, shiftKey: true, altKey: false })).toBe('redo');
    expect(TE.historyKeyAction({ key: 'y', ctrlKey: true, metaKey: false, shiftKey: false, altKey: false })).toBe('redo');
    expect(TE.historyKeyAction({ key: 'z', ctrlKey: false, metaKey: false, shiftKey: false, altKey: false })).toBe(null);
    const h = { undo: vi.fn(), redo: vi.fn() };
    const root = document.createElement('div');
    const input = document.createElement('input');
    root.append(input);
    document.body.append(root);
    const off = TE.bindHistoryKeys(root, h);
    const ev = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true });
    root.dispatchEvent(ev);
    expect(h.undo).toHaveBeenCalledTimes(1);
    expect(ev.defaultPrevented).toBe(true);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }));
    expect(h.redo).toHaveBeenCalledTimes(1);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    expect(h.undo).toHaveBeenCalledTimes(1);
    off();
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    expect(h.undo).toHaveBeenCalledTimes(1);
    root.remove();
  });
});

describe('13.6 reproducible preview', () => {
  const d = () => TE.parseTimelineDoc(read('valid/layers.json'));
  it('same time → same frame, whatever was sampled before', () => {
    const x = d();
    const ref = TE.sampleTimelineDoc(x, 650);
    for (const t of [0, 1500, 300, 649.9, 650.1, 10, 650]) TE.sampleTimelineDoc(x, t);
    expect(TE.sampleTimelineDoc(x, 650)).toEqual(ref);
    expect(TE.sampleTimelineDoc(TE.parseTimelineDoc(TE.serializeTimelineDoc(x)), 650)).toEqual(ref);
  });
  it('interpolates numbers, matching strings, hex colours; steps / easing applied; discrete otherwise', () => {
    expect(TE.interpolateValue(0, 10, 0.25)).toBe(2.5);
    expect(TE.interpolateValue('translateX(0px) scale(1)', 'translateX(10px) scale(2)', 0.5)).toBe('translateX(5px) scale(1.5)');
    expect(TE.interpolateValue('#000', '#ffffff', 0.5)).toBe('rgb(128, 128, 128)');
    expect(TE.interpolateValue('none', 'blur(4px)', 0.4)).toBe('none');
    expect(TE.interpolateValue('none', 'blur(4px)', 0.5)).toBe('blur(4px)');
    const s = (t: number) => TE.sampleTimelineDoc(d(), t).layers;
    // the hero group is locked (editing) but plays; c1 is solo, so only c1 plays
    expect(Object.keys(s(500))).toEqual(['c1']);
    // steps(4, end) between 200 and 800: 0, .25, .5, .75 then 1
    expect([210, 360, 500, 799, 800].map((t) => s(t).c1.opacity)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });
  it('random(a, b) depends only on the seed and the keyframe, never on call order', () => {
    const x = d();
    const v = TE.sampleTimelineDoc(x, 0).layers.c1['--x'];
    expect(typeof v).toBe('number');
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(100);
    expect(TE.sampleTimelineDoc(x, 0).layers.c1['--x']).toBe(v);
    expect(TE.sampleTimelineDoc({ ...x, seed: 7 }, 0).layers.c1['--x']).not.toBe(v);
    const r1 = TE.createSeededRandom(5), r2 = TE.createSeededRandom(5);
    expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()]);
    expect(TE.resolveRandom('translateX(random(0, 10)px) rotate(random(0, 10)deg)', 1, 'k')).toMatch(/^translateX\([\d.]+px\) rotate\([\d.]+deg\)$/);
  });
  it('fixed-step clock: frame n is always n × step', () => {
    const c = TE.createFixedClock({ step: 1000 / 60 });
    for (let i = 0; i < 60; i++) c.tick();
    expect(c.time).toBe(1000);
    expect(c.set(505)).toBe(500);
    expect(TE.createFixedClock({ step: 10, start: 33 }).time).toBe(30);
  });
  it('DOM preview: seek writes the full state (stepping and jumping give the same DOM); destroy cleans up', () => {
    const root = document.createElement('div');
    root.innerHTML = '<div class="bg"></div><div class="card"></div><div class="card"></div><div class="cta"></div>';
    document.body.append(root);
    const x = TE.updateLayers(d(), ['c1'], { solo: false });
    const snap = () => root.innerHTML;
    const a = TE.createTimelinePreview(root, x, { clock: TE.createFixedClock({ step: 10 }) });
    for (let i = 0; i < 125; i++) a.advance();
    expect(a.time).toBe(1250);
    const stepped = snap();
    a.seek(0);
    a.seek(1500);
    a.seek(1250);
    expect(snap()).toBe(stepped);
    expect((root.querySelector('.cta') as HTMLElement).style.transform).toMatch(/^scale\([\d.]+\) rotate\(-?[\d.]+deg\)$/);
    // a muted layer's styles are cleared when it stops playing
    a.setDoc(TE.updateLayers(x, ['cta'], { muted: true }));
    expect((root.querySelector('.cta') as HTMLElement).style.transform).toBe('');
    a.destroy();
    expect([...root.querySelectorAll('[style]')].filter((e) => e.getAttribute('style'))).toEqual([]);
    root.remove();
  });
});

describe('13.6 packaging: editor code stays out of lite, core and the timeline runtime', () => {
  const src = (f: string) => readFileSync(join(__dirname, '../src', f), 'utf8');
  it('no runtime entry imports the editor', () => {
    for (const f of ['components/lite.ts', 'core.ts', 'index.ts', 'components/timeline/index.ts', 'components/timeline/core.ts', 'components/index.ts']) expect(src(f), f).not.toMatch(/timeline\/editor|timeline-editor/);
  });
  it('is its own entry point', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
    expect(pkg.exports['./components/timeline-editor']).toBeTruthy();
  });
});
