// 14.2.0 — Layout Motion 2.0 (`motionary/motion/layout` = `motionary/components/motion-layout`): FLIP with transforms and
// scale correction (children, border-radius), layout groups, interruptible layout animations, shared element
// transitions (`layoutId`) between states and routes, View Transitions API integration (same-document; cross-document
// where supported) with automatic FLIP fallback, reduced-motion handling (instant / crossfade), and correct
// measurement under scroll containers, ancestor transforms and sticky / fixed positioning. Built on Motion Engine v2:
// every layout animation is a standard `MotionControls`.
//
// jsdom has no layout, so these tests install a tiny fake layout engine: each element gets a layout box, and
// `getBoundingClientRect()` applies the inline transforms (origin 0 0, the format the module writes) of the element and
// its ancestors, minus scroll offsets (stopping at sticky / fixed). The Chromium / Firefox / WebKit specs in
// test/browser/layout-motion.spec.mjs measure real rects mid-transition.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import * as L from '../src/components/motion/layout';
import {
  LAYOUT_MOTION_VERSION, layoutDelta, mixBox, solveLayoutTransform, layoutTransform, correctRadius, measureLayout,
  snapshotLayout, flip, layoutGroup, setLayoutId, getLayoutId, sharedLayout, layoutTransition, supportsViewTransitions,
  viewTransitionName, saveLayoutSnapshot, playLayoutSnapshot, crossDocumentLayout, createLayoutTracker, isLayoutAnimating,
} from '../src/components/motion/layout';
import { configureComponents } from '../src/components/base';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8')) as { name: string; import?: string; file?: string; limit: number }[];
// the 14.1.0 budget lines (snapshot of main at 1e6e6b24; CI clones are shallow)
const prevBudgets = JSON.parse(readFileSync('test/fixtures/size-budget-14-1-0.json', 'utf8')) as typeof budgets;

// ---------------------------------------------------------------------------------------------------------------
// fake layout
type B = { x: number; y: number; width: number; height: number };
const boxes = new Map<Element, B>();
const setBox = (el: Element, x: number, y: number, width: number, height: number) => boxes.set(el, { x, y, width, height });
const T = /translate3d\(([-\d.e]+)px, ([-\d.e]+)px, 0(?:px)?\)\s*scale\(([-\d.e]+), ([-\d.e]+)\)/;
const parse = (el: Element) => {
  const m = T.exec((el as HTMLElement).style?.transform || '');
  return m ? { tx: +m[1], ty: +m[2], sx: +m[3], sy: +m[4] } : null;
};
const pinned = (el: Element) => /sticky|fixed/.test((el as HTMLElement).style?.position || '');
function visual(el: Element): B {
  const b = boxes.get(el) || { x: 0, y: 0, width: 0, height: 0 };
  let x1 = b.x, y1 = b.y, x2 = b.x + b.width, y2 = b.y + b.height;
  for (let n: Element | null = el; n; n = n.parentElement) {
    const t = parse(n);
    const o = boxes.get(n);
    if (t && o) {
      x1 = o.x + (x1 - o.x) * t.sx + t.tx; x2 = o.x + (x2 - o.x) * t.sx + t.tx;
      y1 = o.y + (y1 - o.y) * t.sy + t.ty; y2 = o.y + (y2 - o.y) * t.sy + t.ty;
    }
  }
  let sx = 0, sy = 0;
  if (!pinned(el)) for (let n = el.parentElement; n; n = n.parentElement) { sx += n.scrollLeft || 0; sy += n.scrollTop || 0; if (pinned(n)) break; }
  return { x: x1 - sx, y: y1 - sy, width: x2 - x1, height: y2 - y1 };
}
const near = (a: B, b: Partial<B>, eps = 0.6) => {
  for (const k of Object.keys(b) as (keyof B)[]) expect(Math.abs(a[k] - (b[k] as number)), `${k}: ${a[k]} vs ${b[k]}`).toBeLessThan(eps);
};
let origRect: any;
beforeEach(() => {
  boxes.clear();
  document.body.innerHTML = '';
  origRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    const v = visual(this);
    return { x: v.x, y: v.y, left: v.x, top: v.y, width: v.width, height: v.height, right: v.x + v.width, bottom: v.y + v.height, toJSON() {} } as DOMRect;
  };
  configureComponents({ reducedMotion: 'user' });
  delete (document as any).startViewTransition;
  sessionStorage.clear();
});
afterEach(() => {
  Element.prototype.getBoundingClientRect = origRect;
  configureComponents({ reducedMotion: 'user' });
  delete (document as any).startViewTransition;
});
const div = (parent: Element = document.body, html = '') => {
  const d = document.createElement('div');
  d.innerHTML = html;
  parent.append(d);
  return d;
};
const LIN = { duration: 100, easing: 'linear', autoplay: false } as const;

