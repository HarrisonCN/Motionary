// 14.3.0 — Studio canvas foundations (`motionary/studio/canvas` = `motionary/components/studio-canvas`): visual
// selection, marquee and multi-select, layer order / lock / hide, guides and snapping (guides, siblings' edges and
// centres, grid), drag / resize / rotate with pointer and touch (pinch-zoom of the canvas), keyboard navigation and
// nudge, an accessible selection model (listbox / option, roving focus, live announcements).
//
// Built on the 13.6 timeline editor model and Scene Format v2 — no new document format: geometry is keyframe props at
// the edit time (`translate`, `rotate`, `width`, `height`), lock = `locked`, hide = `muted`, order = layer order.
// Every edit is a list of ops that replays losslessly on a Scene v2 document (`applyCanvasOps`) and goes through the
// existing `createTimelineHistory` (one gesture = one undo step).
//
// jsdom has no layout: the controller tests pass `measure` (the untransformed layout box of each layer element) and
// dispatch pointer events directly. test/browser/studio-canvas.spec.mjs drives Chromium / Firefox / WebKit with real
// mouse input and touch pointer emulation in a phone viewport.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import * as C from '../src/components/studio/canvas';
import {
  STUDIO_CANVAS_VERSION, readCanvasGeometry, canvasBox, canvasBounds, rectsIntersect, marqueeHits, snapLines, snapValue,
  snapRect, snapToGrid, resizeBox, rotationFromPointer, canvasSetBox, canvasMove, canvasSetLocked, canvasSetHidden,
  canvasReorder, applyCanvasOps, createStudioCanvas,
} from '../src/components/studio/canvas';
import { createTimelineDoc, createTimelineHistory, timelineDocToScene, normalizeTimelineDoc } from '../src/components/timeline/editor/index';
import type { TimelineDoc } from '../src/components/timeline/editor/index';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8')) as { name: string; import?: string; file?: string; limit: number }[];
// the 14.2.0 budget lines (snapshot of main at b36f5108; CI clones are shallow)
const prevBudgets = JSON.parse(readFileSync('test/fixtures/size-budget-14-2-0.json', 'utf8')) as typeof budgets;

const doc0 = (): TimelineDoc => createTimelineDoc({
  name: 'card',
  layers: [
    { id: 'title', type: 'track', name: 'Title', target: '#title', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 500, props: { opacity: 1, translate: '40px 10px' } }] },
    { id: 'img', type: 'track', name: 'Image', target: '#img', keyframes: [] },
    { id: 'g', type: 'group', name: 'Buttons' },
    { id: 'ok', type: 'track', name: 'OK', parent: 'g', target: '#ok', keyframes: [] },
    { id: 'no', type: 'track', name: 'Cancel', parent: 'g', target: '#no', keyframes: [] },
  ],
});
const BASES = { title: { x: 10, y: 10, width: 100, height: 20 }, img: { x: 200, y: 50, width: 80, height: 60 }, ok: { x: 10, y: 200, width: 40, height: 20 }, no: { x: 60, y: 200, width: 40, height: 20 } };
const sceneOf = (d: TimelineDoc) => timelineDocToScene(d);
/** The canvas op contract: replaying `ops` on the scene of `before` gives exactly the scene of `after`. */
const lossless = (before: TimelineDoc, e: { doc: TimelineDoc; ops: C.CanvasOp[] }) => {
  expect(applyCanvasOps(sceneOf(before), e.ops)).toEqual(sceneOf(e.doc));
  expect(normalizeTimelineDoc(e.doc)).toEqual(e.doc); // the edited document stays canonical
};

