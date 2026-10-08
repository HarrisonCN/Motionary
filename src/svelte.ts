/**
 * motionary - Svelte integration
 *
 * Svelte actions (no import from `svelte` needed, works with Svelte 3, 4 and 5):
 *
 * ```svelte
 * <script>
 *   import { scrollAnimate, scrollStagger } from 'motionary/svelte';
 * </script>
 * <div use:scrollAnimate={{ animation: 'fade-in-up', duration: 800 }}>…</div>
 * <ul use:scrollStagger={{ stagger: 60 }}>…</ul>
 * ```
 */

import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate } from './core';
import { staggerChildren, type StaggerOptions } from './stagger';

export interface ScrollAnimateActionOptions extends AnimateOptions {
  /** Instance to register with (default: a shared instance created on first use) */
  instance?: ScrollAnimateInstance;
}

export interface ScrollStaggerActionOptions extends StaggerOptions {
  instance?: ScrollAnimateInstance;
}

/** Shape of a Svelte action's return value. */
export interface ActionReturn<P> {
  update?: (parameter: P) => void;
  destroy?: () => void;
}

let shared: ScrollAnimateInstance | null = null;
const getInstance = (own?: ScrollAnimateInstance) => own || shared || (shared = createScrollAnimate());

const CALLBACKS = ['onStart', 'onComplete', 'onEnter', 'onLeave', 'onProgress'] as const;

/** Callbacks always call the latest parameter's version. */
function liveCallbacks(opts: AnimateOptions, latest: () => AnimateOptions): AnimateOptions {
  const out: AnimateOptions = { ...opts };
  CALLBACKS.forEach((name) => {
    if (typeof opts[name] === 'function') (out as any)[name] = (...args: unknown[]) => (latest()[name] as any)?.(...args);
  });
  return out;
}

/**
 * Animate `node` when it scrolls into view. Changing the parameter updates the
 * callbacks right away; other options are applied if the element has not
 * animated yet.
 */
export function scrollAnimate(
  node: Element,
  options: ScrollAnimateActionOptions = {}
): ActionReturn<ScrollAnimateActionOptions | undefined> {
  let current = options;
  const { instance, ...opts } = options;
  const sa = getInstance(instance);
  sa.observe(node, liveCallbacks(opts, () => current));

  return {
    update(next = {}) {
      current = next;
      const record = sa.getObservedElements().find((r) => r.element === node);
      if (record && !record.animated) {
        const { instance: _ignored, ...nextOpts } = next;
        sa.unobserve(node);
        sa.observe(node, liveCallbacks(nextOpts, () => current));
      }
    },
    destroy() {
      sa.unobserve(node);
    },
  };
}

/** Stagger the children of `node` when it scrolls into view (`observeChildren: true` also animates children added later). */
export function scrollStagger(
  node: Element,
  options: ScrollStaggerActionOptions = {}
): ActionReturn<ScrollStaggerActionOptions | undefined> {
  const { instance, ...opts } = options;
  const stop = staggerChildren(node, opts, getInstance(instance));
  return { destroy: stop };
}
