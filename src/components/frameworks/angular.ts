/**
 * use-scroll-animate/components/angular — Angular integration (v3.8).
 * Angular renders `<usa-*>` tags once the component (or NgModule) allows
 * custom elements with `CUSTOM_ELEMENTS_SCHEMA`; property binding
 * `[checked]="on"` and event binding `(usa:change)="…"` then work as is.
 * This entry is framework-free (no `@angular/*` import):
 *
 * ```ts
 * import { CUSTOM_ELEMENTS_SCHEMA, Component, APP_INITIALIZER } from '@angular/core';
 * import { usaInitializer } from 'use-scroll-animate/components/angular';
 *
 * // app.config.ts
 * providers: [{ provide: APP_INITIALIZER, multi: true, useFactory: usaInitializer(['click', 'ui']) }]
 *
 * @Component({ standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
 *   template: `<usa-toggle [checked]="on" (usa:change)="on = $any($event).detail.checked"></usa-toggle>` })
 * ```
 * `bindUsa(el, { props, on })` is available for directives that bind imperatively.
 */
import { defineComponents, type ComponentCategory } from '../index';

export { bindUsa, usaEventName } from './bind';
export type { UsaBinding } from './bind';

/** `APP_INITIALIZER` factory: registers the elements in the browser (no-op during SSR). */
export function usaInitializer(categories?: ComponentCategory[]): () => () => void {
  return () => () => {
    if (typeof window !== 'undefined') defineComponents(categories);
  };
}

/** Register the elements directly (e.g. in `main.ts` before `bootstrapApplication`). */
export function defineUsa(categories?: ComponentCategory[]): void {
  if (typeof window !== 'undefined') defineComponents(categories);
}

/** Read `event.detail` from a `usa:*` event in a template handler: `(usa:change)="on = usaDetail($event).checked"`. */
export const usaDetail = <T = any>(e: Event): T => (e as CustomEvent<T>).detail;
