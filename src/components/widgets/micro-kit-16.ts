/**
 * 17.16 micro controls: shared helpers for `mo-micro-*` (switch, checkbox, input, button, slider, segmented, stepper).
 * Every control runs on `createSpringGroup()` with the feel from its `feel` attribute, the closest `[data-mo-feel]`
 * or `--mo-feel`, and the look's `--mo-kit-speed`.
 */
import { createSpringGroup, type SpringGroup } from '../physics/spring-solver';
import { readFeel, readSpeed } from '../interaction/micro';
import { haptic } from '../click/fx';

/** A spring group owned by `host`, tuned by its feel and speed. */
export function hostSprings(host: HTMLElement, initial: Record<string, number>, onUpdate: (v: Record<string, number>) => void, extra: { always?: boolean; onRest?: () => void } = {}): SpringGroup {
  const feel = host.getAttribute('feel')?.trim() || readFeel(host);
  return createSpringGroup(initial, { feel, speed: readSpeed(host), owner: host, onUpdate, always: extra.always, onRest: extra.onRest });
}

/** A vibration when the host has the `haptics` flag. */
export function tick(host: HTMLElement, pattern: number | number[] = 8): void {
  const v = host.getAttribute('haptics');
  if (v !== null && v !== 'false') haptic(pattern);
}

/** Position of `value` between `min` and `max`, 0–1. */
export function fraction(value: number, min: number, max: number): number {
  return max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
}

/** The step-aligned value nearest to a 0–1 position. */
export function valueAt(f: number, min: number, max: number, step: number): number {
  const raw = min + Math.min(1, Math.max(0, f)) * (max - min);
  if (!(step > 0)) return raw;
  const n = Math.round((raw - min) / step);
  const digits = Math.min(10, Math.max(0, Math.ceil(-Math.log10(step)) + 1));
  return Math.min(max, Math.max(min, Number((min + n * step).toFixed(digits))));
}

/** How far past an end a drag has gone, with rubber-band resistance, in the same unit as `dimension`. */
export function overdrag(position: number, min: number, max: number, dimension: number, constant = 0.55): number {
  const d = position < min ? position - min : position > max ? position - max : 0;
  if (!d || dimension <= 0) return 0;
  const s = d < 0 ? -1 : 1;
  const a = Math.abs(d);
  return s * (1 - 1 / ((a * constant) / dimension + 1)) * dimension;
}

/** Knob stretch for a moving thumb: grows with speed (px/s), capped at `max` (0–1). */
export function stretch(speed: number, max = 0.3, per = 2400): number {
  return Math.min(max, Math.abs(Number.isFinite(speed) ? speed : 0) / per);
}

/** The two edges of a sliding indicator: the leading edge gets the quick spring, the trailing edge the slow one. */
export function edgeSprings(from: number, to: number): { left: 'snappy' | 'settle'; right: 'snappy' | 'settle' } {
  return to >= from ? { left: 'settle', right: 'snappy' } : { left: 'snappy', right: 'settle' };
}

/** Repeat delays for a held stepper button: a pause, then faster and faster (ms). */
export function holdDelays(count: number): number[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => (i === 0 ? 420 : Math.max(40, Math.round(140 * Math.pow(0.86, i - 1)))));
}

let seq = 0;
/** A document-unique id. */
export const uid = (prefix: string): string => `${prefix}-${(++seq).toString(36)}`;

/** One decimal place for CSS lengths. */
export const px = (n: number): string => `${Math.round(n * 10) / 10}px`;
