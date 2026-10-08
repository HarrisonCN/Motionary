import { defineElement, type UsaElement } from '../base';
import css from './bar-chart.css?raw';

/**
 * `<usa-bar-chart>` (7.2) — an animated bar chart from data: bars grow in a
 * stagger on first view, value labels count with them, and new data glides
 * every bar to its new height (bars that appear grow, bars that leave
 * shrink). Data from `data` (`[{ label, value }]`), a `values` +
 * `labels` attribute pair, or `<data value="…">label</data>` children.
 * `max`, `unit`, `horizontal`. Accessible as a list of "label: value"
 * items. Reduced motion: no growth or glide.
 */
export interface UsaBarChartElement extends UsaElement {
  data: { label: string; value: number }[];
}

export function defineBarChart(tag = 'usa-bar-chart'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaBarChart extends Base {
        static get observedAttributes(): string[] {
          return ['horizontal', 'unit', 'max'];
        }
        private _data: { label: string; value: number }[] = [];
        private _seen = false;

        get data(): { label: string; value: number }[] {
          return this._data.map((d) => ({ ...d }));
        }
        set data(v: { label: string; value: number }[]) {
          this._data = (v || []).map((d) => ({ label: String(d.label), value: Number(d.value) || 0 }));
          if (this.isConnected) this.render(true);
        }

        mount(): void {
          if (!this._data.length) {
            const kids = Array.from(this.querySelectorAll(':scope > data'));
            if (kids.length) this._data = kids.map((k) => ({ label: k.textContent?.trim() || '', value: Number(k.getAttribute('value')) || 0 }));
            else {
              const vals = this.str('values', '').split(',').map(Number);
              const labels = this.str('labels', '').split(',');
              this._data = vals.filter(Number.isFinite).map((v, i) => ({ label: (labels[i] || String(i + 1)).trim(), value: v }));
            }
          }
          this.querySelectorAll(':scope > data').forEach((d) => ((d as HTMLElement).hidden = true));
          this.dataset.dir = this.flag('horizontal') ? 'h' : 'v';
          this.render(false);
          this.inView((vis) => {
            if (!vis || this._seen) return;
            this._seen = true;
            if (this.reduced) return;
            this.querySelectorAll<HTMLElement>('.usa-bc-bar').forEach((b, i) => this.motion(b, [{ transform: this.dataset.dir === 'h' ? 'scaleX(0)' : 'scaleY(0)' }, { transform: 'none' }], { duration: 700, delay: i * 70, easing: 'cubic-bezier(.2,.8,.3,1.1)', fill: 'backwards' }));
          });
        }

        private render(glide: boolean): void {
          let list = this.querySelector(':scope > .usa-bc-list') as HTMLElement | null;
          if (!list) {
            list = document.createElement('ul');
            list.className = 'usa-bc-list';
            list.setAttribute('data-usa-part', '');
            this.appendChild(list);
          }
          const max = this.num('max', 0) || Math.max(1, ...this._data.map((d) => d.value));
          const unit = this.str('unit', '');
          const old = new Map(Array.from(list.children).map((li) => [(li as HTMLElement).dataset.label, li as HTMLElement]));
          const next: HTMLElement[] = [];
          for (const d of this._data) {
            let li = old.get(d.label);
            const isNew = !li;
            if (!li) {
              li = document.createElement('li');
              li.className = 'usa-bc-item';
              li.dataset.label = d.label;
              li.innerHTML = '<span class="usa-bc-track"><span class="usa-bc-bar"></span></span><span class="usa-bc-val"></span><span class="usa-bc-label"></span>';
              (li.querySelector('.usa-bc-label') as HTMLElement).textContent = d.label;
            }
            old.delete(d.label);
            const k = Math.max(0, Math.min(1, d.value / max));
            li.style.setProperty('--usa-bc-k', k.toFixed(4));
            (li.querySelector('.usa-bc-val') as HTMLElement).textContent = `${d.value.toLocaleString()}${unit}`;
            li.setAttribute('aria-label', `${d.label}: ${d.value.toLocaleString()}${unit}`);
            li.toggleAttribute('data-glide', glide && !this.reduced);
            if (isNew && glide && !this.reduced) this.motion(li.querySelector('.usa-bc-bar')!, [{ transform: this.dataset.dir === 'h' ? 'scaleX(0)' : 'scaleY(0)' }, { transform: 'none' }], { duration: 500, easing: 'ease-out' });
            next.push(li);
          }
          old.forEach((li) => {
            if (this.reduced || !glide) return li.remove();
            const a = this.motion(li, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.6)' }], { duration: 300, fill: 'forwards' });
            if (a) a.finished.then(() => li.remove(), () => li.remove());
            else li.remove();
          });
          next.forEach((li) => list!.appendChild(li));
          this.setAttribute('role', 'figure');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Bar chart'));
          list.setAttribute('role', 'list');
          next.forEach((li) => li.setAttribute('role', 'listitem'));
        }
      }
      return UsaBarChart as unknown as CustomElementConstructor;
    },
    { id: 'bar-chart', text: css }
  );
}
