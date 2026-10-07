import { defineElement, type UsaElement } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';
import { gesture, type SwipeDirection } from './core';
import css from './gesture.css?raw';

/**
 * `<usa-swipeable>` — swipe-to-dismiss / swipe actions. The content follows
 * the finger (rubber-banded past `distance`), flies out on a swipe or a drag
 * past `distance`, otherwise springs home with the release velocity.
 *
 * Attributes: `axis` (`x` default · `y`), `distance` (px, 120), `preset`
 * (spring), `dismiss` (remove the element after flying out), `disabled`.
 * Keyboard: Delete/Backspace dismisses, ←/→ swipe. Events `usa:swipe`
 * (`{ direction }`, cancelable), `usa:dismiss`. Methods `swipe(dir)`, `reset()`.
 * Reduced motion: no follow / fly-out animation, events still fire.
 */
export interface UsaSwipeableElement extends UsaElement {
  swipe(direction: SwipeDirection): void;
  reset(): void;
  readonly offset: number;
}

export function defineSwipeable(tag = 'usa-swipeable'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaSwipeable extends Base {
        static get observedAttributes(): string[] {
          return ['axis', 'disabled'];
        }
        private _s!: SpringValue;
        private _off = 0;

        get offset(): number {
          return this._off;
        }

        private put(v: number): void {
          this._off = v;
          this.style.setProperty('--usa-swipe', `${v}px`);
          this.style.setProperty('--usa-swipe-p', String(Math.min(1, Math.abs(v) / this.num('distance', 120))));
        }

        swipe(direction: SwipeDirection): void {
          if (!this.emit('swipe', { direction })) return this.reset();
          const sign = direction === 'left' || direction === 'up' ? -1 : 1;
          const far = sign * ((this.str('axis', 'x') === 'y' ? this.offsetHeight : this.offsetWidth) + 80 || 600);
          const done = () => {
            this.emit('dismiss', { direction });
            if (this.flag('dismiss')) this.remove();
          };
          if (this.reduced) {
            this.put(0);
            return done();
          }
          this.setAttribute('data-gone', '');
          this._s = createSpring({ spring: 'stiff', value: this._off, onUpdate: (v) => this.put(v), onRest: done });
          this._s.set(far, sign * 1500);
        }

        reset(): void {
          this.removeAttribute('data-gone');
          if (this.reduced) return this.put(0);
          this._s.set(0);
        }

        mount(): void {
          this._s = createSpring({ spring: this.str('preset', 'default'), onUpdate: (v) => this.put(v) });
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          const y = this.str('axis', 'x') === 'y';
          const max = () => this.num('distance', 120);
          this.onCleanup(
            gesture(this, {
              onPan: ({ dx, dy, vx, vy, last }) => {
                if (this.flag('disabled')) return;
                const d = y ? dy : dx;
                if (!last) {
                  this._s.stop();
                  if (!this.reduced) this.put(Math.abs(d) > max() ? Math.sign(d) * (max() + (Math.abs(d) - max()) * 0.35) : d);
                  return;
                }
                if (Math.abs(d) > max()) this.swipe(y ? (d > 0 ? 'down' : 'up') : d > 0 ? 'right' : 'left');
                else if (!this.hasAttribute('data-gone')) {
                  if (this.reduced) this.put(0);
                  else this._s.set(0, y ? vy : vx);
                }
              },
              onSwipe: ({ direction }) => {
                if (this.flag('disabled') || this.hasAttribute('data-gone')) return;
                if (y === (direction === 'up' || direction === 'down')) this.swipe(direction);
              },
            }, { axis: y ? 'y' : 'x' })
          );
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (this.flag('disabled')) return;
            const map: Record<string, SwipeDirection> = y ? { ArrowUp: 'up', ArrowDown: 'down' } : { ArrowLeft: 'left', ArrowRight: 'right' };
            if (e.key === 'Delete' || e.key === 'Backspace') this.swipe(y ? 'up' : 'left');
            else if (map[e.key]) this.swipe(map[e.key]);
            else return;
            e.preventDefault();
          });
        }

        unmount(): void {
          this._s?.stop();
        }
      },
    { id: 'gesture', text: css }
  );
}
