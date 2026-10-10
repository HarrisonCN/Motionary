import { defineElement, type UsaElement } from '../base';
import { parseFigureText } from './shared-figure';
import css from './kpi.css?raw';

/**
 * `<usa-kpi>` (7.2) — a KPI card: the value counts up on first view (keeps
 * prefix / suffix / decimals: "$12.4k", "98.2%"), the delta chip slides in
 * with an arrow that points and colours by sign (`delta="+12.5%"`, or
 * `invert` when down is good), and an optional `trend` ("4,6,5,9") draws a
 * sparkline. `label`, `value`, `delta`, `caption`. Setting `value` later
 * rolls from the old number to the new one and flashes the card.
 * Reduced motion: no count, slide or flash.
 */
export interface UsaKpiElement extends UsaElement {
  value: string;
}

export function defineKpi(tag = 'usa-kpi'): CustomElementConstructor | undefined {
  // contract-exempt: attr-unobserved(value) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
  return defineElement(
    tag,
    (Base) => {
      class UsaKpi extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'delta', 'caption', 'trend', 'invert', 'locale'];
        }
        private _shown = 0;
        private _raf = 0;
        private _seen = false;

        get value(): string {
          return this.str('value', '0');
        }
        set value(v: string) {
          const prev = this._shown;
          this.setAttribute('value', String(v));
          this.roll(prev, true);
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const delta = this.str('delta', '');
          const neg = /^\s*[-−]/.test(delta);
          const good = this.flag('invert') ? neg : !neg;
          this.insertAdjacentHTML('afterbegin', `<span class="usa-kpi-label" data-usa-part></span><b class="usa-kpi-value" data-usa-part></b>${delta ? `<span class="usa-kpi-delta" data-usa-part data-good="${good}"><i aria-hidden="true">${neg ? '▼' : '▲'}</i><span></span></span>` : ''}${this.str('trend', '') ? `<usa-sparkline class="usa-kpi-trend" data-usa-part variant="area" values="${this.str('trend', '')}" aria-hidden="true"></usa-sparkline>` : ''}<span class="usa-kpi-caption" data-usa-part></span>`);
          (this.querySelector('.usa-kpi-label') as HTMLElement).textContent = this.str('label', '');
          (this.querySelector('.usa-kpi-caption') as HTMLElement).textContent = this.str('caption', '');
          const ds = this.querySelector('.usa-kpi-delta span');
          if (ds) ds.textContent = delta;
          this.setAttribute('role', 'group');
          this.setAttribute('aria-label', [this.str('label', ''), this.value, delta && `(${delta})`, this.str('caption', '')].filter(Boolean).join(' '));
          this.onCleanup(() => cancelAnimationFrame(this._raf));
          const f = parseFigureText(this.value);
          this._shown = this.reduced || !f ? (f?.n ?? 0) : 0;
          this.write(this._shown);
          this.inView((vis) => {
            if (!vis || this._seen) return;
            this._seen = true;
            this.roll(0, false);
            const d = this.querySelector('.usa-kpi-delta');
            if (d && !this.reduced) this.motion(d, [{ transform: 'translateY(8px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: 500, easing: 'cubic-bezier(.2,.9,.3,1.2)', fill: 'backwards' });
          });
        }

        private write(n: number): void {
          const f = parseFigureText(this.value);
          const el = this.querySelector('.usa-kpi-value');
          if (!el) return;
          el.textContent = f ? f.pre + n.toLocaleString(this.str('locale', '') || undefined, { minimumFractionDigits: f.dec, maximumFractionDigits: f.dec }) + f.post : this.value;
        }

        private roll(from: number, flash: boolean): void {
          const f = parseFigureText(this.value);
          if (!f) return this.write(0);
          const to = f.n;
          if (this.reduced || typeof requestAnimationFrame !== 'function') {
            this._shown = to;
            return this.write(to);
          }
          cancelAnimationFrame(this._raf);
          const t0 = performance.now();
          const step = (now: number) => {
            const k = Math.min(1, (now - t0) / 1100);
            this._shown = from + (to - from) * (1 - Math.pow(1 - k, 3));
            this.write(this._shown);
            if (k < 1) this._raf = requestAnimationFrame(step);
          };
          this._raf = requestAnimationFrame(step);
          if (flash) this.motion(this, [{ boxShadow: '0 0 0 0 rgba(124,92,255,.5)' }, { boxShadow: '0 0 0 10px rgba(124,92,255,0)' }], { duration: 700, easing: 'ease-out' });
        }
      }
      return UsaKpi as unknown as CustomElementConstructor;
    },
    { id: 'kpi', text: css }
  );
}
