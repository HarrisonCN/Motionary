/**
 * The 6.x effect packs, one entry each (`motionary/components/fx-gpu`, …) so
 * their size budgets stay separate. This module (`registerFx2()`) registers
 * them all — used by dist/widgets.umd.js and the showcase.
 */
import type { EffectDefinition } from '../fx/registry';
import { GPU_FX, registerGpuEffects } from './gpu';
import { TEXT3_FX, registerTextEffects3, splitChars } from './text3';
import { LIGHT_FX, registerLightEffects, trackPointer } from './light';
import { DEPTH3_FX, register3dEffects } from './depth3';

export { GPU_FX, registerGpuEffects, TEXT3_FX, registerTextEffects3, splitChars };
export { shaderBackground, supportsWebGL2, fieldFallback, GLSL_HEAD } from './gl';
export type { ShaderSpec } from './gl';

export { LIGHT_FX, registerLightEffects, trackPointer };

export { DEPTH3_FX, register3dEffects };

/** The 6.x effect packs by name. */
export const FX2_PACKS: Record<string, EffectDefinition[]> = {
  gpu: GPU_FX,
  text: TEXT3_FX,
  light: LIGHT_FX,
  depth: DEPTH3_FX,
};

/** Register every 6.x pack (idempotent). */
export function registerFx2(): void {
  registerGpuEffects();
  registerTextEffects3();
  registerLightEffects();
  register3dEffects();
}
