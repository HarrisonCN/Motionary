import { b as timelineDocDuration, e as isLayerActive, r as resolveRandom, T as TimelineDocError } from '../chunks/format-CHcmOPqK.js';
import { s as sampleTimelineDoc, i as interpolateValue } from '../chunks/preview-C9tONksA.js';
import { p as parseStudioProject, f as frameTime } from '../chunks/project-C7WnO3IM.js';
import { unpackStudioProject, collectAssetRefs, isExternalAsset, normalizeAssetPath, AssetPathError, assetKind, toBase64 } from './studio-assets.js';

/**
 * 14.7 output & preview reliability — `motionary/studio/export` (= `motionary/components/studio-export`).
 *
 * - `bakeScene` turns a Studio project / Scene v2 / timeline document into per-property points: linear segments the
 *   browser interpolates exactly like the preview keep only their end points, every other segment (eased, discrete,
 *   custom properties) is sampled at each frame with `sampleTimelineDoc`, so the value at every frame time is the
 *   reference value. `random()` is resolved by seed.
 * - `exportStandalone` writes a work that plays without the editor and without a network: `index.html`, `scene.css`
 *   (CSS `@keyframes`, works with scripts off), `scene.js` (a small player, optional) and `assets/` (or one inline
 *   HTML file). Deterministic to the byte. Values, selectors, titles and stage markup are checked so nothing can
 *   leave its CSS declaration or HTML element; unsafe asset paths become `about:invalid`.
 * - `frameDigest` fingerprints "the same animation" (every frame at a frame rate).
 * - `createFrameExportJob` feeds frames to an adapter (the seam for GIF / video encoders) and can fail, keep a
 *   checkpoint and resume — fully independent of the basic export.
 *
 * Pure: the exporter reads no DOM, opens no network and evaluates nothing. The player is a string.
 */
