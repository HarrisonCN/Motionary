import { R as RUNTIME_VERSION } from '../chunks/registry-W7pXOwju.js';
import { a as animatedImagePlayer, u as u8, c as composeFrames, d as bytesOf, f as fixDelay } from '../chunks/anim-image-Btw3j5Qb.js';
import '../chunks/tween-WepVA7id.js';
import '../chunks/ticker-D0qF_rV_.js';
import '../chunks/ease-XN8_0sXu.js';

/**
 * `motionary/runtime/format-gif` (10.4) — a complete GIF decoder written for
 * Motionary (own LZW implementation, no dependencies, no DOM): GIF87a / GIF89a,
 * global and local palettes, transparency, interlaced frames, disposal
 * methods 0–3, per-frame delays and the NETSCAPE2.0 loop count. Frames are
 * composited to full-size RGBA, so they can be drawn, scrubbed or reversed
 * with `animatedImagePlayer()` (a runtime timeline).
 *
 * ```ts
 * import { use } from 'motionary/runtime';
 * import { formatGif, loadGif, animatedImagePlayer } from 'motionary/runtime/format-gif';
 * use(formatGif);
 * const gif = await loadGif('/loader.gif');
 * const player = animatedImagePlayer(canvas, gif);   // player.pause(); player.progress = 0.5
 * ```
 */
