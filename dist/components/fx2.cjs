'use strict';

var components_fxGpu = require('../chunks/gpu-CenK2l6b.cjs');
require('../chunks/registry-DehBVRDV.cjs');
require('../chunks/base-BaQV-2ha.cjs');
require('../chunks/generative-DzIZq-_g.cjs');

/** The 6.x effect packs by name. */
const FX2_PACKS = {
    gpu: components_fxGpu.GPU_FX,
};
/** Register every 6.x pack (idempotent). */
function registerFx2() {
    components_fxGpu.registerGpuEffects();
}

exports.GLSL_HEAD = components_fxGpu.GLSL_HEAD;
exports.GPU_FX = components_fxGpu.GPU_FX;
exports.fieldFallback = components_fxGpu.fieldFallback;
exports.registerGpuEffects = components_fxGpu.registerGpuEffects;
exports.shaderBackground = components_fxGpu.shaderBackground;
exports.supportsWebGL2 = components_fxGpu.supportsWebGL2;
exports.FX2_PACKS = FX2_PACKS;
exports.registerFx2 = registerFx2;
//# sourceMappingURL=fx2.cjs.map
