/**
 * `motionary/runtime/smooth` (10.4) — smooth (inertial) scrolling on the
 * runtime ticker, written for Motionary (own implementation and API).
 *
 * - Wheel / trackpad input is eased towards its target (`lerp` or a fixed
 *   `duration` + `ease`) on the shared ticker; keyboard, scrollbar dragging,
 *   find-in-page and screen-reader scrolling stay native (the target follows
 *   them), touch stays native by default (`touch: true` to smooth it).
 * - Works on the window or inside any scrollable `wrapper`; vertical or
 *   horizontal; nested scrollables and `[data-smooth-ignore]` are left alone.
 * - Anchor links (`#id`) glide to their target (with `offset`), focus moves
 *   for keyboard users, and the URL hash is kept.
 * - **Off under `prefers-reduced-motion: reduce`** (and while the media query
 *   matches; it re-enables when it stops matching) — wheel scrolling is then
 *   fully native. `force: true` overrides this only for non-motion use cases.
 * - Real `scroll` events still fire, so `motionary/runtime/scroll` scenes,
 *   IntersectionObservers and CSS scroll timelines all keep working.
 * SSR-safe: nothing touches `window` until `smoothScroll()` is called.
 */
import { RUNTIME_VERSION, requireModule, type RuntimeModule } from './registry';
import type { CoreApi } from './index';
import { parseEase, type Ease } from './ease';

export interface SmoothOptions {
  /** Scroll container (default: the window / document scroller). */
  wrapper?: HTMLElement | Window;
  /** Easing factor per 60 fps frame, 0–1 (default 0.1). Ignored when `duration` is set. */
  lerp?: number;
  /** Fixed glide time in ms (with `ease`) instead of `lerp`. */
  duration?: number;
  ease?: string | Ease;
  orientation?: 'vertical' | 'horizontal';
  /** Wheel delta multiplier (default 1). */
  wheelMultiplier?: number;
  /** Smooth touch scrolling too (default false: native momentum is better on touch devices). */
  touch?: boolean;
  touchMultiplier?: number;
  /** Glide to `#anchor` links (default true). */
  anchors?: boolean | { offset?: number };
  /** Ignore prefers-reduced-motion (default false — leave it off unless the motion is essential). */
  force?: boolean;
  onScroll?: (s: SmoothScroll) => void;
}

export interface ScrollToOptions2 {
  offset?: number;
  /** Jump without animating. */
  immediate?: boolean;
  duration?: number;
  ease?: string | Ease;
  onComplete?: () => void;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const instances = new Set<SmoothScroll>();

export class SmoothScroll {
  /** Current (animated) scroll position, px. */
  current = 0;
  /** Where the scroll is heading, px. */
  target = 0;
  /** px per frame of the last update. */
  velocity = 0;
  /** True while gliding. */
  isScrolling = false;
  private o: SmoothOptions;
  private el: HTMLElement;
  private win: boolean;
  private stopped = false;
  private reduced = false;
  private off: (() => void)[] = [];
  private tickOff: (() => void) | null = null;
  private written = NaN;
  private glide: { from: number; to: number; t: number; d: number; ease: Ease; done?: () => void } | null = null;
  private listeners = new Set<(s: SmoothScroll) => void>();
  private touchY = 0;

