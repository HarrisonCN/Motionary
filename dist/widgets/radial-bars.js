import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { l as list, c as cleanColor, a as formatNumber } from '../chunks/kit-DugHPVcq.js';
import { n as numbers } from '../chunks/kit-12-C5AMRg3h.js';
import { a as arcDash } from '../chunks/kit-15-gywnm88n.js';
import { c as css } from '../chunks/data-kit-15-BWDqo1L6.js';

const SVG = 'http://www.w3.org/2000/svg';
const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f97316'];
function defineRadialBars(tag = 'usa-radial-bars') {
    const ctor = defineElement(tag, Base => class RadialBars extends Base {
        static get observedAttributes() { return ['values', 'max', 'labels', 'colors', 'unit', 'label', 'size']; }
        mount() {
            const values = numbers(this.str('values'), 8);
            const maxes = numbers(this.str('max'), 8);
            const labels = list(this.str('labels'), 8);
            const colors = list(this.str('colors'), 8).map(cleanColor);
            const unit = this.str('unit');
            const maxOf = (i) => maxes[i] || maxes[0] || 100;
            const root = make('figure', 'usa-kit usa-rbars');
            root.toggleAttribute('data-static', this.reduced);
            root.style.setProperty('--usa-rbars-size', `${Math.max(120, Math.min(480, this.num('size', 220)))}px`);
            const name = this.str('label', 'Progress');
            const svg = document.createElementNS(SVG, 'svg');
            svg.setAttribute('viewBox', '0 0 220 220');
            svg.setAttribute('class', 'usa-rbars-svg');
            svg.setAttribute('role', 'img');
            const text = (v, i) => `${formatNumber(v, 1)}${unit ? ` ${unit}` : ''} / ${formatNumber(maxOf(i), 1)}`;
            svg.setAttribute('aria-label', `${name}: ${values.map((v, i) => `${labels[i] || `#${i + 1}`} ${text(v, i)}`).join(', ')}`);
            const n = Math.max(1, values.length);
            const width = Math.max(6, Math.min(18, 84 / n - 4));
            values.forEach((v, i) => {
                const r = 100 - width / 2 - i * (width + 4);
                const d = arcDash(v / maxOf(i), r);
                const g = document.createElementNS(SVG, 'g');
                g.setAttribute('class', 'usa-rbars-ring');
                g.style.setProperty('--c', colors[i] || PALETTE[i % PALETTE.length]);
                g.style.setProperty('--i', String(i));
                for (const cls of ['usa-rbars-track', 'usa-rbars-arc']) {
                    const c = document.createElementNS(SVG, 'circle');
                    c.setAttribute('class', cls);
                    c.setAttribute('cx', '110');
                    c.setAttribute('cy', '110');
                    c.setAttribute('r', String(r));
                    c.setAttribute('transform', 'rotate(135 110 110)');
                    c.style.strokeWidth = `${width}px`;
                    c.style.setProperty('--circ', `${d.circumference}px`);
                    c.style.setProperty('--on', `${cls === 'usa-rbars-arc' ? d.on : d.track}px`);
                    g.append(c);
                }
                svg.append(g);
            });
            const centre = make('figcaption', 'usa-rbars-name', name);
            const plot = make('div', 'usa-rbars-plot');
            plot.append(svg, centre);
            const legend = make('ul', 'usa-rbars-legend');
            const rows = values.map((v, i) => {
                const li = make('li');
                const b = make('button', 'usa-rbars-key');
                b.type = 'button';
                b.style.setProperty('--c', colors[i] || PALETTE[i % PALETTE.length]);
                b.append(make('i', 'usa-rbars-dot'), make('span', 'usa-rbars-label', labels[i] || `#${i + 1}`), make('strong', 'usa-rbars-val', `${formatNumber(Math.round((v / maxOf(i)) * 100))}%`));
                b.setAttribute('aria-label', `${labels[i] || `#${i + 1}`}: ${text(v, i)}`);
                b.setAttribute('aria-pressed', 'false');
                li.append(b);
                legend.append(li);
                this.listen(b, 'click', () => {
                    const on = b.getAttribute('aria-pressed') !== 'true';
                    rows.forEach((x, k) => x.setAttribute('aria-pressed', String(on && k === i)));
                    Array.from(svg.children).forEach((g, k) => g.toggleAttribute('data-dim', on && k !== i));
                    this.emit('select', { index: i, value: v, max: maxOf(i) });
                });
                return b;
            });
            root.append(plot, legend);
            this.append(root);
            this.inView((vis) => { if (vis)
                root.setAttribute('data-in', ''); });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'data-kit-15', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineRadialBars };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/radial-bars.js.map