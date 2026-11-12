import { registerEffects } from '../chunks/registry-DmYdTtl4.js';
import { p as prefersReducedMotion, g as getMotionSensitivity } from '../chunks/base-SPDwWyB1.js';

const positions = /*#__PURE__*/ new WeakMap();
function feedback(name, path, color) {
    return { name, kind: 'attention', reduced: 'skip', description: `Finite SVG ${name} feedback that preserves the target content and focus.`, defaults: { duration: 650, color },
        run(el, options, context) {
            if (context.reduced || !el.isConnected || ['INPUT', 'SELECT', 'TEXTAREA', 'IMG'].includes(el.tagName))
                return;
            const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), stroke = document.createElementNS(ns, 'path');
            svg.setAttribute('viewBox', '0 0 200 100');
            svg.setAttribute('preserveAspectRatio', 'none');
            svg.setAttribute('aria-hidden', 'true');
            svg.dataset.formFeedback = name;
            Object.assign(svg.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: '2' });
            stroke.setAttribute('d', path);
            stroke.setAttribute('fill', 'none');
            const requested = String(options.color || color);
            stroke.setAttribute('stroke', typeof CSS !== 'undefined' && CSS.supports('color', requested) ? requested : color);
            stroke.setAttribute('stroke-width', '1.6');
            stroke.setAttribute('stroke-linecap', 'round');
            stroke.setAttribute('vector-effect', 'non-scaling-stroke');
            stroke.setAttribute('pathLength', '100');
            stroke.style.strokeDasharray = '100';
            svg.append(stroke);
            let held = positions.get(el);
            if (!held && getComputedStyle(el).position === 'static') {
                held = { count: 0, previous: el.style.position };
                positions.set(el, held);
                el.style.position = 'relative';
            }
            if (held)
                held.count++;
            el.append(svg);
            let done = false, finish = () => undefined;
            const animations = [], offs = [];
            const promise = new Promise(resolve => { finish = resolve; });
            const cleanup = () => { if (done)
                return; done = true; animations.forEach(a => a.cancel()); offs.forEach(off => off()); svg.remove(); if (held && --held.count === 0) {
                if (el.style.position === 'relative')
                    el.style.position = held.previous;
                positions.delete(el);
            } finish(); };
            context.onCleanup(cleanup);
            const duration = Math.max(200, Math.min(5000, Number(options.duration) || 650));
            const a = context.animate(stroke, [{ strokeDashoffset: 100, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, offset: .7 }, { strokeDashoffset: -15, opacity: 0 }], { duration });
            if (a) {
                animations.push(a);
                a.finished.then(cleanup, cleanup);
            }
            else
                cleanup();
            const calm = () => { if (prefersReducedMotion() || getMotionSensitivity() !== 'full' || !el.isConnected || document.hidden)
                cleanup(); };
            if (typeof matchMedia === 'function') {
                const mq = matchMedia('(prefers-reduced-motion: reduce)');
                mq.addEventListener('change', calm);
                offs.push(() => mq.removeEventListener('change', calm));
            }
            const observer = new MutationObserver(calm);
            observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-usa-sensitivity'] });
            offs.push(() => observer.disconnect());
            document.addEventListener('visibilitychange', calm);
            offs.push(() => document.removeEventListener('visibilitychange', calm));
            if (done)
                offs.splice(0).forEach(off => off());
            return promise;
        },
    };
}
const DRAW_FX = [
    /*#__PURE__*/ feedback('check-orbit', 'M75 50a25 35 0 1 1 50 0a25 35 0 1 1-50 0M86 49l10 14 20-28', '#a9e6cb'),
    /*#__PURE__*/ feedback('error-underline', 'M8 90Q18 80 28 90T48 90T68 90T88 90T108 90T128 90T148 90T168 90T192 90', '#ffb7a8'),
    /*#__PURE__*/ feedback('focus-brackets', 'M28 8H8V30M172 8h20V30M192 70v22H172M28 92H8V70', '#b4d4ff'),
    /*#__PURE__*/ feedback('submit-trail', 'M8 75C50 75 60 25 110 25S150 60 190 20M177 20H190V33', '#c7bbff'),
];
function registerDrawPack() { registerEffects(DRAW_FX); }

export { DRAW_FX, registerDrawPack };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/components/fx-draw.js.map