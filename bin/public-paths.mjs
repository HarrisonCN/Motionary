// 11.5: the public subpaths by layer (docs/public-api.md, docs/architecture.md).
// Shared by scripts/sync-exports.mjs, scripts/gen-deprecated-types.mjs, bin/motionary.mjs (doctor) and bin/usa-codemod-12.mjs.

/** New subpath → the existing subpath whose files it serves. Aliases point at the SAME dist files, so they add 0 bytes anywhere. */
export const LAYER_ALIASES = {
  'tooling/ai': 'components/ai',
  'tooling/design': 'components/design',
  'tooling/manifest.json': 'manifest.json',
  'tooling/manifest.schema.json': 'manifest.schema.json',
  angular: 'components/angular',
};

/**
 * Old subpath → its replacement. The old paths keep working through 12.x and are removed in 13.0.
 * Nothing warns at runtime (imports stay side-effect free, the 11.1 guarantee): the old paths' type
 * declarations mark every export `@deprecated`, `npx motionary doctor` lists them, `npx usa-codemod-12 --write` rewrites them.
 */
export const DEPRECATED_PATHS = {
  'components/core': 'core',
  'components/ai': 'tooling/ai',
  'components/design': 'tooling/design',
  design: 'tooling/design',
  'components/angular': 'angular',
  'manifest.json': 'tooling/manifest.json',
  'manifest.schema.json': 'tooling/manifest.schema.json',
};

/** Release in which the old paths are removed. */
export const REMOVED_IN = '13.0';

/** The four layers + framework entries, as documented (docs/public-api.md). */
export const LAYERS = {
  core: ['core', 'runtime'],
  runtime: ['runtime/*'],
  components: ['components', 'components/*', 'widgets/*', 'effects/*'],
  tooling: ['tooling/ai', 'tooling/design', 'tooling/manifest.json', 'tooling/manifest.schema.json'],
  frameworks: ['react', 'vue', 'svelte', 'solid', 'angular'],
};

const PKG = '(motionary|use-scroll-animate)';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/** Rewrite every old subpath inside a quoted module specifier (import / export / require / import()). Returns { code, hits }. */
export function rewritePaths(source) {
  const hits = [];
  let code = source;
  for (const [from, to] of Object.entries(DEPRECATED_PATHS)) {
    const re = new RegExp(`(['"\`])${PKG}/${esc(from)}(['"\`])`, 'g');
    code = code.replace(re, (m, q1, pkg, q2) => {
      hits.push({ from: `${pkg}/${from}`, to: `${pkg}/${to}` });
      return `${q1}${pkg}/${to}${q2}`;
    });
  }
  return { code, hits };
}

/** Find old subpaths with their 1-based line numbers (for `motionary doctor`). */
export function findOldPaths(source) {
  const out = [];
  source.split('\n').forEach((line, i) => {
    for (const h of rewritePaths(line).hits) out.push({ line: i + 1, ...h });
  });
  return out;
}

// 11.9: legacy event names (11.8 fires the usa:* names next to them; the legacy names are removed in 12.0).
export const LEGACY_EVENTS = {
  'usa-beat': 'usa:beat',
  'usa-audio-error': 'usa:audio-error',
  'usa-player-ready': 'usa:ready',
  'usa-player-finish': 'usa:finish',
  'usa-story-step': 'usa:step',
};
export const EVENTS_REMOVED_IN = '12.0';

/** Rewrite legacy event names where they are used as event names: quoted strings ('usa-beat'), Vue `@usa-beat`,
 * Angular `(usa-beat)`, Svelte `on:usa-beat`. `data-usa-beat` attributes and `<usa-…>` tags are left alone. */
export function rewriteEvents(source) {
  const hits = [];
  let code = source;
  for (const [from, to] of Object.entries(LEGACY_EVENTS)) {
    const re = new RegExp(`(['"\`]|@|\\(|on:)${esc(from)}(?![\\w-])`, 'g');
    code = code.replace(re, (m, pre) => {
      hits.push({ from, to, kind: 'event' });
      return `${pre}${to}`;
    });
  }
  return { code, hits };
}

/** Every deprecated import path and legacy event name with its line (for `motionary doctor`). */
export function findDeprecated(source) {
  const out = [];
  source.split('\n').forEach((line, i) => {
    for (const h of rewritePaths(line).hits) out.push({ line: i + 1, kind: 'path', removedIn: REMOVED_IN, ...h });
    for (const h of rewriteEvents(line).hits) out.push({ line: i + 1, removedIn: EVENTS_REMOVED_IN, ...h });
  });
  return out;
}