// ---------------------------------------------------------------------------------------------------------------
describe('14.3 Studio canvas: entry and packaging', () => {
  it('is its own opt-in entry motionary/studio/canvas (= motionary/components/studio-canvas), not in lite / core / motion', () => {
    expect(pkg.exports['./studio/canvas']).toBeTruthy();
    expect(pkg.exports['./studio/canvas']).toEqual(pkg.exports['./components/studio-canvas']);
    for (const f of ['src/components/lite.ts', 'src/components/motion/index.ts', 'src/components/core/index.ts', 'src/core.ts', 'src/index.ts'])
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/studio/);
    expect(STUDIO_CANVAS_VERSION).toBe(1);
  });
  it('has its own budget line (≤ 12 KB) and raises no existing budget (lite stays 70 KB)', () => {
    const own = budgets.find((b) => b.import && /pkg\/components\/studio-canvas'/.test(b.import));
    expect(own, 'budget line for motionary/components/studio-canvas').toBeTruthy();
    expect(own!.limit).toBeLessThanOrEqual(12 * 1024);
    for (const b of prevBudgets) {
      if (b.name.includes("motionary/components/compat-v13'")) continue; // removed in 15.0 (docs/deprecations-v15.md)
      const now = budgets.find((x) => x.name === b.name);
      expect(now, `budget line kept: ${b.name}`).toBeTruthy();
      expect(now!.limit, `budget not raised: ${b.name}`).toBeLessThanOrEqual(b.limit);
    }
    expect(budgets.find((b) => /lite/.test(b.name) && b.limit === 70 * 1024), 'lite 70 KB budget').toBeTruthy();
  });
  it('zero runtime dependencies; version 14.3.0; docs (incl. the real-device checklist) + changelog', () => {
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.version).toMatch(/^(14\.([3-9]|\d\d)\.\d+|(1[5-9]|[2-9]\d)\.\d+\.\d+(-[0-9A-Za-z.]+)?)$/); // 14.3.0 or a later 14.x
    expect(existsSync('docs/studio-canvas.md')).toBe(true);
    const doc = readFileSync('docs/studio-canvas.md', 'utf8');
    for (const s of ['createStudioCanvas', 'applyCanvasOps', 'marquee', 'snap', 'grid', 'guides', 'locked', 'muted', 'pinch', 'touch-action', 'aria-selected', 'Shift', 'undo', 'Scene Format v2', 'Real-device checklist', 'iOS Safari', 'Android Chrome'])
      expect(doc, s).toContain(s);
    expect(readFileSync('CHANGELOG.md', 'utf8')).toMatch(/## \[14\.3\.0\]/);
  });
  it('imports without touching window (SSR-safe) and exports the full public surface', () => {
    for (const k of ['readCanvasGeometry', 'canvasBox', 'canvasBounds', 'rectsIntersect', 'marqueeHits', 'snapLines', 'snapValue', 'snapRect', 'snapToGrid', 'resizeBox', 'rotationFromPointer', 'canvasSetBox', 'canvasMove', 'canvasSetLocked', 'canvasSetHidden', 'canvasReorder', 'applyCanvasOps', 'createStudioCanvas'])
      expect(typeof (C as any)[k], k).toBe('function');
    const src = readFileSync('src/components/studio/canvas.ts', 'utf8');
    expect(src).not.toMatch(/^\s*(window|document)\./m);
    expect(src).not.toMatch(/(window|document)\.addEventListener/); // no global listeners at all
  });
});

describe('14.3 geometry ↔ Scene v2 keyframe props', () => {
  it('reads translate / rotate / width / height at the edit time (held from the last keyframe at or before it)', () => {
    const d = doc0();
    expect(readCanvasGeometry(d, 'title', 0)).toEqual({ x: 40, y: 10, rotation: 0 }); // before the first geometry keyframe: its value
    expect(readCanvasGeometry(d, 'title', 600)).toEqual({ x: 40, y: 10, rotation: 0 });
    expect(readCanvasGeometry(d, 'img', 0)).toEqual({ x: 0, y: 0, rotation: 0 });
    expect(readCanvasGeometry(d, 'g', 0)).toBeNull(); // groups have no box
    expect(readCanvasGeometry(d, 'nope', 0)).toBeNull();
  });
  it('a value the canvas cannot represent (%, calc, …) makes the layer read-only on the canvas instead of being rewritten', () => {
    const d = createTimelineDoc({ layers: [{ id: 'a', type: 'track', target: '#a', keyframes: [{ id: 'k', time: 0, props: { translate: '10% 0px' } }] }] });
    expect(readCanvasGeometry(d, 'a', 0)).toBeNull();
    const e = canvasMove(d, ['a'], 0, { a: { x: 0, y: 0, width: 10, height: 10 } }, 5, 5);
    expect(e.doc).toBe(d);
    expect(e.ops).toEqual([]);
  });
  it('canvasBox / canvasBounds: the box is the base layout box + translate (+ size overrides); bounds are axis-aligned', () => {
    expect(canvasBox({ x: 10, y: 10, width: 100, height: 20 }, { x: 40, y: 10, rotation: 0 })).toEqual({ x: 50, y: 20, width: 100, height: 20, rotation: 0 });
    expect(canvasBox({ x: 0, y: 0, width: 100, height: 20 }, { x: 0, y: 0, width: 50, height: 50, rotation: 90 })).toEqual({ x: 0, y: 0, width: 50, height: 50, rotation: 90 });
    const b = canvasBounds({ x: 0, y: 0, width: 100, height: 20, rotation: 90 });
    for (const [k, v] of Object.entries({ x: 40, y: -40, width: 20, height: 100 })) expect((b as any)[k]).toBeCloseTo(v, 6);
  });
});

