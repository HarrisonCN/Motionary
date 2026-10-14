interface AnimationTrack {
    /** Selector inside the player (`:scope` = the player). */
    target?: string;
    /** Start time in ms. */
    start?: number;
    duration?: number;
    /** A timeline preset (`fade-up`, `scale`, `blur`…). */
    preset?: string;
    keyframes?: Keyframe[];
    easing?: string;
    /** A registered effect fired at `start` (instead of keyframes). */
    effect?: string;
    options?: Record<string, unknown>;
    label?: string;
}
interface AnimationJSON {
    format?: string;
    version?: number;
    name?: string;
    loop?: boolean;
    /** Total length; defaults to the end of the last track. */
    duration?: number;
    tracks: AnimationTrack[];
}

/** What this layer covers (ids match docs/deprecations-v14.md). */
declare const COMPAT_V13: {
    readonly removedIn: "14.0";
    readonly plannedRemoval: "15.0";
    readonly covers: readonly ["player-playground-format", "player-unversioned-json", "normalize-animation", "old-codemods"];
    /** 14.9: the anchors in docs/deprecations-v15.md. */
    readonly removalIds: readonly ["compat-v13-entry", "install-compat-v13", "normalize-animation", "upgrade-legacy-animation", "old-codemods"];
};
/**
 * A 13.x legacy document (playground state, or animation JSON without `format` / `version`) as
 * animation JSON v1; `null` for anything else (current documents included). Pure; never warns.
 * @deprecated removed in 15.0 — use `migrateToSceneV2()` from `motionary/scene` (docs/deprecations-v15.md#upgrade-legacy-animation).
 */
declare function upgradeLegacyAnimation(input: unknown): AnimationJSON | null;
/**
 * Let `<usa-player>` / `createPlayer()` read the removed 13.x documents again. Returns an uninstall.
 * @deprecated removed in 15.0 — convert the data once with `npx motionary migrate --to 15` (docs/deprecations-v15.md#install-compat-v13).
 */
declare function installCompatV13(): () => void;
/**
 * Validate / normalise an animation (object or JSON text); throws on anything unusable.
 * @deprecated removed from `motionary/components/effects` in 14.0 — use `validateSceneV2()` /
 * `migrateToSceneV2()` from `motionary/scene`. The whole entry is removed in 15.0 (docs/deprecations-v15.md#normalize-animation).
 */
declare function normalizeAnimation(input: string | AnimationJSON | Record<string, any>): Required<Pick<AnimationJSON, 'tracks' | 'duration' | 'loop' | 'name'>>;

export { COMPAT_V13, installCompatV13, normalizeAnimation, upgradeLegacyAnimation };
