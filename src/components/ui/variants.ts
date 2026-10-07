import { adoptStyles } from '../base';
import css from './variants.css?raw';

/**
 * Style variants (v2.6): `variant="minimal | neon | glass | brutalist |
 * fluent | material"` on any `<usa-*>` element — or on any ancestor as
 * `data-usa-variant`, or page-wide with `setVariant()` — sets the shared
 * design tokens every component reads:
 *
 * `--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`,
 * `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font`.
 *
 * (`<usa-spinner>`, `<usa-check>` and `<usa-dialog>` already use `variant`
 * for their kind; the token names never clash with those values except
 * `fluent`, which means the same thing there.)
 */
export const VARIANTS = ['minimal', 'neon', 'glass', 'brutalist', 'fluent', 'material'] as const;
export type Variant = (typeof VARIANTS)[number];

/** Inject the variant token sheet (done automatically by every `ui` component). */
export function adoptVariants(): void {
  adoptStyles('variants', css);
}

/** Apply a variant to the whole page (or `root`); `null` removes it. */
export function setVariant(variant: Variant | null, root: Element | null = typeof document !== 'undefined' ? document.documentElement : null): void {
  if (!root) return;
  adoptVariants();
  if (variant) root.setAttribute('data-usa-variant', variant);
  else root.removeAttribute('data-usa-variant');
}
