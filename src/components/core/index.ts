/**
 * `motionary/core` (10.0) — the zero-dependency core, under 10 KB gzip.
 *
 * Everything else is a plugin: `createMotion().use(retro, cinema)` with the
 * packs from `motionary/plugins` (or your own `{ name, effects }`).
 *
 * - `createMotion({ reducedMotion, rate })` → an instance with `use()`,
 *   `play(el, effect, options)`, `bind(el, effect, { trigger })`,
 *   `reveal(targets, preset, { stagger, once, threshold })`, `animate()`,
 *   `pause()` / `resume()` / `setRate()` for everything it started,
 *   `effects()` and `destroy()`.
 * - `PRESETS` — entrance keyframes (fade, fade-up/down/left/right, scale,
 *   zoom-in/out, blur-in, flip-up), registered as `enter` effects.
 * - `preferredBackend()` — `webgpu` (default when available) → `webgl2` →
 *   `canvas`, the order GPU plugins use.
 *
 * Reduced motion is honoured everywhere (OS setting or `reducedMotion:
 * 'reduce'`): entrances fade, loops / backgrounds / cursors are skipped.
 */
export const VERSION = '10.0.0';

export type CoreEffectKind = 'enter' | 'exit' | 'attention' | 'hover' | 'click' | 'loop' | 'background' | 'cursor' | 'text' | 'scroll' | (string & {});
export interface CoreEffectContext {
  reduced: boolean;
  sensitivity: 'full' | 'gentle' | 'minimal' | 'static';
  event?: Event;
  animate(el: Element, keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions): Animation | null;
  onCleanup(fn: () => void): void;
}
export interface CoreEffect {
  name: string;
  kind: CoreEffectKind;
  description?: string;
  defaults?: Record<string, unknown>;
  reduced?: 'skip' | 'run';
  run(el: HTMLElement, options: any, ctx: CoreEffectContext): unknown;
}
export interface CorePlugin {
  name: string;
  effects?: CoreEffect[];
  install?(m: MotionInstance): void;
}
export type Trigger = 'click' | 'hover' | 'enter' | 'load' | 'loop' | 'manual';
export interface RevealOptions {
  stagger?: number;
  delay?: number;
  duration?: number;
  easing?: string;
  once?: boolean;
  threshold?: number;
}
export interface MotionInstance {
  readonly paused: boolean;
  readonly rate: number;
  use(...plugins: CorePlugin[]): MotionInstance;
  has(effect: string): boolean;
  effects(): string[];
  reduced(): boolean;
  animate(el: Element, keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions): Animation | null;
  play(el: HTMLElement, effect: string, options?: Record<string, unknown>, event?: Event): Promise<void>;
  bind(el: HTMLElement, effect: string, options?: Record<string, unknown> & { trigger?: Trigger; once?: boolean }): () => void;
  reveal(targets: string | Element | ArrayLike<Element>, preset?: string, options?: RevealOptions): () => void;
  pause(): void;
  resume(): void;
  setRate(rate: number): void;
  destroy(): void;
}

const T = (x: number, y: number, s = 1) => `translate(${x}px,${y}px) scale(${s})`;
/** Entrance keyframes (10.0). */
export const PRESETS: Record<string, Keyframe[]> = {
  fade: [{ opacity: 0 }, { opacity: 1 }],
  'fade-up': [{ opacity: 0, transform: T(0, 24) }, { opacity: 1, transform: 'none' }],
  'fade-down': [{ opacity: 0, transform: T(0, -24) }, { opacity: 1, transform: 'none' }],
  'fade-left': [{ opacity: 0, transform: T(24, 0) }, { opacity: 1, transform: 'none' }],
  'fade-right': [{ opacity: 0, transform: T(-24, 0) }, { opacity: 1, transform: 'none' }],
  scale: [{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'none' }],
  'zoom-in': [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }],
  'zoom-out': [{ opacity: 0, transform: 'scale(1.2)' }, { opacity: 1, transform: 'none' }],
  'blur-in': [{ opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'none' }],
  'flip-up': [{ opacity: 0, transform: 'perspective(600px) rotateX(-60deg)' }, { opacity: 1, transform: 'none' }],
};
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SKIP: string[] = ['loop', 'background', 'cursor'];

/** GPU backend order used by GPU plugins: WebGPU by default (10.0). */
export function preferredBackend(): 'webgpu' | 'webgl2' | 'canvas' {
  if (typeof navigator !== 'undefined' && (navigator as any).gpu) return 'webgpu';
  try {
    if (typeof document !== 'undefined' && document.createElement('canvas').getContext?.('webgl2')) return 'webgl2';
  } catch {
    /* no GL */
  }
  return 'canvas';
}

const list = (t: string | Element | ArrayLike<Element>): HTMLElement[] =>
  typeof t === 'string' ? (typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll<HTMLElement>(t))) : 'length' in (t as ArrayLike<Element>) && !(t instanceof Element) ? (Array.from(t as ArrayLike<Element>) as HTMLElement[]) : [t as HTMLElement];