// ---------------------------------------------------------------------------------------------------------------
describe('14.2 Layout Motion 2.0: entry and packaging', () => {
  it('is its own opt-in entry motionary/motion/layout (= motionary/components/motion-layout), not part of lite or motionary/motion', () => {
    expect(pkg.exports['./motion/layout']).toBeTruthy();
    expect(pkg.exports['./motion/layout']).toEqual(pkg.exports['./components/motion-layout']);
    expect(readFileSync('src/components/lite.ts', 'utf8')).not.toMatch(/motion\/layout/);
    expect(readFileSync('src/components/motion/index.ts', 'utf8')).not.toMatch(/from '\.\/layout'/);
    expect(LAYOUT_MOTION_VERSION).toBe(2);
  });
  it('has its own budget line and raises no existing budget (lite stays 70 KB)', () => {
    const own = budgets.find((b) => b.import && /pkg\/components\/motion-layout'/.test(b.import));
    expect(own, 'budget line for motionary/components/motion-layout').toBeTruthy();
    expect(own!.limit).toBeLessThanOrEqual(10 * 1024);
    for (const b of prevBudgets) {
      const now = budgets.find((x) => x.name === b.name);
      expect(now, `budget line kept: ${b.name}`).toBeTruthy();
      expect(now!.limit, `budget not raised: ${b.name}`).toBeLessThanOrEqual(b.limit);
    }
    const lite = budgets.find((b) => /lite/.test(b.name) && b.limit === 70 * 1024);
    expect(lite, 'lite 70 KB budget').toBeTruthy();
  });
  it('zero runtime dependencies; version 14.2.0; docs + changelog', () => {
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.version).toBe('14.2.0');
    expect(existsSync('docs/layout-motion.md')).toBe(true);
    const doc = readFileSync('docs/layout-motion.md', 'utf8');
    for (const s of ['flip(', 'layoutGroup', 'layoutId', 'sharedLayout', 'layoutTransition', 'crossDocumentLayout', 'reducedMotion', 'createLayoutTracker', 'sticky', 'React', 'Vue', 'Svelte', 'Solid', 'Angular']) expect(doc, s).toContain(s);
    expect(readFileSync('CHANGELOG.md', 'utf8')).toMatch(/## \[14\.2\.0\]/);
  });
  it('keeps the 13.x / 14.0 layout API (motionary/components/layout: autoAnimate, sharedTransition, flipFrames) unchanged', async () => {
    const old = await import('../src/components/layout/index');
    expect(typeof old.autoAnimate).toBe('function');
    expect(typeof old.sharedTransition).toBe('function');
    expect(old.flipFrames({ left: 0, top: 0, width: 10, height: 10 }, { left: 5, top: 5, width: 20, height: 20 })[0].transform).toBe('translate(-5px, -5px) scale(0.5, 0.5)');
  });
});

describe('14.2 FLIP math (pure)', () => {
  it('layoutDelta: translate + scale from the new box back to the old one, in local px under ancestor scale', () => {
    expect(layoutDelta({ x: 10, y: 20, width: 50, height: 40 }, { x: 0, y: 0, width: 100, height: 80 })).toEqual({ x: 10, y: 20, sx: 0.5, sy: 0.5 });
    expect(layoutDelta({ x: 10, y: 20, width: 50, height: 40 }, { x: 0, y: 0, width: 100, height: 80 }, { x: 2, y: 2 })).toEqual({ x: 5, y: 10, sx: 0.5, sy: 0.5 });
    expect(layoutDelta({ x: 0, y: 0, width: 50, height: 0 }, { x: 0, y: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 0, sx: 1, sy: 1 });
  });
  it('mixBox interpolates; layoutTransform writes translate3d + scale (empty at identity)', () => {
    expect(mixBox({ x: 0, y: 0, width: 10, height: 10 }, { x: 100, y: 50, width: 30, height: 20 }, 0.5)).toEqual({ x: 50, y: 25, width: 20, height: 15 });
    expect(layoutTransform({ x: 0, y: 0, sx: 1, sy: 1 })).toBe('');
    expect(layoutTransform({ x: 1.23456, y: -2, sx: 0.5, sy: 2 })).toBe('translate3d(1.2346px, -2px, 0) scale(0.5, 2)');
  });
  it('solveLayoutTransform: a child of a scaled parent is counter-scaled so it keeps its size (scale correction)', () => {
    const parentTo = { x: 0, y: 0, width: 200, height: 100 };
    const parentShown = { x: 0, y: 0, width: 100, height: 50 }; // parent shown at half size
    const childTo = { x: 20, y: 10, width: 40, height: 20 };
    const want = { x: 20, y: 10, width: 40, height: 20 }; // the child should look untouched
    const t = solveLayoutTransform(want, childTo, { shown: parentShown, to: parentTo });
    expect(t.sx).toBeCloseTo(2); // 1 / 0.5
    expect(t.sy).toBeCloseTo(2);
    // displayed = parentShown.xy + s_p * (off + u)  → 0 + 0.5 * (20 + 20) = 20
    expect(t.x).toBeCloseTo(20);
    expect(t.y).toBeCloseTo(10);
  });
  it('correctRadius undoes the scale on border-radius (elliptical px radii)', () => {
    expect(correctRadius(8, 0.5, 2)).toBe('16px / 4px');
    expect(correctRadius([10, 20], 2, 2)).toBe('5px / 10px');
    expect(correctRadius(0, 0.5, 0.5)).toBe('');
  });
});

describe('14.2 flip(): FLIP with transforms', () => {
  it('measures, applies the inverse transform, and interpolates the element rect mid-transition', () => {
    const el = div();
    setBox(el, 0, 0, 100, 100);
    const c = flip(el, () => setBox(el, 200, 100, 200, 50), LIN);
    expect(c.duration).toBe(100);
    c.seek(0);
    near(visual(el), { x: 0, y: 0, width: 100, height: 100 });
    c.seek(50);
    near(visual(el), { x: 100, y: 50, width: 150, height: 75 });
    expect(isLayoutAnimating(el)).toBe(true);
    c.finish();
    near(visual(el), { x: 200, y: 100, width: 200, height: 50 });
    expect(el.style.transform).toBe('');
    expect(isLayoutAnimating(el)).toBe(false);
  });
  it('restores the inline transform / transform-origin / border-radius the element had', () => {
    const el = div();
    el.style.transformOrigin = '50% 50%';
    el.style.borderRadius = '3px';
    setBox(el, 0, 0, 10, 10);
    const c = flip(el, () => setBox(el, 50, 0, 10, 10), LIN);
    c.seek(50);
    expect(el.style.transformOrigin).toBe('0px 0px');
    c.finish();
    expect(el.style.transformOrigin).toBe('50% 50%');
    expect(el.style.borderRadius).toBe('3px');
  });
  it('scale: false animates position only', () => {
    const el = div();
    setBox(el, 0, 0, 100, 100);
    const c = flip(el, () => setBox(el, 100, 0, 200, 200), { ...LIN, scale: false });
    c.seek(50);
    const v = visual(el);
    expect(v.width).toBe(200);
    expect(v.x).toBeCloseTo(50);
  });
  it('scale correction: direct children keep their size while the parent scales', () => {
    const p = div();
    const ch = div(p);
    setBox(p, 0, 0, 100, 100);
    setBox(ch, 10, 10, 20, 20);
    const c = flip(p, () => { setBox(p, 0, 0, 200, 200); setBox(ch, 20, 20, 20, 20); }, LIN);
    c.seek(50);
    near(visual(p), { width: 150, height: 150 });
    near(visual(ch), { width: 20, height: 20 });
    c.finish();
    expect(ch.style.transform).toBe('');
  });
  it('correct: false leaves children alone (they scale with the parent)', () => {
    const p = div();
    const ch = div(p);
    setBox(p, 0, 0, 100, 100);
    setBox(ch, 0, 0, 20, 20);
    const c = flip(p, () => { setBox(p, 0, 0, 200, 200); setBox(ch, 0, 0, 20, 20); }, { ...LIN, correct: false });
    c.seek(0);
    near(visual(ch), { width: 10, height: 10 });
  });
  it('border-radius is corrected for the current scale (stays round)', () => {
    const el = div();
    el.style.borderRadius = '10px';
    setBox(el, 0, 0, 100, 100);
    const c = flip(el, () => setBox(el, 0, 0, 200, 100), LIN);
    c.seek(0); // shown at 100×100 while laid out at 200×100 → scale (0.5, 1)
    expect(el.style.borderRadius).toBe('20px / 10px');
    c.finish();
    expect(el.style.borderRadius).toBe('10px');
  });
  it('nested layout elements animate in their parent frame (no double transform)', () => {
    const p = div();
    const ch = div(p);
    setBox(p, 0, 0, 100, 100);
    setBox(ch, 0, 0, 50, 50);
    const c = flip([p, ch], () => { setBox(p, 100, 0, 100, 100); setBox(ch, 150, 50, 50, 50); }, LIN);
    c.seek(50);
    near(visual(p), { x: 50, y: 0 });
    near(visual(ch), { x: 75, y: 25, width: 50, height: 50 });
  });
  it('is a Motion Engine v2 controller (pause / seek / reverse / cancel) and cancel restores styles', async () => {
    const el = div();
    setBox(el, 0, 0, 10, 10);
    const c = flip(el, () => setBox(el, 100, 0, 10, 10), LIN);
    for (const k of ['play', 'pause', 'seek', 'reverse', 'finish', 'cancel']) expect(typeof (c as any)[k]).toBe('function');
    c.seek(30);
    expect(el.style.transform).not.toBe('');
    c.cancel();
    expect(el.style.transform).toBe('');
    await expect(c.finished).rejects.toMatchObject({ name: 'AbortError' });
  });
  it('accepts selectors, lists and duration tokens; unchanged elements get no animation', () => {
    const a = div(); a.className = 'it';
    const b = div(); b.className = 'it';
    setBox(a, 0, 0, 10, 10); setBox(b, 0, 20, 10, 10);
    const c = flip('.it', () => setBox(a, 0, 40, 10, 10), { duration: '{duration.fast}', autoplay: false });
    expect(c.duration).toBe(150);
    c.seek(0);
    expect(b.style.transform).toBe('');
    expect(a.style.transform).not.toBe('');
  });
});

describe('14.2 interruptible layout animations', () => {
  it('a new layout change mid-flight starts from where the element is now (no jump)', () => {
    const el = div();
    setBox(el, 0, 0, 100, 100);
    const c1 = flip(el, () => setBox(el, 200, 0, 100, 100), LIN);
    c1.seek(50);
    near(visual(el), { x: 100 });
    const c2 = flip(el, () => setBox(el, 0, 200, 100, 100), LIN);
    c2.seek(0);
    near(visual(el), { x: 100, y: 0 }); // continues from the interrupted spot
    expect(c1.playState).toBe('idle'); // the old one was cancelled
    c2.seek(50);
    near(visual(el), { x: 50, y: 100 });
    c2.finish();
    near(visual(el), { x: 0, y: 200 });
  });
  it('snapshotLayout() + animate() splits measure and play (for frameworks); measureLayout reads the layout box', () => {
    const el = div();
    setBox(el, 5, 6, 7, 8);
    expect(measureLayout(el)).toEqual({ x: 5, y: 6, width: 7, height: 8 });
    const snap = snapshotLayout(el);
    setBox(el, 50, 6, 7, 8);
    const c = snap.animate(LIN);
    c.seek(50);
    near(visual(el), { x: 27.5 });
  });
});

describe('14.2 correctness under scroll containers, ancestor transforms and sticky', () => {
  it('a scroll container scrolling during the update is not mistaken for a layout change', () => {
    const sc = div();
    const el = div(sc);
    setBox(sc, 0, 0, 300, 300);
    setBox(el, 0, 100, 50, 50);
    const c = flip(el, () => { sc.scrollTop = 80; }, LIN);
    c.seek(0);
    expect(el.style.transform).toBe('');
    c.cancel();
  });
  it('a real move inside a scrolled container still animates by the layout delta only', () => {
    const sc = div();
    const el = div(sc);
    setBox(sc, 0, 0, 300, 300);
    setBox(el, 0, 100, 50, 50);
    const c = flip(el, () => { sc.scrollTop = 80; setBox(el, 100, 100, 50, 50); }, LIN);
    c.seek(0);
    near(visual(el), { x: 0, y: 20 }); // starts at the old layout spot in the scrolled container
  });
  it('window scroll during the update is ignored too (document coordinates)', () => {
    const el = div();
    setBox(el, 0, 500, 50, 50);
    const snap = snapshotLayout(el);
    // the page scrolls 300 px: the viewport rect moves up by 300, the document position does not change
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 300 });
    setBox(el, 0, 200, 50, 50);
    const c = snap.animate(LIN);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    c.seek(0);
    expect(el.style.transform).toBe('');
  });
  it('sticky / fixed: measured in viewport space (container scroll is part of how they look, not a delta)', () => {
    const sc = div();
    const st = div(sc);
    st.style.position = 'sticky';
    setBox(sc, 0, 0, 300, 300);
    setBox(st, 0, 0, 300, 40);
    const c = flip(st, () => { sc.scrollTop = 120; }, LIN);
    c.seek(0);
    expect(st.style.transform).toBe('');
  });
  it('ancestor transforms: translate deltas are converted into the scaled parent’s local px', () => {
    const wrap = div();
    const el = div(wrap);
    wrap.style.transform = 'translate3d(0px, 0px, 0) scale(2, 2)';
    setBox(wrap, 0, 0, 100, 100);
    Object.defineProperty(wrap, 'offsetWidth', { configurable: true, value: 100 });
    Object.defineProperty(wrap, 'offsetHeight', { configurable: true, value: 100 });
    setBox(el, 0, 0, 10, 10); // shown at 0..20 (scale 2)
    const c = flip(el, () => setBox(el, 40, 0, 10, 10), LIN); // shown at 80
    c.seek(0);
    near(visual(el), { x: 0, width: 20 });
    c.seek(50);
    near(visual(el), { x: 40 });
  });
});

