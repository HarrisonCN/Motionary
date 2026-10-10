import { f as defineElement, D as EASE_OUT, r as raf, b as caf, d as clamp, E as EASE_SPRING } from '../chunks/base-zSGb8ujt.js';

var css$4 = "usa-ripple{position:relative;display:inline-block;overflow:hidden;isolation:isolate;border-radius:inherit;-webkit-tap-highlight-color:transparent}usa-ripple[block]{display:block}usa-ripple .usa-ripple-wave{position:absolute;border-radius:50%;pointer-events:none;transform:scale(0);z-index:-1;will-change:transform,opacity}";

function defineRipple(tag = 'usa-ripple') {
    return defineElement(tag, (Base) => class UsaRipple extends Base {
        static get observedAttributes() {
            return ['disabled', 'centered', 'color', 'opacity', 'duration'];
        }
        mount() {
            this.listen(this, 'pointerdown', (e) => {
                if (e.button !== 0 && e.pointerType === 'mouse')
                    return;
                this.ripple(e.clientX, e.clientY);
            });
            this.listen(this, 'keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !e.repeat)
                    this.ripple();
            });
        }
        ripple(x, y) {
            if (this.flag('disabled'))
                return;
            const r = this.getBoundingClientRect();
            const centered = this.flag('centered') || x === undefined || y === undefined;
            const cx = centered ? r.width / 2 : x - r.left;
            const cy = centered ? r.height / 2 : y - r.top;
            const radius = Math.hypot(Math.max(cx, r.width - cx), Math.max(cy, r.height - cy));
            const wave = document.createElement('span');
            wave.className = 'usa-ripple-wave';
            wave.setAttribute('aria-hidden', 'true');
            const size = radius * 2;
            wave.style.cssText = `width:${size}px;height:${size}px;left:${cx - radius}px;top:${cy - radius}px;background:${this.str('color', 'currentColor')}`;
            this.append(wave);
            const opacity = this.num('opacity', 0.22);
            const duration = this.num('duration', 550);
            const frames = this.reduced
                ? [{ opacity }, { opacity: 0 }]
                : [
                    { transform: 'scale(0)', opacity },
                    { transform: 'scale(1)', opacity, offset: 0.7 },
                    { transform: 'scale(1)', opacity: 0 },
                ];
            const a = this.motion(wave, frames, { duration: this.reduced ? 300 : duration, easing: EASE_OUT, fill: 'forwards' });
            if (a)
                a.onfinish = () => wave.remove();
            else
                setTimeout(() => wave.remove(), 0);
        }
    }, { id: 'ripple', text: css$4 });
}

var css$3 = "usa-magnetic{display:inline-block}usa-magnetic>*{transform:translate3d(var(--usa-mx,0px),var(--usa-my,0px),0);transition:transform 0.6s cubic-bezier(0.34,1.56,0.64,1)}usa-magnetic[data-active]>*{transition-duration:0.15s;transition-timing-function:ease-out}@media (prefers-reduced-motion:reduce){usa-magnetic>*,usa-tilt,usa-toggle .usa-toggle-knob{transition:none}}";

function defineMagnetic(tag = 'usa-magnetic') {
    return defineElement(tag, (Base) => class UsaMagnetic extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['strength', 'radius', 'disabled'];
        }
        mount() {
            if (this.reduced || this.flag('disabled'))
                return;
            if (typeof matchMedia === 'function' && !matchMedia('(hover: hover) and (pointer: fine)').matches)
                return;
            const strength = this.num('strength', 0.35);
            const radius = this.num('radius', 60);
            let x = 0;
            let y = 0;
            let active = false;
            const apply = () => {
                this._frame = 0;
                const r = this.getBoundingClientRect();
                const dx = x - (r.left + r.width / 2);
                const dy = y - (r.top + r.height / 2);
                const near = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
                if (near) {
                    active = true;
                    this.setAttribute('data-active', '');
                    this.style.setProperty('--usa-mx', `${(dx * strength).toFixed(2)}px`);
                    this.style.setProperty('--usa-my', `${(dy * strength).toFixed(2)}px`);
                }
                else if (active)
                    this.release();
            };
            this.listen(document, 'pointermove', (e) => {
                if (e.pointerType !== 'mouse' && e.pointerType !== 'pen')
                    return;
                x = e.clientX;
                y = e.clientY;
                if (!this._frame)
                    this._frame = raf(apply);
            }, { passive: true });
            this.listen(document, 'pointerleave', () => this.release());
            this.listen(window, 'blur', () => this.release());
        }
        release() {
            this.removeAttribute('data-active');
            this.style.removeProperty('--usa-mx');
            this.style.removeProperty('--usa-my');
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
            this.release();
        }
    }, { id: 'magnetic', text: css$3 });
}

