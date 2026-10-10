import { f as defineElement } from './base-zSGb8ujt.js';
import { o as ownChildren, p as part, a as arrowIndex } from './shared-C8Pi6tuh.js';

var css = "usa-nav-morph{position:relative;display:flex;gap:4px;align-items:center;isolation:isolate;--usa-nm-color:#7c5cff;flex-wrap:nowrap;max-width:100%;overflow-x:auto;scrollbar-width:none}usa-nav-morph::-webkit-scrollbar{display:none}usa-nav-morph>:not(.usa-nm-ink){position:relative;z-index:1;flex:none;padding:8px 12px;border-radius:10px;color:inherit;text-decoration:none;font-weight:600;white-space:nowrap;transition:color .25s;outline-offset:2px}.usa-nm-ink{position:absolute;left:0;z-index:0;width:0;pointer-events:none;background:var(--usa-nm-color)}usa-nav-morph[data-indicator=\"underline\"] .usa-nm-ink{bottom:0;height:3px;border-radius:3px}usa-nav-morph[data-indicator=\"pill\"] .usa-nm-ink,usa-nav-morph[data-indicator=\"blob\"] .usa-nm-ink{top:0;bottom:0;border-radius:10px;opacity:.16}usa-nav-morph[data-indicator=\"blob\"] .usa-nm-ink{border-radius:999px;opacity:.2}usa-nav-morph[data-indicator=\"dot\"] .usa-nm-ink{bottom:0;height:6px;background:radial-gradient(circle,var(--usa-nm-color) 3px,transparent 3.5px)}usa-nav-morph>[aria-current=\"page\"]{color:var(--usa-nm-color)}";

const NAV_INDICATORS = ['underline', 'pill', 'blob', 'dot'];
function defineNavMorph(tag = 'usa-nav-morph') {
    return defineElement(tag, (Base) => {
        class UsaNavMorph extends Base {
            constructor() {
                super(...arguments);
                this._links = [];
                this._ink = null;
                this._active = 0;
                this._at = -1;
            }
            static get observedAttributes() {
                return ['indicator', 'label', 'active'];
            }
            get active() {
                return this._active;
            }
            set active(i) {
                this.setActive(i, false);
            }
            mount() {
                const ind = this.str('indicator', 'underline');
                this.dataset.indicator = NAV_INDICATORS.includes(ind) ? ind : 'underline';
                if (this.localName !== 'nav' && !this.hasAttribute('role'))
                    this.setAttribute('role', 'navigation');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Main'));
                this.querySelectorAll(':scope > .usa-nm-ink').forEach((n) => n.remove());
                this._links = ownChildren(this);
                this._ink = part('span', 'usa-nm-ink', { 'aria-hidden': 'true' });
                this.prepend(this._ink);
                const cur = this._links.findIndex((l) => l.getAttribute('aria-current') === 'page');
                this._active = cur >= 0 ? cur : Math.max(0, Math.min(this._links.length - 1, Math.round(this.num('active', 0))));
                this._at = -1;
                this._links.forEach((l, i) => {
                    this.listen(l, 'pointerenter', () => this.moveTo(i));
                    this.listen(l, 'focus', () => this.moveTo(i));
                    this.listen(l, 'click', () => this.setActive(i, true));
                    this.listen(l, 'keydown', (e) => {
                        const n = arrowIndex(e, i, this._links.length);
                        if (n >= 0) {
                            e.preventDefault();
                            this._links[n].focus();
                        }
                    });
                });
                this.listen(this, 'pointerleave', () => this.moveTo(this._active));
                this.listen(this, 'focusout', (e) => !this.contains(e.relatedTarget) && this.moveTo(this._active));
                this.sync();
                this.moveTo(this._active);
                if (typeof ResizeObserver === 'function') {
                    const ro = new ResizeObserver(() => this.place(this._at < 0 ? this._active : this._at));
                    ro.observe(this);
                    this.onCleanup(() => ro.disconnect());
                }
            }
            rect(i) {
                const l = this._links[i];
                return l ? [l.offsetLeft, l.offsetWidth] : [0, 0];
            }
            place(i) {
                if (!this._ink)
                    return;
                const [x, w] = this.rect(i);
                this._ink.style.transform = `translateX(${x}px)`;
                this._ink.style.width = `${w}px`;
            }
            moveTo(i) {
                const from = this._at;
                this._at = i;
                this.place(i);
                if (from < 0 || from === i || this.reduced || !this._ink)
                    return;
                const [x0, w0] = this.rect(from);
                const [x1, w1] = this.rect(i);
                const mid = x1 > x0 ? { transform: `translateX(${x0}px)`, width: `${x1 + w1 - x0}px` } : { transform: `translateX(${x1}px)`, width: `${x0 + w0 - x1}px` };
                const blob = this.dataset.indicator === 'blob';
                this.motion(this._ink, [
                    { transform: `translateX(${x0}px)`, width: `${w0}px` },
                    { ...mid, offset: 0.4, ...(blob ? { borderRadius: '40% 60% 55% 45% / 60% 40% 60% 40%' } : {}) },
                    { transform: `translateX(${x1}px)`, width: `${w1}px` },
                ], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
            }
            sync() {
                this._links.forEach((l, k) => {
                    if (k === this._active)
                        l.setAttribute('aria-current', 'page');
                    else if (l.getAttribute('aria-current') === 'page')
                        l.removeAttribute('aria-current');
                });
            }
            setActive(i, user) {
                const n = Math.max(0, Math.min(this._links.length - 1, Math.round(i)));
                const changed = n !== this._active;
                this._active = n;
                this.sync();
                this.moveTo(n);
                if (changed && user)
                    this.emit('change', { index: n });
            }
        }
        return UsaNavMorph;
    }, { id: 'nav-morph', text: css });
}

export { NAV_INDICATORS as N, defineNavMorph as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/chunks/nav-morph-BlfdTr2-.js.map