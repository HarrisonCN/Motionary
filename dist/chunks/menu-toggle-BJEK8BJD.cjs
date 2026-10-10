'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-menu-toggle{display:inline-grid;place-items:center;width:var(--usa-mt-size,44px);height:var(--usa-mt-size,44px);border-radius:12px;cursor:pointer;color:inherit;-webkit-tap-highlight-color:transparent;outline-offset:2px;--usa-mt-ease:cubic-bezier(.65,.05,.36,1)}usa-menu-toggle:hover{background:rgba(127,127,127,.12)}.usa-mt-box{position:relative;width:24px;height:18px}.usa-mt-bar{position:absolute;left:0;width:100%;height:2.5px;border-radius:2px;background:currentColor;transform-origin:50% 50%}.usa-mt-bar:nth-child(1){top:0}.usa-mt-bar:nth-child(2){top:7.75px}.usa-mt-bar:nth-child(3){bottom:0}usa-menu-toggle[data-animate] .usa-mt-bar{transition:transform .38s var(--usa-mt-ease),opacity .2s,top .38s var(--usa-mt-ease),bottom .38s var(--usa-mt-ease),width .38s var(--usa-mt-ease)}usa-menu-toggle[data-animate] .usa-mt-box{transition:transform .38s var(--usa-mt-ease)}usa-menu-toggle[data-variant=\"cross\"][data-open] .usa-mt-bar:nth-child(1),usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-bar:nth-child(1){top:7.75px;transform:rotate(45deg)}usa-menu-toggle[data-variant=\"cross\"][data-open] .usa-mt-bar:nth-child(2),usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-bar:nth-child(2){opacity:0;transform:scaleX(.2)}usa-menu-toggle[data-variant=\"cross\"][data-open] .usa-mt-bar:nth-child(3),usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-bar:nth-child(3){bottom:7.75px;transform:rotate(-45deg)}usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-box{transform:rotate(180deg)}usa-menu-toggle[data-variant=\"arrow\"][data-open] .usa-mt-bar:nth-child(1){width:55%;transform:translate(-2px,3.5px) rotate(-40deg)}usa-menu-toggle[data-variant=\"arrow\"][data-open] .usa-mt-bar:nth-child(3){width:55%;transform:translate(-2px,-3.5px) rotate(40deg)}usa-menu-toggle[data-variant=\"arrow\"][data-open] .usa-mt-box{transform:rotate(180deg)}usa-menu-toggle[data-variant=\"minus\"][data-open] .usa-mt-bar:nth-child(1){top:7.75px}usa-menu-toggle[data-variant=\"minus\"][data-open] .usa-mt-bar:nth-child(3){bottom:7.75px}";

const TOGGLE_VARIANTS = ['cross', 'arrow', 'minus', 'plus-x'];
function defineMenuToggle(tag = 'usa-menu-toggle') {
    // contract-exempt: attr-unobserved — pressed: state reflected by the element itself (set the property instead); observing it would re-mount on every change
    return base.defineElement(tag, (Base) => {
        class UsaMenuToggle extends Base {
            constructor() {
                super(...arguments);
                this._open = false;
            }
            static get observedAttributes() {
                return ['variant', 'label', 'for'];
            }
            get open() {
                return this._open;
            }
            set open(v) {
                this.toggle(v);
            }
            mount() {
                const v = this.str('variant', 'cross');
                this.dataset.variant = TOGGLE_VARIANTS.includes(v) ? v : 'cross';
                if (!this.querySelector(':scope > .usa-mt-box')) {
                    const box = document.createElement('span');
                    box.className = 'usa-mt-box';
                    box.setAttribute('aria-hidden', 'true');
                    box.setAttribute('data-usa-part', '');
                    box.innerHTML = '<span class="usa-mt-bar"></span><span class="usa-mt-bar"></span><span class="usa-mt-bar"></span>';
                    this.prepend(box);
                }
                this.setAttribute('role', 'button');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('aria-label') && !this.textContent?.trim())
                    this.setAttribute('aria-label', this.str('label', 'Menu'));
                const id = this.str('for', '');
                if (id)
                    this.setAttribute('aria-controls', id);
                this._open = this.flag('pressed');
                this.sync(false);
                this.listen(this, 'click', () => this.toggle());
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggle();
                    }
                });
            }
            sync(animate) {
                this.setAttribute('aria-expanded', String(this._open));
                this.toggleAttribute('data-open', this._open);
                this.toggleAttribute('data-animate', animate && !this.reduced);
                const target = this.str('for', '') ? document.getElementById(this.str('for', '')) : null;
                if (!target || !animate)
                    return;
                if (this._open && typeof target.show === 'function')
                    target.show();
                else if (!this._open && typeof target.close === 'function')
                    target.close();
                else
                    target.hidden = !this._open;
            }
            toggle(force) {
                const next = typeof force === 'boolean' ? force : !this._open;
                if (next === this._open)
                    return;
                this._open = next;
                this.toggleAttribute('pressed', next);
                this.sync(true);
                this.emit('toggle', { open: next });
            }
        }
        return UsaMenuToggle;
    }, { id: 'menu-toggle', text: css });
}

exports.TOGGLE_VARIANTS = TOGGLE_VARIANTS;
exports.defineMenuToggle = defineMenuToggle;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.1.0/dist/chunks/menu-toggle-BJEK8BJD.cjs.map