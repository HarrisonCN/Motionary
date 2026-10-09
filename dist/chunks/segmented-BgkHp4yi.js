import { f as defineElement } from './base-BTev8qxg.js';
import { o as ownChildren, c as clampN, a as arrowIndex } from './shared-C8Pi6tuh.js';

var css = "usa-segmented{--usa-seg-c:#7c5cff;position:relative;display:inline-flex;align-items:stretch;padding:3px;border-radius:12px;background:rgba(127,127,127,.16);isolation:isolate;max-width:100%;font:600 13px/1 system-ui,sans-serif}.usa-seg-thumb{position:absolute;top:3px;bottom:3px;left:3px;z-index:-1;border-radius:9px;background:var(--usa-seg-thumb,#fff);box-shadow:0 2px 8px rgba(0,0,0,.18),0 0 0 .5px rgba(0,0,0,.05);transform-origin:50% 50%}usa-segmented[data-variant=\"pill\"]{border-radius:999px}usa-segmented[data-variant=\"pill\"] .usa-seg-thumb{border-radius:999px;background:var(--usa-seg-c)}usa-segmented[data-variant=\"pill\"] .usa-seg-item[data-selected]{color:#fff}usa-segmented[data-variant=\"outline\"]{background:none;box-shadow:inset 0 0 0 1.5px rgba(127,127,127,.35)}usa-segmented[data-variant=\"outline\"] .usa-seg-thumb{background:none;box-shadow:inset 0 0 0 2px var(--usa-seg-c)}.usa-seg-item{flex:1 1 0;min-width:0;padding:8px 14px;border:0;border-radius:9px;background:none;color:inherit;font:inherit;white-space:nowrap;cursor:pointer;opacity:.7;transition:opacity .2s,transform .25s cubic-bezier(.3,1.4,.5,1),color .2s}.usa-seg-item[data-selected]{opacity:1;transform:scale(1.04)}.usa-seg-item:focus-visible{outline:2px solid var(--usa-seg-c);outline-offset:1px}@media (max-width:420px){.usa-seg-item{padding:8px 9px}}@media (prefers-reduced-motion:reduce){.usa-seg-item{transition:none}}";

const SEGMENTED_VARIANTS = ['ios', 'pill', 'outline'];
function defineSegmented(tag = 'usa-segmented') {
    return defineElement(tag, (Base) => {
        class UsaSegmented extends Base {
            constructor() {
                super(...arguments);
                this._segs = [];
                this._v = 0;
                this._thumb = null;
            }
            static get observedAttributes() {
                return ['variant'];
            }
            get segments() {
                return this._segs;
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.select(v, false);
            }
            mount() {
                const v = this.str('variant', 'ios');
                this.dataset.variant = SEGMENTED_VARIANTS.includes(v) ? v : 'ios';
                this.setAttribute('role', 'radiogroup');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Options'));
                this._segs = ownChildren(this);
                if (!this.querySelector(':scope > .usa-seg-thumb')) {
                    const t = document.createElement('span');
                    t.className = 'usa-seg-thumb';
                    t.setAttribute('aria-hidden', 'true');
                    t.setAttribute('data-usa-part', '');
                    this.prepend(t);
                }
                this._thumb = this.querySelector('.usa-seg-thumb');
                const pre = this._segs.findIndex((s) => s.hasAttribute('selected') || s.getAttribute('aria-checked') === 'true');
                this._v = clampN(pre >= 0 ? pre : this.num('value', 0) | 0, 0, Math.max(0, this._segs.length - 1));
                this._segs.forEach((s, i) => {
                    s.classList.add('usa-seg-item');
                    s.setAttribute('role', 'radio');
                    this.listen(s, 'click', () => this.select(i, true));
                    this.listen(s, 'keydown', (e) => {
                        const j = arrowIndex(e, i, this._segs.length);
                        if (j < 0)
                            return;
                        e.preventDefault();
                        this.select(j, true);
                        this._segs[j].focus();
                    });
                });
                this.sync(false);
                if (typeof ResizeObserver === 'function') {
                    const ro = new ResizeObserver(() => this.place(false));
                    ro.observe(this);
                    this.onCleanup(() => ro.disconnect());
                }
            }
            sync(animate) {
                this._segs.forEach((s, i) => {
                    s.setAttribute('aria-checked', String(i === this._v));
                    s.tabIndex = i === this._v ? 0 : -1;
                    s.toggleAttribute('data-selected', i === this._v);
                });
                this.place(animate);
            }
            place(animate) {
                const s = this._segs[this._v];
                const t = this._thumb;
                if (!s || !t)
                    return;
                const from = { x: t.offsetLeft, w: t.offsetWidth };
                t.style.left = s.offsetLeft + 'px';
                t.style.width = s.offsetWidth + 'px';
                if (!animate || this.reduced || !from.w)
                    return;
                const dx = from.x - s.offsetLeft;
                const sx = from.w / (s.offsetWidth || 1);
                this.motion(t, [{ transform: `translateX(${dx}px) scaleX(${sx})` }, { transform: `translateX(${dx * 0.35}px) scaleX(${Math.max(sx, 1) * 1.18}) scaleY(.88)`, offset: 0.45 }, { transform: 'none' }], { duration: 430, easing: 'cubic-bezier(.3,1.25,.5,1)' });
            }
            select(i, user) {
                const v = clampN(i | 0, 0, Math.max(0, this._segs.length - 1));
                if (v === this._v)
                    return;
                this._v = v;
                this.sync(true);
                if (user)
                    this.emit('change', { value: v, label: this._segs[v]?.textContent?.trim() || '' });
            }
        }
        return UsaSegmented;
    }, { id: 'segmented', text: css });
}

export { SEGMENTED_VARIANTS as S, defineSegmented as d };
//# sourceMappingURL=segmented-BgkHp4yi.js.map
