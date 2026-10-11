/**
 * `motionary/motion/layout` (= `motionary/components/motion-layout`, 14.2) — **Layout Motion 2.0** on Motion Engine v2.
 *
 * ```ts
 * import { flip, layoutGroup, setLayoutId, layoutTransition } from 'motionary/motion/layout';
 *
 * flip('.card', () => grid.classList.toggle('dense'));            // FLIP with scale + border-radius correction
 * const g = layoutGroup('.accordion > section');                  // siblings reflow together
 * g.flip(() => item.classList.toggle('open'));
 * setLayoutId(thumb, 'photo-1');                                  // shared element (layoutId)
 * await layoutTransition(() => router.go('/photo/1'));            // View Transitions API, FLIP fallback
 * ```
 *
 * - **FLIP 2.0**: elements are measured before and after a DOM change, then shown at their old box with a
 *   `translate3d() scale()` (origin `0 0`) that eases to none. Direct children are counter-scaled so text and
 *   images do not stretch (`correct`), border-radius is corrected for the current scale (`radius`), and nested
 *   layout elements animate in their parent's frame.
 * - **Interruptible**: a new layout change on an element that is still animating starts from where it is now.
 * - **Scroll / transforms / sticky**: boxes are measured scroll-independently (window and scroll containers
 *   scrolling during an update are not layout changes), deltas are converted into the local px of scaled
 *   ancestors, and sticky / fixed elements are measured in viewport space.
 * - **Shared elements**: `data-layout-id` (`setLayoutId`) pairs elements across states and routes.
 * - **View Transitions**: `layoutTransition()` uses `document.startViewTransition` when present and falls back to
 *   FLIP; `crossDocumentLayout()` enables cross-document view transitions or a sessionStorage FLIP fallback.
 * - **Reduced motion**: instant by default, `reducedMotion: 'crossfade'` for an opacity-only change.
 *
 * Every animation is a standard {@link MotionControls}. Not part of `motionary/motion` or `lite`; zero
 * dependencies. docs/layout-motion.md
 */
import { prefersReducedMotion, EASE_OUT } from '../base';
import { resolveDurationToken } from '../tokens/index';
import { toEasingFn } from './index';
import { control } from './controls';
import type { Ctl, MotionControls, MotionNode, ControlOptions } from './controls';
import type { EasingInput } from './index';

export type { MotionControls, MotionPlayState } from './controls';

/** Layout Motion generation (14.2 = 2). */
export const LAYOUT_MOTION_VERSION = 2;

/** A box in scroll-independent px (document space; viewport space under sticky / fixed). */
export interface Box { x: number; y: number; width: number; height: number }
/** A layout transform: translate (local px) + scale, origin top-left. */
export interface LayoutDelta { x: number; y: number; sx: number; sy: number }
export type LayoutTargets = string | Element | Iterable<Element> | ArrayLike<Element>;
export type ReducedMotionMode = 'respect' | 'instant' | 'crossfade' | 'ignore';

export interface LayoutOptions extends Omit<ControlOptions, 'reducedMotion'> {
  /** ms or a duration token (`'{duration.fast}'`, `'fast'`). Default 300. */
  duration?: number | string;
  delay?: number;
  /** CSS easing, easing token or function. Default `cubic-bezier(0.22, 1, 0.36, 1)`. */
  easing?: EasingInput;
  /** Animate size changes as scale (default true); false = position only. */
  scale?: boolean;
  /** Counter-scale children of a scaling element: true (default) = direct children, a selector = matching descendants, false = none. */
  correct?: boolean | string;
  /** Correct border-radius for the current scale (default true). */
  radius?: boolean;
  /** Under `prefers-reduced-motion`: `'instant'` (default; `'respect'` is the same), `'crossfade'` (opacity only), `'ignore'` (animate anyway). */
  reducedMotion?: ReducedMotionMode;
}

// --- pure math ---------------------------------------------------------------------------

const r4 = (v: number) => Math.round(v * 1e4) / 1e4 || 0;
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const ONE = { x: 1, y: 1 };

