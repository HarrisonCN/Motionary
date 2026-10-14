import { n as normalizePlayable } from '../chunks/player-eetsAsgZ.js';
import { s as setLegacyAnimationLoader, A as ANIMATION_FORMAT } from '../chunks/player-core-BGIt5Gzl.js';

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
const seen = /*#__PURE__*/ new Set();
/** The 14.0 removals that warn at runtime in development (id → what replaces it). */
const DEPRECATIONS_V14 = {
    'player-playground-format': 'the use-scroll-animate/playground document format — migrate with `npx motionary migrate` (scene v2) or export animation JSON from the playground',
    'player-unversioned-json': 'animation JSON without "format" and "version" — add format "use-scroll-animate/animation", version 1, or migrate to scene v2',
    'normalize-animation': 'normalizeAnimation() — validate with validateSceneV2() / migrateToSceneV2() from motionary/scene',
};
/**
 * 14.9: what 15.0 removes (docs/deprecations-v15.md; id = anchor). All of it is `motionary/compat-v13`
 * and the CLI's 13.x codemod runner. Find uses with `npx motionary doctor --v15`, move with
 * `npx motionary migrate --to 15`.
 */
const DEPRECATIONS_V15 = {
    'compat-v13-entry': 'the motionary/compat-v13 entry (= motionary/components/compat-v13)',
    'install-compat-v13': 'installCompatV13() (13.x player documents in <usa-player> / createPlayer()) — convert the data once with `npx motionary migrate --to 15`',
    'normalize-animation': 'normalizeAnimation() — use validateSceneV2() / migrateToSceneV2() from motionary/scene',
    'upgrade-legacy-animation': 'upgradeLegacyAnimation() — use migrateToSceneV2() from motionary/scene',
    'old-codemods': '`motionary codemod <5–10>` (the 13.x upgrade tools) — run them with a 14.x CLI before upgrading, or use `npx motionary migrate --to 15`',
};
/** v14 notice → the 15.0 removal that ends it. */
const V15_OF = {
    'player-playground-format': 'install-compat-v13',
    'player-unversioned-json': 'install-compat-v13',
    'normalize-animation': 'normalize-animation',
};
const DOCS = 'https://github.com/HarrisonCN/Motionary/blob/main/docs/';
/** Print a one-time `console.warn` for `id` (call it only behind the NODE_ENV check above). */
function warnDeprecated(id) {
    if (seen.has(id) || globalThis.MOTIONARY_NO_DEPRECATION)
        return;
    seen.add(id);
    const v14 = DEPRECATIONS_V14[id];
    const v15 = v14 ? V15_OF[id] : id;
    const tail = `removed in 15.0 together with motionary/compat-v13: ${DOCS}deprecations-v15.md#${v15}`;
    // eslint-disable-next-line no-console
    console.warn(v14
        ? `[motionary] removed in 14.0, served by motionary/compat-v13 until 15.0: ${v14}. See ${DOCS}deprecations-v14.md#${id} — ${tail}`
        : `[motionary] ${DEPRECATIONS_V15[v15]} is ${tail}`);
}

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
 * Planned removal: 15.0 (docs/deprecations-v15.md, 14.9). Find every use with
 * `npx motionary doctor --v15`; move off it with `npx motionary migrate --to 15`.
 */
/** What this layer covers (ids match docs/deprecations-v14.md). */
const COMPAT_V13 = {
    removedIn: '14.0',
    plannedRemoval: '15.0',
    covers: ['player-playground-format', 'player-unversioned-json', 'normalize-animation', 'old-codemods'],
    /** 14.9: the anchors in docs/deprecations-v15.md. */
    removalIds: ['compat-v13-entry', 'install-compat-v13', 'normalize-animation', 'upgrade-legacy-animation', 'old-codemods'],
};
function decodePlayground(state) {
    try {
        const b64 = state.replace(/-/g, '+').replace(/_/g, '/');
        const bin = typeof atob === 'function' ? atob(b64) : '';
        const json = decodeURIComponent(Array.from(bin, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
        const t = (JSON.parse(json).t || []);
        return t.map(([preset, start, duration, label], i) => ({ target: `:scope > :nth-child(${i + 1})`, preset, start, duration, label }));
    }
    catch {
        return [];
    }
}
/**
 * A 13.x legacy document (playground state, or animation JSON without `format` / `version`) as
 * animation JSON v1; `null` for anything else (current documents included). Pure; never warns.
 * @deprecated removed in 15.0 — use `migrateToSceneV2()` from `motionary/scene` (docs/deprecations-v15.md#upgrade-legacy-animation).
 */
function upgradeLegacyAnimation(input) {
    let d = input;
    if (typeof input === 'string') {
        try {
            d = JSON.parse(input);
        }
        catch {
            return null;
        }
    }
    if (!d || typeof d !== 'object')
        return null;
    if (d.format === 'use-scroll-animate/playground')
        return { format: ANIMATION_FORMAT, version: 1, name: typeof d.name === 'string' ? d.name : 'playground', tracks: decodePlayground(String(d.state || '')) };
    if (d.format === undefined && d.version === undefined && Array.isArray(d.tracks))
        return { ...d, format: ANIMATION_FORMAT, version: 1 };
    return null;
}
/**
 * Let `<usa-player>` / `createPlayer()` read the removed 13.x documents again. Returns an uninstall.
 * @deprecated removed in 15.0 — convert the data once with `npx motionary migrate --to 15` (docs/deprecations-v15.md#install-compat-v13).
 */
function installCompatV13() {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production')
        warnDeprecated('install-compat-v13');
    return setLegacyAnimationLoader((d) => {
        const up = upgradeLegacyAnimation(d);
        if (up && typeof process !== 'undefined' && process.env.NODE_ENV !== 'production')
            warnDeprecated(d.format ? 'player-playground-format' : 'player-unversioned-json');
        return up;
    });
}
/**
 * Validate / normalise an animation (object or JSON text); throws on anything unusable.
 * @deprecated removed from `motionary/components/effects` in 14.0 — use `validateSceneV2()` /
 * `migrateToSceneV2()` from `motionary/scene`. The whole entry is removed in 15.0 (docs/deprecations-v15.md#normalize-animation).
 */
function normalizeAnimation(input) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production')
        warnDeprecated('normalize-animation');
    const d = typeof input === 'string' ? JSON.parse(input) : input;
    return normalizePlayable(upgradeLegacyAnimation(d) || d);
}

export { COMPAT_V13, installCompatV13, normalizeAnimation, upgradeLegacyAnimation };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.9.0/dist/components/compat-v13.js.map