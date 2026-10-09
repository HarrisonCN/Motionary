/**
 * motionary/components — shared base for the `<usa-*>` custom elements.
 *
 * Everything here is lazy: nothing touches `window`, `document`,
 * `HTMLElement` or `matchMedia` at import time, so the components can be
 * imported during SSR (Next, Nuxt, Astro…) and in Electron/Tauri preload
 * scripts. Classes are created the first time a `define*()` function runs.
 */

export interface ComponentsConfig {
  /**
   * Inject each component's CSS when it is defined (default `true`). Uses a
   * constructable stylesheet (`document.adoptedStyleSheets`, which a strict
   * `style-src` CSP does not block) and falls back to a `<style>` tag. Set
   * to `false` when you load `motionary/components.css` yourself.
   */
  injectStyles?: boolean;
  /**
   * `'user'` (default) follows `prefers-reduced-motion`; `'reduce'` always
   * uses the reduced variants (e.g. a kiosk / battery-saver mode). 5.0: the
   * OS setting can no longer be ignored (`'no-preference'` was removed).
   */
  reducedMotion?: 'user' | 'reduce';
  /**
   * Global motion intensity (v2.7): `'low'` (shorter, calmer), `'normal'`
   * (default) or `'high'`. Scales every component animation's duration and
   * sets `--usa-motion` (0.6 / 1 / 1.25) on `<html>` for your own CSS. 5.0:
   * `'off'` was removed — use `motionSensitivity: 'minimal'`.
   */
  motionIntensity?: MotionIntensity;
  /**
   * Motion-sensitivity level (v4.4), finer than reduced motion:
   * `'full'` (default) · `'gentle'` (no spins, zooms, skews or parallax —
   * translations and fades only, safe for vestibular disorders) ·
   * `'minimal'` (fades only; components use their reduced-motion variants) ·
   * `'static'` (no animation: every component shows its static alternative).
   * See `setMotionSensitivity()` in `motionary/components/a11y`.
   */
  motionSensitivity?: MotionSensitivity;
}

export type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
export const MOTION_SENSITIVITY_LEVELS: readonly MotionSensitivity[] = ['full', 'gentle', 'minimal', 'static'];

export type MotionIntensity = 'low' | 'normal' | 'high';
export const MOTION_SCALE: Record<MotionIntensity, number> = { low: 0.6, normal: 1, high: 1.25 };

const config: Required<ComponentsConfig> = { injectStyles: true, reducedMotion: 'user', motionIntensity: 'normal', motionSensitivity: 'full' };

/** Change global component settings (call before `define*()` for `injectStyles`). */
export function configureComponents(options: ComponentsConfig): void {
  options = { ...options };
  // 5.0: removed values are ignored (see docs/upgrading-5.md)
  if (options.motionIntensity && !(options.motionIntensity in MOTION_SCALE)) delete options.motionIntensity;
  if (options.reducedMotion && options.reducedMotion !== 'reduce') options.reducedMotion = 'user';
  Object.assign(config, options);
  if (options.motionIntensity && typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--usa-motion', String(MOTION_SCALE[options.motionIntensity] ?? 1));
    document.documentElement.setAttribute('data-usa-motion', options.motionIntensity);
  }
  if (options.motionSensitivity && typeof document !== 'undefined') {
    if (options.motionSensitivity === 'full') document.documentElement.removeAttribute('data-usa-sensitivity');
    else document.documentElement.setAttribute('data-usa-sensitivity', options.motionSensitivity);
  }
}

/** The current motion-sensitivity level (v4.4). */
export function getMotionSensitivity(): MotionSensitivity {
  return config.motionSensitivity;
}

const VESTIBULAR = /rotate|scale|skew|perspective|matrix3d/;
/**
 * Adapt keyframes to the sensitivity level: `gentle` drops transforms that
 * spin, zoom or skew (and 3D), `minimal` keeps opacity only, `static` keeps
 * just the final frame. `full` returns them unchanged.
 */
