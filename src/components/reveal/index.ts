/**
 * use-scroll-animate/components/reveal — entrance & scroll reveal components.
 * `<usa-reveal>`, `<usa-stagger>`, `<usa-scroll-progress>`, `<usa-scrolly>`.
 */
import { defineReveal, type UsaRevealElement } from './reveal';
import { defineStagger, type UsaStaggerElement } from './stagger';
import { defineScrollProgress, type UsaScrollProgressElement } from './scroll-progress';
import { defineScrolly, type UsaScrollyElement } from './scrolly';

export { defineReveal, defineStagger, defineScrollProgress, defineScrolly };
export { readScrollProgress } from './scroll-progress';
export { REVEAL_EFFECTS, revealKeyframes } from './effects';
export type { RevealEffect } from './effects';
export type { UsaRevealElement, UsaStaggerElement, UsaScrollProgressElement, UsaScrollyElement };

/** Register every component of this category under its default tag. */
export function defineRevealComponents(): void {
  defineReveal();
  defineStagger();
  defineScrollProgress();
  defineScrolly();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-reveal': UsaRevealElement;
    'usa-stagger': UsaStaggerElement;
    'usa-scroll-progress': UsaScrollProgressElement;
    'usa-scrolly': UsaScrollyElement;
  }
}
