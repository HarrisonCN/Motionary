import { validateSceneV3 as validateSceneV3$1, isSceneV3 as isSceneV3$1, normalizeSceneV3 as normalizeSceneV3$1, serializeSceneV3 as serializeSceneV3$1, migrateToSceneV3 as migrateToSceneV3$1, sceneV3ToV2 as sceneV3ToV2$1 } from './scene-v3.js';
export { DEPRECATIONS_V16, SCENE_V3_FORMAT, SCENE_V3_LIMITS, SCENE_V3_STATUS, SCENE_V3_VERSION } from './scene-v3.js';
import { F as deprecate } from '../chunks/base-QrtwTUOO.js';
import { f as flatSceneV3ToV2$1, s as sceneV2ToFlatV3$1 } from '../chunks/v3-read-BqgIjLQP.js';

/**
 * `motionary/scene/v3-preview` (= `motionary/components/scene-v3-preview`) — the 15.9 preview name of
 * `motionary/scene/v3`. Deprecated in 16.9, **removed in 17.0**: import from `motionary/scene/v3` instead
 * (`npx motionary migrate --to 17 --write` rewrites the imports; docs/deprecations-v17.md#scene-v3-preview).
 * Everything is forwarded unchanged; the first call of a function warns once per session (no side effect on import).
 */
const once = () => deprecate('scene-v3-preview', "motionary/scene/v3-preview is removed in 17.0 — import from 'motionary/scene/v3' (npx motionary migrate --to 17 --write; docs/deprecations-v17.md#scene-v3-preview)");
const wrap = (f) => ((...a) => (once(), f(...a)));
const validateSceneV3 = /*#__PURE__*/ wrap(validateSceneV3$1);
const isSceneV3 = /*#__PURE__*/ wrap(isSceneV3$1);
const normalizeSceneV3 = /*#__PURE__*/ wrap(normalizeSceneV3$1);
const serializeSceneV3 = /*#__PURE__*/ wrap(serializeSceneV3$1);
const migrateToSceneV3 = /*#__PURE__*/ wrap(migrateToSceneV3$1);
const sceneV3ToV2 = /*#__PURE__*/ wrap(sceneV3ToV2$1);
const flatSceneV3ToV2 = /*#__PURE__*/ wrap(flatSceneV3ToV2$1);
const sceneV2ToFlatV3 = /*#__PURE__*/ wrap(sceneV2ToFlatV3$1);

export { flatSceneV3ToV2, isSceneV3, migrateToSceneV3, normalizeSceneV3, sceneV2ToFlatV3, sceneV3ToV2, serializeSceneV3, validateSceneV3 };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.9.0/dist/components/scene-v3-preview.js.map