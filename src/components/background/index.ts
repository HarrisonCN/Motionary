/**
 * use-scroll-animate/components/background — backgrounds & decoration.
 * `<usa-aurora>`, `<usa-particles>`, `<usa-grain>`, `<usa-marquee>`,
 * `<usa-acrylic>`.
 */
import { defineAurora, type UsaAuroraElement } from './aurora';
import { defineParticles, type UsaParticlesElement } from './particles';
import { defineGrain, type UsaGrainElement } from './grain';
import { defineMarquee, type UsaMarqueeElement } from './marquee';
import { defineAcrylic, type UsaAcrylicElement } from './acrylic';

export { defineAurora, defineParticles, defineGrain, defineMarquee, defineAcrylic };
export type { UsaAuroraElement, UsaParticlesElement, UsaGrainElement, UsaMarqueeElement, UsaAcrylicElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineBackgroundComponents(): void {
  defineAurora();
  defineParticles();
  defineGrain();
  defineMarquee();
  defineAcrylic();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-aurora': UsaAuroraElement;
    'usa-particles': UsaParticlesElement;
    'usa-grain': UsaGrainElement;
    'usa-marquee': UsaMarqueeElement;
    'usa-acrylic': UsaAcrylicElement;
  }
}
