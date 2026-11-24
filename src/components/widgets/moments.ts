/**
 * 17.9 "Moments": shared helpers for the small monochrome micro-interaction widgets
 * (`mo-eclipse-toggle`, `mo-hue-orbit`, `mo-notch-slider`, `mo-bulge-volume`, `mo-copy-button`, `mo-tile-relay`).
 * Original implementations of interaction ideas seen in public X posts (see docs/moments-tactile.md); no third-party code.
 */

/** A DOM element with an optional class and text. */
export function make<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

/** A finite number clamped to [min, max]; anything else falls back to `fallback` (also clamped). */
export function bound(n: number, min: number, max: number, fallback = min): number {
  const v = Number.isFinite(n) ? n : fallback;
  return Math.min(max, Math.max(min, v));
}

/** Round `n` to the precision of `step` (avoids 0.30000000000000004 on decimal steps). */
export function roundTo(n: number, step: number): number {
  const s = Math.abs(step) || 1;
  const digits = Math.min(10, Math.max(0, Math.ceil(-Math.log10(s)) + 1));
  return Number((Math.round(n / s) * s).toFixed(digits));
}

/** Evenly spaced positions between min and max (both included), `count` ≥ 2. */
export function notchValues(min: number, max: number, count: number): number[] {
  const n = Math.max(2, Math.min(21, Math.round(count)));
  return Array.from({ length: n }, (_, i) => min + ((max - min) * i) / (n - 1));
}

/** The notch within `reach` of `value`, or `null`. */
export function nearestNotch(value: number, notches: number[], reach: number): number | null {
  let best: number | null = null;
  for (const n of notches) if (Math.abs(n - value) <= reach && (best === null || Math.abs(n - value) < Math.abs(best - value))) best = n;
  return best;
}

/** The shortest angle (degrees) to turn from `from` to `to`, added to `from` — keeps an orbit turning the short way round. */
export function shortestTurn(from: number, to: number): number {
  const d = ((((to - from) % 360) + 540) % 360) - 180;
  return from + d;
}

let uid = 0;
/** A per-page unique id with a prefix. */
export const uniqueId = (prefix: string): string => `${prefix}-${++uid}`;
