import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, formatNumber, list } from './kit';
import { numbers } from './kit-12';
import { arcDash } from './kit-15';
import css from './data-kit-15.css?raw';

const SVG = 'http://www.w3.org/2000/svg';
const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f97316'];

/**
 * Progress rings for a handful of measures at once, one inside the other, each sweeping three quarters of a circle in
 * proportion to its value out of `max`, like an activity tracker. The arcs draw in when the chart scrolls into view.
 * Beside the rings a legend lists each measure with its value; every legend row is a button that picks that ring and
 * dims the others. The chart is labelled and the legend reads as text.
 *
 * Attributes: `values` (comma-separated), `max` (100, or a comma-separated max per ring), `labels`, `colors`, `unit`,
 * `label` (Progress), `size` (px; 220).
 * Event `usa:select` ({ index, value, max }).
 */
export interface UsaRadialBarsElement extends UsaElement {}

export function defineRadialBars(tag = 'usa-radial-bars'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class RadialBars extends Base {
    static get observedAttributes(): string[] { return ['values', 'max', 'labels', 'colors', 'unit', 'label', 'size']; }
    mount(): void {
      const values = numbers(this.str('values'), 8);
      const maxes = numbers(this.str('max'), 8);
      const labels = list(this.str('labels'), 8);
      const colors = list(this.str('colors'), 8).map(cleanColor);
      const unit = this.str('unit');
      const maxOf = (i: number) => maxes[i] || maxes[0] || 100;
      const root = make('figure', 'usa-kit usa-rbars');
      root.toggleAttribute('data-static', this.reduced);
      root.style.setProperty('--usa-rbars-size', `${Math.max(120, Math.min(480, this.num('size', 220)))}px`);
      const name = this.str('label', 'Progress');
      const svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('viewBox', '0 0 220 220');
      svg.setAttribute('class', 'usa-rbars-svg');
      svg.setAttribute('role', 'img');
      const text = (v: number, i: number) => `${formatNumber(v, 1)}${unit ? ` ${unit}` : ''} / ${formatNumber(maxOf(i), 1)}`;
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
          Array.from(svg.children).forEach((g, k) => (g as SVGElement).toggleAttribute('data-dim', on && k !== i));
          this.emit('select', { index: i, value: v, max: maxOf(i) });
        });
        return b;
      });
      root.append(plot, legend);
      this.append(root);
      this.inView((vis) => { if (vis) root.setAttribute('data-in', ''); });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'data-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