describe('14.2 layout groups', () => {
  it('members animate together when any of them changes (siblings reflow)', () => {
    const a = div(), b = div(), c3 = div();
    setBox(a, 0, 0, 100, 20); setBox(b, 0, 20, 100, 20); setBox(c3, 0, 40, 100, 20);
    const g = layoutGroup([a, b, c3]);
    expect(g.members.length).toBe(3);
    const c = g.flip(() => { setBox(a, 0, 0, 100, 60); setBox(b, 0, 60, 100, 20); setBox(c3, 0, 80, 100, 20); }, LIN);
    c.seek(50);
    near(visual(b), { y: 40 });
    near(visual(c3), { y: 60 });
  });
  it('add / remove members; selector groups pick up new elements; ids namespace layoutIds', () => {
    const root = div(); root.setAttribute('data-layout-group', 'cards');
    const a = div(root); a.className = 'card';
    const g = layoutGroup('[data-layout-group="cards"] > .card', { id: 'cards' });
    expect(g.id).toBe('cards');
    expect(g.members).toEqual([a]);
    const b = div(root); b.className = 'card';
    expect(g.members).toEqual([a, b]);
    const x = div();
    g.add(x);
    expect(g.members).toContain(x);
    g.remove(x);
    expect(g.members).not.toContain(x);
    setLayoutId(a, 'hero', g);
    expect(getLayoutId(a)).toBe('cards/hero');
  });
});

