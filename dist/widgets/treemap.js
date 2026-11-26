import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { l as list, c as cleanColor, a as formatNumber } from '../chunks/kit-DugHPVcq.js';
import { n as numbers, r as rovingIndex } from '../chunks/kit-12-C5AMRg3h.js';
import { j as squarify } from '../chunks/kit-13-hC4WCTBH.js';
import { c as css } from '../chunks/parts-kit-13-CQI5zrN-.js';

const PALETTE = ['#4f46e5', '#0891b2', '#d97706', '#db2777', '#059669', '#7c3aed', '#ea580c', '#475569'];
function defineTreemap(tag = 'usa-treemap') {
    const ctor = defineElement(tag, Base => class Treemap extends Base {
        static get observedAttributes() { return ['values', 'labels', 'colors', 'label', 'unit', 'ratio']; }
        mount() {
            const values = numbers(this.str('values'), 60);
            const labels = list(this.str('labels'), 60);
            const colors = list(this.str('colors'), 60).map(cleanColor);
            const unit = this.str('unit');
            const ratio = Math.max(0.5, Math.min(4, this.num('ratio', 1.8)));
            const W = 100 * ratio, H = 100;
            const rects = squarify(values, W, H);
            const total = values.reduce((a, b) => a + b, 0) || 1;
            const root = make('div', 'usa-kit usa-tmap');
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
                const b = make('button', 'usa-tmap-tile');
                b.type = 'button';
                b.style.cssText = `left:${(r.x / W) * 100}%;top:${(r.y / H) * 100}%;width:${(r.w / W) * 100}%;height:${(r.h / H) * 100}%`;
                b.style.setProperty('--c', colors[i] || PALETTE[i % PALETTE.length]);
                b.style.setProperty('--i', String(order.indexOf(i)));
                const share = values[i] / total;
                const name = labels[i] || `#${i + 1}`;
                const small = (r.w / W) * (r.h / H) < 0.035;
                if (small)
                    b.setAttribute('data-small', '');
                b.append(make('span', 'usa-tmap-name', name), make('span', 'usa-tmap-val', `${formatNumber(values[i], 1)}${unit ? ` ${unit}` : ''} · ${formatNumber(share * 100, 1)}%`));
                b.setAttribute('aria-label', `${name}: ${formatNumber(values[i], 1)}${unit ? ` ${unit}` : ''}, ${formatNumber(share * 100, 1)}%`);
                b.title = b.getAttribute('aria-label') || '';
                b.tabIndex = tiles.length ? -1 : 0;
                this.listen(b, 'click', () => this.emit('select', { index: i, value: values[i], share }));
                tiles.push(b);
                root.append(b);
            }
            this.append(root);
            this.listen(root, 'keydown', (e) => {
                const k = tiles.indexOf(e.target);
                const to = rovingIndex(e.key, k, tiles.length);
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
    }, { id: 'parts-kit-13', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineTreemap };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/treemap.js.map