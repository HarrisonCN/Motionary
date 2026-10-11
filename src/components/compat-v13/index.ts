/**
 * `motionary/compat-v13` (= `motionary/components/compat-v13`, 14.0) — the 13.x interfaces that
 * 14.0 removed from the main entries, kept so an upgrade can happen one step at a time
 * (docs/migrating-to-v14.md). Nothing in `motionary`, `motionary/core`, `motionary/components`
 * or `motionary/components/lite` imports it; it costs nothing unless you import it.
 *
 * - `installCompatV13()` — `<usa-player>` / `createPlayer()` read `use-scroll-animate/playground`
 *   documents and animation JSON without `format` / `version` again (one dev-only notice each).
 * - `normalizeAnimation()` — the 5.9 helper, unchanged (throws on unusable input).
 * - `upgradeLegacyAnimation()` — turn such a document into animation JSON v1 yourself (pure).
 * - The `usa-codemod-5` … `usa-codemod-10` tools: `npx motionary codemod <5–10>`.
 *
 * Planned removal: 15.0. Move off it with `npx motionary migrate` (data) and
 * `npx motionary migrate --code` (imports).
 */
import { setLegacyAnimationLoader, normalizePlayable, ANIMATION_FORMAT } from '../effects/player';
import type { AnimationJSON, AnimationTrack } from '../effects/player';
import { warnDeprecated } from '../deprecations';

declare const process: { env: Record<string, string | undefined> };

/** What this layer covers (ids match docs/deprecations-v14.md). */
export const COMPAT_V13 = {
  removedIn: '14.0',
  plannedRemoval: '15.0',
  covers: ['player-playground-format', 'player-unversioned-json', 'normalize-animation', 'old-codemods'],
} as const;

function decodePlayground(state: string): AnimationTrack[] {
  try {
    const b64 = state.replace(/-/g, '+').replace(/_/g, '/');
    const bin = typeof atob === 'function' ? atob(b64) : '';
    const json = decodeURIComponent(Array.from(bin, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
    const t = (JSON.parse(json).t || []) as [string, number, number, string][];
    return t.map(([preset, start, duration, label], i) => ({ target: `:scope > :nth-child(${i + 1})`, preset, start, duration, label }));
  } catch {
    return [];
  }
}

/**
 * A 13.x legacy document (playground state, or animation JSON without `format` / `version`) as
 * animation JSON v1; `null` for anything else (current documents included). Pure; never warns.
 */
export function upgradeLegacyAnimation(input: unknown): AnimationJSON | null {
  let d: any = input;
  if (typeof input === 'string') { try { d = JSON.parse(input); } catch { return null; } }
  if (!d || typeof d !== 'object') return null;
  if (d.format === 'use-scroll-animate/playground') return { format: ANIMATION_FORMAT, version: 1, name: typeof d.name === 'string' ? d.name : 'playground', tracks: decodePlayground(String(d.state || '')) };
  if (d.format === undefined && d.version === undefined && Array.isArray(d.tracks)) return { ...d, format: ANIMATION_FORMAT, version: 1 };
  return null;
}

/** Let `<usa-player>` / `createPlayer()` read the removed 13.x documents again. Returns an uninstall. */
export function installCompatV13(): () => void {
  return setLegacyAnimationLoader((d) => {
    const up = upgradeLegacyAnimation(d);
    if (up && typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') warnDeprecated(d.format ? 'player-playground-format' : 'player-unversioned-json');
    return up;
  });
}

/**
 * Validate / normalise an animation (object or JSON text); throws on anything unusable.
 * @deprecated removed from `motionary/components/effects` in 14.0 — use `validateSceneV2()` /
 * `migrateToSceneV2()` from `motionary/scene`.
 */
export function normalizeAnimation(input: string | AnimationJSON | Record<string, any>): Required<Pick<AnimationJSON, 'tracks' | 'duration' | 'loop' | 'name'>> {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') warnDeprecated('normalize-animation');
  const d = typeof input === 'string' ? JSON.parse(input) : input;
  return normalizePlayable(upgradeLegacyAnimation(d) || d);
}
