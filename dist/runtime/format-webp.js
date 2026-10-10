import { R as RUNTIME_VERSION } from '../chunks/registry-CMjteilk.js';
import { a as animatedImagePlayer, b as browserDecode, c as composeFrames, d as bytesOf, u as u8, f as fixDelay } from '../chunks/anim-image-C_KpJ7os.js';
import '../chunks/tween-B0nMjJJi.js';
import '../chunks/ticker-wWXyZQwD.js';
import '../chunks/ease-XN8_0sXu.js';

/**
 * `motionary/runtime/format-webp` (10.4) — animated WebP loader written for
 * Motionary: reads the RIFF container (`VP8X`, `ANIM`, `ANMF`), rebuilds each
 * frame (lossy `VP8 ` with optional `ALPH`, or lossless `VP8L`) as a
 * standalone WebP file that the browser's own decoder decodes, then
 * composites the frames (blending on / off, dispose to background) into
 * full-size RGBA. A still WebP loads as a one-frame animation.
 *
 * `parseWebp()` and `webpFrameFiles()` are pure (no DOM); `decodeWebp()` uses
 * the browser decoder by default (also in workers) or your own `{ decode }`.
 * Browsers without WebP support cannot decode the frames — fall back to `<img>`.
 */
const u24 = (b, i) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
const u32le = (b, i) => (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;
const tag = (b, i) => String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);
/** Read RIFF chunks from `start` to `end` (pure). */
function riffChunks(b, start = 12, end = b.length) {
    const out = [];
    let p = start;
    while (p + 8 <= end) {
        const n = u32le(b, p + 4);
        out.push({ type: tag(b, p), data: b.subarray(p + 8, p + 8 + n) });
        p += 8 + n + (n & 1);
    }
    return out;
}
/** Size of a still VP8 / VP8L bitstream. */
function bitstreamSize(c) {
    const d = c.data;
    if (c.type === 'VP8L') {
        const bits = u32le(d, 1);
        return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
    }
    return [(d[6] | (d[7] << 8)) & 0x3fff, (d[8] | (d[9] << 8)) & 0x3fff];
}
/** Parse the container (pure; no pixels decoded). */
function parseWebp(input) {
    const b = u8(input);
    if (tag(b, 0) !== 'RIFF' || tag(b, 8) !== 'WEBP')
        throw new Error('[motionary] format-webp: not a WebP file');
    const chunks = riffChunks(b, 12, Math.min(b.length, 8 + u32le(b, 4)));
    const x = chunks.find((c) => c.type === 'VP8X');
    const anim = chunks.find((c) => c.type === 'ANIM');
    const anmf = chunks.filter((c) => c.type === 'ANMF');
    if (x && anim && anmf.length) {
        const width = u24(x.data, 4) + 1, height = u24(x.data, 7) + 1;
        const bg = anim.data;
        const frames = anmf.map((f) => {
            const d = f.data, flags = d[15];
            return { x: u24(d, 0) * 2, y: u24(d, 3) * 2, width: u24(d, 6) + 1, height: u24(d, 9) + 1, delay: fixDelay(u24(d, 12)), blend: flags & 2 ? 'source' : 'over', dispose: flags & 1 ? 'background' : 'none', chunks: riffChunks(d, 16, d.length).filter((c) => /^(ALPH|VP8 |VP8L)$/.test(c.type)) };
        });
        // ANIM background is stored B, G, R, A
        return { width, height, animated: true, plays: bg[4] | (bg[5] << 8), background: [bg[2], bg[1], bg[0], bg[3]], frames };
    }
    const img = chunks.filter((c) => /^(ALPH|VP8 |VP8L)$/.test(c.type));
    const main = img.find((c) => c.type !== 'ALPH');
    if (!main)
        throw new Error('[motionary] format-webp: no image data');
    const [w, h] = x ? [u24(x.data, 4) + 1, u24(x.data, 7) + 1] : bitstreamSize(main);
    return { width: w, height: h, animated: false, plays: 1, background: [0, 0, 0, 0], frames: [{ x: 0, y: 0, width: w, height: h, delay: 100, blend: 'source', dispose: 'none', chunks: img }] };
}
function riff(chunks) {
    const size = chunks.reduce((n, c) => n + 8 + c.data.length + (c.data.length & 1), 4);
    const out = new Uint8Array(8 + size);
    const v = new DataView(out.buffer);
    const put = (s, i) => { for (let k = 0; k < 4; k++)
        out[i + k] = s.charCodeAt(k); };
    put('RIFF', 0);
    v.setUint32(4, size, true);
    put('WEBP', 8);
    let p = 12;
    for (const c of chunks) {
        put(c.type, p);
        v.setUint32(p + 4, c.data.length, true);
        out.set(c.data, p + 8);
        p += 8 + c.data.length + (c.data.length & 1);
    }
    return out;
}
/** Rebuild every frame as a standalone (still) WebP file (pure). */
function webpFrameFiles(info) {
    return info.frames.map((f) => {
        if (!f.chunks.some((c) => c.type === 'ALPH'))
            return riff(f.chunks.filter((c) => c.type !== 'ALPH'));
        // lossy + alpha needs an extended header (VP8X with the alpha flag)
        const vp8x = new Uint8Array(10);
        vp8x[0] = 0x10;
        const w = f.width - 1, h = f.height - 1;
        vp8x.set([w & 255, (w >> 8) & 255, (w >> 16) & 255, h & 255, (h >> 8) & 255, (h >> 16) & 255], 4);
        return riff([{ type: 'VP8X', data: vp8x }, ...f.chunks]);
    });
}
/** Decode an animated (or still) WebP into composited RGBA frames. */
async function decodeWebp(input, o = {}) {
    const info = parseWebp(input);
    const decode = o.decode || browserDecode;
    const images = await Promise.all(webpFrameFiles(info).map((f) => decode(f, 'image/webp')));
    const parts = info.frames.map((f, i) => ({ x: f.x, y: f.y, image: images[i], delay: f.delay, blend: f.blend, dispose: f.dispose }));
    return { format: 'webp', width: info.width, height: info.height, plays: info.plays, frames: composeFrames(info.width, info.height, parts), info };
}
/** Fetch (URL) or read (ArrayBuffer / Blob / bytes) and decode a WebP. */
async function loadWebp(src, o = {}) {
    return decodeWebp(await bytesOf(src), o);
}
/** The module object for `use(formatWebp)`. */
const formatWebp = { id: 'format-webp', version: RUNTIME_VERSION, tier: 'standard', requires: ['core'], api: { parseWebp, webpFrameFiles, decodeWebp, loadWebp, animatedImagePlayer } };

export { animatedImagePlayer, decodeWebp, formatWebp, loadWebp, parseWebp, riffChunks, webpFrameFiles };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.5.0/dist/runtime/format-webp.js.map