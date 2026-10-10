import { registerEffects } from '../chunks/registry-CYojuxi5.js';
import '../chunks/base-zSGb8ujt.js';

/** Length of a polyline through `points` (7.6). */
function routeLength(points) {
    let len = 0;
    for (let i = 1; i < points.length; i++)
        len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    return Math.round(len * 100) / 100;
}
const lengthOf = (p) => {
    try {
        const n = typeof p.getTotalLength === 'function' ? p.getTotalLength() : 0;
        if (n > 0)
            return n;
    }
    catch {
        /* not rendered */
    }
    const pts = (p.getAttribute('points') || '')
        .trim()
        .split(/[\s,]+/)
        .map(Number);
    const xy = [];
    for (let i = 0; i + 1 < pts.length; i += 2)
        xy.push({ x: pts[i], y: pts[i + 1] });
    return routeLength(xy) || 100;
};
const fade = (el, ctx) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 })?.finished.catch(() => undefined);
const GEO_FX = [
    {
        name: 'route-draw',
        kind: 'enter',
        description: 'SVG paths / polylines inside the element (or `[data-route]`) draw themselves along their length, one after another (`duration`, `stagger`).',
        defaults: { duration: 1200, stagger: 250 },
        run: (el, o, ctx) => {
            const marked = Array.from(el.querySelectorAll('[data-route]'));
            const paths = marked.length ? marked : Array.from(el.querySelectorAll('path, polyline'));
            if (ctx.reduced || !paths.length)
                return;
            const runs = paths.map((p, i) => {
                const len = lengthOf(p);
                const prev = { a: p.style.strokeDasharray, o: p.style.strokeDashoffset };
                p.style.strokeDasharray = `${len}`;
                ctx.onCleanup(() => {
                    p.style.strokeDasharray = prev.a;
                    p.style.strokeDashoffset = prev.o;
                });
                return ctx.animate(p, [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }], { duration: o.duration, delay: i * o.stagger, easing: 'ease-in-out', fill: 'backwards' })?.finished.catch(() => undefined);
            });
            return Promise.all(runs).then(() => undefined);
        },
    },
    {
        name: 'marker-pulse',
        kind: 'attention',
        description: 'Rings expand out of the element like a location beacon (`color`, `rings`).',
        defaults: { color: '#ef4444', rings: 2, duration: 1100 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            if (getComputedStyle(el).position === 'static') {
                const prev = el.style.position;
                el.style.position = 'relative';
                ctx.onCleanup(() => (el.style.position = prev));
            }
            const all = Array.from({ length: Math.max(1, Math.min(4, o.rings)) }, (_, i) => {
                const ring = document.createElement('span');
                ring.setAttribute('aria-hidden', 'true');
                Object.assign(ring.style, { position: 'absolute', left: '50%', top: '50%', width: '100%', aspectRatio: '1', borderRadius: '50%', border: `2px solid ${o.color}`, pointerEvents: 'none', translate: '-50% -50%' });
                el.appendChild(ring);
                const a = ctx.animate(ring, [{ transform: 'scale(.4)', opacity: 0.9 }, { transform: 'scale(2.2)', opacity: 0 }], { duration: o.duration, delay: i * (o.duration / 3), easing: 'ease-out', fill: 'backwards' });
                const end = () => ring.remove();
                ctx.onCleanup(end);
                return a ? a.finished.then(end, end) : (end(), undefined);
            });
            return Promise.all(all).then(() => undefined);
        },
    },
    {
        name: 'pin-drop',
        kind: 'enter',
        description: 'The element drops onto its spot with a squash and a landing shadow (`height`).',
        defaults: { height: 80, duration: 700 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            const h = Math.max(10, Number(o.height) || 80);
            ctx.animate(el, [{ filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))' }, { filter: 'drop-shadow(0 6px 4px rgba(0,0,0,.35))', offset: 0.6 }, { filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.2))' }], { duration: o.duration });
            return ctx
                .animate(el, [
                { transform: `translateY(${-h}px)`, opacity: 0, easing: 'cubic-bezier(.5,0,.9,.5)' },
                { transform: 'translateY(0) scale(1.08, .88)', opacity: 1, offset: 0.6 },
                { transform: 'translateY(-8px) scale(.97, 1.04)', offset: 0.8 },
                { transform: 'none', opacity: 1 },
            ], { duration: o.duration, fill: 'backwards' })
                ?.finished.catch(() => undefined);
        },
    },
    {
        name: 'globe-spin',
        kind: 'enter',
        description: 'The element turns in like a globe coming round — rotateY with perspective (`turns`).',
        defaults: { turns: 0.5, duration: 1100 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return fade(el, ctx);
            const deg = Math.round(360 * (Number(o.turns) || 0.5));
            return ctx
                .animate(el, [{ transform: `perspective(600px) rotateY(${-deg}deg) scale(.8)`, opacity: 0 }, { transform: 'perspective(600px) rotateY(0) scale(1)', opacity: 1 }], { duration: o.duration, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })
                ?.finished.catch(() => undefined);
        },
    },
];
/** Register route-draw, marker-pulse, pin-drop and globe-spin (7.6). */
function registerGeoPack() {
    registerEffects(GEO_FX);
}

export { GEO_FX, registerGeoPack, routeLength };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/components/fx-geo.js.map