'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var momentsUi = require('./moments-ui-Wb8gBRiX.cjs');

/** The badge's pop when the count goes up. */
const POP_FRAMES = [
    { transform: 'scale(1)' },
    { transform: 'scale(1.45)', offset: 0.35 },
    { transform: 'scale(.9)', offset: 0.65 },
    { transform: 'scale(1)' },
];
/** The text a badge shows: nothing at 0, the count, or `max+` past `max`. */
function badgeText(count, max) {
    if (count <= 0)
        return '';
    return count > max ? `${max}+` : String(count);
}
function defineCartBadge(tag = 'usa-cart-badge') {
    const ctor = base.defineElement(tag, Base => class CartBadge extends Base {
        static get observedAttributes() { return ['count', 'max', 'label', 'add-label', 'disabled']; }
        get count() { return Math.round(moments.bound(this.num('count', 0), 0, 9999, 0)); }
        set count(n) { this.setAttribute('count', String(Math.round(moments.bound(Number(n), 0, 9999, 0)))); }
        add(n = 1) {
            if (this.flag('disabled'))
                return this.count;
            const before = this.count;
            this.count = before + (Number.isFinite(n) ? Math.round(n) : 1);
            if (this.count > before)
                this._pop?.();
            this.emit('add', { count: this.count });
            return this.count;
        }
        changed() { this._sync?.(); }
        mount() {
            const root = moments.make('span', 'usa-moment usa-cart');
            const bag = moments.make('button', 'usa-cart-bag');
            bag.type = 'button';
            const icon = moments.make('span', 'usa-cart-icon');
            icon.setAttribute('aria-hidden', 'true');
            const badge = moments.make('span', 'usa-cart-count');
            badge.setAttribute('aria-hidden', 'true');
            bag.append(icon, badge);
            const plus = moments.make('button', 'usa-cart-add', '+');
            plus.type = 'button';
            const status = moments.make('span', 'usa-sr');
            status.setAttribute('role', 'status');
            root.append(bag, plus, status);
            this.append(root);
            let runs = [];
            this._pop = () => {
                runs.forEach((r) => r?.cancel());
                runs = [this.motion(badge, POP_FRAMES, { duration: 420, easing: 'ease-out' }),
                    this.motion(bag, [{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)', offset: 0.3 }, { transform: 'rotate(4deg)', offset: 0.6 }, { transform: 'rotate(0)' }], { duration: 420 })];
            };
            let last = -1;
            const sync = () => {
                const count = this.count, label = this.str('label', 'Cart');
                badge.textContent = badgeText(count, Math.round(moments.bound(this.num('max', 99), 1, 999, 99)));
                root.toggleAttribute('data-empty', count === 0);
                bag.setAttribute('aria-label', `${label}, ${count} ${count === 1 ? 'item' : 'items'}`);
                plus.setAttribute('aria-label', this.str('add-label', 'Add to cart'));
                bag.disabled = plus.disabled = this.flag('disabled');
                if (last >= 0 && count !== last)
                    status.textContent = `${count} ${count === 1 ? 'item' : 'items'} in ${label.toLowerCase()}`;
                last = count;
            };
            this._sync = sync;
            this.listen(plus, 'click', () => this.add(1));
            this.listen(bag, 'click', () => this.emit('open'));
            this.onCleanup(() => { runs.forEach((r) => r?.cancel()); root.remove(); this._sync = undefined; this._pop = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.badgeText = badgeText;
exports.defineCartBadge = defineCartBadge;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/cart-badge-B9j90whk.cjs.map