/** The transform that shows an element laid out at `to` at the box `from` (`ps` = ancestor scale). */
export function layoutDelta(from: Box, to: Box, ps: { x: number; y: number } = ONE): LayoutDelta {
  return { x: (from.x - to.x) / ps.x, y: (from.y - to.y) / ps.y, sx: to.width ? from.width / to.width : 1, sy: to.height ? from.height / to.height : 1 };
}

/** Interpolate two boxes. */
export function mixBox(a: Box, b: Box, p: number): Box {
  return { x: mix(a.x, b.x, p), y: mix(a.y, b.y, p), width: mix(a.width, b.width, p), height: mix(a.height, b.height, p) };
}

/**
 * The transform that shows an element laid out at `to` at the box `want`. With `parent` (an animated layout
 * ancestor: its layout box `to` and the box it is `shown` at) the result is in the parent's frame, so a child
 * that should look untouched is counter-scaled (scale correction).
 */
export function solveLayoutTransform(want: Box, to: Box, parent?: { shown: Box; to: Box } | null, ps: { x: number; y: number } = ONE): LayoutDelta {
  if (!parent) return layoutDelta(want, to, ps);
  const px = parent.to.width ? parent.shown.width / parent.to.width : 1;
  const py = parent.to.height ? parent.shown.height / parent.to.height : 1;
  return {
    x: ((want.x - parent.shown.x) / px - (to.x - parent.to.x)) / ps.x,
    y: ((want.y - parent.shown.y) / py - (to.y - parent.to.y)) / ps.y,
    sx: to.width ? want.width / (px * to.width) : 1,
    sy: to.height ? want.height / (py * to.height) : 1,
  };
}

/** `translate3d(x, y, 0) scale(sx, sy)`; `''` at identity. */
export function layoutTransform(d: LayoutDelta): string {
  const x = r4(d.x), y = r4(d.y), sx = r4(d.sx), sy = r4(d.sy);
  return !x && !y && sx === 1 && sy === 1 ? '' : `translate3d(${x}px, ${y}px, 0) scale(${sx}, ${sy})`;
}

/** Border-radius (visible px) that looks right on an element shown at scale `sx`, `sy`. */
export function correctRadius(r: number | [number, number], sx: number, sy: number): string {
  const [rx, ry] = typeof r === 'number' ? [r, r] : r;
  return !rx && !ry ? '' : `${r4(rx / (sx || 1))}px / ${r4(ry / (sy || 1))}px`;
}

// --- measuring ---------------------------------------------------------------------------

const hasDoc = () => typeof document !== 'undefined';
const cs = (el: Element) => (typeof getComputedStyle === 'function' ? getComputedStyle(el) : ({} as CSSStyleDeclaration));
const pinned = (el: Element) => /^(sticky|fixed)$/.test(cs(el).position || '');

/** Scroll offsets that do not change how `el` is laid out: scroll containers up to a sticky / fixed ancestor, then the window. */
function scrollOffset(el: Element): [number, number] {
  if (pinned(el)) return [0, 0];
  let x = 0, y = 0;
  const se = hasDoc() ? document.scrollingElement : null;
  for (let n = el.parentElement; n; n = n.parentElement) {
    if (n !== se) (x += n.scrollLeft || 0), (y += n.scrollTop || 0);
    if (pinned(n)) return [x, y];
  }
  return typeof window === 'undefined' ? [x, y] : [x + (window.scrollX || 0), y + (window.scrollY || 0)];
}

/** The element's box as rendered, in scroll-independent coordinates (see {@link Box}). */
export function measureLayout(el: Element): Box {
  const r = el.getBoundingClientRect();
  const [ox, oy] = scrollOffset(el);
  return { x: r.left + ox, y: r.top + oy, width: r.width, height: r.height };
}

