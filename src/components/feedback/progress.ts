import { defineElement, clamp, type UsaElement } from '../base';
import css from './progress.css?raw';

/**
 * `<usa-progress>` — a linear progress bar. Determinate (`value` / `max`)
 * bars glide between values with `transform: scaleX()`; without a value,
 * or with `indeterminate`, it shows the Windows Fluent indeterminate
 * animation (two sliding segments).
 *
 * Attributes: `value`, `max` (100), `indeterminate`, `state`
 * (`paused` | `error` — the WinUI states), `label` (accessible name).
 * `role="progressbar"` with `aria-valuenow` when determinate.
 * Reduced motion: no glide; indeterminate becomes a gentle pulse.
 */
export interface UsaProgressElement extends UsaElement {
  value: number | null;
  max: number;
  /** 0–1, or `null` when indeterminate. */
  readonly ratio: number | null;
}

export function defineProgress(tag = 'usa-progress'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaProgress extends Base {
        static get observedAttributes(): string[] {
          return ['value', 'max', 'indeterminate', 'label'];
        }

        private _fill: HTMLElement | null = null;

        get value(): number | null {
          const v = this.getAttribute('value');
          return v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v);
        }
        set value(v: number | null) {
          if (v === null || v === undefined) this.removeAttribute('value');
          else this.setAttribute('value', String(v));
        }
        get max(): number {
          const m = this.num('max', 100);
          return m > 0 ? m : 100;
        }
        set max(v: number) {
          this.setAttribute('max', String(v));
        }
        get ratio(): number | null {
          const v = this.value;
          return this.hasAttribute('indeterminate') || v === null ? null : clamp(v / this.max, 0, 1);
        }

        changed(): void {
          this.sync();
        }

        mount(): void {
          if (!this._fill) {
            this.innerHTML = '<span class="usa-progress-bar"></span><span class="usa-progress-bar usa-progress-bar2"></span>';
            this._fill = this.firstElementChild as HTMLElement;
          }
          this.setAttribute('role', 'progressbar');
          this.sync();
        }

        private sync(): void {
          const ratio = this.ratio;
          const label = this.getAttribute('label');
          if (label) this.setAttribute('aria-label', label);
          this.toggleAttribute('data-indeterminate', ratio === null);
          if (ratio === null) {
            this.removeAttribute('aria-valuenow');
            if (this._fill) this._fill.style.transform = '';
            return;
          }
          this.setAttribute('aria-valuemin', '0');
          this.setAttribute('aria-valuemax', String(this.max));
          this.setAttribute('aria-valuenow', String(this.value));
          if (this._fill) this._fill.style.transform = `scaleX(${ratio})`;
          if (ratio === 1) this.emit('complete');
        }
      },
    { id: 'progress', text: css }
  );
}
