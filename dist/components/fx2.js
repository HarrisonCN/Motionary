export { E as EFFECT_PACK_FORMAT, l as loadEffectPack, p as packManifest, v as validateManifest } from '../chunks/manifest-pFJWahGJ.js';
import { G as GPU_FX, r as registerGpuPack } from '../chunks/gpu-ML0i9eNv.js';
export { a as GLSL_HEAD, W as WGSL_HEAD, f as fieldFallback, g as glslToWgsl, s as shaderBackground, b as supportsWebGL2, c as supportsWebGPU, w as webgpuBackground, d as wgslModule } from '../chunks/gpu-ML0i9eNv.js';
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
import { MUSIC_FX, registerMusicPack } from './fx-music.js';
export { musicSample, syntheticSample } from './fx-music.js';
import { CHART_FX, registerChartPack } from './fx-chart.js';
export { parseFigure } from './fx-chart.js';
import { SHOP_FX, registerShopPack } from './fx-shop.js';
export { arcPath } from './fx-shop.js';
import { SOCIAL_FX, registerSocialPack } from './fx-social.js';
export { fanAngles } from './fx-social.js';
import { GAME_FX, registerGamePack } from './fx-game.js';
export { throwPath } from './fx-game.js';
import { GEO_FX, registerGeoPack } from './fx-geo.js';
export { routeLength } from './fx-geo.js';
import { FORM_FX, registerFormPack } from './fx-form.js';
export { shakeFrames } from './fx-form.js';
import { AI_FX, registerAiPack } from './fx-ai.js';
export { splitWords } from './fx-ai.js';
import { FESTIVAL_FX, registerFestivalPack } from './fx-festival.js';
export { sparkVectors } from './fx-festival.js';
import { RETRO_FX, registerRetroPack } from './fx-retro.js';
export { pixelSteps } from './fx-retro.js';
import { ORGANIC_FX, registerOrganicPack } from './fx-organic.js';
export { blobRadius } from './fx-organic.js';
import { CYBER_FX, registerCyberPack } from './fx-cyber.js';
export { decodeFrame } from './fx-cyber.js';
import { PAPER_FX, registerPaperPack } from './fx-paper.js';
export { paperRandom, roughLine } from './fx-paper.js';
import { SURFACE_FX, registerSurfacePack } from './fx-surface.js';
export { SURFACE_THEMES, applySurfaceTheme } from './fx-surface.js';
import { GESTURE3_FX, registerGesture3Pack } from './fx-gesture.js';
export { orientationToTilt, pinchAngle, pinchScale } from './fx-gesture.js';
import { SPATIAL_FX, registerSpatialPack } from './fx-spatial.js';
export { xrSupport, yawToOffset } from './fx-spatial.js';
import { CINEMA_FX, registerCinemaPack } from './fx-cinema.js';
export { CAMERA_MOVES, cameraFrame } from './fx-cinema.js';
import { LOTTIE_FX, registerLottiePack } from './fx-lottie.js';
export { lottieToKeyframes, lottieToSvg, riveInputs } from './fx-lottie.js';
import { GENART_FX, registerGenArtPack } from './fx-genart.js';
export { PALETTES, meshGradient, seededRandom } from './fx-genart.js';
import { VIDEO_FX, registerVideoPack } from './fx-video.js';
export { frameSequence, scrollProgress, scrubVideo } from './fx-video.js';
import { SAFE_FX, registerSafePack } from './fx-safe.js';
export { DEFAULT_MOTION_PREFS, MOTION_PREFS_KEY, applyMotionPreferences, flashCount, isFlashSafe, loadMotionPreferences, vestibularSafe } from './fx-safe.js';
import { PERF3_FX, registerPerf3Pack } from './fx-perf.js';
export { fpsMeter, offscreenRender, runInWorker } from './fx-perf.js';
import { registerEffects } from '../chunks/registry-CYojuxi5.js';
import '../chunks/generative-2LhxG5BJ.js';
import '../chunks/shared-CkKHWrtJ.js';
import '../chunks/base-zSGb8ujt.js';
import '../chunks/audio-Ds5ppQVV.js';

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
    music: MUSIC_FX,
    chart: CHART_FX,
    shop: SHOP_FX,
    social: SOCIAL_FX,
    game: GAME_FX,
    geo: GEO_FX,
    form: FORM_FX,
    ai: AI_FX,
    festival: FESTIVAL_FX,
    retro: RETRO_FX,
    organic: ORGANIC_FX,
    cyber: CYBER_FX,
    paper: PAPER_FX,
    surface: SURFACE_FX,
    gesture3: GESTURE3_FX,
    spatial: SPATIAL_FX,
    cinema: CINEMA_FX,
    lottie: LOTTIE_FX,
    genart: GENART_FX,
    video: VIDEO_FX,
    safe: SAFE_FX,
    perf3: PERF3_FX,
};
/** Register every built-in effect pack — each one is a plugin (9.9; idempotent). */
function registerAllPlugins() {
    registerGpuPack();
    registerTextPack();
    registerLightPack();
    register3dPack();
    registerMorphPack();
    registerTransitionsPack();
    registerWeatherPack();
    registerPhysicsPack();
    registerFocusPack();
    registerMusicPack();
    registerChartPack();
    registerShopPack();
    registerSocialPack();
    registerGamePack();
    registerGeoPack();
    registerFormPack();
    registerAiPack();
    registerFestivalPack();
    registerRetroPack();
    registerOrganicPack();
    registerCyberPack();
    registerPaperPack();
    registerSurfacePack();
    registerGesture3Pack();
    registerSpatialPack();
    registerCinemaPack();
    registerLottiePack();
    registerGenArtPack();
    registerVideoPack();
    registerSafePack();
    registerPerf3Pack();
}
const PACK_SOURCES = EFFECT_PACKS;
/** Make a plugin object (9.9). */
function definePlugin(name, effects, install) {
    return { name, effects, install };
}
/** Every built-in effect pack as a plugin: `{ name: '<pack key>', effects }` — e.g. `retro`, `cinema` (9.9). */
function effectPlugins() {
    return Object.entries(PACK_SOURCES).map(([k, effects]) => ({ name: k, effects }));
}
const usedPlugins = /*#__PURE__*/ new Set();
/** Register plugins (each once); returns the names of their effects (9.9). */
function usePlugins(...plugins) {
    const names = [];
    for (const p of plugins) {
        if (!p || !Array.isArray(p.effects))
            continue;
        if (!usedPlugins.has(p.name)) {
            registerEffects(p.effects);
            p.install?.();
            usedPlugins.add(p.name);
        }
        names.push(...p.effects.map((e) => e.name));
    }
    return names;
}

