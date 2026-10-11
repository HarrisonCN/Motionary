/**
 * motionary/scene (= motionary/components/scene-v2) — Scene Format v2
 * (`motionary-scene` v2), the official motion document since 14.0: types,
 * JSON Schema, a non-throwing validator, converters from / to the 13.x formats
 * and the migration behind `npx motionary migrate`. Opt-in entry, not part of
 * `motionary/components` or lite (docs/scene-v2.md).
 *
 * ```ts
 * import { migrateToSceneV2, validateSceneV2 } from 'motionary/scene';
 * const { ok, doc, report } = migrateToSceneV2(timelineJson);
 * ```
 */
export * from './v2';
export { SCENE_V2_SCHEMA } from './schema';