/** Cumulative scale of the ancestors (rendered size / layout size of the parent). */
function ancestorScale(el: Element): { x: number; y: number } {
  const p = el.parentElement as HTMLElement | null;
  if (!p || !p.offsetWidth || !p.offsetHeight) return ONE;
  const r = p.getBoundingClientRect();
  return { x: r.width / p.offsetWidth || 1, y: r.height / p.offsetHeight || 1 };
}

function readRadius(el: Element, b: Box): [number, number] {
  const s = cs(el);
  const v = (s.borderTopLeftRadius || s.borderRadius || '').split('/')[0].trim().split(/\s+/);
  const px = (t: string | undefined, of: number) => (!t ? 0 : t.endsWith('%') ? (parseFloat(t) / 100) * of : parseFloat(t) || 0);
  return [px(v[0], b.width), px(v[1] ?? v[0], b.height)];
}

const toEls = (t: LayoutTargets | (() => LayoutTargets)): HTMLElement[] => {
  if (typeof t === 'function') t = t();
  if (typeof t === 'string') return hasDoc() ? Array.from(document.querySelectorAll<HTMLElement>(t)) : [];
  if (typeof Element !== 'undefined' && t instanceof Element) return [t as HTMLElement];
  return Array.from(t as Iterable<HTMLElement>);
};

// --- running animations (interruption) ---------------------------------------------------

interface Kid { el: HTMLElement; to: Box; off: [number, number]; s: Saved }
interface Item {
  el: HTMLElement;
  /** shown at p = 0 / p = 1, layout box */
  from: Box; dest: Box; to: Box;
  r0?: [number, number]; r1?: [number, number];
  op?: [number, number];
  hide?: boolean;
  parent?: Item | null;
  ps: { x: number; y: number };
  kids: Kid[];
  s: Saved;
  /** last shown box / radius */
  D?: Box; R?: [number, number];
}
interface Run { items: Item[]; ctl: Ctl; drop(el: Element): void }
type Saved = Record<'transform' | 'transformOrigin' | 'borderRadius' | 'opacity' | 'visibility', string>;
const KEYS = ['transform', 'transformOrigin', 'borderRadius', 'opacity', 'visibility'] as const;
const running = new WeakMap<Element, Run>();

const save = (el: HTMLElement): Saved => Object.fromEntries(KEYS.map((k) => [k, el.style[k]])) as Saved;
const restore = (el: HTMLElement, s: Saved) => KEYS.forEach((k) => (el.style[k] = s[k]));
const restoreItem = (i: Item) => {
  restore(i.el, i.s);
  i.kids.forEach((k) => restore(k.el, k.s));
};

/** Is a layout animation of this package running on `el`? */
export function isLayoutAnimating(el: Element): boolean {
  return running.has(el);
}

interface Captured { el: HTMLElement; box: Box; radius: [number, number] }
/** Measure `el` as shown now; if a layout animation runs on it, take it over (stop it and keep its current box). */
function capture(el: HTMLElement): Captured {
  const run = running.get(el);
  const box = measureLayout(el);
  const it = run?.items.find((i) => i.el === el);
  const radius = it?.R || readRadius(el, box);
  run?.drop(el);
  return { el, box, radius };
}

const PIN = '0px 0px';
function render(i: Item, p: number, o: LayoutOptions) {
  const D = (i.D = mixBox(i.from, i.dest, p));
  if (o.scale === false) (D.width = i.to.width), (D.height = i.to.height);
  const el = i.el.style;
  el.transformOrigin = PIN;
  el.transform = layoutTransform(solveLayoutTransform(D, i.to, i.parent && i.parent.D ? { shown: i.parent.D, to: i.parent.to } : null, i.ps));
  const sx = i.to.width ? D.width / i.to.width : 1, sy = i.to.height ? D.height / i.to.height : 1;
  if (o.radius !== false && i.r0 && i.r1 && (i.r0[0] || i.r1[0]) && (Math.abs(sx - 1) > 1e-3 || Math.abs(sy - 1) > 1e-3 || i.r0[0] !== i.r1[0])) {
    i.R = [mix(i.r0[0], i.r1[0], p), mix(i.r0[1], i.r1[1], p)];
    el.borderRadius = correctRadius(i.R, sx, sy);
  }
  if (i.op) el.opacity = String(r4(mix(i.op[0], i.op[1], p)));
  if (i.hide) el.visibility = 'hidden';
  for (const k of i.kids) {
    k.el.style.transformOrigin = PIN;
    k.el.style.transform = layoutTransform(solveLayoutTransform({ x: D.x + k.off[0], y: D.y + k.off[1], width: k.to.width, height: k.to.height }, k.to, { shown: D, to: i.to }, i.ps));
  }
}

