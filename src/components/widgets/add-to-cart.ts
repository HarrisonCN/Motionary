import { defineElement, type UsaElement } from '../base';
import { getEffect, playEffect } from '../fx';
import { registerShopPack } from '../fx2/shop';
import css from './add-to-cart.css?raw';

/**
 * `<usa-add-to-cart>` (7.3) — a buy button: on click a ghost of the product
 * (`from` selector, default the closest `[data-product]` image) flies into
 * the cart (`cart` selector, default `[data-cart]`, or a `<usa-cart-drawer>`
 * whose `add()` is called with `item` JSON), then the button morphs into a
 * ✓ "Added" state for `hold` ms. `usa:add` (`{ item }`). A real `<button>`
 * inside; `aria-live` announces "Added to cart". Reduced motion: no flight
 * or morph — the cart just bumps.
 */
export interface UsaAddToCartElement extends UsaElement {
  add(): void;
}

export function defineAddToCart(tag = 'usa-add-to-cart'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaAddToCart extends Base {
        private _t: ReturnType<typeof setTimeout> | 0 = 0;

        mount(): void {
          registerShopPack();
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const label = this.textContent?.trim() || this.str('label', 'Add to cart');
          this.textContent = '';
          this.insertAdjacentHTML('afterbegin', '<button type="button" class="usa-atc-btn" data-usa-part><span class="usa-atc-label"></span><span class="usa-atc-done" aria-hidden="true">✓ <span></span></span></button><span class="usa-atc-live" data-usa-part aria-live="polite"></span>');
          (this.querySelector('.usa-atc-label') as HTMLElement).textContent = label;
          (this.querySelector('.usa-atc-done span') as HTMLElement).textContent = this.str('added', 'Added');
          this.listen(this.querySelector('.usa-atc-btn')!, 'click', () => this.add());
          this.onCleanup(() => this._t && clearTimeout(this._t));
        }

        add(): void {
          let item: unknown = {};
          try {
            item = JSON.parse(this.str('item', '{}'));
          } catch {
            item = { name: this.str('item', '') };
          }
          const cartSel = this.str('cart', '[data-cart]');
          const cart = document.querySelector(cartSel) as (HTMLElement & { add?: (i: unknown) => void }) | null;
          const from = (this.str('from', '') && document.querySelector(this.str('from', ''))) || this.closest('[data-product]')?.querySelector('img') || this;
          if (getEffect('fly-to-cart')) void playEffect(from as HTMLElement, 'fly-to-cart', { to: cart?.matches('usa-cart-drawer') ? `${cartSel} .usa-cd2-toggle` : cartSel });
          cart?.add?.(item);
          this.setAttribute('data-added', '');
          (this.querySelector('.usa-atc-live') as HTMLElement).textContent = `${this.str('added', 'Added')} to cart`;
          if (!this.reduced) this.motion(this.querySelector('.usa-atc-btn')!, [{ transform: 'scale(1)' }, { transform: 'scale(.92)', offset: 0.3 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
          if (this._t) clearTimeout(this._t);
          this._t = setTimeout(() => this.removeAttribute('data-added'), this.num('hold', 1600));
          this.emit('add', { item });
        }
      }
      return UsaAddToCart as unknown as CustomElementConstructor;
    },
    { id: 'add-to-cart', text: css }
  );
}