describe('14.3 canvas ops map losslessly to Scene v2 and keep the timeline model', () => {
  it('move adds a keyframe at the edit time (or updates the one there) with the new translate', () => {
    const d = doc0();
    const e = canvasMove(d, ['img'], 250, BASES, 15, -5);
    expect(e.ops).toEqual([{ op: 'add-keyframe', layer: 'img', keyframe: { id: 'k3', time: 250, props: { translate: '15px -5px' } } }]);
    lossless(d, e);
    const e2 = canvasMove(e.doc, ['img'], 250, BASES, 5, 5);
    expect(e2.ops).toEqual([{ op: 'set-props', layer: 'img', keyframe: 'k3', props: { translate: '20px 0px' } }]);
    lossless(e.doc, e2);
    // title at 500 has a keyframe already: its other props are kept
    const e3 = canvasMove(d, ['title'], 500, BASES, 1, 1);
    expect(e3.doc.layers[0].keyframes![1].props).toEqual({ opacity: 1, translate: '41px 11px' });
    lossless(d, e3);
  });
  it('multi-move skips locked layers (and layers in a locked group) — they produce no ops', () => {
    const d = canvasSetLocked(doc0(), ['g'], true).doc;
    const e = canvasMove(d, ['img', 'ok', 'no'], 0, BASES, 3, 4);
    expect(e.ops.map((o: any) => o.layer)).toEqual(['img']);
    lossless(d, e);
  });
  it('resize / rotate write width, height and rotate; values are rounded to 0.01', () => {
    const d = doc0();
    const e = canvasSetBox(d, 'img', 0, BASES.img, { x: 190, y: 40.123456, width: 100, height: 80, rotation: 15.5 });
    expect(e.ops).toEqual([{ op: 'add-keyframe', layer: 'img', keyframe: { id: 'k3', time: 0, props: { translate: '-10px -9.88px', width: '100px', height: '80px', rotate: '15.5deg' } } }]);
    lossless(d, e);
    expect(readCanvasGeometry(e.doc, 'img', 0)).toEqual({ x: -10, y: -9.88, width: 100, height: 80, rotation: 15.5 });
    // only what changed is written
    const e2 = canvasSetBox(e.doc, 'img', 0, BASES.img, { rotation: 30 });
    expect(e2.ops).toEqual([{ op: 'set-props', layer: 'img', keyframe: 'k3', props: { rotate: '30deg' } }]);
    lossless(e.doc, e2);
    expect(canvasSetBox(e2.doc, 'img', 0, BASES.img, { rotation: 30 }).ops).toEqual([]);
  });
  it('lock = `locked`, hide = `muted` (left out of preview and export) — both through updateLayers', () => {
    const d = doc0();
    const e = canvasSetHidden(d, ['img', 'ok'], true);
    expect(e.ops).toEqual([{ op: 'update-layers', ids: ['img', 'ok'], patch: { muted: true } }]);
    expect(e.doc.layers.find((l) => l.id === 'img')!.muted).toBe(true);
    lossless(d, e);
    const e2 = canvasSetHidden(e.doc, ['img'], false);
    expect(e2.doc.layers.find((l) => l.id === 'img')!.muted).toBeUndefined();
    lossless(e.doc, e2);
    const e3 = canvasSetLocked(d, ['title'], true);
    expect(e3.ops).toEqual([{ op: 'update-layers', ids: ['title'], patch: { locked: true } }]);
    lossless(d, e3);
    expect(canvasSetLocked(e3.doc, ['title'], true).ops).toEqual([]); // no-op → no ops
  });
  it('layer order: the first layer of a group is in front; forward / backward / front / back move within its siblings', () => {
    const d = doc0();
    const ids = (x: TimelineDoc) => x.layers.map((l) => l.id).join(',');
    const f = canvasReorder(d, 'img', 'forward');
    expect(ids(f.doc)).toBe('img,title,g,ok,no');
    expect(f.ops).toEqual([{ op: 'move-layer', layer: 'img', index: 0 }]);
    lossless(d, f);
    expect(ids(canvasReorder(d, 'title', 'back').doc)).toBe('img,g,ok,no,title');
    expect(ids(canvasReorder(d, 'no', 'front').doc)).toBe('title,img,g,no,ok'); // stays inside its group
    expect(canvasReorder(d, 'title', 'forward').ops).toEqual([]); // already in front
    const locked = canvasSetLocked(d, ['img'], true).doc;
    expect(canvasReorder(locked, 'img', 'front').ops).toEqual([]);
  });
  it('applyCanvasOps keeps what timeline v1 cannot hold (preset / effect layers, tokens, composite, loop)', () => {
    const d = doc0();
    const e = canvasMove(d, ['title'], 500, BASES, 2, 0);
    const scene: any = { ...sceneOf(d), loop: true, tokens: { duration: { x: 10 } } };
    scene.layers = [...scene.layers, { id: 'fx', type: 'track', effect: 'confetti', start: 100 }];
    scene.layers[0] = { ...scene.layers[0], keyframes: scene.layers[0].keyframes.map((k: any) => ({ ...k, composite: 'add' })) };
    const out: any = applyCanvasOps(scene, e.ops);
    expect(out.loop).toBe(true);
    expect(out.tokens).toEqual({ duration: { x: 10 } });
    expect(out.layers.at(-1)).toEqual({ id: 'fx', type: 'track', effect: 'confetti', start: 100 });
    expect(out.layers[0].keyframes[1]).toEqual({ id: 'k2', time: 500, props: { opacity: 1, translate: '42px 10px' }, composite: 'add' });
    expect(scene.layers[0].keyframes[1].props.translate).toBe('40px 10px'); // pure: input untouched
  });
  it('rejects malformed ops instead of guessing', () => {
    expect(() => applyCanvasOps(sceneOf(doc0()), [{ op: 'nope' } as any])).toThrow();
    expect(() => applyCanvasOps(sceneOf(doc0()), [{ op: 'set-props', layer: 'img', keyframe: 'missing', props: { translate: '1px 1px' } }])).toThrow();
    expect(() => applyCanvasOps(sceneOf(doc0()), [{ op: 'set-props', layer: 'title', keyframe: 'k1', props: JSON.parse('{"__proto__":"1px"}') }])).toThrow();
    expect(() => applyCanvasOps(sceneOf(doc0()), [{ op: 'set-props', layer: 'title', keyframe: 'k1', props: { translate: 5 as any } }])).toThrow();
  });
});