var css$2 = "usa-tilt{display:block;position:relative;transform-style:preserve-3d;transition:transform 0.5s cubic-bezier(0.22,1,0.36,1);will-change:transform}usa-tilt[data-active]{transition-duration:0.12s}usa-tilt .usa-tilt-glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity 0.3s ease;background:radial-gradient(circle at var(--usa-glare-x,50%) var(--usa-glare-y,50%),rgb(255 255 255 / 0.35),transparent 55%);mix-blend-mode:soft-light}usa-tilt[data-active] .usa-tilt-glare{opacity:1}";

function defineTilt(tag = 'usa-tilt') {
    return defineElement(tag, (Base) => class UsaTilt extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
            this._glare = null;
        }
        static get observedAttributes() {
            return ['max', 'scale', 'perspective', 'glare', 'reverse', 'disabled'];
        }
        mount() {
            if (this.flag('glare') && !this._glare) {
                this._glare = document.createElement('span');
                this._glare.className = 'usa-tilt-glare';
                this._glare.setAttribute('aria-hidden', 'true');
                this.append(this._glare);
            }
            else if (!this.flag('glare') && this._glare) {
                this._glare.remove();
                this._glare = null;
            }
            if (this.reduced || this.flag('disabled'))
                return;
            const max = this.num('max', 10) * (this.flag('reverse') ? -1 : 1);
            const scale = this.num('scale', 1.03);
            const persp = this.num('perspective', 900);
            let px = 0.5;
            let py = 0.5;
            let rect = null;
            const apply = () => {
                this._frame = 0;
                const nx = clamp(px * 2 - 1, -1, 1);
                const ny = clamp(py * 2 - 1, -1, 1);
                this.style.transform = `perspective(${persp}px) rotateX(${(-ny * max).toFixed(2)}deg) rotateY(${(nx * max).toFixed(2)}deg) scale(${scale})`;
                this.style.setProperty('--usa-tilt-x', nx.toFixed(3));
                this.style.setProperty('--usa-tilt-y', ny.toFixed(3));
                this.style.setProperty('--usa-glare-x', `${(px * 100).toFixed(1)}%`);
                this.style.setProperty('--usa-glare-y', `${(py * 100).toFixed(1)}%`);
            };
            this.listen(this, 'pointerenter', (e) => {
                if (e.pointerType === 'touch')
                    return;
                rect = this.getBoundingClientRect();
                this.setAttribute('data-active', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (e.pointerType === 'touch')
                    return;
                rect = rect || this.getBoundingClientRect();
                px = (e.clientX - rect.left) / (rect.width || 1);
                py = (e.clientY - rect.top) / (rect.height || 1);
                if (!this._frame)
                    this._frame = raf(apply);
            });
            this.listen(this, 'pointerleave', () => this.reset());
        }
        reset() {
            caf(this._frame);
            this._frame = 0;
            this.removeAttribute('data-active');
            this.style.transform = '';
            this.style.setProperty('--usa-tilt-x', '0');
            this.style.setProperty('--usa-tilt-y', '0');
        }
        unmount() {
            this.reset();
        }
    }, { id: 'tilt', text: css$2 });
}

var css$1 = "usa-spotlight{display:block;--usa-spot-size:160px;--usa-spot-color:rgb(255 255 255 / 0.55);--usa-spot-border:1px}usa-spotlight .usa-spotlight-item{position:relative;isolation:isolate}usa-spotlight .usa-spotlight-item::before,usa-spotlight .usa-spotlight-item::after{content:\"\";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity 0.25s ease}usa-spotlight .usa-spotlight-item::before{padding:var(--usa-spot-border);background:radial-gradient(var(--usa-spot-size) circle at var(--usa-spot-x,-999px) var(--usa-spot-y,-999px),var(--usa-spot-color),transparent 70%);-webkit-mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}usa-spotlight .usa-spotlight-item::after{z-index:-1;background:radial-gradient(calc(var(--usa-spot-size) * 0.9) circle at var(--usa-spot-x,-999px) var(--usa-spot-y,-999px),color-mix(in srgb,var(--usa-spot-color) 30%,transparent),transparent 70%)}usa-spotlight[data-lit] .usa-spotlight-item::before{opacity:1}usa-spotlight[data-lit] .usa-spotlight-item:hover::after{opacity:1}usa-spotlight[no-fill] .usa-spotlight-item::after{display:none}";

