/**
 * `motionary/runtime/scroll` (10.2) — scroll-linked scenes, an original
 * implementation: start / end rules, scrubbing (direct or smoothed), pinning,
 * debug markers, enter / leave callbacks and per-edge actions for a runtime
 * tween or timeline.
 *
 * ```ts
 * import { use, timeline } from 'motionary/runtime';
 * import { scroll, scrollScene } from 'motionary/runtime/scroll';
 * use(scroll);
 * const tl = timeline({ paused: true }).to('.card', { to: { x: 200, rotate: 8 } });
 * scrollScene({ trigger: '.section', start: 'top 80%', end: 'bottom 20%', scrub: 120, pin: true, markers: true, animation: tl });
 * ```
 *
 * Rules: `"<trigger edge> <viewport edge>"` where an edge is `top | center | bottom`,
 * a percentage or pixels, optionally `+=N` / `-=N` (e.g. `"top top+=80"`);
 * `end` may also be `"+=600"` (pixels after start). Horizontal scenes use
 * `left | center | right`. Nothing touches `window` until a scene is created.
 */
import { RUNTIME_VERSION, type RuntimeModule } from './registry';
import { getTicker } from './ticker';
import type { Playable } from './tween';

export type SceneAction = 'play' | 'pause' | 'resume' | 'reverse' | 'restart' | 'reset' | 'complete' | 'none';

export interface SceneOptions {
  /** Element (or selector) whose position defines the scene. */
  trigger: Element | string;
  /** Default 'top bottom' (trigger top meets viewport bottom). */
  start?: string;
  /** Default 'bottom top'. `'+=600'` = 600 px after start. */
  end?: string;
  /** Link the animation to the scroll position: `true` (direct) or a smoothing time in ms. */
  scrub?: boolean | number;
  /** Runtime tween / timeline (created `paused: true`). */
  animation?: Playable;
  /** Without scrub: actions on enter, leave, enter back, leave back. Default 'play none none reverse'. */
  actions?: string;
  /** Pin the trigger (or another element) while the scene is active. */
  pin?: boolean | Element | string;
  /** Show start / end markers (debugging). */
  markers?: boolean | { color?: string };
  /** Class toggled on the trigger while active. */
  toggleClass?: string;
  /** Kill after the first forward completion. */
  once?: boolean;
  horizontal?: boolean;
  /** Scroll container (default: the window). */
  scroller?: Element | string;
  onEnter?: (s: ScrollScene) => void;
  onLeave?: (s: ScrollScene) => void;
  onEnterBack?: (s: ScrollScene) => void;
  onLeaveBack?: (s: ScrollScene) => void;
  onUpdate?: (s: ScrollScene) => void;
  onToggle?: (s: ScrollScene) => void;
}

const KEYWORDS: Record<string, number> = { top: 0, left: 0, center: 0.5, bottom: 1, right: 1 };

/** One side of a rule ('top', '80%', '120px', 'center+=40') → pixels within `size`. */
export function parseEdge(spec: string, size: number): number {
  const m = /^([a-z]+|-?[\d.]+%|-?[\d.]+(?:px)?)?\s*(?:([+-])=\s*(-?[\d.]+)(px|%)?)?$/.exec(spec.trim());
  if (!m) throw new Error(`[motionary] scroll: bad edge "${spec}"`);
  let v = 0;
  const b = m[1] || '0';
  if (b in KEYWORDS) v = KEYWORDS[b] * size;
  else if (b.endsWith('%')) v = (parseFloat(b) / 100) * size;
  else if (/^-?[\d.]/.test(b)) v = parseFloat(b);
  else throw new Error(`[motionary] scroll: bad edge "${spec}"`);
  if (m[2]) {
    const n = m[4] === '%' ? (parseFloat(m[3]) / 100) * size : parseFloat(m[3]);
    v += m[2] === '+' ? n : -n;
  }
  return v;
}

/** Scroll offset at which `rule` is met: trigger edge (at `triggerStart`, size `triggerSize`) meets viewport edge. */
export function resolveRule(rule: string, triggerStart: number, triggerSize: number, viewport: number): number {
  const parts = rule.trim().split(/\s+(?![+-]=)/);
  const t = parts[0] ?? 'top';
  const s = parts[1] ?? 'bottom';
  return triggerStart + parseEdge(t, triggerSize) - parseEdge(s, viewport);
}

const scenes = new Set<ScrollScene>();
const q = (x: Element | string): Element => {
  const el = typeof x === 'string' ? document.querySelector(x) : x;
  if (!el) throw new Error(`[motionary] scroll: element "${x}" not found`);
  return el;
};

/** A scroll scene (see `scrollScene()`). */
export class ScrollScene {
  readonly trigger: Element;
  readonly options: SceneOptions;
  /** Scroll offsets (px) of the start and end. */
  start = 0;
  end = 0;
  /** 0 → 1 between start and end. */
  progress = 0;
  /** 1 scrolling forward, -1 back. */
  direction = 1;
  isActive = false;
  private shown = 0;
  private last = -1;
  private offs: (() => void)[] = [];
  private pinEl: HTMLElement | null = null;
  private spacer: HTMLElement | null = null;
  private marks: HTMLElement[] = [];
  private scroller: Element | Window;
  private killed = false;