describe('14.3 snapping and hit-testing math (pure)', () => {
  it('snapLines: edges and centres of the other boxes plus the guides, sorted and unique', () => {
    expect(snapLines([{ x: 0, y: 0, width: 100, height: 20 }, { x: 50, y: 10, width: 50, height: 20 }], { x: [300], y: [5] })).toEqual({ x: [0, 50, 75, 100, 300], y: [0, 5, 10, 20, 30] });
  });
  it('snapValue: the nearest line within the threshold wins; none → unchanged', () => {
    expect(snapValue(48, [0, 50, 100], 4)).toEqual({ value: 50, line: 50 });
    expect(snapValue(44, [0, 50, 100], 4)).toEqual({ value: 44 });
    expect(snapValue(52.5, [50, 55], 4)).toEqual({ value: 50, line: 50 }); // a tie goes to the first line
    expect(snapValue(52, [50, 55], 4)).toEqual({ value: 50, line: 50 });
  });
  it('snapRect: left / centre / right (top / middle / bottom) against lines, then the grid on an axis with no line', () => {
    const lines = { x: [100], y: [] as number[] };
    const r = snapRect({ x: 47, y: 13, width: 50, height: 20 }, lines, { threshold: 4, grid: 10 });
    expect(r).toEqual({ dx: 3, dy: -3, x: 100 }); // right edge 97 → 100; y on the 10 px grid
    expect(snapRect({ x: 73, y: 0, width: 50, height: 20 }, lines, { threshold: 4 })).toEqual({ dx: 2, dy: 0, x: 100 }); // centre 98 → 100
    expect(snapRect({ x: 30, y: 7, width: 5, height: 5 }, lines, { threshold: 4 })).toEqual({ dx: 0, dy: 0 });
    expect(snapToGrid(14, 10)).toBe(10);
    expect(snapToGrid(15, 10)).toBe(20);
    expect(snapToGrid(14, 0)).toBe(14);
  });
  it('rectsIntersect / marqueeHits: touching counts, rotated boxes use their bounds, hidden boxes are skipped by the caller', () => {
    expect(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 10, width: 5, height: 5 })).toBe(true);
    expect(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 11, y: 0, width: 5, height: 5 })).toBe(false);
    const boxes = { a: { x: 0, y: 0, width: 10, height: 10, rotation: 0 }, b: { x: 100, y: 0, width: 100, height: 10, rotation: 90 }, c: { x: 300, y: 300, width: 10, height: 10, rotation: 0 } };
    expect(marqueeHits(boxes, { x: 5, y: 5, width: 150, height: 20 })).toEqual(['a', 'b']);
    expect(marqueeHits(boxes, { x: -1, y: -1, width: 160, height: 160 }, 'contain')).toEqual(['a']);
    expect(marqueeHits(boxes, { x: 140, y: -50, width: 5, height: 5 })).toEqual(['b']); // rotated: bounds reach y -45
  });
  it('resizeBox: handles move their edges, the opposite edge stays put (also when rotated), Shift keeps the aspect, min size', () => {
    const b = { x: 0, y: 0, width: 100, height: 50, rotation: 0 };
    expect(resizeBox(b, 'e', 10, 99)).toEqual({ x: 0, y: 0, width: 110, height: 50, rotation: 0 });
    expect(resizeBox(b, 'nw', 10, 10)).toEqual({ x: 10, y: 10, width: 90, height: 40, rotation: 0 });
    expect(resizeBox(b, 'se', 100, 0, { keepAspect: true })).toEqual({ x: 0, y: 0, width: 200, height: 100, rotation: 0 });
    expect(resizeBox(b, 'w', 500, 0, { min: 1 })).toEqual({ x: 99, y: 0, width: 1, height: 50, rotation: 0 });
    // rotated 90°: dragging the east handle down grows the width; the west edge (now on top) stays where it was
    const r = resizeBox({ x: 0, y: 0, width: 100, height: 50, rotation: 90 }, 'e', 0, 10);
    for (const [k, v] of Object.entries({ x: -5, y: 5, width: 110, height: 50, rotation: 90 })) expect((r as any)[k]).toBeCloseTo(v, 6);
  });
  it('rotationFromPointer: the angle swept around the centre; Shift snaps to 15° steps; normalized to (-180, 180]', () => {
    const b = { x: 0, y: 0, width: 100, height: 100, rotation: 0 };
    expect(rotationFromPointer(b, { x: 50, y: -50 }, { x: 150, y: 50 }, 0)).toBeCloseTo(90, 6);
    expect(rotationFromPointer(b, { x: 50, y: -50 }, { x: 100, y: 0 }, 10)).toBeCloseTo(55, 6);
    expect(rotationFromPointer(b, { x: 50, y: -50 }, { x: 100, y: 1 }, 0, 15)).toBe(45);
    expect(rotationFromPointer(b, { x: 50, y: -50 }, { x: 50, y: 150 }, 90)).toBeCloseTo(-90, 6);
  });
});

