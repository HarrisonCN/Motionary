/**
 * use-scroll-animate - Sequence / timeline helper
 * Chain animations on several targets, one after another (or overlapping).
 */

import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate, hasDOM, prepareElement, resolveTargets, stopAnimation, supportsObserver } from './core';

export interface SequenceStep extends AnimateOptions {
  /** Selector, Element, NodeList or Element[] to animate in this step */
  target: string | Element | NodeList | Element[];
  /** Pause (ms) after the previous step ends before this one starts. Negative values overlap. (default: 0) */
  gap?: number;
  /** Absolute start time (ms) on the timeline; overrides `gap` */
  at?: number;
}

export interface SequenceOptions extends AnimateOptions {
  /** Play automatically (once) when this element/selector enters the viewport */
  trigger?: string | Element;
  /** Instance whose global config (easing, classes, `disabled`) is used */
  instance?: ScrollAnimateInstance;
}

export interface SequenceController {
  /** Play (or replay) the timeline. Resolves when every step has completed, or on `cancel()`. */
  play(): Promise<void>;
  /** Stop the trigger and running animations; elements are left visible. */
  cancel(): void;
  /** Total duration of the timeline in ms (computed for the current DOM). */
  duration(): number;
}

let fallback: ScrollAnimateInstance | null = null;
let warned = false;

type Planned = { el: Element; opts: AnimateOptions; end: number };

function plan(steps: SequenceStep[], defaults: AnimateOptions): Planned[] {
  const out: Planned[] = [];
  let cursor = 0;
  steps.forEach((step) => {
    const { target, gap = 0, at, ...stepOpts } = step;
    const opts = { ...defaults, ...stepOpts };
    const duration = opts.duration ?? 600;
    const start = Math.max(0, at ?? cursor + gap) + (opts.delay ?? 0);
    let end = Math.max(cursor, start);
    resolveTargets(target).forEach((el, i) => {
      const delay = start + i * (opts.stagger ?? 0);
      out.push({ el, opts: { ...opts, duration, delay, stagger: 0 }, end: delay + duration });
      end = Math.max(end, delay + duration);
    });
    cursor = end;
  });
  return out;
}

/**
 * Build a timeline of animations.
 *
 * @deprecated since 3.9, removed in 4.0 — use `timeline()` (`.to(target, preset, { at: '-=300' })`).
 *
 * @example
 * sequence([
 *   { target: '.title', animation: 'fade-in-up' },
 *   { target: '.subtitle', animation: 'blur-in', gap: -300 },   // overlap by 300ms
 *   { target: '.card', animation: 'scale-up', stagger: 80 },
 * ], { trigger: '.hero' });
 */
export function sequence(steps: SequenceStep[], options: SequenceOptions = {}): SequenceController {
  if (!warned && typeof console !== 'undefined') {
    warned = true;
    console.warn("[use-scroll-animate] sequence() is deprecated and will be removed in 4.0 — use timeline() from 'use-scroll-animate/components/timeline' (also exported from 'use-scroll-animate' in 4.0). See docs/upgrading-4.md.");
  }
  const { trigger, instance, ...defaults } = options;
  const sa = () => instance || fallback || (fallback = createScrollAnimate());
  let io: IntersectionObserver | undefined;
  let active: Planned[] = [];
  let settle: (() => void) | undefined;
  // Targets hidden while waiting for `trigger`; revealed if cancelled before it fires.
  let prepared: Element[] = [];

  const controller: SequenceController = {
    play() {
      controller.cancel();
      if (!hasDOM()) return Promise.resolve();
      active = plan(steps, defaults);
      return new Promise<void>((resolve) => {
        let left = active.length;
        settle = () => {
          settle = undefined;
          resolve();
        };
        if (!left) return settle();
        const run = active;
        run.forEach(({ el, opts }) => {
          const done = opts.onComplete;
          sa().animate(el, {
            ...opts,
            onComplete: (node) => {
              done?.(node);
              if (run === active && --left === 0) settle?.();
            },
          });
        });
      });
    },

    cancel() {
      io?.disconnect();
      io = undefined;
      prepared.forEach((el) => stopAnimation(el));
      prepared = [];
      active.forEach(({ el }) => stopAnimation(el));
      active = [];
      settle?.();
    },

    duration() {
      return plan(steps, defaults).reduce((max, p) => Math.max(max, p.end), 0);
    },
  };

  if (trigger && hasDOM() && supportsObserver()) {
    const el = resolveTargets(trigger)[0];
    if (el) {
      prepared = plan(steps, defaults).map(({ el: target }) => target);
      prepared.forEach((target) => prepareElement(target));
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          io = undefined;
          prepared = []; // play() takes over from here
          controller.play();
        },
        { threshold: defaults.threshold ?? 0.1, rootMargin: defaults.rootMargin ?? '0px' }
      );
      io.observe(el);
    }
  }

  return controller;
}
