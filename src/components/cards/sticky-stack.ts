import { defineElement, raf, caf, clamp, type UsaElement } from '../base';
import css from './sticky-stack.css?raw';

/**
 * `<usa-sticky-stack>` — cards (element children) stick to the top while
 * scrolling and the ones underneath scale down and dim as the next card
 * slides over them, like a deck building up.
 *
 * Attributes: `top` (px from the viewport top, 80), `gap` (px each card
 * peeks below the previous, 16), `scale` (how much a covered card shrinks,
 * 0.06). Reduced motion: cards still stack (sticky) but do not scale.
 */
export interface UsaStickyStackElement extends UsaElement {
  update(): void;
}

export function defineStickyStack(tag = 'usa-sticky-stack'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaStickyStack extends Base {
        static get observedAttributes(): string[] {
          return ['top', 'gap', 'scale'];
        }

        private _frame = 0;

        mount(): void {
          const top = this.num('top', 80);
          const gap = this.num('gap', 16);
          const cards = Array.from(this.children) as HTMLElement[];
          cards.forEach((c, i) => {
            c.style.top = `${top + i * gap}px`;
            c.style.zIndex = String(i + 1);
          });
          if (this.reduced) return;
          const schedule = () => {
            if (!this._frame) this._frame = raf(() => this.update());
          };
          let active = false;
          this.inView((v) => {
            if (v && !active) {
              active = true;
              window.addEventListener('scroll', schedule, { passive: true });
              window.addEventListener('resize', schedule, { passive: true });
              schedule();
            } else if (!v && active) {
              active = false;
              window.removeEventListener('scroll', schedule);
              window.removeEventListener('resize', schedule);
            }
          });
          this.onCleanup(() => {
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
          });
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
        }

        update(): void {
          this._frame = 0;
          const cards = Array.from(this.children) as HTMLElement[];
          const rects = cards.map((c) => c.getBoundingClientRect());
          const shrink = this.num('scale', 0.06);
          cards.forEach((c, i) => {
            let covered = 0;
            for (let j = i + 1; j < cards.length; j++) {
              const h = rects[i].height || 1;
              covered += clamp((rects[i].bottom - rects[j].top) / h, 0, 1);
            }
            const s = 1 - Math.min(3, covered) * shrink;
            c.style.transform = covered > 0.001 ? `scale(${s.toFixed(4)})` : '';
            c.style.filter = covered > 0.001 ? `brightness(${(1 - Math.min(0.35, covered * 0.12)).toFixed(3)})` : '';
          });
        }
      },
    { id: 'sticky-stack', text: css }
  );
}
