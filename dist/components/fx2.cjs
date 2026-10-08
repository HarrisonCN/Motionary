'use strict';

var base = require('../chunks/base-BaQV-2ha.cjs');
var components_marketplace = require('./marketplace.cjs');
var components_fxGpu = require('../chunks/gpu-C2D4T9Q-.cjs');
var components_fxText = require('./fx-text.cjs');
var components_fxLight = require('./fx-light.cjs');
var components_fx3d = require('./fx-3d.cjs');
var components_fxMorph = require('./fx-morph.cjs');
var components_fxTransitions = require('./fx-transitions.cjs');
var components_fxWeather = require('./fx-weather.cjs');
var components_fxPhysics = require('./fx-physics.cjs');
var components_fxFocus = require('./fx-focus.cjs');
require('../chunks/registry-DehBVRDV.cjs');
require('../chunks/generative-BHIj-NU0.cjs');
require('../chunks/shared-jkgRH-Hx.cjs');

/** The 6.x effect packs by name. */
const EFFECT_PACKS = {
    gpu: components_fxGpu.GPU_FX,
    text: components_fxText.TEXT3_FX,
    light: components_fxLight.LIGHT_FX,
    depth: components_fx3d.DEPTH3_FX,
    morph: components_fxMorph.MORPH2_FX,
    transitions: components_fxTransitions.TRANSITIONS2_FX,
    weather: components_fxWeather.WEATHER_FX,
    physics: components_fxPhysics.PHYSICS2_FX,
    focus: components_fxFocus.FOCUS_FX,
};
/** Register every 6.x effect pack (idempotent). */
function registerEffectPacks() {
    components_fxGpu.registerGpuPack();
    components_fxText.registerTextPack();
    components_fxLight.registerLightPack();
    components_fx3d.register3dPack();
    components_fxMorph.registerMorphPack();
    components_fxTransitions.registerTransitionsPack();
    components_fxWeather.registerWeatherPack();
    components_fxPhysics.registerPhysicsPack();
    components_fxFocus.registerFocusPack();
}
/** @deprecated since 6.9 — `EFFECT_PACKS` (removed in 7.0). */
const FX2_PACKS = EFFECT_PACKS;
/** @deprecated since 6.9 — use `registerEffectPacks()` (removed in 7.0; `npx usa-codemod-7`). */
function registerFx2() {
    base.deprecate('registerFx2', 'registerFx2() is deprecated since 6.9 and removed in 7.0 — use registerEffectPacks() (npx usa-codemod-7).');
    registerEffectPacks();
}

exports.EFFECT_PACK_FORMAT = components_marketplace.EFFECT_PACK_FORMAT;
exports.loadEffectPack = components_marketplace.loadEffectPack;
exports.packManifest = components_marketplace.packManifest;
exports.validateManifest = components_marketplace.validateManifest;
exports.GLSL_HEAD = components_fxGpu.GLSL_HEAD;
exports.GPU_FX = components_fxGpu.GPU_FX;
exports.fieldFallback = components_fxGpu.fieldFallback;
exports.registerGpuEffects = components_fxGpu.registerGpuEffects;
exports.registerGpuPack = components_fxGpu.registerGpuPack;
exports.shaderBackground = components_fxGpu.shaderBackground;
exports.supportsWebGL2 = components_fxGpu.supportsWebGL2;
exports.TEXT3_FX = components_fxText.TEXT3_FX;
exports.registerTextEffects3 = components_fxText.registerTextEffects3;
exports.registerTextPack = components_fxText.registerTextPack;
exports.splitChars = components_fxText.splitChars;
exports.LIGHT_FX = components_fxLight.LIGHT_FX;
exports.registerLightEffects = components_fxLight.registerLightEffects;
exports.registerLightPack = components_fxLight.registerLightPack;
exports.trackPointer = components_fxLight.trackPointer;
exports.DEPTH3_FX = components_fx3d.DEPTH3_FX;
exports.register3dEffects = components_fx3d.register3dEffects;
exports.register3dPack = components_fx3d.register3dPack;
exports.MORPH2_FX = components_fxMorph.MORPH2_FX;
exports.pointsToPath = components_fxMorph.pointsToPath;
exports.registerMorphEffects2 = components_fxMorph.registerMorphEffects2;
exports.registerMorphPack = components_fxMorph.registerMorphPack;
exports.samplePath = components_fxMorph.samplePath;
exports.TRANSITIONS2_FX = components_fxTransitions.TRANSITIONS2_FX;
exports.crossDocumentTransitions = components_fxTransitions.crossDocumentTransitions;
exports.pageTransition = components_fxTransitions.pageTransition;
exports.registerTransitionEffects2 = components_fxTransitions.registerTransitionEffects2;
exports.registerTransitionsPack = components_fxTransitions.registerTransitionsPack;
exports.WEATHER_FX = components_fxWeather.WEATHER_FX;
exports.registerWeatherEffects = components_fxWeather.registerWeatherEffects;
exports.registerWeatherPack = components_fxWeather.registerWeatherPack;
exports.skyAt = components_fxWeather.skyAt;
exports.PHYSICS2_FX = components_fxPhysics.PHYSICS2_FX;
exports.VerletWorld = components_fxPhysics.VerletWorld;
exports.registerPhysicsEffects2 = components_fxPhysics.registerPhysicsEffects2;
exports.registerPhysicsPack = components_fxPhysics.registerPhysicsPack;
exports.FOCUS_FX = components_fxFocus.FOCUS_FX;
exports.registerFocusPack = components_fxFocus.registerFocusPack;
exports.EFFECT_PACKS = EFFECT_PACKS;
exports.FX2_PACKS = FX2_PACKS;
exports.registerEffectPacks = registerEffectPacks;
exports.registerFx2 = registerFx2;
//# sourceMappingURL=fx2.cjs.map
