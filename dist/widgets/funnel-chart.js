import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { l as list, c as cleanColor, a as formatNumber, t as tween } from '../chunks/kit-DugHPVcq.js';
import { n as numbers } from '../chunks/kit-12-C5AMRg3h.js';
import { g as funnelRows } from '../chunks/kit-13-hC4WCTBH.js';
import { c as css } from '../chunks/parts-kit-13-CQI5zrN-.js';

function defineFunnelChart(tag = 'usa-funnel-chart') {
    const ctor = defineElement(tag, Base => class FunnelChart extends Base {
        static get observedAttributes() { return ['values', 'labels', 'colors', 'label', 'unit', 'conversion-label']; }
        mount() {
            const values = numbers(this.str('values'), 12);
            const labels = list(this.str('labels'), 12);
            const colors = list(this.str('colors'), 12).map(cleanColor);
            const unit = this.str('unit');
            const rows = funnelRows(values);
            const pct = (f) => `${formatNumber(f * 100, 1)}%`;
            const root = make('figure', 'usa-kit usa-funnel');
            root.setAttribute('aria-label', this.str('label', 'Funnel'));
            root.toggleAttribute('data-static', this.reduced);
            const ol = make('ol', 'usa-funnel-list');
            const nums = [];
            values.forEach((v, i) => {
                const li = make('li', 'usa-funnel-stage');
                li.style.setProperty('--w', String(Math.max(0.06, rows[i].share)));
                li.style.setProperty('--next', String(Math.max(0.06, rows[i + 1]?.share ?? rows[i].share * 0.86)));
                li.style.setProperty('--i', String(i));
                if (colors[i])
                    li.style.setProperty('--c', colors[i]);
                const b = make('button', 'usa-funnel-bar');
                b.type = 'button';
                const name = make('span', 'usa-funnel-name', labels[i] || `#${i + 1}`);
                const num = make('strong', 'usa-funnel-num', formatNumber(v));
                nums.push(num);
                const share = make('span', 'usa-funnel-share', i ? pct(rows[i].overall) : '100%');
                b.append(name, num, share);
                b.setAttribute('aria-label', `${labels[i] || `#${i + 1}`}: ${formatNumber(v)}${unit ? ` ${unit}` : ''}, ${pct(rows[i].overall)}`);
                li.append(b);
                if (i < values.length - 1) {
                    const conv = make('span', 'usa-funnel-conv', this.str('conversion-label', '{p} continue').replace('{p}', pct(rows[i + 1].step)));
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
                values.forEach((v, i) => stops.push(tween(0, v, 900 + i * 120, (x) => { nums[i].textContent = formatNumber(Number.isInteger(v) ? Math.round(x) : x, 1); }, this)));
            });
            this.onCleanup(() => { stops.forEach((s) => s()); root.remove(); });
        }
    }, { id: 'parts-kit-13', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineFunnelChart };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/funnel-chart.js.map