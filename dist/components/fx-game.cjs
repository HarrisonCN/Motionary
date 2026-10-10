'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
require('../chunks/base-B3me2y0o.cjs');

/** Ballistic keyframe points for a coin thrown at `deg` with `power` (7.5). */
function throwPath(deg, power = 120, steps = 6, g = 2.2) {
    const r = (deg * Math.PI) / 180;
    const vx = Math.sin(r) * power;
    const vy = -Math.cos(r) * power;
    return Array.from({ length: steps + 1 }, (_, i) => {
        const t = i / steps;
        return { x: Math.round(vx * t), y: Math.round(vy * t + g * power * t * t * 0.5) };
    });
}
const floater = (el, text, css) => {
    const r = el.getBoundingClientRect();
    const s = document.createElement('span');
    s.setAttribute('aria-hidden', 'true');
    s.textContent = text;
    Object.assign(s.style, { position: 'fixed', left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px`, pointerEvents: 'none', zIndex: '2147483000', translate: '-50% -50%' }, css);
    document.body.appendChild(s);
    return s;
};
const fin = (a, el, ctx) => {
    const end = () => el.remove();
    if (a)
        a.finished.then(end, end);
    else
        end();
    ctx.onCleanup(end);
    return a?.finished.catch(() => undefined);
};
const GAME_FX = [
    {
        name: 'achievement-unlock',
        kind: 'attention',
        description: 'The element slides in, a light sweep crosses it and its icon (`[data-icon]` or first child) pops (`duration`).',
        defaults: { duration: 900 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 })?.finished.catch(() => undefined);
            const icon = (el.querySelector('[data-icon]') || el.firstElementChild);
            const a = ctx.animate(el, [{ transform: 'translateY(30px) scale(.9)', opacity: 0 }, { transform: 'translateY(-4px) scale(1.02)', opacity: 1, offset: 0.5 }, { transform: 'none', opacity: 1 }], { duration: o.duration * 0.6, easing: 'cubic-bezier(.2,.9,.3,1)' });
            if (icon)
                ctx.animate(icon, [{ transform: 'scale(0) rotate(-30deg)' }, { transform: 'scale(1.4) rotate(10deg)', offset: 0.6 }, { transform: 'none' }], { duration: o.duration * 0.6, delay: o.duration * 0.3, easing: 'ease-out', fill: 'backwards' });
            const pos = getComputedStyle(el).position;
            if (pos === 'static')
                el.style.position = 'relative';
            const sh = document.createElement('span');
            sh.setAttribute('aria-hidden', 'true');
            Object.assign(sh.style, { position: 'absolute', inset: '0', borderRadius: 'inherit', pointerEvents: 'none', background: 'linear-gradient(110deg,transparent 35%,rgba(255,255,255,.7) 50%,transparent 65%)', backgroundSize: '250% 100%' });
            el.appendChild(sh);
            fin(ctx.animate(sh, [{ backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0' }], { duration: o.duration * 0.6, delay: o.duration * 0.4, easing: 'ease-in-out', fill: 'backwards' }), sh, ctx);
            return a?.finished.catch(() => undefined);
        },
    },
    {
        name: 'level-up',
        kind: 'attention',
        description: 'A scale-up with a ring shockwave in `color` (`color`, `duration`).',
        defaults: { color: '#facc15', duration: 800 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return ctx.animate(el, [{ opacity: 0.5 }, { opacity: 1 }], { duration: 250 })?.finished.catch(() => undefined);
            const r = el.getBoundingClientRect();
            const ring = floater(el, '', { width: `${Math.max(r.width, r.height)}px`, height: `${Math.max(r.width, r.height)}px`, borderRadius: '50%', border: `3px solid ${o.color}` });
            fin(ctx.animate(ring, [{ transform: 'scale(.4)', opacity: 1 }, { transform: 'scale(1.8)', opacity: 0 }], { duration: o.duration, easing: 'ease-out' }), ring, ctx);
            return ctx.animate(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: 0.3 }, { transform: 'scale(.95)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: o.duration, easing: 'ease-out' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'chest-open',
        kind: 'click',
        description: 'The lid (`[data-lid]` or first child) flips open and sparks (`spark`) fly out (`count`).',
        defaults: { spark: '✨', count: 6, duration: 700 },
        run: (el, o, ctx) => {
            const lid = (el.querySelector('[data-lid]') || el.firstElementChild);
            el.setAttribute('data-open', '');
            if (lid)
                lid.style.transformOrigin = '50% 100%';
            if (ctx.reduced)
                return void (lid && (lid.style.transform = 'rotateX(110deg)'));
            if (lid)
                ctx.animate(lid, [{ transform: 'rotateX(0)' }, { transform: 'rotateX(125deg)', offset: 0.6 }, { transform: 'rotateX(110deg)' }], { duration: o.duration, easing: 'cubic-bezier(.3,1.5,.6,1)', fill: 'forwards' });
            const parts = Array.from({ length: o.count }, (_, i) => {
                const s = floater(el, o.spark, { fontSize: '18px' });
                const deg = -60 + (120 * i) / Math.max(1, o.count - 1);
                const p = throwPath(deg, 90, 6, 1.2);
                return fin(ctx.animate(s, p.map((q, k) => ({ transform: `translate(${q.x}px,${q.y}px) scale(${(1 - k / 12).toFixed(2)})`, opacity: k === p.length - 1 ? 0 : 1 })), { duration: o.duration, delay: 150 + i * 30, easing: 'linear' }), s, ctx);
            });
            return Promise.all(parts);
        },
    },
    {
        name: 'coin-burst',
        kind: 'click',
        description: 'Coins (`coin`) arc up out of the element and fall away (`count`, `power`).',
        defaults: { coin: '🪙', count: 8, power: 140, duration: 900 },
        reduced: 'skip',
        run: (el, o, ctx) => Promise.all(Array.from({ length: o.count }, (_, i) => {
            const s = floater(el, o.coin, { fontSize: '20px' });
            const p = throwPath(-50 + (100 * i) / Math.max(1, o.count - 1) + (Math.random() * 10 - 5), o.power * (0.8 + Math.random() * 0.4));
            return fin(ctx.animate(s, p.map((q, k) => ({ transform: `translate(${q.x}px,${q.y}px) rotate(${k * 60}deg)`, opacity: k === p.length - 1 ? 0 : 1 })), { duration: o.duration, delay: i * 25, easing: 'linear' }), s, ctx);
        })),
    },
    {
        name: 'xp-gain',
        kind: 'enter',
        description: 'A “+50 XP” label (`text`, or `data-xp`) floats up from the element and fades (`color`).',
        defaults: { text: '', color: '#7c5cff', duration: 1100 },
        reduced: 'skip',
        run: (el, o, ctx) => {
            const s = floater(el, o.text || `+${el.dataset.xp || 10} XP`, { font: '800 16px/1 system-ui,sans-serif', color: o.color, textShadow: '0 1px 0 #fff' });
            return fin(ctx.animate(s, [{ transform: 'translateY(0) scale(.6)', opacity: 0 }, { transform: 'translateY(-18px) scale(1.15)', opacity: 1, offset: 0.25 }, { transform: 'translateY(-50px) scale(1)', opacity: 0 }], { duration: o.duration, easing: 'ease-out' }), s, ctx);
        },
    },
];
/** Register the 7.5 gamification pack (idempotent). */
function registerGamePack() {
    registry.registerEffects(GAME_FX);
}

exports.GAME_FX = GAME_FX;
exports.registerGamePack = registerGamePack;
exports.throwPath = throwPath;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.5.0/dist/components/fx-game.cjs.map