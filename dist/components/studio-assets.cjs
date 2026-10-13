'use strict';

var format = require('../chunks/format-DrRrPbjl.cjs');
var project = require('../chunks/project-CX5rdp4c.cjs');

/**
 * 14.5 project & asset workflow (`motionary/studio/assets`): image, SVG, font, video and audio references in a Studio
 * project, relative path resolution confined to the project directory, an offline project pack (one JSON file holding
 * the project and every referenced local asset) and missing-asset reports / relinking after a project moved to another
 * device. Pure: no DOM, no network, no file system — callers pass bytes and file lists in and get bytes and reports out.
 * Nothing is ever executed: script-like files (`.js`, `.html`, `.wasm`, …) are reported and never packed, unpacked
 * or suggested.
 */
const STUDIO_ASSETS_VERSION = 1;
const STUDIO_PACK_FORMAT = 'motionary-studio-pack';
/** Hard limits: assets per project / pack, path length, bytes per file, pack text length. */
const ASSET_LIMITS = { assets: 2000, pathLength: 1024, fileBytes: 50e6, packBytes: 200e6 };
class AssetPathError extends Error {
    constructor(path, reason) {
        super(`[motionary] asset path ${JSON.stringify(String(path).slice(0, 80))}: ${reason}`);
        this.name = 'AssetPathError';
        this.path = path;
        this.reason = reason;
    }
}
const KINDS = [
    ['script', /\.(m?js|cjs|jsx|tsx?|html?|xhtml|wasm|sh|bat|cmd|ps1|exe|php|py)$/],
    ['svg', /\.svgz?$/], ['image', /\.(png|jpe?g|gif|webp|avif|bmp|ico|apng)$/], ['font', /\.(woff2?|ttf|otf|eot)$/],
    ['video', /\.(mp4|webm|mov|m4v|ogv)$/], ['audio', /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus)$/], ['data', /\.(json|lottie|csv|txt|vtt)$/],
];
/** Kind of an asset by its extension (case-insensitive; query and hash ignored). */
function assetKind(path) {
    const p = String(path).replace(/[?#].*$/, '').toLowerCase();
    for (const [k, re] of KINDS)
        if (re.test(p))
            return k;
    return 'other';
}
/** `https:` and `data:` references: external, never resolved or packed. */
const isExternalAsset = (ref) => /^(https:|data:)/i.test(String(ref).trim());
const FORBIDDEN = /*#__PURE__*/ new Set(['__proto__', 'constructor', 'prototype']);
function norm(path, base) {
    const bad = (r) => { throw new AssetPathError(path, r); };
    if (typeof path !== 'string' || !path)
        bad('empty');
    if (path.length > ASSET_LIMITS.pathLength)
        bad('length');
    let p = path;
    try {
        p = decodeURIComponent(p);
    }
    catch {
        bad('encoding');
    }
    if (/[\u0000-\u001f\u007f]/.test(p))
        bad('control');
    p = p.replace(/\\/g, '/');
    if (p[0] === '/' || /^[a-z]:\//i.test(p))
        bad('absolute');
    if (/^[a-z][\w+.-]*:/i.test(p))
        bad('scheme');
    const out = base.slice(), segs = p.split('/');
    segs.forEach((s, i) => {
        if (s === '..') {
            if (!out.length)
                bad('outside');
            out.pop();
        }
        else if (s === '' || s === '.') {
            if (i === segs.length - 1 && segs.length > 1 && s === '')
                bad('directory');
        }
        else if (FORBIDDEN.has(s))
            bad('forbidden');
        else
            out.push(s);
    });
    if (!out.length)
        bad('empty');
    return out.join('/');
}
/** A project-relative POSIX path (`./`, inner `..`, `//` and `\` normalized). Throws `AssetPathError` for anything that leaves the project, is absolute, has a scheme or control characters. */
const normalizeAssetPath = (path) => norm(path, []);
/** `ref` resolved relative to the project file that holds it (`from`, e.g. `scenes/intro.json`), still confined to the project root. */
function resolveAssetPath(ref, from) {
    const dir = from ? normalizeAssetPath(from).split('/').slice(0, -1) : [];
    return norm(ref, dir);
}
const URL_RE = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)/g;
const SRC_PROP = /(^|-)src$/i;
function collectAssetRefs(doc, o = {}) {
    const map = new Map(), external = [], rejected = [];
    for (const l of doc.layers)
        for (const k of l.keyframes || [])
            for (const prop of Object.keys(k.props)) {
                const v = k.props[prop];
                if (typeof v !== 'string')
                    continue;
                const refs = [];
                for (const m of v.matchAll(URL_RE))
                    refs.push(m[1] ?? m[2] ?? m[3] ?? '');
                if (!refs.length && SRC_PROP.test(prop) && v.trim())
                    refs.push(v.trim());
                for (const ref of refs) {
                    const use = { layer: l.id, keyframe: k.id, prop };
                    if (!ref || ref[0] === '#')
                        continue;
                    if (isExternalAsset(ref)) {
                        external.push({ ref, ...use });
                        continue;
                    }
                    try {
                        const path = normalizeAssetPath(ref);
                        const a = map.get(path) || map.set(path, { path, kind: assetKind(path), uses: [] }).get(path);
                        a.uses.push(use);
                    }
                    catch (e) {
                        rejected.push({ ref, reason: e.reason, ...use });
                    }
                }
            }
    const assets = [...map.values()].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    if (assets.length > ASSET_LIMITS.assets)
        throw new format.TimelineDocError([{ path: 'layers', message: `more than ${ASSET_LIMITS.assets} assets` }]);
    external.sort((a, b) => (a.ref < b.ref ? -1 : a.ref > b.ref ? 1 : 0));
    return o.report ? { assets, external, rejected } : assets;
}
const getter = (files) => (p) => files instanceof Map ? files.get(p) : Object.prototype.hasOwnProperty.call(files, p) ? files[p] : undefined;
const entries = (files) => (files instanceof Map ? [...files] : Object.entries(files));
/** The document's assets with size and CRC-32 for the files that exist. */
function createAssetManifest(doc, files = {}) {
    const get = getter(files);
    return collectAssetRefs(doc).map(({ path, kind }) => {
        const b = get(path);
        return b ? { path, kind, bytes: b.length, crc32: crc32(b) } : { path, kind };
    });
}
/** Which assets of a manifest (or a document) are available, missing, changed (size / CRC differ) or rejected (unsafe path). */
function checkAssets(target, available) {
    let manifest, rejected = [];
    if (Array.isArray(target))
        manifest = target;
    else {
        const r = collectAssetRefs(target, { report: true });
        manifest = r.assets.map(({ path, kind }) => ({ path, kind }));
        rejected = r.rejected;
    }
    let has, get;
    if (typeof available === 'function')
        has = available;
    else if (available instanceof Map || (typeof available === 'object' && !(Symbol.iterator in available))) {
        get = getter(available);
        has = (p) => !!get(p);
    }
    else {
        const s = new Set(available);
        has = (p) => s.has(p);
    }
    const found = [], missing = [], changed = [], messages = [];
    for (const e of manifest) {
        if (!has(e.path)) {
            missing.push(e);
            messages.push(`missing ${e.kind}: ${e.path}`);
            continue;
        }
        found.push(e.path);
        const b = get && get(e.path);
        if (b && e.crc32 !== undefined && (b.length !== e.bytes || crc32(b) !== e.crc32)) {
            changed.push(e);
            messages.push(`changed ${e.kind}: ${e.path}`);
        }
    }
    for (const r of rejected)
        messages.push(`rejected (${r.reason}): ${r.ref} in ${r.layer}/${r.keyframe} ${r.prop}`);
    return { ok: !missing.length && !changed.length && !rejected.length, found, missing, changed, rejected, messages };
}
/** New locations for missing assets: by content (size + CRC-32) when exactly one file matches, else by a unique file name. Never a script or an unsafe path. */
function relinkAssets(manifest, available) {
    const cands = [];
    for (const [p, b] of entries(available)) {
        let n;
        try {
            n = normalizeAssetPath(p);
        }
        catch {
            continue;
        }
        if (assetKind(n) !== 'script')
            cands.push({ path: n, bytes: b.length, crc: crc32(b), name: n.split('/').pop() });
    }
    const here = new Set(cands.map((c) => c.path)), out = [];
    for (const e of manifest) {
        if (here.has(e.path))
            continue;
        const byC = e.crc32 === undefined ? [] : cands.filter((c) => c.bytes === e.bytes && c.crc === e.crc32);
        if (byC.length === 1) {
            out.push({ from: e.path, to: byC[0].path, by: 'content' });
            continue;
        }
        if (byC.length > 1)
            continue;
        const name = e.path.split('/').pop(), byN = cands.filter((c) => c.name === name && assetKind(c.path) === e.kind);
        if (byN.length === 1)
            out.push({ from: e.path, to: byN[0].path, by: 'name' });
    }
    return out;
}
/** One JSON file with the project and every referenced local asset (deterministic). External URLs stay references; scripts are never packed. */
function packStudioProject(project$1, files) {
    const { doc, ui } = typeof project$1 === 'string' ? project.parseStudioProject(project$1) : project$1;
    const r = collectAssetRefs(doc, { report: true }), get = getter(files), missing = [], skipped = [], out = [];
    for (const x of r.rejected)
        skipped.push({ path: x.ref, reason: x.reason });
    for (const a of r.assets) {
        if (a.kind === 'script') {
            skipped.push({ path: a.path, reason: 'script' });
            continue;
        }
        const b = get(a.path);
        if (!b) {
            missing.push(a.path);
            continue;
        }
        if (b.length > ASSET_LIMITS.fileBytes) {
            skipped.push({ path: a.path, reason: 'size' });
            continue;
        }
        out.push({ path: a.path, kind: a.kind, bytes: b.length, crc32: crc32(b), data: toBase64(b) });
    }
    const text = JSON.stringify({ format: STUDIO_PACK_FORMAT, version: 1, project: JSON.parse(project.serializeStudioProject(doc, ui || {}, 0)), files: out }) + '\n';
    return { text, missing, skipped };
}
/** Open a pack: the project (checked like `parseStudioProject`) and the files whose path, size, CRC-32 and data check out; the rest are listed in `problems`. */
function unpackStudioProject(text) {
    const fail = (m) => new format.TimelineDocError([{ path: '', message: m }]);
    if (typeof text !== 'string' || text.length > ASSET_LIMITS.packBytes)
        throw fail('pack too large or not text');
    let j;
    try {
        j = JSON.parse(text);
    }
    catch (e) {
        throw fail(`invalid JSON (${e.message})`);
    }
    if (!j || j.format !== STUDIO_PACK_FORMAT)
        throw fail(`expected a ${STUDIO_PACK_FORMAT} file`);
    if (j.version !== 1)
        throw fail('unsupported pack version');
    if (!Array.isArray(j.files))
        throw fail('files: expected an array');
    if (j.files.length > ASSET_LIMITS.assets)
        throw fail(`more than ${ASSET_LIMITS.assets} assets`);
    const project$1 = project.parseStudioProject(j.project), files = new Map(), problems = [];
    for (const f of j.files) {
        const raw = f && typeof f.path === 'string' ? f.path : String(f && f.path);
        const no = (reason) => problems.push({ path: raw, reason });
        let p;
        try {
            p = normalizeAssetPath(raw);
        }
        catch (e) {
            no(e.reason || 'path');
            continue;
        }
        if (assetKind(p) === 'script') {
            no('script');
            continue;
        }
        if (files.has(p)) {
            no('duplicate');
            continue;
        }
        let b;
        try {
            b = fromBase64(typeof f.data === 'string' ? f.data : '!');
        }
        catch {
            no('data');
            continue;
        }
        if (b.length > ASSET_LIMITS.fileBytes || b.length !== f.bytes) {
            no('bytes');
            continue;
        }
        if (crc32(b) !== f.crc32) {
            no('crc32');
            continue;
        }
        files.set(p, b);
    }
    return { project: project$1, files, problems };
}
let TABLE;
/** CRC-32 (IEEE, as zip / PNG). */
function crc32(b) {
    if (!TABLE) {
        TABLE = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++)
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            TABLE[n] = c >>> 0;
        }
    }
    let c = 0xffffffff;
    for (let i = 0; i < b.length; i++)
        c = TABLE[(c ^ b[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
/** Standard base64 (with padding). */
function toBase64(b) {
    let s = '';
    for (let i = 0; i < b.length; i += 3) {
        const n = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
        s += B64[n >> 18] + B64[(n >> 12) & 63] + (i + 1 < b.length ? B64[(n >> 6) & 63] : '=') + (i + 2 < b.length ? B64[n & 63] : '=');
    }
    return s;
}
/** Strict base64 decode (throws on bad length, characters or padding). */
function fromBase64(s) {
    if (s.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(s))
        throw new Error('[motionary] invalid base64');
    const pad = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0, out = new Uint8Array((s.length / 4) * 3 - pad);
    for (let i = 0, o = 0; i < s.length; i += 4) {
        const n = (B64.indexOf(s[i]) << 18) | (B64.indexOf(s[i + 1]) << 12) | ((B64.indexOf(s[i + 2]) & 63) << 6) | (B64.indexOf(s[i + 3]) & 63);
        out[o++] = n >> 16;
        if (o < out.length)
            out[o++] = (n >> 8) & 255;
        if (o < out.length)
            out[o++] = n & 255;
    }
    return out;
}

exports.ASSET_LIMITS = ASSET_LIMITS;
exports.AssetPathError = AssetPathError;
exports.STUDIO_ASSETS_VERSION = STUDIO_ASSETS_VERSION;
exports.STUDIO_PACK_FORMAT = STUDIO_PACK_FORMAT;
exports.assetKind = assetKind;
exports.checkAssets = checkAssets;
exports.collectAssetRefs = collectAssetRefs;
exports.crc32 = crc32;
exports.createAssetManifest = createAssetManifest;
exports.fromBase64 = fromBase64;
exports.isExternalAsset = isExternalAsset;
exports.normalizeAssetPath = normalizeAssetPath;
exports.packStudioProject = packStudioProject;
exports.relinkAssets = relinkAssets;
exports.resolveAssetPath = resolveAssetPath;
exports.toBase64 = toBase64;
exports.unpackStudioProject = unpackStudioProject;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.7.0/dist/components/studio-assets.cjs.map