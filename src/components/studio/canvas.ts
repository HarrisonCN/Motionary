/**
 * motionary/studio/canvas (14.3) — the foundations of the Studio canvas: visual selection, marquee and multi-select,
 * layer order / lock / hide, guides and snapping (guides, the other layers' edges and centres, a grid), drag / resize /
 * rotate with pointer and touch (pinch-zoom of the canvas), keyboard navigation and nudge, and an accessible selection
 * model (listbox / option, roving focus, live announcements).
 *
 * No new document format: the canvas edits the 13.6 timeline editor model (Scene Format v2's `motionary-timeline`
 * subset) through its own operations and the existing `createTimelineHistory`:
 *
 * - geometry = keyframe props at the edit time — `translate: "Xpx Ypx"`, `rotate: "Ddeg"`, `width` / `height: "Npx"`
 *   (the CSS individual transform properties, so `<usa-player>` and `playScene` animate them as they are);
 * - lock = `locked`, hide = `muted` (left out of preview and export), order = the layer order (first = in front).
 *
 * Every edit is also returned as a list of `CanvasOp`s that `applyCanvasOps` replays on a Scene v2 document — the
 * lossless path that keeps what timeline v1 cannot hold (preset / effect layers, tokens, composite, loop).
 *
 * Editor-only: nothing in `motionary`, `motionary/core`, `motionary/motion` or `components/lite` imports it. It never
 * touches `window` / `document` at import (SSR-safe) and never listens on them: the controller listens on its root
 * only, adds the move / up / cancel listeners when a gesture starts and removes them when it ends or on `destroy()`.
 */
import { addKeyframe, setKeyframeProps, updateLayers, moveLayer, uniqueId } from '../timeline/editor/ops';
import { isLayerLocked, TimelineDocError } from '../timeline/editor/format';
import { bindHistoryKeys } from '../timeline/editor/history';
import type { TimelineDoc, TimelineLayer, TimelineKeyframe } from '../timeline/editor/format';
import type { TimelineHistory } from '../timeline/editor/history';
import type { SceneV2Doc } from '../scene/v2';

export const STUDIO_CANVAS_VERSION = 1;

export interface CanvasRect { x: number; y: number; width: number; height: number }
/** A layer's box on the canvas: the unrotated rect, rotated by `rotation` degrees around its centre. */
export interface CanvasBox extends CanvasRect { rotation: number }
/** What the document says about a layer's geometry at a time: the translate offset, size overrides, rotation. */
export interface CanvasGeometry { x: number; y: number; width?: number; height?: number; rotation: number }
export type CanvasOp =
  | { op: 'add-keyframe'; layer: string; keyframe: { id: string; time: number; props: Record<string, string> } }
  | { op: 'set-props'; layer: string; keyframe: string; props: Record<string, string> }
  | { op: 'update-layers'; ids: string[]; patch: { locked?: boolean; muted?: boolean } }
  | { op: 'move-layer'; layer: string; index: number };
/** The new document and the ops that turn the old one into it (empty when nothing changed: `doc` is the same object). */
export interface CanvasEdit { doc: TimelineDoc; ops: CanvasOp[] }
export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export interface SnapLines { x: number[]; y: number[] }

const z0 = (n: number) => n + 0; // -0 → 0
const r2 = (n: number) => z0(Math.round(n * 100) / 100);
const r4 = (n: number) => z0(Math.round(n * 1e4) / 1e4);
const N = '(-?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?)';
const PX = /*#__PURE__*/ new RegExp(`^${N}px$`);
const DEG = /*#__PURE__*/ new RegExp(`^${N}deg$`);
const TR = /*#__PURE__*/ new RegExp(`^${N}px(?:\\s+${N}px)?$`);
const GEO = ['translate', 'width', 'height', 'rotate'] as const;
const FORBIDDEN = ['__proto__', 'constructor', 'prototype'];
const none = (doc: TimelineDoc): CanvasEdit => ({ doc, ops: [] });
const bad = (path: string, message: string) => new TimelineDocError([{ path, message }]);
const own = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const track = (doc: TimelineDoc, id: string): TimelineLayer | undefined => doc.layers.find((l) => l.id === id && l.type === 'track');

/** The value of `prop` at `time`: the last keyframe at or before it that sets it, else the first one that does. */
function held(ks: TimelineKeyframe[], prop: string, time: number): string | number | undefined {
  let v: TimelineKeyframe | undefined;
  for (const k of ks) if (own(k.props, prop) && (!v || k.time <= time)) v = k;
  return v?.props[prop];
}

/**
 * A track's geometry at `time` (held from the last keyframe at or before it). `null` for groups, unknown ids, and
 * values the canvas cannot represent (`10%`, `calc()`, numbers …): such layers stay read-only instead of being rewritten.
 */
export function readCanvasGeometry(doc: TimelineDoc, id: string, time: number): CanvasGeometry | null {
  const l = track(doc, id);
  if (!l) return null;
  const g: CanvasGeometry = { x: 0, y: 0, rotation: 0 };
  for (const p of GEO) {
    const v = held(l.keyframes || [], p, time);
    if (v === undefined) continue;
    const m = typeof v === 'string' ? (p === 'translate' ? TR : p === 'rotate' ? DEG : PX).exec(v.trim()) : null;
    if (!m) return null;
    if (p === 'translate') { g.x = z0(+m[1]); g.y = z0(+(m[2] ?? 0)); }
    else if (p === 'rotate') g.rotation = z0(+m[1]);
    else g[p] = z0(+m[1]);
  }
  return g;
}

/** The canvas box: the layer's untransformed layout box (`base`, canvas px) moved by the translate, with size overrides. */
export const canvasBox = (base: CanvasRect, g: CanvasGeometry): CanvasBox => ({
  x: base.x + g.x, y: base.y + g.y, width: g.width ?? base.width, height: g.height ?? base.height, rotation: g.rotation,
});

/** The axis-aligned bounds of a (rotated) box. */
export function canvasBounds(b: CanvasBox): CanvasRect {
  const t = (b.rotation * Math.PI) / 180, c = Math.abs(Math.cos(t)), s = Math.abs(Math.sin(t));
  const w = b.width * c + b.height * s, h = b.width * s + b.height * c;
  return { x: b.x + b.width / 2 - w / 2, y: b.y + b.height / 2 - h / 2, width: w, height: h };
}