/** LZW-decode GIF image data into palette indices (exported for tests / tools). */
function lzwDecode(minCodeSize, data, pixelCount) {
    const out = new Uint8Array(pixelCount);
    const clear = 1 << minCodeSize, eoi = clear + 1;
    const prefix = new Uint16Array(4096), suffix = new Uint8Array(4096), stack = new Uint8Array(4097);
    let size = minCodeSize + 1, mask = (1 << size) - 1, next = eoi + 1;
    let old = -1, first = 0, bits = 0, acc = 0, op = 0, pos = 0;
    for (let i = 0; i < clear; i++)
        suffix[i] = i;
    while (op < pixelCount) {
        while (bits < size) {
            if (pos >= data.length)
                return out; // truncated data: keep what we have
            acc |= data[pos++] << bits;
            bits += 8;
        }
        const code = acc & mask;
        acc >>>= size;
        bits -= size;
        if (code === clear) {
            size = minCodeSize + 1;
            mask = (1 << size) - 1;
            next = eoi + 1;
            old = -1;
            continue;
        }
        if (code === eoi)
            break;
        if (old === -1) {
            out[op++] = suffix[code];
            old = first = code;
            continue;
        }
        let c = code, sp = 0;
        if (code >= next) {
            stack[sp++] = first;
            c = old;
        }
        while (c >= clear) {
            stack[sp++] = suffix[c];
            c = prefix[c];
        }
        first = suffix[c];
        stack[sp++] = first;
        while (sp && op < pixelCount)
            out[op++] = stack[--sp];
        if (next < 4096) {
            prefix[next] = old;
            suffix[next] = first;
            next++;
            if (next > mask && size < 12) {
                size++;
                mask = (1 << size) - 1;
            }
        }
        old = code;
    }
    return out;
}
const DISPOSE = ['none', 'none', 'background', 'previous'];
/** Decode a GIF (bytes) into composited RGBA frames. Pure: no DOM, works in workers / Node. */
function decodeGif(input) {
    const b = u8(input);
    const sig = String.fromCharCode(...b.subarray(0, 6));
    if (sig !== 'GIF87a' && sig !== 'GIF89a')
        throw new Error('[motionary] format-gif: not a GIF file');
    const width = b[6] | (b[7] << 8), height = b[8] | (b[9] << 8), flags = b[10];
    let p = 13, gct = null;
    if (flags & 0x80) {
        const n = 3 << ((flags & 7) + 1);
        gct = b.subarray(p, p + n);
        p += n;
    }
    const parts = [];
    let loopCount = null, delay = 0, transparent = -1, disposal = 0;
    const blocks = () => {
        const chunks = [];
        let len = 0;
        while (p < b.length) {
            const n = b[p++];
            if (!n)
                break;
            chunks.push(b.subarray(p, p + n));
            len += n;
            p += n;
        }
        const outB = new Uint8Array(len);
        let o = 0;
        for (const c of chunks) {
            outB.set(c, o);
            o += c.length;
        }
        return outB;
    };
    while (p < b.length) {
        const t = b[p++];
        if (t === 0x3b)
            break; // trailer
        if (t === 0x21) {
            const label = b[p++];
            if (label === 0xf9) {
                const d = blocks();
                disposal = (d[0] >> 2) & 7;
                delay = (d[1] | (d[2] << 8)) * 10;
                transparent = d[0] & 1 ? d[3] : -1;
            }
            else if (label === 0xff) {
                const id = String.fromCharCode(...b.subarray(p + 1, p + 12));
                const d = blocks();
                if ((id === 'NETSCAPE2.0' || id === 'ANIMEXTS1.0') && d.length >= 14 && d[11] === 1)
                    loopCount = d[12] | (d[13] << 8);
            }
            else
                blocks();
            continue;
        }
        if (t !== 0x2c)
            break; // unknown block: stop (corrupt tail)
        const x = b[p] | (b[p + 1] << 8), y = b[p + 2] | (b[p + 3] << 8), w = b[p + 4] | (b[p + 5] << 8), h = b[p + 6] | (b[p + 7] << 8), f = b[p + 8];
        p += 9;
        let pal = gct;
        if (f & 0x80) {
            const n = 3 << ((f & 7) + 1);
            pal = b.subarray(p, p + n);
            p += n;
        }
        const minCode = b[p++];
        const idx = lzwDecode(minCode, blocks(), w * h);
        const rows = new Uint32Array(h);
        if (f & 0x40) {
            // interlaced: rows come in 4 passes (every 8th from 0, every 8th from 4, every 4th from 2, every 2nd from 1)
            let r = 0;
            for (const [start, step] of [[0, 8], [4, 8], [2, 4], [1, 2]])
                for (let yy = start; yy < h; yy += step)
                    rows[r++] = yy;
        }
        else
            for (let yy = 0; yy < h; yy++)
                rows[yy] = yy;
        const data = new Uint8ClampedArray(w * h * 4);
        for (let r = 0; r < h; r++) {
            const dy = rows[r];
            for (let xx = 0; xx < w; xx++) {
                const ci = idx[r * w + xx], o = (dy * w + xx) * 4;
                if (ci === transparent || !pal || ci * 3 + 2 >= pal.length)
                    continue;
                data[o] = pal[ci * 3];
                data[o + 1] = pal[ci * 3 + 1];
                data[o + 2] = pal[ci * 3 + 2];
                data[o + 3] = 255;
            }
        }
        parts.push({ x, y, image: { width: w, height: h, data }, delay: fixDelay(delay), blend: 'over', dispose: DISPOSE[disposal] || 'none' });
        delay = 0;
        transparent = -1;
        disposal = 0;
    }
    // like browsers, "restore to background" clears to transparent
    const frames = composeFrames(width, height, parts);
    return {
        format: 'gif',
        width,
        height,
        plays: loopCount === null ? 1 : loopCount === 0 ? 0 : loopCount + 1,
        frames,
        info: { version: sig.slice(3), width, height, loopCount, frameCount: frames.length },
    };
}
/** Fetch (URL) or read (ArrayBuffer / Blob / bytes) and decode a GIF. */
async function loadGif(src) {
    return decodeGif(await bytesOf(src));
}
/** The module object for `use(formatGif)`. */
const formatGif = { id: 'format-gif', version: RUNTIME_VERSION, requires: ['core'], api: { decodeGif, loadGif, lzwDecode, animatedImagePlayer } };

export { animatedImagePlayer, composeFrames, decodeGif, formatGif, loadGif, lzwDecode };
//# sourceMappingURL=format-gif.js.map