  constructor(o: SceneOptions) {
    if (typeof window === 'undefined') throw new Error('[motionary] scroll scenes need a browser window');
    this.options = o;
    this.trigger = q(o.trigger);
    this.scroller = o.scroller ? q(o.scroller) : window;
    if (o.pin) this.setupPin(o.pin === true ? (this.trigger as HTMLElement) : (q(o.pin) as HTMLElement));
    const target: EventTarget = this.scroller;
    const onScroll = () => this.update();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', this.refreshBound);
    this.offs.push(() => target.removeEventListener('scroll', onScroll), () => window.removeEventListener('resize', this.refreshBound));
    if (o.scrub && typeof o.scrub === 'number') this.offs.push(getTicker().add((_, dt) => this.smooth(dt)));
    scenes.add(this);
    this.refresh();
  }
  private refreshBound = () => this.refresh();

  private pos(): number {
    const s = this.scroller as any;
    if (s === window) return this.options.horizontal ? window.scrollX : window.scrollY;
    return this.options.horizontal ? s.scrollLeft : s.scrollTop;
  }
  private viewport(): number {
    const s = this.scroller as any;
    if (s === window) return this.options.horizontal ? window.innerWidth : window.innerHeight;
    return this.options.horizontal ? s.clientWidth : s.clientHeight;
  }

  /** Re-measure start / end (after layout changes). */
  refresh(): void {
    if (this.killed) return;
    const h = !!this.options.horizontal;
    const ref = (this.spacer || this.trigger) as Element;
    const r = ref.getBoundingClientRect();
    const sr = this.scroller === window ? { top: 0, left: 0 } : (this.scroller as Element).getBoundingClientRect();
    const tStart = (h ? r.left - sr.left : r.top - sr.top) + this.pos();
    const tSize = (this.pinEl ? (h ? this.pinEl.offsetWidth : this.pinEl.offsetHeight) : h ? r.width : r.height) || 0;
    const vp = this.viewport();
    this.start = resolveRule(this.options.start || (h ? 'left right' : 'top bottom'), tStart, tSize, vp);
    const e = this.options.end || (h ? 'right left' : 'bottom top');
    this.end = /^\+=/.test(e.trim()) ? this.start + parseFloat(e.trim().slice(2)) : resolveRule(e, tStart, tSize, vp);
    if (this.end <= this.start) this.end = this.start + 1;
    if (this.spacer && this.pinEl) this.spacer.style[h ? 'paddingRight' : 'paddingBottom'] = `${this.end - this.start}px`;
    this.drawMarkers(vp);
    this.last = -1;
    this.update();
  }

  /** Read the scroll position and fire callbacks / drive the animation. */
  update(): void {
    if (this.killed) return;
    const y = this.pos();
    const p = Math.min(1, Math.max(0, (y - this.start) / (this.end - this.start)));
    if (y !== this.last && this.last >= 0) this.direction = y > this.last ? 1 : -1;
    const prev = this.progress;
    const was = this.isActive;
    this.progress = p;
    this.isActive = y > this.start && y < this.end;
    this.last = y;
    const o = this.options;
    if (this.isActive !== was || (prev === 0 && p === 1) || (prev === 1 && p === 0)) {
      const toggles: [keyof SceneOptions, number][] = [];
      if (p > 0 && prev === 0) toggles.push(['onEnter', 0]);
      if (p === 1 && prev < 1) toggles.push(['onLeave', 1]);
      if (p < 1 && prev === 1) toggles.push(['onEnterBack', 2]);
      if (p === 0 && prev > 0) toggles.push(['onLeaveBack', 3]);
      for (const [cb, i] of toggles) {
        (o[cb] as ((s: ScrollScene) => void) | undefined)?.(this);
        if (!o.scrub) this.act(i);
      }
      if (o.toggleClass) this.trigger.classList.toggle(o.toggleClass, this.isActive);
      o.onToggle?.(this);
      if (o.once && p === 1) {
        this.applyPin(1);
        this.kill(true);
        return;
      }
    }
    this.applyPin(p);
    if (o.scrub === true && o.animation) o.animation.progress = p;
    o.onUpdate?.(this);
  }

  private smooth(dt: number): void {
    const a = this.options.animation;
    if (!a) return;
    const k = 1 - Math.exp(-dt / Math.max(1, this.options.scrub as number));
    this.shown += (this.progress - this.shown) * k;
    if (Math.abs(this.progress - this.shown) < 0.0005) this.shown = this.progress;
    a.progress = this.shown;
  }

