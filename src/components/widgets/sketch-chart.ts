import { defineElement, type UsaElement } from '../base';
import { roughLine } from '../fx2/paper';
import css from './sketch-chart.css?raw';

/**
 * `<usa-sketch-chart values="3,7,5,9" labels="Q1,Q2,Q3,Q4">` (8.5) — a
 * hand-drawn chart: wobbly pencil axes, hatched bars (`type="bar"`, default)
 * or a sketchy line with dots (`type="line"`), sketched in stroke by stroke
 * when it scrolls into view. `color`, `label`; `values` property /
 * `setValues()`; `usa:drawn` when finished. An `img` whose label lists the
 * data; reduced motion: drawn at once.
 */
export interface UsaSketchChartElement extends UsaElement {
  values: number[];
  setValues(v: number[]): void;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
const nums = (s: string) => s.split(',').map((x) => Number(x.trim())).filter((x) => Number.isFinite(x));

export function defineSketchChart(tag = 'usa-sketch-chart'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSketchChart extends Base {
        static get observedAttributes(): string[] {
          return ['values', 'labels', 'type', 'color', 'label'];
        }
        private _v: number[] | null = null;
        get values(): number[] {
          return (this._v || nums(this.str('values'))).slice();
        }
        set values(v: number[]) {
          this.setValues(v);
        }
        setValues(v: number[]): void {
          this._v = v.map(Number).filter((x) => Number.isFinite(x));
          if (this.isConnected) this.changed('values');
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const vs = this.values;
          const labels = this.str('labels').split(',').map((s) => s.trim());
          const line = this.str('type') === 'line';
          if (this.hasAttribute('color')) this.style.setProperty('--usa-sk-c', this.str('color'));
          this.setAttribute('role', 'img');
          this.setAttribute('aria-label', `${this.str('label', 'Chart')}: ${vs.map((v, i) => `${labels[i] || i + 1} ${v}`).join(', ') || 'no data'}`);
          const W = 240, H = 140, L = 22, B = 120, T = 12;
          const max = Math.max(1, ...vs);
          const step = vs.length ? (W - L - 8) / vs.length : 0;
          const y = (v: number) => B - (Math.max(0, v) / max) * (B - T);
          let g = `<path class="usa-sk-axis" d="${roughLine(L, T - 4, L, B, 1)} ${roughLine(L, B, W - 4, B, 2)}"/>`;
          if (line) {
            const pts = vs.map((v, i) => [L + step * (i + 0.5), y(v)]);
            g += pts.slice(1).map((p, i) => `<path class="usa-sk-mark" d="${roughLine(pts[i][0], pts[i][1], p[0], p[1], i + 5, 1.2)}"/>`).join('');
            g += pts.map(([x, yy]) => `<circle class="usa-sk-dot" cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="3.5"/>`).join('');
          } else {
            vs.forEach((v, i) => {
              const x0 = L + step * i + step * 0.2;
              const x1 = x0 + step * 0.6;
              const yy = y(v);
              g += `<path class="usa-sk-mark" d="${roughLine(x0, B, x0, yy, i * 3 + 7)} ${roughLine(x0, yy, x1, yy, i * 3 + 8)} ${roughLine(x1, yy, x1, B, i * 3 + 9)}"/>`;
              for (let h = yy + 8; h < B - 2; h += 9) g += `<path class="usa-sk-hatch" d="${roughLine(x0 + 2, Math.min(B, h + 5), x1 - 2, h - 3, h + i, 0.8)}"/>`;
            });
          }
          g += vs.map((_, i) => (labels[i] ? `<text x="${(L + step * (i + 0.5)).toFixed(1)}" y="${B + 14}">${esc(labels[i])}</text>` : '')).join('');
          this.insertAdjacentHTML('beforeend', `<svg class="usa-sk" viewBox="0 0 ${W} ${H}" aria-hidden="true" data-usa-part>${g}</svg>`);
          if (this.reduced) return void this.setAttribute('data-drawn', '');
          let done = false;
          this.inView((v) => {
            if (v && !done) {
              done = true;
              this.draw();
            }
          }, { threshold: 0.3 });
        }
        private draw(): void {
          const strokes = Array.from(this.querySelectorAll<SVGGeometryElement>('.usa-sk-axis, .usa-sk-mark, .usa-sk-hatch, .usa-sk-dot'));
          let last: Animation | null = null;
          strokes.forEach((p, i) => {
            let len = 150;
            try {
              len = p.getTotalLength?.() || 150;
            } catch {
              /* not rendered */
            }
            p.style.strokeDasharray = `${len}`;
            last = this.motion(p, [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }], { duration: 380, delay: i * 45, easing: 'ease-out', fill: 'backwards' }) || last;
          });
          this.setAttribute('data-drawn', '');
          const end = () => this.emit('drawn');
          if (last) (last as Animation).finished.then(end, () => undefined);
          else end();
        }
      }
      return UsaSketchChart as unknown as CustomElementConstructor;
    },
    { id: 'sketch-chart', text: css }
  );
}
