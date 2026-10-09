'use strict';

var manifest = require('../chunks/manifest-B08-vo9G.cjs');
var components_fxGpu = require('../chunks/gpu-CcdA2D2i.cjs');
var components_fxText = require('./fx-text.cjs');
var components_fxLight = require('./fx-light.cjs');
var components_fx3d = require('./fx-3d.cjs');
var components_fxMorph = require('./fx-morph.cjs');
var components_fxTransitions = require('./fx-transitions.cjs');
var components_fxWeather = require('./fx-weather.cjs');
var components_fxPhysics = require('./fx-physics.cjs');
var components_fxFocus = require('./fx-focus.cjs');
var components_fxMusic = require('./fx-music.cjs');
var components_fxChart = require('./fx-chart.cjs');
var components_fxShop = require('./fx-shop.cjs');
var components_fxSocial = require('./fx-social.cjs');
var components_fxGame = require('./fx-game.cjs');
var components_fxGeo = require('./fx-geo.cjs');
var components_fxForm = require('./fx-form.cjs');
var components_fxAi = require('./fx-ai.cjs');
var components_fxFestival = require('./fx-festival.cjs');
var components_fxRetro = require('./fx-retro.cjs');
var components_fxOrganic = require('./fx-organic.cjs');
var components_fxCyber = require('./fx-cyber.cjs');
var components_fxPaper = require('./fx-paper.cjs');
var components_fxSurface = require('./fx-surface.cjs');
var components_fxGesture = require('./fx-gesture.cjs');
var components_fxSpatial = require('./fx-spatial.cjs');
var components_fxCinema = require('./fx-cinema.cjs');
require('../chunks/registry-BVklOepd.cjs');
require('../chunks/base-DoRUZBy-.cjs');
require('../chunks/generative-BHIj-NU0.cjs');
require('../chunks/shared-jkgRH-Hx.cjs');
require('../chunks/audio-cgWbDkoY.cjs');

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
    music: components_fxMusic.MUSIC_FX,
    chart: components_fxChart.CHART_FX,
    shop: components_fxShop.SHOP_FX,
    social: components_fxSocial.SOCIAL_FX,
    game: components_fxGame.GAME_FX,
    geo: components_fxGeo.GEO_FX,
    form: components_fxForm.FORM_FX,
    ai: components_fxAi.AI_FX,
    festival: components_fxFestival.FESTIVAL_FX,
    retro: components_fxRetro.RETRO_FX,
    organic: components_fxOrganic.ORGANIC_FX,
    cyber: components_fxCyber.CYBER_FX,
    paper: components_fxPaper.PAPER_FX,
    surface: components_fxSurface.SURFACE_FX,
    gesture3: components_fxGesture.GESTURE3_FX,
    spatial: components_fxSpatial.SPATIAL_FX,
    cinema: components_fxCinema.CINEMA_FX,
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
    components_fxMusic.registerMusicPack();
    components_fxChart.registerChartPack();
    components_fxShop.registerShopPack();
    components_fxSocial.registerSocialPack();
    components_fxGame.registerGamePack();
    components_fxGeo.registerGeoPack();
    components_fxForm.registerFormPack();
    components_fxAi.registerAiPack();
    components_fxFestival.registerFestivalPack();
    components_fxRetro.registerRetroPack();
    components_fxOrganic.registerOrganicPack();
    components_fxCyber.registerCyberPack();
    components_fxPaper.registerPaperPack();
    components_fxSurface.registerSurfacePack();
    components_fxGesture.registerGesture3Pack();
    components_fxSpatial.registerSpatialPack();
    components_fxCinema.registerCinemaPack();
}

