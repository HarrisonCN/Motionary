import { u as deprecate } from '../chunks/base-D5MHqeDd.js';
export { EFFECT_PACK_FORMAT, loadEffectPack, packManifest, validateManifest } from './marketplace.js';
import { G as GPU_FX, r as registerGpuPack } from '../chunks/gpu-DPhMkJq6.js';
export { a as GLSL_HEAD, f as fieldFallback, b as registerGpuEffects, s as shaderBackground, c as supportsWebGL2 } from '../chunks/gpu-DPhMkJq6.js';
import { TEXT3_FX, registerTextPack } from './fx-text.js';
export { registerTextEffects3, splitChars } from './fx-text.js';
import { LIGHT_FX, registerLightPack } from './fx-light.js';
export { registerLightEffects, trackPointer } from './fx-light.js';
import { DEPTH3_FX, register3dPack } from './fx-3d.js';
export { register3dEffects } from './fx-3d.js';
import { MORPH2_FX, registerMorphPack } from './fx-morph.js';
export { pointsToPath, registerMorphEffects2, samplePath } from './fx-morph.js';
import { TRANSITIONS2_FX, registerTransitionsPack } from './fx-transitions.js';
export { crossDocumentTransitions, pageTransition, registerTransitionEffects2 } from './fx-transitions.js';
import { WEATHER_FX, registerWeatherPack } from './fx-weather.js';
export { registerWeatherEffects, skyAt } from './fx-weather.js';
import { PHYSICS2_FX, registerPhysicsPack } from './fx-physics.js';
export { VerletWorld, registerPhysicsEffects2 } from './fx-physics.js';
import { FOCUS_FX, registerFocusPack } from './fx-focus.js';
import '../chunks/registry-CTLWeg-J.js';
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
/** @deprecated since 6.9 — `EFFECT_PACKS` (removed in 7.0). */
const FX2_PACKS = EFFECT_PACKS;
/** @deprecated since 6.9 — use `registerEffectPacks()` (removed in 7.0; `npx usa-codemod-7`). */
function registerFx2() {
    deprecate('registerFx2', 'registerFx2() is deprecated since 6.9 and removed in 7.0 — use registerEffectPacks() (npx usa-codemod-7).');
    registerEffectPacks();
}

export { DEPTH3_FX, EFFECT_PACKS, FOCUS_FX, FX2_PACKS, GPU_FX, LIGHT_FX, MORPH2_FX, PHYSICS2_FX, TEXT3_FX, TRANSITIONS2_FX, WEATHER_FX, register3dPack, registerEffectPacks, registerFocusPack, registerFx2, registerGpuPack, registerLightPack, registerMorphPack, registerPhysicsPack, registerTextPack, registerTransitionsPack, registerWeatherPack };
//# sourceMappingURL=fx2.js.map
