'use strict';

var components = require('../components.cjs');
var indexTags = require('../chunks/index-tags-hLIF2Clq.cjs');
var bind = require('../chunks/bind-Ui43-n2d.cjs');

/**
 * motionary/angular — Angular integration (v3.8; 11.5: top-level entry `motionary/angular`, parity with the
 * React / Vue / Svelte / Solid entries). The old path `motionary/angular` is the same file and is
 * deprecated (removed in 13.0). Angular renders `<usa-*>` tags once the component (or NgModule) allows
 * custom elements with `CUSTOM_ELEMENTS_SCHEMA`; property binding `[checked]="on"` works as is. Events: 13.5.0 —
 * `(usa:change)="…"` does NOT compile in Angular 17+ (a colon in an event binding names a global target), so bind
 * `usa:*` events with a small `[usaOn]` directive over `bindUsa`. This entry is framework-free (no `@angular/*` import):
 *
 * ```ts
 * import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Component, Directive, ElementRef, Input, inject } from '@angular/core';
 * import { bindUsa, provideUsa, usaDetail } from 'motionary/angular';
 *
 * // app.config.ts
 * providers: [provideUsa(APP_INITIALIZER, ['click', 'ui'])]
 *
 * @Directive({ selector: '[usaOn]', standalone: true })
 * export class UsaOn {
 *   private b = bindUsa(inject(ElementRef).nativeElement);
 *   @Input({ required: true }) set usaOn(on: Record<string, (e: CustomEvent) => void>) { this.b.update({ on }); }
 *   ngOnDestroy() { this.b.destroy(); }
 * }
 *
 * @Component({ standalone: true, imports: [UsaOn], schemas: [CUSTOM_ELEMENTS_SCHEMA],
 *   template: `<usa-switch [checked]="on" [usaOn]="{ change: onChange }"></usa-switch>` })
 * class App { on = false; onChange = (e: CustomEvent) => (this.on = usaDetail(e).checked); }
 * ```
 * Parity with the other wrappers: register (`defineUsa` · `usaInitializer` · `provideUsa`, like Vue's `UsaPlugin`),
 * tag list (`USA_TAGS`, like React), custom-element predicate (`isUsaElement`, like Vue), imperative binding
 * (`bindUsa`, like Svelte / Solid), event names (`usaEventName`) and event payloads (`usaDetail`).
 */
/** All `<usa-*>` tags shipped by the package (same list as `motionary/react`'s wrappers). */
const USA_TAGS = /*#__PURE__*/ Object.values(indexTags.COMPONENT_CATEGORIES).flat();
/** `true` for every `<usa-*>` tag — e.g. for a custom schema check or a template linter. */
const isUsaElement = (tag) => tag.startsWith('usa-');
/** `APP_INITIALIZER` factory: registers the elements in the browser (no-op during SSR). */
function usaInitializer(categories) {
    return () => () => {
        if (typeof window !== 'undefined')
            components.defineComponents(categories);
    };
}
/** A provider for `providers: [...]`: pass Angular's `APP_INITIALIZER` token (this entry never imports `@angular/core`). */
function provideUsa(appInitializer, categories) {
    return { provide: appInitializer, multi: true, useFactory: usaInitializer(categories) };
}
/** Register the elements directly (e.g. in `main.ts` before `bootstrapApplication`). */
function defineUsa(categories) {
    if (typeof window !== 'undefined')
        components.defineComponents(categories);
}
/** Read `event.detail` from a `usa:*` event in a `[usaOn]` handler: `onChange = (e: CustomEvent) => (this.on = usaDetail(e).checked)`. */
const usaDetail = (e) => e.detail;

exports.bindUsa = bind.bindUsa;
exports.usaEventName = bind.usaEventName;
exports.USA_TAGS = USA_TAGS;
exports.defineUsa = defineUsa;
exports.isUsaElement = isUsaElement;
exports.provideUsa = provideUsa;
exports.usaDetail = usaDetail;
exports.usaInitializer = usaInitializer;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.5.0/dist/components/angular.cjs.map