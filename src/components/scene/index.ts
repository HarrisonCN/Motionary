/**
 * motionary/components/scene-v2 — 13.9 DRAFT of the 14.0 Scene Format
 * (`motionary-scene` v2): types, JSON Schema, a non-throwing validator,
 * converters from / to the 13.x formats and the migration behind
 * `npx motionary migrate`. Opt-in entry, not part of `motionary/components`
 * or lite. The format may still change before 14.0 (docs/scene-v2.md).
 *
 * ```ts
 * import { migrateToSceneV2, validateSceneV2 } from 'motionary/components/scene-v2';
 * const { ok, doc, report } = migrateToSceneV2(timelineJson);
 * ```
 */
export * from './v2';
export { SCENE_V2_SCHEMA } from './schema';
