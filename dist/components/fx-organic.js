import { registerEffects } from '../chunks/registry-CYojuxi5.js';
import '../chunks/base-zSGb8ujt.js';

/** A blob border-radius ("63% 37% 54% 46% / 55% 48% 52% 45%") from a seed (8.3). */
function blobRadius(seed) {
    let s = Math.abs(Math.round(seed * 1000)) % 233280 || 7;
    const r = () => 30 + ((s = (s * 9301 + 49297) % 233280) / 233280) * 40;
    const a = [r(), r(), r(), r()].map(Math.round);
    const b = [r(), r(), r(), r()].map(Math.round);
    return `${a[0]}% ${100 - a[0]}% ${a[2]}% ${100 - a[2]}% / ${b[0]}% ${b[1]}% ${100 - b[1]}% ${100 - b[0]}%`;
}
const fade = (el, ctx) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 })?.finished.catch(() => undefined);
const ORGANIC_FX = [
    {
        name: 'vine-grow',
        kind: 'enter',
        description: 'SVG paths grow along their length like a vine; `[data-leaf]` / circles pop in along the way (`duration`).',
        defaults: { duration: 1600 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const paths = Array.from(el.querySelectorAll('path, polyline, line'));
            const leaves = Array.from(el.querySelectorAll('[data-leaf], circle, ellipse'));
            const runs = paths.map((p) => {
                let len = 300;
                try {
                    len = p.getTotalLength?.() || 300;
                }
                catch {
                    /* not rendered */
                }
                const prev = p.style.strokeDasharray;
                p.style.strokeDasharray = `${len}`;
                ctx.onCleanup(() => (p.style.strokeDasharray = prev));
                return ctx.animate(p, [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }], { duration: o.duration, easing: 'cubic-bezier(.4,.1,.3,1)', fill: 'backwards' })?.finished.catch(() => undefined);
            });
            leaves.forEach((l, i) => {
                l.style.transformBox = 'fill-box';
                l.style.transformOrigin = 'center';
                runs.push(ctx.animate(l, [{ transform: 'scale(0) rotate(-40deg)', opacity: 0 }, { transform: 'scale(1.2) rotate(8deg)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 500, delay: (o.duration * (i + 1)) / (leaves.length + 1), easing: 'ease-out', fill: 'backwards' })?.finished.catch(() => undefined));
            });
            return Promise.all(runs).then(() => undefined);
        },
    },
    {
        name: 'bloom',
        kind: 'enter',
        description: "The element's children unfold from the centre like petals, or the element blooms open (`stagger`).",
        defaults: { stagger: 70, duration: 700 },
        run: (el, o, ctx) => {
            const kids = Array.from(el.children);
            const items = kids.length > 1 ? kids : [el];
            return Promise.all(items.map((k, i) => {
                if (ctx.reduced)
                    return fade(k, ctx);
                const rot = (i % 2 ? 1 : -1) * (25 + i * 6);
                return ctx.animate(k, [{ transform: `scale(0) rotate(${rot}deg)`, opacity: 0 }, { transform: 'scale(1.1) rotate(-3deg)', opacity: 1, offset: 0.65 }, { transform: 'none', opacity: 1 }], { duration: o.duration, delay: i * o.stagger, easing: 'cubic-bezier(.3,1.3,.5,1)', fill: 'backwards' })?.finished.catch(() => undefined);
            })).then(() => undefined);
        },
    },
    {
        name: 'water-drop',
        kind: 'attention',
        description: 'The element dips like a drop hit water and concentric ripples spread out (`rings`, `color`).',
        defaults: { rings: 3, color: 'rgba(14,165,233,.55)', duration: 1200 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            if (getComputedStyle(el).position === 'static') {
                const prev = el.style.position;
                el.style.position = 'relative';
                ctx.onCleanup(() => (el.style.position = prev));
            }
            const runs = [ctx.animate(el, [{ transform: 'none' }, { transform: 'scale(.94, .9) translateY(3px)', offset: 0.2 }, { transform: 'scale(1.03, 1.05)', offset: 0.45 }, { transform: 'none' }], { duration: 700, easing: 'ease-out' })?.finished.catch(() => undefined)];
            const n = Math.max(1, Math.min(5, Number(o.rings) || 3));
            for (let i = 0; i < n; i++) {
                const r = document.createElement('span');
                r.setAttribute('aria-hidden', 'true');
                Object.assign(r.style, { position: 'absolute', left: '50%', top: '50%', width: '100%', aspectRatio: '2 / 1', borderRadius: '50%', border: `2px solid ${o.color}`, translate: '-50% -50%', pointerEvents: 'none' });
                el.appendChild(r);
                const end = () => r.remove();
                ctx.onCleanup(end);
                const a = ctx.animate(r, [{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1.9)', opacity: 0 }], { duration: o.duration, delay: 120 + i * 220, easing: 'ease-out', fill: 'backwards' });
                runs.push(a ? a.finished.then(end, end) : (end(), undefined));
            }
            return Promise.all(runs).then(() => undefined);
        },
    },
    {
        name: 'breathe',
        kind: 'loop',
        description: 'A slow organic morph of shape and scale, like a living blob, until the cleanup runs (`duration`).',
        defaults: { duration: 6000 },
        run: (el, o, ctx) => {
            const prev = el.style.borderRadius;
            const frames = [0, 1, 2, 3, 0].map((i, k) => ({ borderRadius: blobRadius(i + 1), transform: `scale(${k % 2 ? 1.04 : 1}) rotate(${k % 2 ? 4 : -2}deg)`, offset: k / 4 }));
            const a = ctx.animate(el, frames, { duration: o.duration, iterations: Infinity, easing: 'ease-in-out' });
            return () => {
                a?.cancel();
                el.style.borderRadius = prev;
            };
        },
    },
];
/** Register vine-grow, bloom, water-drop and breathe (8.3). */
function registerOrganicPack() {
    registerEffects(ORGANIC_FX);
}

export { ORGANIC_FX, blobRadius, registerOrganicPack };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/components/fx-organic.js.map