export function adaptKeyframes(frames: Keyframe[], level: MotionSensitivity = config.motionSensitivity): Keyframe[] {
  if (level === 'full' || !frames.length) return frames;
  if (level === 'static') return [frames[frames.length - 1]];
  return frames.map((f) => {
    const out: Keyframe = {};
    for (const [k, v] of Object.entries(f)) {
      if (k === 'offset' || k === 'easing' || k === 'composite') out[k] = v as any;
      else if (level === 'minimal') {
        if (k === 'opacity') out[k] = v as any;
      } else if (k === 'rotate' || k === 'scale' || (k === 'transform' && VESTIBULAR.test(String(v)))) continue;
      else out[k] = v as any;
    }
    return out;
  });
}

let quiet = 0;
/** Run `fn` without 4.9 deprecation warnings (library-internal calls). */
export function withoutDeprecations<T>(fn: () => T): T {
  quiet++;
  try {
    return fn();
  } finally {
    quiet--;
  }
}

/** The current global motion intensity. */
export function getMotionIntensity(): MotionIntensity {
  return config.motionIntensity;
}

/** Duration multiplier for the current intensity (1 when `normal`). */
export function motionScale(): number {
  return MOTION_SCALE[config.motionIntensity] ?? 1;
}

export const canDefine = (): boolean => typeof customElements !== 'undefined' && typeof HTMLElement !== 'undefined';

/** `true` when animations should be reduced (OS setting or `configureComponents`). */
export function prefersReducedMotion(): boolean {
  if (config.motionSensitivity === 'minimal' || config.motionSensitivity === 'static') return true;
  if (config.reducedMotion === 'reduce') return true;
  return typeof matchMedia === 'function' && !!matchMedia('(prefers-reduced-motion: reduce)')?.matches;
}

const injected = /*#__PURE__*/ new Set<string>();

/** Add a component's stylesheet to the document once. */
export function adoptStyles(id: string, css: string): void {
  if (!config.injectStyles || !css || injected.has(id) || typeof document === 'undefined') return;
  injected.add(id);
  try {
    if (typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in document) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
      return;
    }
  } catch {
    /* fall through to <style> */
  }
  const style = document.createElement('style');
  style.setAttribute('data-usa', id);
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
}

/** Attach `css` to a shadow root (constructable sheet where supported, else `<style>`). */
export function shadowStyles(root: ShadowRoot, css: string): void {
  try {
    if (typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in root) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      root.adoptedStyleSheets = [sheet];
      return;
    }
  } catch {
    /* fall through */
  }
  const style = document.createElement('style');
  style.textContent = css;
  root.prepend(style);
}

export type Cleanup = () => void;

/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
export interface UsaElement extends HTMLElement {
  /** `true` while reduced motion applies to this element. */
  readonly reduced: boolean;
}

export interface UsaBase extends UsaElement {
  mount(): void;
  changed(name: string): void;
  unmount(): void;
  str(name: string, fallback?: string): string;
  num(name: string, fallback: number): number;
  flag(name: string): boolean;
  setFlag(name: string, on: boolean): void;
  onCleanup(fn: Cleanup): void;
  listen<K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    type: K | string,
    fn: (e: any) => void,
    options?: AddEventListenerOptions
  ): void;
  inView(cb: (visible: boolean, entry?: IntersectionObserverEntry) => void, init?: IntersectionObserverInit, target?: Element): void;
  motion(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null;
  emit(type: string, detail?: unknown): boolean;
}

type BaseCtor = new () => UsaBase;
let baseClass: BaseCtor | null = null;

