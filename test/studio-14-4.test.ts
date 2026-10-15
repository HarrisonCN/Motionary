// 14.4.0 — Motion Studio 1.0 (`motionary/studio` = `motionary/components/studio`): a timeline UI (tracks and track
// groups with collapse / mute / lock, a time ruler, a scrubbable playhead, zoom), keyframe editing (drag, marquee,
// multi-select move, copy / paste, snapping to frames and to other keys), a curve editor (cubic-bezier handles,
// presets, spring parameters), a property inspector (values at the current time, add / remove keys), a frame-step
// preview (frame by frame, play / pause, deterministic seek), undo / redo through the existing history (one gesture =
// one step) and save / load (Scene v2 JSON and a Studio project file).
//
// It composes the 13.6 timeline editor model (ops, `createTimelineHistory`, `sampleTimelineDoc`,
// `createTimelinePreview`, Scene v2 mapping) and the 14.3 canvas (`createStudioCanvas`) — nothing is reimplemented.
//
// jsdom has no layout (every rect is 0 × 0 at the origin), so the geometry here is the model's: a key sits at
// x = time × zoom / 1000 inside its row's key cell, and visible row i (0 = first layer) spans y = i × rowHeight.
// test/browser/studio.spec.mjs drives Chromium / Firefox / WebKit with real mouse, keyboard and touch input.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import * as S from '../src/components/studio/index';
import {
  STUDIO_VERSION, STUDIO_PROJECT_FORMAT, CURVE_PRESETS, parseBezier, bezierEasing, springBezier, frameTime, sampleFrames,
  serializeStudioProject, parseStudioProject, createStudio,
} from '../src/components/studio/index';
import {
  createTimelineDoc, createTimelineHistory, timelineDocToScene, loadMotionDoc, isValidEasing, sampleTimelineDoc,
  timelineDocToAnimation, TimelineDocError, addKeyframe,
} from '../src/components/timeline/editor/index';
import type { TimelineDoc } from '../src/components/timeline/editor/index';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8')) as { name: string; import?: string; file?: string; limit: number }[];
// the 14.3.0 budget lines (snapshot of main at a5544232; CI clones are shallow)
const prevBudgets = JSON.parse(readFileSync('test/fixtures/size-budget-14-3-0.json', 'utf8')) as typeof budgets;
const SRC = ['index', 'curve', 'project'].map((f) => readFileSync(`src/components/studio/${f}.ts`, 'utf8')).join('\n');

const F = 1000 / 60; // one frame at 60 fps
const ZOOM = 600; // px per second in the controller tests → one frame = 10 px
const RH = 24; // row height
const doc0 = (): TimelineDoc => createTimelineDoc({
  name: 'card',
  layers: [
    { id: 'title', type: 'track', name: 'Title', target: '#title', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 500, props: { opacity: 1 } }] },
    { id: 'img', type: 'track', name: 'Image', target: '#img', keyframes: [{ id: 'k3', time: 250, props: { opacity: 0.5 } }] },
    { id: 'g', type: 'group', name: 'Buttons' },
    { id: 'ok', type: 'track', name: 'OK', parent: 'g', target: '#ok', keyframes: [{ id: 'k4', time: 100, props: { opacity: 0 } }, { id: 'k5', time: 600, props: { opacity: 1 } }] },
  ],
});