describe('14.2 shared element transitions (layoutId)', () => {
  it('setLayoutId / getLayoutId (data-layout-id; data-shared from 13.x is read too)', () => {
    const a = div();
    setLayoutId(a, 'card-1');
    expect(a.getAttribute('data-layout-id')).toBe('card-1');
    expect(getLayoutId(a)).toBe('card-1');
    const b = div(); b.dataset.shared = 'old';
    expect(getLayoutId(b)).toBe('old');
    setLayoutId(a, null);
    expect(getLayoutId(a)).toBe(null);
  });
  it('the new element with the same layoutId flies from the old element’s box (FLIP fallback)', async () => {
    const thumb = div(); setLayoutId(thumb, 'p1'); setBox(thumb, 0, 0, 50, 50);
    let big!: HTMLElement;
    const c = await sharedLayout(() => {
      thumb.remove();
      big = div(); setLayoutId(big, 'p1'); setBox(big, 100, 100, 200, 200);
    }, LIN);
    c.seek(0);
    near(visual(big), { x: 0, y: 0, width: 50, height: 50 });
    c.seek(50);
    near(visual(big), { x: 50, y: 50, width: 125, height: 125 });
    c.finish();
    expect(big.style.transform).toBe('');
  });
  it('when both stay in the DOM the old one is hidden during the flight, or both cross-fade with crossfade: true', async () => {
    const a = div(); setLayoutId(a, 'k'); setBox(a, 0, 0, 10, 10);
    let b!: HTMLElement;
    const c = await sharedLayout(() => { a.removeAttribute('data-layout-id'); b = div(); setLayoutId(b, 'k'); setBox(b, 100, 0, 10, 10); }, LIN);
    c.seek(10);
    expect(a.style.visibility).toBe('hidden');
    near(visual(b), { x: 10 });
    c.finish();
    expect(a.style.visibility).toBe('');
    const p = div(); setLayoutId(p, 'n'); setBox(p, 0, 0, 10, 10);
    let q!: HTMLElement;
    const c3 = await sharedLayout(() => { p.removeAttribute('data-layout-id'); q = div(); setLayoutId(q, 'n'); setBox(q, 100, 0, 10, 10); }, { ...LIN, crossfade: true });
    c3.seek(50);
    expect(Number(q.style.opacity)).toBeCloseTo(0.5, 1);
    expect(Number(p.style.opacity)).toBeCloseTo(0.5, 1);
    near(visual(p), { x: 50 }); // the old one flies along while fading out
    near(visual(q), { x: 50 });
    c3.finish();
    expect(q.style.opacity).toBe('');
    expect(p.style.opacity).toBe('');
    expect(p.style.transform).toBe('');
  });
  it('async updates (route changes) work; elements only in the new state fade in', async () => {
    const a = div(); setLayoutId(a, 'r'); setBox(a, 0, 0, 10, 10);
    let n!: HTMLElement, fresh!: HTMLElement;
    const c = await sharedLayout(async () => {
      await Promise.resolve();
      a.remove();
      n = div(); setLayoutId(n, 'r'); setBox(n, 0, 100, 10, 10);
      fresh = div(); setLayoutId(fresh, 'new-only'); setBox(fresh, 0, 200, 10, 10);
    }, LIN);
    c.seek(0);
    near(visual(n), { y: 0 });
    expect(fresh.style.opacity).toBe('0');
    c.finish();
    expect(fresh.style.opacity).toBe('');
  });
});

