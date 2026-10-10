import { registerEffects } from '../chunks/registry-PxXkPc1Q.js';
import '../chunks/base-nzeN_ux7.js';

/** Decaying sideways shake keyframes (7.7). */
function shakeFrames(distance = 8, steps = 5) {
    const f = [{ transform: 'none' }];
    for (let i = 0; i < steps; i++) {
        const d = Math.round(distance * (1 - i / steps) * 10) / 10;
        f.push({ transform: `translateX(${i % 2 ? d : -d}px)` });
    }
    f.push({ transform: 'none' });
    return f;
}
const fade = (el, ctx) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 })?.finished.catch(() => undefined);
const ring = (el, color, ctx, duration) => ctx.animate(el, [{ boxShadow: `0 0 0 0 ${color}` }, { boxShadow: `0 0 0 4px ${color}`, offset: 0.3 }, { boxShadow: '0 0 0 0 transparent' }], { duration })?.finished.catch(() => undefined);
const FORM_FX = [
    {
        name: 'field-shake',
        kind: 'attention',
        description: 'Shakes the element sideways with a red outline flash — the "invalid" cue (`distance`, `color`).',
        defaults: { distance: 8, color: 'rgba(225,29,72,.55)', duration: 450 },
        run: (el, o, ctx) => {
            const r = ring(el, o.color, ctx, o.duration + 200);
            if (ctx.reduced)
                return r;
            return ctx.animate(el, shakeFrames(Number(o.distance) || 8), { duration: o.duration, easing: 'ease-out' })?.finished.catch(() => undefined);
        },
    },
    {
        name: 'field-success',
        kind: 'attention',
        description: 'A green glow pulses round the element and a check badge pops on its corner (`color`).',
        defaults: { color: 'rgba(22,163,74,.5)', duration: 900 },
        run: (el, o, ctx) => {
            const r = ring(el, o.color, ctx, o.duration);
            if (ctx.reduced)
                return r;
            if (getComputedStyle(el).position === 'static') {
                const prev = el.style.position;
                el.style.position = 'relative';
                ctx.onCleanup(() => (el.style.position = prev));
            }
            const b = document.createElement('span');
            b.setAttribute('aria-hidden', 'true');
            b.textContent = '✓';
            Object.assign(b.style, { position: 'absolute', right: '-6px', top: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#16a34a', color: '#fff', font: '700 12px/18px system-ui,sans-serif', textAlign: 'center', pointerEvents: 'none' });
            el.appendChild(b);
            const end = () => b.remove();
            ctx.onCleanup(end);
            const a = ctx.animate(b, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.25)', opacity: 1, offset: 0.25 }, { transform: 'scale(1)', opacity: 1, offset: 0.4 }, { transform: 'scale(1)', opacity: 1, offset: 0.85 }, { transform: 'scale(.6)', opacity: 0 }], { duration: o.duration + 500, easing: 'ease-out' });
            return a ? a.finished.then(end, end) : (end(), undefined);
        },
    },
    {
        name: 'label-float',
        kind: 'enter',
        description: 'Every `label` (or `[data-label]`) inside rises and settles one after another, like floating labels (`stagger`).',
        defaults: { stagger: 80, duration: 450 },
        run: (el, o, ctx) => {
            const marked = Array.from(el.querySelectorAll('[data-label]'));
            const labels = marked.length ? marked : Array.from(el.querySelectorAll('label'));
            const items = labels.length ? labels : [el];
            return Promise.all(items.map((l, i) => ctx.reduced
                ? fade(l, ctx)
                : ctx.animate(l, [{ transform: 'translateY(14px) scale(1.12)', opacity: 0, transformOrigin: '0 50%' }, { transform: 'translateY(-3px) scale(.96)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: o.duration, delay: i * o.stagger, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })?.finished.catch(() => undefined))).then(() => undefined);
        },
    },
    {
        name: 'form-cascade',
        kind: 'enter',
        description: "The element's children (fields, buttons) slide in one after another (`stagger`, `distance`).",
        defaults: { stagger: 70, distance: 18, duration: 500 },
        run: (el, o, ctx) => {
            const kids = Array.from(el.children);
            const items = kids.length ? kids : [el];
            return Promise.all(items.map((k, i) => ctx.reduced
                ? fade(k, ctx)
                : ctx.animate(k, [{ transform: `translateY(${Number(o.distance) || 18}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: o.duration, delay: i * o.stagger, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })?.finished.catch(() => undefined))).then(() => undefined);
        },
    },
];
/** Register field-shake, field-success, label-float and form-cascade (7.7). */
function registerFormPack() {
    registerEffects(FORM_FX);
}

export { FORM_FX, registerFormPack, shakeFrames };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/components/fx-form.js.map