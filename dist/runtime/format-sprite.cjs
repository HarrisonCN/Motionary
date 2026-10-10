'use strict';

var registry = require('../chunks/registry-U0scTJZr.cjs');
var tween = require('../chunks/tween-DRtewovf.cjs');
require('../chunks/ticker-D58R9_k6.cjs');
require('../chunks/ease-HwYZnZat.cjs');

/**
 * `motionary/runtime/format-sprite` (10.3) — sprite sheets and image
 * sequences on the runtime timeline (original implementation).
 *
 * - `parseSpriteSheet(json)` — TexturePacker JSON (hash and array), Aseprite
 *   JSON (hash and array, per-frame `duration`, `meta.frameTags` with
 *   `forward` / `reverse` / `pingpong` directions) and the generic
 *   `{ frames: [{ x, y, w, h }] }` shape; trimmed frames (`spriteSourceSize` /
 *   `sourceSize`) and rotated frames are supported.
 * - `gridSheet(cols, rows, w, h, n?)` — a plain grid sheet.
 * - `frameOrder(sheet, tag?)` — the playback order of a tag (pingpong without repeating the ends).
 * - `spritePlayer(target, sheet, image, { tag, fps })` — a runtime `Playable`
 *   that draws frames onto a `<canvas>` or moves the background of an element.
 * - `imageSequence('frame_{0001}.webp', { start, end })`, `preloadImages(urls)`,
 *   `sequencePlayer(canvas, images, { fps })` — numbered image sequences,
 *   scrubbable (`player.progress = p`, e.g. from a scroll scene).
 * Parsing works without the DOM (SSR / workers); players need a canvas / element.
 */
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
/** Parse a sprite-sheet JSON (object or string). */
function parseSpriteSheet(input) {
    const j = typeof input === 'string' ? JSON.parse(input) : input;
    if (!j || !j.frames)
        throw new Error('[motionary] format-sprite: no "frames" in the sprite sheet JSON');
    const meta = j.meta || {};
    const aseprite = /aseprite/i.test(meta.app || '') || Array.isArray(meta.frameTags);
    const entries = Array.isArray(j.frames) ? j.frames.map((f, i) => [f.filename ?? f.name ?? String(i), f]) : Object.entries(j.frames);
    const frames = entries.map(([name, f]) => {
        const r = f.frame || f;
        const rotated = !!f.rotated;
        const sss = f.spriteSourceSize || { x: 0, y: 0 };
        const ss = f.sourceSize || { w: r.w, h: r.h };
        const out = { name, x: num(r.x), y: num(r.y), w: num(r.w), h: num(r.h), rotated, offsetX: num(sss.x), offsetY: num(sss.y), sourceW: num(ss.w, r.w), sourceH: num(ss.h, r.h) };
        if (typeof f.duration === 'number')
            out.duration = f.duration;
        return out;
    });
    if (!Array.isArray(j.frames) && !aseprite)
        frames.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const tags = (meta.frameTags || []).map((t) => ({ name: t.name, from: num(t.from), to: num(t.to), direction: t.direction || 'forward' }));
    return { frames, tags, image: meta.image, size: meta.size, format: aseprite ? 'aseprite' : meta.app || j.meta ? 'texturepacker' : 'generic' };
}
/** A grid sheet: `cols × rows` cells of `w × h` (first `n` cells). */
function gridSheet(cols, rows, w, h, n = cols * rows) {
    const frames = [];
    for (let i = 0; i < n; i++)
        frames.push({ name: String(i), x: (i % cols) * w, y: Math.floor(i / cols) * h, w, h, rotated: false, offsetX: 0, offsetY: 0, sourceW: w, sourceH: h });
    return { frames, tags: [], format: 'generic' };
}
/** Frame indices for a tag (or the whole sheet). */
function frameOrder(sheet, tag) {
    const t = tag ? sheet.tags.find((x) => x.name === tag) : undefined;
    if (tag && !t)
        throw new Error(`[motionary] format-sprite: unknown tag "${tag}" (have: ${sheet.tags.map((x) => x.name).join(', ') || 'none'})`);
    const from = t ? t.from : 0, to = t ? t.to : sheet.frames.length - 1;
    const fwd = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    const dir = t?.direction || 'forward';
    if (dir === 'reverse')
        return fwd.reverse();
    if (dir === 'pingpong')
        return [...fwd, ...fwd.slice(1, -1).reverse()];
    if (dir === 'pingpong_reverse') {
        const r = fwd.reverse();
        return [...r, ...r.slice(1, -1).reverse()];
    }
    return fwd;
}
/** Draw one frame onto a 2D context at (dx, dy), honouring trim offsets and rotation. */
function drawFrame(ctx, image, f, dx = 0, dy = 0, scale = 1) {
    ctx.save();
    ctx.translate(dx + f.offsetX * scale, dy + f.offsetY * scale);
    if (f.rotated) {
        // TexturePacker stores rotated frames 90° clockwise: w/h are the unrotated size
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(image, f.x, f.y, f.h, f.w, -f.h * scale, 0, f.h * scale, f.w * scale);
    }
    else
        ctx.drawImage(image, f.x, f.y, f.w, f.h, 0, 0, f.w * scale, f.h * scale);
    ctx.restore();
}
/** Plays a list of frames (by index) with per-frame durations. */
class FramePlayable extends tween.Playable {
    constructor() {
        super(...arguments);
        this.times = [0];
        this.order = [];
        this.current = -1;
    }
    setOrder(order, dur) {
        this.order = order;
        this.times = [0];
        for (const i of order)
            this.times.push(this.times[this.times.length - 1] + dur(i));
    }
    get duration() {
        return this.times[this.times.length - 1];
    }
    /** Index into `order` at a local time. */
    indexAt(ms) {
        let lo = 0, hi = this.order.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (this.times[mid] <= ms)
                lo = mid;
            else
                hi = mid - 1;
        }
        return Math.min(lo, this.order.length - 1);
    }
    renderLocal(ms) {
        const k = this.order[this.indexAt(Math.min(ms, this.duration - 0.001))];
        if (k === this.current)
            return;
        this.current = k;
        this.show(k);
    }
    /** The frame index currently shown. */
    get frame() {
        return this.current;
    }
}
class SpritePlayer extends FramePlayable {
    constructor(target, sheet, image, o) {
        super({ repeat: o.repeat ?? -1, yoyo: o.yoyo });
        this.target = target;
        this.sheet = sheet;
        this.image = image;
        const fps = o.fps || 12;
        this.setOrder(frameOrder(sheet, o.tag), (i) => sheet.frames[i].duration ?? 1000 / fps);
        this.scale = o.scale;
        if (!o.paused)
            this.play();
    }
    show(i) {
        const f = this.sheet.frames[i];
        const t = this.target;
        if (typeof t.getContext === 'function' && typeof this.image !== 'string') {
            const ctx = t.getContext('2d');
            if (!ctx)
                return;
            const s = this.scale ?? t.width / (f.sourceW || f.w || 1);
            ctx.clearRect(0, 0, t.width, t.height);
            drawFrame(ctx, this.image, f, 0, 0, s);
        }
        else {
            const el = this.target;
            if (typeof this.image === 'string')
                el.style.backgroundImage = `url("${this.image}")`;
            el.style.backgroundPosition = `${-f.x}px ${-f.y}px`;
            el.style.width = `${f.w}px`;
            el.style.height = `${f.h}px`;
            el.style.backgroundRepeat = 'no-repeat';
        }
    }
}
/** Play a sprite sheet on a canvas (image = loaded image / bitmap) or an element's background (image = URL). */
function spritePlayer(target, sheet, image, o = {}) {
    return new SpritePlayer(target, sheet, image, o);
}
/** 'frame_{0001}.webp' + { start: 1, end: 3 } → frame_0001.webp, frame_0002.webp, frame_0003.webp ('{1}' = no padding). */
function imageSequence(pattern, o) {
    const m = /\{(\d+)\}/.exec(pattern);
    if (!m)
        throw new Error('[motionary] format-sprite: the pattern needs a {0001}-style placeholder');
    const pad = m[1].length;
    const out = [];
    for (let i = o.start ?? (+m[1] || 0); i <= o.end; i += o.step || 1)
        out.push(pattern.replace(m[0], String(i).padStart(pad, '0')));
    return out;
}
/** Load images (resolves when all are decoded; rejects with the failing URL). */
function preloadImages(urls) {
    return Promise.all(urls.map((u) => new Promise((ok, bad) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => ok(img);
        img.onerror = () => bad(new Error(`[motionary] format-sprite: could not load ${u}`));
        img.src = u;
    })));
}
class SequencePlayer extends FramePlayable {
    constructor(canvas, images, o) {
        super({ repeat: o.repeat ?? 0, yoyo: o.yoyo });
        this.canvas = canvas;
        this.images = images;
        const fps = o.fps || 24;
        this.setOrder(images.map((_, i) => i), () => 1000 / fps);
        if (!o.paused)
            this.play();
    }
    show(i) {
        const ctx = this.canvas.getContext('2d');
        const img = this.images[i];
        if (!ctx || !img)
            return;
        const w = this.canvas.width, h = this.canvas.height;
        const iw = img.naturalWidth || img.width || w, ih = img.naturalHeight || img.height || h;
        const s = Math.max(w / iw, h / ih); // cover
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
    }
}
/** Play (or scrub, via `progress`) an image sequence on a canvas, `object-fit: cover` style. */
function sequencePlayer(canvas, images, o = {}) {
    return new SequencePlayer(canvas, images, o);
}
/** The module object for `use(formatSprite)`. */
const formatSprite = { id: 'format-sprite', version: registry.RUNTIME_VERSION, tier: 'standard', requires: ['core'], api: { parseSpriteSheet, gridSheet, frameOrder, drawFrame, spritePlayer, imageSequence, preloadImages, sequencePlayer } };

exports.drawFrame = drawFrame;
exports.formatSprite = formatSprite;
exports.frameOrder = frameOrder;
exports.gridSheet = gridSheet;
exports.imageSequence = imageSequence;
exports.parseSpriteSheet = parseSpriteSheet;
exports.preloadImages = preloadImages;
exports.sequencePlayer = sequencePlayer;
exports.spritePlayer = spritePlayer;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/runtime/format-sprite.cjs.map