  constructor(o: SmoothOptions = {}) {
    if (typeof window === 'undefined') throw new Error('[motionary] smoothScroll() needs a browser (call it on the client)');
    this.o = o;
    const w = o.wrapper || window;
    this.win = w === window;
    this.el = this.win ? (document.scrollingElement as HTMLElement) || document.documentElement : (w as HTMLElement);
    if (o.onScroll) this.listeners.add(o.onScroll);
    this.current = this.target = this.native;
    const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    const syncMq = () => {
      this.reduced = !!mq?.matches && !o.force;
      this.el.classList.toggle('usa-smooth', !this.reduced && !this.stopped);
    };
    syncMq();
    if (mq) this.on(mq as any, 'change', syncMq);
    const evTarget: EventTarget = this.win ? window : this.el;
    this.on(evTarget, 'wheel', (e: WheelEvent) => this.wheel(e), { passive: false });
    if (o.touch) {
      this.on(evTarget, 'touchstart', (e: TouchEvent) => (this.touchY = this.axis(e.touches[0].clientX, e.touches[0].clientY)), { passive: true });
      this.on(evTarget, 'touchmove', (e: TouchEvent) => {
        if (!this.active || e.touches.length !== 1) return;
        const p = this.axis(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
        this.push((this.touchY - p) * (o.touchMultiplier ?? 1.5));
        this.touchY = p;
      }, { passive: false });
    }
    // native scrolling (keyboard, scrollbar, find, focus, assistive tech): follow it
    this.on(evTarget, 'scroll', () => {
      if (Math.abs(this.native - this.written) <= 1) return; // our own write (browsers may coalesce several into one event)
      // someone else scrolled (keyboard, scrollbar drag, find, focus): adopt it and drop any glide
      this.halt();
      this.glide = null;
      this.current = this.target = this.native;
    }, { passive: true });
    if (o.anchors !== false) this.on(this.win ? document : this.el, 'click', (e: MouseEvent) => this.anchor(e));
    instances.add(this);
  }

  private on(t: EventTarget, type: string, fn: (e: any) => void, opt?: AddEventListenerOptions): void {
    t.addEventListener(type, fn, opt);
    this.off.push(() => t.removeEventListener(type, fn, opt));
  }
  private get horizontal(): boolean {
    return this.o.orientation === 'horizontal';
  }
  private axis(x: number, y: number): number {
    return this.horizontal ? x : y;
  }
  /** The scroll position the browser reports. */
  get native(): number {
    return this.horizontal ? this.el.scrollLeft : this.el.scrollTop;
  }
  /** Maximum scroll, px. */
  get limit(): number {
    return this.horizontal ? this.el.scrollWidth - this.el.clientWidth : this.el.scrollHeight - this.el.clientHeight;
  }
  /** 0–1 */
  get progress(): number {
    return this.limit ? this.current / this.limit : 0;
  }
  /** Smoothing is running (not stopped, not reduced motion). */
  get active(): boolean {
    return !this.stopped && !this.reduced;
  }

  private wheel(e: WheelEvent): void {
    if (!this.active || e.ctrlKey) return; // ctrl+wheel = zoom
    // leave nested scrollables / opted-out regions alone
    for (let n = e.target as HTMLElement | null; n && n !== this.el; n = n.parentElement) {
      if (n.hasAttribute?.('data-smooth-ignore')) return;
      if (n !== document.body && n.scrollHeight > n.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)) return;
    }
    const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? (this.horizontal ? this.el.clientWidth : this.el.clientHeight) : 1;
    const d = (this.horizontal ? e.deltaX || e.deltaY : e.deltaY) * unit * (this.o.wheelMultiplier ?? 1);
    const next = clamp(this.target + d, 0, this.limit);
    if (next === this.target && (this.target <= 0 || this.target >= this.limit)) return; // at an edge: let the page / parent handle it
    e.preventDefault();
    this.push(d);
  }
  private push(d: number): void {
    this.glide = null;
    this.target = clamp(this.target + d, 0, this.limit);
    this.start();
  }
  private start(): void {
    if (this.tickOff) return;
    this.isScrolling = true;
    this.tickOff = requireModule<CoreApi>('core', 'motionary/runtime/smooth').getTicker().add((_, dt) => this.tick(dt));
  }
  private tick(dt: number): void {
    const prev = this.current;
    if (this.glide) {
      const g = this.glide;
      g.t = Math.min(g.d, g.t + dt);
      this.current = g.from + (g.to - g.from) * g.ease(g.d ? g.t / g.d : 1);
      if (g.t >= g.d) {
        this.current = this.target = g.to;
        this.glide = null;
        g.done?.();
      }
    } else if (this.o.duration) {
      this.glide = { from: this.current, to: this.target, t: 0, d: this.o.duration, ease: this.easeOf(this.o.ease) };
      return this.tick(dt);
    } else {
      // frame-rate independent lerp
      const k = 1 - Math.pow(1 - clamp(this.o.lerp ?? 0.1, 0.001, 1), dt / (1000 / 60));
      this.current += (this.target - this.current) * k;
      if (Math.abs(this.target - this.current) < 0.5) this.current = this.target;
    }
    this.velocity = this.current - prev;
    this.write(this.current);
    this.listeners.forEach((f) => f(this));
    if (this.current === this.target && !this.glide) this.halt();
  }
  private easeOf(e?: string | Ease): Ease {
    return typeof e === 'function' ? e : parseEase(e || 'expo-out');
  }
  private write(v: number): void {
    const r = Math.round(v * 100) / 100;
    if (Math.abs(this.native - r) < 0.5) return;
    if (this.horizontal) this.el.scrollLeft = r;
    else this.el.scrollTop = r;
    this.written = this.native; // what the browser actually stored (it may round to device pixels)
  }
  private halt(): void {
    this.tickOff?.();
    this.tickOff = null;
    this.isScrolling = false;
    this.velocity = 0;
  }
  private anchor(e: MouseEvent): void {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.('a[href*="#"]') as HTMLAnchorElement | null;
    if (!a || a.target === '_blank') return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname !== location.pathname || !u.hash) return;
    const id = decodeURIComponent(u.hash.slice(1));
    const t = id === 'top' ? null : document.getElementById(id);
    if (id !== 'top' && !t) return;
    if (!this.win && t && !this.el.contains(t)) return;
    e.preventDefault();
    const off = typeof this.o.anchors === 'object' ? this.o.anchors.offset || 0 : 0;
    this.scrollTo(t || 0, { offset: off, onComplete: () => {
      if (t) {
        if (!t.hasAttribute('tabindex') && !/^(a|button|input|select|textarea)$/i.test(t.tagName)) t.setAttribute('tabindex', '-1');
        t.focus({ preventScroll: true });
      }
    } });
    if (history.pushState) history.pushState(null, '', u.hash);
  }