/** The lazily created base class (needs `HTMLElement`). */
export function getBase(): BaseCtor {
  if (baseClass) return baseClass;
  class Base extends HTMLElement {
    private _cleanups: Cleanup[] = [];
    private _connected = false;

    get reduced(): boolean {
      return prefersReducedMotion();
    }

    connectedCallback(): void {
      if (this._connected) return;
      this._connected = true;
      styleLoader?.(this.localName);
      // Upgraded while the parser is still inside us (a <script> in <head>
      // defined the element): children/text are not there yet, so wait.
      if (typeof document !== 'undefined' && document.readyState === 'loading' && !this.nextSibling && !this.childNodes.length) {
        const go = () => {
          if (this._connected && this.isConnected) this.mount();
        };
        document.addEventListener('DOMContentLoaded', go, { once: true });
        this._cleanups.push(() => document.removeEventListener('DOMContentLoaded', go));
        return;
      }
      this.mount();
    }

    disconnectedCallback(): void {
      this._connected = false;
      this.teardown();
    }

    attributeChangedCallback(_name: string, oldValue: string | null, value: string | null): void {
      if (!this._connected || oldValue === value) return;
      this.changed(_name);
    }

    /** Re-mount on attribute change (override for finer updates). */
    changed(_name: string): void {
      this.teardown();
      this.mount();
    }

    private teardown(): void {
      this._cleanups.splice(0).reverse().forEach((fn) => fn());
      this.unmount();
    }

    mount(): void {}
    unmount(): void {}

    str(name: string, fallback = ''): string {
      const v = this.getAttribute(name);
      return v === null ? fallback : v;
    }

    num(name: string, fallback: number): number {
      const v = this.getAttribute(name);
      const n = v === null || v.trim() === '' ? NaN : Number(v);
      return Number.isFinite(n) ? n : fallback;
    }

    /** Boolean attribute: present and not `"false"`. */
    flag(name: string): boolean {
      const v = this.getAttribute(name);
      return v !== null && v !== 'false';
    }

    setFlag(name: string, on: boolean): void {
      if (on) this.setAttribute(name, '');
      else this.removeAttribute(name);
    }

    onCleanup(fn: Cleanup): void {
      this._cleanups.push(fn);
    }

    listen(target: EventTarget, type: string, fn: (e: any) => void, options?: AddEventListenerOptions): void {
      target.addEventListener(type, fn, options);
      this.onCleanup(() => target.removeEventListener(type, fn, options));
    }

    /** Calls `cb(true/false)` as the element enters / leaves the viewport. */
    inView(cb: (visible: boolean, entry?: IntersectionObserverEntry) => void, init?: IntersectionObserverInit, target: Element = this): void {
      if (typeof IntersectionObserver === 'undefined') {
        cb(true);
        return;
      }
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) cb(e.isIntersecting, e);
      }, init);
      io.observe(target);
      this.onCleanup(() => io.disconnect());
    }

    /** `el.animate()` that returns `null` (and applies the last frame) without WAAPI. */
    motion(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null {
      return animateWithMotion(el, keyframes, options);
    }

    emit(type: string, detail?: unknown): boolean {
      return this.dispatchEvent(new CustomEvent(`usa:${type}`, { detail, bubbles: true, cancelable: true }));
    }
  }
  baseClass = Base as unknown as BaseCtor;
  return baseClass;
}

/**
 * `el.animate()` with the library's motion rules (5.0, shared by elements and
 * registered effects): motion sensitivity (keyframes adapted, `static` →
 * final frame), intensity (duration scale) and the animation budget. Returns
 * `null` (final frame applied) when nothing should animate.
 */
