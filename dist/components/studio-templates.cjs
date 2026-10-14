'use strict';

var format = require('../chunks/format-DrRrPbjl.cjs');
var components_studioAssets = require('./studio-assets.cjs');
var components_studioExport = require('./studio-export.cjs');

/**
 * 14.8 templates & extension ecosystem — `motionary/studio/templates` (= `motionary/components/studio-templates`).
 *
 * A template file (`motionary-template` v1) is data only: a manifest (id, name, SemVer version, SPDX license, author,
 * required Motionary modules, an optional token theme and preview time), a 14.5 studio pack (the project + its asset
 * files) and a `sha256-…` integrity value over both, optionally signed by its publisher (Ed25519, WebCrypto).
 *
 * - `parseTemplate` checks shape, limits, integrity and every packed file (scripts and out-of-project paths refused)
 *   and never throws; `verifyTemplate` adds the publisher signature against your trusted keys.
 * - `installTemplate` adds the template's layers to an editor history as ONE undo step (layer / keyframe ids prefixed,
 *   assets under `templates/<id>/`, a record in `meta['motionary:templates']`); `uninstallTemplate` removes exactly
 *   that, so the serialized project is byte-identical to the one before the install.
 * - `previewTemplate` renders the template with the 14.7 standalone export as one inline HTML file without scripts
 *   (CSS only, frozen at the preview time) for a sandboxed iframe.
 *
 * Pure: no DOM, no network, nothing evaluated. SHA-256 is plain JS (sync); only signatures use WebCrypto.
 */
