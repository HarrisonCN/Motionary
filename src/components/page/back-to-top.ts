import { defineElement, raf, caf, type UsaElement } from '../base';
import { scrollToTarget } from './scroll';
import css from './back-to-top.css?raw';

/**
 * `<usa-back-to-top>` — a floating button that appears after `offset` px
 * (300) of scrolling, shows page progress as a ring and springs the page
 * back to the top (then focuses `focus-target`, default `#main` / `body`).
 * Attributes: `offset`, `label` ("Back to top"), `focus-target`, `position`
 * (`bottom-right` default, `bottom-left`). Reduced motion: instant jump.
 */
export interface UsaBackToTopElement extends UsaElement {
  readonly visible: boolean;
}

export function defineBackToTop(tag = 'usa-back-to-top'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaBackToTop extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'offset', 'focus-target'];
        }
        private _frame = 0;
        get visible(): boolean {
          return this.hasAttribute('data-visible');
        }
        mount(): void {
          if (!this.querySelector('button')) {
            this.innerHTML = `<button type="button" aria-label="${this.str('label', 'Back to top')}"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="16" pathLength="100"/><path d="M12 20l6-6 6 6"/></svg></button>`;
          }
          const btn = this.querySelector('button')!;
          const update = () => {
            this._frame = 0;
            const y = window.scrollY || document.documentElement.scrollTop || 0;
            const max = Math.max(1, (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0));
            this.toggleAttribute('data-visible', y > this.num('offset', 300));
            this.style.setProperty('--usa-btt', Math.min(1, y / max).toFixed(4));
          };
          this.listen(window, 'scroll', () => {
            // contract-exempt: reduced-motion — rAF only throttles the scroll-synced visibility check, no decorative motion
            if (!this._frame) this._frame = raf(update);
          }, { passive: true });
          this.listen(btn, 'click', async () => {
            await scrollToTarget(0, { preset: 'slow' });
            const f = document.querySelector<HTMLElement>(this.str('focus-target', '#main')) || document.body;
            if (!f.hasAttribute('tabindex') && f !== document.body) f.tabIndex = -1;
            f.focus?.({ preventScroll: true });
          });
          update();
        }
        unmount(): void {
          caf(this._frame);
          this._frame = 0;
        }
      },
    { id: 'back-to-top', text: css }
  );
}
