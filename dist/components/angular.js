import { defineComponents } from '../components.js';
import { C as COMPONENT_CATEGORIES } from '../chunks/index-tags-B-JBecYg.js';
export { b as bindUsa, u as usaEventName } from '../chunks/bind-B_CTL6Qn.js';
import './reveal.js';
import '../chunks/base-CBMzOs1k.js';
import './text.js';
import '../chunks/core-CBU40kLB.js';
import './tokens.js';
import './interaction.js';
import './feedback.js';
import './background.js';
import '../chunks/variants-B8gnRVha.js';
import './transitions.js';
import './physics.js';
import '../chunks/spring-2YZXQmr7.js';
import './cards.js';
import './click.js';
import '../chunks/fx-tuYvq2Dr.js';
import './ui.js';
import './page.js';
import './timeline.js';
import './gesture.js';
import '../chunks/core-D1vhyt2F.js';
import './svg.js';
import '../chunks/key-click-BLm3BI8_.js';
import './webgl.js';
import './depth.js';
import './layout.js';
import './packs.js';
import './fx.js';
import '../chunks/registry-4UDF3Dpk.js';
import '../chunks/builtins-DINhkShu.js';
import './a11y.js';
import './perf.js';
import './bridge.js';

/**
 * motionary/angular — Angular integration (v3.8; 11.5: top-level entry `motionary/angular`, parity with the
 * React / Vue / Svelte / Solid entries). The old path `motionary/angular` is the same file and is
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
/** All `<usa-*>` tags shipped by the package (same list as `motionary/react`'s wrappers). */
const USA_TAGS = /*#__PURE__*/ Object.values(COMPONENT_CATEGORIES).flat();
/** `true` for every `<usa-*>` tag — e.g. for a custom schema check or a template linter. */
const isUsaElement = (tag) => tag.startsWith('usa-');
/** `APP_INITIALIZER` factory: registers the elements in the browser (no-op during SSR). */
function usaInitializer(categories) {
    return () => () => {
        if (typeof window !== 'undefined')
            defineComponents(categories);
    };
}
/** A provider for `providers: [...]`: pass Angular's `APP_INITIALIZER` token (this entry never imports `@angular/core`). */
function provideUsa(appInitializer, categories) {
    return { provide: appInitializer, multi: true, useFactory: usaInitializer(categories) };
}
/** Register the elements directly (e.g. in `main.ts` before `bootstrapApplication`). */
function defineUsa(categories) {
    if (typeof window !== 'undefined')
        defineComponents(categories);
}
/** Read `event.detail` from a `usa:*` event in a template handler: `(usa:change)="on = usaDetail($event).checked"`. */
const usaDetail = (e) => e.detail;

export { USA_TAGS, defineUsa, isUsaElement, provideUsa, usaDetail, usaInitializer };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.2/dist/components/angular.js.map