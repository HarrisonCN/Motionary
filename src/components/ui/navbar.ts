import { defineElement, raf, caf, type UsaElement } from '../base';
import { adoptVariants } from './variants';
import css from './navbar.css?raw';

/**
 * `<usa-navbar>` — an app bar that hides while you scroll down and returns
 * as soon as you scroll up (or reach the top); `shrink` makes it compact
 * once scrolled. Focus inside always reveals it.
 * Attributes: `threshold` (px of scroll before hiding, 64), `shrink`,
 * `target` (selector of a scroll container instead of the page), `variant`.
 * State attributes: `data-hidden`, `data-scrolled`. Events: `usa:hide`, `usa:show`.
 * Reduced motion: hides/shows without sliding (instant).
 */
export interface UsaNavbarElement extends UsaElement {
  readonly hiddenByScroll: boolean;
  show(): void;
}

export function defineNavbar(tag = 'usa-navbar'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) =>
      class UsaNavbar extends Base {
        private _frame = 0;
        private _last = 0;

        get hiddenByScroll(): boolean {
          return this.hasAttribute('data-hidden');
        }

        mount(): void {
          const sel = this.str('target');
          const scroller: HTMLElement | Window = (sel && (document.querySelector(sel) as HTMLElement)) || window;
          const pos = () => (scroller === window ? window.scrollY || document.documentElement.scrollTop : (scroller as HTMLElement).scrollTop);
          this._last = pos();
          const update = () => {
            this._frame = 0;
            const y = pos();
            const dy = y - this._last;
            this._last = y;
            this.toggleAttribute('data-scrolled', y > 4);
            if (y <= this.num('threshold', 64) || dy < -2) this.show();
            else if (dy > 2 && !this.contains(document.activeElement)) this.hide();
          };
          const on = () => {
            // contract-exempt: reduced-motion — rAF only throttles the scroll-synced hide / show check
            if (!this._frame) this._frame = raf(update);
          };
          this.listen(scroller, 'scroll', on, { passive: true });
          this.listen(this, 'focusin', () => this.show());
          update();
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
        }

        private hide(): void {
          if (this.hiddenByScroll) return;
          this.setAttribute('data-hidden', '');
          this.emit('hide');
        }

        show(): void {
          if (!this.hiddenByScroll) return;
          this.removeAttribute('data-hidden');
          this.emit('show');
        }
      },
    { id: 'navbar', text: css }
  );
}