// ---------------------------------------------------------------------------------------------------------------
// controller (jsdom)
type Ev = { type: string; target: EventTarget; fn: any; opts: any };
let added: Ev[] = [];
let origAdd: any, origRemove: any;
const live = () => added.length;
const on = (t: EventTarget) => added.filter((e) => e.target === t).map((e) => e.type).sort();
beforeEach(() => {
  document.body.innerHTML = `<div id="root"><div id="title"></div><div id="img"></div><div id="ok"></div><div id="no"></div><div id="free"></div></div>`;
  added = [];
  origAdd = EventTarget.prototype.addEventListener;
  origRemove = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, fn: any, opts?: any) {
    const capture = typeof opts === 'boolean' ? opts : !!opts?.capture;
    if (fn && !added.some((e) => e.target === this && e.type === type && e.fn === fn && !!e.opts === capture)) added.push({ type, target: this, fn, opts: capture });
    return origAdd.call(this, type, fn, opts);
  };
  EventTarget.prototype.removeEventListener = function (this: EventTarget, type: string, fn: any, opts?: any) {
    const capture = typeof opts === 'boolean' ? opts : !!opts?.capture;
    added = added.filter((e) => !(e.target === this && e.type === type && e.fn === fn && !!e.opts === capture));
    return origRemove.call(this, type, fn, opts);
  };
});
afterEach(() => {
  EventTarget.prototype.addEventListener = origAdd;
  EventTarget.prototype.removeEventListener = origRemove;
});
const $ = (s: string) => document.querySelector(s) as HTMLElement;
const measure = (el: HTMLElement) => (BASES as any)[el.id] ?? { x: 0, y: 0, width: 10, height: 10 };
const ptr = (target: Element, type: string, x: number, y: number, o: Partial<{ id: number; pointerType: string; shiftKey: boolean; ctrlKey: boolean; altKey: boolean }> = {}) => {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, shiftKey: !!o.shiftKey, ctrlKey: !!o.ctrlKey, altKey: !!o.altKey, button: 0, buttons: type === 'pointerup' ? 0 : 1 });
  Object.defineProperty(e, 'pointerId', { value: o.id ?? 1 });
  Object.defineProperty(e, 'pointerType', { value: o.pointerType ?? 'mouse' });
  Object.defineProperty(e, 'isPrimary', { value: (o.id ?? 1) === 1 });
  target.dispatchEvent(e);
  return e;
};
const key = (target: Element, k: string, o: Partial<KeyboardEventInit> = {}) => {
  const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...o });
  target.dispatchEvent(e);
  return e;
};
const make = (o: Partial<C.StudioCanvasOptions> = {}) => {
  const history = createTimelineHistory(doc0(), { now: () => 0 });
  const canvas = createStudioCanvas($('#root'), { history, measure, ...o });
  return { history, canvas };
};

describe('14.3 controller: binding, rendering, accessibility', () => {
  it('binds the track layers whose target is inside the canvas; listbox / option roles, roving tabindex', () => {
    const { canvas } = make();
    expect(canvas.layers()).toEqual(['title', 'img', 'ok', 'no']);
    const root = $('#root');
    expect(root.getAttribute('role')).toBe('listbox');
    expect(root.getAttribute('aria-multiselectable')).toBe('true');
    expect(root.getAttribute('aria-label')).toBe('Canvas');
    expect($('#title').getAttribute('role')).toBe('option');
    expect($('#title').getAttribute('aria-selected')).toBe('false');
    expect($('#title').getAttribute('aria-label')).toBe('Title');
    expect($('#title').tabIndex).toBe(0);
    expect($('#img').tabIndex).toBe(-1);
    expect($('#free').hasAttribute('role')).toBe(false);
    expect(root.querySelector('[role="status"][aria-live="polite"]')).toBeTruthy();
    canvas.destroy();
  });
  it('renders the geometry at the edit time onto the elements; hidden layers get visibility: hidden; order → z-index', () => {
    const { canvas, history } = make();
    expect($('#title').style.translate).toBe('40px 10px');
    history.apply((d) => canvasSetHidden(d, ['img'], true).doc);
    expect($('#img').style.visibility).toBe('hidden');
    expect(+$('#title').style.zIndex).toBeGreaterThan(+$('#img').style.zIndex);
    canvas.destroy();
  });
  it('destroy() restores every attribute and inline style it touched and removes its overlay', () => {
    $('#title').style.translate = '1px 2px';
    $('#title').setAttribute('aria-label', 'Mine');
    const before = $('#root').outerHTML;
    const { canvas } = make();
    canvas.select(['title', 'img']);
    canvas.move(5, 5);
    canvas.destroy();
    expect($('#root').outerHTML).toBe(before);
  });
  it('selection: select / add / toggle / selectAll / clear; aria-selected follows; onSelect fires', () => {
    const seen: string[][] = [];
    const { canvas } = make({ onSelect: (ids) => seen.push(ids) });
    canvas.select(['img']);
    canvas.select(['title'], { add: true });
    expect(canvas.selection).toEqual(['img', 'title']);
    expect($('#img').getAttribute('aria-selected')).toBe('true');
    canvas.select(['img'], { toggle: true });
    expect(canvas.selection).toEqual(['title']);
    canvas.selectAll();
    expect(canvas.selection).toEqual(['title', 'img', 'ok', 'no']);
    canvas.clearSelection();
    expect(canvas.selection).toEqual([]);
    expect(seen.length).toBe(5);
    canvas.destroy();
  });
});

