'use strict';

var registry = require('../chunks/registry-BVklOepd.cjs');
require('../chunks/base-DoRUZBy-.cjs');

/** Fan-out angles (deg) for `n` floating emoji, centred on straight up (7.4). */
function fanAngles(n, spread = 60) {
    if (n <= 1)
        return [0];
    return Array.from({ length: n }, (_, i) => Math.round(-spread / 2 + (spread * i) / (n - 1)));
}
const span = (cls, text = '') => {
    const s = document.createElement('span');
    s.className = cls;
    s.setAttribute('aria-hidden', 'true');
    s.textContent = text;
    return s;
};
const SOCIAL_FX = [
    {
        name: 'typing-dots',
        kind: 'loop',
        description: 'Three dots bounce in a wave inside the element — the “is typing…” indicator (`color`, `period`).',
        defaults: { color: 'currentColor', period: 1100 },
        run: (el, o, ctx) => {
            const box = span('usa-fx-typing');
            Object.assign(box.style, { display: 'inline-flex', gap: '4px', alignItems: 'center', padding: '2px 0' });
            const dots = [0, 1, 2].map(() => {
                const d = span('');
                Object.assign(d.style, { width: '7px', height: '7px', borderRadius: '50%', background: o.color, opacity: '.6', display: 'inline-block' });
                box.appendChild(d);
                return d;
            });
            el.appendChild(box);
            const anims = ctx.reduced ? [] : dots.map((d, i) => ctx.animate(d, [{ transform: 'translateY(0)', opacity: 0.4 }, { transform: 'translateY(-5px)', opacity: 1, offset: 0.3 }, { transform: 'translateY(0)', opacity: 0.4, offset: 0.6 }, { transform: 'translateY(0)', opacity: 0.4 }], { duration: o.period, delay: (i * o.period) / 6, iterations: Infinity }));
            const stop = () => (anims.forEach((a) => a?.cancel()), box.remove());
            ctx.onCleanup(stop);
            return stop;
        },
    },
    {
        name: 'message-in',
        kind: 'enter',
        description: 'A chat bubble pops in from its side (`side` left | right, or `data-side`) with a small overshoot (`duration`).',
        defaults: { side: '', duration: 420 },
        run: (el, o, ctx) => {
            const side = o.side || el.dataset.side || 'left';
            if (ctx.reduced)
                return ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 })?.finished.catch(() => undefined);
            el.style.transformOrigin = side === 'right' ? '100% 100%' : '0 100%';
            return ctx.animate(el, [{ transform: `translateX(${side === 'right' ? 24 : -24}px) scale(.6)`, opacity: 0 }, { transform: 'scale(1.04)', opacity: 1, offset: 0.65 }, { transform: 'none', opacity: 1 }], { duration: o.duration, easing: 'cubic-bezier(.2,.9,.3,1)' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'reaction-burst',
        kind: 'click',
        description: 'The reaction emoji (`emoji`, default the element text) floats up in a small fan and fades (`count`, `spread`).',
        defaults: { emoji: '', count: 5, spread: 70, duration: 900 },
        reduced: 'skip',
        run: (el, o, ctx) => {
            const r = el.getBoundingClientRect();
            const emo = o.emoji || (el.textContent || '❤️').trim().slice(0, 2) || '❤️';
            const parts = fanAngles(o.count, o.spread).map((deg, i) => {
                const s = span('', emo);
                Object.assign(s.style, { position: 'fixed', left: `${r.left + r.width / 2 - 10}px`, top: `${r.top}px`, fontSize: '20px', pointerEvents: 'none', zIndex: '2147483000' });
                document.body.appendChild(s);
                const rad = (deg * Math.PI) / 180;
                const dist = 50 + (i % 2) * 18;
                const a = ctx.animate(s, [{ transform: 'translate(0,0) scale(.4)', opacity: 0 }, { transform: `translate(${(Math.sin(rad) * dist * 0.5).toFixed(1)}px,${(-dist * 0.5).toFixed(1)}px) scale(1.1)`, opacity: 1, offset: 0.3 }, { transform: `translate(${(Math.sin(rad) * dist).toFixed(1)}px,${(-Math.cos(rad) * dist - 20).toFixed(1)}px) scale(.9)`, opacity: 0 }], { duration: o.duration, delay: i * 40, easing: 'ease-out' });
                const end = () => s.remove();
                if (a)
                    a.finished.then(end, end);
                else
                    end();
                ctx.onCleanup(end);
                return a;
            });
            return Promise.all(parts.map((a) => a?.finished.catch(() => undefined)));
        },
    },
    {
        name: 'read-receipt',
        kind: 'enter',
        description: '✓✓ ticks draw in one after the other and turn `color` (blue) — “seen” (`color`).',
        defaults: { color: '#3b82f6', duration: 600 },
        run: (el, o, ctx) => {
            let t = el.querySelector('.usa-fx-ticks');
            if (!t) {
                t = span('usa-fx-ticks', '✓✓');
                Object.assign(t.style, { display: 'inline-block', marginLeft: '4px', letterSpacing: '-4px', fontWeight: '700' });
                el.appendChild(t);
            }
            if (ctx.reduced)
                return void (t.style.color = o.color);
            return ctx.animate(t, [{ clipPath: 'inset(0 100% 0 0)', color: 'currentColor' }, { clipPath: 'inset(0 0 0 0)', color: 'currentColor', offset: 0.6 }, { clipPath: 'inset(0 0 0 0)', color: o.color }], { duration: o.duration, easing: 'ease-out', fill: 'forwards' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'mention-glow',
        kind: 'attention',
        description: 'A soft highlight sweeps in behind an @mention, then settles (`color`).',
        defaults: { color: 'rgba(250,204,21,.45)', duration: 900 },
        run: (el, o, ctx) => {
            el.style.backgroundImage = `linear-gradient(${o.color},${o.color})`;
            el.style.backgroundRepeat = 'no-repeat';
            el.style.borderRadius = el.style.borderRadius || '4px';
            if (ctx.reduced)
                return void (el.style.backgroundSize = '100% 100%');
            return ctx.animate(el, [{ backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%' }], { duration: o.duration, easing: 'cubic-bezier(.3,.8,.3,1)', fill: 'forwards' })?.finished.catch(() => undefined);
        },
    },
];
/** Register the 7.4 chat & social pack (idempotent). */
function registerSocialPack() {
    registry.registerEffects(SOCIAL_FX);
}

exports.SOCIAL_FX = SOCIAL_FX;
exports.fanAngles = fanAngles;
exports.registerSocialPack = registerSocialPack;
//# sourceMappingURL=fx-social.cjs.map
