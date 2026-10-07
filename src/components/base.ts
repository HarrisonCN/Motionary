/**
 * use-scroll-animate/components — shared base for the `<usa-*>` custom elements.
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
   * to `false` when you load `use-scroll-animate/components.css` yourself.
   */
  injectStyles?: boolean;
  /**
   * `'user'` (default) follows `prefers-reduced-motion`; `'reduce'` always
   * uses the reduced variants (e.g. a kiosk / battery-saver mode);
   * `'no-preference'` ignores the OS setting (only for demos — respect your users).
   */
  reducedMotion?: 'user' | 'reduce' | 'no-preference';
}

const config: Required<ComponentsConfig> = { injectStyles: true, reducedMotion: 'user' };

/** Change global component settings (call before `define*()` for `injectStyles`). */
export function configureComponents(options: ComponentsConfig): void {
  Object.assign(config, options);
}

export const canDefine = (): boolean => typeof customElements !== 'undefined' && typeof HTMLElement !== 'undefined';

/** `true` when animations should be reduced (OS setting or `configureComponents`). */
export function prefersReducedMotion(): boolean {
  if (config.reducedMotion !== 'user') return config.reducedMotion === 'reduce';
  return typeof matchMedia === 'function' && !!matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const injected = new Set<string>();

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
      if (typeof (el as HTMLElement).animate !== 'function') {
        applyFrame(el as HTMLElement, keyframes[keyframes.length - 1]);
        return null;
      }
      return (el as HTMLElement).animate(keyframes, options);
    }

    emit(type: string, detail?: unknown): boolean {
      return this.dispatchEvent(new CustomEvent(`usa:${type}`, { detail, bubbles: true, cancelable: true }));
    }
  }
  baseClass = Base as unknown as BaseCtor;
  return baseClass;
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

/** requestAnimationFrame with a timeout fallback (jsdom / hidden documents). */
export const raf = (cb: FrameRequestCallback): number =>
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(cb) : (setTimeout(() => cb(Date.now()), 16) as unknown as number);
/** Monotonic time in ms (rAF callback timestamps differ between environments, so loops use this). */
export const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());
export const caf = (id: number): void => {
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
  else clearTimeout(id);
};

/** Spring-ish easing used across the components. */
export const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** Windows Fluent "decelerate" / "point-to-point" curves. */
export const FLUENT_DECELERATE = 'cubic-bezier(0.1, 0.9, 0.2, 1)';

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