describe('14.3 controller: pointer and touch editing through the undo history', () => {
  it('click selects (Shift / Ctrl toggles); a drag moves the whole selection as ONE undo step', () => {
    const { canvas, history } = make({ snap: false });
    ptr($('#img'), 'pointerdown', 210, 60);
    ptr($('#img'), 'pointerup', 210, 60);
    expect(canvas.selection).toEqual(['img']);
    expect(history.size).toBe(0); // a click is not an edit
    ptr($('#ok'), 'pointerdown', 20, 210, { shiftKey: true });
    ptr($('#ok'), 'pointerup', 20, 210, { shiftKey: true });
    expect(canvas.selection).toEqual(['img', 'ok']);
    ptr($('#img'), 'pointerdown', 210, 60);
    for (let i = 1; i <= 5; i++) ptr($('#root'), 'pointermove', 210 + i * 4, 60 + i * 2);
    ptr($('#root'), 'pointerup', 230, 70);
    expect(readCanvasGeometry(history.doc, 'img', 0)).toEqual({ x: 20, y: 10, rotation: 0 });
    expect(readCanvasGeometry(history.doc, 'ok', 0)).toEqual({ x: 20, y: 10, rotation: 0 });
    expect(history.size).toBe(1);
    expect(history.undoLabel).toBe('Move');
    history.undo();
    expect(readCanvasGeometry(history.doc, 'img', 0)).toEqual({ x: 0, y: 0, rotation: 0 });
    expect($('#img').style.translate).toBe('');
    history.redo();
    expect($('#img').style.translate).toBe('20px 10px');
    canvas.destroy();
  });
  it('onEdit receives the ops of each committed edit — replaying them on the scene gives the new scene', () => {
    const edits: { label: string; ops: C.CanvasOp[] }[] = [];
    const { canvas, history } = make({ snap: false, onEdit: (e) => edits.push(e) });
    const before = history.doc;
    ptr($('#img'), 'pointerdown', 210, 60);
    ptr($('#root'), 'pointermove', 230, 80);
    ptr($('#root'), 'pointerup', 230, 80);
    expect(edits.length).toBe(1);
    expect(applyCanvasOps(timelineDocToScene(before), edits[0].ops)).toEqual(timelineDocToScene(history.doc));
    canvas.destroy();
  });
  it('snaps a drag to sibling edges / centres, guides and the grid; Alt disables snapping', () => {
    const { canvas, history } = make({ guides: { x: [400] }, snap: { threshold: 5 } });
    // img right edge 280 → drag +118 → 398 → guide 400
    ptr($('#img'), 'pointerdown', 210, 60);
    ptr($('#root'), 'pointermove', 328, 60);
    expect($('#root').querySelector('[data-canvas-guide="x"]')).toBeTruthy();
    ptr($('#root'), 'pointerup', 328, 60);
    expect(readCanvasGeometry(history.doc, 'img', 0)!.x).toBe(120);
    expect($('#root').querySelector('[data-canvas-guide]')).toBeNull(); // guides go away at the end
    history.undo();
    ptr($('#img'), 'pointerdown', 210, 60, { altKey: true });
    ptr($('#root'), 'pointermove', 328, 60, { altKey: true });
    ptr($('#root'), 'pointerup', 328, 60, { altKey: true });
    expect(readCanvasGeometry(history.doc, 'img', 0)!.x).toBe(118);
    canvas.destroy();
    const g = make({ grid: 8, snap: { threshold: 0 } });
    ptr($('#ok'), 'pointerdown', 20, 210);
    ptr($('#root'), 'pointermove', 33, 213);
    ptr($('#root'), 'pointerup', 33, 213);
    // ok base (10, 200) + (13, 3) = (23, 203) → grid (24, 200)
    expect(readCanvasGeometry(g.history.doc, 'ok', 0)).toEqual({ x: 14, y: 0, rotation: 0 });
    g.canvas.destroy();
  });
  it('marquee from empty space selects what it touches (Shift adds); a plain click on empty space clears', () => {
    const { canvas } = make();
    ptr($('#root'), 'pointerdown', 0, 190);
    ptr($('#root'), 'pointermove', 70, 215);
    expect($('#root').querySelector('[data-canvas-marquee]')).toBeTruthy();
    ptr($('#root'), 'pointerup', 70, 215);
    expect(canvas.selection).toEqual(['ok', 'no']);
    expect($('#root').querySelector('[data-canvas-marquee]')).toBeNull();
    ptr($('#root'), 'pointerdown', 190, 40, { shiftKey: true });
    ptr($('#root'), 'pointermove', 300, 120, { shiftKey: true });
    ptr($('#root'), 'pointerup', 300, 120, { shiftKey: true });
    expect(canvas.selection).toEqual(['ok', 'no', 'img']);
    ptr($('#root'), 'pointerdown', 500, 500);
    ptr($('#root'), 'pointerup', 500, 500);
    expect(canvas.selection).toEqual([]);
    canvas.destroy();
  });
  it('locked layers are selectable but do not move; hidden layers are not hit by the marquee', () => {
    const { canvas, history } = make({ snap: false });
    canvas.lock(['img']);
    canvas.hide(['ok']);
    ptr($('#img'), 'pointerdown', 210, 60);
    ptr($('#root'), 'pointermove', 250, 60);
    ptr($('#root'), 'pointerup', 250, 60);
    expect(canvas.selection).toEqual(['img']);
    expect(readCanvasGeometry(history.doc, 'img', 0)!.x).toBe(0);
    ptr($('#root'), 'pointerdown', 0, 190);
    ptr($('#root'), 'pointermove', 120, 230);
    ptr($('#root'), 'pointerup', 120, 230);
    expect(canvas.selection).toEqual(['no']);
    expect(history.undoLabel).toBe('Hide');
    canvas.destroy();
  });
  it('resize and rotate handles (single selection): one undo step each, Shift keeps the aspect / snaps 15°', () => {
    const { canvas, history } = make({ snap: false });
    canvas.select(['img']);
    const se = $('#root').querySelector('[data-canvas-handle="se"]')!;
    expect(se).toBeTruthy();
    ptr(se, 'pointerdown', 280, 110);
    ptr($('#root'), 'pointermove', 300, 140);
    ptr($('#root'), 'pointerup', 300, 140);
    expect(readCanvasGeometry(history.doc, 'img', 0)).toEqual({ x: 0, y: 0, width: 100, height: 90, rotation: 0 });
    expect(history.undoLabel).toBe('Resize');
    const rot = $('#root').querySelector('[data-canvas-handle="rotate"]')!;
    // centre (250, 95); start straight above, end straight right → 90°, Shift snaps 87° → 90°
    ptr(rot, 'pointerdown', 250, 20);
    ptr($('#root'), 'pointermove', 330, 91, { shiftKey: true });
    ptr($('#root'), 'pointerup', 330, 91, { shiftKey: true });
    expect(readCanvasGeometry(history.doc, 'img', 0)!.rotation).toBe(90);
    expect(history.undoLabel).toBe('Rotate');
    expect(history.size).toBe(2);
    canvas.destroy();
  });
  it('touch: a finger drag moves; a second finger turns the gesture into a pinch-zoom (the move is cancelled)', () => {
    const zooms: number[] = [];
    const { canvas, history } = make({ snap: false, onZoom: (z) => zooms.push(z) });
    ptr($('#img'), 'pointerdown', 210, 60, { pointerType: 'touch', id: 11 });
    ptr($('#root'), 'pointermove', 240, 60, { pointerType: 'touch', id: 11 });
    ptr($('#root'), 'pointerup', 240, 60, { pointerType: 'touch', id: 11 });
    expect(readCanvasGeometry(history.doc, 'img', 0)!.x).toBe(30);
    ptr($('#img'), 'pointerdown', 200, 100, { pointerType: 'touch', id: 21 });
    ptr($('#root'), 'pointermove', 205, 100, { pointerType: 'touch', id: 21 }); // the move has started
    ptr($('#root'), 'pointerdown', 305, 100, { pointerType: 'touch', id: 22 });
    ptr($('#root'), 'pointermove', 395, 100, { pointerType: 'touch', id: 22 }); // distance 100 → 190
    expect(canvas.zoom).toBeCloseTo(1.9, 6);
    ptr($('#root'), 'pointerup', 395, 100, { pointerType: 'touch', id: 22 });
    ptr($('#root'), 'pointerup', 205, 100, { pointerType: 'touch', id: 21 });
    expect(readCanvasGeometry(history.doc, 'img', 0)!.x).toBe(30); // the half-started move was cancelled
    expect(history.size).toBe(1);
    expect(zooms.at(-1)).toBeCloseTo(1.9, 6);
    expect($('#root').style.transform).toMatch(/scale\(1\.9\)/);
    canvas.destroy(); // touch-action: none is asserted in the browser spec (jsdom's CSSOM drops touch-action)
    expect($('#root').style.transform).toBe('');
  });
  it('pointercancel cancels the gesture (no history step, the document is restored)', () => {
    const { canvas, history } = make({ snap: false });
    ptr($('#img'), 'pointerdown', 210, 60);
    ptr($('#root'), 'pointermove', 260, 60);
    expect($('#img').style.translate).toBe('50px 0px');
    ptr($('#root'), 'pointercancel', 260, 60);
    expect(history.size).toBe(0);
    expect($('#img').style.translate).toBe('');
    canvas.destroy();
  });
  it('setZoom keeps the point under the origin fixed; zoom is clamped to minZoom…maxZoom', () => {
    const { canvas } = make({ minZoom: 0.5, maxZoom: 4 });
    canvas.setZoom(10);
    expect(canvas.zoom).toBe(4);
    canvas.setZoom(0.1);
    expect(canvas.zoom).toBe(0.5);
    canvas.setZoom(2, { x: 100, y: 100 });
    expect(canvas.zoom).toBe(2);
    canvas.destroy();
  });
});

