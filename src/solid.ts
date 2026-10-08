/**
 * use-scroll-animate - Solid integration
 *
 * ```tsx
 * import { scrollAnimate, scrollStagger, useScrollAnimate } from 'use-scroll-animate/solid';
 * false && scrollAnimate; // keep the directive import (TypeScript)
 *
 * <div use:scrollAnimate={{ animation: 'zoom-in' }}>…</div>
 * <ul use:scrollStagger={{ stagger: 60 }}>…</ul>
 * <div ref={useScrollAnimate({ animation: 'fade-in-up' })}>…</div>
 * ```
 *
 * `solid-js` is an optional peer dependency (only needed for this entry).
 */

import { createRenderEffect, onCleanup, onMount } from 'solid-js';
import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate } from './core';
import { staggerChildren, type StaggerOptions } from './stagger';

export interface SolidScrollAnimateOptions extends AnimateOptions {
  instance?: ScrollAnimateInstance;
}
export interface SolidScrollStaggerOptions extends StaggerOptions {
  instance?: ScrollAnimateInstance;
}

declare module 'solid-js' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface Directives {
      scrollAnimate: SolidScrollAnimateOptions | true;
      scrollStagger: SolidScrollStaggerOptions | true;
    }
  }
}

let shared: ScrollAnimateInstance | null = null;
const getInstance = (own?: ScrollAnimateInstance) => own || shared || (shared = createScrollAnimate());

function read<T>(accessor?: () => T | true | undefined): T {
  const v = accessor?.();
  return (v && v !== true ? v : {}) as T;
}

const CALLBACKS = ['onStart', 'onComplete', 'onEnter', 'onLeave', 'onProgress'] as const;

/** Callbacks always call the latest options' version. */
function liveCallbacks(opts: AnimateOptions, latest: () => AnimateOptions): AnimateOptions {
  const out: AnimateOptions = { ...opts };
  CALLBACKS.forEach((name) => {
    if (typeof opts[name] === 'function') (out as any)[name] = (...args: unknown[]) => (latest()[name] as any)?.(...args);
  });
  return out;
}

/**
 * Directive: `<div use:scrollAnimate={{ animation: 'fade-in' }} />`.
 * 4.0.1: the accessor is tracked — when signals it reads change, callbacks
 * update right away and the other options are re-applied if the element has
 * not animated yet (no manual `refresh()` needed).
 */
export function scrollAnimate(el: Element, accessor?: () => SolidScrollAnimateOptions | true | undefined): void {
  let latest: SolidScrollAnimateOptions = {};
  let mounted = false;
  let sa: ScrollAnimateInstance | null = null;
  const apply = () => {
    const { instance, ...opts } = latest;
    const record = sa?.getObservedElements().find((r) => r.element === el);
    if (sa && record?.animated) return; // finished: callbacks stay live
    sa?.unobserve(el);
    sa = getInstance(instance);
    sa.observe(el, liveCallbacks(opts, () => latest));
  };
  createRenderEffect(() => {
    latest = read<SolidScrollAnimateOptions>(accessor);
    if (mounted) apply();
  });
  // Wait until the element is in the document (directives/refs run before insertion).
  onMount(() => {
    mounted = true;
    apply();
  });
  onCleanup(() => sa?.unobserve(el));
}

/** Directive: `<ul use:scrollStagger={{ stagger: 60, observeChildren: true }} />` */
export function scrollStagger(el: Element, accessor?: () => SolidScrollStaggerOptions | true | undefined): void {
  const { instance, ...opts } = read<SolidScrollStaggerOptions>(accessor);
  let stop: (() => void) | undefined;
  onMount(() => {
    stop = staggerChildren(el, opts, getInstance(instance));
  });
  onCleanup(() => stop?.());
}

/** Primitive returning a `ref` callback: `<div ref={useScrollAnimate({ animation: 'fade-in-up' })} />` */
export function useScrollAnimate(options: SolidScrollAnimateOptions = {}): (el: Element) => void {
  let el: Element | undefined;
  const { instance, ...opts } = options;
  const sa = getInstance(instance);
  onMount(() => el && sa.observe(el, opts));
  onCleanup(() => el && sa.unobserve(el));
  return (node: Element) => {
    el = node;
  };
}