const STUDIO_TEMPLATES_VERSION = 1;
const TEMPLATE_FORMAT = 'motionary-template';
/** Where installs are recorded in the project (`doc.meta`). */
const TEMPLATE_META_KEY = 'motionary:templates';
/** Hard limits: template text, layers, keyframes, packed files, bytes per file, token theme (JSON chars), required modules. */
const TEMPLATE_LIMITS = { textBytes: 10e6, layers: 200, keyframes: 20000, files: 100, fileBytes: 5e6, tokensBytes: 64000, requires: 32 };
class TemplateError extends Error {
    constructor(problems) {
        super(`[motionary] template: ${problems.slice(0, 3).map((p) => `${p.path || '(root)'} (${p.reason}): ${p.message}`).join('; ')}${problems.length > 3 ? ` (+${problems.length - 3} more)` : ''}`);
        this.name = 'TemplateError';
        this.problems = problems;
    }
}
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const utf8 = (s) => new TextEncoder().encode(s);
const ab = (b) => new Uint8Array(b);
// --- SHA-256 (FIPS 180-4) ----------------------------------------------------------------------------------------------
let K;
/** SHA-256 of `bytes` (pure JS, synchronous). */
function sha256(bytes) {
    if (!K) {
        K = new Uint32Array(64);
        const frac = (x) => ((x - Math.floor(x)) * 4294967296) >>> 0;
        for (let n = 2, i = 0; i < 64; n++) {
            let p = true;
            for (let d = 2; d * d <= n; d++)
                if (n % d === 0) {
                    p = false;
                    break;
                }
            if (p)
                K[i++] = frac(Math.cbrt(n));
        }
    }
    const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    const len = bytes.length, total = ((len + 72) >> 6) << 6, m = new Uint8Array(total);
    m.set(bytes);
    m[len] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(total - 8, Math.floor(len / 0x20000000));
    dv.setUint32(total - 4, (len << 3) >>> 0);
    const W = new Uint32Array(64), rot = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < total; o += 64) {
        for (let i = 0; i < 16; i++)
            W[i] = dv.getUint32(o + i * 4);
        for (let i = 16; i < 64; i++) {
            const a = W[i - 15], b = W[i - 2];
            W[i] = (W[i - 16] + (rot(a, 7) ^ rot(a, 18) ^ (a >>> 3)) + W[i - 7] + (rot(b, 17) ^ rot(b, 19) ^ (b >>> 10))) >>> 0;
        }
        let [a, b, c, d, e, f, g, h] = H;
        for (let i = 0; i < 64; i++) {
            const t1 = (h + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) >>> 0;
            const t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + t1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (t1 + t2) >>> 0;
        }
        H[0] += a;
        H[1] += b;
        H[2] += c;
        H[3] += d;
        H[4] += e;
        H[5] += f;
        H[6] += g;
        H[7] += h;
    }
    const out = new Uint8Array(32), ov = new DataView(out.buffer);
    for (let i = 0; i < 8; i++)
        ov.setUint32(i * 4, H[i]);
    return out;
}
/** JSON with object keys sorted at every level (what the integrity value covers). */
const canon = (v) => Array.isArray(v) ? `[${v.map(canon).join(',')}]` : isObj(v) ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}` : JSON.stringify(v ?? null);
/** The integrity value a template must carry: `sha256-` + base64 of SHA-256 over the canonical manifest and the pack text. */
function templateIntegrity(t) {
    return 'sha256-' + components_studioAssets.toBase64(sha256(utf8(`${canon({ format: TEMPLATE_FORMAT, version: 1, manifest: t.manifest })}\n${t.pack}`)));
}
// --- manifest ----------------------------------------------------------------------------------------------------------
const ID = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/;
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const SPDX_ID = '\\(?[A-Za-z0-9][A-Za-z0-9.+-]*\\)?';
const SPDX = /*#__PURE__*/ new RegExp(`^${SPDX_ID}( (AND|OR|WITH) ${SPDX_ID})*$`);
const MODULE = /^motionary(\/[a-z0-9][a-z0-9-]*){0,4}$/;
const MANIFEST_KEYS = /*#__PURE__*/ new Set(['id', 'name', 'version', 'license', 'author', 'description', 'homepage', 'requires', 'tokens', 'preview']);
function manifestProblems(m) {
    const out = [], no = (k, reason, message) => out.push({ path: `manifest${k ? '.' + k : ''}`, reason, message });
    if (!isObj(m)) {
        no('', 'manifest', 'expected an object');
        return out;
    }
    for (const k of Object.keys(m))
        if (!MANIFEST_KEYS.has(k))
            no(k, 'manifest', 'unknown key');
    const str = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max && !/[\u0000-\u001f\u007f]/.test(v);
    if (!(typeof m.id === 'string' && ID.test(m.id)))
        no('id', 'id', 'expected 1–64 of a-z 0-9 . _ - (starting and ending with a letter or digit)');
    if (!str(m.name, 200))
        no('name', 'name', 'expected a non-empty name (≤ 200 characters)');
    if (!(typeof m.version === 'string' && m.version.length <= 64 && SEMVER.test(m.version)))
        no('version', 'semver', 'expected a SemVer version (1.2.3)');
    if (!(typeof m.license === 'string' && m.license.length <= 200 && SPDX.test(m.license)))
        no('license', 'license', 'expected an SPDX license expression (MIT, Apache-2.0, MIT OR Apache-2.0, LicenseRef-…, UNLICENSED)');
    for (const [k, max] of [['author', 200], ['description', 2000], ['homepage', 500]])
        if (m[k] !== undefined && !str(m[k], max))
            no(k, 'manifest', `expected text ≤ ${max} characters`);
    if (m.homepage !== undefined && !/^https:\/\//.test(String(m.homepage)))
        no('homepage', 'manifest', 'expected an https: URL');
    if (m.requires !== undefined) {
        if (!Array.isArray(m.requires) || m.requires.length > TEMPLATE_LIMITS.requires)
            no('requires', 'requires', `expected at most ${TEMPLATE_LIMITS.requires} module paths`);
        else
            m.requires.forEach((r, i) => { if (!(typeof r === 'string' && r.length <= 128 && MODULE.test(r)))
                no(`requires[${i}]`, 'requires', 'expected a Motionary module path (motionary/…)'); });
    }
    if (m.tokens !== undefined) {
        let n = Infinity;
        try {
            n = isObj(m.tokens) ? canon(m.tokens).length : Infinity;
        }
        catch { /* cyclic */ }
        if (n > TEMPLATE_LIMITS.tokensBytes)
            no('tokens', 'tokens', `expected a token theme object ≤ ${TEMPLATE_LIMITS.tokensBytes} JSON characters`);
    }
    if (m.preview !== undefined && !(isObj(m.preview) && Object.keys(m.preview).every((k) => k === 'time') && typeof m.preview.time === 'number' && m.preview.time >= 0 && m.preview.time <= 1e7))
        no('preview', 'preview', 'expected { time: ms }');
    return out;
}
const PATH_REASONS = /*#__PURE__*/ new Set(['empty', 'length', 'control', 'encoding', 'absolute', 'scheme', 'outside', 'directory', 'forbidden']);
const TOP_KEYS = /*#__PURE__*/ new Set(['format', 'version', 'manifest', 'integrity', 'pack', 'signature']);
function packProblems(pack, out) {
    const no = (path, reason, message) => out.push({ path, reason, message });
    let j;
    try {
        j = JSON.parse(pack);
    }
    catch {
        no('pack', 'pack', 'invalid JSON');
        return;
    }
    if (!isObj(j)) {
        no('pack', 'pack', 'expected a studio pack');
        return;
    }
    if (Array.isArray(j.files) && j.files.length > TEMPLATE_LIMITS.files) {
        no('pack.files', 'limit', `more than ${TEMPLATE_LIMITS.files} files`);
        return;
    }
    const layers = j.project && j.project.scene && j.project.scene.layers;
    if (Array.isArray(layers)) {
        if (layers.length > TEMPLATE_LIMITS.layers) {
            no('pack.layers', 'limit', `more than ${TEMPLATE_LIMITS.layers} layers`);
            return;
        }
        if (layers.reduce((n, l) => n + (l && Array.isArray(l.keyframes) ? l.keyframes.length : 0), 0) > TEMPLATE_LIMITS.keyframes) {
            no('pack.layers', 'limit', `more than ${TEMPLATE_LIMITS.keyframes} keyframes`);
            return;
        }
    }
    let u;
    try {
        u = components_studioAssets.unpackStudioProject(pack);
    }
    catch (e) {
        no('pack', 'pack', String(e.message || e));
        return;
    }
    for (const p of u.problems) {
        if (p.reason === 'script')
            no(`pack.files/${p.path}`, 'script', 'script-like files are never accepted');
        else if (PATH_REASONS.has(p.reason))
            no(`pack.files/${p.path}`, 'path', `unsafe path (${p.reason})`);
        else
            no(`pack.files/${p.path}`, 'pack', `file failed its check (${p.reason})`);
    }
    for (const [p, b] of u.files)
        if (b.length > TEMPLATE_LIMITS.fileBytes)
            no(`pack.files/${p}`, 'limit', `larger than ${TEMPLATE_LIMITS.fileBytes} bytes`);
    return { doc: u.project.doc, ui: u.project.ui, files: u.files };
}
/** Check a template (text or object): shape, manifest, limits, integrity, every packed file. Never throws. */
function parseTemplate(input) {
    const errors = [], no = (path, reason, message) => errors.push({ path, reason, message });
    const bad = () => ({ ok: false, errors });
    let t = input;
    if (typeof input === 'string') {
        if (input.length > TEMPLATE_LIMITS.textBytes) {
            no('', 'size', `longer than ${TEMPLATE_LIMITS.textBytes} characters`);
            return bad();
        }
        try {
            t = JSON.parse(input);
        }
        catch (e) {
            no('', 'json', `invalid JSON (${e.message})`);
            return bad();
        }
    }
    if (!isObj(t) || t.format !== TEMPLATE_FORMAT) {
        no('format', 'format', `expected a ${TEMPLATE_FORMAT} file`);
        return bad();
    }
    if (t.version !== 1) {
        no('version', 'format', 'unsupported template version');
        return bad();
    }
    for (const k of Object.keys(t))
        if (!TOP_KEYS.has(k))
            no(k, 'format', 'unknown key');
    errors.push(...manifestProblems(t.manifest));
    if (typeof t.pack !== 'string' || t.pack.length > TEMPLATE_LIMITS.textBytes) {
        no('pack', 'pack', 'expected the studio pack text');
        return bad();
    }
    const want = isObj(t.manifest) ? templateIntegrity(t) : '';
    if (typeof t.integrity !== 'string' || t.integrity !== want)
        no('integrity', 'integrity', 'integrity value does not match the manifest and pack (changed or corrupted)');
    if (t.signature !== undefined && !(isObj(t.signature) && t.signature.alg === 'Ed25519' && typeof t.signature.keyId === 'string' && t.signature.keyId.length > 0 && t.signature.keyId.length <= 128
        && typeof t.signature.value === 'string' && /^[A-Za-z0-9+/]{86}==$/.test(t.signature.value)))
        no('signature', 'signature', 'expected { alg: "Ed25519", keyId, value: base64 }');
    const u = packProblems(t.pack, errors);
    if (u)
        for (const l of u.doc.layers)
            for (const k of l.keyframes || [])
                for (const ref of refsOf(k.props)) {
                    if (components_studioAssets.isExternalAsset(ref.ref))
                        continue;
                    try {
                        const p = components_studioAssets.normalizeAssetPath(ref.ref);
                        if (!u.files.has(p))
                            no(`pack.layers/${l.id}`, 'pack', `asset ${p} is not in the pack`);
                    }
                    catch (e) {
                        no(`pack.layers/${l.id}`, 'path', `unsafe asset reference (${e.reason})`);
                    }
                }
    if (errors.length || !u)
        return bad();
    const template = { format: TEMPLATE_FORMAT, version: 1, manifest: JSON.parse(JSON.stringify(t.manifest)), integrity: t.integrity, pack: t.pack, ...(t.signature ? { signature: { alg: 'Ed25519', keyId: t.signature.keyId, value: t.signature.value } } : {}) };
    const m = template.manifest;
    const info = {
        id: m.id, name: m.name, version: m.version, license: m.license, ...(m.author !== undefined && { author: m.author }), ...(m.description !== undefined && { description: m.description }),
        ...(m.homepage !== undefined && { homepage: m.homepage }), requires: m.requires ? m.requires.slice() : [], missing: [], layers: u.doc.layers.length, files: u.files.size,
        duration: format.timelineDocDuration(u.doc), integrity: template.integrity, signed: !!template.signature,
    };
    return { ok: true, template, info, doc: u.doc, ui: u.ui, files: u.files, errors };
}
const must = (t) => {
    const r = parseTemplate(t);
    if (!r.ok)
        throw new TemplateError(r.errors);
    return r;
};
/** A template from a Studio project (text or `{ doc, ui }`) and its asset files. Throws for a bad manifest, missing / script / unsafe assets or limits. */
function createTemplate(project, o) {
    const mp = manifestProblems(o.manifest);
    if (mp.length)
        throw new TemplateError(mp);
    const p = components_studioAssets.packStudioProject(project, o.assets || {});
    const problems = [];
    for (const x of p.missing)
        problems.push({ path: x, reason: 'pack', message: 'missing asset file' });
    for (const x of p.skipped)
        problems.push({ path: x.path, reason: x.reason === 'script' ? 'script' : x.reason === 'size' ? 'limit' : 'path', message: `asset refused (${x.reason})` });
    if (problems.length)
        throw new TemplateError(problems);
    const manifest = JSON.parse(JSON.stringify(o.manifest));
    const t = { format: TEMPLATE_FORMAT, version: 1, manifest, integrity: templateIntegrity({ manifest, pack: p.text }), pack: p.text };
    must(t);
    return t;
}
/** The template as JSON text (stable: canonical manifest, fixed key order). */
function serializeTemplate(t) {
    return `{\n  "format": ${JSON.stringify(TEMPLATE_FORMAT)},\n  "version": 1,\n  "manifest": ${canon(t.manifest)},\n  "integrity": ${JSON.stringify(t.integrity)},\n${t.signature ? `  "signature": ${canon(t.signature)},\n` : ''}  "pack": ${JSON.stringify(t.pack)}\n}\n`;
}
/** Id, version, license, author, required modules (and which of them are not in `available`), layer / file counts. Throws for an invalid template. */
function templateInfo(t, o = {}) {
    const info = { ...must(t).info };
    if (o.available) {
        const a = new Set(o.available);
        info.missing = info.requires.filter((r) => !a.has(r));
    }
    return info;
}
// --- signatures (Ed25519, WebCrypto) -----------------------------------------------------------------------------------
const subtle = () => globalThis.crypto?.subtle;
const ED = { name: 'Ed25519' };
/** Sign a template's integrity value with an Ed25519 private key (WebCrypto). */
async function signTemplate(t, privateKey, keyId) {
    const { signature: _drop, ...rest } = t;
    const r = must(rest);
    const s = subtle();
    if (!s)
        throw new Error('[motionary] template: WebCrypto is not available');
    const sig = new Uint8Array(await s.sign(ED, privateKey, utf8(r.template.integrity)));
    return { ...r.template, signature: { alg: 'Ed25519', keyId: String(keyId), value: components_studioAssets.toBase64(sig) } };
}
/** Integrity + (optional) publisher signature. `keys`: keyId → Ed25519 public key (raw 32 bytes as base64, or a CryptoKey). */
async function verifyTemplate(t, o = {}) {
    const r = parseTemplate(t);
    const errors = r.errors, integrity = !errors.some((e) => e.reason === 'integrity');
    let tt = t;
    if (typeof t === 'string') {
        try {
            tt = JSON.parse(t);
        }
        catch {
            tt = {};
        }
    }
    const sig = isObj(tt) ? tt.signature : undefined;
    let signature = 'missing';
    if (sig !== undefined) {
        const keys = o.keys || {}, key = isObj(sig) && typeof sig.keyId === 'string' && own(keys, sig.keyId) ? keys[sig.keyId] : undefined;
        if (errors.some((e) => e.reason === 'signature'))
            signature = 'invalid';
        else if (!key)
            signature = 'untrusted';
        else {
            const s = subtle();
            try {
                if (!s)
                    throw 0;
                const k = typeof key === 'string' ? await s.importKey('raw', ab(components_studioAssets.fromBase64(key)), ED, false, ['verify']) : key;
                const data = utf8(isObj(tt.manifest) && typeof tt.pack === 'string' ? templateIntegrity(tt) : '');
                signature = (await s.verify(ED, k, ab(components_studioAssets.fromBase64(sig.value)), data)) ? 'valid' : 'invalid';
            }
            catch {
                signature = 'unsupported';
            }
        }
    }
    const ok = errors.length === 0 && signature !== 'invalid' && (!o.requireSignature || signature === 'valid');
    return { ok, integrity, signature, errors };
}
// --- install / uninstall -----------------------------------------------------------------------------------------------
const URL_RE = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)/g;
const SRC_PROP = /(^|-)src$/i;
function refsOf(props) {
    const out = [];
    for (const prop of Object.keys(props)) {
        const v = props[prop];
        if (typeof v !== 'string')
            continue;
        let any = false;
        for (const m of v.matchAll(URL_RE)) {
            any = true;
            const ref = m[1] ?? m[2] ?? m[3] ?? '';
            if (ref && ref[0] !== '#')
                out.push({ prop, ref });
        }
        if (!any && SRC_PROP.test(prop) && v.trim() && v.trim()[0] !== '#')
            out.push({ prop, ref: v.trim() });
    }
    return out;
}
const local = (ref, dir) => {
    if (!ref || ref[0] === '#' || components_studioAssets.isExternalAsset(ref))
        return undefined;
    try {
        return dir + components_studioAssets.normalizeAssetPath(ref);
    }
    catch {
        return undefined;
    }
};
const rewrite = (props, dir) => {
    const out = {};
    for (const prop of Object.keys(props)) {
        const v = props[prop];
        if (typeof v !== 'string') {
            out[prop] = v;
            continue;
        }
        let any = false;
        const r = v.replace(URL_RE, (m0, a, b, c) => { any = true; const p = local(a ?? b ?? c ?? '', dir); return p ? `url("${p}")` : m0; });
        out[prop] = any ? r : SRC_PROP.test(prop) ? local(v.trim(), dir) ?? v : v;
    }
    return out;
};
const PREFIX = /^[A-Za-z0-9._-]{0,64}$/;
const recordsOf = (doc) => {
    if (doc.meta === undefined)
        return undefined;
    if (!isObj(doc.meta))
        return null;
    const r = doc.meta[TEMPLATE_META_KEY];
    return r === undefined ? undefined : Array.isArray(r) ? r : null;
};
/** Templates installed in a document (from its `meta`). */
const installedTemplates = (doc) => (recordsOf(doc) || []).map((r) => JSON.parse(JSON.stringify(r)));
/** Add a template to the history's document as ONE undo step. Nothing changes on any error. `files` = the asset files to add next to the project. */
function installTemplate(history, t, o = {}) {
    const files = new Map(), warnings = [];
    const fail = (errors) => ({ ok: false, files: new Map(), warnings, errors });
    const r = parseTemplate(t);
    if (!r.ok)
        return fail(r.errors);
    const m = r.template.manifest, id = m.id, prefix = o.prefix ?? `${id}--`, at = o.at ?? 0, doc = history.doc;
    if (!PREFIX.test(prefix))
        return fail([{ path: 'prefix', reason: 'prefix', message: 'expected ≤ 64 of A-Z a-z 0-9 . _ -' }]);
    if (!(typeof at === 'number' && Number.isFinite(at) && at >= 0 && at <= 1e7))
        return fail([{ path: 'at', reason: 'invalid', message: 'expected a time in ms' }]);
    if (o.available) {
        const a = new Set(o.available), miss = (m.requires || []).filter((x) => !a.has(x));
        if (miss.length)
            return fail([{ path: 'manifest.requires', reason: 'requires', message: `needs ${miss.join(', ')}` }]);
    }
    const records = recordsOf(doc);
    if (records === null)
        return fail([{ path: 'meta', reason: 'meta', message: `doc.meta must be an object (and meta['${TEMPLATE_META_KEY}'] an array) to record installs` }]);
    if ((records || []).some((x) => x.id === id))
        return fail([{ path: 'manifest.id', reason: 'installed', message: `${id} is already installed — uninstall it first` }]);
    const dir = `templates/${id}/`;
    const layerIds = new Set(doc.layers.map((l) => l.id)), kfIds = new Set(doc.layers.flatMap((l) => (l.keyframes || []).map((k) => k.id)));
    const added = [], conflicts = [];
    let end = 0;
    for (const l of r.doc.layers) {
        const nl = { ...l, id: prefix + l.id };
        if (l.parent !== undefined)
            nl.parent = prefix + l.parent;
        if (nl.solo) {
            delete nl.solo;
            warnings.push(`solo removed from ${nl.id} (a template never mutes the project)`);
        }
        if (layerIds.has(nl.id))
            conflicts.push(nl.id);
        if (l.keyframes)
            nl.keyframes = l.keyframes.map((k) => {
                const nk = { ...k, id: prefix + k.id, time: k.time + at, props: rewrite(k.props, dir) };
                if (kfIds.has(nk.id))
                    conflicts.push(nk.id);
                end = Math.max(end, nk.time);
                return nk;
            });
        added.push(nl);
    }
    if (conflicts.length)
        return fail([{ path: 'prefix', reason: 'conflict', message: `ids already in the project: ${conflicts.slice(0, 5).join(', ')}${conflicts.length > 5 ? ' …' : ''}` }]);
    for (const [p, b] of r.files)
        files.set(dir + p, b);
    const record = { id, version: m.version, license: m.license, prefix, layers: added.map((l) => l.id), files: [...files.keys()].sort() };
    if (at)
        record.at = at;
    const next = { ...doc, layers: [...doc.layers, ...added] };
    if (doc.duration !== undefined && doc.duration < end) {
        next.duration = end;
        if (!(records || []).some((x) => x.hostDuration !== undefined))
            record.hostDuration = doc.duration;
    }
    if (doc.meta === undefined) {
        record.createdMeta = true;
        record.createdKey = true;
        next.meta = { [TEMPLATE_META_KEY]: [record] };
    }
    else {
        if (records === undefined)
            record.createdKey = true;
        next.meta = { ...doc.meta, [TEMPLATE_META_KEY]: [...(records || []), record] };
    }
    const problems = format.validateTimelineDoc(next);
    if (problems.length)
        return fail(problems.map((p) => ({ path: p.path, reason: 'invalid', message: p.message })));
    history.apply(next, { label: `Install template ${id}@${m.version}` });
    return { ok: true, record: JSON.parse(JSON.stringify(record)), doc: next, files, warnings, errors: [] };
}
/** Remove exactly what `installTemplate` added (layers, record, duration / meta it created) as ONE undo step. `files` = asset paths to delete. */
function uninstallTemplate(history, id) {
    const doc = history.doc, records = recordsOf(doc) || [];
    const fail = (reason, message) => ({ ok: false, removed: [], files: [], errors: [{ path: 'id', reason, message }] });
    const i = records.findIndex((x) => x.id === id);
    if (i < 0)
        return fail('not-installed', `${id} is not installed`);
    const rec = records[i], gone = new Set(rec.layers);
    const keep = doc.layers.filter((l) => !gone.has(l.id));
    const orphan = keep.find((l) => l.parent !== undefined && gone.has(l.parent));
    if (orphan)
        return fail('in-use', `${orphan.id} was moved into a group of ${id} — move it out first`);
    const rest = records.filter((_, j) => j !== i).map((x) => ({ ...x }));
    if (rest.length) {
        const heir = rest[0];
        if (rec.hostDuration !== undefined && !rest.some((x) => x.hostDuration !== undefined))
            heir.hostDuration = rec.hostDuration;
        if (rec.createdMeta)
            heir.createdMeta = true;
        if (rec.createdKey)
            heir.createdKey = true;
    }
    const next = { ...doc, layers: keep };
    const host = rec.hostDuration ?? rest.find((x) => x.hostDuration !== undefined)?.hostDuration;
    if (host !== undefined && doc.duration !== undefined) {
        const own2 = new Set(rest.flatMap((x) => x.layers));
        let end = host;
        for (const l of keep)
            if (own2.has(l.id))
                for (const k of l.keyframes || [])
                    end = Math.max(end, k.time);
        next.duration = end;
    }
    const meta = { ...doc.meta };
    if (rest.length)
        meta[TEMPLATE_META_KEY] = rest;
    else {
        if (rec.createdKey)
            delete meta[TEMPLATE_META_KEY];
        else
            meta[TEMPLATE_META_KEY] = [];
    }
    if (!rest.length && rec.createdMeta && !Object.keys(meta).length)
        delete next.meta;
    else
        next.meta = meta;
    history.apply(next, { label: `Uninstall template ${id}` });
    return { ok: true, removed: rec.layers.slice(), files: rec.files.slice(), doc: next, errors: [] };
}
// --- preview -----------------------------------------------------------------------------------------------------------
/**
 * The template as one inline HTML file (14.7 export). Default: no scripts (CSS only, `sandbox: ''`), frozen at
 * `time` (default: the manifest's preview time; `null` = plays). `js: true` adds the player (`sandbox: 'allow-scripts'`).
 */
function previewTemplate(t, o = {}) {
    const r = must(t), m = r.template.manifest;
    const js = !!o.js, time = o.time === undefined ? (m.preview ? m.preview.time : 0) : o.time;
    const x = components_studioExport.exportStandalone({ pack: r.template.pack }, { inline: true, js, fps: o.fps, title: m.name });
    let html = x.files.get('index.html');
    if (typeof time === 'number' && Number.isFinite(time)) {
        const ms = Math.max(0, Math.round(time * 1e4) / 1e4);
        html = html.replace('</head>', `<style>[data-motionary-export], [data-motionary-export] * { animation-play-state: paused !important; animation-delay: -${ms}ms !important; }</style>\n</head>`);
    }
    return { html, sandbox: js ? 'allow-scripts' : '', time: typeof time === 'number' ? time : null, report: x.report };
}

exports.STUDIO_TEMPLATES_VERSION = STUDIO_TEMPLATES_VERSION;
exports.TEMPLATE_FORMAT = TEMPLATE_FORMAT;
exports.TEMPLATE_LIMITS = TEMPLATE_LIMITS;
exports.TEMPLATE_META_KEY = TEMPLATE_META_KEY;
exports.TemplateError = TemplateError;
exports.createTemplate = createTemplate;
exports.installTemplate = installTemplate;
exports.installedTemplates = installedTemplates;
exports.parseTemplate = parseTemplate;
exports.previewTemplate = previewTemplate;
exports.serializeTemplate = serializeTemplate;
exports.sha256 = sha256;
exports.signTemplate = signTemplate;
exports.templateInfo = templateInfo;
exports.templateIntegrity = templateIntegrity;
exports.uninstallTemplate = uninstallTemplate;
exports.verifyTemplate = verifyTemplate;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.9.0/dist/components/studio-templates.cjs.map