describe('14.3 controller: keyboard navigation and nudge', () => {
  it('arrows nudge the selection by 1 px (Shift ×10); a burst of nudges is one undo step', () => {
    const { canvas, history } = make();
    canvas.select(['img']);
    key($('#img'), 'ArrowRight');
    key($('#img'), 'ArrowRight');
    key($('#img'), 'ArrowDown', { shiftKey: true });
    expect(readCanvasGeometry(history.doc, 'img', 0)).toEqual({ x: 2, y: 10, rotation: 0 });
    expect(history.size).toBe(1);
    expect(history.undoLabel).toBe('Nudge');
    expect($('#root').querySelector('[role="status"]')!.textContent).toMatch(/Image/);
    canvas.destroy();
  });
  it('Alt+arrows / Home / End move focus (selection follows); Space toggles; Escape clears; Ctrl+A selects all', () => {
    const { canvas } = make();
    $('#title').focus();
    key($('#title'), 'ArrowDown', { altKey: true });
    expect(document.activeElement).toBe($('#img'));
    expect(canvas.selection).toEqual(['img']);
    expect($('#img').tabIndex).toBe(0);
    expect($('#title').tabIndex).toBe(-1);
    key($('#img'), 'End');
    expect(document.activeElement).toBe($('#no'));
    key($('#no'), ' ', { code: 'Space' });
    expect(canvas.selection).toEqual([]);
    key($('#no'), 'a', { ctrlKey: true });
    expect(canvas.selection).toEqual(['title', 'img', 'ok', 'no']);
    key($('#no'), 'Escape');
    expect(canvas.selection).toEqual([]);
    key($('#no'), 'Home');
    expect(document.activeElement).toBe($('#title'));
    canvas.destroy();
  });
  it('with nothing selected, arrows move focus instead of nudging', () => {
    const { canvas, history } = make();
    $('#title').focus();
    key($('#title'), 'ArrowRight');
    expect(document.activeElement).toBe($('#img'));
    expect(history.size).toBe(0);
    canvas.destroy();
  });
  it('Ctrl+] / Ctrl+[ reorder (Shift: front / back); Ctrl+Shift+L locks; Ctrl+Shift+H hides; Ctrl+Z undoes', () => {
    const { canvas, history } = make();
    canvas.select(['img']);
    key($('#img'), ']', { ctrlKey: true, code: 'BracketRight' });
    expect(history.doc.layers[0].id).toBe('img');
    key($('#img'), '{', { ctrlKey: true, shiftKey: true, code: 'BracketLeft' });
    expect(history.doc.layers.map((l) => l.id)).toEqual(['title', 'g', 'ok', 'no', 'img']);
    key($('#img'), 'L', { ctrlKey: true, shiftKey: true, code: 'KeyL' });
    expect(history.doc.layers.find((l) => l.id === 'img')!.locked).toBe(true);
    key($('#img'), 'H', { ctrlKey: true, shiftKey: true, code: 'KeyH' });
    expect(history.doc.layers.find((l) => l.id === 'img')!.muted).toBe(true);
    key($('#img'), 'z', { ctrlKey: true });
    expect(history.doc.layers.find((l) => l.id === 'img')!.muted).toBeUndefined();
    canvas.destroy();
  });
});

