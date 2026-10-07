import { defineElement, clamp, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import { adoptVariants } from './variants';
import css from './rating.css?raw';

/**
 * `<usa-rating>` — star rating with hover preview and a springy pop when a
 * value is chosen. `role="slider"` (arrow keys, Home/End, number keys).
 * Attributes: `value` (0), `max` (5), `icon` (★), `readonly`, `label`
 * ("Rating"), `name` (form value), `variant`. Events: `change`, `usa:change` (`{ value }`).
 * Reduced motion: no pop.
 */
export interface UsaRatingElement extends UsaElement {
  value: number;
}

export function defineRating(tag = 'usa-rating'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) => {
      class UsaRating extends Base {
        static formAssociated = true;
        static get observedAttributes(): string[] {
          return ['max', 'icon', 'readonly'];
        }
        private _internals: ElementInternals | null = null;
        constructor() {
          super();
          try {
            this._internals = (this as any).attachInternals?.() ?? null;
          } catch {
            this._internals = null;
          }
        }
        get value(): number {
          return clamp(this.num('value', 0), 0, this.num('max', 5));
        }
        set value(v: number) {
          this.setAttribute('value', String(clamp(Math.round(v), 0, this.num('max', 5))));
          this.sync();
        }

        mount(): void {
          const max = this.num('max', 5);
          this.innerHTML = Array.from({ length: max }, (_, i) => `<span class="usa-rating-star" data-i="${i + 1}" aria-hidden="true">${this.str('icon', '★')}</span>`).join('');
          this.setAttribute('role', 'slider');
          this.setAttribute('aria-valuemin', '0');
          this.setAttribute('aria-valuemax', String(max));
          this.setAttribute('aria-label', this.str('label', 'Rating'));
          if (this.flag('readonly')) this.setAttribute('aria-readonly', 'true');
          else if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          this.sync();
          if (this.flag('readonly')) return;
          this.listen(this, 'pointerover', (e: PointerEvent) => {
            const s = (e.target as Element).closest?.('[data-i]') as HTMLElement | null;
            if (s) this.preview(Number(s.dataset.i));
          });
          this.listen(this, 'pointerleave', () => this.preview(0));
          this.listen(this, 'click', (e: MouseEvent) => {
            const s = (e.target as Element).closest?.('[data-i]') as HTMLElement | null;
            if (s) this.choose(Number(s.dataset.i) === this.value ? 0 : Number(s.dataset.i));
          });
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const v = this.value;
            const map: Record<string, number> = { ArrowRight: v + 1, ArrowUp: v + 1, ArrowLeft: v - 1, ArrowDown: v - 1, Home: 0, End: max };
            const n = /^[0-9]$/.test(e.key) ? Number(e.key) : map[e.key];
            if (n === undefined) return;
            e.preventDefault();
            this.choose(clamp(n, 0, max));
          });
        }

        private preview(n: number): void {
          this.querySelectorAll<HTMLElement>('[data-i]').forEach((s) => s.toggleAttribute('data-preview', n > 0 && Number(s.dataset.i) <= n));
          this.toggleAttribute('data-previewing', n > 0);
        }

        private sync(): void {
          const v = this.value;
          this.setAttribute('aria-valuenow', String(v));
          this.setAttribute('aria-valuetext', `${v} of ${this.num('max', 5)}`);
          this._internals?.setFormValue?.(String(v));
          this.querySelectorAll<HTMLElement>('[data-i]').forEach((s) => s.toggleAttribute('data-on', Number(s.dataset.i) <= v));
        }

        private choose(n: number): void {
          if (n === this.value) return;
          this.value = n;
          const star = this.querySelector(`[data-i="${n}"]`);
          if (star && !this.reduced) this.motion(star, [{ transform: 'scale(0.5) rotate(-20deg)' }, { transform: 'scale(1) rotate(0)' }], springEasing('bouncy'));
          this.dispatchEvent(new Event('change', { bubbles: true }));
          this.emit('change', { value: n });
        }
      }
      return UsaRating as unknown as CustomElementConstructor;
    },
    { id: 'rating', text: css }
  );
}