  /** Scroll to a position (px), an element, or a selector. Animated unless reduced motion / `immediate`. */
  scrollTo(to: number | string | Element, o: ScrollToOptions2 = {}): void {
    let y: number;
    if (typeof to === 'number') y = to;
    else {
      const el = typeof to === 'string' ? document.querySelector(to) : to;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const base = this.win ? 0 : this.axis(this.el.getBoundingClientRect().left, this.el.getBoundingClientRect().top);
      y = this.native + this.axis(r.left, r.top) - base;
    }
    y = clamp(y + (o.offset || 0), 0, this.limit);
    if (o.immediate || !this.active) {
      this.halt();
      this.glide = null;
      this.current = this.target = y;
      this.write(y);
      o.onComplete?.();
      return;
    }
    this.target = y;
    this.glide = { from: this.current, to: y, t: 0, d: o.duration ?? this.o.duration ?? Math.min(1200, 400 + Math.abs(y - this.current) * 0.4), ease: this.easeOf(o.ease ?? this.o.ease), done: o.onComplete };
    this.start();
  }
  /** Pause smoothing (native scrolling everywhere) — e.g. while a modal is open. */
  stop(): void {
    this.stopped = true;
    this.halt();
    this.el.classList.remove('usa-smooth');
  }
  /** Resume after `stop()`. */
  resume(): void {
    this.stopped = false;
    this.current = this.target = this.native;
    this.el.classList.toggle('usa-smooth', !this.reduced);
  }
  /** Listen to every smoothed frame; returns an unsubscribe function. */
  onScroll(fn: (s: SmoothScroll) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  /** Remove all listeners and restore native scrolling. */
  destroy(): void {
    this.halt();
    this.off.forEach((f) => f());
    this.off = [];
    this.listeners.clear();
    this.el.classList.remove('usa-smooth');
    instances.delete(this);
  }
}

/** Start smooth scrolling (see module docs). Off under reduced motion. */
export function smoothScroll(o: SmoothOptions = {}): SmoothScroll {
  return new SmoothScroll(o);
}

/** Every live instance. */
export const allSmooth = (): SmoothScroll[] => Array.from(instances);

export interface SmoothApi {
  smoothScroll: typeof smoothScroll;
  allSmooth: typeof allSmooth;
  SmoothScroll: typeof SmoothScroll;
}

/** The module object for `use(smooth)`. */
export const smooth: RuntimeModule<SmoothApi> = { id: 'smooth', version: RUNTIME_VERSION, requires: ['core'], api: { smoothScroll, allSmooth, SmoothScroll } };
