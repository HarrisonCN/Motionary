import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, formatNumber, list } from './kit';
import { numbers } from './kit-12';
import { waffleCells } from './kit-13';
import css from './parts-kit-13.css?raw';

const PALETTE = ['#4f46e5', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6'];

/**
 * A waffle chart: a 10 × 10 grid where every square is one percent, coloured by category. The squares pop in along a
 * diagonal wave when the chart scrolls into view. Hovering or focusing a legend entry lifts that category's squares and
 * dims the rest. The legend is a list of buttons with each share in words, so the grid itself is decorative.
 *
 * Attributes: `values`, `labels`, `colors`, `label` (Chart), `total` (what a full grid stands for; 100 or the sum),
 * `shape` (square, round; square).
 * Event `usa:select` ({ index, value, cells }).
 */
export interface UsaWaffleChartElement extends UsaElement {}

export function defineWaffleChart(tag = 'usa-waffle-chart'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class WaffleChart extends Base {
    static get observedAttributes(): string[] { return ['values', 'labels', 'colors', 'label', 'total', 'shape']; }
    mount(): void {
      const values = numbers(this.str('values'), 8);
      const labels = list(this.str('labels'), 8);
      const colors = list(this.str('colors'), 8).map(cleanColor);
      const sum = values.reduce((a, b) => a + b, 0);
      const total = Math.max(this.num('total', sum > 100 ? sum : 100), sum) || 100;
      const cells = waffleCells(values, total, 100);
      const color = (i: number) => colors[i] || PALETTE[i % PALETTE.length];
      const root = make('figure', 'usa-kit usa-waffle');
      root.setAttribute('aria-label', this.str('label', 'Chart'));
      root.toggleAttribute('data-round', this.str('shape') === 'round');
      root.toggleAttribute('data-static', this.reduced);
      const grid = make('div', 'usa-waffle-grid');
      grid.setAttribute('aria-hidden', 'true');
      const squares = cells.map((c, k) => {
        const s = make('i', 'usa-waffle-cell');
        const col = Math.floor(k / 10), row = 9 - (k % 10);
        s.style.gridColumn = String(col + 1);
        s.style.gridRow = String(row + 1);
        s.style.setProperty('--d', String(col + (9 - row)));
        if (c >= 0) { s.style.setProperty('--c', color(c)); s.dataset.k = String(c); }
        grid.append(s);
        return s;
      });
      const legend = make('ul', 'usa-waffle-legend');
      const keys = values.map((v, i) => {
        const li = make('li');
        const b = make('button', 'usa-waffle-key');
        b.type = 'button';
        b.style.setProperty('--c', color(i));
        const n = cells.filter((c) => c === i).length;
        b.append(make('span', 'usa-waffle-dot'), make('span', 'usa-waffle-name', labels[i] || `#${i + 1}`), make('span', 'usa-waffle-val', `${formatNumber((v / total) * 100, 1)}%`));
        this.listen(b, 'click', () => this.emit('select', { index: i, value: v, cells: n }));
        li.append(b);
        legend.append(li);
        return b;
      });
      const pick = (i: number | null) => {
        root.toggleAttribute('data-picking', i !== null);
        for (const s of squares) s.toggleAttribute('data-on', i !== null && s.dataset.k === String(i));
        keys.forEach((b, j) => b.toggleAttribute('data-on', j === i));
      };
      keys.forEach((b, i) => {
        this.listen(b, 'pointerenter', () => pick(i));
        this.listen(b, 'focus', () => pick(i));
        this.listen(b, 'pointerleave', () => pick(null));
        this.listen(b, 'blur', () => pick(null));
      });
      root.append(grid, legend);
      this.append(root);
      let shown = false;
      this.inView((v) => { if (v && !shown) { shown = true; root.setAttribute('data-in', ''); } });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'parts-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
