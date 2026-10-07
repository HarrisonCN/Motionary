/**
 * use-scroll-animate/components/interaction — micro-interactions.
 * `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>`, `<usa-spotlight>`,
 * `<usa-press>`, `<usa-toggle>`.
 */
import { defineRipple, type UsaRippleElement } from './ripple';
import { defineMagnetic, type UsaMagneticElement } from './magnetic';
import { defineTilt, type UsaTiltElement } from './tilt';
import { defineSpotlight, type UsaSpotlightElement } from './spotlight';
import { definePress, type UsaPressElement } from './press';
import { defineToggle, type UsaToggleElement } from './toggle';

export { defineRipple, defineMagnetic, defineTilt, defineSpotlight, definePress, defineToggle };
export type { UsaRippleElement, UsaMagneticElement, UsaTiltElement, UsaSpotlightElement, UsaPressElement, UsaToggleElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineInteractionComponents(): void {
  defineRipple();
  defineMagnetic();
  defineTilt();
  defineSpotlight();
  definePress();
  defineToggle();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-ripple': UsaRippleElement;
    'usa-magnetic': UsaMagneticElement;
    'usa-tilt': UsaTiltElement;
    'usa-spotlight': UsaSpotlightElement;
    'usa-press': UsaPressElement;
    'usa-toggle': UsaToggleElement;
  }
}
