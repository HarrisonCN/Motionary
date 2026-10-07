import { prefersReducedMotion, adoptStyles } from '../base';
import css from './transitions.css?raw';

/**
 * Page & app-wide transitions (v2.7), built on the View Transitions API
 * (Chromium: Chrome, Edge, Electron, WebView2) with graceful fallbacks.
 *
 * - `pageTransition(update, { effect })` — SPA route changes: `fade`,
 *   `slide` (`slide-left` / `slide-right` / `slide-up`), `circle` (reveal
 *   from `x`, `y`), `blinds`, `pixel` (stepped dissolve), `zoom`.
 * - `enableMpaTransitions(effect)` — the same effects for multi-page sites
 *   (`@view-transition { navigation: auto }`); call it on every page.
 * - `themeTransition(apply, { x, y })` — a circle-reveal theme switch.
 *
 * Without View Transitions (Firefox, older Safari) or under reduced motion
 * the update runs immediately (`fade` falls back to a short cross-fade of
 * `fallback` when given).
 */
export const PAGE_EFFECTS = ['fade', 'slide', 'slide-left', 'slide-right', 'slide-up', 'circle', 'blinds', 'pixel', 'zoom'] as const;
export type PageEffect = (typeof PAGE_EFFECTS)[number];

export interface PageTransitionOptions {
  effect?: PageEffect;
  /** Circle origin in client px (default: viewport centre / last pointer). */
  x?: number;
  y?: number;
  /** Duration in ms (default 600). */
  duration?: number;
  /** Element to cross-fade when View Transitions are unavailable. */
  fallback?: Element | null;
}

let lastPointer: [number, number] | null = null;
function trackPointer(): void {
  if (typeof document === 'undefined' || (trackPointer as any).done) return;
  (trackPointer as any).done = true;
  document.addEventListener('pointerdown', (e) => (lastPointer = [e.clientX, e.clientY]), { capture: true, passive: true });
}

/** `true` when `document.startViewTransition` exists. */
export const supportsViewTransitions = (): boolean => typeof document !== 'undefined' && typeof (document as any).startViewTransition === 'function';

function setVars(o: PageTransitionOptions): void {
  const d = document.documentElement;
  const W = window.innerWidth || 1024;
  const H = window.innerHeight || 768;
  const [x, y] = o.x !== undefined && o.y !== undefined ? [o.x, o.y] : lastPointer || [W / 2, H / 2];
  const r = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
  d.style.setProperty('--usa-pt-x', `${x}px`);
  d.style.setProperty('--usa-pt-y', `${y}px`);
  d.style.setProperty('--usa-pt-r', `${Math.ceil(r)}px`);
  d.style.setProperty('--usa-pt-duration', `${o.duration ?? 600}ms`);
}

/** Run `update` (sync or async) as an animated page transition. Resolves when it is done. */
export async function pageTransition(update: () => unknown, options: PageTransitionOptions = {}): Promise<void> {
  if (typeof document === 'undefined') {
    await update();
    return;
  }
  adoptStyles('page-transitions', css);
  trackPointer();
  const effect = options.effect || 'fade';
  if (prefersReducedMotion() || !supportsViewTransitions()) {
    await update();
    const f = options.fallback as HTMLElement | null | undefined;
    if (f && typeof f.animate === 'function' && !prefersReducedMotion()) await f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }).finished.catch(() => undefined);
    return;
  }
  const d = document.documentElement;
  setVars(options);
  d.setAttribute('data-usa-pt', effect);
  try {
    const vt = (document as any).startViewTransition(() => update());
    await vt.finished;
  } finally {
    d.removeAttribute('data-usa-pt');
  }
}

/** Opt a multi-page site into cross-document view transitions with `effect`. */
export function enableMpaTransitions(effect: PageEffect = 'fade', duration = 450): void {
  if (typeof document === 'undefined') return;
  adoptStyles('page-transitions', css);
  adoptStyles('mpa-transitions', prefersReducedMotion() ? '' : '@view-transition{navigation:auto}');
  const d = document.documentElement;
  d.setAttribute('data-usa-pt', effect);
  setVars({ duration });
}

/**
 * Switch theme with a circle reveal from (`x`, `y`) (default: last pointer).
 * `apply` flips your theme (e.g. toggles a class / `data-theme`).
 */
export function themeTransition(apply: () => unknown, options: Omit<PageTransitionOptions, 'effect'> = {}): Promise<void> {
  return pageTransition(apply, { ...options, effect: 'circle', duration: options.duration ?? 650 });
}