export function animateWithMotion(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null {
  if (typeof (el as HTMLElement).animate !== 'function' || config.motionSensitivity === 'static') {
    applyFrame(el as HTMLElement, keyframes[keyframes.length - 1]);
    return null;
  }
  keyframes = adaptKeyframes(keyframes);
  if (active >= maxActive) {
    applyFrame(el as HTMLElement, keyframes[keyframes.length - 1]);
    return null;
  }
  const k = motionScale();
  if (k !== 1 && k > 0 && typeof options.duration === 'number') options = { ...options, duration: options.duration * k, delay: (options.delay || 0) * k };
  const a = (el as HTMLElement).animate(keyframes, options);
  trackAnimation(a);
  if (options.iterations !== Infinity) {
    active++;
    let done = false;
    const end = () => {
      if (!done) {
        done = true;
        active--;
      }
    };
    a?.finished?.then(end, end);
  }
  return a;
}

/** Write a keyframe's properties as inline styles (no-WAAPI fallback). */
export function applyFrame(el: HTMLElement, frame?: Keyframe): void {
  if (!frame) return;
  for (const [k, v] of Object.entries(frame)) {
    if (k === 'offset' || k === 'easing' || k === 'composite' || v == null) continue;
    (el.style as any)[k] = String(v);
  }
}

/**
 * Register `tag` with the class built by `make(Base)`. Returns the
 * constructor, the already registered one, or `undefined` without DOM.
 */
export function defineElement(
  tag: string,
  make: (Base: BaseCtor) => CustomElementConstructor,
  css?: { id: string; text: string }
): CustomElementConstructor | undefined {
  if (!canDefine()) return undefined;
  adoptStyles('base', BASE_CSS);
  if (css) adoptStyles(css.id, css.text);
  const existing = customElements.get(tag);
  if (existing) return existing;
  const ctor = make(getBase());
  customElements.define(tag, ctor);
  return ctor;
}

const BASE_CSS = '.usa-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}';

/** A visually hidden copy of `text` for screen readers (the animated copy is `aria-hidden`). */
export function srText(text: string): HTMLSpanElement {
  const s = document.createElement('span');
  s.className = 'usa-sr';
  s.textContent = text;
  return s;
}

// --- shared rAF scheduler (4.5) ----------------------------------------------
// Every component loop goes through one requestAnimationFrame per frame
// instead of one per element: callbacks are batched, run in order, and a
// throwing callback no longer starves the others (the first error is rethrown).
const frameQueue = /*#__PURE__*/ new Map<number, FrameRequestCallback>();
let frameSeq = 1;
let frameHandle: number | ReturnType<typeof setTimeout> | 0 = 0;
let frameVia: unknown = null;
const frameStats = { frames: 0, callbacks: 0, peak: 0, last: 0 };
const frameListeners = new Set<(t: number, dt: number) => void>();

function flushFrame(t: number): void {
  frameHandle = 0;
  const dt = frameStats.last && t > frameStats.last ? t - frameStats.last : 16.7;
  frameStats.last = t;
  frameStats.frames++;
  const cbs = Array.from(frameQueue.values());
  frameQueue.clear();
  frameStats.callbacks += cbs.length;
  frameStats.peak = Math.max(frameStats.peak, cbs.length);
  let error: unknown = null;
  for (const cb of cbs) {
    try {
      cb(t);
    } catch (e) {
      error ??= e;
    }
  }
  // 8.0: loops run on the unified motion clock — dt scaled by its rate, frozen while paused
  if (!clk().paused) {
    const cdt = dt * clk().rate;
    clk().time += cdt;
    frameListeners.forEach((fn) => fn(t, cdt));
    if (frameListeners.size) requestFlush();
  }
  if (error) throw error;
}

function requestFlush(): void {
  const native = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null;
  // A stale handle from a replaced requestAnimationFrame (tests, iframes) is dropped.
  if (frameHandle && frameVia === native) return;
  frameVia = native;
  frameHandle = native ? native(flushFrame) : setTimeout(() => flushFrame(now()), 16);
}

/** requestAnimationFrame through the shared scheduler (timeout fallback in jsdom / hidden documents). */
export const raf = (cb: FrameRequestCallback): number => {
  const id = frameSeq++;
  frameQueue.set(id, cb);
  requestFlush();
  return id;
};
/** Monotonic time in ms (rAF callback timestamps differ between environments, so loops use this). */
export const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());
export const caf = (id: number): void => {
  frameQueue.delete(id);
};

/** Run `fn(time, dt)` every frame on the shared scheduler until the returned function is called. */
export function onFrame(fn: (t: number, dt: number) => void): () => void {
  frameListeners.add(fn);
  if (!clk().paused) requestFlush();
  return () => frameListeners.delete(fn);
}

/** Scheduler counters: frames flushed, callbacks run, peak callbacks in one frame, pending now. */
export function schedulerStats(): { frames: number; callbacks: number; peak: number; pending: number; loops: number } {
  return { frames: frameStats.frames, callbacks: frameStats.callbacks, peak: frameStats.peak, pending: frameQueue.size, loops: frameListeners.size };
}

