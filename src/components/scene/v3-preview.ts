/**
 * `motionary/scene/v3-preview` (= `motionary/components/scene-v3-preview`) — the 15.9 preview name of
 * `motionary/scene/v3`. Deprecated in 16.9, **removed in 17.0**: import from `motionary/scene/v3` instead
 * (`npx motionary migrate --to 17 --write` rewrites the imports; docs/deprecations-v17.md#scene-v3-preview).
 * Everything is forwarded unchanged; the first call of a function warns once per session (no side effect on import).
 */
import * as V3 from './v3';
import { deprecate } from '../base';

export * from './v3';

const once = () => deprecate('scene-v3-preview', "motionary/scene/v3-preview is removed in 17.0 — import from 'motionary/scene/v3' (npx motionary migrate --to 17 --write; docs/deprecations-v17.md#scene-v3-preview)");
const wrap = <F extends (...a: any[]) => any>(f: F): F => ((...a: any[]) => (once(), f(...a))) as F;

export const validateSceneV3 = /*#__PURE__*/ wrap(V3.validateSceneV3);
export const isSceneV3 = /*#__PURE__*/ wrap(V3.isSceneV3);
export const normalizeSceneV3 = /*#__PURE__*/ wrap(V3.normalizeSceneV3);
export const serializeSceneV3 = /*#__PURE__*/ wrap(V3.serializeSceneV3);
export const migrateToSceneV3 = /*#__PURE__*/ wrap(V3.migrateToSceneV3);
export const sceneV3ToV2 = /*#__PURE__*/ wrap(V3.sceneV3ToV2);
export const flatSceneV3ToV2 = /*#__PURE__*/ wrap(V3.flatSceneV3ToV2);
export const sceneV2ToFlatV3 = /*#__PURE__*/ wrap(V3.sceneV2ToFlatV3);
