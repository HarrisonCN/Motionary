import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { formatNumber, list } from './kit';
import { niceTicks } from './kit-13';
import { signedNumbers } from './kit-15';
import css from './data-kit-15.css?raw';

/**
 * A dot plot: one row per item with its value as a dot on a shared scale, and with `compare` a second dot joined to
 * the first by a bar, a "dumbbell" that shows the gap between two series (last year and this year, plan and actual).
 * The dots slide in from the left edge when the chart scrolls into view; a legend names the two series, grid lines
 * mark round numbers, and every row is a button that reports a pick and reads out both values.
 *
 * Attributes: `values`, `compare`, `labels` (all comma-separated), `series` (two comma-separated names),
 * `min` / `max` (scale ends; from the data by default), `unit`, `label` (Comparison).
 * Event `usa:select` ({ index, value, compare }) — `compare` is null without the `compare` attribute.
 */
export interface UsaDotPlotElement extends UsaElement {}

export function defineDotPlot(tag = 'usa-dot-plot'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class DotPlot extends Base {
    static get observedAttributes(): string[] { return ['values', 'compare', 'labels', 'series', 'min', 'max', 'unit', 'label']; }
    mount(): void {
      const values = signedNumbers(this.str('values'), 20);
      const hasCompare = !!this.str('compare').trim();
      const compare = signedNumbers(this.str('compare'), 20);
      const labels = list(this.str('labels'), 20);
      const series = list(this.str('series'), 2);
      const unit = this.str('unit');
      const all = [...values, ...(hasCompare ? compare.slice(0, values.length) : [])];
      const ticks = niceTicks(this.num('min', Math.min(0, ...all)), this.num('max', Math.max(1, ...all)), 5);
      const lo = ticks[0];
      const hi = ticks[ticks.length - 1];
      const at = (v: number) => (hi === lo ? 0.5 : Math.max(0, Math.min(1, (v - lo) / (hi - lo))));
      const u = (v: number) => `${formatNumber(v, 1)}${unit ? ` ${unit}` : ''}`;
      const root = make('figure', 'usa-kit usa-dots');
      root.toggleAttribute('data-static', this.reduced);
      const title = this.str('label', 'Comparison');
      const cap = make('figcaption', 'usa-dots-title', title);
      const legend = make('p', 'usa-dots-legend');
      legend.setAttribute('aria-hidden', 'true');
      if (hasCompare) {
        legend.append(make('i', 'usa-dots-key', ''), make('span', '', series[0] || 'A'), make('i', 'usa-dots-key usa-dots-key-b', ''), make('span', '', series[1] || 'B'));
      }
      const grid = make('div', 'usa-dots-grid');
      grid.setAttribute('aria-hidden', 'true');
      for (const t of ticks) {
        const line = make('span', 'usa-dots-tick', formatNumber(t, 1));
        line.style.setProperty('--x', String(at(t)));
        grid.append(line);
      }
      const ul = make('ul', 'usa-dots-list');
      ul.setAttribute('aria-label', title);
      values.forEach((v, i) => {
        const c = hasCompare ? compare[i] ?? 0 : null;
        const li = make('li');
        const b = make('button', 'usa-dots-row');
        b.type = 'button';
        b.style.setProperty('--i', String(i));
        b.style.setProperty('--a', String(at(v)));
        if (c !== null) {
          b.style.setProperty('--b', String(at(c)));
          b.style.setProperty('--from', String(Math.min(at(v), at(c))));
          b.style.setProperty('--to', String(Math.max(at(v), at(c))));
        }
        const track = make('span', 'usa-dots-track');
        track.setAttribute('aria-hidden', 'true');
        if (c !== null) track.append(make('i', 'usa-dots-gap'));
        track.append(make('i', 'usa-dots-dot'));
        if (c !== null) track.append(make('i', 'usa-dots-dot usa-dots-dot-b'));
        b.append(make('span', 'usa-dots-name', labels[i] || `#${i + 1}`), track);
        const both = c !== null ? `${series[0] || 'A'} ${u(v)}, ${series[1] || 'B'} ${u(c)}` : u(v);
        b.setAttribute('aria-label', `${labels[i] || `#${i + 1}`}: ${both}`);
        this.listen(b, 'click', () => this.emit('select', { index: i, value: v, compare: c }));
        li.append(b);
        ul.append(li);
      });
      const plot = make('div', 'usa-dots-plot');
      plot.append(grid, ul);
      root.append(cap);
      if (hasCompare) root.append(legend);
      root.append(plot);
      this.append(root);
      this.inView((vis) => { if (vis) root.setAttribute('data-in', ''); });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'data-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