exports.EFFECT_PACK_FORMAT = manifest.EFFECT_PACK_FORMAT;
exports.loadEffectPack = manifest.loadEffectPack;
exports.packManifest = manifest.packManifest;
exports.validateManifest = manifest.validateManifest;
exports.GLSL_HEAD = components_fxGpu.GLSL_HEAD;
exports.GPU_FX = components_fxGpu.GPU_FX;
exports.WGSL_HEAD = components_fxGpu.WGSL_HEAD;
exports.fieldFallback = components_fxGpu.fieldFallback;
exports.glslToWgsl = components_fxGpu.glslToWgsl;
exports.registerGpuPack = components_fxGpu.registerGpuPack;
exports.shaderBackground = components_fxGpu.shaderBackground;
exports.supportsWebGL2 = components_fxGpu.supportsWebGL2;
exports.supportsWebGPU = components_fxGpu.supportsWebGPU;
exports.webgpuBackground = components_fxGpu.webgpuBackground;
exports.wgslModule = components_fxGpu.wgslModule;
exports.TEXT3_FX = components_fxText.TEXT3_FX;
exports.registerTextPack = components_fxText.registerTextPack;
exports.splitChars = components_fxText.splitChars;
exports.LIGHT_FX = components_fxLight.LIGHT_FX;
exports.registerLightPack = components_fxLight.registerLightPack;
exports.trackPointer = components_fxLight.trackPointer;
exports.DEPTH3_FX = components_fx3d.DEPTH3_FX;
exports.register3dPack = components_fx3d.register3dPack;
exports.MORPH2_FX = components_fxMorph.MORPH2_FX;
exports.pointsToPath = components_fxMorph.pointsToPath;
exports.registerMorphPack = components_fxMorph.registerMorphPack;
exports.samplePath = components_fxMorph.samplePath;
exports.TRANSITIONS2_FX = components_fxTransitions.TRANSITIONS2_FX;
exports.crossDocumentTransitions = components_fxTransitions.crossDocumentTransitions;
exports.pageTransition = components_fxTransitions.pageTransition;
exports.registerTransitionsPack = components_fxTransitions.registerTransitionsPack;
exports.WEATHER_FX = components_fxWeather.WEATHER_FX;
exports.registerWeatherPack = components_fxWeather.registerWeatherPack;
exports.skyAt = components_fxWeather.skyAt;
exports.PHYSICS2_FX = components_fxPhysics.PHYSICS2_FX;
exports.VerletWorld = components_fxPhysics.VerletWorld;
exports.registerPhysicsPack = components_fxPhysics.registerPhysicsPack;
exports.FOCUS_FX = components_fxFocus.FOCUS_FX;
exports.registerFocusPack = components_fxFocus.registerFocusPack;
exports.MUSIC_FX = components_fxMusic.MUSIC_FX;
exports.musicSample = components_fxMusic.musicSample;
exports.registerMusicPack = components_fxMusic.registerMusicPack;
exports.syntheticSample = components_fxMusic.syntheticSample;
exports.CHART_FX = components_fxChart.CHART_FX;
exports.parseFigure = components_fxChart.parseFigure;
exports.registerChartPack = components_fxChart.registerChartPack;
exports.SHOP_FX = components_fxShop.SHOP_FX;
exports.arcPath = components_fxShop.arcPath;
exports.registerShopPack = components_fxShop.registerShopPack;
exports.SOCIAL_FX = components_fxSocial.SOCIAL_FX;
exports.fanAngles = components_fxSocial.fanAngles;
exports.registerSocialPack = components_fxSocial.registerSocialPack;
exports.GAME_FX = components_fxGame.GAME_FX;
exports.registerGamePack = components_fxGame.registerGamePack;
exports.throwPath = components_fxGame.throwPath;
exports.GEO_FX = components_fxGeo.GEO_FX;
exports.registerGeoPack = components_fxGeo.registerGeoPack;
exports.routeLength = components_fxGeo.routeLength;
exports.FORM_FX = components_fxForm.FORM_FX;
exports.registerFormPack = components_fxForm.registerFormPack;
exports.shakeFrames = components_fxForm.shakeFrames;
exports.AI_FX = components_fxAi.AI_FX;
exports.registerAiPack = components_fxAi.registerAiPack;
exports.splitWords = components_fxAi.splitWords;
exports.FESTIVAL_FX = components_fxFestival.FESTIVAL_FX;
exports.registerFestivalPack = components_fxFestival.registerFestivalPack;
exports.sparkVectors = components_fxFestival.sparkVectors;
exports.RETRO_FX = components_fxRetro.RETRO_FX;
exports.pixelSteps = components_fxRetro.pixelSteps;
exports.registerRetroPack = components_fxRetro.registerRetroPack;
exports.ORGANIC_FX = components_fxOrganic.ORGANIC_FX;
exports.blobRadius = components_fxOrganic.blobRadius;
exports.registerOrganicPack = components_fxOrganic.registerOrganicPack;
exports.CYBER_FX = components_fxCyber.CYBER_FX;
exports.decodeFrame = components_fxCyber.decodeFrame;
exports.registerCyberPack = components_fxCyber.registerCyberPack;
exports.PAPER_FX = components_fxPaper.PAPER_FX;
exports.paperRandom = components_fxPaper.paperRandom;
exports.registerPaperPack = components_fxPaper.registerPaperPack;
exports.roughLine = components_fxPaper.roughLine;
exports.SURFACE_FX = components_fxSurface.SURFACE_FX;
exports.SURFACE_THEMES = components_fxSurface.SURFACE_THEMES;
exports.applySurfaceTheme = components_fxSurface.applySurfaceTheme;
exports.registerSurfacePack = components_fxSurface.registerSurfacePack;
exports.GESTURE3_FX = components_fxGesture.GESTURE3_FX;
exports.orientationToTilt = components_fxGesture.orientationToTilt;
exports.pinchAngle = components_fxGesture.pinchAngle;
exports.pinchScale = components_fxGesture.pinchScale;
exports.registerGesture3Pack = components_fxGesture.registerGesture3Pack;
exports.SPATIAL_FX = components_fxSpatial.SPATIAL_FX;
exports.registerSpatialPack = components_fxSpatial.registerSpatialPack;
exports.xrSupport = components_fxSpatial.xrSupport;
exports.yawToOffset = components_fxSpatial.yawToOffset;
exports.CAMERA_MOVES = components_fxCinema.CAMERA_MOVES;
exports.CINEMA_FX = components_fxCinema.CINEMA_FX;
exports.cameraFrame = components_fxCinema.cameraFrame;
exports.registerCinemaPack = components_fxCinema.registerCinemaPack;
exports.EFFECT_PACKS = EFFECT_PACKS;
exports.registerEffectPacks = registerEffectPacks;
//# sourceMappingURL=fx2.cjs.map
