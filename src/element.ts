/**
 * use-scroll-animate - `<scroll-animate>` Web Component
 *
 * ```html
 * <script type="module">
 *   import { defineScrollAnimate } from 'use-scroll-animate/element';
 *   defineScrollAnimate(); // registers <scroll-animate>
 * </script>
 * <scroll-animate animation="fade-in-up" duration="800">…</scroll-animate>
 * ```
 *
 * Attributes mirror the `data-sa-*` attributes without the prefix
 * (`animation`, `duration`, `delay`, `easing`, `threshold`, `root-margin`,
 * `offset`, `once`, `repeat`, `engine`, `view-range`, `progress`,
 * `progress-var`, `exit`). The element dispatches `sa:enter`,
 * `sa:leave`, `sa:start`, `sa:complete` and `sa:progress` (`detail.progress`)
 * events. It renders as `display: block` unless styled otherwise.
 */

import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate, readOptions } from './core';

const ATTRIBUTES = [
  'animation', 'duration', 'delay', 'easing', 'threshold', 'root-margin', 'offset', 'once', 'repeat',
  'stagger', 'engine', 'view-range', 'progress', 'progress-var', 'exit',
];

let shared: ScrollAnimateInstance | null = null;

/**
 * Register the custom element (default tag `scroll-animate`) and return its
 * class. Safe to call more than once and on the server (returns `undefined`
 * without `customElements`).
 */
export function defineScrollAnimate(
  tagName = 'scroll-animate',
  instance?: ScrollAnimateInstance
): CustomElementConstructor | undefined {
  if (typeof customElements === 'undefined' || typeof HTMLElement === 'undefined') return undefined;
  const existing = customElements.get(tagName);
  if (existing) return existing;
  const getInstance = () => instance || shared || (shared = createScrollAnimate());

  class ScrollAnimateElement extends HTMLElement {
    static get observedAttributes(): string[] {
      return ATTRIBUTES;
    }

    private observing = false;

    private emit(type: string, detail?: unknown): void {
      this.dispatchEvent(new CustomEvent(`sa:${type}`, { detail }));
    }

    /** Options parsed from the element's attributes (plus event callbacks). */
    get options(): AnimateOptions {
      const opts = readOptions((name) => {
        const v = this.getAttribute(name);
        return v === null ? undefined : v;
      });
      return {
        ...opts,
        onEnter: () => this.emit('enter'),
        onLeave: () => this.emit('leave'),
        onStart: () => this.emit('start'),
        onComplete: () => this.emit('complete'),
        ...(this.hasAttribute('progress') || this.hasAttribute('progress-var')
          ? { onProgress: (_el: Element, progress: number) => this.emit('progress', { progress }) }
          : {}),
      };
    }

    connectedCallback(): void {
      if (!this.style.display && typeof getComputedStyle === 'function' && (getComputedStyle(this).display || 'inline') === 'inline') {
        this.style.display = 'block';
      }
      getInstance().observe(this, this.options);
      this.observing = true;
    }

    disconnectedCallback(): void {
      getInstance().unobserve(this);
      this.observing = false;
    }

    attributeChangedCallback(): void {
      if (!this.observing) return;
      const sa = getInstance();
      const record = sa.getObservedElements().find((r) => r.element === this);
      // Already animated: keep it as it is (avoids re-hiding visible content).
      if (record && !record.animated) {
        sa.unobserve(this);
        sa.observe(this, this.options);
      }
    }
  }

  customElements.define(tagName, ScrollAnimateElement);
  return ScrollAnimateElement;
}