// ---------------------------------------------------------------------------------------------------------------
describe('14.4 Motion Studio: entry and packaging', () => {
  it('is its own opt-in entry motionary/studio (= motionary/components/studio), not in lite / core / motion', () => {
    expect(pkg.exports['./studio']).toBeTruthy();
    expect(pkg.exports['./studio']).toEqual(pkg.exports['./components/studio']);
    for (const f of ['src/components/lite.ts', 'src/components/motion/index.ts', 'src/components/core/index.ts', 'src/core.ts', 'src/index.ts'])
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/studio/);
    expect(readFileSync('scripts/categories.mjs', 'utf8')).toMatch(/studio: 'studio\/index'/);
    expect(readFileSync('bin/public-paths.mjs', 'utf8')).toMatch(/studio: 'components\/studio'/);
    expect(STUDIO_VERSION).toBe(1);
  });
  it('has its own budget line (≤ 25 KB) and raises no existing budget (lite stays 70 KB, studio-canvas 12 KB)', () => {
    const own = budgets.find((b) => b.import && /pkg\/components\/studio'/.test(b.import));
    expect(own, 'budget line for motionary/components/studio').toBeTruthy();
    expect(own!.limit).toBeLessThanOrEqual(25 * 1024);
    for (const b of prevBudgets) {
      if (b.name.includes("motionary/components/compat-v13'")) continue; // removed in 15.0 (docs/deprecations-v15.md)
      const now = budgets.find((x) => x.name === b.name);
      expect(now, `budget line kept: ${b.name}`).toBeTruthy();
      expect(now!.limit, `budget not raised: ${b.name}`).toBeLessThanOrEqual(b.limit);
    }
    expect(budgets.find((b) => /lite/.test(b.name) && b.limit === 70 * 1024), 'lite 70 KB budget').toBeTruthy();
  });
  it('zero runtime dependencies; version 14.4.x; docs (incl. the real-device checklist), changelog, roadmap', () => {
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.version).toMatch(/^(14\.([4-9]|\d\d)\.\d+|(1[5-9]|[2-9]\d)\.\d+\.\d+(-[0-9A-Za-z.]+)?)$/);
    expect(existsSync('docs/studio.md')).toBe(true);
    const doc = readFileSync('docs/studio.md', 'utf8');
    for (const s of ['createStudio', 'role="grid"', 'playhead', 'marquee', 'snap', 'cubic-bezier', 'spring', 'inspector', 'undo', 'Scene Format v2', 'serializeStudioProject', 'parseStudioProject', 'sampleFrames', 'Real-device checklist', 'iOS Safari', 'Android Chrome', 'motionary/studio/canvas'])
      expect(doc, s).toContain(s);
    expect(readFileSync('CHANGELOG.md', 'utf8')).toMatch(/## \[14\.4\.0\]/);
    expect(readFileSync('docs/ROADMAP.md', 'utf8')).toMatch(/\| v14\.4\.0 \| \[已发布\] \| P0 \|.*motionary\/studio/);
  });
  it('composes the timeline editor model and the 14.3 canvas instead of reimplementing them; no global listeners', () => {
    expect(SRC).toMatch(/from '\.\/canvas'/);
    expect(SRC).toMatch(/from '\.\.\/timeline\/editor\/(ops|history|preview|scene|format)'/);
    expect(SRC).toMatch(/createStudioCanvas\(/);
    expect(SRC).toMatch(/createTimelinePreview\(/);
    expect(SRC).toMatch(/shiftKeyframes\(/);
    // no second history / sampler / scene mapping
    expect(SRC).not.toMatch(/function (createTimelineHistory|shiftKeyframes|sampleTimelineDoc|timelineDocToScene|timelineDocFromScene|pasteKeyframes)\b/);
    expect(SRC).not.toMatch(/(window|document)\.addEventListener/);
    expect(SRC).not.toMatch(/^\s*(window|document)\./m); // SSR-safe: nothing at import time
  });
  it('exports its public surface', () => {
    for (const k of ['parseBezier', 'bezierEasing', 'springBezier', 'frameTime', 'sampleFrames', 'serializeStudioProject', 'parseStudioProject', 'createStudio'])
      expect(typeof (S as any)[k], k).toBe('function');
    expect(STUDIO_PROJECT_FORMAT).toBe('motionary-studio');
  });
});

// ---------------------------------------------------------------------------------------------------------------
describe('14.4 curves: cubic-bezier, presets, springs', () => {
  it('parses presets, named eases and cubic-bezier(); serializes back; rejects the rest', () => {
    expect(parseBezier(undefined)).toEqual([0, 0, 1, 1]);
    expect(parseBezier('linear')).toEqual([0, 0, 1, 1]);
    expect(parseBezier('ease-in-out')).toEqual([0.42, 0, 0.58, 1]);
    expect(parseBezier('cubic-bezier(0.1, -0.5, .3,1.6)')).toEqual([0.1, -0.5, 0.3, 1.6]);
    expect(parseBezier('steps(4)')).toBeNull();
    expect(parseBezier('bounce-out')).toBeNull();
    expect(bezierEasing([0, 0, 1, 1])).toBe('linear');
    expect(bezierEasing([0.25, 1.23456, 1.4, 1])).toBe('cubic-bezier(0.25, 1.235, 1, 1)'); // x clamped to 0…1, 3 decimals
    for (const [name, b] of Object.entries(CURVE_PRESETS)) {
      expect(isValidEasing(bezierEasing(b)), name).toBe(true);
      expect(parseBezier(bezierEasing(b)), name).toEqual(b);
    }
    for (const n of ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']) expect(CURVE_PRESETS[n], n).toBeTruthy();
  });
  it('fits a spring to a cubic-bezier: deterministic, valid easing, overshoot only when underdamped', () => {
    const wobbly = springBezier({ stiffness: 180, damping: 12, mass: 1 });
    expect(springBezier({ stiffness: 180, damping: 12, mass: 1 })).toEqual(wobbly);
    expect(isValidEasing(wobbly.easing)).toBe(true);
    expect(Math.max(wobbly.bezier[1], wobbly.bezier[3])).toBeGreaterThan(1); // overshoots
    expect(wobbly.duration).toBeGreaterThan(0);
    const critical = springBezier({ stiffness: 100, damping: 20, mass: 1 }); // ζ = 1
    expect(critical.bezier.every((v) => v >= 0 && v <= 1)).toBe(true);
    expect(critical.duration).toBeGreaterThan(0);
    expect(springBezier({ stiffness: -1, damping: NaN } as any).easing).toMatch(/^cubic-bezier\(|^linear$/); // bad input → defaults
  });
});

// ---------------------------------------------------------------------------------------------------------------
describe('14.4 save / load: Studio project, Scene v2, deterministic frames', () => {
  it('frameTime snaps to the frame grid; sampleFrames samples every frame and is a pure function of the document', () => {
    expect(frameTime(0, 60)).toBe(0);
    expect(frameTime(1001, 60)).toBe(1000);
    expect(frameTime(F * 10 + 3, 60)).toBe(166.6667);
    expect(frameTime(40, 25)).toBe(40);
    const d = doc0();
    const a = sampleFrames(d, { fps: 60 });
    expect(a.length).toBe(Math.round(600 / F) + 1);
    expect(a[30]).toEqual(sampleTimelineDoc(d, frameTime(30 * F, 60)));
    expect(sampleFrames(d, { fps: 60 })).toEqual(a);
  });
  it('round-trips a project losslessly (document + UI state); the scene inside is Scene Format v2', () => {
    const d = doc0();
    const ui = { time: 250, zoom: 300, fps: 30, collapsed: ['g'], springs: { k1: { stiffness: 180, damping: 12, mass: 1 } } };
    const d2 = { ...d, layers: d.layers.map((l) => (l.id === 'title' ? { ...l, keyframes: l.keyframes!.map((k) => (k.id === 'k1' ? { ...k, easing: springBezier(ui.springs.k1).easing } : k)) } : l)) };
    const text = serializeStudioProject(d2, ui);
    const j = JSON.parse(text);
    expect(j.format).toBe('motionary-studio');
    expect(j.version).toBe(1);
    expect(j.scene).toEqual(timelineDocToScene(d2));
    const back = parseStudioProject(text);
    expect(back.doc).toEqual(d2);
    expect(back.ui).toEqual(ui);
    expect(back.lost).toEqual([]);
    expect(serializeStudioProject(back.doc, back.ui)).toBe(text); // stable text
  });
  it('opens Scene v2, timeline v1 and <usa-player> animation JSON; lists what a scene loses', () => {
    const d = doc0();
    expect(parseStudioProject(timelineDocToScene(d)).doc).toEqual(d);
    expect(parseStudioProject(JSON.stringify(d)).doc).toEqual(d);
    expect(sampleFrames(parseStudioProject(timelineDocToAnimation(d)).doc, { fps: 60 }).length).toBeGreaterThan(1);
    const scene: any = timelineDocToScene(d);
    scene.layers.push({ id: 'fx', type: 'track', preset: 'fade-up' });
    scene.loop = true;
    const r = parseStudioProject(scene);
    expect(r.lost.map((l) => l.path)).toEqual(expect.arrayContaining(['loop', 'layers[4].preset']));
  });
  it('drops UI state that does not match the document; rejects malformed or hostile input with TimelineDocError', () => {
    const d = doc0();
    const p = JSON.parse(serializeStudioProject(d, {}));
    p.studio = { time: -5, zoom: 1e9, fps: 0.5, collapsed: ['nope', 'g', 7], springs: { k1: { stiffness: 'x' }, zz: { stiffness: 1, damping: 1, mass: 1 } }, extra: 1 };
    const r = parseStudioProject(p);
    expect(r.ui.collapsed).toEqual(['g']);
    expect(r.ui.springs ?? {}).toEqual({});
    expect(r.ui.time).toBe(0);
    expect(r.ui.fps).toBe(60);
    expect(r.ui.zoom).toBeLessThanOrEqual(10000);
    for (const bad of ['', '{', 'null', '[]', '{"format":"motionary-studio","version":2,"scene":{}}', JSON.stringify({ format: 'motionary-studio', version: 1, scene: { format: 'motionary-scene', version: 2, layers: [{ id: '__proto__', type: 'track', keyframes: [] }] } }), JSON.stringify({ format: 'motionary-scene', version: 2, layers: [{ id: 'a', type: 'track', keyframes: [{ id: 'k', time: 0, props: 5 }] }] }), 'x'.repeat(5e6 + 1)])
      expect(() => parseStudioProject(bad), bad.slice(0, 60)).toThrow(TimelineDocError);
  });
});

// ---------------------------------------------------------------------------------------------------------------
type Ev = { type: string; target: EventTarget; fn: any; opts: any };
let added: Ev[] = [];
let origAdd: any, origRemove: any;
const live = () => added.length;
const on = (t: EventTarget) => added.filter((e) => e.target === t).map((e) => e.type).sort();
beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div><div id="stage"><div id="title"></div><div id="img"></div><div id="ok"></div></div>`;
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
const $$ = (s: string) => Array.from(document.querySelectorAll(s)) as HTMLElement[];
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
const click = (el: Element) => (el as HTMLElement).click();
const type = (el: Element, v: string) => {
  (el as HTMLInputElement).value = v;
  el.dispatchEvent(new Event('change', { bubbles: true }));
};
const make = (o: Partial<S.StudioOptions> = {}, d: TimelineDoc = doc0()) => {
  const history = createTimelineHistory(d, { now: () => 0 });
  const studio = createStudio($('#app'), { history, zoom: ZOOM, rowHeight: RH, length: 600, ...o });
  return { history, studio };
};
const kf = (d: TimelineDoc, id: string) => d.layers.flatMap((l) => l.keyframes || []).find((k) => k.id === id)!;
/** Centre of key `id` in client coordinates (row index = visible row, 0 = first layer). */
const at = (row: number, time: number) => [(time * ZOOM) / 1000, row * RH + RH / 2] as const;

describe('14.4 controller: timeline grid, rows, accessibility', () => {
  it('renders a grid: ruler header row, one row per visible layer, levels, groups expandable, roving tabindex', () => {
    const { studio } = make();
    const grid = $('[role="grid"]');
    expect(grid.getAttribute('aria-label')).toBe('Timeline');
    expect(grid.getAttribute('aria-multiselectable')).toBe('true');
    const rows = $$('[role="grid"] [role="row"]');
    expect(rows.length).toBe(5); // ruler + 4 layers
    expect(grid.getAttribute('aria-rowcount')).toBe('5');
    expect(rows.map((r) => r.getAttribute('aria-rowindex'))).toEqual(['1', '2', '3', '4', '5']);
    expect(rows[0].querySelectorAll('[role="columnheader"]').length).toBe(2);
    expect($('[data-layer="ok"]').getAttribute('aria-level')).toBe('2');
    expect($('[data-layer="title"]').getAttribute('aria-level')).toBe('1');
    expect($('[data-layer="g"]').getAttribute('aria-expanded')).toBe('true');
    expect($('[data-layer="title"] [role="rowheader"]')).toBeTruthy();
    expect($('[data-layer="title"] [role="gridcell"]')).toBeTruthy();
    const k2 = $('[data-key="k2"]');
    expect(k2.tagName).toBe('BUTTON');
    expect(k2.getAttribute('aria-pressed')).toBe('false');
    expect(k2.getAttribute('aria-label')).toMatch(/Title.*opacity.*0\.5/);
    expect(k2.style.left).toBe('300px');
    expect($$('[role="grid"] [data-layer] [tabindex="0"]').length).toBe(1); // one tab stop in the rows (+ the playhead slider)
    const ph = $('[data-playhead]');
    expect(ph.getAttribute('role')).toBe('slider');
    expect(ph.getAttribute('aria-valuenow')).toBe('0');
    expect(ph.getAttribute('aria-valuemax')).toBe('600');
    expect($('[data-studio] [role="status"][aria-live="polite"]')).toBeTruthy();
    expect($('[role="toolbar"]')).toBeTruthy();
    expect($('[data-keys="title"]').getAttribute('style')).toMatch(/touch-action:\s*none/);
    studio.destroy();
    expect($('#app').innerHTML).toBe('');
  });
  it('track groups: collapse hides the children (UI state); mute / lock edit the document through the history', () => {
    const { studio, history } = make();
    click($('[data-layer="g"] [data-act="collapse"]'));
    expect($('[data-layer="ok"]')).toBeNull();
    expect($('[data-layer="g"]').getAttribute('aria-expanded')).toBe('false');
    expect(studio.collapsed).toEqual(['g']);
    expect(history.size).toBe(0);
    click($('[data-layer="g"] [data-act="collapse"]'));
    expect($('[data-layer="ok"]')).toBeTruthy();
    click($('[data-layer="g"] [data-act="mute"]'));
    expect(history.doc.layers.find((l) => l.id === 'g')!.muted).toBe(true);
    expect($('[data-layer="g"] [data-act="mute"]').getAttribute('aria-pressed')).toBe('true');
    click($('[data-layer="g"] [data-act="lock"]'));
    expect(history.doc.layers.find((l) => l.id === 'g')!.locked).toBe(true);
    expect(history.size).toBe(2);
    expect(studio.moveKeys(100, ['k4'])).toBe(false); // a locked group locks its children
    expect(kf(history.doc, 'k4').time).toBe(100);
    studio.undo();
    studio.undo();
    expect(history.doc.layers.find((l) => l.id === 'g')!.muted).toBeUndefined();
    studio.destroy();
  });
  it('adds tracks and groups from the toolbar (a track goes into the focused group)', () => {
    const { studio, history } = make({}, createTimelineDoc());
    type($('[data-field="track-name"]'), 'Panel');
    click($('[data-act="add-group"]'));
    const g = history.doc.layers[0];
    expect(g).toMatchObject({ type: 'group', name: 'Panel' });
    studio.focusLayer(g.id);
    type($('[data-field="track-name"]'), 'Box');
    type($('[data-field="track-target"]'), '#title');
    click($('[data-act="add-track"]'));
    expect(history.doc.layers[1]).toMatchObject({ type: 'track', name: 'Box', target: '#title', parent: g.id });
    expect(history.size).toBe(2);
    studio.destroy();
  });
});

describe('14.4 controller: playhead, zoom, frame-step preview', () => {
  it('scrubs the playhead on the ruler (snapped to frames); writes the sampled frame to the stage', () => {
    const { studio } = make({ stage: $('#stage'), canvas: false });
    const ruler = $('[data-ruler]');
    ptr(ruler, 'pointerdown', 153, 2);
    expect(studio.time).toBe(frameTime(255, 60)); // 153 px / 600 px/s = 255 ms → frame 15
    ptr(ruler, 'pointermove', 300, 2);
    expect(studio.time).toBe(500);
    expect($('#title').style.opacity).toBe('1');
    ptr(ruler, 'pointerup', 300, 2);
    expect($('[data-playhead]').getAttribute('aria-valuenow')).toBe('500');
    expect($('[data-playhead]').style.left).toBe('300px');
    expect($('[data-time]').textContent).toMatch(/0\.500/);
    studio.destroy();
  });
  it('deterministic seek: the same time gives the same DOM whatever came before; frame step and keyboard', () => {
    const { studio } = make({ stage: $('#stage'), canvas: false });
    studio.setTime(250);
    const snap = () => ['title', 'img', 'ok'].map((id) => $('#' + id).getAttribute('style'));
    const s250 = snap();
    studio.setTime(600);
    studio.setTime(0);
    studio.setTime(250);
    expect(snap()).toEqual(s250);
    expect(studio.setTime(1001)).toBe(600); // clamped to the duration
    studio.setTime(0);
    click($('[data-act="next"]'));
    expect(studio.time).toBe(frameTime(F, 60));
    studio.step(9);
    expect(studio.time).toBe(166.6667);
    click($('[data-act="prev"]'));
    expect(studio.time).toBe(150);
    const ph = $('[data-playhead]');
    key(ph, 'ArrowRight');
    expect(studio.time).toBe(166.6667);
    key(ph, 'Home');
    expect(studio.time).toBe(0);
    key(ph, 'End');
    expect(studio.time).toBe(600);
    key($('[role="grid"]'), ',');
    expect(studio.time).toBe(583.3333);
    studio.destroy();
  });
  it('play / pause: the button state follows, pausing lands on a frame', () => {
    const { studio } = make({ stage: $('#stage'), canvas: false });
    const play = $('[data-act="play"]');
    click(play);
    expect(studio.playing).toBe(true);
    expect(play.getAttribute('aria-pressed')).toBe('true');
    click(play);
    expect(studio.playing).toBe(false);
    expect(play.getAttribute('aria-pressed')).toBe('false');
    expect(studio.time).toBe(frameTime(studio.time, 60));
    studio.destroy();
  });
  it('zoom (toolbar, Ctrl+wheel, API) rescales the keys', () => {
    const { studio } = make();
    click($('[data-act="zoom-in"]'));
    expect(studio.zoom).toBeGreaterThan(ZOOM);
    studio.setZoom(300);
    expect($('[data-key="k2"]').style.left).toBe('150px');
    const w = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true, bubbles: true, cancelable: true });
    $('[data-keys="title"]').dispatchEvent(w);
    expect(studio.zoom).toBeGreaterThan(300);
    expect(w.defaultPrevented).toBe(true);
    studio.destroy();
  });
});

describe('14.4 controller: keyframes — drag, snapping, marquee, multi-select, copy / paste', () => {
  it('drags a key: snaps to frames, then to other keys; Alt moves freely; one drag = one undo step', () => {
    const { studio, history } = make();
    history.reset(addKeyframe(history.doc, 'img', { id: 'k9', time: 290, props: { opacity: 1 } })); // 290 ms is off the frame grid
    const [x, y] = at(0, 0);
    ptr($('[data-key="k1"]'), 'pointerdown', x, y);
    expect(studio.selection).toEqual(['k1']);
    ptr($('[data-keys="title"]'), 'pointermove', 103, y); // 171.67 ms → frame 10
    expect(kf(history.doc, 'k1').time).toBe(166.6667);
    ptr($('[data-keys="title"]'), 'pointermove', 171, y); // 285 ms, 3 px from k9 (290 ms = 174 px) on another row → snaps to it
    expect(kf(history.doc, 'k1').time).toBe(290);
    ptr($('[data-keys="title"]'), 'pointerup', 171, y);
    expect(history.size).toBe(1);
    ptr($('[data-key="k1"]'), 'pointerdown', 174, y);
    ptr($('[data-keys="title"]'), 'pointermove', 177, y, { altKey: true });
    ptr($('[data-keys="title"]'), 'pointerup', 177, y, { altKey: true });
    expect(kf(history.doc, 'k1').time).toBe(295);
    expect(history.size).toBe(2);
    studio.undo();
    studio.undo();
    expect(kf(history.doc, 'k1').time).toBe(0);
    studio.destroy();
  });
  it('touch drags a key the same way', () => {
    const { studio, history } = make();
    const [x, y] = at(1, 250);
    ptr($('[data-key="k3"]'), 'pointerdown', x, y, { pointerType: 'touch' });
    ptr($('[data-keys="img"]'), 'pointermove', x + 100, y, { pointerType: 'touch' });
    ptr($('[data-keys="img"]'), 'pointerup', x + 100, y, { pointerType: 'touch' });
    expect(kf(history.doc, 'k3').time).toBe(frameTime(250 + 100 / 0.6, 60));
    studio.destroy();
  });
  it('marquee selects keys across rows; Shift / Ctrl click toggles; a multi-selection moves together', () => {
    const { studio, history } = make();
    const cell = () => $('[data-keys="title"]'); // re-query: the rows re-render as the selection changes
    ptr(cell(), 'pointerdown', 120, 2);
    ptr(cell(), 'pointermove', 320, 2 * RH + 5);
    ptr(cell(), 'pointerup', 320, 2 * RH + 5);
    expect(studio.selection.sort()).toEqual(['k2', 'k3']); // 200–533 ms over rows title / img (the group row has no keys)
    expect($('[data-key="k2"]').getAttribute('aria-pressed')).toBe('true');
    const [x4, y4] = at(3, 100);
    ptr($('[data-key="k4"]'), 'pointerdown', x4, y4, { shiftKey: true });
    ptr($('[data-key="k4"]'), 'pointerup', x4, y4, { shiftKey: true });
    expect(studio.selection.sort()).toEqual(['k2', 'k3', 'k4']);
    ptr($('[data-key="k3"]'), 'pointerdown', 150, RH + 12, { ctrlKey: true });
    ptr($('[data-key="k3"]'), 'pointerup', 150, RH + 12, { ctrlKey: true });
    expect(studio.selection.sort()).toEqual(['k2', 'k4']);
    expect(history.size).toBe(0); // selecting is not an edit
    const [x2, y2] = at(0, 500);
    ptr($('[data-key="k2"]'), 'pointerdown', x2, y2);
    ptr($('[data-keys="title"]'), 'pointermove', x2 + 20, y2, { altKey: true }); // +33.33 ms, no snapping
    ptr($('[data-keys="title"]'), 'pointerup', x2 + 20, y2, { altKey: true });
    expect(kf(history.doc, 'k2').time).toBe(533.3333);
    expect(kf(history.doc, 'k4').time).toBe(133.3333);
    expect(history.size).toBe(1);
    ptr(cell(), 'pointerdown', 590, 5);
    ptr(cell(), 'pointerup', 590, 5);
    expect(studio.selection).toEqual([]); // click on empty track space clears
    studio.destroy();
  });
  it('copy / paste at the playhead (keyboard), delete, select all', () => {
    const { studio, history } = make();
    studio.selectKeys(['k1', 'k2']);
    const grid = $('[role="grid"]');
    key(grid, 'c', { ctrlKey: true });
    studio.setTime(1000 / 6); // frame 10
    key(grid, 'v', { ctrlKey: true });
    const title = history.doc.layers[0].keyframes!;
    expect(title.map((k) => k.time)).toEqual([0, 166.6667, 500, 666.6667]);
    expect(studio.selection.length).toBe(2);
    expect(studio.selection).not.toContain('k1');
    expect(history.size).toBe(1);
    key(grid, 'Delete');
    expect(history.doc.layers[0].keyframes!.length).toBe(2);
    key(grid, 'a', { ctrlKey: true });
    expect(studio.selection.sort()).toEqual(['k1', 'k2', 'k3', 'k4', 'k5']);
    expect(studio.copy()!.items.length).toBe(5);
    studio.destroy();
  });
});

describe('14.4 controller: keyboard grid navigation', () => {
  it('arrows move the focus between rows and keys (roving tabindex); Enter selects; Alt+arrows nudge a frame; Ctrl+Z undoes', () => {
    const { studio, history } = make();
    const first = $('[role="grid"] [data-layer] [tabindex="0"]');
    expect(first.closest('[data-layer]')!.getAttribute('data-layer')).toBe('title');
    first.focus();
    key(first, 'ArrowRight');
    expect(document.activeElement).toBe($('[data-key="k1"]'));
    key(document.activeElement!, 'ArrowRight');
    expect(document.activeElement).toBe($('[data-key="k2"]'));
    expect($('[data-key="k2"]').tabIndex).toBe(0);
    expect($('[data-key="k1"]').tabIndex).toBe(-1);
    key(document.activeElement!, 'ArrowDown'); // nearest key in time on the next row
    expect(document.activeElement).toBe($('[data-key="k3"]'));
    key(document.activeElement!, 'Enter');
    expect(studio.selection).toEqual(['k3']);
    key(document.activeElement!, 'ArrowRight', { altKey: true });
    expect(kf(history.doc, 'k3').time).toBe(266.6667);
    key(document.activeElement!, 'ArrowRight', { altKey: true, shiftKey: true });
    expect(kf(history.doc, 'k3').time).toBe(433.3333);
    expect(document.activeElement).toBe($('[data-key="k3"]')); // focus survives the re-render
    key(document.activeElement!, 'z', { ctrlKey: true });
    expect(kf(history.doc, 'k3').time).toBe(266.6667);
    key(document.activeElement!, 'z', { ctrlKey: true, shiftKey: true });
    expect(kf(history.doc, 'k3').time).toBe(433.3333);
    key(document.activeElement!, 'Home');
    expect(document.activeElement!.getAttribute('role')).toBe('rowheader');
    key(document.activeElement!, 'ArrowDown');
    key(document.activeElement!, 'Enter'); // on a group header: collapse
    expect(studio.collapsed).toEqual(['g']);
    studio.destroy();
  });
  it('an event another handler already took (defaultPrevented) is ignored: no double undo', () => {
    const { studio, history } = make();
    studio.moveKeys(F, ['k1']);
    studio.moveKeys(F, ['k1']);
    const grid = $('[role="grid"]');
    const e = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true });
    e.preventDefault();
    grid.dispatchEvent(e);
    expect(history.size).toBe(2);
    studio.destroy();
  });
});

describe('14.4 controller: curve editor and inspector', () => {
  it('presets, bezier handle drag (one undo step) and spring parameters edit the selected keys', () => {
    const { studio, history } = make();
    studio.selectKeys(['k1', 'k4']);
    const preset = $('[data-field="preset"]') as HTMLSelectElement;
    expect(Array.from(preset.options).map((o) => o.value)).toEqual(expect.arrayContaining(['linear', 'ease-in-out']));
    type(preset, 'ease-in-out');
    expect(kf(history.doc, 'k1').easing).toBe('cubic-bezier(0.42, 0, 0.58, 1)');
    expect(kf(history.doc, 'k4').easing).toBe('cubic-bezier(0.42, 0, 0.58, 1)');
    expect(history.size).toBe(1);
    const panel = $('[data-curve]'); // stable; the curve re-renders while dragging
    const h1 = $('[data-handle="1"]');
    // the curve box is 120 × 120 px with 60 px above / below for overshoot: (x, y) → (x × 120, 60 + (1 − y) × 120)
    ptr(h1, 'pointerdown', 0.42 * 120, 60 + 120);
    ptr(panel, 'pointermove', 0.3 * 120, 60 + (1 - 0.5) * 120);
    ptr(panel, 'pointermove', 0.25 * 120, 60 + (1 - 1.2) * 120);
    ptr(panel, 'pointerup', 0.25 * 120, 60 + (1 - 1.2) * 120);
    expect(kf(history.doc, 'k1').easing).toBe('cubic-bezier(0.25, 1.2, 0.58, 1)');
    expect(history.size).toBe(2);
    expect($('[data-handle="1"]').getAttribute('aria-valuetext')).toMatch(/0\.25.*1\.2/);
    type($('[data-field="stiffness"]'), '180');
    type($('[data-field="damping"]'), '12');
    type($('[data-field="mass"]'), '1');
    click($('[data-act="spring"]'));
    const sp = springBezier({ stiffness: 180, damping: 12, mass: 1 });
    expect(kf(history.doc, 'k1').easing).toBe(sp.easing);
    expect(history.size).toBe(3);
    expect(JSON.parse(studio.save()).studio.springs).toEqual({ k1: { stiffness: 180, damping: 12, mass: 1 }, k4: { stiffness: 180, damping: 12, mass: 1 } });
    studio.undo();
    expect(JSON.parse(studio.save()).studio.springs ?? {}).toEqual({}); // a spring whose easing changed is not kept
    studio.destroy();
  });
  it('inspector: values at the current time; editing adds a key or sets the key at that time; key toggles remove', () => {
    const { studio, history } = make();
    studio.focusLayer('title');
    studio.setTime(250);
    const op = $('[data-inspector] [data-prop="opacity"]') as HTMLInputElement;
    expect(op.value).toBe('0.5');
    expect($('[data-inspector] [data-key-prop="opacity"]').getAttribute('aria-pressed')).toBe('false');
    type(op, '0.8');
    const ks = history.doc.layers[0].keyframes!;
    expect(ks.map((k) => [k.time, k.props.opacity])).toEqual([[0, 0], [250, 0.8], [500, 1]]);
    expect($('[data-inspector] [data-key-prop="opacity"]').getAttribute('aria-pressed')).toBe('true');
    type($('[data-inspector] [data-prop="opacity"]'), '0.9');
    expect(history.doc.layers[0].keyframes!.length).toBe(3); // same key changed
    type($('[data-field="prop-name"]'), 'translate');
    type($('[data-field="prop-value"]'), '10px 0px');
    click($('[data-act="add-prop"]'));
    expect(history.doc.layers[0].keyframes![1].props).toEqual({ opacity: 0.9, translate: '10px 0px' });
    click($('[data-inspector] [data-key-prop="opacity"]'));
    expect(history.doc.layers[0].keyframes![1].props).toEqual({ translate: '10px 0px' });
    click($('[data-inspector] [data-key-prop="translate"]'));
    expect(history.doc.layers[0].keyframes!.length).toBe(2); // an empty key is removed
    expect(history.size).toBe(5);
    expect(studio.valuesAt('title')).toEqual({ opacity: 0.5 });
    studio.destroy();
  });
});

describe('14.4 acceptance: build through the UI, save, reopen, same frames', () => {
  it('a multi-track animation built only with DOM input and the Studio API reopens with equivalent sampled frames', () => {
    const { studio, history } = make({ stage: $('#stage'), length: 1000 }, createTimelineDoc({ name: 'promo' }));
    const field = (f: string, v: string) => type($(`[data-field="${f}"]`), v);
    const inspect = (p: string, v: string) => type($(`[data-inspector] [data-prop="${p}"]`), v);
    // a group with two tracks, one top-level track
    field('track-name', 'Hero');
    field('track-target', '#title');
    click($('[data-act="add-track"]'));
    field('track-name', 'Pair');
    click($('[data-act="add-group"]'));
    const gid = history.doc.layers[1].id;
    studio.focusLayer(gid);
    field('track-name', 'Image');
    field('track-target', '#img');
    click($('[data-act="add-track"]'));
    studio.focusLayer(gid);
    field('track-name', 'OK');
    field('track-target', '#ok');
    click($('[data-act="add-track"]'));
    const [hero, , image, ok] = history.doc.layers.map((l) => l.id);
    // keys from the inspector at playhead times (ruler scrubs)
    const scrub = (x: number) => { const r = $('[data-ruler]'); ptr(r, 'pointerdown', x, 2); ptr(r, 'pointerup', x, 2); };
    studio.focusLayer(hero);
    field('prop-name', 'opacity'); field('prop-value', '0'); click($('[data-act="add-prop"]'));
    field('prop-name', 'translate'); field('prop-value', '0px 20px'); click($('[data-act="add-prop"]'));
    scrub(300);
    inspect('opacity', '1');
    inspect('translate', '0px 0px');
    studio.focusLayer(image);
    scrub(60);
    field('prop-name', 'opacity'); field('prop-value', '0'); click($('[data-act="add-prop"]'));
    scrub(420);
    inspect('opacity', '1');
    studio.focusLayer(ok);
    scrub(120);
    field('prop-name', 'scale'); field('prop-value', '0.5'); click($('[data-act="add-prop"]'));
    scrub(480);
    inspect('scale', '1');
    // a curve on the hero's first key, a spring on the image's
    studio.selectKeys([history.doc.layers[0].keyframes![0].id]);
    type($('[data-field="preset"]'), 'ease-out');
    studio.selectKeys([history.doc.layers[2].keyframes![0].id]);
    type($('[data-field="stiffness"]'), '200'); type($('[data-field="damping"]'), '15'); click($('[data-act="spring"]'));
    // drag the OK end key one frame-snapped step later
    const okEnd = history.doc.layers[3].keyframes![1];
    const [x, y] = at(3, okEnd.time);
    ptr($(`[data-key="${okEnd.id}"]`), 'pointerdown', x, y);
    ptr($(`[data-keys="${ok}"]`), 'pointermove', x + 50, y);
    ptr($(`[data-keys="${ok}"]`), 'pointerup', x + 50, y);
    click($('[data-layer="' + gid + '"] [data-act="collapse"]'));
    const built = history.doc;
    expect(built.layers.length).toBe(4);
    expect(built.layers.flatMap((l) => l.keyframes || []).length).toBe(6);
    const frames = sampleFrames(built, { fps: 60 });
    const saved = studio.save();
    studio.setTime(350);
    const decl = (id: string) => $('#' + id).style.cssText.split(';').map((x) => x.trim()).filter(Boolean).sort(); // same declarations, any order
    const dom350 = ['title', 'img', 'ok'].map(decl);
    studio.destroy();

    // reopen in a fresh Studio
    document.body.innerHTML = `<div id="app"></div><div id="stage"><div id="title"></div><div id="img"></div><div id="ok"></div></div>`;
    const h2 = createTimelineHistory(createTimelineDoc(), { now: () => 0 });
    const s2 = createStudio($('#app'), { history: h2, stage: $('#stage'), zoom: ZOOM, rowHeight: RH });
    expect(s2.load(saved)).toEqual([]);
    expect(h2.doc).toEqual(built);
    expect(h2.size).toBe(0); // loading resets the history
    expect(s2.collapsed).toEqual([gid]);
    expect(sampleFrames(h2.doc, { fps: 60 })).toEqual(frames);
    s2.setTime(350);
    expect(['title', 'img', 'ok'].map(decl)).toEqual(dom350);
    // the Scene v2 export opens to the same frames too (export / import regression)
    expect(s2.exportScene().version).toBe(3); // 16.0: exportScene() writes Scene v3; v2 on request
    const scene = s2.exportScene({ version: 2 });
    expect(scene.format).toBe('motionary-scene');
    expect(scene.version).toBe(2);
    expect(sampleFrames(loadMotionDoc(JSON.stringify(scene)).doc, { fps: 60 })).toEqual(frames);
    expect(JSON.parse(saved).studio.springs[built.layers[2].keyframes![0].id]).toEqual({ stiffness: 200, damping: 15, mass: 1 });
    s2.destroy();
  });
});

describe('14.4 composition with the 14.3 canvas', () => {
  it('the canvas edits at the playhead time; a canvas Ctrl+Z is one undo, not two', () => {
    const measure = () => ({ x: 0, y: 0, width: 20, height: 20 });
    const { studio, history } = make({ stage: $('#stage'), canvas: { measure, snap: false } });
    expect(studio.canvas).toBeTruthy();
    expect(studio.canvas!.layers()).toEqual(['title', 'img', 'ok']);
    studio.setTime(250);
    studio.canvas!.select(['title']);
    studio.canvas!.move(10, 0);
    const k = history.doc.layers[0].keyframes!.find((x) => x.time === 250)!;
    expect(k.props.translate).toBe('10px 0px');
    expect($('[data-layer="title"] [data-key="' + k.id + '"]')).toBeTruthy(); // the timeline shows the new key
    studio.canvas!.move(10, 0);
    expect(history.size).toBe(2);
    key($('#title'), 'z', { ctrlKey: true });
    expect(history.size).toBe(1);
    studio.destroy();
    expect($('#stage').getAttribute('role')).toBeNull(); // the canvas was destroyed too
  });
});

describe('14.4 controller: no uncontrolled global listeners', () => {
  it('nothing on window / document; gesture listeners only during a gesture; destroy returns to baseline', () => {
    const base = live();
    const { studio } = make({ stage: $('#stage'), canvas: false });
    const el = $('[data-studio]');
    const idle = on(el);
    expect(on(window)).toEqual([]);
    expect(on(document)).toEqual([]);
    ptr($('[data-key="k1"]'), 'pointerdown', 0, 12);
    expect(on(el).length).toBeGreaterThan(idle.length);
    ptr(el, 'pointerup', 0, 12);
    expect(on(el)).toEqual(idle);
    ptr($('[data-ruler]'), 'pointerdown', 10, 2);
    ptr(el, 'pointercancel', 10, 2);
    expect(on(el)).toEqual(idle);
    ptr($('[data-key="k1"]'), 'pointerdown', 0, 12);
    expect(on(window)).toEqual([]);
    expect(on(document)).toEqual([]);
    studio.destroy();
    expect(live()).toBe(base);
    expect($('#title').getAttribute('style')).toBeFalsy(); // the preview cleaned up
  });
  it('history subscriptions are released on destroy', () => {
    const { studio, history } = make();
    studio.destroy();
    history.apply((d) => ({ ...d, name: 'x' }));
    expect($('#app').innerHTML).toBe('');
  });
});
