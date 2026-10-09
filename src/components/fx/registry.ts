/**
 * 5.0 — unified plugin-style effect registration. Every effect (built-in or
 * yours) is a plain object registered once and played the same way:
 * `playEffect(el, name)`, `bindEffect(el, name, { trigger })` or
 * `<usa-fx effect="name" trigger="click">`. Effects get a context that
 * already applies reduced motion, motion sensitivity, intensity and the
 * animation budget.
 */
import { animateWithMotion, prefersReducedMotion, getMotionSensitivity, type MotionSensitivity, type Cleanup } from '../base';

export const EFFECT_KINDS = ['enter', 'exit', 'attention', 'click', 'hover', 'card', 'loop', 'page', 'background', 'text', 'cursor', 'scroll'] as const;
export type EffectKind = (typeof EFFECT_KINDS)[number];

export const EFFECT_TRIGGERS = ['click', 'hover', 'enter', 'load', 'loop', 'manual'] as const;
export type EffectTrigger = (typeof EFFECT_TRIGGERS)[number];

export interface EffectContext {
  /** Reduced motion applies (OS setting, `minimal` / `static` sensitivity). */
  readonly reduced: boolean;
  readonly sensitivity: MotionSensitivity;
  /** The triggering event (pointer position for click effects), if any. */
  readonly event?: Event;
  /** `el.animate()` with the library's motion rules (may return `null`). */
  animate(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null;
  /** Register teardown for long-running effects (loops, listeners). */
  onCleanup(fn: Cleanup): void;
}

export interface EffectDefinition<O extends Record<string, unknown> = Record<string, any>> {
  /** Unique, kebab-case. */
  name: string;
  kind: EffectKind;
  /** One line for docs and the gallery. */
  description?: string;
  /** Option defaults (merged under the caller's options). */
  defaults?: Partial<O>;
  /**
   * Under reduced motion: `'skip'` (do nothing — default for loop, background
   * and cursor effects) or `'run'` (run with `ctx.reduced === true`, the
   * effect degrades itself — default for everything else).
   */
  reduced?: 'skip' | 'run';
  /** Play the effect. Return an Animation / Promise to be awaited, or a cleanup. */
  run(el: HTMLElement, options: O, ctx: EffectContext): void | Cleanup | Animation | null | Promise<unknown>;
}

// 6.2: one table per page (Symbol.for), shared by every bundle that registers effects —
// e.g. dist/components.umd.js and dist/widgets.umd.js on the same page.
const REG_KEY = /*#__PURE__*/ Symbol.for('use-scroll-animate.effects');
// 11.1: created on first use, so importing this module writes nothing to globalThis.
const fxTable = (): Map<string, EffectDefinition> => ((globalThis as any)[REG_KEY] ||= new Map<string, EffectDefinition>());

/** Register an effect (throws on a duplicate name unless `override`). Returns an unregister function. */
export function registerEffect<O extends Record<string, unknown>>(def: EffectDefinition<O>, opts: { override?: boolean } = {}): () => void {
  if (!/^[a-z][a-z0-9-]*$/.test(def.name)) throw new Error(`[motionary] invalid effect name "${def.name}"`);
  if (!EFFECT_KINDS.includes(def.kind)) throw new Error(`[motionary] unknown effect kind "${def.kind}"`);
  if (fxTable().has(def.name) && !opts.override) throw new Error(`[motionary] effect "${def.name}" is already registered`);
  fxTable().set(def.name, def as unknown as EffectDefinition);
  return () => {
    if (fxTable().get(def.name) === (def as unknown)) fxTable().delete(def.name);
  };
}

/** Register several effects at once (already-registered names are skipped). */
export function registerEffects(defs: EffectDefinition<any>[]): void {
  for (const d of defs) if (!fxTable().has(d.name)) registerEffect(d);
}

export const getEffect = (name: string): EffectDefinition | undefined => fxTable().get(name);
export const hasEffect = (name: string): boolean => fxTable().has(name);
/** Registered effects (optionally of one kind), sorted by name. */
export function listEffects(kind?: EffectKind): EffectDefinition[] {
  return Array.from(fxTable().values())
    .filter((d) => !kind || d.kind === kind)
    .sort((a, b) => a.name.localeCompare(b.name));
}

const SKIP_BY_DEFAULT: EffectKind[] = ['loop', 'background', 'cursor'];

function context(event?: Event): EffectContext & { cleanups: Cleanup[] } {
  const cleanups: Cleanup[] = [];
  return {
    reduced: prefersReducedMotion(),
    sensitivity: getMotionSensitivity(),
    event,
    animate: animateWithMotion,
    onCleanup: (fn) => cleanups.push(fn),
    cleanups,
  };
}

/**
 * Play a registered effect once on `el`. Resolves when it finishes (or
 * immediately for fire-and-forget effects). Unknown names reject.
 */
export async function playEffect(el: HTMLElement, name: string, options: Record<string, unknown> = {}, event?: Event): Promise<void> {
  const def = fxTable().get(name);
  if (!def) throw new Error(`[motionary] unknown effect "${name}" — registered: ${Array.from(fxTable().keys()).join(', ')}`);
  const ctx = context(event);
  if (ctx.reduced && (def.reduced ?? (SKIP_BY_DEFAULT.includes(def.kind) ? 'skip' : 'run')) === 'skip') return;
  const out = def.run(el, { ...(def.defaults || {}), ...options }, ctx);
  if (out && typeof (out as Animation).finished?.then === 'function') await (out as Animation).finished.catch(() => undefined);
  else if (out && typeof (out as Promise<unknown>).then === 'function') await out;
}

/**
 * Bind an effect to a trigger on `el`: `click`, `hover` (pointerenter / focus),
 * `enter` (scrolls into view; `once` by default), `load` (now), `loop`
 * (starts now, cleanup stops it) or `manual` (nothing). Returns an unbind.
 */
export function bindEffect(el: HTMLElement, name: string, options: Record<string, unknown> & { trigger?: EffectTrigger; once?: boolean } = {}): Cleanup {
  const { trigger = 'click', once, ...opts } = options;
  const def = fxTable().get(name);
  if (!def) throw new Error(`[motionary] unknown effect "${name}"`);
  const offs: Cleanup[] = [];
  let current: Cleanup | null = null;
  const fire = (e?: Event) => {
    const ctx = context(e);
    if (ctx.reduced && (def.reduced ?? (SKIP_BY_DEFAULT.includes(def.kind) ? 'skip' : 'run')) === 'skip') return;
    // A persistent effect (returns a cleanup) replaces its previous run instead of stacking.
    current?.();
    current = null;
    const out = def.run(el, { ...(def.defaults || {}), ...opts }, ctx);
    const stops = [...ctx.cleanups, ...(typeof out === 'function' ? [out as Cleanup] : [])];
    if (stops.length) current = () => stops.splice(0).forEach((f) => f());
  };
  offs.push(() => {
    current?.();
    current = null;
  });
  const on = (type: string, opt?: AddEventListenerOptions) => {
    el.addEventListener(type, fire, opt);
    offs.push(() => el.removeEventListener(type, fire, opt));
  };
  if (trigger === 'click') on('click', { once: !!once });
  else if (trigger === 'hover') (on('pointerenter'), on('focusin'));
  else if (trigger === 'load' || trigger === 'loop') fire();
  else if (trigger === 'enter' && typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries)
        if (en.isIntersecting) {
          fire();
          if (once !== false) io.disconnect();
        }
    }, { threshold: 0.15 });
    io.observe(el);
    offs.push(() => io.disconnect());
  }
  return () => offs.splice(0).reverse().forEach((f) => f());
}
