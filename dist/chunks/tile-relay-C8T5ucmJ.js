import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { b as bound, m as make } from './moments-Cg_NlOYG.js';
import { c as css } from './moments-D7dR6K16.js';

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
    const ctor = defineElement(tag, Base => class TileRelay extends Base {
        static get observedAttributes() { return ['size', 'duration', 'label', 'paused']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        mount() {
            const n = this.num('size', 2) >= 3 ? 3 : 2;
            const lap = bound(this.num('duration', 1400), 600, 6000, 1400);
            const order = relayOrder(n);
            const root = make('div', 'usa-moment usa-relay');
            root.setAttribute('role', 'status');
            root.style.setProperty('--n', String(n));
            root.style.setProperty('--lap', `${lap}ms`);
            root.style.setProperty('--count', String(order.length));
            const grid = make('span', 'usa-relay-grid');
            grid.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < n * n; i++) {
                const tile = make('i', 'usa-relay-tile');
                const k = order.indexOf(i);
                if (k < 0)
                    tile.dataset.core = '';
                else
                    tile.style.setProperty('--k', String(k));
                grid.append(tile);
            }
            root.append(grid, make('span', 'usa-sr', this.str('label', 'Loading')));
            root.toggleAttribute('data-static', this.reduced);
            root.toggleAttribute('data-paused', this.paused);
            this.append(root);
            this.inView((visible) => root.toggleAttribute('data-offscreen', !visible));
            this.onCleanup(() => root.remove());
        }
    }, { id: 'moments', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineTileRelay as d, relayOrder as r };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/tile-relay-C8T5ucmJ.js.map