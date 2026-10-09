import { registerEffects } from '../chunks/registry-CnO7ZVPK.js';
import '../chunks/base-CLuqlLfG.js';

/** Evenly spread spark directions with a little jitter (8.1). */
function sparkVectors(n, radius, seed = 1) {
    let s = seed;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.3;
        const r = radius * (0.7 + rnd() * 0.3);
        return { x: Math.round(Math.cos(a) * r), y: Math.round(Math.sin(a) * r) };
    });
}
const layer = (el, ctx) => {
    if (getComputedStyle(el).position === 'static') {
        const prev = el.style.position;
        el.style.position = 'relative';
        ctx.onCleanup(() => (el.style.position = prev));
    }
    const l = document.createElement('span');
    l.setAttribute('aria-hidden', 'true');
    Object.assign(l.style, { position: 'absolute', inset: '0', pointerEvents: 'none', overflow: 'visible' });
    el.appendChild(l);
    ctx.onCleanup(() => l.remove());
    return l;
};
const dot = (parent, css, text = '') => {
    const d = document.createElement('span');
    d.textContent = text;
    Object.assign(d.style, { position: 'absolute', left: '50%', top: '50%', ...css });
    parent.appendChild(d);
    return d;
};
const FESTIVAL_FX = [
    {
        name: 'firework-burst',
        kind: 'attention',
        description: 'Rockets of sparks burst out of the element in festive colours (`bursts`, `colors`).',
        defaults: { bursts: 3, colors: '#f43f5e,#f59e0b,#22d3ee,#a855f7,#facc15', duration: 900 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const l = layer(el, ctx);
            const colors = String(o.colors).split(',');
            const r = el.getBoundingClientRect();
            const runs = [];
            const n = Math.max(1, Math.min(6, Number(o.bursts) || 3));
            for (let b = 0; b < n; b++) {
                const cx = (b - (n - 1) / 2) * Math.min(60, (r.width || 120) / n);
                const cy = -((r.height || 60) * 0.25) - (b % 2) * 18;
                const col = colors[b % colors.length];
                sparkVectors(14, 46 + b * 6, b + 3).forEach((v) => {
                    const s = dot(l, { width: '5px', height: '5px', marginLeft: '-2.5px', marginTop: '-2.5px', borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}` });
                    const a = ctx.animate(s, [{ transform: `translate(${cx}px,${cy + 40}px) scale(.4)`, opacity: 0 }, { transform: `translate(${cx}px,${cy}px) scale(1)`, opacity: 1, offset: 0.25 }, { transform: `translate(${cx + v.x}px,${cy + v.y + 18}px) scale(.3)`, opacity: 0 }], { duration: o.duration, delay: b * 220, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' });
                    runs.push(a ? a.finished.then(() => s.remove(), () => s.remove()) : Promise.resolve(s.remove()));
                });
            }
            return Promise.all(runs).then(() => l.remove());
        },
    },
    {
        name: 'lantern-rise',
        kind: 'enter',
        description: 'The element floats up and sways in like a Lunar New Year lantern (`sway` degrees).',
        defaults: { sway: 8, duration: 1400 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 })?.finished.catch(() => undefined);
            const w = Number(o.sway) || 8;
            return ctx
                .animate(el, [{ transform: `translateY(60px) rotate(${-w}deg)`, opacity: 0, transformOrigin: '50% 0' }, { transform: `translateY(-6px) rotate(${w * 0.6}deg)`, opacity: 1, offset: 0.55, transformOrigin: '50% 0' }, { transform: `translateY(0) rotate(${-w * 0.3}deg)`, offset: 0.8, transformOrigin: '50% 0' }, { transform: 'none', opacity: 1, transformOrigin: '50% 0' }], { duration: o.duration, easing: 'ease-out', fill: 'backwards' })
                ?.finished.catch(() => undefined);
        },
    },
    {
        name: 'xmas-snow',
        kind: 'loop',
        description: 'Snowflakes drift down over the element until the cleanup runs (`flakes`).',
        defaults: { flakes: 18, duration: 4000 },
        run: (el, o, ctx) => {
            const l = layer(el, ctx);
            l.style.overflow = 'hidden';
            const n = Math.max(4, Math.min(60, Number(o.flakes) || 18));
            const anims = Array.from({ length: n }, (_, i) => {
                const x = (i * 37) % 100;
                const size = 8 + ((i * 7) % 9);
                const f = dot(l, { left: `${x}%`, top: '-14px', fontSize: `${size}px`, color: '#fff', textShadow: '0 0 3px rgba(148,163,184,.9)', lineHeight: '1' }, '❄');
                const drift = ((i % 5) - 2) * 12;
                return ctx.animate(f, [{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${drift}px, calc(${el.clientHeight || 160}px + 20px)) rotate(180deg)` }], { duration: o.duration * (0.7 + ((i * 13) % 6) / 10), delay: -((i * 331) % o.duration), iterations: Infinity, easing: 'linear' });
            });
            return () => {
                anims.forEach((a) => a?.cancel());
                l.remove();
            };
        },
    },
    {
        name: 'spooky-float',
        kind: 'attention',
        description: 'The element wobbles, rises and flickers like a Halloween ghost (`cycles`).',
        defaults: { cycles: 2, duration: 1200 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            return ctx
                .animate(el, [{ transform: 'none', opacity: 1 }, { transform: 'translate(-4px,-10px) rotate(-4deg) skewX(3deg)', opacity: 0.55, offset: 0.3 }, { transform: 'translate(4px,-14px) rotate(4deg) skewX(-3deg)', opacity: 0.85, offset: 0.65 }, { transform: 'none', opacity: 1 }], { duration: o.duration, iterations: Math.max(1, Math.min(6, Number(o.cycles) || 2)), easing: 'ease-in-out' })
                ?.finished.catch(() => undefined);
        },
    },
];
/** Register firework-burst, lantern-rise, xmas-snow and spooky-float (8.1). */
function registerFestivalPack() {
    registerEffects(FESTIVAL_FX);
}

export { FESTIVAL_FX, registerFestivalPack, sparkVectors };
//# sourceMappingURL=fx-festival.js.map
