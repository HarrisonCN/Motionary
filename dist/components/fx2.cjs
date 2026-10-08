'use strict';

var components_fxGpu = require('../chunks/gpu-BBRLgEzM.cjs');
var components_fxText = require('./fx-text.cjs');
var components_fxLight = require('./fx-light.cjs');
var components_fx3d = require('./fx-3d.cjs');
var components_fxMorph = require('./fx-morph.cjs');
var components_fxTransitions = require('./fx-transitions.cjs');
var components_fxWeather = require('./fx-weather.cjs');
var components_fxPhysics = require('./fx-physics.cjs');
require('../chunks/registry-DehBVRDV.cjs');
require('../chunks/base-BaQV-2ha.cjs');
require('../chunks/generative-BHIj-NU0.cjs');
require('../chunks/shared-jkgRH-Hx.cjs');

/** The 6.x effect packs by name. */
const FX2_PACKS = {
    gpu: components_fxGpu.GPU_FX,
    text: components_fxText.TEXT3_FX,
    light: components_fxLight.LIGHT_FX,
    depth: components_fx3d.DEPTH3_FX,
    morph: components_fxMorph.MORPH2_FX,
    transitions: components_fxTransitions.TRANSITIONS2_FX,
    weather: components_fxWeather.WEATHER_FX,
    physics: components_fxPhysics.PHYSICS2_FX,
};
/** Register every 6.x pack (idempotent). */
function registerFx2() {
    components_fxGpu.registerGpuEffects();
    components_fxText.registerTextEffects3();
    components_fxLight.registerLightEffects();
    components_fx3d.register3dEffects();
    components_fxMorph.registerMorphEffects2();
    components_fxTransitions.registerTransitionEffects2();
    components_fxWeather.registerWeatherEffects();
    components_fxPhysics.registerPhysicsEffects2();
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
exports.DEPTH3_FX = components_fx3d.DEPTH3_FX;
exports.register3dEffects = components_fx3d.register3dEffects;
exports.MORPH2_FX = components_fxMorph.MORPH2_FX;
exports.pointsToPath = components_fxMorph.pointsToPath;
exports.registerMorphEffects2 = components_fxMorph.registerMorphEffects2;
exports.samplePath = components_fxMorph.samplePath;
exports.TRANSITIONS2_FX = components_fxTransitions.TRANSITIONS2_FX;
exports.crossDocumentTransitions = components_fxTransitions.crossDocumentTransitions;
exports.pageTransition = components_fxTransitions.pageTransition;
exports.registerTransitionEffects2 = components_fxTransitions.registerTransitionEffects2;
exports.WEATHER_FX = components_fxWeather.WEATHER_FX;
exports.registerWeatherEffects = components_fxWeather.registerWeatherEffects;
exports.skyAt = components_fxWeather.skyAt;
exports.PHYSICS2_FX = components_fxPhysics.PHYSICS2_FX;
exports.VerletWorld = components_fxPhysics.VerletWorld;
exports.registerPhysicsEffects2 = components_fxPhysics.registerPhysicsEffects2;
exports.FX2_PACKS = FX2_PACKS;
exports.registerFx2 = registerFx2;
//# sourceMappingURL=fx2.cjs.map
