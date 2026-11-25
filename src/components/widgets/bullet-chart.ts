import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, formatNumber, list } from './kit';
import { numbers } from './kit-12';
import css from './data-kit-15.css?raw';

/**
 * Bullet charts: one compact row per measure with its actual value as a dark bar, its target as a short upright line,
 * and qualitative bands (poor, fair, good) behind them, the way dashboards show results against goals. A row whose
 * value meets its target gets a check. The bars grow in when the chart scrolls into view; every row is a button that
 * reports a pick, and its label reads value, target and whether it was met.
 *
 * Attributes: `values`, `targets`, `labels` (all comma-separated), `ranges` (band edges as fractions of `max` or plain
 * numbers; 0.5,0.8,1), `max` (the largest value or target by default), `colors` (bar colours), `unit`,
 * `label` (Results), `target-label` ("target {t}"), `met-label` (met), `missed-label` (below target).
 * Event `usa:select` ({ index, value, target, met }).
 */
export interface UsaBulletChartElement extends UsaElement {}

export function defineBulletChart(tag = 'usa-bullet-chart'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class BulletChart extends Base {
    static get observedAttributes(): string[] {
      return ['values', 'targets', 'labels', 'ranges', 'max', 'colors', 'unit', 'label', 'target-label', 'met-label', 'missed-label'];
    }
    mount(): void {
      const values = numbers(this.str('values'), 16);
      const targets = numbers(this.str('targets'), 16);
      const labels = list(this.str('labels'), 16);
      const colors = list(this.str('colors'), 16).map(cleanColor);
      const unit = this.str('unit');
      const max = this.num('max', 0) > 0 ? this.num('max', 0) : Math.max(1, ...values, ...targets);
      let ranges = numbers(this.str('ranges') || '0.5,0.8,1', 5);
      if (ranges.some((r) => r > 1)) ranges = ranges.map((r) => r / max);
      ranges = ranges.map((r) => Math.min(1, r)).sort((a, b) => a - b);
      const u = (v: number) => `${formatNumber(v, 1)}${unit ? ` ${unit}` : ''}`;
      const root = make('figure', 'usa-kit usa-bullet');
      root.toggleAttribute('data-static', this.reduced);
      const title = this.str('label', 'Results');
      root.setAttribute('aria-label', title);
      const ul = make('ul', 'usa-bullet-list');
      values.forEach((v, i) => {
        const t = targets[i] ?? 0;
        const met = t > 0 && v >= t;
        const li = make('li', 'usa-bullet-item');
        const b = make('button', 'usa-bullet-row');
        b.type = 'button';
        b.style.setProperty('--i', String(i));
        b.style.setProperty('--v', String(Math.min(1, v / max)));
        b.style.setProperty('--t', String(Math.min(1, t / max)));
        if (colors[i]) b.style.setProperty('--c', colors[i]);
        const name = make('span', 'usa-bullet-name', labels[i] || `#${i + 1}`);
        const track = make('span', 'usa-bullet-track');
        track.setAttribute('aria-hidden', 'true');
        ranges.forEach((r, k) => {
          const band = make('i', 'usa-bullet-band');
          band.style.setProperty('--r', String(r));
          band.style.setProperty('--k', String(k));
          track.append(band);
        });
        track.append(make('i', 'usa-bullet-bar'));
        if (t > 0) track.append(make('i', 'usa-bullet-target'));
        const num = make('span', 'usa-bullet-num', formatNumber(v, 1));
        if (met) num.append(make('i', 'usa-bullet-met', '✓'));
        b.append(name, track, num);
        const targetText = t > 0 ? `, ${this.str('target-label', 'target {t}').replace('{t}', u(t))}, ${met ? this.str('met-label', 'met') : this.str('missed-label', 'below target')}` : '';
        b.setAttribute('aria-label', `${labels[i] || `#${i + 1}`}: ${u(v)}${targetText}`);
        this.listen(b, 'click', () => this.emit('select', { index: i, value: v, target: t, met }));
        li.append(b);
        ul.append(li);
      });
      const cap = make('figcaption', 'usa-bullet-title', title);
      root.append(cap, ul);
      this.append(root);
      this.inView((vis) => { if (vis) root.setAttribute('data-in', ''); });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'data-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