/** Whether two rects overlap (touching counts). */
export const rectsIntersect = (a: CanvasRect, b: CanvasRect): boolean =>
  a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height;

/** Ids whose (rotated) box the marquee touches (`'intersect'`) or fully holds (`'contain'`), in the order given. */
export function marqueeHits(boxes: Record<string, CanvasBox>, m: CanvasRect, mode: 'intersect' | 'contain' = 'intersect'): string[] {
  const out: string[] = [];
  for (const id of Object.keys(boxes)) {
    const b = canvasBounds(boxes[id]);
    if (mode === 'contain' ? m.x <= b.x && m.y <= b.y && b.x + b.width <= m.x + m.width && b.y + b.height <= m.y + m.height : rectsIntersect(m, b)) out.push(id);
  }
  return out;
}

/** Snap lines: the edges and centres of `rects` plus the guides, sorted, unique. */
export function snapLines(rects: CanvasRect[], guides: { x?: number[]; y?: number[] } = {}): SnapLines {
  const u = (a: number[]) => [...new Set(a.map(r4))].sort((p, q) => p - q);
  return {
    x: u([...rects.flatMap((r) => [r.x, r.x + r.width / 2, r.x + r.width]), ...(guides.x || [])]),
    y: u([...rects.flatMap((r) => [r.y, r.y + r.height / 2, r.y + r.height]), ...(guides.y || [])]),
  };
}

/** The nearest line within `threshold` (a tie goes to the first); none → `{ value }` unchanged. */
export function snapValue(v: number, lines: number[], threshold: number): { value: number; line?: number } {
  let best: number | undefined;
  for (const l of lines) if (Math.abs(l - v) <= threshold && (best === undefined || Math.abs(l - v) < Math.abs(best - v))) best = l;
  return best === undefined ? { value: v } : { value: best, line: best };
}

/** `v` on a grid of `grid` px (0 = off). */
export const snapToGrid = (v: number, grid: number): number => (grid > 0 ? z0(Math.round(v / grid) * grid) : v);

/**
 * How far to move `rect` so its left / centre / right (top / middle / bottom) lands on the nearest line within
 * `threshold`; on an axis with no line the left (top) edge goes to the grid when one is set. `x` / `y` name the line hit.
 */
export function snapRect(rect: CanvasRect, lines: SnapLines, o: { threshold: number; grid?: number }): { dx: number; dy: number; x?: number; y?: number } {
  const axis = (start: number, size: number, ls: number[]) => {
    let best: { d: number; line: number } | undefined;
    for (const v of [start, start + size / 2, start + size]) {
      const s = snapValue(v, ls, o.threshold);
      if (s.line !== undefined && (!best || Math.abs(s.line - v) < Math.abs(best.d))) best = { d: s.line - v, line: s.line };
    }
    return best || { d: o.grid ? snapToGrid(start, o.grid) - start : 0 };
  };
  const ax = axis(rect.x, rect.width, lines.x), ay = axis(rect.y, rect.height, lines.y);
  const out: { dx: number; dy: number; x?: number; y?: number } = { dx: r4(ax.d), dy: r4(ay.d) };
  if ('line' in ax) out.x = ax.line;
  if ('line' in ay) out.y = ay.line;
  return out;
}

/**
 * Resize `box` by dragging `handle` by (dx, dy) canvas px: the dragged edges follow the pointer in the box's own
 * (rotated) frame and the opposite edges stay where they are. `keepAspect` scales both sides; `min` (default 1) px.
 */
export function resizeBox(box: CanvasBox, handle: ResizeHandle, dx: number, dy: number, o: { keepAspect?: boolean; min?: number } = {}): CanvasBox {
  const hx = handle.includes('e') ? 1 : handle.includes('w') ? -1 : 0;
  const hy = handle.includes('s') ? 1 : handle.includes('n') ? -1 : 0;
  const t = (box.rotation * Math.PI) / 180, c = box.rotation ? Math.cos(t) : 1, s = box.rotation ? Math.sin(t) : 0;
  const min = o.min ?? 1;
  let w = box.width + hx * (dx * c + dy * s);
  let h = box.height + hy * (-dx * s + dy * c);
  if (o.keepAspect && box.width && box.height) {
    const k = hx && hy ? Math.max(w / box.width, h / box.height) : hx ? w / box.width : h / box.height;
    w = box.width * k;
    h = box.height * k;
  }
  w = Math.max(min, w);
  h = Math.max(min, h);
  const lx = (hx * (w - box.width)) / 2, ly = (hy * (h - box.height)) / 2;
  const cx = box.x + box.width / 2 + lx * c - ly * s, cy = box.y + box.height / 2 + lx * s + ly * c;
  return { x: z0(cx - w / 2), y: z0(cy - h / 2), width: w, height: h, rotation: box.rotation };
}

/** The rotation after dragging from `start` to `p` around the box centre, from `r0`; `step` snaps (Shift: 15). (-180, 180]. */
export function rotationFromPointer(box: CanvasRect, start: { x: number; y: number }, p: { x: number; y: number }, r0: number, step = 0): number {
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  let a = r0 + ((Math.atan2(p.y - cy, p.x - cx) - Math.atan2(start.y - cy, start.x - cx)) * 180) / Math.PI;
  if (step > 0) a = Math.round(a / step) * step;
  a = (((a % 360) + 540) % 360) - 180;
  return z0(a === -180 ? 180 : a);
}

// --- ops ------------------------------------------------------------------------------------------------------

/** Write geometry props on a track at `time`: into the keyframe there, else a new keyframe. */
function writeProps(doc: TimelineDoc, layer: string, time: number, props: Record<string, string>): CanvasEdit {
  if (!Object.keys(props).length) return none(doc);
  const t = r4(Math.max(0, time));
  const ks = track(doc, layer)!.keyframes || [];
  let k: TimelineKeyframe | undefined;
  for (const x of ks) if (x.time === t) k = x;
  if (k) return { doc: setKeyframeProps(doc, k.id, props), ops: [{ op: 'set-props', layer, keyframe: k.id, props }] };
  const id = uniqueId(doc, 'k');
  return { doc: addKeyframe(doc, layer, { id, time: t, props }), ops: [{ op: 'add-keyframe', layer, keyframe: { id, time: t, props: { ...props } } }] };
}

