/**
 * motionary - Vue 3 Integration
 * Provides useScrollAnimate and useScrollStagger composables for Vue 3 applications.
 *
 * A thin wrapper around the core engine, so it shares its behaviour: `once`,
 * `offset`, custom easing functions, progress, `prefers-reduced-motion`
 * support, and cleanup on unmount.
 */

import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate } from './core';
import { staggerChildren, type StaggerOptions } from './stagger';

/** Support refs on components (`$el`) as well as plain elements. */
function unwrap(value: unknown): Element | null {
  if (value && typeof Element !== 'undefined' && !(value instanceof Element) && (value as any).$el instanceof Element) {
    return (value as any).$el as Element;
  }
  return (value as Element | null) || null;
}

export function createVueComposables(Vue: {
  ref: <T>(value: T | null) => { value: T | null };
  onMounted: (fn: () => void) => void;
  onUnmounted: (fn: () => void) => void;
}) {
  // Created lazily on the client so importing on the server is side-effect free.
  let instance: ScrollAnimateInstance | null = null;
  const getInstance = () => instance || (instance = createScrollAnimate());

  function useScrollAnimate(options: AnimateOptions = {}) {
    const animateRef = Vue.ref<Element>(null);
    let el: Element | null = null;

    Vue.onMounted(() => {
      const target = unwrap(animateRef.value);
      if (!target) return;
      el = target;
      getInstance().observe(el, options);
    });

    Vue.onUnmounted(() => {
      if (el) getInstance().unobserve(el);
      el = null;
    });

    return { animateRef };
  }

  /** Stagger the children of `staggerRef`; `observeChildren: true` also animates children added later. */
  function useScrollStagger(options: StaggerOptions = {}) {
    const staggerRef = Vue.ref<Element>(null);
    let stop: (() => void) | undefined;

    Vue.onMounted(() => {
      const target = unwrap(staggerRef.value);
      if (target) stop = staggerChildren(target, options, getInstance());
    });

    Vue.onUnmounted(() => {
      stop?.();
      stop = undefined;
    });

    return { staggerRef };
  }

  return { useScrollAnimate, useScrollStagger };
}