const tok = (v: number | string | undefined) => (typeof v === 'string' ? v.replace(/^\{duration\.([\w-]+)\}$/, '$1') : v);
/** `'instant' | 'crossfade' | null` — what reduced motion asks for right now. */
const reducedMode = (o: LayoutOptions) => (o.reducedMotion === 'ignore' || !prefersReducedMotion() ? null : o.reducedMotion === 'crossfade' ? 'crossfade' : 'instant');

/** Build items into one Motion Engine v2 controller. */
function play(items: Item[], o: LayoutOptions): Ctl {
  const rm = reducedMode(o);
  if (rm === 'crossfade') {
    items = items.filter((i) => !i.op || i.op[1] > 0);
    for (const i of items) (i.from = i.dest = i.to), (i.op = [0, 1]), (i.kids = []), (i.r0 = i.r1 = undefined), (i.hide = false);
  }
  // parents first; nested items animate in their parent's frame; children of scaling items get corrected
  const map = new Map(items.map((i) => [i.el as Element, i]));
  for (const i of items) {
    for (let n = i.el.parentElement; n && !i.parent; n = n.parentElement) i.parent = map.get(n) || null;
  }
  const depth = (i: Item): number => (i.parent ? 1 + depth(i.parent) : 0);
  items.sort((a, b) => depth(a) - depth(b));
  for (const i of items) {
    i.ps = i.parent ? i.parent.ps : ancestorScale(i.el);
    const scales = o.scale !== false && (Math.abs(i.from.width - i.to.width) > 0.5 || Math.abs(i.from.height - i.to.height) > 0.5 || Math.abs(i.dest.width - i.to.width) > 0.5);
    if (scales && o.correct !== false && rm !== 'crossfade') {
      const list = typeof o.correct === 'string' ? Array.from(i.el.querySelectorAll<HTMLElement>(o.correct)) : (Array.from(i.el.children) as HTMLElement[]);
      i.kids = list.filter((k) => !map.has(k) && k.style).map((k) => {
        const to = measureLayout(k);
        return { el: k, to, off: [to.x - i.to.x, to.y - i.to.y] as [number, number], s: save(k) };
      });
    }
  }
  const dur = Math.max(0, resolveDurationToken(tok(o.duration), 300));
  const delay = o.delay || 0;
  const ease = toEasingFn(o.easing ?? EASE_OUT);
  const unreg = () => items.forEach((i) => running.get(i.el) === run && running.delete(i.el));
  const node: MotionNode = {
    d: delay + dur,
    r(t) {
      const p = t <= delay ? 0 : dur ? Math.min(1, (t - delay) / dur) : 1;
      if (p >= 1) items.forEach(restoreItem);
      else {
        const e = ease(p);
        items.forEach((i) => render(i, e, o));
      }
    },
    x() {
      items.forEach(restoreItem);
      unreg();
    },
  };
  const ctl = control(node, { ...o, autoplay: false, reducedMotion: 'ignore', onComplete: () => (unreg(), o.onComplete?.()) } as ControlOptions);
  const run: Run = {
    items,
    ctl,
    drop(el) {
      const k = items.findIndex((i) => i.el === el);
      if (k < 0) return;
      restoreItem(items[k]);
      items.splice(k, 1);
      running.delete(el);
      if (!items.length) ctl.cancel();
    },
  };
  for (const i of items) {
    running.get(i.el)?.drop(i.el);
    running.set(i.el, run);
  }
  if (rm === 'instant' || !items.length) return ctl.finish() as Ctl;
  node.r(0);
  if (o.autoplay !== false) ctl.play();
  return ctl;
}

