'use strict';

var components_fxGpu = require('../chunks/gpu-cUixt7kT.cjs');
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
var components_fxLottie = require('./fx-lottie.cjs');
var components_fxGenart = require('./fx-genart.cjs');
var components_fxVideo = require('./fx-video.cjs');
var components_fxSafe = require('./fx-safe.cjs');
var components_fxPerf = require('./fx-perf.cjs');
require('../chunks/registry-xQZnSqqV.cjs');
require('../chunks/base-DBheNxJu.cjs');
require('../chunks/generative-BHIj-NU0.cjs');
require('../chunks/shared-jkgRH-Hx.cjs');
require('../chunks/audio-BpU-A1m1.cjs');

const P = (name, effects) => ({ name, effects });
/** The `gpu` pack. */
const gpu = P('gpu', components_fxGpu.GPU_FX);
/** The `text` pack. */
const text = P('text', components_fxText.TEXT3_FX);
/** The `light` pack. */
const light = P('light', components_fxLight.LIGHT_FX);
/** The `depth` pack. */
const depth = P('depth', components_fx3d.DEPTH3_FX);
/** The `morph` pack. */
const morph = P('morph', components_fxMorph.MORPH2_FX);
/** The `transitions` pack. */
const transitions = P('transitions', components_fxTransitions.TRANSITIONS2_FX);
/** The `weather` pack. */
const weather = P('weather', components_fxWeather.WEATHER_FX);
/** The `physics` pack. */
const physics = P('physics', components_fxPhysics.PHYSICS2_FX);
/** The `focus` pack. */
const focus = P('focus', components_fxFocus.FOCUS_FX);
/** The `music` pack. */
const music = P('music', components_fxMusic.MUSIC_FX);
/** The `chart` pack. */
const chart = P('chart', components_fxChart.CHART_FX);
/** The `shop` pack. */
const shop = P('shop', components_fxShop.SHOP_FX);
/** The `social` pack. */
const social = P('social', components_fxSocial.SOCIAL_FX);
/** The `game` pack. */
const game = P('game', components_fxGame.GAME_FX);
/** The `geo` pack. */
const geo = P('geo', components_fxGeo.GEO_FX);
/** The `form` pack. */
const form = P('form', components_fxForm.FORM_FX);
/** The `ai` pack. */
const ai = P('ai', components_fxAi.AI_FX);
/** The `festival` pack. */
const festival = P('festival', components_fxFestival.FESTIVAL_FX);
/** The `retro` pack. */
const retro = P('retro', components_fxRetro.RETRO_FX);
/** The `organic` pack. */
const organic = P('organic', components_fxOrganic.ORGANIC_FX);
/** The `cyber` pack. */
const cyber = P('cyber', components_fxCyber.CYBER_FX);
/** The `paper` pack. */
const paper = P('paper', components_fxPaper.PAPER_FX);
/** The `surface` pack. */
const surface = P('surface', components_fxSurface.SURFACE_FX);
/** The `gesture3` pack. */
const gesture3 = P('gesture3', components_fxGesture.GESTURE3_FX);
/** The `spatial` pack. */
const spatial = P('spatial', components_fxSpatial.SPATIAL_FX);
/** The `cinema` pack. */
const cinema = P('cinema', components_fxCinema.CINEMA_FX);
/** The `lottie` pack. */
const lottie = P('lottie', components_fxLottie.LOTTIE_FX);
/** The `genart` pack. */
const genart = P('genart', components_fxGenart.GENART_FX);
/** The `video` pack. */
const video = P('video', components_fxVideo.VIDEO_FX);
/** The `safe` pack. */
const safe = P('safe', components_fxSafe.SAFE_FX);
/** The `perf3` pack. */
const perf3 = P('perf3', components_fxPerf.PERF3_FX);
/** Every built-in plugin. */
const ALL_PLUGINS = [gpu, text, light, depth, morph, transitions, weather, physics, focus, music, chart, shop, social, game, geo, form, ai, festival, retro, organic, cyber, paper, surface, gesture3, spatial, cinema, lottie, genart, video, safe, perf3];

exports.ALL_PLUGINS = ALL_PLUGINS;
exports.ai = ai;
exports.chart = chart;
exports.cinema = cinema;
exports.cyber = cyber;
exports.depth = depth;
exports.festival = festival;
exports.focus = focus;
exports.form = form;
exports.game = game;
exports.genart = genart;
exports.geo = geo;
exports.gesture3 = gesture3;
exports.gpu = gpu;
exports.light = light;
exports.lottie = lottie;
exports.morph = morph;
exports.music = music;
exports.organic = organic;
exports.paper = paper;
exports.perf3 = perf3;
exports.physics = physics;
exports.retro = retro;
exports.safe = safe;
exports.shop = shop;
exports.social = social;
exports.spatial = spatial;
exports.surface = surface;
exports.text = text;
exports.transitions = transitions;
exports.video = video;
exports.weather = weather;
//# sourceMappingURL=plugins.cjs.map