const STUDIO_EXPORT_VERSION = 1;
const BAKED_FORMAT = 'motionary-baked';
const FRAME_JOB_FORMAT = 'motionary-frame-job';
/** Hard limits: baked points per scene (all tracks and properties), frames per job, frame rate range. */
const EXPORT_LIMITS = { points: 200000, frames: 100000, fpsMin: 1, fpsMax: 240 };
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const fail = (m) => new TimelineDocError([{ path: '', message: m }]);
const fpsOf = (fps = 60) => {
    if (!(Number.isInteger(fps) && fps >= EXPORT_LIMITS.fpsMin && fps <= EXPORT_LIMITS.fpsMax))
        throw fail(`fps: expected an integer in ${EXPORT_LIMITS.fpsMin}–${EXPORT_LIMITS.fpsMax}`);
    return fps;
};
const docOf = (input) => (isObj(input) && typeof input.pack === 'string' ? unpackStudioProject(input.pack).project.doc : parseStudioProject(input).doc);
const cssName = (p) => (p.startsWith('--') ? p : p.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const hexRgb = (v) => {
    const m = typeof v === 'string' ? HEX.exec(v.trim()) : null;
    if (!m)
        return v;
    const s = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
    return `rgb(${parseInt(s.slice(0, 2), 16)}, ${parseInt(s.slice(2, 4), 16)}, ${parseInt(s.slice(4, 6), 16)})`;
};
// properties the browser interpolates linearly component by component (so CSS between two end points = the preview)
const CSS_LINEAR = /^(opacity|transform|translate|rotate|scale|filter|backdrop-filter|(.+-)?color|fill|stroke|stroke-(width|dashoffset)|(min-|max-)?(width|height)|top|left|right|bottom|inset|(margin|padding)(-(top|right|bottom|left))?|border(-(top|right|bottom|left))?-width|border(-(top|bottom)-(left|right))?-radius|font-size|letter-spacing|word-spacing|(row-|column-)?gap|box-shadow|text-shadow|background-(position|size)|offset-distance|outline-offset|perspective|flex-(grow|shrink))$/;
const lerpable = (prop, a, b, easing) => {
    if (a === b)
        return true;
    if ((easing && easing !== 'linear') || !CSS_LINEAR.test(cssName(prop)))
        return false;
    if (typeof a === 'number' && typeof b === 'number')
        return true;
    const m = interpolateValue(a, b, 0.5);
    return m !== a && m !== b;
};
/** Per-property points of every active track; the value at each frame time at `fps` equals `sampleTimelineDoc`. */
function bakeScene(input, o = {}) {
    const fps = fpsOf(o.fps), doc = docOf(input), D = timelineDocDuration(doc), seed = doc.seed ?? 1;
    const cache = new Map();
    const at = (t) => { let f = cache.get(t); if (!f)
        cache.set(t, (f = sampleTimelineDoc(doc, t))); return f; };
    let points = 0;
    const count = (n) => { if ((points += n) > EXPORT_LIMITS.points)
        throw fail(`more than ${EXPORT_LIMITS.points} baked points (frames): shorten the eased / discrete segments or lower fps`); };
    const tracks = [];
    for (const l of doc.layers) {
        if (l.type !== 'track' || !l.keyframes?.length || !isLayerActive(doc, l.id))
            continue;
        const ks = l.keyframes.map((k, i) => [k, i]).sort((x, y) => x[0].time - y[0].time || x[1] - y[1]).map(([k]) => k);
        const names = [];
        for (const k of ks)
            for (const n of Object.keys(k.props))
                if (!names.includes(n))
                    names.push(n);
        const props = {};
        for (const name of names.sort()) {
            const own = ks.filter((k) => name in k.props);
            const val = (i) => resolveRandom(own[i].props[name], seed, `${l.id}/${own[i].id}/${name}`);
            const pts = [];
            for (let i = 0; i < own.length; i++) {
                const a = own[i];
                pts.push([a.time, val(i)]);
                const b = own[i + 1];
                if (!b || b.time <= a.time || a.time >= D || lerpable(name, val(i), val(i + 1), a.easing))
                    continue;
                const end = Math.min(b.time, D);
                const n0 = Math.floor((a.time * fps) / 1000) + 1, n1 = Math.ceil((end * fps) / 1000);
                count(Math.max(0, n1 - n0));
                for (let n = n0; n < n1 + 1; n++) {
                    const t = frameTime((n * 1000) / fps, fps);
                    if (t > a.time && t < end)
                        pts.push([t, at(t).layers[l.id][name]]);
                }
            }
            // cut at the duration (the value there is the sampled one), hold the first / last value from 0 / to the end
            let cut = pts.filter((p) => p[0] < D || (p[0] === D));
            if (cut.length < pts.length && (!cut.length || cut[cut.length - 1][0] < D))
                cut.push([D, at(D).layers[l.id][name]]);
            if (!cut.length)
                cut = [[D, at(D).layers[l.id][name]]];
            if (cut[0][0] > 0)
                cut.unshift([0, cut[0][1]]);
            if (cut[cut.length - 1][0] < D)
                cut.push([D, cut[cut.length - 1][1]]);
            count(cut.length);
            props[name] = cut.map(([t, v]) => [t, hexRgb(v)]);
        }
        tracks.push({ id: l.id, target: l.target || ':scope', props });
    }
    return { format: BAKED_FORMAT, version: 1, duration: D, fps, seed, tracks };
}
const r4 = (n) => { const r = Math.round(n * 1e4) / 1e4; return r === 0 ? 0 : r; };
const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const lerp = (a, b, p) => {
    if (typeof a === 'number' && typeof b === 'number')
        return r4(a + (b - a) * p);
    const x = String(a).match(NUM) || [], y = String(b).match(NUM) || [];
    if (x.length && x.length === y.length && String(a).replace(NUM, '#') === String(b).replace(NUM, '#')) {
        let i = 0;
        const c = /^rgba?\(/.test(String(a));
        return String(a).replace(NUM, () => { const k = i++, v = +x[k] + (+y[k] - +x[k]) * p; return String(c && k < 3 ? Math.min(255, Math.max(0, Math.round(v))) : r4(v)); });
    }
    return a;
};
const valueAt = (q, t) => {
    let lo = 0, hi = q.length - 1;
    if (t <= q[0][0])
        return q[0][1];
    if (t >= q[hi][0])
        return q[hi][1];
    while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (q[m][0] <= t)
            lo = m;
        else
            hi = m;
    }
    const a = q[lo], b = q[hi];
    return a[0] === t ? a[1] : lerp(a[1], b[1], (t - a[0]) / (b[0] - a[0]));
};
/** The baked scene at `time` (what the exported player writes; equals `sampleTimelineDoc` at every frame time). */
function sampleBaked(b, time) {
    const t = Math.min(Math.max(Number.isFinite(time) ? time : 0, 0), b.duration), layers = {};
    for (const tr of b.tracks) {
        const s = {};
        for (const p of Object.keys(tr.props))
            s[p] = valueAt(tr.props[p], t);
        layers[tr.id] = s;
    }
    return { time: t, layers };
}
// CRC-32, incremental (same polynomial as the 14.5 pack)
let TABLE;
const crcUpdate = (c, b) => {
    if (!TABLE) {
        TABLE = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let x = n;
            for (let k = 0; k < 8; k++)
                x = x & 1 ? 0xedb88320 ^ (x >>> 1) : x >>> 1;
            TABLE[n] = x >>> 0;
        }
    }
    for (let i = 0; i < b.length; i++)
        c = TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return c;
};
const frameCount = (D, fps) => { let n = 0; while (frameTime((n * 1000) / fps, fps) <= D + 1e-9)
    n++; return n; };
