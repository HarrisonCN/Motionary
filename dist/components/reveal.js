import { u as defineElement, D as EASE_OUT, l as caf, r as raf, k as clamp } from '../chunks/base-BnRyfuyM.js';

/** Entrance effects shared by `<usa-reveal>` and `<usa-stagger>` (transform / opacity / filter only). */
const REVEAL_EFFECTS = [
    'fade',
    'fade-up',
    'fade-down',
    'fade-left',
    'fade-right',
    'zoom-in',
    'zoom-out',
    'blur',
    'blur-up',
    'flip-up',
    'flip-left',
    'rise',
];
/** The "from" keyframe of an effect; the "to" keyframe is the element's natural state. */
function revealFrom(effect, distance = 32) {
    const d = `${distance}px`;
    switch (effect) {
        case 'fade':
            return { opacity: 0 };
        case 'fade-down':
            return { opacity: 0, transform: `translate3d(0,-${d},0)` };
        case 'fade-left':
            return { opacity: 0, transform: `translate3d(-${d},0,0)` };
        case 'fade-right':
            return { opacity: 0, transform: `translate3d(${d},0,0)` };
        case 'zoom-in':
            return { opacity: 0, transform: 'scale(0.86)' };
        case 'zoom-out':
            return { opacity: 0, transform: 'scale(1.14)' };
        case 'blur':
            return { opacity: 0, filter: 'blur(12px)' };
        case 'blur-up':
            return { opacity: 0, filter: 'blur(10px)', transform: `translate3d(0,${d},0)` };
        case 'flip-up':
            return { opacity: 0, transform: 'perspective(800px) rotateX(-55deg)', transformOrigin: '50% 100%' };
        case 'flip-left':
            return { opacity: 0, transform: 'perspective(800px) rotateY(55deg)', transformOrigin: '0% 50%' };
        case 'rise':
            return { opacity: 0, transform: `translate3d(0,${distance * 1.5}px,0) scale(0.96)` };
        case 'fade-up':
        default:
            return { opacity: 0, transform: `translate3d(0,${d},0)` };
    }
}
/** Keyframes from the effect to the natural state. */
function revealKeyframes(effect, distance) {
    // Any preset registered with the scroll library (core, `presets/extended`, your own)
    const p = REVEAL_EFFECTS.includes(effect) ? null : globalThis[Symbol.for('use-scroll-animate.presets')]?.[effect];
    if (p)
        return [p.from, ...(p.frames || []), p.to];
    const from = revealFrom(effect, distance);
    const to = {};
    for (const k of Object.keys(from)) {
        if (k === 'opacity')
            to.opacity = 1;
        else if (k === 'transform')
            to.transform = 'none';
        else if (k === 'filter')
            to.filter = 'none';
        else if (k === 'transformOrigin')
            to.transformOrigin = from.transformOrigin;
    }
    return [from, to];
}

var css$2 = "usa-reveal,usa-stagger{display:block}usa-reveal[data-state=\"hidden\"],usa-stagger[data-state=\"hidden\"]>*{opacity:0}@media (prefers-reduced-motion:reduce){usa-reveal[data-state=\"hidden\"],usa-stagger[data-state=\"hidden\"]>*{opacity:1}}";

function defineReveal(tag = 'usa-reveal') {
    return defineElement(tag, (Base) => class UsaReveal extends Base {
        constructor() {
            super(...arguments);
            this._anim = null;
        }
        static get observedAttributes() {
            return ['effect', 'distance', 'repeat', 'threshold', 'root-margin'];
        }
        get effect() {
            return this.str('effect', 'fade-up');
        }
        set effect(v) {
            this.setAttribute('effect', v);
        }
        get revealed() {
            return this.getAttribute('data-state') !== 'hidden';
        }
        mount() {
            if (this.reduced) {
                this.setAttribute('data-state', 'shown');
                return;
            }
            if (this.getAttribute('data-state') !== 'shown')
                this.setAttribute('data-state', 'hidden');
            this.inView((visible) => {
                if (visible) {
                    this.emit('enter');
                    if (!this.revealed)
                        this.reveal();
                }
                else {
                    this.emit('leave');
                    if (this.flag('repeat') && this.revealed)
                        this.reset();
                }
            }, { threshold: this.num('threshold', 0.15), rootMargin: this.str('root-margin', '0px') });
        }
        unmount() {
            this._anim?.cancel();
            this._anim = null;
        }
        reveal() {
            this._anim?.cancel();
            this.setAttribute('data-state', 'shown');
            if (this.reduced)
                return Promise.resolve();
            const a = this.motion(this, revealKeyframes(this.effect, this.num('distance', 32)), {
                duration: this.num('duration', 700),
                delay: this.num('delay', 0),
                easing: this.str('easing', EASE_OUT),
                fill: 'backwards',
            });
            this._anim = a;
            return new Promise((resolve) => {
                const done = () => {
                    if (this._anim === a)
                        this._anim = null;
                    this.emit('complete');
                    resolve();
                };
                if (!a)
                    done();
                else
                    a.onfinish = done;
            });
        }
        reset() {
            this._anim?.cancel();
            this._anim = null;
            if (!this.reduced)
                this.setAttribute('data-state', 'hidden');
        }
    }, { id: 'reveal', text: css$2 });
}

