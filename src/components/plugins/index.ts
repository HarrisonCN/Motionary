/**
 * `motionary/plugins` (10.0) — every built-in effect pack as a plugin for
 * `createMotion().use(…)` (`motionary/core`) or `usePlugins(…)` (`motionary/fx2`).
 * Import only the ones you use; each pulls in just its own pack.
 */
import type { EffectDefinition } from '../fx/registry';
import { GPU_FX } from '../fx2/gpu';
import { TEXT3_FX } from '../fx2/text3';
import { LIGHT_FX } from '../fx2/light';
import { DEPTH3_FX } from '../fx2/depth3';
import { MORPH2_FX } from '../fx2/morph2';
import { TRANSITIONS2_FX } from '../fx2/transitions2';
import { WEATHER_FX } from '../fx2/weather';
import { PHYSICS2_FX } from '../fx2/physics2';
import { FOCUS_FX } from '../fx2/focus';
import { MUSIC_FX } from '../fx2/music';
import { CHART_FX } from '../fx2/chart';
import { SHOP_FX } from '../fx2/shop';
import { SOCIAL_FX } from '../fx2/social';
import { GAME_FX } from '../fx2/game';
import { GEO_FX } from '../fx2/geo';
import { FORM_FX } from '../fx2/form';
import { AI_FX } from '../fx2/ai';
import { FESTIVAL_FX } from '../fx2/festival';
import { RETRO_FX } from '../fx2/retro2';
import { ORGANIC_FX } from '../fx2/organic';
import { CYBER_FX } from '../fx2/cyber';
import { PAPER_FX } from '../fx2/paper';
import { SURFACE_FX } from '../fx2/themefx';
import { GESTURE3_FX } from '../fx2/gesture3';
import { SPATIAL_FX } from '../fx2/spatial';
import { CINEMA_FX } from '../fx2/cinema';
import { LOTTIE_FX } from '../fx2/lottie';
import { GENART_FX } from '../fx2/genart';
import { VIDEO_FX } from '../fx2/video';
import { SAFE_FX } from '../fx2/safemotion';
import { PERF3_FX } from '../fx2/perf3';

export interface EffectPlugin {
  name: string;
  effects: EffectDefinition[];
}
const P = (name: string, effects: EffectDefinition[]): EffectPlugin => ({ name, effects });

/** The `gpu` pack. */
export const gpu = P('gpu', GPU_FX);
/** The `text` pack. */
export const text = P('text', TEXT3_FX);
/** The `light` pack. */
export const light = P('light', LIGHT_FX);
/** The `depth` pack. */
export const depth = P('depth', DEPTH3_FX);
/** The `morph` pack. */
export const morph = P('morph', MORPH2_FX);
/** The `transitions` pack. */
export const transitions = P('transitions', TRANSITIONS2_FX);
/** The `weather` pack. */
export const weather = P('weather', WEATHER_FX);
/** The `physics` pack. */
export const physics = P('physics', PHYSICS2_FX);
/** The `focus` pack. */
export const focus = P('focus', FOCUS_FX);
/** The `music` pack. */
export const music = P('music', MUSIC_FX);
/** The `chart` pack. */
export const chart = P('chart', CHART_FX);
/** The `shop` pack. */
export const shop = P('shop', SHOP_FX);
/** The `social` pack. */
export const social = P('social', SOCIAL_FX);
/** The `game` pack. */
export const game = P('game', GAME_FX);
/** The `geo` pack. */
export const geo = P('geo', GEO_FX);
/** The `form` pack. */
export const form = P('form', FORM_FX);
/** The `ai` pack. */
export const ai = P('ai', AI_FX);
/** The `festival` pack. */
export const festival = P('festival', FESTIVAL_FX);
/** The `retro` pack. */
export const retro = P('retro', RETRO_FX);
/** The `organic` pack. */
export const organic = P('organic', ORGANIC_FX);
/** The `cyber` pack. */
export const cyber = P('cyber', CYBER_FX);
/** The `paper` pack. */
export const paper = P('paper', PAPER_FX);
/** The `surface` pack. */
export const surface = P('surface', SURFACE_FX);
/** The `gesture3` pack. */
export const gesture3 = P('gesture3', GESTURE3_FX);
/** The `spatial` pack. */
export const spatial = P('spatial', SPATIAL_FX);
/** The `cinema` pack. */
export const cinema = P('cinema', CINEMA_FX);
/** The `lottie` pack. */
export const lottie = P('lottie', LOTTIE_FX);
/** The `genart` pack. */
export const genart = P('genart', GENART_FX);
/** The `video` pack. */
export const video = P('video', VIDEO_FX);
/** The `safe` pack. */
export const safe = P('safe', SAFE_FX);
/** The `perf3` pack. */
export const perf3 = P('perf3', PERF3_FX);

/** Every built-in plugin. */
export const ALL_PLUGINS: EffectPlugin[] = [gpu, text, light, depth, morph, transitions, weather, physics, focus, music, chart, shop, social, game, geo, form, ai, festival, retro, organic, cyber, paper, surface, gesture3, spatial, cinema, lottie, genart, video, safe, perf3];
