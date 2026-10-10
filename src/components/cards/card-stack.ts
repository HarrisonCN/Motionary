import { defineElement, type UsaElement } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';
import css from './card-stack.css?raw';

/**
 * `<usa-card-stack>` — a deck of cards (its element children). The top card
 * can be swiped away left or right (pointer, touch or arrow keys); the rest
 * fan out behind it and move up with a spring.
 *
 * Attributes: `threshold` (px to dismiss, 90), `visible` (cards fanned
 * behind, 3), `offset` (px between cards, 10), `loop` (swiped cards go back
 * to the bottom), `disabled`. Methods: `swipe(direction)`, `top`. Events:
 * `usa:swipe` (`{ direction: 'left' | 'right', card }`), `usa:empty`.
 * Reduced motion: cards are removed instantly, no rotation.
 */
export interface UsaCardStackElement extends UsaElement {
  readonly top: HTMLElement | null;
  swipe(direction: 'left' | 'right'): Promise<void>;
}

export function defineCardStack(tag = 'usa-card-stack'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaCardStack extends Base {
        static get observedAttributes(): string[] {
          return ['visible', 'offset', 'disabled', 'threshold', 'loop'];
        }

        private _x!: SpringValue;
        private _drag: { id: number; x0: number; t0: number } | null = null;
        private _busy = false;

        get top(): HTMLElement | null {
          return this.cards()[0] || null;
        }

        private cards(): HTMLElement[] {
          return Array.from(this.children).filter((c) => !(c as HTMLElement).hasAttribute('data-gone')) as HTMLElement[];
        }

        private layout(dragX = 0): void {
          const visible = this.num('visible', 3);
          const off = this.num('offset', 10);
          const reduced = this.reduced;
          this.cards().forEach((c, i) => {
            c.style.zIndex = String(100 - i);
            c.toggleAttribute('data-top', i === 0);
            c.setAttribute('aria-hidden', String(i !== 0));
            if (i === 0) {
              const rot = reduced ? 0 : dragX / 18;
              c.style.transform = `translate3d(${dragX}px, 0, 0) rotate(${rot.toFixed(2)}deg)`;
              c.style.opacity = '1';
            } else {
              const k = Math.min(i, visible);
              const pull = Math.min(1, Math.abs(dragX) / this.num('threshold', 90));
              const kk = Math.max(0, k - pull);
              c.style.transform = `translate3d(0, ${(kk * off).toFixed(1)}px, 0) scale(${(1 - kk * 0.05).toFixed(3)})`;
              c.style.opacity = i > visible ? '0' : '1';
            }
          });
        }

        mount(): void {
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
          this.setAttribute('aria-roledescription', 'card stack');
          this._x = createSpring({ spring: 'wobbly', onUpdate: (v) => this.layout(v) });
          this.layout();
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            if (this.flag('disabled') || this._busy || !this.top || !this.top.contains(e.target as Node)) return;
            this._x.stop();
            this._drag = { id: e.pointerId, x0: e.clientX - this._x.value, t0: e.timeStamp };
            try {
              this.setPointerCapture?.(e.pointerId);
            } catch {
              /* synthetic */
            }
            this.setAttribute('data-dragging', '');
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (!this._drag || e.pointerId !== this._drag.id) return;
            this._x.jump(e.clientX - this._drag.x0);
          });
          const up = (e: PointerEvent) => {
            if (!this._drag || e.pointerId !== this._drag.id) return;
            this._drag = null;
            this.removeAttribute('data-dragging');
            const x = this._x.value;
            if (Math.abs(x) >= this.num('threshold', 90)) this.swipe(x > 0 ? 'right' : 'left');
            else this._x.set(0);
          };
          this.listen(this, 'pointerup', up);
          this.listen(this, 'pointercancel', up);
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              this.swipe(e.key === 'ArrowLeft' ? 'left' : 'right');
            }
          });
          const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => this.layout(this._x.value)) : null;
          mo?.observe(this, { childList: true });
          this.onCleanup(() => mo?.disconnect());
        }

        unmount(): void {
          this._x?.stop();
        }

        async swipe(direction: 'left' | 'right'): Promise<void> {
          const card = this.top;
          if (!card || this._busy || this.flag('disabled')) return;
          this._busy = true;
          this._x.stop();
          const from = this._x.value;
          const to = (direction === 'left' ? -1 : 1) * Math.max(320, (this.getBoundingClientRect().width || 300) * 1.4);
          card.setAttribute('data-gone', '');
          this._x.jump(0);
          this.layout(0);
          const a = this.reduced
            ? null
            : this.motion(card, [{ transform: `translate3d(${from}px,0,0) rotate(${from / 18}deg)`, opacity: 1 }, { transform: `translate3d(${to}px,0,0) rotate(${to / 14}deg)`, opacity: 0 }], {
                duration: 380,
                easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)',
                fill: 'forwards',
              });
          await a?.finished.catch(() => undefined);
          a?.cancel();
          card.removeAttribute('data-gone');
          if (this.flag('loop')) this.append(card);
          else card.remove();
          this.layout(0);
          this._busy = false;
          this.emit('swipe', { direction, card });
          if (!this.top) this.emit('empty');
        }
      },
    { id: 'card-stack', text: css }
  );
}
