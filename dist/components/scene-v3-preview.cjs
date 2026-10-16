'use strict';

var components_sceneV3 = require('./scene-v3.cjs');
var base = require('../chunks/base-BvH4nAcv.cjs');
var v3Read = require('../chunks/v3-read-BNhrN3tL.cjs');

/**
 * `motionary/scene/v3-preview` (= `motionary/components/scene-v3-preview`) — the 15.9 preview name of
 * `motionary/scene/v3`. Deprecated in 16.9, **removed in 17.0**: import from `motionary/scene/v3` instead
 * (`npx motionary migrate --to 17 --write` rewrites the imports; docs/deprecations-v17.md#scene-v3-preview).
 * Everything is forwarded unchanged; the first call of a function warns once per session (no side effect on import).
 */
const once = () => base.deprecate('scene-v3-preview', "motionary/scene/v3-preview is removed in 17.0 — import from 'motionary/scene/v3' (npx motionary migrate --to 17 --write; docs/deprecations-v17.md#scene-v3-preview)");
const wrap = (f) => ((...a) => (once(), f(...a)));
const validateSceneV3 = /*#__PURE__*/ wrap(components_sceneV3.validateSceneV3);
const isSceneV3 = /*#__PURE__*/ wrap(components_sceneV3.isSceneV3);
const normalizeSceneV3 = /*#__PURE__*/ wrap(components_sceneV3.normalizeSceneV3);
const serializeSceneV3 = /*#__PURE__*/ wrap(components_sceneV3.serializeSceneV3);
const migrateToSceneV3 = /*#__PURE__*/ wrap(components_sceneV3.migrateToSceneV3);
const sceneV3ToV2 = /*#__PURE__*/ wrap(components_sceneV3.sceneV3ToV2);
const flatSceneV3ToV2 = /*#__PURE__*/ wrap(v3Read.flatSceneV3ToV2);
const sceneV2ToFlatV3 = /*#__PURE__*/ wrap(v3Read.sceneV2ToFlatV3);

exports.DEPRECATIONS_V16 = components_sceneV3.DEPRECATIONS_V16;
exports.SCENE_V3_FORMAT = components_sceneV3.SCENE_V3_FORMAT;
exports.SCENE_V3_LIMITS = components_sceneV3.SCENE_V3_LIMITS;
exports.SCENE_V3_STATUS = components_sceneV3.SCENE_V3_STATUS;
exports.SCENE_V3_VERSION = components_sceneV3.SCENE_V3_VERSION;
exports.flatSceneV3ToV2 = flatSceneV3ToV2;
exports.isSceneV3 = isSceneV3;
exports.migrateToSceneV3 = migrateToSceneV3;
exports.normalizeSceneV3 = normalizeSceneV3;
exports.sceneV2ToFlatV3 = sceneV2ToFlatV3;
exports.sceneV3ToV2 = sceneV3ToV2;
exports.serializeSceneV3 = serializeSceneV3;
exports.validateSceneV3 = validateSceneV3;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.9.0/dist/components/scene-v3-preview.cjs.map