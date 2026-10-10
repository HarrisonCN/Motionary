'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
require('../chunks/base-B3me2y0o.cjs');

/** A deterministic PRNG in [0, 1) from a seed (8.5). */
function paperRandom(seed) {
    let s = Math.abs(Math.round(seed * 1000)) % 233280 || 11;
    return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}
/** A hand-drawn SVG path from (x1,y1) to (x2,y2): a slightly bowed, wobbly line (8.5). */
function roughLine(x1, y1, x2, y2, seed = 1, amp = 1.5) {
    const r = paperRandom(seed);
    const j = () => (r() - 0.5) * 2 * amp;
    const mx = (x1 + x2) / 2 + j() * 1.5;
    const my = (y1 + y2) / 2 + j() * 1.5;
    const f = (n) => Math.round(n * 10) / 10;
    return `M${f(x1 + j())} ${f(y1 + j())} Q${f(mx)} ${f(my)} ${f(x2 + j())} ${f(y2 + j())}`;
}
const fade = (el, ctx) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 })?.finished.catch(() => undefined);
const PAPER_FX = [
    {
        name: 'paper-unfold',
        kind: 'enter',
        description: 'The element unfolds like a folded sheet of paper, with a soft crease shadow (`folds`).',
        defaults: { duration: 900, folds: 2 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            const n = Math.max(1, Math.min(4, Math.round(Number(o.folds) || 2)));
            const frames = [{ transform: 'perspective(800px) rotateX(-90deg)', opacity: 0, filter: 'brightness(.7)', offset: 0 }];
            for (let i = 1; i <= n; i++)
                frames.push({ transform: `perspective(800px) rotateX(${i % 2 ? 25 : -12}deg) scaleY(${(0.5 + (0.5 * i) / (n + 1)).toFixed(2)})`, opacity: 1, filter: 'brightness(.85)', offset: (i / (n + 1)) * 0.9 });
            frames.push({ transform: 'none', opacity: 1, filter: 'none', offset: 1 });
            const prev = el.style.transformOrigin;
            el.style.transformOrigin = 'top center';
            ctx.onCleanup(() => (el.style.transformOrigin = prev));
            return ctx.animate(el, frames, { duration: o.duration, easing: 'ease-out', fill: 'backwards' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'pencil-sketch',
        kind: 'enter',
        description: 'SVG strokes inside are sketched in with a slightly wobbly pencil, one after another (`duration`, `stagger`).',
        defaults: { duration: 700, stagger: 120 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const strokes = Array.from(el.querySelectorAll('path, line, polyline, rect, circle, ellipse'));
            const runs = strokes.map((p, i) => {
                let len = 200;
                try {
                    len = p.getTotalLength?.() || 200;
                }
                catch {
                    /* not rendered */
                }
                const prev = p.style.strokeDasharray;
                p.style.strokeDasharray = `${len}`;
                ctx.onCleanup(() => (p.style.strokeDasharray = prev));
                return ctx.animate(p, [{ strokeDashoffset: `${len}`, transform: 'translate(0.6px,-0.4px)' }, { transform: 'translate(-0.5px,0.5px)', offset: 0.5 }, { strokeDashoffset: '0', transform: 'none' }], { duration: o.duration, delay: i * (Number(o.stagger) || 0), easing: 'cubic-bezier(.5,.1,.4,1)', fill: 'backwards' })?.finished.catch(() => undefined);
            });
            return Promise.all(runs).then(() => undefined);
        },
    },
    {
        name: 'watercolor',
        kind: 'enter',
        description: 'The element bleeds in like wet watercolour — blurred and saturated, spreading from the middle — then dries (`duration`).',
        defaults: { duration: 1400 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            return ctx.animate(el, [
                { opacity: 0, filter: 'blur(10px) saturate(2.2)', clipPath: 'circle(8% at 50% 50%)' },
                { opacity: 0.9, filter: 'blur(4px) saturate(1.8)', clipPath: 'circle(55% at 48% 52%)', offset: 0.5 },
                { opacity: 1, filter: 'blur(0) saturate(1)', clipPath: 'circle(150% at 50% 50%)' },
            ], { duration: o.duration, easing: 'ease-out', fill: 'backwards' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'crumple',
        kind: 'attention',
        description: 'The element scrunches like crumpled paper and springs back flat.',
        defaults: { duration: 700 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            return ctx.animate(el, [
                { transform: 'none' },
                { transform: 'scale(.82,.9) rotate(-4deg) skewX(6deg)', filter: 'brightness(.9)', offset: 0.3 },
                { transform: 'scale(.9,.8) rotate(3deg) skewY(-5deg)', offset: 0.5 },
                { transform: 'scale(1.04) rotate(-1deg)', filter: 'none', offset: 0.8 },
                { transform: 'none' },
            ], { duration: o.duration, easing: 'ease-in-out' })?.finished.catch(() => undefined);
        },
    },
];
/** Register paper-unfold, pencil-sketch, watercolor and crumple (8.5). */
function registerPaperPack() {
    registry.registerEffects(PAPER_FX);
}

exports.PAPER_FX = PAPER_FX;
exports.paperRandom = paperRandom;
exports.registerPaperPack = registerPaperPack;
exports.roughLine = roughLine;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.9.0/dist/components/fx-paper.cjs.map