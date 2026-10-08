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

import { defineGridGlow, defineBlobs, defineWaterRipple, defineDotNetwork } from './bg-fx';
import type { UsaGridGlowElement, UsaBlobsElement, UsaWaterRippleElement, UsaDotNetworkElement } from './bg-fx';
export { defineAurora, defineParticles, defineGrain, defineMarquee, defineAcrylic };
export type { UsaAuroraElement, UsaParticlesElement, UsaGrainElement, UsaMarqueeElement, UsaAcrylicElement };
export { defineGridGlow, defineBlobs, defineWaterRipple, defineDotNetwork };
export type { UsaGridGlowElement, UsaBlobsElement, UsaWaterRippleElement, UsaDotNetworkElement };
export { fluentPreset } from './fluent';
export type { FluentPresetOptions } from './fluent';

/** Register every component of this category under its default tag. */
export function defineBackgroundComponents(): void {
  defineAurora();
  defineParticles();
  defineGrain();
  defineMarquee();
  defineAcrylic();
  defineGridGlow();
  defineBlobs();
  defineWaterRipple();
  defineDotNetwork();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-grid-glow': UsaGridGlowElement;
    'usa-blobs': UsaBlobsElement;
    'usa-water-ripple': UsaWaterRippleElement;
    'usa-dot-network': UsaDotNetworkElement;
    'usa-aurora': UsaAuroraElement;
    'usa-particles': UsaParticlesElement;
    'usa-grain': UsaGrainElement;
    'usa-marquee': UsaMarqueeElement;
    'usa-acrylic': UsaAcrylicElement;
  }
}
