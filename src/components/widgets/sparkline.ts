import { defineElement, type UsaElement } from '../base';
import css from './sparkline.css?raw';

/**
 * `<usa-sparkline>` (7.2) — a tiny inline trend line. `values`
 * ("3,5,4,8,6,9") or the `data` property; it draws itself on first view, a
 * soft area fades in under it, the last point pulses, and setting new data
 * morphs the line (point-by-point tween). `variant="line | area | bars"`,
 * `color`. Hover / touch shows a dot + value tooltip. Decorative by default
 * with a text summary as `aria-label` ("Trend: 3 to 9, up 200%").
 * Reduced motion: no draw, morph or pulse.
 */
export interface UsaSparklineElement extends UsaElement {
  data: number[];
}

export const SPARK_VARIANTS = ['line', 'area', 'bars'] as const;

/** Map values to SVG points in a w×h box (with padding). */
export function sparkPoints(vals: number[], w = 100, h = 30, pad = 3): [number, number][] {
  if (!vals.length) return [];
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const span = hi - lo || 1;
  return vals.map((v, i) => [vals.length === 1 ? w / 2 : pad + (i / (vals.length - 1)) * (w - pad * 2), h - pad - ((v - lo) / span) * (h - pad * 2)]);
}

export function defineSparkline(tag = 'usa-sparkline'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSparkline extends Base {
        static get observedAttributes(): string[] {
          return ['variant', 'color', 'values', 'label'];
        }
        private _data: number[] = [];
        private _drawn = false;
        private _raf = 0;

        get data(): number[] {
          return this._data.slice();
        }
        set data(v: number[]) {
          const from = sparkPoints(this._data);
          this._data = (v || []).map(Number).filter(Number.isFinite);
          if (this.isConnected) this.render(from);
        }

        mount(): void {
          if (!this._data.length) this._data = this.str('values', '').split(',').map(Number).filter(Number.isFinite);
          const v = this.str('variant', 'line');
          this.dataset.variant = (SPARK_VARIANTS as readonly string[]).includes(v) ? v : 'line';
          if (this.str('color', '')) this.style.setProperty('--usa-sl-c', this.str('color', ''));
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML('afterbegin', '<svg class="usa-sl-svg" data-usa-part viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path class="usa-sl-area"/><g class="usa-sl-bars"></g><path class="usa-sl-line" pathLength="1"/><circle class="usa-sl-end" r="2.2"/><circle class="usa-sl-hover" r="2.4"/></svg><span class="usa-sl-tip" data-usa-part aria-hidden="true"></span>');
          this.setAttribute('role', 'img');
          this.listen(this, 'pointermove', (e: PointerEvent) => this.hover(e));
          this.listen(this, 'pointerleave', () => this.removeAttribute('data-hover'));
          this.onCleanup(() => cancelAnimationFrame(this._raf));
          this.render(null);
          this.inView((vis) => {
            if (!vis || this._drawn) return;
            this._drawn = true;
            const line = this.querySelector('.usa-sl-line');
            if (line && !this.reduced) this.motion(line, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, easing: 'cubic-bezier(.6,.05,.3,1)' });
          });
        }

        private summary(): string {
          const d = this._data;
          if (!d.length) return 'No data';
          const a = d[0];
          const b = d[d.length - 1];
          const pct = a ? Math.round(((b - a) / Math.abs(a)) * 100) : 0;
          return `Trend: ${a} to ${b}${a ? `, ${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct)}%` : ''}`;
        }

        private paths(pts: [number, number][]): { line: string; area: string } {
          if (!pts.length) return { line: '', area: '' };
          const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
          return { line, area: `${line}L${pts[pts.length - 1][0].toFixed(2)} 30L${pts[0][0].toFixed(2)} 30Z` };
        }

        private render(from: [number, number][] | null): void {
          this.setAttribute('aria-label', this.str('label', '') || this.summary());
          const to = sparkPoints(this._data);
          const apply = (pts: [number, number][]) => {
            const { line, area } = this.paths(pts);
            this.querySelector('.usa-sl-line')?.setAttribute('d', line);
            this.querySelector('.usa-sl-area')?.setAttribute('d', area);
            const end = pts[pts.length - 1];
            const c = this.querySelector('.usa-sl-end');
            if (end && c) (c.setAttribute('cx', end[0].toFixed(2)), c.setAttribute('cy', end[1].toFixed(2)));
          };
          const bars = this.querySelector('.usa-sl-bars');
          if (bars) {
            const lo = Math.min(0, ...this._data);
            const hi = Math.max(...this._data, 1);
            const w = 100 / Math.max(1, this._data.length);
            bars.innerHTML = this._data.map((v, i) => `<rect x="${(i * w + w * 0.15).toFixed(2)}" width="${(w * 0.7).toFixed(2)}" y="${(30 - ((v - lo) / (hi - lo || 1)) * 28).toFixed(2)}" height="${(((v - lo) / (hi - lo || 1)) * 28).toFixed(2)}" rx="1"/>`).join('');
          }
          if (!from || from.length !== to.length || this.reduced || typeof requestAnimationFrame !== 'function') return apply(to);
          cancelAnimationFrame(this._raf);
          const t0 = performance.now();
          const f = (now: number) => {
            const k = Math.min(1, (now - t0) / 500);
            const e = 1 - Math.pow(1 - k, 3);
            apply(to.map(([x, y], i) => [from[i][0] + (x - from[i][0]) * e, from[i][1] + (y - from[i][1]) * e]));
            if (k < 1) this._raf = requestAnimationFrame(f);
          };
          this._raf = requestAnimationFrame(f);
        }

        private hover(e: PointerEvent): void {
          if (!this._data.length) return;
          const r = this.getBoundingClientRect();
          const pts = sparkPoints(this._data);
          const x = ((e.clientX - r.left) / (r.width || 1)) * 100;
          let i = 0;
          pts.forEach(([px], j) => Math.abs(px - x) < Math.abs(pts[i][0] - x) && (i = j));
          const c = this.querySelector('.usa-sl-hover');
          c?.setAttribute('cx', pts[i][0].toFixed(2));
          c?.setAttribute('cy', pts[i][1].toFixed(2));
          const tip = this.querySelector('.usa-sl-tip') as HTMLElement | null;
          if (tip) {
            tip.textContent = String(this._data[i]);
            tip.style.left = `${pts[i][0]}%`;
          }
          this.toggleAttribute('data-hover', true);
        }
      }
      return UsaSparkline as unknown as CustomElementConstructor;
    },
    { id: 'sparkline', text: css }
  );
}
