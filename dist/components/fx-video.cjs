'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
var base = require('../chunks/base-B3me2y0o.cjs');

/** Scroll progress of `el` through the viewport: 0 entering at the bottom → 1 leaving at the top (9.4). */
function scrollProgress(el) {
    const r = el.getBoundingClientRect();
    const vh = (typeof innerHeight === 'number' && innerHeight) || 1;
    return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height || 1)));
}
/** Scroll-driven video: `video.currentTime` follows the scroll progress of `trigger` (9.4). */
function scrubVideo(video, trigger = video, opts = {}) {
    video.pause();
    if (base.prefersReducedMotion())
        return () => undefined;
    const k = Math.min(1, Math.max(0.02, opts.ease ?? 0.15));
    let cur = 0;
    return base.onFrame(() => {
        const d = video.duration;
        if (!d || !Number.isFinite(d))
            return;
        const target = scrollProgress(trigger) * d;
        cur += (target - cur) * k;
        if (Math.abs(video.currentTime - cur) > 1 / 60)
            video.currentTime = cur;
    });
}
/** Image-sequence scrubbing on a canvas (preloads `src(i)`, or paints with `draw`) (9.4). */
function frameSequence(canvas, seq, trigger = canvas) {
    const ctx = canvas.getContext?.('2d');
    const n = Math.max(1, Math.floor(seq.count));
    const imgs = [];
    if (seq.src && typeof Image !== 'undefined')
        for (let i = 0; i < n; i++) {
            const im = new Image();
            im.decoding = 'async';
            im.src = seq.src(i);
            imgs.push(im);
        }
    let last = -1;
    const paint = (i) => {
        if (!ctx || i === last)
            return;
        const w = canvas.width;
        const h = canvas.height;
        if (seq.draw) {
            ctx.clearRect(0, 0, w, h);
            seq.draw(ctx, i, w, h);
            last = i;
        }
        else if (imgs[i]?.complete && imgs[i].naturalWidth) {
            const im = imgs[i];
            const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
            ctx.drawImage(im, (w - im.naturalWidth * s) / 2, (h - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
            last = i;
        }
    };
    paint(0);
    if (base.prefersReducedMotion())
        return () => undefined;
    return base.onFrame(() => paint(Math.min(n - 1, Math.floor(scrollProgress(trigger) * n))));
}
const VIDEO_FX = [
    {
        name: 'film-burn',
        kind: 'enter',
        description: 'A warm light leak burns across as the element appears (`color`).',
        defaults: { color: 'rgba(255,140,40,.85)', duration: 1300 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 })?.finished.catch(() => undefined);
            if (getComputedStyle(el).position === 'static') {
                const prev = el.style.position;
                el.style.position = 'relative';
                ctx.onCleanup(() => (el.style.position = prev));
            }
            const leak = document.createElement('span');
            leak.setAttribute('aria-hidden', 'true');
            Object.assign(leak.style, { position: 'absolute', inset: '0', pointerEvents: 'none', borderRadius: 'inherit', background: `radial-gradient(ellipse at 20% 50%, ${o.color}, transparent 60%)`, mixBlendMode: 'screen', backgroundSize: '200% 100%' });
            el.appendChild(leak);
            ctx.onCleanup(() => leak.remove());
            const a = ctx.animate(el, [{ opacity: 0, filter: 'brightness(2.2) sepia(.5)' }, { opacity: 1, filter: 'brightness(1.4) sepia(.2)', offset: 0.4 }, { opacity: 1, filter: 'none' }], { duration: o.duration, delay: o.delay, easing: 'ease-out', fill: 'backwards' });
            const b = ctx.animate(leak, [{ backgroundPosition: '100% 0', opacity: 1 }, { backgroundPosition: '-60% 0', opacity: 0 }], { duration: o.duration, delay: o.delay, easing: 'ease-in-out', fill: 'backwards' });
            const end = () => leak.remove();
            return Promise.all([a?.finished.catch(() => undefined), b?.finished.catch(() => undefined)]).then(end, end);
        },
    },
    {
        name: 'jump-cut',
        kind: 'attention',
        description: 'Two hard cuts (zoom, reframe) and back, like an edit.',
        defaults: { duration: 700 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            return ctx.animate(el, [{ transform: 'none' }, { transform: 'scale(1.18) translate(3%, -2%)', offset: 0.3 }, { transform: 'scale(1.06) translate(-4%, 2%)', offset: 0.6 }, { transform: 'none', offset: 0.9 }, { transform: 'none' }], { duration: o.duration, easing: 'steps(1, end)' })?.finished.catch(() => undefined);
        },
    },
];
/** Register film-burn and jump-cut (9.4). */
function registerVideoPack() {
    registry.registerEffects(VIDEO_FX);
}

exports.VIDEO_FX = VIDEO_FX;
exports.frameSequence = frameSequence;
exports.registerVideoPack = registerVideoPack;
exports.scrollProgress = scrollProgress;
exports.scrubVideo = scrubVideo;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.8.0/dist/components/fx-video.cjs.map