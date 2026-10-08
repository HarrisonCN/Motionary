import { defineElement, type UsaElement } from '../base';
import css from './prize-wheel.css?raw';

/**
 * `<usa-prize-wheel>` (7.5) — a lottery wheel from `segments`
 * ("10%,Free ship,Try again,…"): the Spin button whirls the wheel and it eases
 * out on the result (random, or `spin(index)`), the pointer ticks and the
 * winning segment glows. `duration`, `turns`; `result`, `spinning`;
 * `usa:result` (`{ index, label }`). The button is disabled while spinning and
 * the result is announced politely. Reduced motion: the wheel jumps to the
 * result.
 */
export interface UsaPrizeWheelElement extends UsaElement {
  readonly segments: string[];
  readonly result: number;
  readonly spinning: boolean;
  spin(index?: number): Promise<number>;
}

/** Final wheel rotation (deg) that puts segment `index` of `count` under the top pointer after `turns` full turns (7.5). */
export function wheelAngle(index: number, count: number, turns = 5): number {
  const seg = 360 / Math.max(1, count);
  return turns * 360 + (360 - (index * seg + seg / 2));
}

const COLORS = ['#7c5cff', '#22d3ee', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#3b82f6', '#a3e635'];

export function definePrizeWheel(tag = 'usa-prize-wheel'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaPrizeWheel extends Base {
        private _r = -1;
        private _spin = false;
        private _rot = 0;
        get segments(): string[] {
          return this.str('segments', '10% off,Free ship,Try again,🎁 Gift,5% off,Jackpot').split(',').map((s) => s.trim()).filter(Boolean);
        }
        get result(): number {
          return this._r;
        }
        get spinning(): boolean {
          return this._spin;
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const s = this.segments;
          const seg = 360 / s.length;
          const grad = s.map((_, i) => `${COLORS[i % COLORS.length]} ${(i * seg).toFixed(2)}deg ${((i + 1) * seg).toFixed(2)}deg`).join(',');
          this.insertAdjacentHTML(
            'beforeend',
            '<span class="usa-pw-box" data-usa-part><i class="usa-pw-pointer" aria-hidden="true"></i><span class="usa-pw-wheel" aria-hidden="true"></span><button type="button" class="usa-pw-btn"></button></span><span class="usa-pw-live" data-usa-part aria-live="polite"></span>'
          );
          const wheel = this.querySelector('.usa-pw-wheel') as HTMLElement;
          wheel.style.background = `conic-gradient(${grad})`;
          s.forEach((label, i) => {
            const l = document.createElement('span');
            l.className = 'usa-pw-label';
            l.textContent = label;
            l.style.transform = `rotate(${(i * seg + seg / 2).toFixed(2)}deg)`;
            wheel.appendChild(l);
          });
          this._rot = 0;
          const btn = this.querySelector('.usa-pw-btn') as HTMLButtonElement;
          btn.textContent = this.str('label', 'Spin');
          btn.setAttribute('aria-label', `${this.str('label', 'Spin')} the prize wheel`);
          this.listen(btn, 'click', () => void this.spin());
        }

        async spin(index?: number): Promise<number> {
          if (this._spin) return this._r;
          const s = this.segments;
          const i = index !== undefined && index >= 0 && index < s.length ? Math.floor(index) : Math.floor(Math.random() * s.length);
          const wheel = this.querySelector('.usa-pw-wheel') as HTMLElement | null;
          const btn = this.querySelector('.usa-pw-btn') as HTMLButtonElement | null;
          if (!wheel || !btn) return -1;
          this._spin = true;
          btn.disabled = true;
          this.removeAttribute('data-done');
          const base = this._rot - (this._rot % 360);
          const to = base + wheelAngle(i, s.length, this.reduced ? 0 : this.num('turns', 5));
          const from = this._rot;
          this._rot = to;
          const a = this.reduced ? null : this.motion(wheel, [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }], { duration: this.num('duration', 4000), easing: 'cubic-bezier(.12,.6,.1,1)' });
          wheel.style.transform = `rotate(${to}deg)`;
          if (a) {
            const ptr = this.querySelector('.usa-pw-pointer') as HTMLElement;
            this.motion(ptr, [{ transform: 'rotate(0)' }, { transform: 'rotate(-18deg)' }, { transform: 'rotate(0)' }], { duration: 160, iterations: 18, easing: 'ease-out' });
            await a.finished.catch(() => undefined);
          }
          this._spin = false;
          btn.disabled = false;
          this._r = i;
          this.setAttribute('data-done', '');
          (this.querySelector('.usa-pw-live') as HTMLElement).textContent = `Result: ${s[i]}`;
          this.emit('result', { index: i, label: s[i] });
          return i;
        }
      }
      return UsaPrizeWheel as unknown as CustomElementConstructor;
    },
    { id: 'prize-wheel', text: css }
  );
}