function defineStagger(tag = 'usa-stagger') {
    return defineElement(tag, (Base) => class UsaStagger extends Base {
        constructor() {
            super(...arguments);
            this._anims = [];
        }
        static get observedAttributes() {
            return ['effect', 'repeat', 'threshold'];
        }
        mount() {
            if (this.reduced) {
                this.setAttribute('data-state', 'shown');
                return;
            }
            if (this.getAttribute('data-state') !== 'shown')
                this.setAttribute('data-state', 'hidden');
            this.inView((visible) => {
                if (visible && this.getAttribute('data-state') === 'hidden') {
                    this.emit('enter');
                    this.reveal();
                }
                else if (!visible && this.flag('repeat'))
                    this.reset();
            }, { threshold: this.num('threshold', 0.1) });
        }
        unmount() {
            this.cancel();
        }
        cancel() {
            this._anims.splice(0).forEach((a) => a.cancel());
        }
        reveal() {
            this.cancel();
            this.setAttribute('data-state', 'shown');
            const kids = Array.from(this.children);
            if (this.reduced || !kids.length)
                return Promise.resolve();
            const frames = revealKeyframes(this.str('effect', 'fade-up'), this.num('distance', 24));
            const interval = this.num('interval', 70);
            const base = this.num('delay', 0);
            const duration = this.num('duration', 600);
            const easing = this.str('easing', EASE_OUT);
            const anims = kids
                .map((kid, i) => this.motion(kid, frames, { duration, easing, delay: base + i * interval, fill: 'backwards' }))
                .filter((a) => !!a);
            this._anims = anims;
            const last = anims[anims.length - 1];
            return new Promise((resolve) => {
                const done = () => {
                    this.emit('complete');
                    resolve();
                };
                if (!last)
                    done();
                else
                    last.onfinish = done;
            });
        }
        reset() {
            this.cancel();
            if (!this.reduced)
                this.setAttribute('data-state', 'hidden');
        }
    }, { id: 'reveal', text: css$2 });
}

var css$1 = "usa-scroll-progress{display:block;position:fixed;left:0;right:0;top:0;z-index:1000;height:var(--usa-progress-height,3px);background:var(--usa-progress-track,transparent);pointer-events:none;contain:strict}usa-scroll-progress[position=\"bottom\"]{top:auto;bottom:0}usa-scroll-progress[position=\"inline\"]{position:relative;z-index:auto;border-radius:999px;overflow:hidden}usa-scroll-progress .usa-progress-fill{display:block;height:100%;transform:scaleX(0);transform-origin:0 50%;background:var(--usa-progress-color,linear-gradient(90deg,#7c5cff,#22d3ee));will-change:transform}";

