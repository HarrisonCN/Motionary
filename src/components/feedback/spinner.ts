import { kindOf, defineElement, type UsaElement } from '../base';
import css from './spinner.css?raw';

export const SPINNER_VARIANTS = ['fluent', 'windows', 'ring', 'dots', 'pulse', 'bars'] as const;
export type SpinnerVariant = (typeof SPINNER_VARIANTS)[number];

/**
 * `<usa-spinner>` — indeterminate loading indicators, pure CSS animations
 * of `transform` / `opacity` (plus an SVG stroke for `fluent`).
 *
 * Kinds (`kind`; `variant` is a deprecated alias until 3.0): `fluent` (default — the WinUI / Windows 11
 * ProgressRing arc), `windows` (the Windows 10 boot "orbiting dots"),
 * `ring` (classic border spinner), `dots` (three bouncing dots / typing
 * indicator), `pulse` (expanding ripple), `bars` (equalizer).
 * Attributes: `size` (px, 32), `label` (accessible name, "Loading"),
 * `paused`. Colour follows `color` / `--usa-spinner-color`.
 * `role="progressbar"` without a value (indeterminate). Reduced motion:
 * a slow opacity pulse instead of movement.
 */
export interface UsaSpinnerElement extends UsaElement {
  /** Spinner kind (`kind` attribute). */
  kind: SpinnerVariant;
  /** @deprecated alias of `kind`, removed in 3.0. */
  variant: SpinnerVariant;
}

function markup(variant: string): string {
  switch (variant) {
    case 'windows':
      return '<i></i><i></i><i></i><i></i><i></i>';
    case 'dots':
      return '<i></i><i></i><i></i>';
    case 'bars':
      return '<i></i><i></i><i></i><i></i>';
    case 'pulse':
      return '<i></i><i></i>';
    case 'ring':
      return '<i></i>';
    default:
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" pathLength="100"/></svg>';
  }
}

export function defineSpinner(tag = 'usa-spinner'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaSpinner extends Base {
        static get observedAttributes(): string[] {
          return ['kind', 'variant', 'size', 'label'];
        }

        /** The spinner kind (`kind` attribute; `variant` is a deprecated alias until 3.0). */
        get kind(): SpinnerVariant {
          return kindOf(this, SPINNER_VARIANTS, 'fluent') as SpinnerVariant;
        }
        set kind(v: SpinnerVariant) {
          this.setAttribute('kind', v);
        }
        /** @deprecated use `kind` (removed in 3.0). */
        get variant(): SpinnerVariant {
          return this.kind;
        }
        set variant(v: SpinnerVariant) {
          this.kind = v;
        }

        mount(): void {
          const variant = this.kind;
          if (this.getAttribute('data-variant') !== variant) {
            this.innerHTML = markup(variant);
            this.setAttribute('data-variant', variant);
          }
          const size = this.getAttribute('size');
          if (size) this.style.setProperty('--usa-spinner-size', `${Number(size)}px`);
          else this.style.removeProperty('--usa-spinner-size');
          this.setAttribute('role', 'progressbar');
          if (!this.hasAttribute('aria-label') || this.hasAttribute('label')) this.setAttribute('aria-label', this.str('label', 'Loading'));
        }
      },
    { id: 'spinner', text: css }
  );
}
