import { G as GPU_FX, r as registerGpuEffects } from '../chunks/gpu-CsP2ZB3x.js';
export { a as GLSL_HEAD, f as fieldFallback, s as shaderBackground, b as supportsWebGL2 } from '../chunks/gpu-CsP2ZB3x.js';
import { TEXT3_FX, registerTextEffects3 } from './fx-text.js';
export { splitChars } from './fx-text.js';
import { LIGHT_FX, registerLightEffects } from './fx-light.js';
export { trackPointer } from './fx-light.js';
import { DEPTH3_FX, register3dEffects } from './fx-3d.js';
import { MORPH2_FX, registerMorphEffects2 } from './fx-morph.js';
export { pointsToPath, samplePath } from './fx-morph.js';
import { TRANSITIONS2_FX, registerTransitionEffects2 } from './fx-transitions.js';
export { crossDocumentTransitions, pageTransition } from './fx-transitions.js';
import '../chunks/registry-D23neB4M.js';
import '../chunks/base-DchG4q_S.js';
import '../chunks/generative-2LhxG5BJ.js';
import '../chunks/shared-CkKHWrtJ.js';

/** The 6.x effect packs by name. */
const FX2_PACKS = {
    gpu: GPU_FX,
    text: TEXT3_FX,
    light: LIGHT_FX,
    depth: DEPTH3_FX,
    morph: MORPH2_FX,
    transitions: TRANSITIONS2_FX,
};
/** Register every 6.x pack (idempotent). */
function registerFx2() {
    registerGpuEffects();
    registerTextEffects3();
    registerLightEffects();
    register3dEffects();
    registerMorphEffects2();
    registerTransitionEffects2();
}

export { DEPTH3_FX, FX2_PACKS, GPU_FX, LIGHT_FX, MORPH2_FX, TEXT3_FX, TRANSITIONS2_FX, register3dEffects, registerFx2, registerGpuEffects, registerLightEffects, registerMorphEffects2, registerTextEffects3, registerTransitionEffects2 };
//# sourceMappingURL=fx2.js.map
