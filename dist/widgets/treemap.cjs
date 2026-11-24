'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit12 = require('../chunks/kit-12-B4H_NaC_.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var partsKit13 = require('../chunks/parts-kit-13-C0a7-R_a.cjs');

const PALETTE = ['#4f46e5', '#0891b2', '#d97706', '#db2777', '#059669', '#7c3aed', '#ea580c', '#475569'];
function defineTreemap(tag = 'usa-treemap') {
    const ctor = base.defineElement(tag, Base => class Treemap extends Base {
        static get observedAttributes() { return ['values', 'labels', 'colors', 'label', 'unit', 'ratio']; }
        mount() {
            const values = kit12.numbers(this.str('values'), 60);
            const labels = kit.list(this.str('labels'), 60);
            const colors = kit.list(this.str('colors'), 60).map(kit.cleanColor);
            const unit = this.str('unit');
            const ratio = Math.max(0.5, Math.min(4, this.num('ratio', 1.8)));
            const W = 100 * ratio, H = 100;
            const rects = kit13.squarify(values, W, H);
            const total = values.reduce((a, b) => a + b, 0) || 1;
            const root = moments.make('div', 'usa-kit usa-tmap');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', this.str('label', 'Treemap'));
            root.style.setProperty('--ratio', String(ratio));
            root.toggleAttribute('data-static', this.reduced);
            const order = values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(([, i]) => i);
            // reading order: top to bottom, then left to right
            const reading = values.map((_, i) => i).filter((i) => rects[i].w > 0).sort((a, b) => rects[a].y - rects[b].y || rects[a].x - rects[b].x);
            const tiles = [];
            for (const i of reading) {
                const r = rects[i];
                const b = moments.make('button', 'usa-tmap-tile');
                b.type = 'button';
                b.style.cssText = `left:${(r.x / W) * 100}%;top:${(r.y / H) * 100}%;width:${(r.w / W) * 100}%;height:${(r.h / H) * 100}%`;
                b.style.setProperty('--c', colors[i] || PALETTE[i % PALETTE.length]);
                b.style.setProperty('--i', String(order.indexOf(i)));
                const share = values[i] / total;
                const name = labels[i] || `#${i + 1}`;
                const small = (r.w / W) * (r.h / H) < 0.035;
                if (small)
                    b.setAttribute('data-small', '');
                b.append(moments.make('span', 'usa-tmap-name', name), moments.make('span', 'usa-tmap-val', `${kit.formatNumber(values[i], 1)}${unit ? ` ${unit}` : ''} · ${kit.formatNumber(share * 100, 1)}%`));
                b.setAttribute('aria-label', `${name}: ${kit.formatNumber(values[i], 1)}${unit ? ` ${unit}` : ''}, ${kit.formatNumber(share * 100, 1)}%`);
                b.title = b.getAttribute('aria-label') || '';
                b.tabIndex = tiles.length ? -1 : 0;
                this.listen(b, 'click', () => this.emit('select', { index: i, value: values[i], share }));
                tiles.push(b);
                root.append(b);
            }
            this.append(root);
            this.listen(root, 'keydown', (e) => {
                const k = tiles.indexOf(e.target);
                const to = kit12.rovingIndex(e.key, k, tiles.length);
                if (k < 0 || to < 0)
                    return;
                e.preventDefault();
                tiles[k].tabIndex = -1;
                tiles[to].tabIndex = 0;
                tiles[to].focus();
            });
            let shown = false;
            this.inView((v) => { if (v && !shown) {
                shown = true;
                root.setAttribute('data-in', '');
            } });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'parts-kit-13', text: partsKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTreemap = defineTreemap;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/treemap.cjs.map