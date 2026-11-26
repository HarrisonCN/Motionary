'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit12 = require('../chunks/kit-12-B4H_NaC_.cjs');
var dataKit15 = require('../chunks/data-kit-15-IPVVtUNE.cjs');

function defineBulletChart(tag = 'usa-bullet-chart') {
    const ctor = base.defineElement(tag, Base => class BulletChart extends Base {
        static get observedAttributes() {
            return ['values', 'targets', 'labels', 'ranges', 'max', 'colors', 'unit', 'label', 'target-label', 'met-label', 'missed-label'];
        }
        mount() {
            const values = kit12.numbers(this.str('values'), 16);
            const targets = kit12.numbers(this.str('targets'), 16);
            const labels = kit.list(this.str('labels'), 16);
            const colors = kit.list(this.str('colors'), 16).map(kit.cleanColor);
            const unit = this.str('unit');
            const max = this.num('max', 0) > 0 ? this.num('max', 0) : Math.max(1, ...values, ...targets);
            let ranges = kit12.numbers(this.str('ranges') || '0.5,0.8,1', 5);
            if (ranges.some((r) => r > 1))
                ranges = ranges.map((r) => r / max);
            ranges = ranges.map((r) => Math.min(1, r)).sort((a, b) => a - b);
            const u = (v) => `${kit.formatNumber(v, 1)}${unit ? ` ${unit}` : ''}`;
            const root = moments.make('figure', 'usa-kit usa-bullet');
            root.toggleAttribute('data-static', this.reduced);
            const title = this.str('label', 'Results');
            root.setAttribute('aria-label', title);
            const ul = moments.make('ul', 'usa-bullet-list');
            values.forEach((v, i) => {
                const t = targets[i] ?? 0;
                const met = t > 0 && v >= t;
                const li = moments.make('li', 'usa-bullet-item');
                const b = moments.make('button', 'usa-bullet-row');
                b.type = 'button';
                b.style.setProperty('--i', String(i));
                b.style.setProperty('--v', String(Math.min(1, v / max)));
                b.style.setProperty('--t', String(Math.min(1, t / max)));
                if (colors[i])
                    b.style.setProperty('--c', colors[i]);
                const name = moments.make('span', 'usa-bullet-name', labels[i] || `#${i + 1}`);
                const track = moments.make('span', 'usa-bullet-track');
                track.setAttribute('aria-hidden', 'true');
                ranges.forEach((r, k) => {
                    const band = moments.make('i', 'usa-bullet-band');
                    band.style.setProperty('--r', String(r));
                    band.style.setProperty('--k', String(k));
                    track.append(band);
                });
                track.append(moments.make('i', 'usa-bullet-bar'));
                if (t > 0)
                    track.append(moments.make('i', 'usa-bullet-target'));
                const num = moments.make('span', 'usa-bullet-num', kit.formatNumber(v, 1));
                if (met)
                    num.append(moments.make('i', 'usa-bullet-met', '✓'));
                b.append(name, track, num);
                const targetText = t > 0 ? `, ${this.str('target-label', 'target {t}').replace('{t}', u(t))}, ${met ? this.str('met-label', 'met') : this.str('missed-label', 'below target')}` : '';
                b.setAttribute('aria-label', `${labels[i] || `#${i + 1}`}: ${u(v)}${targetText}`);
                this.listen(b, 'click', () => this.emit('select', { index: i, value: v, target: t, met }));
                li.append(b);
                ul.append(li);
            });
            const cap = moments.make('figcaption', 'usa-bullet-title', title);
            root.append(cap, ul);
            this.append(root);
            this.inView((vis) => { if (vis)
                root.setAttribute('data-in', ''); });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'data-kit-15', text: dataKit15.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineBulletChart = defineBulletChart;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/bullet-chart.cjs.map