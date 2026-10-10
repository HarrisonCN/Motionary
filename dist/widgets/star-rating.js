import { f as defineElement } from '../chunks/base-nzeN_ux7.js';
import { p as part, c as clampN } from '../chunks/shared-o9CtwHmi.js';

var css = "usa-star-rating{display:inline-flex;gap:var(--usa-star-gap,4px);--usa-star-size:28px;--usa-star-on:#fbbf24;--usa-star-off:rgba(127,127,127,.28);cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;border-radius:8px}usa-star-rating[readonly]{cursor:default}usa-star-rating:focus-visible{outline:2px solid var(--usa-star-on);outline-offset:4px}.usa-star{position:relative;display:inline-block;width:var(--usa-star-size);height:var(--usa-star-size);--usa-star-fill:0%}.usa-star svg{display:block;width:100%;height:100%;overflow:visible;stroke:none}.usa-star-bg{fill:var(--usa-star-off)}.usa-star-fg{position:absolute;left:0;top:0;bottom:0;width:var(--usa-star-fill);overflow:hidden;transition:width .18s ease-out}.usa-star-fg svg{width:var(--usa-star-size);height:var(--usa-star-size);fill:var(--usa-star-on);filter:drop-shadow(0 1px 3px rgba(251,191,36,.45))}usa-star-rating[data-preview] .usa-star-fg{opacity:.8}.usa-star-spark{position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;background:var(--usa-star-on);pointer-events:none}@media (prefers-reduced-motion:reduce){.usa-star-fg{transition:none}}";

const PATHS = {
    star: 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z',
    heart: 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.1 1.8-1.9 3.3-3.1 5.4-3.1 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z',
};
/** <usa-rating> icon characters accepted by `icon` (7.9). */
const ICON_ALIASES = { '★': 'star', '☆': 'star', '♥': 'heart', '❤': 'heart', '❤️': 'heart' };
function defineStarRating(tag = 'usa-star-rating') {
    return defineElement(tag, (Base) => {
        class UsaStarRating extends Base {
            static get observedAttributes() {
                return ['max', 'icon', 'readonly', 'step', 'label', 'value'];
            }
            constructor() {
                super();
                this._internals = null;
                this._v = 0;
                this._stars = [];
                try {
                    this._internals = this.attachInternals?.() ?? null;
                }
                catch {
                    this._internals = null;
                }
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.set(v, false);
            }
            get max() {
                return Math.max(1, Math.round(this.num('max', 5)));
            }
            get step() {
                return this.num('step', 1) === 0.5 ? 0.5 : 1;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const icon = PATHS[ICON_ALIASES[this.str('icon', 'star')] || this.str('icon', 'star')] || PATHS.star;
                this._stars = [];
                for (let i = 0; i < this.max; i++) {
                    const s = part('span', 'usa-star', { 'aria-hidden': 'true' }, `<svg viewBox="0 0 24 24" width="100%" height="100%"><path class="usa-star-bg" d="${icon}"/></svg><span class="usa-star-fg"><svg viewBox="0 0 24 24" width="24" height="24"><path d="${icon}"/></svg></span>`);
                    this._stars.push(s);
                    this.append(s);
                }
                const ro = this.flag('readonly');
                this.setAttribute('role', ro ? 'img' : 'slider');
                if (!ro) {
                    this.tabIndex = 0;
                    this.setAttribute('aria-valuemin', '0');
                    this.setAttribute('aria-valuemax', String(this.max));
                }
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Rating'));
                this._v = clampN(this.num('value', 0), 0, this.max);
                this.paint(this._v);
                this.sync();
                if (ro)
                    return;
                const at = (e) => {
                    const r = this._stars[0].getBoundingClientRect();
                    const last = this._stars[this._stars.length - 1].getBoundingClientRect();
                    const w = last.right - r.left || 1;
                    const raw = ((e.clientX - r.left) / w) * this.max;
                    return clampN(Math.ceil(raw / this.step) * this.step, this.step, this.max);
                };
                this.listen(this, 'pointermove', (e) => {
                    this.setAttribute('data-preview', '');
                    this.paint(at(e));
                });
                this.listen(this, 'pointerleave', () => {
                    this.removeAttribute('data-preview');
                    this.paint(this._v);
                });
                this.listen(this, 'click', (e) => this.set(at(e), true));
                this.listen(this, 'keydown', (e) => {
                    const k = e.key;
                    let v = this._v;
                    if (k === 'ArrowRight' || k === 'ArrowUp')
                        v += this.step;
                    else if (k === 'ArrowLeft' || k === 'ArrowDown')
                        v -= this.step;
                    else if (k === 'Home')
                        v = 0;
                    else if (k === 'End')
                        v = this.max;
                    else
                        return;
                    e.preventDefault();
                    this.set(v, true);
                });
            }
            sync() {
                this.setAttribute('aria-valuenow', String(this._v));
                this.setAttribute('aria-valuetext', `${this._v} of ${this.max}`);
                this._internals?.setFormValue?.(String(this._v));
                if (this.flag('readonly'))
                    this.setAttribute('aria-label', `${this.str('label', 'Rating')}: ${this._v} of ${this.max}`);
            }
            paint(v) {
                this._stars.forEach((s, i) => s.style.setProperty('--usa-star-fill', `${(clampN(v - i, 0, 1) * 100).toFixed(0)}%`));
            }
            set(v, user) {
                const nv = clampN(Math.round(v / this.step) * this.step, 0, this.max);
                const changed = nv !== this._v;
                this._v = nv;
                this.paint(nv);
                this.sync();
                if (!user)
                    return;
                const idx = Math.ceil(nv) - 1;
                if (!this.reduced && idx >= 0) {
                    const star = this._stars[idx];
                    this.motion(star, [{ transform: 'scale(1)' }, { transform: 'scale(1.45) rotate(-12deg)', offset: 0.35 }, { transform: 'scale(.92)', offset: 0.7 }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.3,1.4,.5,1)' });
                    this._stars.slice(0, idx).forEach((s, i) => this.motion(s, [{ transform: 'none' }, { transform: 'translateY(-5px)' }, { transform: 'none' }], { duration: 320, delay: i * 45, easing: 'ease-out' }));
                    for (let k = 0; k < 8; k++) {
                        const sp = part('span', 'usa-star-spark', { 'aria-hidden': 'true' });
                        star.append(sp);
                        const a = (k / 8) * Math.PI * 2;
                        const anim = this.motion(sp, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${(Math.cos(a) * 22).toFixed(1)}px), calc(-50% + ${(Math.sin(a) * 22).toFixed(1)}px)) scale(.2)`, opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
                        const rm = () => sp.remove();
                        if (anim)
                            anim.finished.then(rm, rm);
                        else
                            rm();
                    }
                }
                if (changed) {
                    this.dispatchEvent(new Event('change', { bubbles: true }));
                    this.emit('change', { value: nv });
                }
            }
        }
        UsaStarRating.formAssociated = true;
        return UsaStarRating;
    }, { id: 'star-rating', text: css });
}

export { defineStarRating };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/widgets/star-rating.js.map