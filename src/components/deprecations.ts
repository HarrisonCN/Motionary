/**
 * 13.9: deprecation notices for APIs planned for removal in 14.0
 * (docs/deprecations-v14.md). Development only and once per id:
 *
 * - every call site is written as
 *   `if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') warnDeprecated(…)`,
 *   so a production build (bundlers replace `process.env.NODE_ENV`) drops the call
 *   and its message text entirely;
 * - without a bundler in the browser (`process` is undefined) nothing warns;
 * - none of this is imported by `motionary/components/lite` or `motionary/components`.
 *
 * Silence all notices with `globalThis.MOTIONARY_NO_DEPRECATION = true`.
 */
const seen = /*#__PURE__*/ new Set<string>();

/** The 14.0 removals that warn at runtime in development (id → what replaces it). */
export const DEPRECATIONS_V14 = {
  'player-playground-format': 'the use-scroll-animate/playground document format — migrate with `npx motionary migrate` (scene v2) or export animation JSON from the playground',
  'player-unversioned-json': 'animation JSON without "format" and "version" — add format "use-scroll-animate/animation", version 1, or migrate to scene v2',
  'normalize-animation': 'normalizeAnimation() — validate with validateSceneV2() / migrateToSceneV2() from motionary/components/scene-v2',
} as const;
export type DeprecationId = keyof typeof DEPRECATIONS_V14;

/** Print a one-time `console.warn` for `id` (call it only behind the NODE_ENV check above). */
export function warnDeprecated(id: DeprecationId): void {
  if (seen.has(id) || (globalThis as any).MOTIONARY_NO_DEPRECATION) return;
  seen.add(id);
  // eslint-disable-next-line no-console
  console.warn(`[motionary] deprecated (removed in 14.0): ${DEPRECATIONS_V14[id]}. See https://github.com/HarrisonCN/Motionary/blob/main/docs/deprecations-v14.md#${id}`);
}

/** Tests only: forget which notices were shown. */
export function resetDeprecationWarnings(): void {
  seen.clear();
}