/** Set a layer's box (any of x / y / width / height / rotation) at `time`; only what changed is written. Locked → no-op. */
export function canvasSetBox(doc: TimelineDoc, id: string, time: number, base: CanvasRect, box: Partial<CanvasBox>): CanvasEdit {
  const g = isLayerLocked(doc, id) ? null : readCanvasGeometry(doc, id, time);
  if (!g) return none(doc);
  const p: Record<string, string> = {};
  const x = box.x === undefined ? g.x : r2(box.x - base.x), y = box.y === undefined ? g.y : r2(box.y - base.y);
  if (x !== g.x || y !== g.y) p.translate = `${x}px ${y}px`;
  for (const k of ['width', 'height'] as const) if (box[k] !== undefined && r2(box[k]!) !== (g[k] ?? r2(base[k]))) p[k] = `${r2(box[k]!)}px`;
  if (box.rotation !== undefined && r2(box.rotation) !== g.rotation) p.rotate = `${r2(box.rotation)}deg`;
  return writeProps(doc, id, time, p);
}

/** Move layers by (dx, dy) canvas px at `time`. Locked layers, layers in locked groups and read-only geometry stay. */
export function canvasMove(doc: TimelineDoc, ids: string[], time: number, bases: Record<string, CanvasRect>, dx: number, dy: number): CanvasEdit {
  let d = doc;
  const ops: CanvasOp[] = [];
  for (const id of [...new Set(ids)]) {
    const g = readCanvasGeometry(d, id, time), b = bases[id];
    if (!g || !b) continue;
    const e = canvasSetBox(d, id, time, b, { x: b.x + g.x + dx, y: b.y + g.y + dy });
    d = e.doc;
    ops.push(...e.ops);
  }
  return { doc: d, ops };
}

function flag(doc: TimelineDoc, ids: string[], f: 'locked' | 'muted', v: boolean): CanvasEdit {
  const ch = [...new Set(ids)].filter((id) => doc.layers.some((l) => l.id === id && !!l[f] !== v));
  if (!ch.length) return none(doc);
  const next = updateLayers(doc, ch, { [f]: v });
  return next === doc ? none(doc) : { doc: next, ops: [{ op: 'update-layers', ids: ch, patch: { [f]: v } }] };
}
/** Lock / unlock layers (`locked`; a locked group locks its children). */
export const canvasSetLocked = (doc: TimelineDoc, ids: string[], locked: boolean): CanvasEdit => flag(doc, ids, 'locked', locked);
/** Hide / show layers (`muted`: hidden on the canvas and left out of preview and export). */
export const canvasSetHidden = (doc: TimelineDoc, ids: string[], hidden: boolean): CanvasEdit => flag(doc, ids, 'muted', hidden);

/** Change a layer's place among its siblings: the first layer is in front. Locked layers stay. */
export function canvasReorder(doc: TimelineDoc, id: string, to: 'forward' | 'backward' | 'front' | 'back'): CanvasEdit {
  const l = doc.layers.find((x) => x.id === id);
  if (!l || isLayerLocked(doc, id)) return none(doc);
  const sib = doc.layers.filter((x) => x.parent === l.parent);
  const i = sib.indexOf(l), n = sib.length;
  const at = to === 'forward' ? i - 1 : to === 'backward' ? i + 1 : to === 'front' ? 0 : n - 1;
  if (at < 0 || at >= n || at === i) return none(doc);
  const next = moveLayer(doc, id, at);
  return next === doc ? none(doc) : { doc: next, ops: [{ op: 'move-layer', layer: id, index: at }] };
}

function checkProps(props: unknown, path: string): void {
  if (!props || typeof props !== 'object') throw bad(path, 'expected props');
  for (const k of Object.keys(props)) {
    const v = (props as any)[k];
    if (FORBIDDEN.includes(k)) throw bad(`${path}.${k}`, 'forbidden key');
    if (typeof v !== 'string' || v.length > 2048) throw bad(`${path}.${k}`, 'expected a string');
  }
}

/**
 * Replay canvas ops on a Scene v2 document (pure; throws `TimelineDocError` on an op that does not apply). Everything the
 * ops do not name is kept as it is — preset / effect / component layers, tokens, loop, keyframe `composite`.
 */
export function applyCanvasOps<T extends SceneV2Doc>(scene: T, ops: CanvasOp[]): T {
  let d = scene as unknown as TimelineDoc;
  ops.forEach((o: any, i) => {
    const at = `ops[${i}]`;
    const need = (id: string, t?: boolean) => {
      if (!d.layers.some((l) => l.id === id && (!t || l.type === 'track'))) throw bad(at, `no ${t ? 'track' : 'layer'} "${id}"`);
      if (t && isLayerLocked(d, id)) throw bad(at, `"${id}" is locked`);
    };
    if (o?.op === 'add-keyframe') {
      need(o.layer, true);
      checkProps(o.keyframe?.props, `${at}.keyframe.props`);
      d = addKeyframe(d, o.layer, { id: o.keyframe.id, time: o.keyframe.time, props: o.keyframe.props });
    } else if (o?.op === 'set-props') {
      need(o.layer, true);
      checkProps(o.props, `${at}.props`);
      if (!track(d, o.layer)!.keyframes?.some((k) => k.id === o.keyframe)) throw bad(at, `no keyframe "${o.keyframe}"`);
      d = setKeyframeProps(d, o.keyframe, o.props);
    } else if (o?.op === 'update-layers') {
      if (!Array.isArray(o.ids)) throw bad(at, 'expected ids');
      o.ids.forEach((id: string) => need(id));
      const p = o.patch || {};
      if (Object.keys(p).some((k) => (k !== 'locked' && k !== 'muted') || typeof p[k] !== 'boolean')) throw bad(`${at}.patch`, 'only locked / muted');
      d = updateLayers(d, o.ids, p);
    } else if (o?.op === 'move-layer') {
      need(o.layer);
      if (isLayerLocked(d, o.layer)) throw bad(at, `"${o.layer}" is locked`);
      d = moveLayer(d, o.layer, o.index);
    } else throw bad(`${at}.op`, `unknown op "${o?.op}"`);
  });
  return d as unknown as T;
}

