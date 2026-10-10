/**
 * motionary/angular — Angular integration (v3.8; 11.5: top-level entry `motionary/angular`, parity with the
 * React / Vue / Svelte / Solid entries). The old path `motionary/components/angular` is the same file and is
 * deprecated (removed in 13.0). Angular renders `<usa-*>` tags once the component (or NgModule) allows
 * custom elements with `CUSTOM_ELEMENTS_SCHEMA`; property binding `[checked]="on"` and event binding
 * `(usa:change)="…"` then work as is. This entry is framework-free (no `@angular/*` import):
 *
 * ```ts
 * import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
 * import { provideUsa, usaDetail } from 'motionary/angular';
 *
 * // app.config.ts
 * providers: [provideUsa(APP_INITIALIZER, ['click', 'ui'])]
 *
 * @Component({ standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
 *   template: `<usa-switch [checked]="on" (usa:change)="on = $any($event).detail.checked"></usa-switch>` })
 * ```
 * Parity with the other wrappers: register (`defineUsa` · `usaInitializer` · `provideUsa`, like Vue's `UsaPlugin`),
 * tag list (`USA_TAGS`, like React), custom-element predicate (`isUsaElement`, like Vue), imperative binding
 * (`bindUsa`, like Svelte / Solid), event names (`usaEventName`) and event payloads (`usaDetail`).
 */
import { defineComponents, type ComponentCategory } from '../index';
import { COMPONENT_CATEGORIES } from '../index-tags';

export { bindUsa, usaEventName } from './bind';
export type { UsaBinding } from './bind';

/** All `<usa-*>` tags shipped by the package (same list as `motionary/react`'s wrappers). */
export const USA_TAGS: string[] = /*#__PURE__*/ Object.values(COMPONENT_CATEGORIES).flat() as string[];

/** `true` for every `<usa-*>` tag — e.g. for a custom schema check or a template linter. */
export const isUsaElement = (tag: string): boolean => tag.startsWith('usa-');

/** `APP_INITIALIZER` factory: registers the elements in the browser (no-op during SSR). */
export function usaInitializer(categories?: ComponentCategory[]): () => () => void {
  return () => () => {
    if (typeof window !== 'undefined') defineComponents(categories);
  };
}

/** A provider for `providers: [...]`: pass Angular's `APP_INITIALIZER` token (this entry never imports `@angular/core`). */
export function provideUsa<T>(appInitializer: T, categories?: ComponentCategory[]): { provide: T; multi: true; useFactory: () => () => void } {
  return { provide: appInitializer, multi: true, useFactory: usaInitializer(categories) };
}

/** Register the elements directly (e.g. in `main.ts` before `bootstrapApplication`). */
export function defineUsa(categories?: ComponentCategory[]): void {
  if (typeof window !== 'undefined') defineComponents(categories);
}

/** Read `event.detail` from a `usa:*` event in a template handler: `(usa:change)="on = usaDetail($event).checked"`. */
export const usaDetail = <T = any>(e: Event): T => (e as CustomEvent<T>).detail;
