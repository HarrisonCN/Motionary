import { registerEffects } from '../chunks/registry-CYojuxi5.js';
import '../chunks/base-zSGb8ujt.js';

const NS = 'http://www.w3.org/2000/svg';
function overlay(el, z = 1) {
    if (getComputedStyle(el).position === 'static')
        el.style.position = 'relative';
    const o = document.createElement('span');
    o.setAttribute('aria-hidden', 'true');
    o.setAttribute('data-usa-fx-layer', '');
    o.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:${z};border-radius:inherit`;
    el.appendChild(o);
    return o;
}
function ring(el, pad, color, width, dash = '') {
    const o = overlay(el, 2);
    o.style.inset = `-${pad}px`;
    const r = el.getBoundingClientRect();
    const w = Math.max(1, r.width + pad * 2);
    const h = Math.max(1, r.height + pad * 2);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.style.overflow = 'visible';
    const rect = document.createElementNS(NS, 'rect');
    const rad = Math.min(16, h / 2);
    for (const [k, v] of Object.entries({ x: width / 2, y: width / 2, width: w - width, height: h - width, rx: rad, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round' }))
        rect.setAttribute(k, String(v));
    if (dash)
        rect.setAttribute('stroke-dasharray', dash);
    svg.appendChild(rect);
    o.appendChild(svg);
    return { o, rect, len: 2 * (w + h) };
}
const after = (a, fn) => (a ? a.finished.then(fn, fn) : fn());
const FOCUS_FX = [
    {
        name: 'focus-draw',
        kind: 'attention',
        description: 'A rounded ring draws itself around the element, then fades (`color`, `width`, `pad`, `duration`).',
        defaults: { color: '#7c5cff', width: 2.5, pad: 4, duration: 700 },
        run: (el, o, ctx) => {
            const { o: layer, rect, len } = ring(el, o.pad, o.color, o.width);
            const done = () => layer.remove();
            if (ctx.reduced) {
                const a = ctx.animate(layer, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 });
                after(a, done);
                return a;
            }
            rect.setAttribute('stroke-dasharray', String(len));
            const a = ctx.animate(rect, [{ strokeDashoffset: len }, { strokeDashoffset: 0, offset: 0.6 }, { strokeDashoffset: 0 }], { duration: o.duration, easing: 'cubic-bezier(.6,.05,.3,1)' });
            const f = ctx.animate(layer, [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: o.duration + 500 });
            after(f, done);
            return a;
        },
    },
    {
        name: 'marching-ants',
        kind: 'loop',
        description: 'A dashed selection border that marches around the element (`color`, `width`, `pad`, `speed`).',
        defaults: { color: '#7c5cff', width: 2, pad: 3, speed: 1 },
        reduced: 'run',
        run: (el, o, ctx) => {
            const { o: layer, rect } = ring(el, o.pad, o.color, o.width, '7 5');
            if (!ctx.reduced)
                ctx.animate(rect, [{ strokeDashoffset: 0 }, { strokeDashoffset: -24 }], { duration: 700 / Math.max(0.1, o.speed), iterations: Infinity });
            const stop = () => layer.remove();
            ctx.onCleanup(stop);
            return stop;
        },
    },
    {
        name: 'success-check',
        kind: 'click',
        description: 'A check mark draws over the element on a soft green disc, then fades away (`color`, `duration`).',
        defaults: { color: '#22c55e', duration: 1100 },
        run: (el, o, ctx) => {
            const layer = overlay(el, 3);
            layer.style.display = 'grid';
            layer.style.placeItems = 'center';
            layer.innerHTML = `<svg viewBox="0 0 52 52" width="52" height="52"><circle cx="26" cy="26" r="24" fill="${o.color}" opacity=".18"/><path d="M15 27l7 7 15-16" fill="none" stroke="${o.color}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="36" stroke-dashoffset="36"/></svg>`;
            const svg = layer.firstElementChild;
            const path = layer.querySelector('path');
            const done = () => layer.remove();
            if (ctx.reduced) {
                path.setAttribute('stroke-dashoffset', '0');
                const a = ctx.animate(layer, [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: o.duration });
                after(a, done);
                return a;
            }
            ctx.animate(svg, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.35 }, { transform: 'scale(1)', opacity: 1 }], { duration: 420, easing: 'ease-out' });
            ctx.animate(path, [{ strokeDashoffset: 36 }, { strokeDashoffset: 36, offset: 0.25 }, { strokeDashoffset: 0 }], { duration: 600, easing: 'ease-out', fill: 'forwards' });
            const f = ctx.animate(layer, [{ opacity: 1 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: o.duration });
            after(f, done);
            return f;
        },
    },
    {
        name: 'highlight-sweep',
        kind: 'attention',
        description: "A highlighter stroke sweeps behind the element's text and stays (`color`, `duration`, `keep`).",
        defaults: { color: 'rgba(250,204,21,.55)', duration: 700, keep: true },
        run: (el, o, ctx) => {
            const layer = overlay(el, -1);
            el.style.isolation = 'isolate';
            layer.style.cssText += `;inset:15% -4px 5% -4px;background:${o.color};border-radius:4px;transform-origin:0 50%`;
            const a = ctx.reduced ? ctx.animate(layer, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }) : ctx.animate(layer, [{ transform: 'scaleX(0) skewX(-12deg)' }, { transform: 'scaleX(1) skewX(-6deg)' }], { duration: o.duration, easing: 'cubic-bezier(.6,.05,.3,1)', fill: 'forwards' });
            if (!o.keep)
                after(a, () => layer.remove());
            ctx.onCleanup(() => layer.remove());
            return a;
        },
    },
];
/** Register the 6.9 focus & feedback pack (idempotent). */
function registerFocusPack() {
    registerEffects(FOCUS_FX);
}

export { FOCUS_FX, registerFocusPack };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.6.0/dist/components/fx-focus.js.map