'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var registry = require('../chunks/registry-BB1oO-lR.cjs');
require('../chunks/builtins-Cz3iufK6.cjs');
var components_fxShop = require('../components/fx-shop.cjs');
require('../chunks/core-KIvPGg0c.cjs');
require('../components/tokens.cjs');
require('../chunks/fx-BaPAanPW.cjs');

var css = "usa-add-to-cart{display:inline-block}.usa-atc-btn{position:relative;display:inline-grid;place-items:center;min-width:var(--usa-atc-w,150px);padding:11px 18px;border:0;border-radius:999px;background:var(--usa-atc-bg,#7c5cff);color:#fff;font:700 14px/1 system-ui,sans-serif;cursor:pointer;overflow:hidden;transition:background .3s}.usa-atc-btn>span{grid-area:1/1;transition:transform .35s cubic-bezier(.3,1.4,.5,1),opacity .25s}.usa-atc-done{transform:translateY(120%);opacity:0}usa-add-to-cart[data-added] .usa-atc-btn{background:var(--usa-atc-ok,#16a34a)}usa-add-to-cart[data-added] .usa-atc-label{transform:translateY(-120%);opacity:0}usa-add-to-cart[data-added] .usa-atc-done{transform:none;opacity:1}.usa-atc-btn:focus-visible{outline:3px solid #a78bfa;outline-offset:2px}.usa-atc-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}@media (prefers-reduced-motion:reduce){.usa-atc-btn>span{transition:none}}";

function defineAddToCart(tag = 'usa-add-to-cart') {
    return base.defineElement(tag, (Base) => {
        class UsaAddToCart extends Base {
            constructor() {
                super(...arguments);
                this._t = 0;
            }
            static get observedAttributes() {
                return ['label', 'added', 'item', 'cart', 'from', 'hold'];
            }
            mount() {
                components_fxShop.registerShopPack();
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const label = this.textContent?.trim() || this.str('label', 'Add to cart');
                this.textContent = '';
                this.insertAdjacentHTML('afterbegin', '<button type="button" class="usa-atc-btn" data-usa-part><span class="usa-atc-label"></span><span class="usa-atc-done" aria-hidden="true">✓ <span></span></span></button><span class="usa-atc-live" data-usa-part aria-live="polite"></span>');
                this.querySelector('.usa-atc-label').textContent = label;
                this.querySelector('.usa-atc-done span').textContent = this.str('added', 'Added');
                this.listen(this.querySelector('.usa-atc-btn'), 'click', () => this.add());
                this.onCleanup(() => this._t && clearTimeout(this._t));
            }
            add() {
                let item = {};
                try {
                    item = JSON.parse(this.str('item', '{}'));
                }
                catch {
                    item = { name: this.str('item', '') };
                }
                const cartSel = this.str('cart', '[data-cart]');
                const cart = document.querySelector(cartSel);
                const from = (this.str('from', '') && document.querySelector(this.str('from', ''))) || this.closest('[data-product]')?.querySelector('img') || this;
                if (registry.getEffect('fly-to-cart'))
                    void registry.playEffect(from, 'fly-to-cart', { to: cart?.matches('usa-cart-drawer') ? `${cartSel} .usa-cd2-toggle` : cartSel });
                cart?.add?.(item);
                this.setAttribute('data-added', '');
                this.querySelector('.usa-atc-live').textContent = `${this.str('added', 'Added')} to cart`;
                if (!this.reduced)
                    this.motion(this.querySelector('.usa-atc-btn'), [{ transform: 'scale(1)' }, { transform: 'scale(.92)', offset: 0.3 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
                if (this._t)
                    clearTimeout(this._t);
                this._t = setTimeout(() => this.removeAttribute('data-added'), this.num('hold', 1600));
                this.emit('add', { item });
            }
        }
        return UsaAddToCart;
    }, { id: 'add-to-cart', text: css });
}

exports.defineAddToCart = defineAddToCart;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.5.0/dist/widgets/add-to-cart.cjs.map