'use strict';

var components_fxGpu = require('../chunks/gpu-BBRLgEzM.cjs');
var components_fxText = require('./fx-text.cjs');
var components_fxLight = require('./fx-light.cjs');
require('../chunks/registry-DehBVRDV.cjs');
require('../chunks/base-BaQV-2ha.cjs');
require('../chunks/generative-BHIj-NU0.cjs');
require('../chunks/shared-jkgRH-Hx.cjs');

/** The 6.x effect packs by name. */
const FX2_PACKS = {
    gpu: components_fxGpu.GPU_FX,
    text: components_fxText.TEXT3_FX,
    light: components_fxLight.LIGHT_FX,
};
/** Register every 6.x pack (idempotent). */
function registerFx2() {
    components_fxGpu.registerGpuEffects();
    components_fxText.registerTextEffects3();
    components_fxLight.registerLightEffects();
}

exports.GLSL_HEAD = components_fxGpu.GLSL_HEAD;
exports.GPU_FX = components_fxGpu.GPU_FX;
exports.fieldFallback = components_fxGpu.fieldFallback;
exports.registerGpuEffects = components_fxGpu.registerGpuEffects;
exports.shaderBackground = components_fxGpu.shaderBackground;
exports.supportsWebGL2 = components_fxGpu.supportsWebGL2;
exports.TEXT3_FX = components_fxText.TEXT3_FX;
exports.registerTextEffects3 = components_fxText.registerTextEffects3;
exports.splitChars = components_fxText.splitChars;
exports.LIGHT_FX = components_fxLight.LIGHT_FX;
exports.registerLightEffects = components_fxLight.registerLightEffects;
exports.trackPointer = components_fxLight.trackPointer;
exports.FX2_PACKS = FX2_PACKS;
exports.registerFx2 = registerFx2;
//# sourceMappingURL=fx2.cjs.map
