// 12.5: version history for every component and runtime module, from CHANGELOG.md — the version it first appears in (`since`,
// unless its gallery card already states one) and every later release whose notes mention it (`changed`). Pure functions.
// Read by scripts/gen-manifest.mjs (manifest fields), bin/motionary-mcp.mjs (answers for an installed version) and
// `npx motionary compat <version>`.

/** '11.8.0' / '11.8' / 'v11' → [11, 8, 0]. */
export const parseVer = (v) => String(v || '0').replace(/^v/, '').split('.').map((x) => parseInt(x, 10) || 0).concat([0, 0, 0]).slice(0, 3);
/** -1 / 0 / 1 */
export function cmpVer(a, b) {
  const x = parseVer(a), y = parseVer(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}
const minor = (v) => parseVer(v).slice(0, 2).join('.');

/** CHANGELOG.md → [{ version: '11.8.0', body }] (oldest first; [Unreleased] skipped). */
export function releases(changelog) {
  const out = [];
  const re = /^## \[(\d+\.\d+\.\d+)\][^\n]*\n([\s\S]*?)(?=^## \[|(?![\s\S]))/gm;
  for (const m of String(changelog || '').matchAll(re)) out.push({ version: m[1], body: m[2] });
  return out.sort((a, b) => cmpVer(a.version, b.version));
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** { key: RegExp } → { key: ['X.Y', …] } (major.minor, oldest first, unique). */
export function mentions(changelog, patterns) {
  const rel = releases(changelog), out = {};
  for (const [k, re] of Object.entries(patterns)) {
    const seen = [];
    for (const r of rel) { const v = minor(r.version); if (re.test(r.body) && !seen.includes(v)) seen.push(v); }
    out[k] = seen;
  }
  return out;
}

export const componentPattern = (tag) => new RegExp(`<${esc(tag)}[\\s>/]|\`${esc(tag)}\``);
export const modulePattern = (id) => (id === 'core' ? /motionary\/runtime(?![\/\w-])/ : new RegExp(`motionary/runtime/${esc(id)}(?![\\w-])`));

/** since (card value wins) + changed (later releases that mention it). */
export function historyFor(found, cardSince) {
  const since = cardSince || found[0] || undefined;
  const changed = since ? found.filter((v) => cmpVer(v, since) > 0) : [];
  return { since, changed };
}

/** For an installed version: is it there, and what changed after it? */
export function compatAt(item, installed) {
  const available = !item.since || cmpVer(item.since, installed) <= 0;
  const changedAfter = (item.changed || []).filter((v) => cmpVer(v, minor(installed)) > 0);
  return { available, since: item.since || null, changedAfter };
}