function defineSpotlight(tag = 'usa-spotlight') {
    return defineElement(tag, (Base) => class UsaSpotlight extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['size', 'color', 'border'];
        }
        items() {
            const marked = Array.from(this.querySelectorAll('[data-spotlight]'));
            const items = marked.length ? marked : Array.from(this.children);
            items.forEach((el) => el.classList.add('usa-spotlight-item'));
            return items;
        }
        mount() {
            const size = this.getAttribute('size');
            if (size)
                this.style.setProperty('--usa-spot-size', `${Number(size)}px`);
            const color = this.getAttribute('color');
            if (color)
                this.style.setProperty('--usa-spot-color', color);
            const border = this.getAttribute('border');
            if (border)
                this.style.setProperty('--usa-spot-border', `${Number(border)}px`);
            let items = this.items();
            let x = 0;
            let y = 0;
            const apply = () => {
                this._frame = 0;
                // All reads, then all writes
                const rects = items.map((el) => el.getBoundingClientRect());
                rects.forEach((r, i) => {
                    items[i].style.setProperty('--usa-spot-x', `${(x - r.left).toFixed(1)}px`);
                    items[i].style.setProperty('--usa-spot-y', `${(y - r.top).toFixed(1)}px`);
                });
            };
            this.listen(this, 'pointerenter', (e) => {
                if (e.pointerType === 'touch')
                    return;
                items = this.items();
                this.setAttribute('data-lit', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (e.pointerType === 'touch')
                    return;
                x = e.clientX;
                y = e.clientY;
                if (!this.hasAttribute('data-lit'))
                    this.setAttribute('data-lit', '');
                // contract-exempt: reduced-motion — pointer-follow light, not a motion effect (documented to stay on under reduced motion)
                if (!this._frame)
                    this._frame = raf(apply);
            });
            this.listen(this, 'pointerleave', () => this.removeAttribute('data-lit'));
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
            this.removeAttribute('data-lit');
        }
    }, { id: 'spotlight', text: css$1 });
}

var css = "usa-press{display:inline-block;touch-action:manipulation;-webkit-tap-highlight-color:transparent}usa-press[block]{display:block}";

function definePress(tag = 'usa-press') {
    return defineElement(tag, (Base) => class UsaPress extends Base {
        constructor() {
            super(...arguments);
            this._anim = null;
            this._down = false;
        }
        static get observedAttributes() {
            return ['disabled', 'scale', 'bounce'];
        }
        get pressed() {
            return this._down;
        }
        frame(down) {
            if (this.reduced)
                return { opacity: down ? 0.7 : 1 };
            return { transform: down ? `scale(${this.num('scale', 0.95)})` : 'scale(1)' };
        }
        down() {
            if (this._down || this.flag('disabled'))
                return;
            this._down = true;
            this.setAttribute('data-pressed', '');
            const from = this.currentFrame();
            this._anim?.cancel();
            this._anim = this.motion(this, [from, this.frame(true)], { duration: 120, easing: 'cubic-bezier(0.3, 0, 0.7, 1)', fill: 'forwards' });
        }
        up() {
            if (!this._down)
                return;
            this._down = false;
            this.removeAttribute('data-pressed');
            const from = this.currentFrame();
            this._anim?.cancel();
            const frames = this.flag('bounce') && !this.reduced
                ? [from, { transform: 'scale(1.06)', offset: 0.45 }, { transform: 'scale(0.99)', offset: 0.75 }, this.frame(false)]
                : [from, this.frame(false)];
            const a = this.motion(this, frames, { duration: this.flag('bounce') ? 480 : 320, easing: EASE_SPRING });
            this._anim = a;
            if (a)
                a.onfinish = () => this._anim === a && (this._anim = null);
        }
        currentFrame() {
            if (typeof getComputedStyle !== 'function')
                return this.frame(false);
            const cs = getComputedStyle(this);
            return this.reduced ? { opacity: cs.opacity || '1' } : { transform: cs.transform && cs.transform !== 'none' ? cs.transform : 'scale(1)' };
        }
        mount() {
            this.listen(this, 'pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0)
                    return;
                this.down();
            });
            for (const t of ['pointerup', 'pointerleave', 'pointercancel', 'blur'])
                this.listen(this, t, () => this.up());
            this.listen(this, 'keydown', (e) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && this.down());
            this.listen(this, 'keyup', (e) => (e.key === ' ' || e.key === 'Enter') && this.up());
        }
        unmount() {
            this._anim?.cancel();
            this._anim = null;
            this._down = false;
        }
    }, { id: 'press', text: css });
}

/**
 * motionary/components/interaction — micro-interactions.
 * `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>`, `<usa-spotlight>`,
 * `<usa-press>`.
 */
/** Register every component of this category under its default tag. */
function defineInteractionComponents() {
    defineRipple();
    defineMagnetic();
    defineTilt();
    defineSpotlight();
    definePress();
}

export { defineInteractionComponents, defineMagnetic, definePress, defineRipple, defineSpotlight, defineTilt };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/components/interaction.js.map