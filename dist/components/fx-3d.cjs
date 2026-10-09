'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
var shared = require('../chunks/shared-jkgRH-Hx.cjs');
var components_fxLight = require('./fx-light.cjs');
require('../chunks/base-B3me2y0o.cjs');
require('../chunks/generative-BHIj-NU0.cjs');

const layers = (el) => {
    const marked = Array.from(el.querySelectorAll('[data-depth]'));
    return marked.length ? marked : Array.from(el.children);
};
const raf = (f) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(f) : 0);
const caf = (h) => {
    if (h && typeof cancelAnimationFrame === 'function')
        cancelAnimationFrame(h);
};
const DEPTH3_FX = [
    {
        name: 'depth-stack',
        kind: 'card',
        reduced: 'run',
        description: 'The children (or `[data-depth]` layers) separate in Z and parallax as the card tilts toward the pointer (persistent; `tilt` deg, `depth` px between layers).',
        defaults: { tilt: 14, depth: 28 },
        run: (el, o, ctx) => {
            const prev = [el.style.transform, el.style.transformStyle, el.style.transition];
            el.style.transformStyle = 'preserve-3d';
            el.style.transition = 'transform .25s ease-out';
            const ls = layers(el);
            const saved = ls.map((l) => [l.style.transform, l.style.transition]);
            ls.forEach((l) => (l.style.transition = 'transform .3s ease-out'));
            const stop = components_fxLight.trackPointer(el, ctx, (x, y, inside) => {
                const rx = (0.5 - y) * 2 * o.tilt;
                const ry = (x - 0.5) * 2 * o.tilt;
                el.style.transform = ctx.reduced ? '' : inside ? `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)` : 'perspective(800px) rotateX(6deg) rotateY(-8deg)';
                ls.forEach((l, i) => {
                    const d = ctx.reduced ? 0 : Number(l.dataset.depth || i + 1) * o.depth * (inside ? 1 : 0.5);
                    l.style.transform = `translateZ(${d.toFixed(1)}px)`;
                });
            }, 0.5, 0.5);
            return () => {
                stop();
                [el.style.transform, el.style.transformStyle, el.style.transition] = prev;
                ls.forEach((l, i) => ([l.style.transform, l.style.transition] = saved[i]));
            };
        },
    },
    {
        name: 'product-spin',
        kind: 'card',
        description: 'A 360° product viewer: drag to turn the element in 3D with inertia; idles with a slow turntable spin (persistent; `idle` deg/s, `friction`, `tilt`).',
        defaults: { idle: 18, friction: 0.94, tilt: -8 },
        run: (el, o, ctx) => {
            const prev = [el.style.transform, el.style.touchAction, el.style.cursor];
            el.style.touchAction = 'pan-y';
            el.style.cursor = 'grab';
            let a = 0;
            let v = 0;
            let drag = false;
            let lx = 0;
            let h = 0;
            let last = performance.now();
            const paint = () => (el.style.transform = `perspective(900px) rotateX(${o.tilt}deg) rotateY(${a.toFixed(2)}deg)`);
            paint();
            const tick = (now) => {
                const dt = Math.min(64, now - last) / 1000;
                last = now;
                if (!drag) {
                    v *= o.friction;
                    a += v * dt + (Math.abs(v) < 4 ? o.idle * dt : 0);
                }
                paint();
                h = raf(tick);
            };
            h = raf(tick);
            const down = (e) => {
                drag = true;
                lx = e.clientX;
                v = 0;
                el.style.cursor = 'grabbing';
                el.setPointerCapture?.(e.pointerId);
            };
            const move = (e) => {
                if (!drag)
                    return;
                const dx = e.clientX - lx;
                lx = e.clientX;
                a += dx * 0.6;
                v = dx * 36;
            };
            const up = () => {
                drag = false;
                el.style.cursor = 'grab';
            };
            el.addEventListener('pointerdown', down);
            el.addEventListener('pointermove', move);
            el.addEventListener('pointerup', up);
            el.addEventListener('pointercancel', up);
            return () => {
                caf(h);
                el.removeEventListener('pointerdown', down);
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerup', up);
                el.removeEventListener('pointercancel', up);
                [el.style.transform, el.style.touchAction, el.style.cursor] = prev;
            };
        },
    },
    {
        name: 'card-flip-3d',
        kind: 'click',
        description: 'A thick card flips to its back face (second child) and back, showing its edge (`duration`, `axis` y | x). The faces swap `aria-hidden`.',
        defaults: { duration: 800, axis: 'y', thickness: 6 },
        run: (el, o, ctx) => {
            const [front, back] = Array.from(el.children);
            if (!front || !back)
                return null;
            const R = o.axis === 'x' ? 'rotateX' : 'rotateY';
            if (!el.dataset.usaFlip) {
                el.dataset.usaFlip = 'front';
                el.style.display = 'grid';
                el.style.transformStyle = 'preserve-3d';
                for (const f of [front, back]) {
                    f.style.gridArea = '1 / 1';
                    f.style.backfaceVisibility = 'hidden';
                }
                back.setAttribute('aria-hidden', 'true');
                back.style.transform = `${R}(180deg)`;
            }
            const toBack = el.dataset.usaFlip === 'front';
            el.dataset.usaFlip = toBack ? 'back' : 'front';
            front.setAttribute('aria-hidden', String(toBack));
            back.setAttribute('aria-hidden', String(!toBack));
            const from = toBack ? 0 : 180;
            const to = toBack ? 180 : 0;
            el.style.transform = `perspective(1000px) ${R}(${to}deg)`;
            if (ctx.reduced)
                return ctx.animate(toBack ? back : front, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
            return ctx.animate(el, [
                { transform: `perspective(1000px) ${R}(${from}deg) scale(1)` },
                { transform: `perspective(1000px) ${R}(${(from + to) / 2}deg) scale(1.08) translateZ(${o.thickness * 4}px)`, offset: 0.5 },
                { transform: `perspective(1000px) ${R}(${to}deg) scale(1)` },
            ], { duration: o.duration, easing: 'cubic-bezier(.45,.05,.25,1)' });
        },
    },
    {
        name: 'origami',
        kind: 'enter',
        description: 'The element unfolds panel by panel like folded paper (`panels`, `duration` per fold). Uses clipped copies during the fold.',
        defaults: { panels: 4, duration: 420 },
        reduced: 'skip',
        run: (el, o, ctx) => {
            if (el.dataset.usaOrigami)
                return null;
            el.dataset.usaOrigami = '1';
            const n = Math.max(2, Math.min(8, Math.round(o.panels)));
            if (getComputedStyle(el).position === 'static')
                el.style.position = 'relative';
            const prevVis = el.style.visibility;
            const wrap = document.createElement('div');
            wrap.setAttribute('aria-hidden', 'true');
            wrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;perspective:900px;visibility:visible';
            const anims = [];
            for (let i = 0; i < n; i++) {
                const slice = el.cloneNode(true);
                slice.removeAttribute('id');
                slice.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id'));
                const top = (i / n) * 100;
                const bottom = 100 - ((i + 1) / n) * 100;
                slice.style.cssText += `;position:absolute;inset:0;margin:0;width:100%;height:100%;box-sizing:border-box;clip-path:inset(${top}% 0 ${bottom}% 0);transform-origin:50% ${top}%;visibility:visible`;
                wrap.appendChild(slice);
                const dir = i % 2 ? 1 : -1;
                anims.push(ctx.animate(slice, [
                    { transform: `rotateX(${dir * 92}deg)`, filter: 'brightness(.55)', opacity: 0 },
                    { opacity: 1, offset: 0.15 },
                    { transform: 'rotateX(0)', filter: 'brightness(1)', opacity: 1 },
                ], { duration: o.duration, delay: i * o.duration * 0.55, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'backwards' }));
            }
            el.style.visibility = 'hidden';
            el.appendChild(wrap);
            const done = () => {
                wrap.remove();
                el.style.visibility = prevVis;
                delete el.dataset.usaOrigami;
            };
            return shared.all(anims).then(done, done);
        },
    },
    {
        name: 'orbit-camera',
        kind: 'scroll',
        description: 'While the element scrolls through the viewport the camera orbits its 3D children (persistent; `range` deg of orbit, `tilt`, `depth` px between layers).',
        defaults: { range: 70, tilt: 10, depth: 60 },
        run: (el, o, ctx) => {
            const prev = [el.style.transform, el.style.transformStyle];
            const ls = layers(el);
            el.style.transformStyle = 'preserve-3d';
            if (!ctx.reduced)
                ls.forEach((l, i) => (l.style.transform = `translateZ(${((i - (ls.length - 1) / 2) * o.depth).toFixed(0)}px)`));
            let h = 0;
            const paint = () => {
                h = 0;
                const r = el.getBoundingClientRect();
                const vh = window.innerHeight || 800;
                const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
                el.style.setProperty('--usa-orbit', p.toFixed(3));
                if (!ctx.reduced)
                    el.style.transform = `perspective(1000px) rotateX(${o.tilt}deg) rotateY(${((p - 0.5) * o.range).toFixed(2)}deg)`;
            };
            paint();
            const on = () => {
                if (!h)
                    h = raf(paint);
            };
            if (!ctx.reduced) {
                window.addEventListener('scroll', on, { passive: true });
                window.addEventListener('resize', on);
            }
            return () => {
                caf(h);
                window.removeEventListener('scroll', on);
                window.removeEventListener('resize', on);
                [el.style.transform, el.style.transformStyle] = prev;
                ls.forEach((l) => (l.style.transform = ''));
            };
        },
    },
];
/** Register the 6.5 3D pack (idempotent). */
function register3dPack() {
    registry.registerEffects(DEPTH3_FX);
}

exports.DEPTH3_FX = DEPTH3_FX;
exports.register3dPack = register3dPack;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/components/fx-3d.cjs.map