const same = (a: Box, b: Box) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.width - b.width) + Math.abs(a.height - b.height) < 0.5;
function item(el: HTMLElement, from: Box, fromR: [number, number] | undefined, extra: Partial<Item> = {}): Item | null {
  if (!el.isConnected) return null;
  const to = measureLayout(el);
  if (!to.width && !to.height) return null; // display: none
  const r1 = readRadius(el, to);
  const it: Item = { el, from, dest: to, to, r0: fromR || r1, r1, ps: ONE, kids: [], s: save(el), ...extra };
  if (!extra.op && !extra.hide && extra.dest === undefined && same(from, to) && it.r0![0] === r1[0]) return null;
  return it;
}

// --- FLIP ---------------------------------------------------------------------------------

export interface LayoutSnapshot {
  readonly elements: HTMLElement[];
  /** Measure again and animate every element from its captured box. */
  animate(options?: LayoutOptions): MotionControls;
}

/** Capture the boxes of `targets` (taking over running layout animations); call `animate()` after the DOM changed. */
export function snapshotLayout(targets: LayoutTargets, defaults: LayoutOptions = {}): LayoutSnapshot {
  const caps = toEls(targets).map(capture);
  return {
    elements: caps.map((c) => c.el),
    animate: (o = defaults) => play(caps.map((c) => item(c.el, c.box, c.radius)).filter(Boolean) as Item[], o),
  };
}

/**
 * FLIP: measure `targets`, run `update()` (synchronous DOM change), measure again and animate each element
 * from its old box to the new one with transforms (scale + children + border-radius corrected).
 */
export function flip(targets: LayoutTargets, update: () => void, options: LayoutOptions = {}): MotionControls {
  const snap = snapshotLayout(targets);
  update();
  return snap.animate(options);
}

// --- layout groups --------------------------------------------------------------------------

export interface LayoutGroup {
  /** Namespace for layoutIds (`setLayoutId(el, id, group)` → `"<group.id>/<id>"`). */
  readonly id?: string;
  /** Current members (selector members are re-queried each time). */
  readonly members: HTMLElement[];
  add(el: Element): LayoutGroup;
  remove(el: Element): LayoutGroup;
  snapshot(options?: LayoutOptions): LayoutSnapshot;
  /** FLIP every member around `update()`, so siblings reflow together. */
  flip(update: () => void, options?: LayoutOptions): MotionControls;
  /** Shared-element transition limited to this group's layoutIds. */
  shared(update: () => void | Promise<void>, options?: SharedLayoutOptions): Promise<MotionControls>;
}

/** A set of elements that animate together when any of them changes layout. */
export function layoutGroup(members: LayoutTargets = [], options: LayoutOptions & { id?: string } = {}): LayoutGroup {
  const base = typeof members === 'string' ? members : toEls(members);
  const extra = new Set<HTMLElement>();
  const out = new Set<Element>();
  const g: LayoutGroup = {
    id: options.id,
    get members() {
      const list = [...toEls(base), ...extra];
      return [...new Set(list)].filter((e) => !out.has(e));
    },
    add: (el) => (out.delete(el), extra.add(el as HTMLElement), g),
    remove: (el) => (extra.delete(el as HTMLElement), out.add(el), g),
    snapshot: (o) => snapshotLayout(g.members, { ...options, ...o }),
    flip: (update, o) => flip(g.members, update, { ...options, ...o }),
    shared: (update, o) => sharedLayout(update, { ...options, ...o, scope: options.id ? options.id + '/' : o?.scope }),
  };
  return g;
}

// --- shared elements (layoutId) -------------------------------------------------------------

