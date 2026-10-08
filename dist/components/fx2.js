export { EFFECT_PACK_FORMAT, loadEffectPack, packManifest, validateManifest } from './marketplace.js';
import { G as GPU_FX, r as registerGpuPack } from '../chunks/gpu-Bkw605Ds.js';
export { a as GLSL_HEAD, W as WGSL_HEAD, f as fieldFallback, g as glslToWgsl, s as shaderBackground, b as supportsWebGL2, c as supportsWebGPU, w as webgpuBackground, d as wgslModule } from '../chunks/gpu-Bkw605Ds.js';
import { TEXT3_FX, registerTextPack } from './fx-text.js';
export { splitChars } from './fx-text.js';
import { LIGHT_FX, registerLightPack } from './fx-light.js';
export { trackPointer } from './fx-light.js';
import { DEPTH3_FX, register3dPack } from './fx-3d.js';
import { MORPH2_FX, registerMorphPack } from './fx-morph.js';
export { pointsToPath, samplePath } from './fx-morph.js';
import { TRANSITIONS2_FX, registerTransitionsPack } from './fx-transitions.js';
export { crossDocumentTransitions, pageTransition } from './fx-transitions.js';
import { WEATHER_FX, registerWeatherPack } from './fx-weather.js';
export { skyAt } from './fx-weather.js';
import { PHYSICS2_FX, registerPhysicsPack } from './fx-physics.js';
export { VerletWorld } from './fx-physics.js';
import { FOCUS_FX, registerFocusPack } from './fx-focus.js';
import '../chunks/registry-D23neB4M.js';
import '../chunks/base-DchG4q_S.js';
import '../chunks/generative-2LhxG5BJ.js';
import '../chunks/shared-CkKHWrtJ.js';

/** The 6.x effect packs by name. */
const EFFECT_PACKS = {
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
function registerEffectPacks() {
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

export { DEPTH3_FX, EFFECT_PACKS, FOCUS_FX, GPU_FX, LIGHT_FX, MORPH2_FX, PHYSICS2_FX, TEXT3_FX, TRANSITIONS2_FX, WEATHER_FX, register3dPack, registerEffectPacks, registerFocusPack, registerGpuPack, registerLightPack, registerMorphPack, registerPhysicsPack, registerTextPack, registerTransitionsPack, registerWeatherPack };
//# sourceMappingURL=fx2.js.map
