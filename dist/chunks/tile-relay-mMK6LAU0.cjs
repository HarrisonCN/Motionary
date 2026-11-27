'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments$1 = require('./moments-eoZA2npZ.cjs');
var moments = require('./moments-Rge1M2_3.cjs');

/** Clockwise order of the outer ring of an n×n grid (row-major indices). */
function relayOrder(n) {
    if (n <= 1)
        return [0];
    const out = [];
    for (let c = 0; c < n; c++)
        out.push(c);
    for (let r = 1; r < n; r++)
        out.push(r * n + n - 1);
    for (let c = n - 2; c >= 0; c--)
        out.push((n - 1) * n + c);
    for (let r = n - 2; r >= 1; r--)
        out.push(r * n);
    return out;
}
function defineTileRelay(tag = 'usa-tile-relay') {
    const ctor = base.defineElement(tag, Base => class TileRelay extends Base {
        static get observedAttributes() { return ['size', 'duration', 'label', 'paused']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        mount() {
            const n = this.num('size', 2) >= 3 ? 3 : 2;
            const lap = moments$1.bound(this.num('duration', 1400), 600, 6000, 1400);
            const order = relayOrder(n);
            const root = moments$1.make('div', 'usa-moment usa-relay');
            root.setAttribute('role', 'status');
            root.style.setProperty('--n', String(n));
            root.style.setProperty('--lap', `${lap}ms`);
            root.style.setProperty('--count', String(order.length));
            const grid = moments$1.make('span', 'usa-relay-grid');
            grid.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < n * n; i++) {
                const tile = moments$1.make('i', 'usa-relay-tile');
                const k = order.indexOf(i);
                if (k < 0)
                    tile.dataset.core = '';
                else
                    tile.style.setProperty('--k', String(k));
                grid.append(tile);
            }
            root.append(grid, moments$1.make('span', 'usa-sr', this.str('label', 'Loading')));
            root.toggleAttribute('data-static', this.reduced);
            root.toggleAttribute('data-paused', this.paused);
            this.append(root);
            this.inView((visible) => root.toggleAttribute('data-offscreen', !visible));
            this.onCleanup(() => root.remove());
        }
    }, { id: 'moments', text: moments.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTileRelay = defineTileRelay;
exports.relayOrder = relayOrder;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/tile-relay-mMK6LAU0.cjs.map