// --- controller ------------------------------------------------------------------------------------------------

export interface StudioCanvasOptions {
  /** The editor history (`createTimelineHistory`): every edit goes through it; undo / redo re-render the canvas. */
  history: TimelineHistory;
  /** Edit time in ms (default 0): geometry is read and written at this time. */
  time?: number;
  /** The element holding the layer elements; zoom / pan transform it. Default: the root. */
  stage?: HTMLElement;
  /** Grid in canvas px (0 = off, default). */
  grid?: number;
  /** Snapping (default on): `threshold` in screen px (default 6), and which targets: guides, siblings, grid. Alt disables it while dragging. */
  snap?: boolean | { threshold?: number; guides?: boolean; siblings?: boolean; grid?: boolean };
  /** Guide lines in canvas px. */
  guides?: { x?: number[]; y?: number[] };
  zoom?: number;
  /** Default 0.1. */
  minZoom?: number;
  /** Default 8. */
  maxZoom?: number;
  /** A layer element's untransformed layout box in canvas px (default: offsetLeft / offsetTop / offsetWidth / offsetHeight up to the stage). */
  measure?: (el: HTMLElement) => CanvasRect;
  /** Accessible name of the canvas (default "Canvas"). */
  label?: string;
  onSelect?: (ids: string[]) => void;
  /** Each committed edit with its ops (replay them on a Scene v2 document with `applyCanvasOps`). */
  onEdit?: (e: { label: string; ops: CanvasOp[] }) => void;
  onZoom?: (zoom: number) => void;
}
export interface StudioCanvas {
  readonly root: HTMLElement;
  readonly selection: string[];
  readonly focused: string | undefined;
  readonly zoom: number;
  /** Canvas layer ids, front first. */
  layers(): string[];
  getBox(id: string): CanvasBox | undefined;
  select(ids: string[], o?: { add?: boolean; toggle?: boolean }): void;
  selectAll(): void;
  clearSelection(): void;
  focus(id: string): void;
  /** Move layers (default: the selection) by (dx, dy) canvas px. Returns the ops (empty: nothing moved). */
  move(dx: number, dy: number, ids?: string[]): CanvasOp[];
  setBox(id: string, box: Partial<CanvasBox>): CanvasOp[];
  reorder(id: string, to: 'forward' | 'backward' | 'front' | 'back'): CanvasOp[];
  lock(ids?: string[], locked?: boolean): CanvasOp[];
  hide(ids?: string[], hidden?: boolean): CanvasOp[];
  setTime(ms: number): void;
  /** Zoom, keeping the client point `origin` fixed (default: the stage origin). */
  setZoom(zoom: number, origin?: { x: number; y: number }): void;
  setGrid(px: number): void;
  setGuides(g: { x?: number[]; y?: number[] }): void;
  /** Measure the layer elements again (after a layout change). */
  refresh(): void;
  /** End any gesture, remove every listener and restore every attribute and inline style the canvas touched. */
  destroy(): void;
}

type Item = { id: string; el: HTMLElement; base: CanvasRect };
type Pt = { x: number; y: number };
type Gesture = {
  mode: 'pending' | 'move' | 'marquee-pending' | 'marquee' | 'resize' | 'rotate' | 'pinch' | 'noop';
  c0: Pt; p0: Pt; id?: string; toggle?: boolean; handle?: string; began?: boolean; label?: string; ops?: CanvasOp[];
  start?: TimelineDoc; ids?: string[]; bounds?: CanvasRect; box?: CanvasBox; lines?: SnapLines; keep?: string[];
  rect?: CanvasRect; gx?: number; gy?: number; d0?: number; z0?: number; m0?: Pt; pan0?: Pt; P?: Pt;
};
const HANDLES: [string, number, number, string][] = [['nw', 0, 0, 'nwse'], ['n', 50, 0, 'ns'], ['ne', 100, 0, 'nesw'], ['e', 100, 50, 'ew'], ['se', 100, 100, 'nwse'], ['s', 50, 100, 'ns'], ['sw', 0, 100, 'nesw'], ['w', 0, 50, 'ew']];
const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

