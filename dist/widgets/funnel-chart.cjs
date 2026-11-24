'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit12 = require('../chunks/kit-12-B4H_NaC_.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var partsKit13 = require('../chunks/parts-kit-13-C0a7-R_a.cjs');

function defineFunnelChart(tag = 'usa-funnel-chart') {
    const ctor = base.defineElement(tag, Base => class FunnelChart extends Base {
        static get observedAttributes() { return ['values', 'labels', 'colors', 'label', 'unit', 'conversion-label']; }
        mount() {
            const values = kit12.numbers(this.str('values'), 12);
            const labels = kit.list(this.str('labels'), 12);
            const colors = kit.list(this.str('colors'), 12).map(kit.cleanColor);
            const unit = this.str('unit');
            const rows = kit13.funnelRows(values);
            const pct = (f) => `${kit.formatNumber(f * 100, 1)}%`;
            const root = moments.make('figure', 'usa-kit usa-funnel');
            root.setAttribute('aria-label', this.str('label', 'Funnel'));
            root.toggleAttribute('data-static', this.reduced);
            const ol = moments.make('ol', 'usa-funnel-list');
            const nums = [];
            values.forEach((v, i) => {
                const li = moments.make('li', 'usa-funnel-stage');
                li.style.setProperty('--w', String(Math.max(0.06, rows[i].share)));
                li.style.setProperty('--next', String(Math.max(0.06, rows[i + 1]?.share ?? rows[i].share * 0.86)));
                li.style.setProperty('--i', String(i));
                if (colors[i])
                    li.style.setProperty('--c', colors[i]);
                const b = moments.make('button', 'usa-funnel-bar');
                b.type = 'button';
                const name = moments.make('span', 'usa-funnel-name', labels[i] || `#${i + 1}`);
                const num = moments.make('strong', 'usa-funnel-num', kit.formatNumber(v));
                nums.push(num);
                const share = moments.make('span', 'usa-funnel-share', i ? pct(rows[i].overall) : '100%');
                b.append(name, num, share);
                b.setAttribute('aria-label', `${labels[i] || `#${i + 1}`}: ${kit.formatNumber(v)}${unit ? ` ${unit}` : ''}, ${pct(rows[i].overall)}`);
                li.append(b);
                if (i < values.length - 1) {
                    const conv = moments.make('span', 'usa-funnel-conv', this.str('conversion-label', '{p} continue').replace('{p}', pct(rows[i + 1].step)));
                    li.append(conv);
                }
                this.listen(b, 'click', () => this.emit('select', { index: i, value: v, step: rows[i].step, overall: rows[i].overall }));
                ol.append(li);
            });
            root.append(ol);
            this.append(root);
            const stops = [];
            let shown = false;
            this.inView((vis) => {
                if (!vis || shown)
                    return;
                shown = true;
                root.setAttribute('data-in', '');
                values.forEach((v, i) => stops.push(kit.tween(0, v, 900 + i * 120, (x) => { nums[i].textContent = kit.formatNumber(Number.isInteger(v) ? Math.round(x) : x, 1); }, this)));
            });
            this.onCleanup(() => { stops.forEach((s) => s()); root.remove(); });
        }
    }, { id: 'parts-kit-13', text: partsKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineFunnelChart = defineFunnelChart;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/funnel-chart.cjs.map