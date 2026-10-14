/**
 * 13.9: deprecation notices for APIs planned for removal in 14.0
 * (docs/deprecations-v14.md). 14.0: those APIs are removed from the main entries and
 * live on in `motionary/compat-v13`, which shows these notices. Development only and once per id:
 *
 * - every call site is written as
 *   `if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') warnDeprecated(…)`,
 *   so a production build (bundlers replace `process.env.NODE_ENV`) drops the call
 *   and its message text entirely;
 * - without a bundler in the browser (`process` is undefined) nothing warns;
 * - only `motionary/compat-v13` imports this (not lite, components, core or the root entry).
 *
 * Silence all notices with `globalThis.MOTIONARY_NO_DEPRECATION = true`.
 */
const seen = /*#__PURE__*/ new Set<string>();

/** The 14.0 removals that warn at runtime in development (id → what replaces it). */
export const DEPRECATIONS_V14 = {
  'player-playground-format': 'the use-scroll-animate/playground document format — migrate with `npx motionary migrate` (scene v2) or export animation JSON from the playground',
  'player-unversioned-json': 'animation JSON without "format" and "version" — add format "use-scroll-animate/animation", version 1, or migrate to scene v2',
  'normalize-animation': 'normalizeAnimation() — validate with validateSceneV2() / migrateToSceneV2() from motionary/scene',
} as const;
export type DeprecationId = keyof typeof DEPRECATIONS_V14;

/**
 * 14.9: what 15.0 removes (docs/deprecations-v15.md; id = anchor). All of it is `motionary/compat-v13`
 * and the CLI's 13.x codemod runner. Find uses with `npx motionary doctor --v15`, move with
 * `npx motionary migrate --to 15`.
 */
export const DEPRECATIONS_V15 = {
  'compat-v13-entry': 'the motionary/compat-v13 entry (= motionary/components/compat-v13)',
  'install-compat-v13': 'installCompatV13() (13.x player documents in <usa-player> / createPlayer()) — convert the data once with `npx motionary migrate --to 15`',
  'normalize-animation': 'normalizeAnimation() — use validateSceneV2() / migrateToSceneV2() from motionary/scene',
  'upgrade-legacy-animation': 'upgradeLegacyAnimation() — use migrateToSceneV2() from motionary/scene',
  'old-codemods': '`motionary codemod <5–10>` (the 13.x upgrade tools) — run them with a 14.x CLI before upgrading, or use `npx motionary migrate --to 15`',
} as const;
export type DeprecationV15Id = keyof typeof DEPRECATIONS_V15;
/** v14 notice → the 15.0 removal that ends it. */
const V15_OF: Record<DeprecationId, DeprecationV15Id> = {
  'player-playground-format': 'install-compat-v13',
  'player-unversioned-json': 'install-compat-v13',
  'normalize-animation': 'normalize-animation',
};
const DOCS = 'https://github.com/HarrisonCN/Motionary/blob/main/docs/';

/** Print a one-time `console.warn` for `id` (call it only behind the NODE_ENV check above). */
export function warnDeprecated(id: DeprecationId | DeprecationV15Id): void {
  if (seen.has(id) || (globalThis as any).MOTIONARY_NO_DEPRECATION) return;
  seen.add(id);
  const v14 = (DEPRECATIONS_V14 as Record<string, string>)[id];
  const v15 = v14 ? V15_OF[id as DeprecationId] : (id as DeprecationV15Id);
  const tail = `removed in 15.0 together with motionary/compat-v13: ${DOCS}deprecations-v15.md#${v15}`;
  // eslint-disable-next-line no-console
  console.warn(v14
    ? `[motionary] removed in 14.0, served by motionary/compat-v13 until 15.0: ${v14}. See ${DOCS}deprecations-v14.md#${id} — ${tail}`
    : `[motionary] ${DEPRECATIONS_V15[v15]} is ${tail}`);
}

/** Tests only: forget which notices were shown. */
export function resetDeprecationWarnings(): void {
  seen.clear();
}
