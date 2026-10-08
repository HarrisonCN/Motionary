import { G as GPU_FX, r as registerGpuEffects } from '../chunks/gpu-Bu7qwugO.js';
export { a as GLSL_HEAD, f as fieldFallback, s as shaderBackground, b as supportsWebGL2 } from '../chunks/gpu-Bu7qwugO.js';
import '../chunks/registry-CKNLQpwd.js';
import '../chunks/base-C_3cAoRz.js';
import '../chunks/generative-D2YyhaeO.js';

/** The 6.x effect packs by name. */
const FX2_PACKS = {
    gpu: GPU_FX,
};
/** Register every 6.x pack (idempotent). */
function registerFx2() {
    registerGpuEffects();
}

export { FX2_PACKS, GPU_FX, registerFx2, registerGpuEffects };
//# sourceMappingURL=fx2.js.map
