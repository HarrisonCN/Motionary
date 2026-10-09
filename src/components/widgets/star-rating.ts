import { defineElement, type UsaElement } from '../base';
import { clampN, part } from './shared';
import css from './star-rating.css?raw';

/**
 * `<usa-star-rating value="3.5">` (6.4) — rating stars 2.0: the fill
 * follows the pointer (hover preview, `step="0.5"` half stars), a click
 * pops the chosen star and throws a small sparkle burst, the other stars
 * ripple in sequence. `max`, `step` (`1` · `0.5`), `readonly`, `label`,
 * `icon` (`star` · `heart`). Keyboard: it is a `role="slider"` — arrows,
 * Home / End. Events `change`, `usa:change` (`{ value }`). Form-associated
 * (7.9): with `name` the value is submitted like `<usa-rating>`'s, which it
 * replaces in 8.0. Reduced motion: no pop,
 * burst or ripple.
 */
export interface UsaStarRatingElement extends UsaElement {
  value: number;
}

const PATHS: Record<string, string> = {
  star: 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z',
  heart: 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.1 1.8-1.9 3.3-3.1 5.4-3.1 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z',
};

/** <usa-rating> icon characters accepted by `icon` (7.9). */
const ICON_ALIASES: Record<string, string> = { '★': 'star', '☆': 'star', '♥': 'heart', '❤': 'heart', '❤️': 'heart' };

export function defineStarRating(tag = 'usa-star-rating'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaStarRating extends Base {
        static formAssociated = true;
        static get observedAttributes(): string[] {
          return ['max', 'icon', 'readonly', 'step'];
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
        private _v = 0;
        private _stars: HTMLElement[] = [];

        get value(): number {
          return this._v;
        }
        set value(v: number) {
          this.set(v, false);
        }

        private get max(): number {
          return Math.max(1, Math.round(this.num('max', 5)));
        }
        private get step(): number {
          return this.num('step', 1) === 0.5 ? 0.5 : 1;
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const icon = PATHS[ICON_ALIASES[this.str('icon', 'star')] || this.str('icon', 'star')] || PATHS.star;
          this._stars = [];
          for (let i = 0; i < this.max; i++) {
            const s = part('span', 'usa-star', { 'aria-hidden': 'true' }, `<svg viewBox="0 0 24 24" width="100%" height="100%"><path class="usa-star-bg" d="${icon}"/></svg><span class="usa-star-fg"><svg viewBox="0 0 24 24" width="24" height="24"><path d="${icon}"/></svg></span>`);
            this._stars.push(s);
            this.append(s);
          }
          const ro = this.flag('readonly');
          this.setAttribute('role', ro ? 'img' : 'slider');
          if (!ro) {
            this.tabIndex = 0;
            this.setAttribute('aria-valuemin', '0');
            this.setAttribute('aria-valuemax', String(this.max));
          }
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Rating'));
          this._v = clampN(this.num('value', 0), 0, this.max);
          this.paint(this._v);
          this.sync();
          if (ro) return;
          const at = (e: PointerEvent) => {
            const r = this._stars[0].getBoundingClientRect();
            const last = this._stars[this._stars.length - 1].getBoundingClientRect();
            const w = last.right - r.left || 1;
            const raw = ((e.clientX - r.left) / w) * this.max;
            return clampN(Math.ceil(raw / this.step) * this.step, this.step, this.max);
          };
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            this.setAttribute('data-preview', '');
            this.paint(at(e));
          });
          this.listen(this, 'pointerleave', () => {
            this.removeAttribute('data-preview');
            this.paint(this._v);
          });
          this.listen(this, 'click', (e: MouseEvent) => this.set(at(e as PointerEvent), true));
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const k = e.key;
            let v = this._v;
            if (k === 'ArrowRight' || k === 'ArrowUp') v += this.step;
            else if (k === 'ArrowLeft' || k === 'ArrowDown') v -= this.step;
            else if (k === 'Home') v = 0;
            else if (k === 'End') v = this.max;
            else return;
            e.preventDefault();
            this.set(v, true);
          });
        }

        private sync(): void {
          this.setAttribute('aria-valuenow', String(this._v));
          this.setAttribute('aria-valuetext', `${this._v} of ${this.max}`);
          this._internals?.setFormValue?.(String(this._v));
          if (this.flag('readonly')) this.setAttribute('aria-label', `${this.str('label', 'Rating')}: ${this._v} of ${this.max}`);
        }

        private paint(v: number): void {
          this._stars.forEach((s, i) => s.style.setProperty('--usa-star-fill', `${(clampN(v - i, 0, 1) * 100).toFixed(0)}%`));
        }

        private set(v: number, user: boolean): void {
          const nv = clampN(Math.round(v / this.step) * this.step, 0, this.max);
          const changed = nv !== this._v;
          this._v = nv;
          this.paint(nv);
          this.sync();
          if (!user) return;
          const idx = Math.ceil(nv) - 1;
          if (!this.reduced && idx >= 0) {
            const star = this._stars[idx];
            this.motion(star, [{ transform: 'scale(1)' }, { transform: 'scale(1.45) rotate(-12deg)', offset: 0.35 }, { transform: 'scale(.92)', offset: 0.7 }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.3,1.4,.5,1)' });
            this._stars.slice(0, idx).forEach((s, i) => this.motion(s, [{ transform: 'none' }, { transform: 'translateY(-5px)' }, { transform: 'none' }], { duration: 320, delay: i * 45, easing: 'ease-out' }));
            for (let k = 0; k < 8; k++) {
              const sp = part('span', 'usa-star-spark', { 'aria-hidden': 'true' });
              star.append(sp);
              const a = (k / 8) * Math.PI * 2;
              const anim = this.motion(sp, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${(Math.cos(a) * 22).toFixed(1)}px), calc(-50% + ${(Math.sin(a) * 22).toFixed(1)}px)) scale(.2)`, opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
              const rm = () => sp.remove();
              if (anim) anim.finished.then(rm, rm);
              else rm();
            }
          }
          if (changed) {
            this.dispatchEvent(new Event('change', { bubbles: true }));
            this.emit('change', { value: nv });
          }
        }
      }
      return UsaStarRating as unknown as CustomElementConstructor;
    },
    { id: 'star-rating', text: css }
  );
}
