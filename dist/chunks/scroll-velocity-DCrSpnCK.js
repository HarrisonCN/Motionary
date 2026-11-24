import { f as defineElement, o as onFrame } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { o as ownChildren } from './kit-Dmjuhvd8.js';
import { c as css } from './motion-surfaces-D35JWuaW.js';

/** Map a scroll speed (px per frame at 60 fps) to the effect amount, softly capped at ±1. */
function velocityAmount(pxPerFrame, strength = 1) {
    const v = (pxPerFrame / 40) * strength;
    return Math.tanh(v);
}
function defineScrollVelocity(tag = 'usa-scroll-velocity') {
    const ctor = defineElement(tag, Base => class ScrollVelocity extends Base {
        constructor() {
            super(...arguments);
            this._amount = 0;
        }
        static get observedAttributes() { return ['mode', 'strength', 'max']; }
        get amount() { return this._amount; }
        mount() {
            const kids = ownChildren(this);
            const root = make('div', 'usa-kit usa-vel');
            const modes = ['skew', 'stretch', 'blur', 'tilt'];
            const mode = (modes.includes(this.str('mode')) ? this.str('mode') : 'skew');
            root.dataset.mode = mode;
            root.append(...kids);
            this.append(root);
            const strength = Math.min(3, Math.max(0.1, this.num('strength', 1)));
            const max = Math.min(30, Math.max(1, this.num('max', 10)));
            let lastY = window.scrollY, value = 0, stop = null;
            const paint = (a) => {
                this._amount = a;
                root.style.setProperty('--vel', a.toFixed(4));
                root.style.setProperty('--vel-abs', Math.abs(a).toFixed(4));
                root.style.setProperty('--vel-max', `${max}deg`);
            };
            const start = () => {
                if (stop || this.reduced)
                    return;
                lastY = window.scrollY;
                stop = onFrame((_t, dt) => {
                    const y = window.scrollY;
                    const perFrame = ((y - lastY) / Math.max(1, dt)) * 16.7;
                    lastY = y;
                    const target = velocityAmount(perFrame, strength);
                    // chase the target quickly, decay slowly, so a flick reads as a lean that settles
                    const k = Math.abs(target) > Math.abs(value) ? 0.35 : 0.08;
                    value += (target - value) * k;
                    if (Math.abs(value) < 0.0005 && target === 0) {
                        halt();
                        return;
                    }
                    paint(value);
                }, this);
            };
            // the loop runs only while the page is scrolling and the element is on screen
            let visible = false;
            const halt = () => { stop?.(); stop = null; value = 0; paint(0); };
            this.inView((v) => { visible = v; if (!v)
                halt(); });
            this.listen(window, 'scroll', () => { if (visible)
                start(); }, { passive: true });
            this.onCleanup(() => {
                halt();
                this.append(...kids);
                root.remove();
            });
            paint(0);
        }
    }, { id: 'motion-surfaces', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineScrollVelocity as d, velocityAmount as v };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/scroll-velocity-DCrSpnCK.js.map