describe('14.3 controller: no uncontrolled global listeners', () => {
  it('nothing on window / document ever; drag listeners exist only during a gesture; destroy returns to baseline', () => {
    const base = live();
    const { canvas } = make({ snap: false });
    const root = $('#root');
    const idle = on(root);
    expect(on(window)).toEqual([]);
    expect(on(document)).toEqual([]);
    ptr($('#img'), 'pointerdown', 210, 60);
    expect(on(root).length).toBeGreaterThan(idle.length); // move / up / cancel attached on interaction
    expect(on(window)).toEqual([]);
    expect(on(document)).toEqual([]);
    ptr(root, 'pointermove', 220, 60);
    ptr(root, 'pointerup', 220, 60);
    expect(on(root)).toEqual(idle); // removed on end
    ptr($('#img'), 'pointerdown', 210, 60);
    ptr(root, 'pointercancel', 210, 60);
    expect(on(root)).toEqual(idle);
    // a gesture still running when the canvas is destroyed is ended too
    ptr($('#img'), 'pointerdown', 210, 60);
    canvas.destroy();
    expect(live()).toBe(base);
  });
  it('history subscriptions are released on destroy (later undo / redo does not touch the DOM)', () => {
    const { canvas, history } = make({ snap: false });
    canvas.select(['img']);
    canvas.move(5, 0);
    canvas.destroy();
    history.undo();
    history.redo();
    expect($('#img').style.translate).toBe('');
  });
});
