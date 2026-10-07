/**
 * use-scroll-animate/components/cards — card effects (v2.4).
 * `<usa-card effect="flip | holo | glass | border-glow | conic-border | lift |
 * spotlight | sheen | parallax-layers | expand">` (combinable),
 * `<usa-card-stack>` (swipeable deck), `<usa-sticky-stack>` (stacking on
 * scroll) and `<usa-carousel-3d>`.
 */
import { defineCard, type UsaCardElement } from './card';
import { defineCardStack, type UsaCardStackElement } from './card-stack';
import { defineStickyStack, type UsaStickyStackElement } from './sticky-stack';
import { defineCarousel3d, type UsaCarousel3dElement } from './carousel-3d';

export { defineCard, defineCardStack, defineStickyStack, defineCarousel3d };
export { CARD_EFFECTS } from './card';
export type { CardEffect } from './card';
export type { UsaCardElement, UsaCardStackElement, UsaStickyStackElement, UsaCarousel3dElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineCardComponents(): void {
  defineCard();
  defineCardStack();
  defineStickyStack();
  defineCarousel3d();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-card': UsaCardElement;
    'usa-card-stack': UsaCardStackElement;
    'usa-sticky-stack': UsaStickyStackElement;
    'usa-carousel-3d': UsaCarousel3dElement;
  }
}
