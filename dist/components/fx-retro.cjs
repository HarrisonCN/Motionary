'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
require('../chunks/base-B3me2y0o.cjs');

/** Keyframes stepping a CSS blur/contrast "pixel" filter from coarse to sharp (8.2). */
function pixelSteps(steps = 6) {
    const n = Math.max(2, Math.min(12, Math.round(steps)));
    return Array.from({ length: n + 1 }, (_, i) => {
        const k = 1 - i / n;
        return { filter: k ? `blur(${(k * 6).toFixed(1)}px) contrast(${(1 + k * 4).toFixed(1)}) saturate(${(1 + k).toFixed(1)})` : 'none', opacity: Math.min(1, 0.3 + i / n), offset: i / n };
    });
}
const fade = (el, ctx) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 })?.finished.catch(() => undefined);
const RETRO_FX = [
    {
        name: 'pixelate-in',
        kind: 'enter',
        description: 'The element resolves from blocky pixels to sharp, like an 8-bit sprite loading (`steps`).',
        defaults: { steps: 6, duration: 700 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            const n = Math.max(2, Math.min(12, Number(o.steps) || 6));
            return ctx.animate(el, pixelSteps(n), { duration: o.duration, easing: `steps(${n}, end)`, fill: 'backwards' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'crt-power',
        kind: 'enter',
        description: 'A CRT switching on: a bright line opens into the picture with a flash (`duration`).',
        defaults: { duration: 650 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            return ctx
                .animate(el, [{ transform: 'scale(.02, .004)', filter: 'brightness(6)', opacity: 0.9 }, { transform: 'scale(1, .006)', filter: 'brightness(5)', opacity: 1, offset: 0.35 }, { transform: 'scale(1, 1.04)', filter: 'brightness(1.6)', offset: 0.75 }, { transform: 'none', filter: 'none', opacity: 1 }], { duration: o.duration, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' })
                ?.finished.catch(() => undefined);
        },
    },
    {
        name: 'vhs-glitch',
        kind: 'attention',
        description: 'VHS tracking jitter with an RGB split and a noise band (`intensity` px).',
        defaults: { intensity: 4, duration: 600 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const k = Math.max(1, Math.min(12, Number(o.intensity) || 4));
            const f = [];
            for (let i = 0; i <= 8; i++) {
                const d = i === 0 || i === 8 ? 0 : (i % 2 ? 1 : -1) * k * (1 - i / 10);
                f.push({ transform: d ? `translateX(${d}px) skewX(${(d / 2).toFixed(1)}deg)` : 'none', textShadow: d ? `${-d}px 0 rgba(255,0,80,.75), ${d}px 0 rgba(0,220,255,.75)` : 'none', filter: d ? `hue-rotate(${d * 6}deg)` : 'none', offset: i / 8 });
            }
            return ctx.animate(el, f, { duration: o.duration, easing: 'steps(8, end)' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'y2k-shine',
        kind: 'attention',
        description: 'A chrome Y2K highlight sweeps across the element with a little bounce (`color`).',
        defaults: { color: 'rgba(255,255,255,.85)', duration: 900 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return ctx.animate(el, [{ filter: 'none' }, { filter: 'brightness(1.25)' }, { filter: 'none' }], { duration: 300 })?.finished.catch(() => undefined);
            if (getComputedStyle(el).position === 'static') {
                const prev = el.style.position;
                el.style.position = 'relative';
                ctx.onCleanup(() => (el.style.position = prev));
            }
            const prevO = el.style.overflow;
            el.style.overflow = 'hidden';
            const sh = document.createElement('span');
            sh.setAttribute('aria-hidden', 'true');
            Object.assign(sh.style, { position: 'absolute', top: '-20%', bottom: '-20%', left: '0', width: '45%', background: `linear-gradient(105deg, transparent, ${o.color} 45%, rgba(180,220,255,.6) 55%, transparent)`, pointerEvents: 'none', mixBlendMode: 'screen' });
            el.appendChild(sh);
            const end = () => {
                sh.remove();
                el.style.overflow = prevO;
            };
            ctx.onCleanup(end);
            ctx.animate(el, [{ transform: 'none' }, { transform: 'scale(1.04)', offset: 0.3 }, { transform: 'none' }], { duration: o.duration * 0.6, easing: 'ease-out' });
            const a = ctx.animate(sh, [{ transform: 'translateX(-120%) skewX(-12deg)' }, { transform: 'translateX(330%) skewX(-12deg)' }], { duration: o.duration, easing: 'cubic-bezier(.3,.6,.3,1)' });
            return a ? a.finished.then(end, end) : (end(), undefined);
        },
    },
];
/** Register pixelate-in, crt-power, vhs-glitch and y2k-shine (8.2). */
function registerRetroPack() {
    registry.registerEffects(RETRO_FX);
}

exports.RETRO_FX = RETRO_FX;
exports.pixelSteps = pixelSteps;
exports.registerRetroPack = registerRetroPack;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/components/fx-retro.cjs.map