const ATTR = 'data-layout-id';
/** Pair elements across states / routes: same layoutId = same element. `null` removes it. */
export function setLayoutId(el: Element, id: string | null, group?: { id?: string }): void {
  if (id == null) el.removeAttribute(ATTR);
  else el.setAttribute(ATTR, group?.id ? `${group.id}/${id}` : id);
}
/** The layoutId (`data-layout-id`, or the 13.x `data-shared`). */
export function getLayoutId(el: Element): string | null {
  return el.getAttribute(ATTR) ?? el.getAttribute('data-shared');
}
function collect(root: ParentNode = document, scope?: string): Map<string, HTMLElement> {
  const m = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>(`[${ATTR}],[data-shared]`).forEach((el) => {
    const id = getLayoutId(el);
    if (id && (!scope || id.startsWith(scope))) m.set(id, el);
  });
  return m;
}

export interface SharedLayoutOptions extends LayoutOptions {
  /** Where to look for layoutIds (default `document`). */
  root?: ParentNode;
  /** Only layoutIds starting with this prefix. */
  scope?: string;
  /** Old and new element both fly; the old fades out, the new fades in (when the old one stays in the DOM). */
  crossfade?: boolean;
  /** Elements whose layoutId only exists after the update: `'fade'` in (default) or `'none'`. */
  enter?: 'fade' | 'none';
}

function sharedItems(before: Map<string, Captured>, after: Map<string, HTMLElement>, o: SharedLayoutOptions): Item[] {
  const items: (Item | null)[] = [];
  after.forEach((el, id) => {
    const b = before.get(id);
    if (!b) return void (o.enter !== 'none' && items.push(item(el, measureLayout(el), undefined, { op: [0, 1] })));
    if (b.el === el) return void items.push(item(el, b.box, b.radius));
    const n = item(el, b.box, b.radius, o.crossfade && b.el.isConnected ? { op: [0, 1] } : {});
    items.push(n);
    if (n && b.el.isConnected) items.push(item(b.el, b.box, b.radius, o.crossfade ? { dest: n.to, op: [1, 0] } : { hide: true }));
  });
  return items.filter(Boolean) as Item[];
}

/**
 * Shared-element transition (FLIP): elements with a layoutId before `update()` (sync or async — a route
 * change) fly to the element with the same layoutId afterwards.
 */
export async function sharedLayout(update: () => void | Promise<void>, options: SharedLayoutOptions = {}): Promise<MotionControls> {
  const root = options.root || document;
  const before = new Map([...collect(root, options.scope)].map(([id, el]) => [id, capture(el)]));
  await update();
  return play(sharedItems(before, collect(root, options.scope), options), options);
}

// --- View Transitions ------------------------------------------------------------------------

/** Same-document View Transitions API available. */
export function supportsViewTransitions(): boolean {
  return hasDoc() && typeof (document as any).startViewTransition === 'function';
}
/** Cross-document view transitions (`@view-transition { navigation: auto }`, pageswap / pagereveal) available. */
export function supportsCrossDocumentViewTransitions(): boolean {
  return typeof window !== 'undefined' && 'onpagereveal' in window && typeof CSS !== 'undefined' && !!CSS.supports?.('view-transition-name', 'a');
}
/** `view-transition-name` for a layoutId (`mo-` + id with unsafe characters as `_`). */
export function viewTransitionName(id: string): string {
  return 'mo-' + id.replace(/[^\w-]/g, '_');
}
const VTN = 'view-transition-name';
const nameAll = (m: Map<string, HTMLElement>) => m.forEach((el, id) => el.style.setProperty(VTN, viewTransitionName(id)));
const clearAll = (m: Map<string, HTMLElement>) => m.forEach((el) => el.style.removeProperty(VTN));
const timingCss = (o: LayoutOptions) => {
  const e = typeof o.easing === 'string' ? o.easing : typeof o.easing === 'function' ? '' : EASE_OUT;
  return `::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation-duration:${Math.max(0, resolveDurationToken(tok(o.duration), 300))}ms;${o.delay ? `animation-delay:${o.delay}ms;` : ''}${e ? `animation-timing-function:${e};` : ''}}`;
};
const styleEl = (attr: string, css: string) => {
  const s = document.createElement('style');
  s.setAttribute(attr, '');
  s.textContent = css;
  document.head.append(s);
  return s;
};