export { AI_FX, CHART_FX, CINEMA_FX, CYBER_FX, DEPTH3_FX, EFFECT_PACKS, FESTIVAL_FX, FOCUS_FX, FORM_FX, GAME_FX, GENART_FX, GEO_FX, GESTURE3_FX, GPU_FX, LIGHT_FX, LOTTIE_FX, MORPH2_FX, MUSIC_FX, ORGANIC_FX, PAPER_FX, PERF3_FX, PHYSICS2_FX, RETRO_FX, SAFE_FX, SHOP_FX, SOCIAL_FX, SPATIAL_FX, SURFACE_FX, TEXT3_FX, TRANSITIONS2_FX, VIDEO_FX, WEATHER_FX, definePlugin, effectPlugins, register3dPack, registerAiPack, registerAllPlugins, registerChartPack, registerCinemaPack, registerCyberPack, registerFestivalPack, registerFocusPack, registerFormPack, registerGamePack, registerGenArtPack, registerGeoPack, registerGesture3Pack, registerGpuPack, registerLightPack, registerLottiePack, registerMorphPack, registerMusicPack, registerOrganicPack, registerPaperPack, registerPerf3Pack, registerPhysicsPack, registerRetroPack, registerSafePack, registerShopPack, registerSocialPack, registerSpatialPack, registerSurfacePack, registerTextPack, registerTransitionsPack, registerVideoPack, registerWeatherPack, usePlugins };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.3.0/dist/components/fx2.js.map