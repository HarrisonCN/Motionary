import { defineElement, type UsaElement } from '../base';
import { clampN } from './shared';
import css from './gauge.css?raw';

/**
 * `<usa-gauge>` (7.2) — a semicircular gauge: the needle swings to `value`
 * on a damped spring (overshoot, settle), the arc fills with a colour that
 * follows `zones` ("60:#22c55e,85:#f59e0b,100:#ef4444" — upper bound:color)
 * and the number counts. `min` / `max` / `unit` / `label`; `role="meter"`.
 * Reduced motion: no swing or count.
 */
export interface UsaGaugeElement extends UsaElement {
  value: number;
}

export function defineGauge(tag = 'usa-gauge'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaGauge extends Base {
        static get observedAttributes(): string[] {
          return ['min', 'max', 'zones', 'unit', 'label', 'value'];
        }
        private _v = 0;
        private _shown = 0;
        private _vel = 0;
        private _raf = 0;

        get value(): number {
          return this._v;
        }
        set value(v: number) {
          this._v = clampN(Number(v) || 0, this.num('min', 0), this.num('max', 100));
          this.setAttribute('aria-valuenow', String(this._v));
          this.animateTo();
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML('afterbegin', '<svg class="usa-gg-svg" data-usa-part aria-hidden="true" viewBox="0 0 200 120"><path class="usa-gg-track" d="M20 100 A80 80 0 0 1 180 100"/><path class="usa-gg-arc" d="M20 100 A80 80 0 0 1 180 100" pathLength="100"/><g class="usa-gg-needle"><path d="M100 100 L96 100 L100 30 L104 100 Z"/><circle cx="100" cy="100" r="7"/></g></svg><div class="usa-gg-read" data-usa-part aria-hidden="true"><b class="usa-gg-num">0</b><span class="usa-gg-label"></span></div>');
          (this.querySelector('.usa-gg-label') as HTMLElement).textContent = this.str('label', '');
          this.setAttribute('role', 'meter');
          this.setAttribute('aria-valuemin', String(this.num('min', 0)));
          this.setAttribute('aria-valuemax', String(this.num('max', 100)));
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Gauge'));
          this._v = clampN(this.num('value', 0), this.num('min', 0), this.num('max', 100));
          this.setAttribute('aria-valuenow', String(this._v));
          this._shown = this.reduced ? this._v : this.num('min', 0);
          this.paint();
          this.onCleanup(() => cancelAnimationFrame(this._raf));
          this.inView((v) => v && this.animateTo());
        }

        /** Colour of the zone containing `v`. */
        zoneColor(v: number): string {
          const zones = this.str('zones', '').split(',').map((z) => z.split(':')).filter((z) => z.length === 2).map(([b, c]) => [Number(b), c.trim()] as [number, string]).sort((a, b) => a[0] - b[0]);
          for (const [b, c] of zones) if (v <= b) return c;
          return zones.length ? zones[zones.length - 1][1] : '';
        }

        private paint(): void {
          const lo = this.num('min', 0);
          const hi = this.num('max', 100);
          const k = clampN((this._shown - lo) / (hi - lo || 1), -0.05, 1.05);
          this.style.setProperty('--usa-gg-k', k.toFixed(4));
          this.style.setProperty('--usa-gg-angle', `${-90 + k * 180}deg`);
          const z = this.zoneColor(this._shown);
          if (z) this.style.setProperty('--usa-gg-c', z);
          const num = this.querySelector('.usa-gg-num');
          if (num) num.textContent = `${Math.round(clampN(this._shown, lo, hi))}${this.str('unit', '')}`;
          this.setAttribute('aria-valuetext', `${Math.round(this._v)}${this.str('unit', '')}`);
        }

        private animateTo(): void {
          if (this.reduced || typeof requestAnimationFrame !== 'function') {
            this._shown = this._v;
            return this.paint();
          }
          if (this._raf) return;
          let last = 0;
          const f = (now: number) => {
            const dt = last ? Math.min(0.033, (now - last) / 1000) : 1 / 60;
            last = now;
            const span = this.num('max', 100) - this.num('min', 0) || 1;
            this._vel += (120 * (this._v - this._shown) - 11 * this._vel) * dt;
            this._shown += this._vel * dt;
            this.paint();
            if (Math.abs(this._v - this._shown) / span > 0.0005 || Math.abs(this._vel) / span > 0.002) this._raf = requestAnimationFrame(f);
            else ((this._raf = 0), (this._shown = this._v), (this._vel = 0), this.paint());
          };
          this._raf = requestAnimationFrame(f);
        }
      }
      return UsaGauge as unknown as CustomElementConstructor;
    },
    { id: 'gauge', text: css }
  );
}
