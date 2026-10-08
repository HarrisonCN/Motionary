/**
 * motionary - Staggered children
 * Reveal a container's children one after another when the container scrolls
 * into view, optionally also animating children that are added later.
 */

import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate, hasDOM, prepareElement, stopAnimation, supportsObserver } from './core';

export interface StaggerOptions extends AnimateOptions {
  /** Delay between consecutive children in ms (default: 80) */
  stagger?: number;
  /**
   * Watch the container with a MutationObserver and animate children added
   * later (e.g. infinite lists). Children added after the container was
   * revealed animate when they scroll into view, staggered per batch.
   * (default: false)
   */
  observeChildren?: boolean;
}

let fallback: ScrollAnimateInstance | null = null;

/**
 * Animate the children of `container` with a stagger once it enters the
 * viewport. Returns a cleanup function. SSR-safe (no-op without a DOM).
 *
 * @example
 * const stop = staggerChildren(document.querySelector('ul'), { stagger: 60, observeChildren: true });
 */
export function staggerChildren(
  container: Element | null | undefined,
  options: StaggerOptions = {},
  instance?: ScrollAnimateInstance
): () => void {
  if (!container || !hasDOM() || !supportsObserver()) return () => undefined; // leave content visible
  const sa = instance || fallback || (fallback = createScrollAnimate());
  const { stagger = 80, delay = 0, threshold = 0.1, rootMargin = '0px', observeChildren = false, ...rest } = options;

  let items = Array.from(container.children);
  let revealed = false;
  const late: Element[] = [];
  items.forEach((child) => prepareElement(child));

  const io = new IntersectionObserver(
    (entries) => {
      if (revealed || !entries.some((entry) => entry.isIntersecting)) return;
      revealed = true;
      io.disconnect();
      items.forEach((child, i) => {
        if (child.parentNode === container) sa.animate(child, { ...rest, delay: delay + i * stagger });
      });
      items = [];
    },
    { threshold, rootMargin }
  );
  io.observe(container);

  let mo: MutationObserver | undefined;
  if (observeChildren && typeof MutationObserver !== 'undefined') {
    mo = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element) || node.parentNode !== container) return;
          if (!revealed) {
            prepareElement(node);
            items.push(node);
          } else {
            // The core engine staggers siblings relative to the batch that
            // enters the viewport together.
            late.push(node);
            sa.observe(node, { ...rest, delay, stagger, threshold, rootMargin });
          }
        });
        record.removedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          items = items.filter((el) => el !== node);
          const i = late.indexOf(node);
          if (i >= 0) {
            late.splice(i, 1);
            sa.unobserve(node);
          }
        });
      });
    });
    mo.observe(container, { childList: true });
  }

  return () => {
    io.disconnect();
    mo?.disconnect();
    // Stopped before the container was revealed: never leave the children hidden.
    if (!revealed) {
      revealed = true;
      items.forEach((child) => stopAnimation(child));
      items = [];
    }
    late.forEach((el) => sa.unobserve(el));
    late.length = 0;
  };
}
