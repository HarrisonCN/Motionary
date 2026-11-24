/**
 * 17.10 "Kit": small helpers shared by the navigation, data, media and motion-surface widgets
 * (sidebar, scrollspy, pricing, data-table, filter-chips, lightbox, image-trail, path-motion, …).
 * Original implementations; see docs/kit-17-10.md.
 */
import { animateWithMotion, caf, now, prefersReducedMotion, raf } from '../base';

/** Element rectangles keyed by element, for a FLIP step. */
export function measure(els: Iterable<Element>): Map<Element, DOMRect> {
  const m = new Map<Element, DOMRect>();
  for (const el of els) m.set(el, el.getBoundingClientRect());
  return m;
}

/**
 * FLIP: after the DOM has changed, animate each element from where it was (`before`) to where it is now.
 * Elements that were not measured before fade and scale in. Returns the started animations.
 */
export function flip(before: Map<Element, DOMRect>, els: Iterable<Element>, duration = 420): Animation[] {
  if (prefersReducedMotion()) return [];
  const out: Animation[] = [];
  for (const el of els) {
    if ((el as HTMLElement).hidden) continue;
    const was = before.get(el);
    const is = el.getBoundingClientRect();
    if (!is.width && !is.height) continue;
    const frames: Keyframe[] = was
      ? [{ transform: `translate(${was.left - is.left}px, ${was.top - is.top}px)` }, { transform: 'none' }]
      : [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }];
    if (was && Math.abs(was.left - is.left) < 0.5 && Math.abs(was.top - is.top) < 0.5) continue;
    const a = animateWithMotion(el, frames, { duration, easing: 'cubic-bezier(.22,1,.36,1)' });
    if (a) out.push(a);
  }
  return out;
}

/** Ease-out cubic. */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Tween a number from `from` to `to` over `ms`, calling `update` each frame (reduced motion: one call with `to`).
 * Returns a cancel function.
 */
export function tween(from: number, to: number, ms: number, update: (v: number, done: boolean) => void, el?: Element): () => void {
  if (prefersReducedMotion() || ms <= 0 || from === to) {
    update(to, true);
    return () => {};
  }
  const start = now();
  let id = 0;
  const step = () => {
    const t = Math.min(1, (now() - start) / ms);
    update(from + (to - from) * easeOut(t), t >= 1);
    if (t < 1) id = raf(step, el);
  };
  id = raf(step, el);
  return () => caf(id);
}

/** A number formatted with grouping and at most `digits` decimals (locale-aware where available). */
export function formatNumber(n: number, digits = 0, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);
  } catch {
    return String(Math.round(n * 10 ** digits) / 10 ** digits);
  }
}

/** The element's direct element children, minus the ones a widget created (class starts with `usa-`). */
export function ownChildren(host: Element): HTMLElement[] {
  return Array.from(host.children).filter((c) => !(c as HTMLElement).className?.toString().startsWith('usa-')) as HTMLElement[];
}

/** A finite number from a data attribute, or the fallback. */
export function dataNum(el: Element, name: string, fallback: number): number {
  const v = el.getAttribute(`data-${name}`);
  const n = v?.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

/** Parse a comma-separated list, trimmed, empty items dropped, at most `max` items. */
export function list(text: string, max = 50): string[] {
  return text.split(',').map((s) => s.trim()).filter(Boolean).slice(0, max);
}

/** An image address that is safe to load: http(s), data:image, or a relative / root-relative path; otherwise ''. */
export function safeImageUrl(u: string): string {
  const s = String(u ?? '').trim();
  return /^(https?:|data:image\/|\/|\.{1,2}\/|[^:]*$)/i.test(s) ? s : '';
}

/** A CSS color the browser accepts, or ''. Without `CSS.supports` only plain words, hex, rgb/hsl/oklch() pass. */
export function cleanColor(value: string): string {
  const v = String(value ?? '').trim();
  if (!v || v.length > 64 || /[;{}<>]|url\(/i.test(v)) return '';
  if (typeof CSS !== 'undefined' && CSS.supports) return CSS.supports('color', v) ? v : '';
  return /^(#[0-9a-f]{3,8}|[a-z]+|(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\([^()]*\))$/i.test(v) ? v : '';
}
