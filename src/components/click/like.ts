import { defineElement, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import { burst, haptic } from './fx';
import css from './like.css?raw';

const HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.2 1.7-2 3.2-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z';

/**
 * `<usa-like>` — a like / favourite toggle: the heart pops with a spring and
 * bursts into particles when liked. `role="button"` + `aria-pressed`.
 *
 * Attributes: `liked`, `count` (shown next to the heart, updated ±1),
 * `label` (accessible name, default "Like"), `color`, `size` (px, 24),
 * `haptic`, `disabled`. Events: `change`, `usa:change` (`{ liked, count }`).
 * Reduced motion: colour change only.
 */
export interface UsaLikeElement extends UsaElement {
  liked: boolean;
  count: number | null;
  toggle(force?: boolean): void;
}

export function defineLike(tag = 'usa-like'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaLike extends Base {
        static get observedAttributes(): string[] {
          return ['liked', 'count', 'label', 'disabled', 'size', 'color', 'haptic'];
        }

        get liked(): boolean {
          return this.flag('liked');
        }
        set liked(v: boolean) {
          this.setFlag('liked', v);
        }
        get count(): number | null {
          return this.hasAttribute('count') ? this.num('count', 0) : null;
        }
        set count(v: number | null) {
          if (v === null) this.removeAttribute('count');
          else this.setAttribute('count', String(v));
        }

        mount(): void {
          if (!this.querySelector(':scope > .usa-like-heart')) {
            const size = this.num('size', 24);
            this.insertAdjacentHTML('afterbegin', `<svg class="usa-like-heart" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${HEART}"/></svg><span class="usa-like-count" aria-hidden="true"></span>`);
          }
          if (this.str('color')) this.style.setProperty('--usa-like-color', this.str('color'));
          this.setAttribute('role', 'button');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          this.sync();
          this.listen(this, 'click', () => this.toggle());
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
              e.preventDefault();
              this.toggle();
            }
          });
        }

        changed(): void {
          this.sync();
        }

        private sync(): void {
          const c = this.count;
          const label = this.str('label', 'Like');
          this.setAttribute('aria-pressed', String(this.liked));
          this.setAttribute('aria-label', c === null ? label : `${label} (${c})`);
          this.toggleAttribute('aria-disabled', this.flag('disabled'));
          const out = this.querySelector('.usa-like-count');
          if (out) out.textContent = c === null ? '' : new Intl.NumberFormat().format(c);
        }

        toggle(force?: boolean): void {
          if (this.flag('disabled')) return;
          const next = force === undefined ? !this.liked : force;
          if (next === this.liked) return;
          this.liked = next;
          if (this.count !== null) this.count = Math.max(0, this.count + (next ? 1 : -1));
          this.sync();
          const heart = this.querySelector('.usa-like-heart');
          if (next && heart && !this.reduced) {
            this.motion(heart, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], springEasing('bouncy'));
            const r = heart.getBoundingClientRect();
            burst(r.left + r.width / 2, r.top + r.height / 2, { count: 10, distance: 28, size: 5, colors: [getComputedStyle(this).getPropertyValue('--usa-like-color').trim() || '#f43f5e', '#fb923c', '#facc15'] });
          }
          if (this.hasAttribute('haptic')) haptic(this.num('haptic', 12));
          this.dispatchEvent(new Event('change', { bubbles: true }));
          this.emit('change', { liked: next, count: this.count });
        }
      },
    { id: 'like', text: css }
  );
}