/** Fingerprint of every frame at `fps` (default 60): `mfd1-<fps>-<frames>-<crc32>`. Same text ⇔ same frames. */
function frameDigest(input, o = {}) {
    const fps = fpsOf(o.fps), doc = docOf(input), D = timelineDocDuration(doc), n = frameCount(D, fps), te = new TextEncoder();
    if (n > EXPORT_LIMITS.frames)
        throw fail(`more than ${EXPORT_LIMITS.frames} frames`);
    let c = 0xffffffff;
    for (let i = 0; i < n; i++)
        c = crcUpdate(c, te.encode(JSON.stringify(sampleTimelineDoc(doc, frameTime((i * 1000) / fps, fps))) + '\n'));
    return `mfd1-${fps}-${n}-${((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0')}`;
}
// --- standalone export ----------------------------------------------------------------------------------------------
const URL_RE = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)/g;
const SRC_PROP = /(^|-)src$/i;
const UNSAFE_VALUE = /[;{}<>\\\n\r]|\/\*|@import|expression\s*\(|javascript:|behavior\s*:|-moz-binding/i;
const UNSAFE_REF = /["'\\\n\r<>]/;
const SAFE_TARGET = /^[^{}<>;\\@\n\r"]+$/;
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', apng: 'image/apng', webp: 'image/webp', avif: 'image/avif', bmp: 'image/bmp', ico: 'image/x-icon', svg: 'image/svg+xml', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m4v: 'video/mp4', ogv: 'video/ogg', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', oga: 'audio/ogg', m4a: 'audio/mp4', aac: 'audio/aac', flac: 'audio/flac', opus: 'audio/opus', json: 'application/json', csv: 'text/csv', txt: 'text/plain', vtt: 'text/vtt' };
const mime = (p) => MIME[p.split('.').pop().toLowerCase()] || 'application/octet-stream';
const pct = (b) => { let s = ''; for (let i = 0; i < b.length; i++) {
    const c = b[i];
    s += /[A-Za-z0-9\-._~/,:=@+]/.test(String.fromCharCode(c)) ? String.fromCharCode(c) : '%' + (c < 16 ? '0' : '') + c.toString(16).toUpperCase();
} return s; };
const encPath = (p) => p.split('/').map((s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())).join('/');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n) => String(r4(n));
const offset = (t, D) => (D > 0 ? String(+((t / D) * 100).toFixed(5)) : '0') + '%';
/** Your stage markup with scripts, frames, embeds, inline handlers and javascript: URLs removed (a guard, not a sanitizer for untrusted HTML). */
function cleanStage(html) {
    return String(html)
        .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
        .replace(/<(iframe|object|embed|frameset|frame|noembed|template)\b[\s\S]*?<\/\1\s*>/gi, '')
        .replace(/<\/?(script|iframe|object|embed|frameset|frame|meta|link|base|style|noembed|template)\b[^>]*>/gi, '')
        .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/\s+(href|src|action|formaction|xlink:href|srcdoc)\s*=\s*("\s*(javascript|vbscript|data):[^"]*"|'\s*(javascript|vbscript|data):[^']*'|(javascript|vbscript|data):[^\s>]*)/gi, '')
        .replace(/javascript:/gi, '');
}
/** Standalone HTML / CSS (+ player JS) + assets for a project; deterministic. Never throws for asset problems — they are in `report`. */
function exportStandalone(input, o = {}) {
    const fps = fpsOf(o.fps), inline = !!o.inline, js = o.js !== false;
    let doc, files = o.assets || {};
    if (isObj(input) && typeof input.pack === 'string') {
        const u = unpackStudioProject(input.pack);
        doc = u.project.doc;
        if (!o.assets)
            files = u.files;
    }
    else
        doc = parseStudioProject(input).doc;
    const get = (p) => (files instanceof Map ? files.get(p) : Object.prototype.hasOwnProperty.call(files, p) ? files[p] : undefined);
    const digest = frameDigest(doc, { fps });
    const warnings = [], copied = new Set(), missing = new Set(), external = new Set(), rejected = [];
    const out = new Map();
    collectAssetRefs(doc, { report: true }); // throws for more assets than the limit, like a pack
    const mapRef = (ref, src, layer, prop) => {
        if (UNSAFE_REF.test(ref)) {
            rejected.push({ ref, reason: 'unsafe', layer, prop });
            return 'about:invalid';
        }
        if (isExternalAsset(ref)) {
            if (src && UNSAFE_VALUE.test(ref)) {
                rejected.push({ ref, reason: 'unsafe', layer, prop });
                return 'about:invalid';
            }
            external.add(ref);
            return ref;
        }
        let p;
        try {
            p = normalizeAssetPath(ref);
        }
        catch (e) {
            rejected.push({ ref, reason: e instanceof AssetPathError ? e.reason : 'invalid', layer, prop });
            return 'about:invalid';
        }
        if (assetKind(p) === 'script') {
            rejected.push({ ref, reason: 'script', layer, prop });
            return 'about:invalid';
        }
        const b = get(p);
        if (!b) {
            missing.add(p);
            return 'assets/' + encPath(p);
        }
        copied.add(p);
        if (inline)
            return src ? `data:${mime(p)},${pct(b)}` : `data:${mime(p)};base64,${toBase64(b)}`;
        out.set('assets/' + p, b);
        return 'assets/' + encPath(p);
    };
    // rewrite asset references and drop unsafe values on a copy, then bake that copy
    const safe = JSON.parse(JSON.stringify(doc));
    const dropped = new Set();
    for (const l of safe.layers)
        for (const k of l.keyframes || [])
            for (const prop of Object.keys(k.props)) {
                const v = k.props[prop];
                if (typeof v !== 'string' || dropped.has(l.id + '\0' + prop))
                    continue;
                const bare = v.replace(URL_RE, 'url()');
                const srcWhole = !/url\(/i.test(v) && SRC_PROP.test(prop) && !!v.trim() && v.trim()[0] !== '#';
                if (!srcWhole && UNSAFE_VALUE.test(bare)) {
                    dropped.add(l.id + '\0' + prop);
                    warnings.push(`unsafe value in ${l.id}.${prop} — property left out of the export`);
                    continue;
                }
                k.props[prop] = srcWhole ? mapRef(v.trim(), true, l.id, prop) : v.replace(URL_RE, (m, a, b2, c) => { const ref = a ?? b2 ?? c ?? ''; return !ref || ref[0] === '#' ? (UNSAFE_REF.test(ref) ? 'url("about:invalid")' : `url("${ref}")`) : `url("${mapRef(ref, false, l.id, prop)}")`; });
            }
    for (const l of safe.layers)
        for (const k of l.keyframes || [])
            for (const prop of Object.keys(k.props))
                if (dropped.has(l.id + '\0' + prop))
                    delete k.props[prop];
    const baked = bakeScene(safe, { fps });
    const tracks = baked.tracks.filter((t) => {
        if (t.target === ':scope' || SAFE_TARGET.test(t.target))
            return true;
        warnings.push(`unsafe target ${JSON.stringify(t.target.slice(0, 60))} on ${t.id} — track left out of the export`);
        return false;
    });
    const D = baked.duration;
    // CSS: one @keyframes per track, linear between the baked points; scripts off → CSS plays, scripts on → the player
    const css = [`/* motionary studio/export v${STUDIO_EXPORT_VERSION} ${digest} */`, '[data-motionary-export] { position: relative; }'];
    const rules = [], reduced = [];
    let points = 0;
    tracks.forEach((t, i) => {
        const blocks = new Map();
        for (const p of Object.keys(t.props))
            for (const [time, v] of t.props[p]) {
                points++;
                (blocks.get(time) || blocks.set(time, []).get(time)).push(`${cssName(p)}: ${typeof v === 'number' ? num(v) : v};`);
            }
        css.push(`@keyframes mo-${i} {\n${[...blocks.keys()].sort((a, b) => a - b).map((time) => `  ${offset(time, D)} { ${blocks.get(time).join(' ')} }`).join('\n')}\n}`);
        const sel = t.target === ':scope' ? 'html:not(.mo-js) [data-motionary-export]' : `html:not(.mo-js) [data-motionary-export] ${t.target}`;
        rules.push(`${sel} { animation: mo-${i} ${num(D)}ms linear 0ms ${o.loop ? 'infinite' : '1'} both; }`);
        reduced.push(`  ${sel} { animation: mo-${i} 1ms linear 0ms 1 both; }`);
    });
    css.push(...rules);
    if (reduced.length)
        css.push(`@media (prefers-reduced-motion: reduce) {\n${reduced.join('\n')}\n}`);
    const cssText = css.join('\n') + '\n';
    // stage
    let stage, stageKind;
    if (typeof o.stage === 'string') {
        stage = cleanStage(o.stage);
        stageKind = 'given';
    }
    else {
        const seen = new Set(), els = [];
        for (const t of tracks) {
            if (seen.has(t.target))
                continue;
            seen.add(t.target);
            let m;
            if ((m = /^#([\w-]+)$/.exec(t.target)))
                els.push(`<div id="${m[1]}"></div>`);
            else if ((m = /^\.([\w-]+)$/.exec(t.target)))
                els.push(`<div class="${m[1]}"></div>`);
            else if (/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(t.target) && !/^(script|style|iframe|object|embed|frame|frameset|meta|link|base|template|noembed)$/.test(t.target))
                els.push(`<${t.target}></${t.target}>`);
        }
        stage = els.join('\n');
        stageKind = 'generated';
    }
    const data = JSON.stringify({ v: 1, d: D, fps, loop: !!o.loop, digest, tracks: tracks.map((t) => ({ t: t.target, p: Object.fromEntries(Object.keys(t.props).map((p) => [cssName(p), t.props[p]])) })) })
        .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    const html = [
        '<!doctype html>', `<html lang="${esc(o.lang || 'en')}">`, '<head>', '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width,initial-scale=1">',
        `<meta name="generator" content="motionary studio/export v${STUDIO_EXPORT_VERSION}">`, `<meta name="motionary-digest" content="${digest}">`,
        `<title>${esc(o.title ?? doc.name ?? 'Motionary export')}</title>`, inline ? `<style>\n${cssText}</style>` : '<link rel="stylesheet" href="scene.css">', '</head>', '<body>',
        '<main data-motionary-export>', stage, '</main>',
        ...(js ? [`<script type="application/json" id="motionary-scene">${data}</script>`, inline ? `<script>${PLAYER_JS}</script>` : '<script src="scene.js" defer></script>'] : []),
        '</body>', '</html>', '',
    ].join('\n');
    out.set('index.html', html);
    if (!inline) {
        out.set('scene.css', cssText);
        if (js)
            out.set('scene.js', PLAYER_JS + '\n');
    }
    const files2 = new Map([...out.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)));
    const sorted = (s) => [...s].sort();
    return {
        files: files2,
        report: { ok: !missing.size && !rejected.length && !warnings.length, digest, duration: D, fps, tracks: tracks.length, points, stage: stageKind, assets: { copied: sorted(copied), missing: sorted(missing), external: sorted(external), rejected }, warnings },
    };
}
/** Feed every frame (`sampleTimelineDoc` at `fps`) to `adapter`; a failure keeps a checkpoint, `resume()` continues there. */
function createFrameExportJob(input, o) {
    const fps = fpsOf(o.fps), doc = docOf(input), D = timelineDocDuration(doc), total = frameCount(D, fps), digest = frameDigest(doc, { fps });
    if (total > EXPORT_LIMITS.frames)
        throw fail(`more than ${EXPORT_LIMITS.frames} frames`);
    let next = 0, status = 'idle', error, begun = false, running;
    const cp = o.checkpoint;
    if (cp !== undefined) {
        if (!isObj(cp) || cp.format !== FRAME_JOB_FORMAT || cp.version !== 1 || cp.digest !== digest || cp.fps !== fps || cp.total !== total || !Number.isInteger(cp.next) || cp.next < 0 || cp.next > total)
            throw fail('checkpoint does not belong to this scene / frame rate');
        next = cp.next;
    }
    const from = next;
    const res = (ok, result) => ({ ok, status, next, total, ...(ok ? { result } : { error }) });
    const go = async () => {
        status = 'running';
        error = undefined;
        try {
            if (!begun) {
                await o.adapter.begin?.({ fps, total, from, duration: D, digest });
                begun = true;
            }
            while (next < total) {
                if (status === 'aborted')
                    return res(false);
                await o.adapter.frame(next, sampleTimelineDoc(doc, frameTime((next * 1000) / fps, fps)));
                if (status === 'aborted')
                    return res(false);
                next++;
                o.onProgress?.(next, total);
            }
            const result = await o.adapter.end?.();
            status = 'done';
            return res(true, result);
        }
        catch (e) {
            if (status === 'aborted')
                return res(false);
            status = 'failed';
            error = e;
            return res(false);
        }
    };
    const job = {
        get status() { return status; },
        get next() { return next; },
        get total() { return total; },
        get error() { return error; },
        get checkpoint() { return { format: FRAME_JOB_FORMAT, version: 1, digest, fps, next, total }; },
        run() {
            if (status === 'aborted')
                return Promise.reject(fail('frame export job was aborted'));
            if (running)
                return running;
            if (status === 'done')
                return Promise.resolve(res(true));
            const p = (running = go());
            p.then(() => { if (running === p)
                running = undefined; });
            return p;
        },
        resume() { return job.run(); },
        abort(reason) {
            if (status === 'done' || status === 'aborted')
                return;
            status = 'aborted';
            error = reason;
            try {
                o.adapter.abort?.(reason);
            }
            catch { /* adapter cleanup must not throw into the caller */ }
        },
    };
    return job;
}
/** A deterministic adapter that keeps every frame state (for tests, or to hand frames to another process). */
function createJsonFramesAdapter() {
    let fps = 60, digest = '';
    const frames = [];
    return {
        frames,
        begin(i) { fps = i.fps; digest = i.digest; },
        frame(i, f) { frames[i] = JSON.parse(JSON.stringify(f)); },
        end() { return { fps, digest, frames: frames.slice() }; },
    };
}
/**
 * The player inside an export (ES5, no dependencies, ~1.7 KB): reads the baked data from
 * `<script type="application/json" id="motionary-scene">`, writes each frame as inline styles under
 * `[data-motionary-export]` (the CSS fallback is switched off by `<html class="mo-js">`) and exposes
 * `motionary.{seek(ms), play(), pause(), duration, digest, time}`. `?t=<ms>` freezes a frame; reduced motion shows the
 * final frame.
 */
const PLAYER_JS =  ('(function(){var W=window,D=document,E=D.getElementById("motionary-scene");if(!E)return;' +
    'var S=JSON.parse(E.textContent),R=D.querySelector("[data-motionary-export]")||D.body,N=/-?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?/gi,T=0,id=0,last=0;' +
    'function r4(n){n=Math.round(n*1e4)/1e4;return n===0?0:n}' +
    'function lerp(a,b,p){if(typeof a=="number"&&typeof b=="number")return r4(a+(b-a)*p);a=String(a);b=String(b);var x=a.match(N)||[],y=b.match(N)||[];' +
    'if(x.length&&x.length===y.length&&a.replace(N,"#")===b.replace(N,"#")){var i=0,c=/^rgba?\\(/.test(a);return a.replace(N,function(){var k=i++,v=+x[k]+(+y[k]-+x[k])*p;return String(c&&k<3?Math.min(255,Math.max(0,Math.round(v))):r4(v))})}return a}' +
    'function at(q,t){var lo=0,hi=q.length-1;if(t<=q[0][0])return q[0][1];if(t>=q[hi][0])return q[hi][1];while(hi-lo>1){var m=(lo+hi)>>1;if(q[m][0]<=t)lo=m;else hi=m}var a=q[lo],b=q[hi];return a[0]===t?a[1]:lerp(a[1],b[1],(t-a[0])/(b[0]-a[0]))}' +
    'var els=S.tracks.map(function(k){if(k.t===":scope")return[R];try{return[].slice.call(R.querySelectorAll(k.t))}catch(e){return[]}});' +
    'function seek(t){t=+t||0;T=Math.min(Math.max(t,0),S.d);S.tracks.forEach(function(k,i){for(var p in k.p){var v=String(at(k.p[p],T));els[i].forEach(function(e){e.style.setProperty(p,v)})}});return T}' +
    'function tick(n){T+=n-last;last=n;if(T>=S.d){if(S.loop&&S.d>0)T=T%S.d;else{seek(S.d);id=0;return}}seek(T);id=W.requestAnimationFrame(tick)}' +
    'function play(){if(id)return;if(T>=S.d&&!S.loop)T=0;last=W.performance.now();id=W.requestAnimationFrame(tick)}' +
    'function pause(){if(id&&W.cancelAnimationFrame)W.cancelAnimationFrame(id);id=0}' +
    'D.documentElement.classList.add("mo-js");var q=/[?&]t=([\\d.]+)/.exec(W.location.search),rm=W.matchMedia&&W.matchMedia("(prefers-reduced-motion: reduce)").matches;' +
    'W.motionary={duration:S.d,digest:S.digest,seek:seek,play:play,pause:pause,get time(){return T}};' +
    'if(q)seek(+q[1]);else if(rm)seek(S.d);else{seek(0);play()}})();');

export { BAKED_FORMAT, EXPORT_LIMITS, FRAME_JOB_FORMAT, PLAYER_JS, STUDIO_EXPORT_VERSION, bakeScene, cleanStage, createFrameExportJob, createJsonFramesAdapter, exportStandalone, frameDigest, sampleBaked };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.8.0/dist/components/studio-export.js.map