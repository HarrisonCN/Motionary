import { P as Playable } from './tween-_Lld1MsF.js';

/**
 * Shared internals of the animated-image loaders (`format-gif`, `format-apng`,
 * `format-webp`, 10.4): the decoded-animation shape, frame compositing in
 * plain RGBA arrays (no DOM — works in workers and on the server), the
 * browser image decoder used for APNG / WebP frames, and the canvas player
 * (a runtime `Playable`, so it can be paused, reversed, scrubbed and driven
 * by a scroll scene). Bundled into each loader; not a public module.
 */
/** Browsers clamp tiny delays (0–10 ms) to 100 ms; we do the same. */
const fixDelay = (ms) => (ms <= 10 ? 100 : ms);
/** Composite frame parts onto a `width × height` canvas (pure; RGBA in, RGBA out). */
function composeFrames(width, height, parts, background) {
    const canvas = new Uint8ClampedArray(width * height * 4);
    const out = [];
    for (const p of parts) {
        const before = p.dispose === 'previous' ? canvas.slice() : null;
        const { width: w, height: h, data } = p.image;
        for (let y = 0; y < h; y++) {
            const cy = p.y + y;
            if (cy < 0 || cy >= height)
                continue;
            for (let x = 0; x < w; x++) {
                const cx = p.x + x;
                if (cx < 0 || cx >= width)
                    continue;
                const s = (y * w + x) * 4, d = (cy * width + cx) * 4;
                const a = data[s + 3];
                if (p.blend === 'source' || a === 255) {
                    canvas[d] = data[s];
                    canvas[d + 1] = data[s + 1];
                    canvas[d + 2] = data[s + 2];
                    canvas[d + 3] = a;
                }
                else if (a) {
                    // straight-alpha "over"
                    const da = canvas[d + 3] / 255, sa = a / 255, oa = sa + da * (1 - sa);
                    for (let c = 0; c < 3; c++)
                        canvas[d + c] = (data[s + c] * sa + canvas[d + c] * da * (1 - sa)) / oa;
                    canvas[d + 3] = oa * 255;
                }
            }
        }
        out.push({ delay: p.delay, image: { width, height, data: canvas.slice() } });
        if (p.dispose === 'background') {
            for (let y = Math.max(0, p.y); y < Math.min(height, p.y + h); y++)
                for (let x = Math.max(0, p.x); x < Math.min(width, p.x + w); x++)
                    canvas.set(background || [0, 0, 0, 0], (y * width + x) * 4);
        }
        else if (before)
            canvas.set(before);
    }
    return out;
}
/** Default decoder: the browser's own (`createImageBitmap` + a 2D canvas; OffscreenCanvas in workers). */
const browserDecode = async (bytes, mime) => {
    const g = globalThis;
    if (typeof g.createImageBitmap !== 'function')
        throw new Error('[motionary] no image decoder here (createImageBitmap is missing) — pass { decode } to the loader');
    const bmp = await g.createImageBitmap(new Blob([bytes], { type: mime }));
    const w = bmp.width, h = bmp.height; // read before close(): a closed ImageBitmap reports 0 × 0
    const c = typeof g.OffscreenCanvas === 'function' ? new g.OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bmp, 0, 0);
    bmp.close?.();
    const id = ctx.getImageData(0, 0, w, h);
    return { width: id.width, height: id.height, data: id.data };
};
/** Read a `src` (URL, ArrayBuffer, typed array or Blob) into bytes. */
async function bytesOf(src) {
    if (typeof src === 'string') {
        const r = await fetch(src);
        if (!r.ok)
            throw new Error(`[motionary] could not load ${src} (${r.status})`);
        return new Uint8Array(await r.arrayBuffer());
    }
    if (src instanceof ArrayBuffer)
        return new Uint8Array(src);
    if (ArrayBuffer.isView(src))
        return new Uint8Array(src.buffer, src.byteOffset, src.byteLength);
    return new Uint8Array(await src.arrayBuffer());
}
class AnimImagePlayer extends Playable {
    constructor(canvas, anim, o) {
        super({ repeat: o.repeat ?? (anim.plays === 0 ? -1 : Math.max(0, anim.plays - 1)), yoyo: o.yoyo });
        this.canvas = canvas;
        this.anim = anim;
        this.times = [0];
        this.cur = -1;
        this.timeScale = o.speed || 1;
        for (const f of anim.frames)
            this.times.push(this.times[this.times.length - 1] + f.delay);
        if (canvas.width !== anim.width)
            canvas.width = anim.width;
        if (canvas.height !== anim.height)
            canvas.height = anim.height;
        this.ctx = canvas.getContext('2d');
        this.datas = anim.frames.map(() => null);
        this.show(0);
        if (!o.paused)
            this.play();
    }
    get duration() {
        return this.times[this.times.length - 1];
    }
    get frame() {
        return this.cur;
    }
    get frameCount() {
        return this.anim.frames.length;
    }
    renderLocal(ms) {
        const t = Math.min(ms, this.duration - 0.001);
        let lo = 0, hi = this.anim.frames.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (this.times[mid] <= t)
                lo = mid;
            else
                hi = mid - 1;
        }
        this.show(lo);
    }
    show(i) {
        if (i === this.cur || !this.ctx)
            return;
        this.cur = i;
        const f = this.anim.frames[i];
        if (!f)
            return;
        let d = this.datas[i];
        if (!d && typeof ImageData === 'function')
            d = this.datas[i] = new ImageData(new Uint8ClampedArray(f.image.data), f.image.width, f.image.height);
        if (d)
            this.ctx.putImageData(d, 0, 0);
    }
}
/** Play a decoded animation on a canvas as a runtime timeline (seek / reverse / `progress` scrub). */
function animatedImagePlayer(canvas, anim, o = {}) {
    if (!anim.frames.length)
        throw new Error('[motionary] animatedImagePlayer: the animation has no frames');
    return new AnimImagePlayer(canvas, anim, o);
}
/** A plain Uint8Array view (Node Buffers' `slice()` shares memory — normalise them away). */
const u8 = (x) => (x instanceof ArrayBuffer ? new Uint8Array(x) : new Uint8Array(x.buffer, x.byteOffset, x.byteLength));
/** CRC-32 (PNG chunks). */
let CRC = null;
function crc32(bytes, start = 0, end = bytes.length) {
    if (!CRC) {
        CRC = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++)
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            CRC[n] = c >>> 0;
        }
    }
    let c = 0xffffffff;
    for (let i = start; i < end; i++)
        c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

export { animatedImagePlayer as a, browserDecode as b, composeFrames as c, bytesOf as d, crc32 as e, fixDelay as f, u8 as u };
//# sourceMappingURL=anim-image-CXDD19FH.js.map
