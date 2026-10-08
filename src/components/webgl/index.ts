/**
 * use-scroll-animate/components/webgl — lightweight canvas / WebGL (v3.4).
 * `<usa-shader>` (shader backgrounds), `<usa-distort>` (hover image
 * distortion), `<usa-liquid>` (ripple images) on a tiny single-quad runner
 * (`glQuad()`), with graceful fallbacks when WebGL is unavailable.
 */
import { defineShader, defineDistort, defineLiquid, definePostFx, type UsaGLElement } from './elements';

export { defineShader, defineDistort, defineLiquid, definePostFx };
export { PARTICLE_PRESETS, POST_EFFECTS, postFxShader, GL_FALLBACKS, glFallbackCss, glGovernor, watchPowerSaver } from './presets';
export type { ParticlePreset, PostEffect, GLGovernor, GLGovernorOptions } from './presets';
export { glQuad, supportsWebGL, fragmentSource, SHADERS } from './gl';
export type { GLQuad } from './gl';
export type { UsaGLElement };

/** Register every component of this category under its default tag. */
export function defineWebglComponents(): void {
  defineShader();
  defineDistort();
  defineLiquid();
  definePostFx();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-shader': UsaGLElement;
    'usa-distort': UsaGLElement;
    'usa-liquid': UsaGLElement;
    'usa-post-fx': UsaGLElement;
  }
}