/** Create a Motionary core instance (10.0). */
export function createMotion(config: { reducedMotion?: 'user' | 'reduce'; rate?: number } = {}): MotionInstance {
  const reg = new Map<string, CoreEffect>();
  const plugins = new Set<string>();
  const live = new Set<Animation>();
  const offs = new Set<() => void>();
  let paused = false;
  let rate = config.rate && config.rate > 0 ? config.rate : 1;
  const reduced = () => config.reducedMotion === 'reduce' || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const animate: MotionInstance['animate'] = (el, kf, o) => {
    if (typeof (el as any).animate !== 'function') return null;
    const a = el.animate(kf, o);
    if (!a) return null;
    live.add(a);
    if (rate !== 1) a.playbackRate = rate;
    if (paused) a.pause();
    const done = () => live.delete(a);
    a.finished?.then(done, done);
    return a;
  };
  const ctx = (event?: Event, cleanups: (() => void)[] = []): CoreEffectContext => ({ reduced: reduced(), sensitivity: reduced() ? 'minimal' : 'full', event, animate, onCleanup: (f) => cleanups.push(f) });
  const skip = (d: CoreEffect) => reduced() && (d.reduced ?? (SKIP.includes(d.kind) ? 'skip' : 'run')) === 'skip';
  const m: MotionInstance = {
    get paused() {
      return paused;
    },
    get rate() {
      return rate;
    },
    use(...ps) {
      for (const p of ps) {
        if (!p || plugins.has(p.name)) continue;
        plugins.add(p.name);
        for (const e of p.effects || []) if (!reg.has(e.name)) reg.set(e.name, e);
        p.install?.(m);
      }
      return m;
    },
    has: (n) => reg.has(n),
    effects: () => Array.from(reg.keys()).sort(),
    reduced,
    animate,
    async play(el, name, options = {}, event) {
      const d = reg.get(name);
      if (!d) throw new Error(`[motionary] unknown effect "${name}" — add its plugin with use()`);
      if (skip(d)) return;
      const out = d.run(el, { ...(d.defaults || {}), ...options }, ctx(event)) as any;
      if (out?.finished?.then) await out.finished.catch(() => undefined);
      else if (out?.then) await out;
    },
    bind(el, name, options = {}) {
      const { trigger = 'click', once, ...o } = options;
      const d = reg.get(name);
      if (!d) throw new Error(`[motionary] unknown effect "${name}"`);
      const stops: (() => void)[] = [];
      let current: (() => void)[] = [];
      const fire = (e?: Event) => {
        if (skip(d)) return;
        current.splice(0).forEach((f) => f());
        const out = d.run(el, { ...(d.defaults || {}), ...o }, ctx(e, current));
        if (typeof out === 'function') current.push(out as () => void);
      };
      const on = (type: string) => {
        const h = (e: Event) => fire(e);
        el.addEventListener(type, h, { once: !!once });
        stops.push(() => el.removeEventListener(type, h));
      };
      if (trigger === 'click') on('click');
      else if (trigger === 'hover') (on('pointerenter'), on('focusin'));
      else if (trigger === 'load' || trigger === 'loop') fire();
      else if (trigger === 'enter' && typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver((es) =>
          es.forEach((en) => {
            if (!en.isIntersecting) return;
            fire();
            if (once !== false) io.disconnect();
          })
        );
        io.observe(el);
        stops.push(() => io.disconnect());
      }
      const off = () => {
        stops.splice(0).forEach((f) => f());
        current.splice(0).forEach((f) => f());
        offs.delete(off);
      };
      offs.add(off);
      return off;
    },
    reveal(targets, preset = 'fade-up', o = {}) {
      const els = list(targets);
      const kf = PRESETS[preset] || PRESETS.fade;
      const show = (el: HTMLElement, i: number) => {
        el.style.removeProperty('opacity');
        animate(el, reduced() ? PRESETS.fade : kf, { duration: o.duration ?? 600, delay: (o.delay ?? 0) + (o.stagger ?? 0) * i, easing: o.easing || EASE, fill: 'backwards' });
      };
      if (typeof IntersectionObserver === 'undefined') {
        els.forEach(show);
        return () => undefined;
      }
      els.forEach((el) => (el.style.opacity = '0'));
      let batch = 0;
      const io = new IntersectionObserver(
        (es) => {
          batch = 0;
          for (const en of es) {
            if (!en.isIntersecting) continue;
            show(en.target as HTMLElement, batch++);
            if (o.once !== false) io.unobserve(en.target);
          }
        },
        { threshold: o.threshold ?? 0.15 }
      );
      els.forEach((el) => io.observe(el));
      const off = () => {
        io.disconnect();
        els.forEach((el) => el.style.removeProperty('opacity'));
        offs.delete(off);
      };
      offs.add(off);
      return off;
    },
    pause() {
      paused = true;
      live.forEach((a) => a.pause());
    },
    resume() {
      paused = false;
      live.forEach((a) => a.play());
    },
    setRate(r) {
      if (!(r > 0)) return;
      rate = r;
      live.forEach((a) => (a.playbackRate = r));
    },
    destroy() {
      Array.from(offs).forEach((f) => f());
      live.forEach((a) => a.cancel());
      live.clear();
    },
  };
  m.use({ name: 'core/presets', effects: Object.entries(PRESETS).map(([name, frames]) => ({ name, kind: 'enter', defaults: { duration: 600, delay: 0, easing: EASE }, run: (el: HTMLElement, o: any, c: CoreEffectContext) => c.animate(el, c.reduced ? PRESETS.fade : frames, { duration: o.duration, delay: o.delay, easing: o.easing, fill: 'backwards' }) })) });
  return m;
}
