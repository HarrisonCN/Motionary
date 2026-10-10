import { registerEffects } from '../chunks/registry-CYojuxi5.js';
import '../chunks/base-zSGb8ujt.js';

const PALETTES = {
    sunset: ['#ff6b6b', '#feca57', '#ff9ff3', '#5f27cd', '#1dd1a1'],
    ocean: ['#0abde3', '#48dbfb', '#c8d6e5', '#10ac84', '#222f3e'],
    forest: ['#2d6a4f', '#52b788', '#95d5b2', '#d8f3dc', '#081c15'],
    candy: ['#f72585', '#b5179e', '#7209b7', '#4361ee', '#4cc9f0'],
    mono: ['#111827', '#374151', '#6b7280', '#d1d5db', '#f9fafb'],
};
/** Deterministic PRNG in [0, 1) (mulberry32) (9.3). */
function seededRandom(seed) {
    let a = (Math.floor(Math.abs(seed) * 1e3) >>> 0) || 1;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
/** A seeded mesh-gradient CSS background (4 radial blobs over a base colour) (9.3). */
function meshGradient(seed = 1, palette = 'sunset') {
    const pal = Array.isArray(palette) ? palette : PALETTES[palette] || PALETTES.sunset;
    const r = seededRandom(seed);
    const blobs = [0, 1, 2, 3].map((i) => `radial-gradient(at ${Math.round(r() * 100)}% ${Math.round(r() * 100)}%, ${pal[(i + 1) % pal.length]} 0px, transparent ${45 + Math.round(r() * 20)}%)`);
    return `${blobs.join(', ')}, ${pal[0]}`;
}
const overlay = (el, ctx) => {
    if (getComputedStyle(el).position === 'static') {
        const prev = el.style.position;
        el.style.position = 'relative';
        ctx.onCleanup(() => (el.style.position = prev));
    }
    const o = document.createElement('span');
    o.setAttribute('aria-hidden', 'true');
    Object.assign(o.style, { position: 'absolute', inset: '0', pointerEvents: 'none', borderRadius: 'inherit', overflow: 'hidden' });
    el.appendChild(o);
    ctx.onCleanup(() => o.remove());
    return o;
};
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";
const GENART_FX = [
    {
        name: 'halftone-in',
        kind: 'enter',
        description: 'The element prints in through a growing halftone dot screen (`dot` px).',
        defaults: { dot: 10, duration: 1100 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 })?.finished.catch(() => undefined);
            const d = Math.max(4, Math.min(40, Number(o.dot) || 10));
            const m = (r) => `radial-gradient(circle, #000 ${r}px, transparent ${r + 0.5}px) 0 0 / ${d}px ${d}px`;
            const prev = [el.style.maskImage, el.style.webkitMaskImage];
            ctx.onCleanup(() => {
                el.style.maskImage = prev[0];
                el.style.webkitMaskImage = prev[1];
            });
            const a = ctx.animate(el, [0, 0.15, 0.3, 0.45, 0.6, 0.75].map((f, i, all) => ({ mask: m(f * d), WebkitMask: m(f * d), offset: i / all.length })).concat([{ mask: m(d), WebkitMask: m(d), offset: 1 }]), { duration: o.duration, delay: o.delay, easing: 'steps(6, end)', fill: 'backwards' });
            return a?.finished.catch(() => undefined);
        },
    },
    {
        name: 'mesh-drift',
        kind: 'loop',
        description: 'A seeded mesh-gradient background that slowly drifts (`seed`, `palette`).',
        defaults: { seed: 3, palette: 'sunset', duration: 14000 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const ov = overlay(el, ctx);
            ov.style.zIndex = '-1';
            ov.style.background = meshGradient(Number(o.seed) || 3, o.palette);
            ov.style.backgroundSize = '200% 200%';
            if (getComputedStyle(el).isolation !== 'isolate') {
                const prev = el.style.isolation;
                el.style.isolation = 'isolate';
                ctx.onCleanup(() => (el.style.isolation = prev));
            }
            const a = ctx.animate(ov, [{ backgroundPosition: '0% 0%', filter: 'hue-rotate(0deg)' }, { backgroundPosition: '100% 60%', filter: 'hue-rotate(25deg)' }, { backgroundPosition: '0% 0%', filter: 'hue-rotate(0deg)' }], { duration: o.duration, iterations: Infinity, easing: 'ease-in-out' });
            return () => {
                a?.cancel();
                ov.remove();
            };
        },
    },
    {
        name: 'kaleido',
        kind: 'loop',
        description: 'A kaleidoscopic conic overlay that turns slowly (`color`, `segments`).',
        defaults: { color: 'rgba(255,255,255,.35)', segments: 12, duration: 12000 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const ov = overlay(el, ctx);
            const n = Math.max(4, Math.min(36, Math.round(Number(o.segments) || 12)));
            const inner = document.createElement('i');
            Object.assign(inner.style, { position: 'absolute', left: '-50%', top: '-50%', width: '200%', height: '200%', background: `repeating-conic-gradient(${o.color} 0 ${180 / n}deg, transparent ${180 / n}deg ${360 / n}deg)`, mixBlendMode: 'overlay' });
            ov.appendChild(inner);
            const a = ctx.animate(inner, [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: o.duration, iterations: Infinity, easing: 'linear' });
            return () => {
                a?.cancel();
                ov.remove();
            };
        },
    },
    {
        name: 'grain-flicker',
        kind: 'loop',
        description: 'Animated film grain over the element (`opacity`).',
        defaults: { opacity: 0.25 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const ov = overlay(el, ctx);
            Object.assign(ov.style, { backgroundImage: GRAIN, opacity: String(o.opacity), mixBlendMode: 'overlay' });
            const a = ctx.animate(ov, [0, 1, 2, 3, 4, 5].map((i) => ({ backgroundPosition: `${(i * 37) % 160}px ${(i * 71) % 160}px` })), { duration: 600, iterations: Infinity, easing: 'steps(6, end)' });
            return () => {
                a?.cancel();
                ov.remove();
            };
        },
    },
];
/** Register halftone-in, mesh-drift, kaleido and grain-flicker (9.3). */
function registerGenArtPack() {
    registerEffects(GENART_FX);
}

export { GENART_FX, PALETTES, meshGradient, registerGenArtPack, seededRandom };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/components/fx-genart.js.map