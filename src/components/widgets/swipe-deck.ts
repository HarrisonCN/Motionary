import { defineElement, type UsaElement } from '../base';
import { ownChildren } from './shared';
import css from './swipe-deck.css?raw';

/**
 * `<usa-swipe-deck>` (6.8) — a stack of swipe cards (Tinder style). Drag the
 * top card: it follows the pointer and rotates, "LIKE" / "NOPE" stamps fade
 * in, and past `threshold` px (or a fast fling) it flies off; otherwise it
 * springs back. The next card scales up from behind. Buttons / keys:
 * `like()`, `nope()`, ← / →, and `undo()` brings the last card back.
 * Event `usa:swipe` (`{ card, dir: 'left' | 'right', index }`) and
 * `usa:empty`. Reduced motion: cards fade instead of flying.
 */
export interface UsaSwipeDeckElement extends UsaElement {
  readonly cards: HTMLElement[];
  readonly top: HTMLElement | null;
  like(): void;
  nope(): void;
  undo(): void;
}

export function defineSwipeDeck(tag = 'usa-swipe-deck'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSwipeDeck extends Base {
        private _cards: HTMLElement[] = [];
        private _gone: HTMLElement[] = [];

        get cards(): HTMLElement[] {
          return this._cards.filter((c) => !this._gone.includes(c));
        }
        get top(): HTMLElement | null {
          return this.cards[0] || null;
        }

        mount(): void {
          this._cards = ownChildren(this);
          this._gone = [];
          this.setAttribute('role', 'region');
          this.setAttribute('aria-roledescription', 'card deck');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Cards'));
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          this._cards.forEach((c) => {
            c.classList.add('usa-sd-card');
            if (!c.querySelector(':scope > .usa-sd-stamp')) {
              c.insertAdjacentHTML('beforeend', '<span class="usa-sd-stamp usa-sd-like" data-usa-part aria-hidden="true">LIKE</span><span class="usa-sd-stamp usa-sd-nope" data-usa-part aria-hidden="true">NOPE</span>');
            }
          });
          this.layout();
          this.listen(this, 'pointerdown', (e: PointerEvent) => this.drag(e));
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') this.like();
            else if (e.key === 'ArrowLeft') this.nope();
            else if (e.key === 'Backspace' || (e.key === 'z' && (e.ctrlKey || e.metaKey))) this.undo();
            else return;
            e.preventDefault();
          });
        }

        private layout(): void {
          this.cards.forEach((c, i) => {
            c.style.zIndex = String(100 - i);
            c.style.transform = i ? `translateY(${Math.min(i, 2) * 10}px) scale(${1 - Math.min(i, 2) * 0.05})` : '';
            c.style.opacity = i > 2 ? '0' : '1';
            c.toggleAttribute('data-top', i === 0);
            c.setAttribute('aria-hidden', String(i !== 0));
          });
          this._cards.filter((c) => this._gone.includes(c)).forEach((c) => (c.style.visibility = 'hidden'));
        }

        private stamp(c: HTMLElement, dx: number): void {
          const k = Math.min(1, Math.abs(dx) / Math.max(40, this.num('threshold', 110)));
          (c.querySelector('.usa-sd-like') as HTMLElement | null)?.style.setProperty('opacity', dx > 0 ? k.toFixed(2) : '0');
          (c.querySelector('.usa-sd-nope') as HTMLElement | null)?.style.setProperty('opacity', dx < 0 ? k.toFixed(2) : '0');
        }

        private fly(dir: 'left' | 'right', dx = 0, dy = 0): void {
          const c = this.top;
          if (!c) return;
          const index = this._cards.indexOf(c);
          this._gone.push(c);
          const sign = dir === 'right' ? 1 : -1;
          const w = this.getBoundingClientRect().width || 300;
          const done = () => {
            c.style.visibility = 'hidden';
            this.stamp(c, 0);
          };
          const a = this.reduced
            ? this.motion(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' })
            : this.motion(c, [{ transform: `translate(${dx}px,${dy}px) rotate(${dx * 0.06}deg)` }, { transform: `translate(${sign * w * 1.5}px,${dy + 60}px) rotate(${sign * 30}deg)`, opacity: 0.6 }], { duration: 420, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
          if (a) a.finished.then(done, done);
          else done();
          this.layout();
          const next = this.top;
          if (next && !this.reduced) this.motion(next, [{ transform: 'translateY(10px) scale(.95)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.3,1.3,.5,1)' });
          this.emit('swipe', { card: c, dir, index });
          if (!this.top) this.emit('empty', {});
        }

        like(): void {
          this.fly('right');
        }
        nope(): void {
          this.fly('left');
        }
        undo(): void {
          const c = this._gone.pop();
          if (!c) return;
          c.getAnimations?.().forEach((a) => a.cancel());
          c.style.visibility = '';
          this.layout();
          if (!this.reduced) this.motion(c, [{ transform: 'translate(-120%,40px) rotate(-25deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
        }

        private drag(e: PointerEvent): void {
          const c = this.top;
          if (!c || !c.contains(e.target as Node) || e.button > 0) return;
          const x0 = e.clientX;
          const y0 = e.clientY;
          const t0 = performance.now();
          let dx = 0;
          let dy = 0;
          c.setPointerCapture?.(e.pointerId);
          c.classList.add('usa-sd-dragging');
          const move = (ev: PointerEvent) => {
            dx = ev.clientX - x0;
            dy = ev.clientY - y0;
            c.style.transform = `translate(${dx}px,${dy}px) rotate(${this.reduced ? 0 : dx * 0.06}deg)`;
            this.stamp(c, dx);
          };
          const up = () => {
            c.removeEventListener('pointermove', move);
            c.removeEventListener('pointerup', up);
            c.removeEventListener('pointercancel', up);
            c.classList.remove('usa-sd-dragging');
            const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
            if (Math.abs(dx) > this.num('threshold', 110) || (v > 0.6 && Math.abs(dx) > 30)) this.fly(dx > 0 ? 'right' : 'left', dx, dy);
            else {
              const from = c.style.transform;
              c.style.transform = '';
              this.stamp(c, 0);
              if (!this.reduced && from) this.motion(c, [{ transform: from }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.3,1.5,.5,1)' });
            }
          };
          c.addEventListener('pointermove', move);
          c.addEventListener('pointerup', up);
          c.addEventListener('pointercancel', up);
        }
      }
      return UsaSwipeDeck as unknown as CustomElementConstructor;
    },
    { id: 'swipe-deck', text: css }
  );
}