describe('14.2 View Transitions API integration with FLIP fallback', () => {
  const fakeVT = () => {
    const calls: { names: string[]; types?: string[] }[] = [];
    (document as any).startViewTransition = (arg: any) => {
      const cb = typeof arg === 'function' ? arg : arg.update;
      const before = Array.from(document.querySelectorAll<HTMLElement>('*')).map((e) => e.style.getPropertyValue('view-transition-name')).filter(Boolean);
      const updateCallbackDone = Promise.resolve().then(() => cb());
      const entry = { names: before, types: arg?.types };
      calls.push(entry);
      const finished = updateCallbackDone.then(() => undefined);
      return { updateCallbackDone, ready: updateCallbackDone, finished, skipTransition() { (entry as any).skipped = true; } };
    };
    return calls;
  };
  it('supportsViewTransitions() follows document.startViewTransition; viewTransitionName sanitizes ids', () => {
    expect(supportsViewTransitions()).toBe(false);
    fakeVT();
    expect(supportsViewTransitions()).toBe(true);
    expect(viewTransitionName('cards/hero 1')).toBe('mo-cards_hero_1');
  });
  it('uses the View Transitions API when present: layoutIds become view-transition-names, cleared afterwards', async () => {
    const calls = fakeVT();
    const a = div(); setLayoutId(a, 'v'); setBox(a, 0, 0, 10, 10);
    let b!: HTMLElement;
    const r = await layoutTransition(() => { a.remove(); b = div(); setLayoutId(b, 'v'); setBox(b, 50, 0, 10, 10); }, { duration: 200, types: ['forward'] });
    expect(r.method).toBe('view-transition');
    expect(calls[0].names).toEqual(['mo-v']);
    expect(calls[0].types).toEqual(['forward']);
    await r.finished;
    expect(b.style.getPropertyValue('view-transition-name')).toBe('');
    expect(document.querySelector('style[data-motionary-vt]')).toBe(null);
  });
  it('falls back to FLIP when unsupported, or when forced with method: "flip" — same final DOM (parity)', async () => {
    const build = () => {
      document.body.innerHTML = '';
      const a = div(); setLayoutId(a, 'f'); setBox(a, 0, 0, 10, 10);
      return () => { a.remove(); const b = div(); b.id = 'after'; setLayoutId(b, 'f'); setBox(b, 30, 0, 10, 10); };
    };
    const r1 = await layoutTransition(build(), LIN);
    expect(r1.method).toBe('flip');
    r1.controls!.finish();
    await r1.finished;
    const dom1 = document.body.innerHTML;
    fakeVT();
    const r2 = await layoutTransition(build(), { ...LIN, method: 'flip' });
    expect(r2.method).toBe('flip');
    r2.controls!.finish();
    await r2.finished;
    expect(document.body.innerHTML).toBe(dom1);
    const r3 = await layoutTransition(build(), { duration: 100 });
    expect(r3.method).toBe('view-transition');
    await r3.finished;
    expect(document.body.innerHTML).toBe(dom1);
  });
  it('falls back to FLIP if startViewTransition throws', async () => {
    (document as any).startViewTransition = () => { throw new Error('InvalidStateError'); };
    const a = div(); setLayoutId(a, 't'); setBox(a, 0, 0, 10, 10);
    let ran = 0;
    const r = await layoutTransition(() => { ran++; }, LIN);
    expect(r.method).toBe('flip');
    expect(ran).toBe(1);
  });
  it('interrupting: a new transition skips the running view transition', async () => {
    const calls = fakeVT();
    const p1 = layoutTransition(() => {}, { duration: 100 });
    const p2 = layoutTransition(() => {}, { duration: 100 });
    await Promise.all([p1, p2]);
    expect((calls[0] as any).skipped).toBe(true);
  });
  it('reduced motion: instant by default (update only), crossfade on request, ignore keeps animating', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const calls = fakeVT();
    let n = 0;
    const r1 = await layoutTransition(() => { n++; });
    expect(r1.method).toBe('instant');
    expect(n).toBe(1);
    expect(calls.length).toBe(0);
    const r2 = await layoutTransition(() => { n++; }, { reducedMotion: 'crossfade' });
    expect(r2.method).toBe('crossfade');
    expect(calls.length).toBe(1);
    expect(calls[0].names).toEqual([]); // no shared names → root cross-fade only
    delete (document as any).startViewTransition;
    const a = div(); setLayoutId(a, 'c'); setBox(a, 0, 0, 10, 10);
    const r3 = await layoutTransition(() => { setBox(a, 100, 0, 10, 10); }, { reducedMotion: 'crossfade', duration: 100, autoplay: false } as any);
    expect(r3.method).toBe('crossfade');
    r3.controls!.seek(0);
    expect(a.style.transform).toBe(''); // no movement under reduced motion
    expect(a.style.opacity).toBe('0');
    r3.controls!.finish();
    const r4 = await layoutTransition(() => { setBox(a, 0, 0, 10, 10); }, { ...LIN, reducedMotion: 'ignore' });
    expect(r4.method).toBe('flip');
    expect(n).toBe(2);
  });
  it('flip() under reduced motion applies instantly', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const el = div();
    setBox(el, 0, 0, 10, 10);
    const c = flip(el, () => setBox(el, 100, 0, 10, 10), { duration: 100 });
    expect(c.playState).toBe('finished');
    expect(el.style.transform).toBe('');
  });
});

