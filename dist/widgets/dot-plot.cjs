'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var kit15 = require('../chunks/kit-15-D1Ovwhys.cjs');
var dataKit15 = require('../chunks/data-kit-15-IPVVtUNE.cjs');

function defineDotPlot(tag = 'usa-dot-plot') {
    const ctor = base.defineElement(tag, Base => class DotPlot extends Base {
        static get observedAttributes() { return ['values', 'compare', 'labels', 'series', 'min', 'max', 'unit', 'label']; }
        mount() {
            const values = kit15.signedNumbers(this.str('values'), 20);
            const hasCompare = !!this.str('compare').trim();
            const compare = kit15.signedNumbers(this.str('compare'), 20);
            const labels = kit.list(this.str('labels'), 20);
            const series = kit.list(this.str('series'), 2);
            const unit = this.str('unit');
            const all = [...values, ...(hasCompare ? compare.slice(0, values.length) : [])];
            const ticks = kit13.niceTicks(this.num('min', Math.min(0, ...all)), this.num('max', Math.max(1, ...all)), 5);
            const lo = ticks[0];
            const hi = ticks[ticks.length - 1];
            const at = (v) => (hi === lo ? 0.5 : Math.max(0, Math.min(1, (v - lo) / (hi - lo))));
            const u = (v) => `${kit.formatNumber(v, 1)}${unit ? ` ${unit}` : ''}`;
            const root = moments.make('figure', 'usa-kit usa-dots');
            root.toggleAttribute('data-static', this.reduced);
            const title = this.str('label', 'Comparison');
            const cap = moments.make('figcaption', 'usa-dots-title', title);
            const legend = moments.make('p', 'usa-dots-legend');
            legend.setAttribute('aria-hidden', 'true');
            if (hasCompare) {
                legend.append(moments.make('i', 'usa-dots-key', ''), moments.make('span', '', series[0] || 'A'), moments.make('i', 'usa-dots-key usa-dots-key-b', ''), moments.make('span', '', series[1] || 'B'));
            }
            const grid = moments.make('div', 'usa-dots-grid');
            grid.setAttribute('aria-hidden', 'true');
            for (const t of ticks) {
                const line = moments.make('span', 'usa-dots-tick', kit.formatNumber(t, 1));
                line.style.setProperty('--x', String(at(t)));
                grid.append(line);
            }
            const ul = moments.make('ul', 'usa-dots-list');
            ul.setAttribute('aria-label', title);
            values.forEach((v, i) => {
                const c = hasCompare ? compare[i] ?? 0 : null;
                const li = moments.make('li');
                const b = moments.make('button', 'usa-dots-row');
                b.type = 'button';
                b.style.setProperty('--i', String(i));
                b.style.setProperty('--a', String(at(v)));
                if (c !== null) {
                    b.style.setProperty('--b', String(at(c)));
                    b.style.setProperty('--from', String(Math.min(at(v), at(c))));
                    b.style.setProperty('--to', String(Math.max(at(v), at(c))));
                }
                const track = moments.make('span', 'usa-dots-track');
                track.setAttribute('aria-hidden', 'true');
                if (c !== null)
                    track.append(moments.make('i', 'usa-dots-gap'));
                track.append(moments.make('i', 'usa-dots-dot'));
                if (c !== null)
                    track.append(moments.make('i', 'usa-dots-dot usa-dots-dot-b'));
                b.append(moments.make('span', 'usa-dots-name', labels[i] || `#${i + 1}`), track);
                const both = c !== null ? `${series[0] || 'A'} ${u(v)}, ${series[1] || 'B'} ${u(c)}` : u(v);
                b.setAttribute('aria-label', `${labels[i] || `#${i + 1}`}: ${both}`);
                this.listen(b, 'click', () => this.emit('select', { index: i, value: v, compare: c }));
                li.append(b);
                ul.append(li);
            });
            const plot = moments.make('div', 'usa-dots-plot');
            plot.append(grid, ul);
            root.append(cap);
            if (hasCompare)
                root.append(legend);
            root.append(plot);
            this.append(root);
            this.inView((vis) => { if (vis)
                root.setAttribute('data-in', ''); });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'data-kit-15', text: dataKit15.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineDotPlot = defineDotPlot;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/dot-plot.cjs.map