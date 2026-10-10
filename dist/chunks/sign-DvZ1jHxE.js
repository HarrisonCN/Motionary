/**
 * 10.1: plugin signature (integrity) checks and version compatibility.
 *
 * - `pluginIntegrity(code)` → `'sha256-<base64>'` (Subresource-Integrity style).
 * - `verifyPlugin(code, integrity)` → `true` when the code matches (sha256 / sha384 / sha512).
 * - `satisfies(version, range)` — semver ranges: `*`, `x`, `1.2.3`, `=`, `>`, `>=`, `<`, `<=`,
 *   `^`, `~`, `1.x`, hyphen ranges `1.0.0 - 2.0.0`, AND (space) and OR (`||`).
 * - `checkCompat(manifest, version)` — reads `engines.motionary` (or `motionary`) from a plugin manifest.
 */
const ALGO = { sha256: 'SHA-256', sha384: 'SHA-384', sha512: 'SHA-512' };
function b64(buf) {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (const b of bytes)
        s += String.fromCharCode(b);
    return typeof btoa === 'function' ? btoa(s) : globalThis.Buffer.from(bytes).toString('base64');
}
/** SRI-style integrity string of plugin code. Needs Web Crypto (browsers, Node ≥ 18, workers). */
async function pluginIntegrity(code, algo = 'sha256') {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle)
        throw new Error('[motionary] pluginIntegrity(): Web Crypto (crypto.subtle) is not available here');
    const data = typeof code === 'string' ? new TextEncoder().encode(code) : code instanceof Uint8Array ? code : new Uint8Array(code);
    return `${algo}-${b64(await subtle.digest(ALGO[algo], data))}`;
}
/** Does the code match the integrity string (any of several, space-separated)? */
async function verifyPlugin(code, integrity) {
    for (const want of integrity.trim().split(/\s+/)) {
        const algo = want.split('-')[0];
        if (!ALGO[algo])
            continue;
        if ((await pluginIntegrity(code, algo)) === want)
            return true;
    }
    return false;
}
const parse = (v) => {
    const m = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:[-+].*)?$/.exec(v.trim());
    return m ? [+m[1], +(m[2] || 0), +(m[3] || 0)] : null;
};
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
function partial(v) {
    const m = /^v?(\d+|[x*])(?:\.(\d+|[x*]))?(?:\.(\d+|[x*]))?$/i.exec(v.trim());
    if (!m)
        return null;
    const segs = [m[1], m[2], m[3]];
    let parts = 0;
    for (const s of segs) {
        if (s === undefined || /[x*]/i.test(s))
            break;
        parts++;
    }
    return { v: [+(parts > 0 ? segs[0] : 0), +(parts > 1 ? segs[1] : 0), +(parts > 2 ? segs[2] : 0)], parts };
}
function test(ver, comp) {
    const m = /^(\^|~|>=|<=|>|<|=)?\s*(.+)$/.exec(comp.trim());
    if (!m)
        return false;
    const op = m[1] || '';
    const p = partial(m[2]);
    if (!p)
        return false;
    const { v, parts } = p;
    const upper = (n) => (n === 0 ? [Infinity, 0, 0] : n === 1 ? [v[0] + 1, 0, 0] : n === 2 ? [v[0], v[1] + 1, 0] : [v[0], v[1], v[2] + 1]);
    switch (op) {
        case '^': {
            const hi = v[0] > 0 || parts < 2 ? [v[0] + 1, 0, 0] : v[1] > 0 || parts < 3 ? [0, v[1] + 1, 0] : [0, 0, v[2] + 1];
            return cmp(ver, v) >= 0 && cmp(ver, hi) < 0;
        }
        case '~': return cmp(ver, v) >= 0 && cmp(ver, upper(Math.min(parts, 2) || 1)) < 0;
        case '>=': return cmp(ver, v) >= 0;
        case '>': return parts < 3 ? cmp(ver, upper(parts)) >= 0 : cmp(ver, v) > 0;
        case '<=': return parts < 3 ? cmp(ver, upper(parts)) < 0 : cmp(ver, v) <= 0;
        case '<': return cmp(ver, v) < 0;
        default: return parts === 3 ? cmp(ver, v) === 0 : cmp(ver, v) >= 0 && cmp(ver, upper(parts)) < 0;
    }
}
/** Does `version` satisfy the semver `range`? */
function satisfies(version, range) {
    const ver = parse(version);
    if (!ver)
        return false;
    return range.split('||').some((alt) => {
        const a = alt.trim();
        if (!a || a === '*' || a.toLowerCase() === 'x')
            return true;
        const hy = /^(\S+)\s+-\s+(\S+)$/.exec(a);
        if (hy)
            return test(ver, '>=' + hy[1]) && test(ver, '<=' + hy[2]);
        return a.replace(/(\^|~|>=|<=|>|<|=)\s+/g, '$1').split(/\s+/).every((c) => test(ver, c));
    });
}
/** Check a plugin manifest's `engines.motionary` (or `motionary`) range against the running version. */
function checkCompat(manifest, version) {
    const range = manifest.engines?.motionary || manifest.motionary || '*';
    const ok = satisfies(version, range);
    const who = manifest.name ? `"${manifest.name}"` : 'This plugin';
    return { ok, range, version, message: ok ? `${who} supports Motionary ${version} (${range}).` : `${who} needs Motionary ${range}; this page runs ${version}.` };
}

export { checkCompat as c, pluginIntegrity as p, satisfies as s, verifyPlugin as v };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.8.0/dist/chunks/sign-DvZ1jHxE.js.map