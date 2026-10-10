'use strict';

var registry = require('../chunks/registry-LE5iyTqw.cjs');
require('../chunks/base-BG_mxssu.cjs');

/** Scale factor of a two-finger pinch from start points (a1, a2) to current points (b1, b2) (8.7). */
function pinchScale(a1, a2, b1, b2) {
    const d0 = Math.hypot(a2.x - a1.x, a2.y - a1.y);
    const d1 = Math.hypot(b2.x - b1.x, b2.y - b1.y);
    return d0 > 0 ? d1 / d0 : 1;
}
/** Rotation in degrees of a two-finger twist from (a1, a2) to (b1, b2) (8.7). */
function pinchAngle(a1, a2, b1, b2) {
    const r = Math.atan2(b2.y - b1.y, b2.x - b1.x) - Math.atan2(a2.y - a1.y, a2.x - a1.x);
    let d = (r * 180) / Math.PI;
    while (d > 180)
        d -= 360;
    while (d < -180)
        d += 360;
    return Math.round(d * 10) / 10;
}
/** Device orientation (beta front/back, gamma left/right, in degrees) → card tilt { rx, ry } clamped to ±max (8.7). */
function orientationToTilt(beta, gamma, max = 15, rest = 40) {
    const c = (v) => Math.max(-max, Math.min(max, v));
    return { rx: Math.round(c(-(beta - rest) / 2) * 10) / 10 + 0, ry: Math.round(c(gamma / 2) * 10) / 10 + 0 }; // + 0: no -0
}
const finger = (host, ctx) => {
    if (getComputedStyle(host).position === 'static') {
        const prev = host.style.position;
        host.style.position = 'relative';
        ctx.onCleanup(() => (host.style.position = prev));
    }
    const f = document.createElement('span');
    f.setAttribute('aria-hidden', 'true');
    Object.assign(f.style, { position: 'absolute', left: '50%', top: '50%', width: '26px', height: '26px', margin: '-13px 0 0 -13px', borderRadius: '50%', background: 'rgba(255,255,255,.75)', boxShadow: '0 0 0 2px rgba(15,23,42,.35), 0 4px 10px rgba(15,23,42,.3)', pointerEvents: 'none', zIndex: '2' });
    host.appendChild(f);
    ctx.onCleanup(() => f.remove());
    return f;
};
const GESTURE3_FX = [
    {
        name: 'swipe-hint',
        kind: 'attention',
        description: 'A ghost fingertip swipes across the element and the element nudges along, teaching "swipe me" (`direction`).',
        defaults: { direction: 'left', duration: 1200 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const s = o.direction === 'right' ? 1 : -1;
            const f = finger(el, ctx);
            const a = ctx.animate(f, [{ transform: `translateX(${-s * 30}px) scale(.6)`, opacity: 0 }, { transform: `translateX(${-s * 30}px) scale(1)`, opacity: 1, offset: 0.2 }, { transform: `translateX(${s * 40}px) scale(1)`, opacity: 1, offset: 0.7 }, { transform: `translateX(${s * 50}px) scale(.6)`, opacity: 0 }], { duration: o.duration, easing: 'ease-in-out' });
            const b = ctx.animate(el, [{ transform: 'none' }, { transform: 'none', offset: 0.2 }, { transform: `translateX(${s * 18}px)`, offset: 0.65 }, { transform: 'none' }], { duration: o.duration, easing: 'ease-in-out' });
            const end = () => f.remove();
            return Promise.all([a?.finished.catch(() => undefined), b?.finished.catch(() => undefined)]).then(end, end);
        },
    },
    {
        name: 'pinch-hint',
        kind: 'attention',
        description: 'Two ghost fingertips pinch out and the element zooms with them, teaching "pinch to zoom".',
        defaults: { duration: 1300 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const f1 = finger(el, ctx);
            const f2 = finger(el, ctx);
            const k = (dx, dy) => [{ transform: 'translate(0,0) scale(.6)', opacity: 0 }, { transform: `translate(${dx * 0.3}px,${dy * 0.3}px)`, opacity: 1, offset: 0.2 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 1, offset: 0.7 }, { transform: `translate(${dx}px,${dy}px) scale(.6)`, opacity: 0 }];
            const runs = [ctx.animate(f1, k(-26, -18), { duration: o.duration, easing: 'ease-in-out' }), ctx.animate(f2, k(26, 18), { duration: o.duration, easing: 'ease-in-out' }), ctx.animate(el, [{ transform: 'none' }, { transform: 'none', offset: 0.2 }, { transform: 'scale(1.12)', offset: 0.7 }, { transform: 'none' }], { duration: o.duration, easing: 'ease-in-out' })];
            const end = () => (f1.remove(), f2.remove());
            return Promise.all(runs.map((r) => r?.finished.catch(() => undefined))).then(end, end);
        },
    },
    {
        name: 'tilt-wobble',
        kind: 'attention',
        description: 'A 3D wobble as if the phone was tilted.',
        defaults: { duration: 900 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            return ctx.animate(el, [{ transform: 'perspective(600px)' }, { transform: 'perspective(600px) rotateY(14deg) rotateX(-6deg)', offset: 0.25 }, { transform: 'perspective(600px) rotateY(-10deg) rotateX(5deg)', offset: 0.55 }, { transform: 'perspective(600px) rotateY(4deg)', offset: 0.8 }, { transform: 'perspective(600px)' }], { duration: o.duration, easing: 'ease-in-out' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'depth-in',
        kind: 'enter',
        description: 'Children fly in from different depths (`data-depth`, default their order), like parallax layers settling (`stagger`).',
        defaults: { duration: 800, stagger: 90 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const kids = Array.from(el.children);
            const list = kids.length ? kids : [el];
            return Promise.all(list.map((c, i) => {
                const d = Number(c.dataset?.depth) || i + 1;
                return ctx.animate(c, [{ transform: `perspective(700px) translateZ(${ -120 * d}px) translateY(${10 * d}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: o.duration, delay: i * (Number(o.stagger) || 0), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })?.finished.catch(() => undefined);
            })).then(() => undefined);
        },
    },
];
/** Register swipe-hint, pinch-hint, tilt-wobble and depth-in (8.7). */
function registerGesture3Pack() {
    registry.registerEffects(GESTURE3_FX);
}

exports.GESTURE3_FX = GESTURE3_FX;
exports.orientationToTilt = orientationToTilt;
exports.pinchAngle = pinchAngle;
exports.pinchScale = pinchScale;
exports.registerGesture3Pack = registerGesture3Pack;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.2/dist/components/fx-gesture.cjs.map