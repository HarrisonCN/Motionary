import { defineElement, raf, caf, clamp, type UsaElement } from '../base';
import css from './scroll-progress.css?raw';

/**
 * `<usa-scroll-progress>` — a reading-progress bar.
 *
 * Attributes: `target` (CSS selector of an article to track; default the
 * whole page), `position` (`top` | `bottom` | `inline`, default `top`),
 * `label` (accessible name, default "Reading progress"). Style with
 * `--usa-progress-color`, `--usa-progress-height`, `--usa-progress-track`.
 * Exposes the progress (0–1) as `--usa-progress` on the element and as the
 * `progress` property. Event: `usa:progress` (`detail.progress`).
 *
 * Writes only `transform: scaleX()` (compositor-friendly); reads layout
 * once per animation frame, and only while scrolling.
 */
export interface UsaScrollProgressElement extends UsaElement {
  readonly progress: number;
  /** Re-measure (e.g. after content loaded). */
  update(): void;
}

/** Progress (0–1) of `target` scrolling through the viewport, or of the page. */
export function readScrollProgress(target?: Element | null): number {
  if (typeof window === 'undefined') return 0;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  if (target) {
    const r = target.getBoundingClientRect();
    const total = r.height - vh;
    return total <= 0 ? (r.top <= 0 ? 1 : 0) : clamp(-r.top / total, 0, 1);
  }
  const doc = document.documentElement;
  const max = doc.scrollHeight - vh;
  return max <= 0 ? 0 : clamp((window.scrollY || doc.scrollTop) / max, 0, 1);
}

export function defineScrollProgress(tag = 'usa-scroll-progress'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaScrollProgress extends Base {
        static get observedAttributes(): string[] {
          return ['target', 'label'];
        }

        private _bar: HTMLElement | null = null;
        private _p = -1;
        private _frame = 0;

        get progress(): number {
          return Math.max(0, this._p);
        }

        mount(): void {
          if (!this._bar) {
            this._bar = document.createElement('span');
            this._bar.className = 'usa-progress-fill';
            this.replaceChildren(this._bar);
          }
          this.setAttribute('role', 'progressbar');
          this.setAttribute('aria-valuemin', '0');
          this.setAttribute('aria-valuemax', '100');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Reading progress'));
          const schedule = () => {
            if (!this._frame) this._frame = raf(() => ((this._frame = 0), this.update()));
          };
          this.listen(window, 'scroll', schedule, { passive: true });
          this.listen(window, 'resize', schedule, { passive: true });
          this.update();
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
        }

        update(): void {
          const sel = this.getAttribute('target');
          const target = sel ? document.querySelector(sel) : null;
          const p = readScrollProgress(target);
          if (Math.abs(p - this._p) < 0.0005) return;
          this._p = p;
          if (this._bar) this._bar.style.transform = `scaleX(${p})`;
          this.style.setProperty('--usa-progress', String(p));
          const pct = String(Math.round(p * 100));
          if (this.getAttribute('aria-valuenow') !== pct) this.setAttribute('aria-valuenow', pct);
          this.emit('progress', { progress: p });
        }
      },
    { id: 'scroll-progress', text: css }
  );
}
