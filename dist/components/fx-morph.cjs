'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
var shared = require('../chunks/shared-jkgRH-Hx.cjs');
require('../chunks/base-B3me2y0o.cjs');

const NS = 'http://www.w3.org/2000/svg';
const raf = (f) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(f) : 0);
const caf = (h) => {
    if (h && typeof cancelAnimationFrame === 'function')
        cancelAnimationFrame(h);
};
/** Sample `d` into `n` points (needs SVG geometry support; `null` without it). */
function samplePath(d, n = 64) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    svg.appendChild(p);
    document.body.appendChild(svg);
    try {
        if (typeof p.getTotalLength !== 'function')
            return null;
        const L = p.getTotalLength();
        if (!L)
            return null;
        const out = [];
        for (let i = 0; i < n; i++) {
            const pt = p.getPointAtLength((i / n) * L);
            out.push([pt.x, pt.y]);
        }
        return out;
    }
    catch {
        return null;
    }
    finally {
        svg.remove();
    }
}
/** Points → closed path `d`. */
const pointsToPath = (pts) => (pts.length ? `M${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z` : '');
/** Rotate `b` so its start point is the one closest to `a[0]` (less twisting). */
function align(a, b) {
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < b.length; i++) {
        const d = (b[i][0] - a[0][0]) ** 2 + (b[i][1] - a[0][1]) ** 2;
        if (d < bd) {
            bd = d;
            best = i;
        }
    }
    return b.slice(best).concat(b.slice(0, best));
}
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const MORPH2_FX = [
    {
        name: 'path-morph',
        kind: 'loop',
        description: 'An SVG `<path>` flows between shapes (`paths`: `d` strings; `duration` per shape, `hold` ms). Shapes are resampled, so any two paths morph.',
        defaults: { paths: [], duration: 1200, hold: 600, points: 72 },
        run: (el, o) => {
            const path = (el.localName === 'path' ? el : el.querySelector('path'));
            if (!path)
                return;
            const ds = [path.getAttribute('d') || '', ...(o.paths || [])].filter(Boolean);
            const shapes = ds.map((d) => samplePath(d, o.points)).filter(Boolean);
            if (shapes.length < 2)
                return;
            for (let i = 1; i < shapes.length; i++)
                shapes[i] = align(shapes[i - 1], shapes[i]);
            const orig = path.getAttribute('d');
            let i = 0;
            let t0 = performance.now();
            let h = 0;
            const tick = (now) => {
                const a = shapes[i % shapes.length];
                const b = shapes[(i + 1) % shapes.length];
                const k = Math.min(1, Math.max(0, (now - t0) / o.duration));
                const e = ease(k);
                path.setAttribute('d', pointsToPath(a.map(([x, y], j) => [x + (b[j][0] - x) * e, y + (b[j][1] - y) * e])));
                if (now - t0 > o.duration + o.hold) {
                    i++;
                    t0 = now;
                }
                h = raf(tick);
            };
            h = raf(tick);
            return () => {
                caf(h);
                if (orig !== null)
                    path.setAttribute('d', orig);
            };
        },
    },
    {
        name: 'blob-button',
        kind: 'hover',
        reduced: 'run',
        description: 'A liquid blob behind the element wobbles and bulges toward the pointer (persistent; `color`, `wobble` 0–1, `bulge` px).',
        defaults: { color: '#7c5cff', wobble: 0.5, bulge: 10, points: 10 },
        run: (el, o, ctx) => {
            if (getComputedStyle(el).position === 'static')
                el.style.position = 'relative';
            const prevZ = el.style.isolation;
            el.style.isolation = 'isolate';
            const svg = document.createElementNS(NS, 'svg');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.cssText = 'position:absolute;inset:-14px;width:calc(100% + 28px);height:calc(100% + 28px);z-index:-1;pointer-events:none;overflow:visible';
            const path = document.createElementNS(NS, 'path');
            path.setAttribute('fill', o.color);
            svg.appendChild(path);
            el.prepend(svg);
            const n = Math.max(6, o.points | 0);
            let px = 0.5;
            let py = 0.5;
            let hover = 0;
            let target = 0;
            let h = 0;
            const t0 = performance.now();
            const draw = (now) => {
                const w = el.offsetWidth + 28 || 128;
                const hh = el.offsetHeight + 28 || 72;
                const t = ctx.reduced ? 0 : (now - t0) / 1000;
                hover += (target - hover) * 0.12;
                const pts = [];
                for (let i = 0; i < n; i++) {
                    const a = (i / n) * Math.PI * 2;
                    const cx = Math.cos(a);
                    const cy = Math.sin(a);
                    const toward = Math.max(0, cx * (px - 0.5) * 2 + cy * (py - 0.5) * 2);
                    const r = 1 + (ctx.reduced ? 0 : o.wobble * 0.06 * Math.sin(t * 2.2 + i * 1.7)) + (toward * o.bulge * hover) / Math.min(w, hh);
                    pts.push([w / 2 + cx * (w / 2 - 12) * r, hh / 2 + cy * (hh / 2 - 12) * r]);
                }
                // smooth closed curve through the points (Catmull-Rom → cubic Bézier)
                let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
                for (let i = 0; i < n; i++) {
                    const p0 = pts[(i - 1 + n) % n];
                    const p1 = pts[i];
                    const p2 = pts[(i + 1) % n];
                    const p3 = pts[(i + 2) % n];
                    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
                }
                path.setAttribute('d', d + 'Z');
                h = !ctx.reduced && (target || Math.abs(hover) > 0.01 || o.wobble) ? raf(draw) : 0;
            };
            const kick = () => {
                if (!h)
                    h = raf(draw);
            };
            const move = (e) => {
                const r = el.getBoundingClientRect();
                px = r.width ? (e.clientX - r.left) / r.width : 0.5;
                py = r.height ? (e.clientY - r.top) / r.height : 0.5;
                target = 1;
                kick();
            };
            const leave = () => {
                target = 0;
                kick();
            };
            draw(t0);
            el.addEventListener('pointermove', move);
            el.addEventListener('pointerleave', leave);
            return () => {
                caf(h);
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerleave', leave);
                svg.remove();
                el.style.isolation = prevZ;
            };
        },
    },
    {
        name: 'stroke-draw',
        kind: 'enter',
        description: 'Every stroke of an inline SVG draws itself, staggered, then the fills fade in (`duration`, `stagger`).',
        defaults: { duration: 1200, stagger: 120 },
        run: (el, o, ctx) => {
            const shapes = Array.from(el.querySelectorAll('path, line, polyline, polygon, circle, ellipse, rect'));
            return shared.all(shapes.map((s, i) => {
                let L = 0;
                try {
                    L = typeof s.getTotalLength === 'function' ? s.getTotalLength() : 0;
                }
                catch {
                    L = 0;
                }
                if (ctx.reduced || !L)
                    return ctx.animate(s, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: i * 40, fill: 'backwards' });
                const fill = getComputedStyle(s).fillOpacity || '1';
                return ctx.animate(s, [
                    { strokeDasharray: `${L}`, strokeDashoffset: `${L}`, fillOpacity: 0 },
                    { strokeDasharray: `${L}`, strokeDashoffset: '0', fillOpacity: 0, offset: 0.75 },
                    { strokeDasharray: `${L}`, strokeDashoffset: '0', fillOpacity: fill },
                ], { duration: o.duration, delay: i * o.stagger, easing: 'ease-in-out', fill: 'backwards' });
            }));
        },
    },
    {
        name: 'noise-reveal',
        kind: 'enter',
        description: 'The element condenses out of SVG turbulence — displacement and blur settle to zero (`duration`, `strength`). An SVG-filter transition.',
        defaults: { duration: 1100, strength: 60 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
            const id = `usa-noise-${Math.random().toString(36).slice(2, 8)}`;
            const svg = document.createElementNS(NS, 'svg');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('width', '0');
            svg.setAttribute('height', '0');
            svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
            svg.innerHTML = `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${o.strength}" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="0"/></filter>`;
            document.body.appendChild(svg);
            const disp = svg.querySelector('feDisplacementMap');
            const blur = svg.querySelector('feGaussianBlur');
            const prev = el.style.filter;
            el.style.filter = `url(#${id})`;
            const fade = ctx.animate(el, [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1 }], { duration: o.duration, easing: 'ease-out' });
            const t0 = performance.now();
            return new Promise((done) => {
                const end = () => {
                    el.style.filter = prev;
                    svg.remove();
                    done();
                };
                const tick = (now) => {
                    const k = Math.min(1, (now - t0) / o.duration);
                    const e = 1 - Math.pow(1 - k, 3);
                    disp?.setAttribute('scale', ((1 - e) * o.strength).toFixed(2));
                    blur?.setAttribute('stdDeviation', ((1 - e) * 4).toFixed(2));
                    if (k < 1)
                        raf(tick);
                    else
                        end();
                };
                if (!raf(tick))
                    (fade ? fade.finished.then(end, end) : end());
            });
        },
    },
    {
        name: 'icon-swap',
        kind: 'click',
        description: 'Cycles through the element\'s child icons with a gooey morph — blur, scale and rotate crossfade (`duration`). The visible icon is the only one not `aria-hidden`.',
        defaults: { duration: 420 },
        run: (el, o, ctx) => {
            const icons = Array.from(el.children);
            if (icons.length < 2)
                return null;
            if (!el.dataset.usaSwap) {
                el.dataset.usaSwap = '0';
                el.style.display = el.style.display || 'inline-grid';
                icons.forEach((ic, i) => {
                    ic.style.gridArea = '1 / 1';
                    ic.style.opacity = i ? '0' : '1';
                    ic.setAttribute('aria-hidden', String(i !== 0));
                });
            }
            const cur = Number(el.dataset.usaSwap) || 0;
            const nxt = (cur + 1) % icons.length;
            el.dataset.usaSwap = String(nxt);
            const a = icons[cur];
            const b = icons[nxt];
            a.setAttribute('aria-hidden', 'true');
            b.setAttribute('aria-hidden', 'false');
            a.style.opacity = '0';
            b.style.opacity = '1';
            if (ctx.reduced)
                return shared.all([ctx.animate(a, [{ opacity: 1 }, { opacity: 0 }], { duration: 150 }), ctx.animate(b, [{ opacity: 0 }, { opacity: 1 }], { duration: 150 })]);
            return shared.all([
                ctx.animate(a, [{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(.3) rotate(-90deg)', filter: 'blur(6px)' }], { duration: o.duration, easing: 'cubic-bezier(.5,0,.75,0)' }),
                ctx.animate(b, [{ opacity: 0, transform: 'scale(.3) rotate(90deg)', filter: 'blur(6px)' }, { opacity: 1, transform: 'scale(1.15) rotate(-8deg)', filter: 'blur(0)', offset: 0.7 }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: o.duration * 1.3, easing: 'cubic-bezier(.2,.8,.3,1.2)' }),
            ]);
        },
    },
];
/** Register the 6.6 morph & SVG pack (idempotent). */
function registerMorphPack() {
    registry.registerEffects(MORPH2_FX);
}

exports.MORPH2_FX = MORPH2_FX;
exports.pointsToPath = pointsToPath;
exports.registerMorphPack = registerMorphPack;
exports.samplePath = samplePath;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.9.0/dist/components/fx-morph.cjs.map