export interface LayoutTransitionOptions extends SharedLayoutOptions {
  /** `'auto'` (default): View Transitions API when supported, FLIP otherwise. */
  method?: 'auto' | 'view-transition' | 'flip';
  /** View transition types (`:active-view-transition-type()`), where supported. */
  types?: string[];
}
export interface LayoutTransitionResult {
  /** What ran: the View Transitions API, the FLIP fallback, an instant update or a reduced-motion cross-fade. */
  method: 'view-transition' | 'flip' | 'instant' | 'crossfade';
  /** Resolves when the animation is over (never rejects). */
  finished: Promise<void>;
  /** The FLIP controller (FLIP and FLIP cross-fade). */
  controls?: MotionControls;
  /** The `ViewTransition` (View Transitions API). */
  viewTransition?: any;
  /** Jump to the end. */
  skip(): void;
}

let currentVT: any = null;
const settle = (p: Promise<unknown>) => p.then(() => undefined, () => undefined);

/**
 * Animate a DOM change (sync or async: state change, route change) with shared elements: the View Transitions
 * API when present (layoutIds become `view-transition-name`s), FLIP otherwise or when it fails. A new transition
 * skips the running one. Resolves once the DOM is updated.
 */
export async function layoutTransition(update: () => void | Promise<void>, options: LayoutTransitionOptions = {}): Promise<LayoutTransitionResult> {
  const o = options;
  const root = o.root || document;
  const rm = reducedMode(o);
  const skipCurrent = () => (currentVT?.skipTransition?.(), (currentVT = null));
  if (rm === 'instant') {
    skipCurrent();
    await update();
    return { method: 'instant', finished: Promise.resolve(), skip() {} };
  }
  if (o.method !== 'flip' && supportsViewTransitions()) {
    let after = new Map<string, HTMLElement>();
    const before = rm ? new Map<string, HTMLElement>() : collect(root, o.scope);
    let vt: any;
    let style: HTMLStyleElement | null = null;
    try {
      skipCurrent();
      nameAll(before);
      style = styleEl('data-motionary-vt', timingCss(o));
      const cb = async () => {
        clearAll(before);
        await update();
        if (!rm) nameAll((after = collect(root, o.scope)));
      };
      const doc = document as any;
      try {
        vt = o.types ? doc.startViewTransition({ update: cb, types: o.types }) : doc.startViewTransition(cb);
      } catch (e) {
        if (!(e instanceof TypeError) || !o.types) throw e;
        vt = doc.startViewTransition(cb); // no types support
      }
    } catch {
      clearAll(before);
      style?.remove();
      vt = null;
    }
    if (vt) {
      currentVT = vt;
      await vt.updateCallbackDone;
      const finished = settle(vt.finished).then(() => {
        clearAll(after);
        style?.remove();
        if (currentVT === vt) currentVT = null;
      });
      return { method: rm ? 'crossfade' : 'view-transition', finished, viewTransition: vt, skip: () => vt.skipTransition?.() };
    }
  }
  skipCurrent();
  const controls = await sharedLayout(update, o);
  return { method: rm ? 'crossfade' : 'flip', finished: settle(controls.finished), controls, skip: () => controls.finish() };
}

// --- cross-document (MPA) ------------------------------------------------------------------------

const KEY = 'motionary:layout';
const store = (): Storage | null => {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
};

/** Save the viewport boxes of every layoutId (call on `pagehide` / before navigating) for {@link playLayoutSnapshot}. */
export function saveLayoutSnapshot(root: ParentNode = document, key = KEY): void {
  const boxes: Record<string, Box & { r: [number, number] }> = {};
  collect(root).forEach((el, id) => {
    const r = el.getBoundingClientRect();
    boxes[id] = { x: r.left, y: r.top, width: r.width, height: r.height, r: readRadius(el, r as any) };
  });
  try {
    store()?.setItem(key, JSON.stringify({ t: Date.now(), boxes }));
  } catch {
    /* storage full / blocked */
  }
}

