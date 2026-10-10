import { defineElement, type UsaElement } from '../base';
import { clampN } from './shared';
import css from './volume-knob.css?raw';

/**
 * `<usa-volume-knob>` (7.1) — a rotary knob: drag up / down (or around),
 * scroll, or use the keyboard (arrows ±1, PageUp / PageDown ±10, Home / End)
 * to turn it; the value arc fills, a ring of LED ticks lights up and the
 * pointer springs to the new angle. `role="slider"`; attributes `value`,
 * `min` (0), `max` (100), `label`, `size`. Events `usa:input` while turning,
 * `usa:change` when done (`{ value }`). Reduced motion: no spring.
 */
export interface UsaVolumeKnobElement extends UsaElement {
  value: number;
}

const ARC = 270;

export function defineVolumeKnob(tag = 'usa-volume-knob'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaVolumeKnob extends Base {
        static get observedAttributes(): string[] {
          return ['min', 'max', 'label'];
        }
        private _v = 50;

        get value(): number {
          return this._v;
        }
        set value(v: number) {
          this.set(v, false);
        }

        mount(): void {
          this._v = clampN(this.num('value', 50), this.num('min', 0), this.num('max', 100));
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const ticks = Array.from({ length: 21 }, (_, i) => `<i style="--a:${-ARC / 2 + (i / 20) * ARC}deg"></i>`).join('');
          this.insertAdjacentHTML('afterbegin', `<span class="usa-vk-ticks" data-usa-part aria-hidden="true">${ticks}</span><svg class="usa-vk-arc" data-usa-part aria-hidden="true" viewBox="0 0 100 100"><path class="usa-vk-bg" d="${this.arc(1)}"/><path class="usa-vk-val" d="${this.arc(1)}"/></svg><span class="usa-vk-cap" data-usa-part aria-hidden="true"><span class="usa-vk-dot"></span></span>`);
          this.setAttribute('role', 'slider');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Volume'));
          this.setAttribute('aria-valuemin', String(this.num('min', 0)));
          this.setAttribute('aria-valuemax', String(this.num('max', 100)));
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const span = this.num('max', 100) - this.num('min', 0);
            const d: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: span / 10, PageDown: -span / 10, Home: -Infinity, End: Infinity };
            if (!(e.key in d)) return;
            e.preventDefault();
            this.set(this._v + d[e.key], true, true);
          });
          this.listen(this, 'wheel', (e: WheelEvent) => {
            e.preventDefault();
            this.set(this._v - Math.sign(e.deltaY) * 2, true, true);
          }, { passive: false });
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            const y0 = e.clientY;
            const v0 = this._v;
            const span = this.num('max', 100) - this.num('min', 0);
            this.setPointerCapture?.(e.pointerId);
            this.toggleAttribute('data-drag', true);
            const move = (ev: PointerEvent) => this.set(v0 + ((y0 - ev.clientY) / 150) * span, true);
            const up = () => {
              this.removeAttribute('data-drag');
              this.removeEventListener('pointermove', move);
              this.removeEventListener('pointerup', up);
              this.emit('change', { value: this._v });
            };
            this.addEventListener('pointermove', move);
            this.addEventListener('pointerup', up);
          });
          this.paint();
        }

        /** SVG arc path for fraction `k` (0–1) of the 270° sweep. */
        private arc(k: number): string {
          const a0 = ((-ARC / 2 - 90) * Math.PI) / 180;
          const a1 = a0 + ((ARC * Math.max(0.0001, k)) * Math.PI) / 180;
          const p = (a: number) => `${(50 + 42 * Math.cos(a)).toFixed(2)} ${(50 + 42 * Math.sin(a)).toFixed(2)}`;
          return `M${p(a0)} A42 42 0 ${ARC * k > 180 ? 1 : 0} 1 ${p(a1)}`;
        }

        private paint(): void {
          const lo = this.num('min', 0);
          const hi = this.num('max', 100);
          const k = (this._v - lo) / (hi - lo || 1);
          this.style.setProperty('--usa-vk-angle', `${-ARC / 2 + k * ARC}deg`);
          this.querySelector('.usa-vk-val')?.setAttribute('d', this.arc(k));
          this.querySelectorAll('.usa-vk-ticks i').forEach((t, i) => t.toggleAttribute('data-on', i / 20 <= k + 1e-6 && k > 0));
          this.setAttribute('aria-valuenow', String(Math.round(this._v)));
          this.setAttribute('value', String(Math.round(this._v)));
        }

        set(v: number, user: boolean, commit = false): void {
          const n = clampN(Math.round(v), this.num('min', 0), this.num('max', 100));
          if (n === this._v) return;
          this._v = n;
          this.paint();
          if (user) this.emit('input', { value: n });
          if (commit) this.emit('change', { value: n });
        }
      }
      return UsaVolumeKnob as unknown as CustomElementConstructor;
    },
    { id: 'volume-knob', text: css }
  );
}
