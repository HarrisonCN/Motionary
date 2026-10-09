export { EFFECT_PACK_FORMAT, loadEffectPack, packManifest, validateManifest } from './marketplace.js';
import { G as GPU_FX, r as registerGpuPack } from '../chunks/gpu-CB8frFOD.js';
export { a as GLSL_HEAD, W as WGSL_HEAD, f as fieldFallback, g as glslToWgsl, s as shaderBackground, b as supportsWebGL2, c as supportsWebGPU, w as webgpuBackground, d as wgslModule } from '../chunks/gpu-CB8frFOD.js';
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
import '../chunks/registry-CnO7ZVPK.js';
import '../chunks/base-CLuqlLfG.js';
import '../chunks/generative-2LhxG5BJ.js';
import '../chunks/shared-CkKHWrtJ.js';
import '../chunks/audio-CynhhWDi.js';

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
}

export { AI_FX, CHART_FX, CYBER_FX, DEPTH3_FX, EFFECT_PACKS, FESTIVAL_FX, FOCUS_FX, FORM_FX, GAME_FX, GEO_FX, GPU_FX, LIGHT_FX, MORPH2_FX, MUSIC_FX, ORGANIC_FX, PAPER_FX, PHYSICS2_FX, RETRO_FX, SHOP_FX, SOCIAL_FX, SURFACE_FX, TEXT3_FX, TRANSITIONS2_FX, WEATHER_FX, register3dPack, registerAiPack, registerChartPack, registerCyberPack, registerEffectPacks, registerFestivalPack, registerFocusPack, registerFormPack, registerGamePack, registerGeoPack, registerGpuPack, registerLightPack, registerMorphPack, registerMusicPack, registerOrganicPack, registerPaperPack, registerPhysicsPack, registerRetroPack, registerShopPack, registerSocialPack, registerSurfacePack, registerTextPack, registerTransitionsPack, registerWeatherPack };
//# sourceMappingURL=fx2.js.map
