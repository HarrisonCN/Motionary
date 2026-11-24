import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { bound, make } from './moments';
import css from './moments-ui.css?raw';

/** The badge's pop when the count goes up. */
export const POP_FRAMES: Keyframe[] = [
  { transform: 'scale(1)' },
  { transform: 'scale(1.45)', offset: 0.35 },
  { transform: 'scale(.9)', offset: 0.65 },
  { transform: 'scale(1)' },
];

/** The text a badge shows: nothing at 0, the count, or `max+` past `max`. */
export function badgeText(count: number, max: number): string {
  if (count <= 0) return '';
  return count > max ? `${max}+` : String(count);
}

/**
 * A bag button with a count badge and an add button beside it. Adding pops the badge and gives the bag a small nudge.
 * Both are native buttons; the bag's accessible name carries the count ("Cart, 2 items"), and a polite live region
 * announces each change. The element only counts: the page decides what adding means.
 *
 * Attributes: `count` (0–9999, 0), `max` (shown as `max+` beyond it, 1–999, 99), `label` (Cart), `add-label`
 * (Add to cart), `disabled`. Method `add(n = 1)`. Events `usa:add` ({ count }) and `usa:open` (no detail, the bag).
 */
export interface UsaCartBadgeElement extends UsaElement {
  count: number;
  add(n?: number): number;
}

export function defineCartBadge(tag = 'usa-cart-badge'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class CartBadge extends Base {
    static get observedAttributes(): string[] { return ['count', 'max', 'label', 'add-label', 'disabled']; }
    private _sync?: () => void;
    private _pop?: () => void;
    get count(): number { return Math.round(bound(this.num('count', 0), 0, 9999, 0)); }
    set count(n: number) { this.setAttribute('count', String(Math.round(bound(Number(n), 0, 9999, 0)))); }
    add(n = 1): number {
      if (this.flag('disabled')) return this.count;
      const before = this.count;
      this.count = before + (Number.isFinite(n) ? Math.round(n) : 1);
      if (this.count > before) this._pop?.();
      this.emit('add', { count: this.count });
      return this.count;
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('span', 'usa-moment usa-cart');
      const bag = make('button', 'usa-cart-bag');
      bag.type = 'button';
      const icon = make('span', 'usa-cart-icon');
      icon.setAttribute('aria-hidden', 'true');
      const badge = make('span', 'usa-cart-count');
      badge.setAttribute('aria-hidden', 'true');
      bag.append(icon, badge);
      const plus = make('button', 'usa-cart-add', '+');
      plus.type = 'button';
      const status = make('span', 'usa-sr');
      status.setAttribute('role', 'status');
      root.append(bag, plus, status);
      this.append(root);
      let runs: (Animation | null)[] = [];
      this._pop = () => {
        runs.forEach((r) => r?.cancel());
        runs = [this.motion(badge, POP_FRAMES, { duration: 420, easing: 'ease-out' }),
          this.motion(bag, [{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)', offset: 0.3 }, { transform: 'rotate(4deg)', offset: 0.6 }, { transform: 'rotate(0)' }], { duration: 420 })];
      };
      let last = -1;
      const sync = () => {
        const count = this.count, label = this.str('label', 'Cart');
        badge.textContent = badgeText(count, Math.round(bound(this.num('max', 99), 1, 999, 99)));
        root.toggleAttribute('data-empty', count === 0);
        bag.setAttribute('aria-label', `${label}, ${count} ${count === 1 ? 'item' : 'items'}`);
        plus.setAttribute('aria-label', this.str('add-label', 'Add to cart'));
        bag.disabled = plus.disabled = this.flag('disabled');
        if (last >= 0 && count !== last) status.textContent = `${count} ${count === 1 ? 'item' : 'items'} in ${label.toLowerCase()}`;
        last = count;
      };
      this._sync = sync;
      this.listen(plus, 'click', () => this.add(1));
      this.listen(bag, 'click', () => this.emit('open'));
      this.onCleanup(() => { runs.forEach((r) => r?.cancel()); root.remove(); this._sync = undefined; this._pop = undefined; });
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
