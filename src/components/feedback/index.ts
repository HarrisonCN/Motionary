/**
 * use-scroll-animate/components/feedback — loading & feedback.
 * `<usa-spinner>`, `<usa-skeleton>`, `<usa-progress>`, `<usa-toaster>` +
 * `toast()`, `<usa-check>`.
 */
import { defineSpinner, type UsaSpinnerElement } from './spinner';
import { defineSkeleton, type UsaSkeletonElement } from './skeleton';
import { defineProgress, type UsaProgressElement } from './progress';
import { defineToaster, type UsaToasterElement } from './toast';
import { defineCheck, type UsaCheckElement } from './check';

export { defineSpinner, defineSkeleton, defineProgress, defineToaster, defineCheck };
export { toast } from './toast';
export { SPINNER_VARIANTS } from './spinner';
export type { SpinnerVariant } from './spinner';
export type { ToastOptions, ToastHandle, ToastType } from './toast';
export type { UsaSpinnerElement, UsaSkeletonElement, UsaProgressElement, UsaToasterElement, UsaCheckElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineFeedbackComponents(): void {
  defineSpinner();
  defineSkeleton();
  defineProgress();
  defineToaster();
  defineCheck();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-spinner': UsaSpinnerElement;
    'usa-skeleton': UsaSkeletonElement;
    'usa-progress': UsaProgressElement;
    'usa-toaster': UsaToasterElement;
    'usa-check': UsaCheckElement;
  }
}