// --- unified motion clock (8.0) --------------------------------------------------
// One clock drives every component, effect and frame loop: its rate scales
// all WAAPI animations started through animateWithMotion() and the dt of the
// shared frame loop; pausing it pauses them all. Shared across bundles via a
// global symbol so the ESM, CJS and UMD builds on one page agree.
interface ClockState {
  rate: number;
  paused: boolean;
  time: number;
  anims: Set<Animation>;
  subs: Set<() => void>;
}
const CLOCK_KEY = /*#__PURE__*/ Symbol.for('motionary.clock');
// 11.1: created on first use, so importing this module writes nothing to globalThis.
const clk = (): ClockState => ((globalThis as any)[CLOCK_KEY] ||= { rate: 1, paused: false, time: 0, anims: new Set(), subs: new Set() });

function applyClock(a: Animation): void {
  try {
    if (typeof (a as any).updatePlaybackRate === 'function') (a as any).updatePlaybackRate(clk().rate);
    else if (clk().rate !== 1 || (a as any).playbackRate !== undefined) (a as any).playbackRate = clk().rate;
    if (clk().paused) a.pause?.();
    else if (a.playState === 'paused' && (a as any)._usaClockPaused) a.play?.();
    (a as any)._usaClockPaused = clk().paused;
  } catch {
    /* finished / detached animation */
  }
}

/** Put an animation on the shared motion clock (animateWithMotion does this for every component / effect animation). */
export function trackAnimation(a: Animation | null | undefined): void {
  if (!a) return;
  if (clk().rate !== 1 || clk().paused) applyClock(a);
  clk().anims.add(a);
  const drop = () => clk().anims.delete(a);
  a.finished?.then(drop, drop);
}

/** The motion clock's state: `rate` (1 = normal), `paused`, `time` (clock ms elapsed, scaled by rate). */
export function getClock(): { rate: number; paused: boolean; time: number; tracked: number } {
  return { rate: clk().rate, paused: clk().paused, time: clk().time, tracked: clk().anims.size };
}

/** Change the shared clock: `{ rate }` (0.05–8) and / or `{ paused }`. Applies to running animations and loops. */
export function setClock(next: { rate?: number; paused?: boolean }): void {
  const wasPaused = clk().paused;
  if (typeof next.rate === 'number' && Number.isFinite(next.rate)) clk().rate = Math.min(8, Math.max(0.05, next.rate));
  if (typeof next.paused === 'boolean') clk().paused = next.paused;
  clk().anims.forEach(applyClock);
  if (wasPaused && !clk().paused && frameListeners.size) requestFlush();
  clk().subs.forEach((fn) => fn());
}

/** Subscribe to clock changes; returns an unsubscribe. */
export function onClockChange(fn: () => void): () => void {
  clk().subs.add(fn);
  return () => clk().subs.delete(fn);
}

// --- active animation budget (4.5) ---------------------------------------------
let active = 0;
let maxActive = Infinity;
/** Number of component animations running right now. */
export const activeAnimations = (): number => active;
/** Cap concurrent component animations; extra ones jump to their final frame (`Infinity` = no cap). */
export function setAnimationBudget(max: number): void {
  maxActive = max > 0 ? max : Infinity;
}
/** The current cap. */
export const animationBudget = (): number => maxActive;

// --- on-demand styles (4.5) -----------------------------------------------------
let styleLoader: ((tag: string) => void) | null = null;
/** Called with each element's tag the first time one connects (used by the `lite` build to load CSS on demand). */
export function setStyleLoader(fn: ((tag: string) => void) | null): void {
  styleLoader = fn;
}

export const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** Windows Fluent "decelerate" / "point-to-point" curves. */
export const FLUENT_DECELERATE = 'cubic-bezier(0.1, 0.9, 0.2, 1)';

const warned = /*#__PURE__*/ new Set<string>();
/** Log a deprecation once per key (console.warn). */
export function deprecate(key: string, message: string): void {
  if (warned.has(key)) return;
  warned.add(key);
  if (typeof console !== 'undefined') console.warn(`[motionary] ${message}`);
}

/**
 * The `kind` attribute of `<usa-spinner>`, `<usa-check>`, `<usa-dialog>` and
 * `<usa-acrylic>` (3.0: `variant` only selects a style variant).
 */
export function kindOf(el: Element, valid: readonly string[] | Record<string, unknown>, fallback: string): string {
  const k = el.getAttribute('kind');
  return k && (Array.isArray(valid) ? valid.includes(k) : k in (valid as object)) ? k : fallback;
}

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