describe('14.2 cross-document (MPA) shared elements', () => {
  it('saveLayoutSnapshot / playLayoutSnapshot: FLIP fallback across a navigation via sessionStorage', () => {
    const a = div(); setLayoutId(a, 'doc'); setBox(a, 0, 0, 40, 40);
    saveLayoutSnapshot();
    expect(sessionStorage.getItem('motionary:layout')).toContain('doc');
    document.body.innerHTML = '';
    const b = div(); setLayoutId(b, 'doc'); setBox(b, 100, 0, 80, 80);
    const c = playLayoutSnapshot(document, LIN)!;
    expect(c).toBeTruthy();
    c.seek(0);
    near(visual(b), { x: 0, width: 40 });
    expect(sessionStorage.getItem('motionary:layout')).toBe(null); // consumed once
    expect(playLayoutSnapshot(document, LIN)).toBe(null);
  });
  it('a stale snapshot is ignored', () => {
    sessionStorage.setItem('motionary:layout', JSON.stringify({ t: Date.now() - 60_000, boxes: { x: { x: 0, y: 0, width: 1, height: 1 } } }));
    const b = div(); setLayoutId(b, 'x'); setBox(b, 100, 0, 80, 80);
    expect(playLayoutSnapshot(document, LIN)).toBe(null);
  });
  it('crossDocumentLayout(): native cross-document view transitions where supported (opt-in CSS + names on pageswap / pagereveal), else the snapshot fallback; returns an undo', () => {
    const undo = crossDocumentLayout({ method: 'view-transition' });
    expect(document.querySelector('style[data-motionary-cross-document]')?.textContent).toMatch(/@view-transition\s*\{\s*navigation:\s*auto/);
    const a = div(); setLayoutId(a, 'nav');
    window.dispatchEvent(new Event('pageswap'));
    expect(a.style.getPropertyValue('view-transition-name')).toBe('mo-nav');
    undo();
    expect(document.querySelector('style[data-motionary-cross-document]')).toBe(null);
    const undo2 = crossDocumentLayout({ method: 'flip' });
    setBox(a, 0, 0, 10, 10);
    window.dispatchEvent(new Event('pagehide'));
    expect(sessionStorage.getItem('motionary:layout')).toContain('nav');
    undo2();
  });
});

describe('14.2 framework helper: createLayoutTracker', () => {
  it('snapshot() before the framework commits, animate() after (React useLayoutEffect, Vue onBeforeUpdate/onUpdated, …)', () => {
    const el = div();
    setBox(el, 0, 0, 10, 10);
    const tr = createLayoutTracker(() => [el], LIN);
    expect(tr.animate()).toBe(null); // nothing captured yet
    tr.snapshot();
    setBox(el, 60, 0, 10, 10);
    const c = tr.animate()!;
    c.seek(50);
    near(visual(el), { x: 30 });
    tr.snapshot();
    tr.cancel();
    expect(tr.animate()).toBe(null);
  });
  it('exports the full public surface', () => {
    for (const k of ['flip', 'snapshotLayout', 'measureLayout', 'layoutGroup', 'setLayoutId', 'getLayoutId', 'sharedLayout', 'layoutTransition', 'supportsViewTransitions', 'supportsCrossDocumentViewTransitions', 'crossDocumentLayout', 'saveLayoutSnapshot', 'playLayoutSnapshot', 'createLayoutTracker', 'layoutDelta', 'mixBox', 'solveLayoutTransform', 'layoutTransform', 'correctRadius', 'viewTransitionName', 'isLayoutAnimating']) expect(typeof (L as any)[k], k).toBe('function');
  });
});
