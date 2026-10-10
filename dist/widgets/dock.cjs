'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var shared = require('../chunks/shared-BxK1D7EZ.cjs');

var css = "usa-dock{display:inline-flex;align-items:flex-end;gap:var(--usa-dock-gap,8px);padding:8px 10px;border-radius:20px;background:var(--usa-dock-bg,rgba(255,255,255,.55));-webkit-backdrop-filter:blur(14px) saturate(1.6);backdrop-filter:blur(14px) saturate(1.6);box-shadow:0 10px 30px -10px rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.45);--usa-dock-size:44px}usa-dock[data-orientation=\"vertical\"]{flex-direction:column;align-items:flex-start}.usa-dock-item{--usa-dock-s:1;position:relative;display:grid;place-items:center;flex:none;width:calc(var(--usa-dock-size) * var(--usa-dock-s));height:calc(var(--usa-dock-size) * var(--usa-dock-s));border:0;padding:0;border-radius:calc(var(--usa-dock-size) * .26 * var(--usa-dock-s));background:var(--usa-dock-item,linear-gradient(135deg,#7c5cff,#22d3ee));color:#fff;font-size:calc(var(--usa-dock-size) * .5 * var(--usa-dock-s));text-decoration:none;cursor:pointer;transition:width .12s ease-out,height .12s ease-out,font-size .12s ease-out,border-radius .12s;box-shadow:0 4px 10px rgba(0,0,0,.18)}.usa-dock-item:focus-visible{outline:2px solid #7c5cff;outline-offset:3px}.usa-dock-item[data-label]::after{content:attr(data-label);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);padding:3px 8px;border-radius:6px;background:rgba(17,24,39,.9);color:#fff;font:500 12px/1.3 system-ui,sans-serif;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s}.usa-dock-item[data-near]::after,.usa-dock-item:focus-visible::after{opacity:1;transform:translateX(-50%)}usa-dock[data-orientation=\"vertical\"] .usa-dock-item[data-label]::after{bottom:auto;left:calc(100% + 8px);top:50%;transform:translateY(-50%)}@media (prefers-reduced-motion:reduce){.usa-dock-item{transition:none}}";

function defineDock(tag = 'usa-dock') {
    return base.defineElement(tag, (Base) => {
        class UsaDock extends Base {
            constructor() {
                super(...arguments);
                this._items = [];
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['orientation', 'magnify', 'range', 'label', 'bounce'];
            }
            get items() {
                return this._items;
            }
            mount() {
                this.dataset.orientation = this.str('orientation', 'horizontal') === 'vertical' ? 'vertical' : 'horizontal';
                this.setAttribute('role', this.getAttribute('role') || 'toolbar');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Dock'));
                this._items = shared.ownChildren(this);
                this._items.forEach((it) => {
                    it.classList.add('usa-dock-item');
                    if (it.dataset.label && !it.getAttribute('aria-label') && !it.textContent?.trim())
                        it.setAttribute('aria-label', it.dataset.label);
                    this.listen(it, 'click', () => this.bounce(it));
                    this.listen(it, 'focus', () => this.magnifyAt(this.center(it)));
                    this.listen(it, 'blur', () => this.magnifyAt(null));
                });
                this.listen(this, 'pointermove', (e) => {
                    const v = this.dataset.orientation === 'vertical' ? e.clientY : e.clientX;
                    if (!this._raf)
                        this._raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => ((this._raf = 0), this.magnifyAt(v))) : (this.magnifyAt(v), 0);
                });
                this.listen(this, 'pointerleave', () => this.magnifyAt(null));
                this.onCleanup(() => {
                    if (this._raf && typeof cancelAnimationFrame === 'function')
                        cancelAnimationFrame(this._raf);
                });
            }
            center(it) {
                const r = it.getBoundingClientRect();
                return this.dataset.orientation === 'vertical' ? r.top + r.height / 2 : r.left + r.width / 2;
            }
            /** Scale every item by its distance to `pos` (client px), or reset with `null`. */
            magnifyAt(pos) {
                const max = this.num('magnify', 1.9);
                const range = Math.max(20, this.num('range', 140));
                for (const it of this._items) {
                    let s = 1;
                    if (pos !== null && !this.reduced) {
                        const d = Math.abs(this.center(it) - pos);
                        if (d < range)
                            s = 1 + (max - 1) * (0.5 + 0.5 * Math.cos((d / range) * Math.PI));
                    }
                    it.style.setProperty('--usa-dock-s', s.toFixed(3));
                    it.toggleAttribute('data-near', s > 1.5 || (pos !== null && this.reduced && Math.abs(this.center(it) - pos) < 24));
                }
            }
            bounce(it) {
                if (this.reduced || !this.flag('bounce'))
                    return;
                const v = this.dataset.orientation === 'vertical';
                this.motion(it, [{ translate: '0 0' }, { translate: v ? '18px 0' : '0 -22px', offset: 0.3 }, { translate: '0 0', offset: 0.55 }, { translate: v ? '8px 0' : '0 -9px', offset: 0.75 }, { translate: '0 0' }], { duration: 760, easing: 'ease-out' });
            }
        }
        return UsaDock;
    }, { id: 'dock', text: css });
}

exports.defineDock = defineDock;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.0/dist/widgets/dock.cjs.map