/** Progress (0–1) of `target` scrolling through the viewport, or of the page. */
function readScrollProgress(target) {
    if (typeof window === 'undefined')
        return 0;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (target) {
        const r = target.getBoundingClientRect();
        const total = r.height - vh;
        return total <= 0 ? (r.top <= 0 ? 1 : 0) : clamp(-r.top / total, 0, 1);
    }
    const doc = document.documentElement;
    const max = doc.scrollHeight - vh;
    return max <= 0 ? 0 : clamp((window.scrollY || doc.scrollTop) / max, 0, 1);
}
function defineScrollProgress(tag = 'usa-scroll-progress') {
    return defineElement(tag, (Base) => class UsaScrollProgress extends Base {
        constructor() {
            super(...arguments);
            this._bar = null;
            this._p = -1;
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['target', 'label'];
        }
        get progress() {
            return Math.max(0, this._p);
        }
        mount() {
            if (!this._bar) {
                this._bar = document.createElement('span');
                this._bar.className = 'usa-progress-fill';
                this.replaceChildren(this._bar);
            }
            this.setAttribute('role', 'progressbar');
            this.setAttribute('aria-valuemin', '0');
            this.setAttribute('aria-valuemax', '100');
            if (!this.hasAttribute('aria-label'))
                this.setAttribute('aria-label', this.str('label', 'Reading progress'));
            const schedule = () => {
                if (!this._frame)
                    this._frame = raf(() => ((this._frame = 0), this.update()));
            };
            this.listen(window, 'scroll', schedule, { passive: true });
            this.listen(window, 'resize', schedule, { passive: true });
            this.update();
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
        update() {
            const sel = this.getAttribute('target');
            const target = sel ? document.querySelector(sel) : null;
            const p = readScrollProgress(target);
            if (Math.abs(p - this._p) < 0.0005)
                return;
            this._p = p;
            if (this._bar)
                this._bar.style.transform = `scaleX(${p})`;
            this.style.setProperty('--usa-progress', String(p));
            const pct = String(Math.round(p * 100));
            if (this.getAttribute('aria-valuenow') !== pct)
                this.setAttribute('aria-valuenow', pct);
            this.emit('progress', { progress: p });
        }
    }, { id: 'scroll-progress', text: css$1 });
}

var css = "usa-scrolly{display:block;position:relative}usa-scrolly [data-sticky]{position:sticky;top:var(--usa-sticky-top,0px)}usa-scrolly [data-step]{opacity:var(--usa-step-dim,0.35);transition:opacity 0.4s ease}usa-scrolly [data-step][data-active]{opacity:1}@media (prefers-reduced-motion:reduce){usa-scrolly [data-step]{transition:none}}";

function defineScrolly(tag = 'usa-scrolly') {
    return defineElement(tag, (Base) => class UsaScrolly extends Base {
        constructor() {
            super(...arguments);
            this._active = -1;
        }
        static get observedAttributes() {
            return ['offset'];
        }
        get active() {
            return this._active;
        }
        get steps() {
            return Array.from(this.querySelectorAll('[data-step]'));
        }
        mount() {
            const steps = this.steps;
            if (!steps.length)
                return;
            const offset = clamp(this.num('offset', 0.5), 0, 1);
            // A thin trigger band `offset` down the viewport
            const top = Math.min(99, Math.round(offset * 100));
            const rootMargin = `-${top}% 0px -${Math.max(0, 99 - top)}% 0px`;
            if (typeof IntersectionObserver === 'undefined') {
                this.activate(0);
                return;
            }
            const io = new IntersectionObserver((entries) => {
                for (const e of entries)
                    if (e.isIntersecting)
                        this.activate(steps.indexOf(e.target));
            }, { rootMargin });
            steps.forEach((s) => io.observe(s));
            this.onCleanup(() => io.disconnect());
            if (this._active < 0)
                this.activate(0, true);
        }
        activate(index, silent = false) {
            const steps = this.steps;
            if (index < 0 || index >= steps.length || index === this._active)
                return;
            this._active = index;
            steps.forEach((s, i) => s.toggleAttribute('data-active', i === index));
            const step = steps[index];
            this.setAttribute('active', String(index));
            this.style.setProperty('--usa-step', String(index));
            this.setAttribute('data-step-name', step.dataset.step || String(index));
            if (!silent)
                this.emit('step', { index, step, name: step.dataset.step || '' });
        }
    }, { id: 'scrolly', text: css });
}

/**
 * motionary/components/reveal — entrance & scroll reveal components.
 * `<usa-reveal>`, `<usa-stagger>`, `<usa-scroll-progress>`, `<usa-scrolly>`.
 */
/** Register every component of this category under its default tag. */
function defineRevealComponents() {
    defineReveal();
    defineStagger();
    defineScrollProgress();
    defineScrolly();
}

export { REVEAL_EFFECTS, defineReveal, defineRevealComponents, defineScrollProgress, defineScrolly, defineStagger, readScrollProgress, revealKeyframes };
//# sourceMappingURL=reveal.js.map
