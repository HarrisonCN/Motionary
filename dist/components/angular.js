import { defineComponents } from '../components.js';
export { b as bindUsa, u as usaEventName } from '../chunks/bind-B_CTL6Qn.js';
import './reveal.js';
import '../chunks/base-2-yYc93C.js';
import './text.js';
import '../chunks/core-D5rU0CV6.js';
import './tokens.js';
import './interaction.js';
import './feedback.js';
import './background.js';
import '../chunks/variants-BQ6bhzn4.js';
import './transitions.js';
import './physics.js';
import '../chunks/spring-BK8DiezC.js';
import './cards.js';
import './click.js';
import '../chunks/fx-CMxWNwH8.js';
import './ui.js';
import './page.js';
import './timeline.js';
import './gesture.js';
import '../chunks/core-DuO-AVXL.js';
import './svg.js';
import './webgl.js';
import './depth.js';
import './layout.js';
import './packs.js';
import './fx.js';
import '../chunks/registry-CyKExAmE.js';
import './a11y.js';
import '../chunks/index-tags-C04JP8g4.js';
import './perf.js';
import './bridge.js';

/**
 * motionary/components/angular — Angular integration (v3.8).
 * Angular renders `<usa-*>` tags once the component (or NgModule) allows
 * custom elements with `CUSTOM_ELEMENTS_SCHEMA`; property binding
 * `[checked]="on"` and event binding `(usa:change)="…"` then work as is.
 * This entry is framework-free (no `@angular/*` import):
 *
 * ```ts
 * import { CUSTOM_ELEMENTS_SCHEMA, Component, APP_INITIALIZER } from '@angular/core';
 * import { usaInitializer } from 'motionary/components/angular';
 *
 * // app.config.ts
 * providers: [{ provide: APP_INITIALIZER, multi: true, useFactory: usaInitializer(['click', 'ui']) }]
 *
 * @Component({ standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
 *   template: `<usa-switch [checked]="on" (usa:change)="on = $any($event).detail.checked"></usa-switch>` })
 * ```
 * `bindUsa(el, { props, on })` is available for directives that bind imperatively.
 */
/** `APP_INITIALIZER` factory: registers the elements in the browser (no-op during SSR). */
function usaInitializer(categories) {
    return () => () => {
        if (typeof window !== 'undefined')
            defineComponents(categories);
    };
}
/** Register the elements directly (e.g. in `main.ts` before `bootstrapApplication`). */
function defineUsa(categories) {
    if (typeof window !== 'undefined')
        defineComponents(categories);
}
/** Read `event.detail` from a `usa:*` event in a template handler: `(usa:change)="on = usaDetail($event).checked"`. */
const usaDetail = (e) => e.detail;

export { defineUsa, usaDetail, usaInitializer };
//# sourceMappingURL=angular.js.map
