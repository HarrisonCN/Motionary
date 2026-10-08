import { G as GPU_FX, r as registerGpuEffects } from '../chunks/gpu-XHWzeNb5.js';
export { a as GLSL_HEAD, f as fieldFallback, s as shaderBackground, b as supportsWebGL2 } from '../chunks/gpu-XHWzeNb5.js';
import { TEXT3_FX, registerTextEffects3 } from './fx-text.js';
export { splitChars } from './fx-text.js';
import '../chunks/registry-Bu5NrAyA.js';
import '../chunks/base-DchG4q_S.js';
import '../chunks/generative-BRUZaIsX.js';
import '../chunks/shared-eweTlzxv.js';

/** The 6.x effect packs by name. */
const FX2_PACKS = {
    gpu: GPU_FX,
    text: TEXT3_FX,
};
/** Register every 6.x pack (idempotent). */
function registerFx2() {
    registerGpuEffects();
    registerTextEffects3();
}

export { FX2_PACKS, GPU_FX, TEXT3_FX, registerFx2, registerGpuEffects, registerTextEffects3 };
//# sourceMappingURL=fx2.js.map