/** On the new page: FLIP every layoutId from the box saved on the previous page (once; ignored after `maxAge` ms, default 5000). */
export function playLayoutSnapshot(root: ParentNode = document, options: SharedLayoutOptions & { key?: string; maxAge?: number } = {}): MotionControls | null {
  const s = store();
  const raw = s?.getItem(options.key || KEY);
  if (!raw) return null;
  s!.removeItem(options.key || KEY);
  let data: { t: number; boxes: Record<string, Box & { r?: [number, number] }> };
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || Date.now() - data.t > (options.maxAge ?? 5000)) return null;
  const items: Item[] = [];
  collect(root).forEach((el, id) => {
    const b = data.boxes?.[id];
    if (!b) return;
    const [ox, oy] = scrollOffset(el);
    const it = item(el, { x: b.x + ox, y: b.y + oy, width: b.width, height: b.height }, b.r);
    if (it) items.push(it);
  });
  return items.length ? play(items, options) : null;
}

/**
 * Shared elements across page loads (MPA): native cross-document view transitions where supported (adds
 * `@view-transition { navigation: auto }` and names layoutIds on `pageswap` / `pagereveal`), otherwise the
 * sessionStorage FLIP fallback (save on `pagehide`, play on load). Include it on both pages, early (render-
 * blocking) for `pagereveal`. Returns an undo.
 */
export function crossDocumentLayout(options: SharedLayoutOptions & { method?: 'auto' | 'view-transition' | 'flip' } = {}): () => void {
  if (typeof window === 'undefined' || !hasDoc()) return () => {};
  const root = options.root || document;
  const native = options.method === 'view-transition' || (options.method !== 'flip' && supportsCrossDocumentViewTransitions());
  const offs: (() => void)[] = [];
  const on = (type: string, fn: (e: any) => void) => (window.addEventListener(type, fn), offs.push(() => window.removeEventListener(type, fn)));
  if (native) {
    const style = styleEl('data-motionary-cross-document', `@view-transition { navigation: auto; }\n${timingCss(options)}`);
    offs.push(() => style.remove());
    const named = (e: any) => {
      const rm = reducedMode(options);
      if (rm === 'instant') return void e?.viewTransition?.skipTransition?.();
      if (rm) return; // cross-fade only
      const m = collect(root, options.scope);
      nameAll(m);
      e?.viewTransition?.finished?.finally?.(() => clearAll(m));
    };
    on('pageswap', named);
    on('pagereveal', named);
  } else {
    on('pagehide', () => saveLayoutSnapshot(root));
    const run = () => playLayoutSnapshot(root, options);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
      offs.push(() => document.removeEventListener('DOMContentLoaded', run));
    } else run();
  }
  return () => offs.splice(0).forEach((f) => f());
}

// --- framework helper ------------------------------------------------------------------------------

export interface LayoutTracker {
  /** Capture boxes — before the framework updates the DOM (event handler, `onBeforeUpdate`, `$effect.pre`, …). */
  snapshot(): void;
  /** After the DOM update (`useLayoutEffect`, `onUpdated`, `afterNextRender`, …): animate; null without a snapshot. */
  animate(): MotionControls | null;
  /** Drop the snapshot and cancel the running animation. */
  cancel(): void;
}

/** Framework-neutral FLIP helper: `snapshot()` before a render, `animate()` after it. */
export function createLayoutTracker(targets: LayoutTargets | (() => LayoutTargets), options: LayoutOptions = {}): LayoutTracker {
  let snap: LayoutSnapshot | null = null;
  let last: MotionControls | null = null;
  return {
    snapshot: () => void (snap = snapshotLayout(toEls(targets), options)),
    animate() {
      if (!snap) return null;
      const s = snap;
      snap = null;
      return (last = s.animate(options));
    },
    cancel() {
      snap = null;
      if (last && last.playState !== 'finished') last.cancel();
      last = null;
    },
  };
}
