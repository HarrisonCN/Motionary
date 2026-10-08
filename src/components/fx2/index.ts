/**
 * The 6.x effect packs, one entry each (`motionary/components/fx-gpu`, …) so
 * their size budgets stay separate. This module (`registerFx2()`) registers
 * them all — used by dist/widgets.umd.js and the showcase.
 */
import type { EffectDefinition } from '../fx/registry';
export { EFFECT_PACK_FORMAT, packManifest, validateManifest, loadEffectPack } from './manifest';
export type { EffectPackManifest } from './manifest';
import { GPU_FX, registerGpuPack } from './gpu';
import { TEXT3_FX, registerTextPack, splitChars } from './text3';
import { LIGHT_FX, registerLightPack, trackPointer } from './light';
import { DEPTH3_FX, register3dPack } from './depth3';
import { MORPH2_FX, registerMorphPack, samplePath, pointsToPath } from './morph2';
import { TRANSITIONS2_FX, registerTransitionsPack, pageTransition, crossDocumentTransitions } from './transitions2';
import { WEATHER_FX, registerWeatherPack, skyAt } from './weather';
import { PHYSICS2_FX, registerPhysicsPack, VerletWorld } from './physics2';
import { FOCUS_FX, registerFocusPack } from './focus';
import { MUSIC_FX, registerMusicPack, syntheticSample, musicSample } from './music';

export { GPU_FX, registerGpuPack, TEXT3_FX, registerTextPack, splitChars };
export { shaderBackground, supportsWebGL2, fieldFallback, GLSL_HEAD } from './gl';
export { supportsWebGPU, glslToWgsl, wgslModule, webgpuBackground, WGSL_HEAD } from './webgpu';
export type { ShaderSpec } from './gl';

export { LIGHT_FX, registerLightPack, trackPointer };

export { DEPTH3_FX, register3dPack };

export { MORPH2_FX, registerMorphPack, samplePath, pointsToPath };

export { TRANSITIONS2_FX, registerTransitionsPack, pageTransition, crossDocumentTransitions };

export { WEATHER_FX, registerWeatherPack, skyAt };

export { PHYSICS2_FX, registerPhysicsPack, VerletWorld };

export { FOCUS_FX, registerFocusPack };

export { MUSIC_FX, registerMusicPack, syntheticSample, musicSample };

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
  music: MUSIC_FX,
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
  registerMusicPack();
}


