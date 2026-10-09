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
import { CHART_FX, registerChartPack, parseFigure } from './chart';
import { SHOP_FX, registerShopPack, arcPath } from './shop';
import { SOCIAL_FX, registerSocialPack, fanAngles } from './social';
import { GAME_FX, registerGamePack, throwPath } from './game';
import { GEO_FX, registerGeoPack, routeLength } from './geo';
import { FORM_FX, registerFormPack, shakeFrames } from './form';
import { AI_FX, registerAiPack, splitWords } from './ai';
import { FESTIVAL_FX, registerFestivalPack, sparkVectors } from './festival';
import { RETRO_FX, registerRetroPack, pixelSteps } from './retro2';
import { ORGANIC_FX, registerOrganicPack, blobRadius } from './organic';
import { CYBER_FX, registerCyberPack, decodeFrame } from './cyber';
import { PAPER_FX, registerPaperPack, roughLine, paperRandom } from './paper';
import { SURFACE_FX, registerSurfacePack, SURFACE_THEMES, applySurfaceTheme } from './themefx';
import { GESTURE3_FX, registerGesture3Pack, pinchScale, pinchAngle, orientationToTilt } from './gesture3';
import { SPATIAL_FX, registerSpatialPack, yawToOffset, xrSupport } from './spatial';

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

export { CHART_FX, registerChartPack, parseFigure };

export { SHOP_FX, registerShopPack, arcPath };

export { SOCIAL_FX, registerSocialPack, fanAngles };

export { GAME_FX, registerGamePack, throwPath };

export { GEO_FX, registerGeoPack, routeLength };

export { FORM_FX, registerFormPack, shakeFrames };

export { AI_FX, registerAiPack, splitWords };

export { FESTIVAL_FX, registerFestivalPack, sparkVectors };

export { RETRO_FX, registerRetroPack, pixelSteps };

export { ORGANIC_FX, registerOrganicPack, blobRadius };

export { CYBER_FX, registerCyberPack, decodeFrame };

export { PAPER_FX, registerPaperPack, roughLine, paperRandom };

export { SURFACE_FX, registerSurfacePack, SURFACE_THEMES, applySurfaceTheme };

export { GESTURE3_FX, registerGesture3Pack, pinchScale, pinchAngle, orientationToTilt };

export { SPATIAL_FX, registerSpatialPack, yawToOffset, xrSupport };

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
  chart: CHART_FX,
  shop: SHOP_FX,
  social: SOCIAL_FX,
  game: GAME_FX,
  geo: GEO_FX,
  form: FORM_FX,
  ai: AI_FX,
  festival: FESTIVAL_FX,
  retro: RETRO_FX,
  organic: ORGANIC_FX,
  cyber: CYBER_FX,
  paper: PAPER_FX,
  surface: SURFACE_FX,
  gesture3: GESTURE3_FX,
  spatial: SPATIAL_FX,
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
  registerChartPack();
  registerShopPack();
  registerSocialPack();
  registerGamePack();
  registerGeoPack();
  registerFormPack();
  registerAiPack();
  registerFestivalPack();
  registerRetroPack();
  registerOrganicPack();
  registerCyberPack();
  registerPaperPack();
  registerSurfacePack();
  registerGesture3Pack();
  registerSpatialPack();
}


