import { defineElement, type UsaElement } from '../base';
import css from './cart-drawer.css?raw';

export interface CartItem {
  id?: string;
  name: string;
  price: number;
  qty?: number;
  img?: string;
}

/**
 * `<usa-cart-drawer>` (7.3) — a cart button with a count badge plus a drawer
 * that slides in from the side. `add(item)` slides the line in (or bumps its
 * quantity), the badge bumps and the total rolls; lines remove with a collapse.
 * `open` / `close()` / `toggle()`; Esc and the backdrop close it; focus moves
 * into the panel and back. `currency` (default "$"), `label`. Events
 * `usa:change` (`{ items, total }`), `usa:open`, `usa:close`. The panel is a
 * labelled `dialog`; the badge count is announced. Reduced motion: no slide,
 * bump or roll.
 */
export interface UsaCartDrawerElement extends UsaElement {
  items: CartItem[];
  readonly total: number;
  readonly count: number;
  open: boolean;
  add(item: CartItem): void;
  removeItem(id: string): void;
  toggle(force?: boolean): void;
}

/** Cart total (7.3). */
export const cartTotal = (items: CartItem[]): number => Math.round(items.reduce((a, i) => a + (Number(i.price) || 0) * (i.qty || 1), 0) * 100) / 100;

export function defineCartDrawer(tag = 'usa-cart-drawer'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaCartDrawer extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'items', 'currency'];
        }
        private _items: CartItem[] = [];
        private _open = false;
        private _ret: HTMLElement | null = null;

        get items(): CartItem[] {
          return this._items.map((i) => ({ ...i }));
        }
        set items(v: CartItem[]) {
          this._items = (v || []).map((i) => ({ ...i, id: i.id || i.name, qty: i.qty || 1 }));
          if (this.isConnected) this.render(null);
        }
        get total(): number {
          return cartTotal(this._items);
        }
        get count(): number {
          return this._items.reduce((a, i) => a + (i.qty || 1), 0);
        }
        get open(): boolean {
          return this._open;
        }
        set open(v: boolean) {
          this.toggle(!!v);
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const label = this.str('label', 'Cart');
          this.insertAdjacentHTML('afterbegin', `<button type="button" class="usa-cd2-toggle" data-usa-part aria-haspopup="dialog" aria-expanded="false"><span aria-hidden="true">🛒</span><b class="usa-cd2-badge" aria-live="polite"></b></button><div class="usa-cd2-backdrop" data-usa-part hidden></div><div class="usa-cd2-panel" data-usa-part role="dialog" aria-modal="true" hidden tabindex="-1"><header><strong></strong><button type="button" class="usa-cd2-close" aria-label="Close">×</button></header><ul class="usa-cd2-list"></ul><p class="usa-cd2-empty">Your cart is empty</p><footer><span>Total</span><b class="usa-cd2-total"></b></footer></div>`);
          (this.querySelector('.usa-cd2-panel strong') as HTMLElement).textContent = label;
          this.querySelector('.usa-cd2-panel')!.setAttribute('aria-label', label);
          this.listen(this.querySelector('.usa-cd2-toggle')!, 'click', () => this.toggle());
          this.listen(this.querySelector('.usa-cd2-close')!, 'click', () => this.toggle(false));
          this.listen(this.querySelector('.usa-cd2-backdrop')!, 'click', () => this.toggle(false));
          this.listen(this, 'keydown', (e: KeyboardEvent) => e.key === 'Escape' && this._open && this.toggle(false));
          this.listen(this.querySelector('.usa-cd2-list')!, 'click', (e: Event) => {
            const b = (e.target as HTMLElement).closest('[data-rm]') as HTMLElement | null;
            if (b) this.removeItem(b.dataset.rm!);
          });
          if (!this._items.length) {
            try {
              const init = JSON.parse(this.str('items', '[]'));
              if (Array.isArray(init)) this._items = init.map((i: CartItem) => ({ ...i, id: i.id || i.name, qty: i.qty || 1 }));
            } catch {
              /* ignore bad JSON */
            }
          }
          this.render(null);
        }

        toggle(force?: boolean): void {
          const on = force ?? !this._open;
          if (on === this._open) return;
          this._open = on;
          const panel = this.querySelector('.usa-cd2-panel') as HTMLElement;
          const bd = this.querySelector('.usa-cd2-backdrop') as HTMLElement;
          this.querySelector('.usa-cd2-toggle')!.setAttribute('aria-expanded', String(on));
          this.toggleAttribute('data-open', on);
          if (on) {
            this._ret = (document.activeElement as HTMLElement) || null;
            panel.hidden = bd.hidden = false;
            if (!this.reduced) {
              this.motion(panel, [{ transform: 'translateX(105%)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1)' });
              this.motion(bd, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
            }
            panel.focus();
            this.emit('open', {});
          } else {
            const done = () => {
              if (!this._open) panel.hidden = bd.hidden = true;
            };
            const a = this.reduced ? null : this.motion(panel, [{ transform: 'none' }, { transform: 'translateX(105%)' }], { duration: 260, easing: 'ease-in' });
            if (a) a.finished.then(done, done);
            else done();
            this._ret?.focus?.();
            this.emit('close', {});
          }
        }

        add(item: CartItem): void {
          const id = item.id || item.name;
          const hit = this._items.find((i) => i.id === id);
          if (hit) hit.qty = (hit.qty || 1) + (item.qty || 1);
          else this._items.push({ ...item, id, qty: item.qty || 1 });
          this.render(id);
        }

        removeItem(id: string): void {
          const li = Array.from(this.querySelectorAll<HTMLElement>('.usa-cd2-item')).find((n) => n.dataset.id === id) || null;
          this._items = this._items.filter((i) => i.id !== id);
          const a = li && !this.reduced ? this.motion(li, [{ opacity: 1, maxHeight: `${li.offsetHeight}px` }, { opacity: 0, maxHeight: '0px', paddingTop: '0', paddingBottom: '0' }], { duration: 260, fill: 'forwards' }) : null;
          if (a) a.finished.then(() => this.render(null), () => this.render(null));
          else this.render(null);
        }

        private render(changed: string | null): void {
          const cur = this.str('currency', '$');
          const list = this.querySelector('.usa-cd2-list') as HTMLElement;
          const old = new Map(Array.from(list.children).map((li) => [(li as HTMLElement).dataset.id, li as HTMLElement]));
          for (const it of this._items) {
            let li = old.get(it.id!);
            old.delete(it.id!);
            const isNew = !li;
            if (!li) {
              li = document.createElement('li');
              li.className = 'usa-cd2-item';
              li.dataset.id = it.id!;
              li.innerHTML = `${it.img ? '<img alt="">' : '<i aria-hidden="true"></i>'}<span class="usa-cd2-name"></span><span class="usa-cd2-qty"></span><span class="usa-cd2-price"></span><button type="button" class="usa-cd2-rm">×</button>`;
              if (it.img) li.querySelector('img')!.setAttribute('src', it.img);
            }
            (li.querySelector('.usa-cd2-name') as HTMLElement).textContent = it.name;
            (li.querySelector('.usa-cd2-qty') as HTMLElement).textContent = `×${it.qty || 1}`;
            (li.querySelector('.usa-cd2-price') as HTMLElement).textContent = `${cur}${((it.price || 0) * (it.qty || 1)).toFixed(2)}`;
            const rm = li.querySelector('.usa-cd2-rm') as HTMLElement;
            rm.dataset.rm = it.id!;
            rm.setAttribute('aria-label', `Remove ${it.name}`);
            list.appendChild(li);
            if (changed === it.id && !this.reduced) this.motion(li, isNew ? [{ transform: 'translateX(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }] : [{ background: 'rgba(124,92,255,.18)' }, { background: 'transparent' }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
          }
          old.forEach((li) => li.remove());
          const n = this.count;
          const badge = this.querySelector('.usa-cd2-badge') as HTMLElement;
          badge.textContent = n ? String(n) : '';
          this.querySelector('.usa-cd2-toggle')!.setAttribute('aria-label', `${this.str('label', 'Cart')}, ${n} item${n === 1 ? '' : 's'}`);
          if (changed && !this.reduced) this.motion(badge, [{ transform: 'scale(1)' }, { transform: 'scale(1.5)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
          (this.querySelector('.usa-cd2-empty') as HTMLElement).hidden = !!this._items.length;
          const tot = this.querySelector('.usa-cd2-total') as HTMLElement;
          const to = this.total;
          const from = Number(tot.dataset.v || 0);
          tot.dataset.v = String(to);
          if (this.reduced || from === to || typeof requestAnimationFrame !== 'function') tot.textContent = `${cur}${to.toFixed(2)}`;
          else {
            const t0 = performance.now();
            const f = (now: number) => {
              const k = Math.min(1, (now - t0) / 500);
              tot.textContent = `${cur}${(from + (to - from) * (1 - Math.pow(1 - k, 3))).toFixed(2)}`;
              if (k < 1) requestAnimationFrame(f);
            };
            requestAnimationFrame(f);
          }
          this.emit('change', { items: this.items, total: to });
        }
      }
      return UsaCartDrawer as unknown as CustomElementConstructor;
    },
    { id: 'cart-drawer', text: css }
  );
}
