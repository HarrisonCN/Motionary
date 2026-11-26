import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { l as list, a as formatNumber } from '../chunks/kit-DugHPVcq.js';
import { s as signedNumbers, k as spreadLabels, g as relativeChange } from '../chunks/kit-15-gywnm88n.js';
import { c as css } from '../chunks/data-kit-15-BWDqo1L6.js';

const SVG = 'http://www.w3.org/2000/svg';
function defineSlopeChart(tag = 'usa-slope-chart') {
    const ctor = defineElement(tag, Base => class SlopeChart extends Base {
        static get observedAttributes() { return ['before', 'after', 'labels', 'from-label', 'to-label', 'unit', 'label']; }
        mount() {
            const before = signedNumbers(this.str('before'), 16);
            const after = signedNumbers(this.str('after'), 16);
            const labels = list(this.str('labels'), 16);
            const n = Math.min(before.length, after.length);
            const unit = this.str('unit');
            const all = n ? [...before.slice(0, n), ...after.slice(0, n)] : [0];
            const lo = Math.min(...all);
            const hi = Math.max(...all);
            const W = 400, H = 260, top = 24, bottom = H - 16, x1 = 120, x2 = 280;
            const y = (v) => (hi === lo ? (top + bottom) / 2 : bottom - ((v - lo) / (hi - lo)) * (bottom - top));
            const pct = (f) => `${f > 0 ? '+' : ''}${formatNumber(f * 100, 1)}%`;
            const u = (v) => `${formatNumber(v, 1)}${unit ? ` ${unit}` : ''}`;
            const root = make('figure', 'usa-kit usa-slope');
            root.toggleAttribute('data-static', this.reduced);
            const title = this.str('label', 'Change');
            const svg = document.createElementNS(SVG, 'svg');
            svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
            svg.setAttribute('class', 'usa-slope-svg');
            svg.setAttribute('aria-hidden', 'true');
            const el = (name, attrs, text) => {
                const e = document.createElementNS(SVG, name);
                for (const [k, v] of Object.entries(attrs))
                    e.setAttribute(k, String(v));
                if (text !== undefined)
                    e.textContent = text;
                return e;
            };
            svg.append(el('line', { class: 'usa-slope-axis', x1, x2: x1, y1: top - 8, y2: bottom }), el('line', { class: 'usa-slope-axis', x1: x2, x2, y1: top - 8, y2: bottom }), el('text', { class: 'usa-slope-head', x: x1, y: 12, 'text-anchor': 'middle' }, this.str('from-label', 'Before')), el('text', { class: 'usa-slope-head', x: x2, y: 12, 'text-anchor': 'middle' }, this.str('to-label', 'After')));
            const ly = spreadLabels(before.slice(0, n).map(y), 15, top, bottom);
            const ry = spreadLabels(after.slice(0, n).map(y), 15, top, bottom);
            const groups = [];
            for (let i = 0; i < n; i++) {
                const dir = after[i] > before[i] ? 'up' : after[i] < before[i] ? 'down' : 'flat';
                const g = el('g', { class: 'usa-slope-item', 'data-dir': dir });
                g.style.setProperty('--i', String(i));
                g.append(el('line', { class: 'usa-slope-line', x1, x2, y1: y(before[i]), y2: y(after[i]), pathLength: 1 }), el('circle', { class: 'usa-slope-dot', cx: x1, cy: y(before[i]), r: 4 }), el('circle', { class: 'usa-slope-dot', cx: x2, cy: y(after[i]), r: 4 }), el('text', { class: 'usa-slope-lab', x: x1 - 10, y: ly[i] + 4, 'text-anchor': 'end' }, `${labels[i] || `#${i + 1}`} ${formatNumber(before[i], 1)}`), el('text', { class: 'usa-slope-lab', x: x2 + 10, y: ry[i] + 4 }, `${formatNumber(after[i], 1)} ${labels[i] || `#${i + 1}`}`));
                svg.append(g);
                groups.push(g);
            }
            const ul = make('ul', 'usa-slope-list');
            ul.setAttribute('aria-label', title);
            const buttons = [];
            let picked = -1;
            const focus = (i) => {
                root.toggleAttribute('data-focus', i >= 0);
                groups.forEach((g, k) => g.toggleAttribute('data-on', k === i));
            };
            for (let i = 0; i < n; i++) {
                const change = relativeChange(before[i], after[i]);
                const li = make('li');
                const b = make('button', 'usa-slope-key');
                b.type = 'button';
                b.dataset.dir = groups[i].getAttribute('data-dir');
                b.append(make('span', 'usa-slope-name', labels[i] || `#${i + 1}`), make('strong', 'usa-slope-change', pct(change)));
                b.setAttribute('aria-label', `${labels[i] || `#${i + 1}`}: ${u(before[i])} → ${u(after[i])}, ${pct(change)}`);
                b.setAttribute('aria-pressed', 'false');
                this.listen(b, 'click', () => {
                    picked = picked === i ? -1 : i;
                    buttons.forEach((x, k) => x.setAttribute('aria-pressed', String(k === picked)));
                    focus(picked);
                    this.emit('select', { index: i, before: before[i], after: after[i], change });
                });
                this.listen(b, 'pointerenter', () => focus(i));
                this.listen(b, 'pointerleave', () => focus(picked));
                this.listen(groups[i], 'pointerenter', () => focus(i));
                this.listen(groups[i], 'pointerleave', () => focus(picked));
                buttons.push(b);
                li.append(b);
                ul.append(li);
            }
            const cap = make('figcaption', 'usa-slope-title', title);
            root.append(cap, svg, ul);
            this.append(root);
            this.inView((vis) => { if (vis)
                root.setAttribute('data-in', ''); });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'data-kit-15', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSlopeChart };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/slope-chart.js.map