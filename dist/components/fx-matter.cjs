'use strict';

var registry = require('../chunks/registry-_XKU28ZC.cjs');
var base = require('../chunks/base-DzZEJhQB.cjs');
var engine = require('../chunks/engine-D89D-YmJ.cjs');

/** Finite, non-intercepting overlays. Cleanup preserves the target's nodes, focus and inline positioning. */
function study(name, kind, description) {
    return { name, kind: 'attention', description, reduced: 'skip', defaults: { duration: 1600, color: '#dce8f9', accent: '#74aaff', opacity: .65 },
        run(el, options, context) {
            if (context.reduced || !el.isConnected)
                return;
            const canvas = document.createElement('canvas');
            canvas.setAttribute('aria-hidden', 'true');
            canvas.dataset.matterEffect = name;
            Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '1', opacity: String(engine.finite(options.opacity, .65, 0, 1)) });
            const was = el.style.position, positionChanged = getComputedStyle(el).position === 'static';
            if (positionChanged)
                el.style.position = 'relative';
            el.append(canvas);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                canvas.remove();
                if (positionChanged && el.style.position === 'relative')
                    el.style.position = was;
                return;
            }
            const engine$1 = engine.createMatterEngine(kind, { ...options, text: String(options.text || el.textContent || 'flow').slice(0, 32) });
            let id = 0, last = 0, elapsed = 0, visible = true, done = false, finish = () => undefined;
            const duration = engine.finite(options.duration, 1600, 200, 10000), offs = [];
            const promise = new Promise(resolve => { finish = resolve; });
            const stop = () => { if (id)
                base.caf(id); id = 0; last = 0; };
            const cleanup = () => { if (done)
                return; done = true; stop(); offs.splice(0).forEach(fn => fn()); canvas.remove(); if (positionChanged && el.style.position === 'relative')
                el.style.position = was; finish(); };
            const draw = (dt) => {
                const r = el.getBoundingClientRect(), w = Math.max(1, r.width || 320), h = Math.max(1, r.height || 200), dpr = engine.finite(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 1, 1, 2);
                if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
                    canvas.width = Math.round(w * dpr);
                    canvas.height = Math.round(h * dpr);
                }
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                engine$1.draw(ctx, w, h, elapsed / 1000, dt, { x: .5 + Math.sin(elapsed / 500) * .12, y: .5, pressed: elapsed < duration / 2, active: kind === 'mesh' || kind === 'magnetic' });
            };
            const frame = (now) => {
                id = 0;
                if (done)
                    return;
                if (!el.isConnected || base.prefersReducedMotion() || base.getMotionSensitivity() !== 'full') {
                    cleanup();
                    return;
                }
                if (document.hidden || !visible) {
                    stop();
                    return;
                }
                const delta = last ? Math.max(0, now - last) : 0, dt = Math.min(.04, delta / 1000);
                last = now;
                elapsed += delta;
                if (elapsed >= duration) {
                    cleanup();
                    return;
                }
                draw(dt);
                id = base.raf(frame, el);
            };
            const wake = () => { if (!el.isConnected || base.prefersReducedMotion() || base.getMotionSensitivity() !== 'full')
                cleanup();
            else if (document.hidden || !visible)
                stop();
            else if (!done && !id)
                id = base.raf(frame, el); };
            document.addEventListener('visibilitychange', wake);
            offs.push(() => document.removeEventListener('visibilitychange', wake));
            if (typeof matchMedia === 'function') {
                const mq = matchMedia('(prefers-reduced-motion: reduce)');
                mq.addEventListener('change', wake);
                offs.push(() => mq.removeEventListener('change', wake));
            }
            if (typeof IntersectionObserver !== 'undefined') {
                const io = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); wake(); });
                io.observe(el);
                offs.push(() => io.disconnect());
            }
            const mo = new MutationObserver(wake);
            mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-usa-sensitivity'], childList: true, subtree: true });
            offs.push(() => mo.disconnect());
            context.onCleanup(cleanup);
            draw(0);
            wake();
            return promise;
        },
    };
}
const MATTER_FX = [
    /*#__PURE__*/ study('dust-vortex', 'gravity', 'A seeded halftone dust vortex that clears itself after playback.'),
    /*#__PURE__*/ study('mercury-morph', 'metal', 'A liquid-metal metaball overlay with a moving stippled highlight.'),
    /*#__PURE__*/ study('chemical-bloom', 'reaction', 'A finite Gray–Scott reaction-diffusion bloom.'),
    /*#__PURE__*/ study('magnetic-align', 'magnetic', 'Fine magnetic filings align around a moving dipole.'),
    /*#__PURE__*/ study('elastic-ripple', 'mesh', 'A spring mesh deforms and settles over the target.'),
    /*#__PURE__*/ study('liquid-level', 'fluid', 'Halftone liquid rises within a supplied word, with a tilting surface.'),
];
/** Register the six Matter effects (17.6); individual entries register only their own name. */
function registerMatterPack() { registry.registerEffects(MATTER_FX); }

exports.MATTER_FX = MATTER_FX;
exports.registerMatterPack = registerMatterPack;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/components/fx-matter.cjs.map