import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, formatNumber, list, tween } from './kit';
import { numbers } from './kit-12';
import { funnelRows } from './kit-13';
import css from './parts-kit-13.css?raw';

/**
 * A conversion funnel. Each stage is a centred bar as wide as its share of the first stage; the bars grow out from the
 * middle one after another when the funnel scrolls into view, the numbers count up, and between stages a small badge
 * shows how many made it to the next step. Every stage is a button that reports a pick, and the whole funnel is an
 * ordered list, so it reads in order as text.
 *
 * Attributes: `values` (comma-separated), `labels` (comma-separated), `colors`, `label` (Funnel), `unit`,
 * `conversion-label` ("{p} continue").
 * Event `usa:select` ({ index, value, step, overall }).
 */
export interface UsaFunnelChartElement extends UsaElement {}

export function defineFunnelChart(tag = 'usa-funnel-chart'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class FunnelChart extends Base {
    static get observedAttributes(): string[] { return ['values', 'labels', 'colors', 'label', 'unit', 'conversion-label']; }
    mount(): void {
      const values = numbers(this.str('values'), 12);
      const labels = list(this.str('labels'), 12);
      const colors = list(this.str('colors'), 12).map(cleanColor);
      const unit = this.str('unit');
      const rows = funnelRows(values);
      const pct = (f: number) => `${formatNumber(f * 100, 1)}%`;
      const root = make('figure', 'usa-kit usa-funnel');
      root.setAttribute('aria-label', this.str('label', 'Funnel'));
      root.toggleAttribute('data-static', this.reduced);
      const ol = make('ol', 'usa-funnel-list');
      const nums: HTMLElement[] = [];
      values.forEach((v, i) => {
        const li = make('li', 'usa-funnel-stage');
        li.style.setProperty('--w', String(Math.max(0.06, rows[i].share)));
        li.style.setProperty('--next', String(Math.max(0.06, rows[i + 1]?.share ?? rows[i].share * 0.86)));
        li.style.setProperty('--i', String(i));
        if (colors[i]) li.style.setProperty('--c', colors[i]);
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
      const stops: (() => void)[] = [];
      let shown = false;
      this.inView((vis) => {
        if (!vis || shown) return;
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
