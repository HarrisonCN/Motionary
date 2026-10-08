/**
 * The 6.x effect packs, one entry each (`motionary/components/fx-gpu`, …) so
 * their size budgets stay separate. This module (`registerFx2()`) registers
 * them all — used by dist/widgets.umd.js and the showcase.
 */
import type { EffectDefinition } from '../fx/registry';
import { deprecate } from '../base';
export { EFFECT_PACK_FORMAT, packManifest, validateManifest, loadEffectPack } from './manifest';
export type { EffectPackManifest } from './manifest';
import { GPU_FX, registerGpuPack, registerGpuEffects } from './gpu';
import { TEXT3_FX, registerTextPack, registerTextEffects3, splitChars } from './text3';
import { LIGHT_FX, registerLightPack, registerLightEffects, trackPointer } from './light';
import { DEPTH3_FX, register3dPack, register3dEffects } from './depth3';
import { MORPH2_FX, registerMorphPack, registerMorphEffects2, samplePath, pointsToPath } from './morph2';
import { TRANSITIONS2_FX, registerTransitionsPack, registerTransitionEffects2, pageTransition, crossDocumentTransitions } from './transitions2';
import { WEATHER_FX, registerWeatherPack, registerWeatherEffects, skyAt } from './weather';
import { PHYSICS2_FX, registerPhysicsPack, registerPhysicsEffects2, VerletWorld } from './physics2';
import { FOCUS_FX, registerFocusPack } from './focus';

export { GPU_FX, registerGpuPack, registerGpuEffects, TEXT3_FX, registerTextPack, registerTextEffects3, splitChars };
export { shaderBackground, supportsWebGL2, fieldFallback, GLSL_HEAD } from './gl';
export type { ShaderSpec } from './gl';

export { LIGHT_FX, registerLightPack, registerLightEffects, trackPointer };

export { DEPTH3_FX, register3dPack, register3dEffects };

export { MORPH2_FX, registerMorphPack, registerMorphEffects2, samplePath, pointsToPath };

export { TRANSITIONS2_FX, registerTransitionsPack, registerTransitionEffects2, pageTransition, crossDocumentTransitions };

export { WEATHER_FX, registerWeatherPack, registerWeatherEffects, skyAt };

export { PHYSICS2_FX, registerPhysicsPack, registerPhysicsEffects2, VerletWorld };

export { FOCUS_FX, registerFocusPack };

/** The 6.x effect packs by name. */
export const EFFECT_PACKS: Record<string, EffectDefinition[]> = {
  gpu: GPU_FX,
  text: TEXT3_FX,
  light: LIGHT_FX,
  depth: DEPTH3_FX,
  morph: MORPH2_FX,
  transitions: TRANSITIONS2_FX,
  weather: WEATHER_FX,
  physics: PHYSICS2_FX,
  focus: FOCUS_FX,
};

/** Register every 6.x effect pack (idempotent). */
export function registerEffectPacks(): void {
  registerGpuPack();
  registerTextPack();
  registerLightPack();
  register3dPack();
  registerMorphPack();
  registerTransitionsPack();
  registerWeatherPack();
  registerPhysicsPack();
  registerFocusPack();
}

/** @deprecated since 6.9 — `EFFECT_PACKS` (removed in 7.0). */
export const FX2_PACKS = EFFECT_PACKS;

/** @deprecated since 6.9 — use `registerEffectPacks()` (removed in 7.0; `npx usa-codemod-7`). */
export function registerFx2(): void {
  deprecate('registerFx2', 'registerFx2() is deprecated since 6.9 and removed in 7.0 — use registerEffectPacks() (npx usa-codemod-7).');
  registerEffectPacks();
}