  private act(i: number): void {
    const a = this.options.animation;
    if (!a) return;
    const act = ((this.options.actions || 'play none none reverse').split(/\s+/)[i] || 'none') as SceneAction;
    if (act === 'play') a.play();
    else if (act === 'pause') a.pause();
    else if (act === 'resume') a.play();
    else if (act === 'reverse') a.reverse();
    else if (act === 'restart') a.restart();
    else if (act === 'reset') (a.pause(), a.seek(0));
    else if (act === 'complete') (a.pause(), (a.progress = 1));
  }

  private setupPin(el: HTMLElement): void {
    this.pinEl = el;
    const sp = document.createElement('div');
    sp.className = 'usa-pin-spacer';
    sp.style.boxSizing = 'content-box';
    el.parentNode?.insertBefore(sp, el);
    sp.appendChild(el);
    this.spacer = sp;
    this.offs.push(() => {
      el.style.position = el.style.top = el.style.left = el.style.width = el.style.transform = '';
      sp.parentNode?.insertBefore(el, sp);
      sp.remove();
    });
  }

  private applyPin(p: number): void {
    const el = this.pinEl, sp = this.spacer;
    if (!el || !sp) return;
    const h = !!this.options.horizontal;
    if (p > 0 && p < 1 && this.scroller === window) {
      const r = sp.getBoundingClientRect();
      const offset = this.start - (h ? r.left + window.scrollX : r.top + window.scrollY);
      el.style.position = 'fixed';
      el.style.width = `${r.width}px`;
      el.style.left = h ? `${-offset}px` : `${r.left}px`;
      el.style.top = h ? `${r.top}px` : `${-offset}px`;
      el.style.transform = '';
    } else {
      el.style.position = el.style.top = el.style.left = el.style.width = '';
      // inside a scroll container (or after the end) pinning is done with a transform
      const d = p >= 1 ? this.end - this.start : p > 0 ? this.pos() - this.start : 0;
      el.style.transform = d ? (h ? `translateX(${d}px)` : `translateY(${d}px)`) : '';
    }
  }

  private drawMarkers(vp: number): void {
    this.marks.forEach((m) => m.remove());
    this.marks = [];
    const mk = this.options.markers;
    if (!mk) return;
    const color = (typeof mk === 'object' && mk.color) || '#e11d48';
    const h = !!this.options.horizontal;
    const host = this.scroller === window ? document.body : (this.scroller as HTMLElement);
    const line = (label: string, at: number, fixed: boolean, c: string) => {
      const d = document.createElement('div');
      d.className = 'usa-scroll-marker';
      d.textContent = label;
      d.setAttribute('aria-hidden', 'true');
      Object.assign(d.style, { position: fixed ? 'fixed' : 'absolute', [h ? 'left' : 'top']: `${at}px`, [h ? 'top' : 'right']: '0', [h ? 'height' : 'width']: '80px', [h ? 'borderLeft' : 'borderTop']: `2px solid ${c}`, color: c, font: '600 11px/1.2 ui-monospace,monospace', padding: '2px 4px', zIndex: '2147483646', pointerEvents: 'none', background: 'rgba(255,255,255,.7)' });
      (fixed ? document.body : host).appendChild(d);
      this.marks.push(d);
    };
    const rule = (r: string | undefined, d: string) => (r || d).trim().split(/\s+(?![+-]=)/)[1] ?? 'bottom';
    line(`start ${this.start | 0}`, this.start, false, color);
    line(`end ${this.end | 0}`, this.end, false, color);
    line('scroller-start', parseEdge(rule(this.options.start, 'top bottom'), vp), true, '#16a34a');
    if (!/^\+=/.test((this.options.end || '').trim())) line('scroller-end', parseEdge(rule(this.options.end, 'bottom top'), vp), true, '#2563eb');
  }

  /** Remove listeners, pin spacer and markers (`keepState` keeps the animation where it is). */
  kill(keepState = false): void {
    if (this.killed) return;
    this.killed = true;
    if (!keepState) this.options.animation?.pause();
    this.offs.splice(0).forEach((f) => f());
    this.marks.forEach((m) => m.remove());
    scenes.delete(this);
  }
}

/** Create a scroll scene. */
export function scrollScene(o: SceneOptions): ScrollScene {
  return new ScrollScene(o);
}
/** Re-measure every scene (call after layout changes such as images loading). */
export function refreshScenes(): void {
  scenes.forEach((s) => s.refresh());
}
/** Kill every scene. */
export function killScenes(): void {
  Array.from(scenes).forEach((s) => s.kill());
}
/** The live scenes. */
export const allScenes = (): ScrollScene[] => Array.from(scenes);

export interface ScrollApi {
  scrollScene: typeof scrollScene;
  refreshScenes: typeof refreshScenes;
  killScenes: typeof killScenes;
  allScenes: typeof allScenes;
  parseEdge: typeof parseEdge;
  resolveRule: typeof resolveRule;
  ScrollScene: typeof ScrollScene;
}

/** The module object for `use(scroll)`. */
export const scroll: RuntimeModule<ScrollApi> = { id: 'scroll', version: RUNTIME_VERSION, requires: ['core'], api: { scrollScene, refreshScenes, killScenes, allScenes, parseEdge, resolveRule, ScrollScene } };