/** Turn `root` into an editing canvas for the history's document. */
export function createStudioCanvas(root: HTMLElement, o: StudioCanvasOptions): StudioCanvas {
  const { history } = o;
  const stage = o.stage || root;
  const doc0 = root.ownerDocument;
  const sn = o.snap === false ? null : { threshold: 6, guides: true, siblings: true, grid: true, ...(typeof o.snap === 'object' ? o.snap : {}) };
  let time = o.time ?? 0, grid = o.grid ?? 0, guides = o.guides || {};
  let zoom = 1, pan: Pt = { x: 0, y: 0 };
  const minZ = o.minZoom ?? 0.1, maxZ = o.maxZoom ?? 8;
  let items: Item[] = [];
  let selection: string[] = [];
  let focusId: string | undefined;
  let g: Gesture | null = null;
  const pointers = new Map<number, Pt>();
  let attached = false, dead = false;
  const coarse = !!doc0.defaultView?.matchMedia?.('(pointer: coarse)').matches;

  // --- DOM bookkeeping: every attribute / inline style we touch is restored on destroy ----------------------------
  const saved = new Map<HTMLElement, { a: Map<string, string | null>; s: Map<string, [string, string]>; st: string | null }>();
  const rec = (el: HTMLElement) => {
    let r = saved.get(el);
    if (!r) saved.set(el, (r = { a: new Map(), s: new Map(), st: el.getAttribute('style') }));
    return r;
  };
  const attr = (el: HTMLElement, n: string, v: string | null) => {
    const r = rec(el);
    if (!r.a.has(n)) r.a.set(n, el.getAttribute(n));
    if (v === null) el.removeAttribute(n);
    else if (el.getAttribute(n) !== v) el.setAttribute(n, v);
  };
  const css = (el: HTMLElement, p: string, v: string | undefined) => {
    const r = rec(el);
    if (!r.s.has(p)) r.s.set(p, [el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]);
    const orig = r.s.get(p)!;
    if (v === undefined) {
      if (orig[0]) el.style.setProperty(p, orig[0], orig[1]);
      else el.style.removeProperty(p);
    } else el.style.setProperty(p, v);
  };
  const restore = (el: HTMLElement) => {
    const r = saved.get(el);
    if (!r) return;
    for (const [p, [v, pr]] of r.s) if (v) el.style.setProperty(p, v, pr); else el.style.removeProperty(p);
    for (const [n, v] of r.a) if (v === null) el.removeAttribute(n); else el.setAttribute(n, v);
    if (r.st === null) { if (el.getAttribute('style') === '') el.removeAttribute('style'); }
    else if (el.getAttribute('style') !== r.st) {
      // same declarations → put the author's exact text back (browsers re-serialize the attribute after setProperty)
      const t = el.cloneNode(false) as HTMLElement;
      t.setAttribute('style', r.st);
      if (t.style.cssText === el.style.cssText) el.setAttribute('style', r.st);
    }
    saved.delete(el);
  };
  const div = (style: string, parent: HTMLElement) => {
    const d = doc0.createElement('div');
    d.style.cssText = style;
    parent.append(d);
    return d;
  };

  attr(root, 'role', 'listbox');
  attr(root, 'aria-multiselectable', 'true');
  if (!root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby')) attr(root, 'aria-label', o.label || 'Canvas');
  css(root, 'touch-action', 'none');
  css(root, 'user-select', 'none');
  css(root, '-webkit-user-select', 'none');
  if (doc0.defaultView?.getComputedStyle(stage).position === 'static') css(stage, 'position', 'relative');
  const overlay = div('position:absolute;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none;z-index:2147483647', stage);
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('data-canvas-overlay', '');
  const status = div('position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap', root);
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const say = (m: string) => { status.textContent = m; };

  // --- model ------------------------------------------------------------------------------------------------------
  const doc = () => history.doc;
  const layer = (id: string) => doc().layers.find((l) => l.id === id);
  const nameOf = (id: string) => layer(id)?.name || id;
  const hidden = (id: string): boolean => {
    for (let l = layer(id), n = 0; l && n < 64; l = l.parent ? layer(l.parent) : undefined, n++) if (l.muted) return true;
    return false;
  };
  const item = (id: string) => items.find((i) => i.id === id);
  const box = (id: string): CanvasBox | undefined => {
    const it = item(id), ge = it && readCanvasGeometry(doc(), id, time);
    return ge ? canvasBox(it!.base, ge) : undefined;
  };
  const movable = (ids: string[]) => ids.filter((id) => !isLayerLocked(doc(), id) && readCanvasGeometry(doc(), id, time));
  const bases = () => Object.fromEntries(items.map((i) => [i.id, i.base]));
  const visibleBoxes = (skip: string[] = []) => {
    const out: Record<string, CanvasBox> = {};
    for (const i of items) if (!skip.includes(i.id) && !hidden(i.id)) { const b = box(i.id); if (b) out[i.id] = b; }
    return out;
  };
  const measure = (el: HTMLElement): CanvasRect => {
    if (o.measure) return o.measure(el);
    let x = 0, y = 0;
    for (let n: HTMLElement | null = el; n && n !== stage; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; }
    return { x, y, width: el.offsetWidth, height: el.offsetHeight };
  };
  const find = (l: TimelineLayer): HTMLElement | null => {
    if (l.type !== 'track' || !l.target || l.target === ':scope') return null;
    try {
      const el = stage.querySelector(l.target);
      return el && el !== overlay && !overlay.contains(el) ? (el as HTMLElement) : null;
    } catch {
      return null;
    }
  };
  const layerAt = (t: EventTarget | null): string | undefined => {
    const el = (t as Element | null)?.closest?.('[data-canvas-layer]');
    return el ? items.find((i) => i.el === el)?.id : undefined;
  };

  // --- rendering ----------------------------------------------------------------------------------------------------
  function bind(): void {
    const next: Item[] = [];
    for (const l of doc().layers) {
      const el = find(l);
      if (!el || next.some((i) => i.el === el)) continue;
      const old = items.find((i) => i.id === l.id && i.el === el);
      if (old) { next.push(old); continue; }
      next.push({ id: l.id, el, base: measure(el) });
    }
    for (const i of items) if (!next.some((n) => n.el === i.el)) restore(i.el);
    items = next;
  }
  function render(): void {
    if (dead) return;
    bind();
    const n = items.length;
    const keep = selection.filter((id) => item(id));
    if (keep.length !== selection.length) setSel(keep, true);
    if (focusId && !item(focusId)) focusId = undefined;
    items.forEach((it, i) => {
      const l = layer(it.id)!, el = it.el, ks = l.keyframes || [];
      for (const p of GEO) { const v = held(ks, p, time); css(el, p, v === undefined ? undefined : String(v)); }
      css(el, 'visibility', hidden(it.id) ? 'hidden' : undefined);
      css(el, 'z-index', String(n - i));
      attr(el, 'data-canvas-layer', it.id);
      attr(el, 'role', 'option');
      attr(el, 'aria-selected', String(selection.includes(it.id)));
      attr(el, 'tabindex', it.id === (focusId ?? items[0].id) ? '0' : '-1');
      const r = rec(el);
      if (r.a.has('aria-label') ? r.a.get('aria-label') === null : !el.hasAttribute('aria-label')) attr(el, 'aria-label', l.name || null);
      const st = [isLayerLocked(doc(), it.id) && 'locked', hidden(it.id) && 'hidden'].filter(Boolean).join(', ');
      attr(el, 'aria-description', st || null);
    });
    draw();
  }
  function draw(): void {
    overlay.textContent = '';
    const px = (v: number) => `${v}px`, lw = 1 / zoom;
    const hs = (coarse ? 22 : 12) / zoom;
    const sel = selection.filter((id) => !hidden(id));
    for (const id of sel) {
      const b = box(id);
      if (!b) continue;
      const f = div(`position:absolute;left:${px(b.x)};top:${px(b.y)};width:${px(b.width)};height:${px(b.height)};transform:rotate(${b.rotation}deg);outline:${px(lw)} solid #0a84ff;box-sizing:border-box`, overlay);
      f.setAttribute('data-canvas-box', id);
      if (sel.length !== 1 || selection.length !== 1 || isLayerLocked(doc(), id) || (g && g.mode !== 'pending' && g.mode !== 'resize' && g.mode !== 'rotate')) continue;
      const h = (name: string, l: string, t: string, cur: string) =>
        div(`position:absolute;left:${l};top:${t};width:${px(hs)};height:${px(hs)};margin:${px(-hs / 2)} 0 0 ${px(-hs / 2)};box-sizing:border-box;background:#fff;border:${px(lw)} solid #0a84ff;border-radius:${name === 'rotate' ? '50%' : '2px'};pointer-events:auto;touch-action:none;cursor:${cur}`, f).setAttribute('data-canvas-handle', name);
      for (const [name, x, y, c] of HANDLES) h(name, `${x}%`, `${y}%`, `${c}-resize`);
      h('rotate', '50%', px(-24 / zoom), 'grab');
    }
    if (g?.rect) div(`position:absolute;left:${px(g.rect.x)};top:${px(g.rect.y)};width:${px(g.rect.width)};height:${px(g.rect.height)};border:${px(lw)} dashed #0a84ff;background:rgba(10,132,255,.08);box-sizing:border-box`, overlay).setAttribute('data-canvas-marquee', '');
    if (g?.gx !== undefined) div(`position:absolute;left:${px(g.gx)};top:-100000px;width:0;height:200000px;border-left:${px(lw)} solid #ff2d95`, overlay).setAttribute('data-canvas-guide', 'x');
    if (g?.gy !== undefined) div(`position:absolute;top:${px(g.gy)};left:-100000px;height:0;width:200000px;border-top:${px(lw)} solid #ff2d95`, overlay).setAttribute('data-canvas-guide', 'y');
  }
  function setSel(ids: string[], quiet = false): void {
    const next = [...new Set(ids)].filter((id) => item(id));
    if (next.length === selection.length && next.every((id, i) => id === selection[i])) return;
    selection = next;
    for (const it of items) attr(it.el, 'aria-selected', String(selection.includes(it.id)));
    if (!quiet) say(selection.length ? `${selection.map(nameOf).join(', ')} selected` : 'Selection cleared');
    draw();
    o.onSelect?.(selection.slice());
  }
  function focusLayer(id: string | undefined): void {
    const it = id ? item(id) : undefined;
    if (!it) return;
    focusId = it.id;
    for (const i of items) attr(i.el, 'tabindex', i === it ? '0' : '-1');
    it.el.focus({ preventScroll: true });
  }
  function view(): void {
    css(stage, 'transform-origin', zoom === 1 && !pan.x && !pan.y ? undefined : '0 0');
    css(stage, 'transform', zoom === 1 && !pan.x && !pan.y ? undefined : `translate(${r2(pan.x)}px, ${r2(pan.y)}px) scale(${zoom})`);
    draw();
    o.onZoom?.(zoom);
  }
  const clampZ = (z: number) => r4(Math.min(maxZ, Math.max(minZ, z)));
  const toCanvas = (x: number, y: number): Pt => {
    const r = stage.getBoundingClientRect();
    return { x: (x - r.left) / zoom, y: (y - r.top) / zoom };
  };
  function edit(label: string, e: CanvasEdit, coalesce?: string): CanvasOp[] {
    if (!e.ops.length) return [];
    history.apply(e.doc, { label, coalesce });
    o.onEdit?.({ label, ops: e.ops });
    return e.ops;
  }
  const moved = (ids: string[]) => {
    const b = box(ids[0]);
    if (b) say(`${ids.map(nameOf).join(', ')} moved to ${Math.round(b.x)}, ${Math.round(b.y)}`);
  };

  // --- pointer ------------------------------------------------------------------------------------------------------
  const onDown = (ev: Event) => {
    const e = ev as PointerEvent;
    if (dead || (e.pointerType === 'mouse' && e.button)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!attached) attach();
    try { root.setPointerCapture?.(e.pointerId); } catch { /* synthetic events */ }
    if (pointers.size === 2 && e.pointerType === 'touch' && g?.mode !== 'pinch') return pinch();
    if (pointers.size > 1) return;
    const c0 = { x: e.clientX, y: e.clientY }, p0 = toCanvas(c0.x, c0.y);
    const h = (e.target as Element | null)?.closest?.('[data-canvas-handle]');
    const mod = e.shiftKey || e.ctrlKey || e.metaKey;
    if (h && overlay.contains(h) && selection.length === 1) {
      const id = selection[0], b = box(id);
      const name = h.getAttribute('data-canvas-handle')!;
      g = b ? { mode: name === 'rotate' ? 'rotate' : 'resize', handle: name, c0, p0, id, box: b, start: doc(), label: name === 'rotate' ? 'Rotate' : 'Resize' } : { mode: 'noop', c0, p0 };
      if (b && name !== 'rotate') g.lines = snapLines(Object.values(visibleBoxes([id])).map(canvasBounds), guides);
    } else {
      const id = layerAt(e.target);
      if (id) {
        const was = selection.includes(id);
        if (!was) setSel(mod ? [...selection, id] : [id]);
        focusLayer(id);
        g = { mode: 'pending', c0, p0, id, toggle: mod && was };
      } else g = { mode: 'marquee-pending', c0, p0, keep: e.shiftKey ? selection.slice() : [] };
    }
    e.preventDefault();
  };
  const onMove = (ev: Event) => {
    const e = ev as PointerEvent;
    if (!pointers.has(e.pointerId) || !g) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (g.mode === 'pinch') return pinchMove();
    if (g.mode === 'noop' || pointers.size > 1) return;
    const p = toCanvas(e.clientX, e.clientY);
    let dx = p.x - g.p0.x, dy = p.y - g.p0.y;
    const far = Math.hypot(e.clientX - g.c0.x, e.clientY - g.c0.y) >= 3;
    const th = sn ? sn.threshold / zoom : 0, snapOn = !!sn && !e.altKey, gr = sn?.grid ? grid : 0;
    if (g.mode === 'pending') {
      if (!far) return;
      const ids = movable(selection);
      if (!ids.length) { g = { ...g, mode: 'noop' }; return; }
      const bx = ids.map((id) => canvasBounds(box(id)!));
      const x = Math.min(...bx.map((b) => b.x)), y = Math.min(...bx.map((b) => b.y));
      const others = Object.values(visibleBoxes(selection)).map(canvasBounds);
      g = { ...g, mode: 'move', ids, start: doc(), label: 'Move', bounds: { x, y, width: Math.max(...bx.map((b) => b.x + b.width)) - x, height: Math.max(...bx.map((b) => b.y + b.height)) - y },
        lines: snapLines(sn?.siblings === false ? [] : others, sn?.guides === false ? {} : guides) };
    }
    if (g.mode === 'marquee-pending') {
      if (!far) return;
      g.mode = 'marquee';
    }
    g.gx = g.gy = undefined;
    if (g.mode === 'move') {
      if (snapOn) {
        const s = snapRect({ ...g.bounds!, x: g.bounds!.x + dx, y: g.bounds!.y + dy }, g.lines!, { threshold: th, grid: gr });
        dx += s.dx; dy += s.dy; g.gx = s.x; g.gy = s.y;
      }
      const ed = canvasMove(g.start!, g.ids!, time, bases(), dx, dy);
      begin();
      g.ops = ed.ops;
      history.apply(ed.doc);
      draw();
    } else if (g.mode === 'marquee') {
      const r = { x: Math.min(g.p0.x, p.x), y: Math.min(g.p0.y, p.y), width: Math.abs(dx), height: Math.abs(dy) };
      g.rect = r;
      setSel([...g.keep!, ...marqueeHits(visibleBoxes(), r)], true);
      draw();
    } else if (g.mode === 'resize' || g.mode === 'rotate') {
      const b0 = g.box!;
      let nb: Partial<CanvasBox>;
      if (g.mode === 'rotate') nb = { rotation: rotationFromPointer(b0, g.p0, p, b0.rotation, e.shiftKey ? 15 : 0) };
      else {
        const r = resizeBox(b0, g.handle as ResizeHandle, dx, dy, { keepAspect: e.shiftKey });
        if (snapOn && !e.shiftKey && !(b0.rotation % 360)) {
          const se = (v: number, ls: number[]) => { const s = snapValue(v, ls, th); return s.line !== undefined ? s : { value: snapToGrid(v, gr) }; };
          const hx = g.handle!.includes('e') ? 1 : g.handle!.includes('w') ? -1 : 0, hy = g.handle!.includes('s') ? 1 : g.handle!.includes('n') ? -1 : 0;
          if (hx > 0) { const s = se(r.x + r.width, g.lines!.x); r.width = Math.max(1, s.value - r.x); g.gx = s.line; }
          if (hx < 0) { const s = se(r.x, g.lines!.x); r.width = Math.max(1, r.x + r.width - s.value); r.x = s.value; g.gx = s.line; }
          if (hy > 0) { const s = se(r.y + r.height, g.lines!.y); r.height = Math.max(1, s.value - r.y); g.gy = s.line; }
          if (hy < 0) { const s = se(r.y, g.lines!.y); r.height = Math.max(1, r.y + r.height - s.value); r.y = s.value; g.gy = s.line; }
        }
        nb = r;
      }
      const ed = canvasSetBox(g.start!, g.id!, time, item(g.id!)!.base, nb);
      begin();
      g.ops = ed.ops;
      history.apply(ed.doc);
      draw();
    }
  };
  const begin = () => {
    if (g && !g.began) { history.begin(g.label); g.began = true; }
  };
  const end = (commit: boolean) => {
    const cur = g;
    g = null;
    if (cur?.began) {
      if (commit) {
        history.commit();
        if (cur.ops?.length) {
          o.onEdit?.({ label: cur.label!, ops: cur.ops });
          if (cur.mode === 'move') moved(cur.ids!);
          else say(`${nameOf(cur.id!)} ${cur.mode === 'rotate' ? 'rotated' : 'resized'}`);
        }
      } else history.cancel();
    }
    if (cur?.mode === 'marquee' && selection.length) say(`${selection.map(nameOf).join(', ')} selected`);
    draw();
  };
  const onUp = (ev: Event) => {
    const e = ev as PointerEvent;
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    const cur = g;
    if (cur?.mode === 'pinch') {
      if (pointers.size) g = { mode: 'noop', c0: cur.c0, p0: cur.p0 };
      else g = null;
    } else if (cur && !pointers.size) {
      if (cur.mode === 'pending') {
        if (cur.toggle) setSel(selection.filter((id) => id !== cur.id));
        else if (!(e.shiftKey || e.ctrlKey || e.metaKey) && selection.length > 1) setSel([cur.id!]);
      } else if (cur.mode === 'marquee-pending' && !e.shiftKey) setSel([]);
      end(true);
    }
    if (!pointers.size) detach();
  };
  const onCancel = (ev: Event) => {
    const e = ev as PointerEvent;
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (g?.mode !== 'pinch' || !pointers.size) end(false);
    if (!pointers.size) detach();
  };
  function pinch(): void {
    if (g?.began) history.cancel();
    const [a, b] = [...pointers.values()];
    const m0 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    g = { mode: 'pinch', c0: m0, p0: m0, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: zoom, m0, pan0: { ...pan }, P: toCanvas(m0.x, m0.y) };
    draw();
  }
  function pinchMove(): void {
    const [a, b] = [...pointers.values()];
    if (!a || !b || !g) return;
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    zoom = clampZ((g.z0! * Math.hypot(a.x - b.x, a.y - b.y)) / g.d0!);
    pan = { x: g.pan0!.x + m.x - g.m0!.x + g.P!.x * (g.z0! - zoom), y: g.pan0!.y + m.y - g.m0!.y + g.P!.y * (g.z0! - zoom) };
    view();
  }
  const onWheel = (ev: Event) => {
    const e = ev as WheelEvent;
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    api.setZoom(zoom * Math.exp(-e.deltaY * 0.01), { x: e.clientX, y: e.clientY });
  };
  function attach(): void {
    attached = true;
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onCancel);
  }
  function detach(): void {
    attached = false;
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerup', onUp);
    root.removeEventListener('pointercancel', onCancel);
  }

  // --- keyboard -----------------------------------------------------------------------------------------------------
  const onKey = (ev: Event) => {
    const e = ev as KeyboardEvent;
    const t = e.target as HTMLElement | null;
    if (dead || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || '')))) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key, code = e.code;
    const ids = items.map((i) => i.id);
    const cur = layerAt(t) ?? focusId;
    const done = () => e.preventDefault();
    if (k === 'Escape') {
      if (g?.began) end(false);
      else setSel([]);
      return done();
    }
    if (mod && !e.altKey) {
      if (k.toLowerCase() === 'a' && !e.shiftKey) { setSel(ids.filter((id) => !hidden(id))); return done(); }
      const br = code === 'BracketRight' || k === ']' || k === '}' ? 1 : code === 'BracketLeft' || k === '[' || k === '{' ? -1 : 0;
      if (br && selection.length) {
        const to = e.shiftKey ? (br > 0 ? 'front' : 'back') : br > 0 ? 'forward' : 'backward';
        let d = doc();
        const ops: CanvasOp[] = [];
        for (const id of br > 0 ? selection : [...selection].reverse()) { const r = canvasReorder(d, id, to); d = r.doc; ops.push(...r.ops); }
        if (edit('Reorder', { doc: d, ops }).length) say(`${selection.map(nameOf).join(', ')} moved ${to}`);
        return done();
      }
      if (e.shiftKey && (code === 'KeyL' || k.toLowerCase() === 'l') && selection.length) {
        const v = !selection.every((id) => layer(id)?.locked);
        api.lock(selection, v);
        return done();
      }
      if (e.shiftKey && (code === 'KeyH' || k.toLowerCase() === 'h') && selection.length) {
        api.hide(selection, !selection.every((id) => layer(id)?.muted));
        return done();
      }
      return;
    }
    const at = cur ? ids.indexOf(cur) : -1;
    const go = (i: number, sel: boolean) => {
      const id = ids[Math.max(0, Math.min(ids.length - 1, i))];
      if (id === undefined) return;
      focusLayer(id);
      if (sel) setSel(e.shiftKey ? [...selection, id] : [id]);
      else say(`${nameOf(id)}${selection.includes(id) ? ', selected' : ''}`);
    };
    if (ARROWS[k]) {
      const [x, y] = ARROWS[k];
      if (e.altKey || !selection.length) { go(at + (x + y > 0 ? 1 : -1), e.altKey); return done(); }
      const s = e.shiftKey ? 10 : 1;
      const ids2 = movable(selection);
      if (edit('Nudge', canvasMove(doc(), ids2, time, bases(), x * s, y * s), 'nudge').length) moved(ids2);
      return done();
    }
    if (k === 'Home' || k === 'End') { go(k === 'Home' ? 0 : ids.length - 1, true); return done(); }
    if ((k === ' ' || code === 'Space') && cur) { api.select([cur], { toggle: true }); return done(); }
    if (k === 'Enter' && cur) { setSel([cur]); return done(); }
  };

  const unKeys = bindHistoryKeys(root, history);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('keydown', onKey);
  root.addEventListener('wheel', onWheel, { passive: false });
  const unsub = history.subscribe(render);
  if (o.zoom && o.zoom !== 1) { zoom = clampZ(o.zoom); view(); }
  render();

  const api: StudioCanvas = {
    root,
    get selection() { return selection.slice(); },
    get focused() { return focusId; },
    get zoom() { return zoom; },
    layers: () => items.map((i) => i.id),
    getBox: (id) => box(id),
    select(ids, s = {}) {
      if (s.toggle) { const set = new Set(selection); for (const id of ids) set.has(id) ? set.delete(id) : set.add(id); setSel([...set]); }
      else setSel(s.add ? [...selection, ...ids] : ids);
    },
    selectAll: () => setSel(items.map((i) => i.id).filter((id) => !hidden(id))),
    clearSelection: () => setSel([]),
    focus: (id) => focusLayer(id),
    move(dx, dy, ids = selection) {
      const m = movable(ids), ops = edit('Move', canvasMove(doc(), m, time, bases(), dx, dy));
      if (ops.length) moved(m);
      return ops;
    },
    setBox(id, b) {
      const it = item(id);
      return it ? edit('Transform', canvasSetBox(doc(), id, time, it.base, b)) : [];
    },
    reorder: (id, to) => edit('Reorder', canvasReorder(doc(), id, to)),
    lock(ids = selection, v = true) {
      const ops = edit(v ? 'Lock' : 'Unlock', canvasSetLocked(doc(), ids, v));
      if (ops.length) say(`${ids.map(nameOf).join(', ')} ${v ? 'locked' : 'unlocked'}`);
      return ops;
    },
    hide(ids = selection, v = true) {
      const ops = edit(v ? 'Hide' : 'Show', canvasSetHidden(doc(), ids, v));
      if (ops.length) say(`${ids.map(nameOf).join(', ')} ${v ? 'hidden' : 'shown'}`);
      return ops;
    },
    setTime(ms) { time = Math.max(0, ms); render(); },
    setZoom(z, origin) {
      const nz = clampZ(z);
      if (origin) {
        const P = toCanvas(origin.x, origin.y);
        pan = { x: pan.x + P.x * (zoom - nz), y: pan.y + P.y * (zoom - nz) };
      }
      zoom = nz;
      view();
    },
    setGrid(px) { grid = Math.max(0, px || 0); },
    setGuides(gd) { guides = gd || {}; },
    refresh() {
      for (const it of items) {
        for (const p of ['translate', 'rotate', 'width', 'height']) css(it.el, p, undefined);
        it.base = measure(it.el);
      }
      render();
    },
    destroy() {
      if (dead) return;
      if (g?.began) history.cancel();
      g = null;
      pointers.clear();
      detach();
      dead = true;
      unsub();
      unKeys();
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('keydown', onKey);
      root.removeEventListener('wheel', onWheel, { passive: false } as any);
      overlay.remove();
      status.remove();
      for (const el of [...saved.keys()]) restore(el);
      items = [];
      selection = [];
    },
  };
  return api;
}
