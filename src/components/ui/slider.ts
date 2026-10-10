import { defineElement, clamp, type UsaElement } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';
import { adoptVariants } from './variants';
import css from './slider.css?raw';

/**
 * `<usa-slider>` — a form-associated range slider (`role="slider"`). The
 * thumb follows with a spring, grows while dragged and shows a value bubble.
 * Keyboard: arrows (step), PageUp/PageDown (10 steps), Home/End.
 * Attributes: `value`, `min` (0), `max` (100), `step` (1), `name`, `label`,
 * `bubble` (show the value while dragging), `disabled`, `variant`.
 * Events: `input` + `usa:input` while moving, `change` + `usa:change` on release.
 * Reduced motion: the thumb jumps (no spring).
 */
export interface UsaSliderElement extends UsaElement {
  value: number;
}

export function defineSlider(tag = 'usa-slider'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) => {
      class UsaSlider extends Base {
        static formAssociated = true;
        static get observedAttributes(): string[] {
          return ['min', 'max', 'disabled', 'label', 'step', 'value'];
        }
        private _internals: ElementInternals | null = null;
        private _v = 0;
        private _pos!: SpringValue;
        private _id = -1;

        constructor() {
          super();
          try {
            this._internals = (this as any).attachInternals?.() ?? null;
          } catch {
            this._internals = null;
          }
        }

        private range(): [number, number, number] {
          const min = this.num('min', 0);
          const max = Math.max(min + 1e-9, this.num('max', 100));
          return [min, max, Math.max(1e-9, this.num('step', 1))];
        }
        get value(): number {
          return this._v;
        }
        set value(v: number) {
          this.setValue(v, false);
        }

        private fraction(v = this._v): number {
          const [min, max] = this.range();
          return (v - min) / (max - min);
        }

        private setValue(v: number, user: boolean, animate = true): void {
          const [min, max, step] = this.range();
          const q = clamp(Math.round((v - min) / step) * step + min, min, max);
          const val = Number(q.toFixed(10));
          const changed = val !== this._v;
          this._v = val;
          this.setAttribute('aria-valuenow', String(val));
          this.setAttribute('aria-valuetext', String(val));
          this._internals?.setFormValue?.(String(val));
          const bubble = this.querySelector('.usa-slider-bubble');
          if (bubble) bubble.textContent = String(val);
          if (animate) this._pos?.set(this.fraction());
          else this._pos?.jump(this.fraction());
          if (changed && user) {
            this.dispatchEvent(new Event('input', { bubbles: true }));
            this.emit('input', { value: val });
          }
        }

        mount(): void {
          if (!this.querySelector(':scope > .usa-slider-track')) {
            this.innerHTML = '<span class="usa-slider-track"><span class="usa-slider-fill"></span></span><span class="usa-slider-thumb"><span class="usa-slider-bubble"></span></span>';
          }
          this.setAttribute('role', 'slider');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          const [min, max] = this.range();
          this.setAttribute('aria-valuemin', String(min));
          this.setAttribute('aria-valuemax', String(max));
          if (this.str('label')) this.setAttribute('aria-label', this.str('label'));
          this.toggleAttribute('aria-disabled', this.flag('disabled'));
          this._pos = createSpring({ spring: 'stiff', onUpdate: (f) => this.style.setProperty('--usa-slider', clamp(f, 0, 1).toFixed(4)) });
          this.setValue(this.num('value', min), false, false);
          const fromPointer = (e: PointerEvent) => {
            const r = this.getBoundingClientRect();
            return min + clamp((e.clientX - r.left) / (r.width || 1), 0, 1) * (max - min);
          };
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            if (this.flag('disabled')) return;
            this._id = e.pointerId;
            try {
              this.setPointerCapture?.(e.pointerId);
            } catch {
              /* synthetic */
            }
            this.setAttribute('data-dragging', '');
            this.setValue(fromPointer(e), true);
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => e.pointerId === this._id && this.setValue(fromPointer(e), true));
          const end = (e: PointerEvent) => {
            if (e.pointerId !== this._id) return;
            this._id = -1;
            this.removeAttribute('data-dragging');
            this.commit();
          };
          this.listen(this, 'pointerup', end);
          this.listen(this, 'pointercancel', end);
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (this.flag('disabled')) return;
            const [mn, mx, st] = this.range();
            const map: Record<string, number> = { ArrowRight: this._v + st, ArrowUp: this._v + st, ArrowLeft: this._v - st, ArrowDown: this._v - st, PageUp: this._v + st * 10, PageDown: this._v - st * 10, Home: mn, End: mx };
            if (!(e.key in map)) return;
            e.preventDefault();
            this.setValue(map[e.key], true);
            this.commit();
          });
        }

        unmount(): void {
          this._pos?.stop();
        }

        private commit(): void {
          this.dispatchEvent(new Event('change', { bubbles: true }));
          this.emit('change', { value: this._v });
        }
      }
      return UsaSlider as unknown as CustomElementConstructor;
    },
    { id: 'slider', text: css }
  );
}
