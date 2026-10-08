/**
 * motionary - parallax() helper
 *
 * Moves elements at a different speed than the page while they cross the
 * viewport. Built on the same scroll progress as `progressVar` (0 when the
 * element's top enters at the bottom, 1 when its bottom leaves at the top):
 * the progress is written to a CSS custom property (default `--sa-parallax`)
 * and the offset is applied with the individual `translate` property, so it
 * composes with entrance animations and other `transform`s.
 */

import { getScrollProgress, hasDOM, prefersReducedMotion, resolveTargets, supportsObserver } from './core';

export interface ParallaxHelperOptions {
  /**
   * Total distance the element shifts while it crosses the viewport, as a
   * fraction of the viewport size (`0.2` = 20vh on the y axis). Positive values
   * lag behind the scroll (background-like), negative values move ahead of it
   * (foreground-like). (default: `0.2`)
   */
  speed?: number;
  /** `'y'` (default) or `'x'` (horizontal drift, in `vw`) */
  axis?: 'x' | 'y';
  /** CSS custom property receiving the progress (default: `'--sa-parallax'`) */
  progressVar?: string;
  /** Scroll container (default: the viewport) */
  root?: Element | null;
  /**
   * Under `prefers-reduced-motion: reduce` no offset is applied (the progress
   * variable is still written). Set to `false` to move anyway. (default: `true`)
   */
  respectReducedMotion?: boolean;
}

const PASSIVE: AddEventListenerOptions = { passive: true };

/**
 * Apply a scroll parallax to `target` (selector, Element, NodeList or array).
 * Returns a function that stops it and removes the inline styles it set.
 * SSR-safe (no-op without a DOM / IntersectionObserver).
 *
 * @example
 * const stop = parallax('.hero-bg', { speed: 0.3 });
 * parallax('.badge', { speed: -0.15, axis: 'x' });
 */
export function parallax(
  target: string | Element | NodeList | Element[],
  options: ParallaxHelperOptions = {}
): () => void {
  const els = resolveTargets(target);
  if (!els.length || !hasDOM() || !supportsObserver()) return () => undefined;
  const { speed = 0.2, axis = 'y', root = null, respectReducedMotion = true } = options;
  const name = options.progressVar ? (options.progressVar.startsWith('--') ? options.progressVar : `--${options.progressVar}`) : '--sa-parallax';
  const unit = axis === 'x' ? 'vw' : 'vh';
  const visible = new Set<Element>();
  let frame = 0;
  let listening = false;
  const scroller: EventTarget = root || window;

  const apply = (el: Element) => {
    const style = (el as HTMLElement).style;
    if (!style) return;
    const p = getScrollProgress(el, root);
    style.setProperty(name, String(+p.toFixed(4)));
    if (respectReducedMotion && prefersReducedMotion()) {
      style.removeProperty('translate');
      return;
    }
    const offset = `${+((p - 0.5) * speed * 100).toFixed(3)}${unit}`;
    style.setProperty('translate', axis === 'x' ? `${offset} 0px` : `0px ${offset}`);
  };

  const update = () => {
    frame = 0;
    visible.forEach(apply);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const listen = (on: boolean) => {
    if (on === listening) return;
    listening = on;
    const method = on ? 'addEventListener' : 'removeEventListener';
    scroller[method]('scroll', schedule, PASSIVE);
    window[method]('resize', schedule, PASSIVE);
    if (!on && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
        apply(entry.target); // report the edges even on fast scrolls
      });
      listen(visible.size > 0);
    },
    { threshold: 0, root }
  );
  els.forEach((el) => {
    apply(el); // no jump before the first observer callback
    io.observe(el);
  });

  return () => {
    io.disconnect();
    listen(false);
    visible.clear();
    els.forEach((el) => {
      const style = (el as HTMLElement).style;
      if (!style) return;
      style.removeProperty('translate');
      style.removeProperty(name);
    });
  };
}
