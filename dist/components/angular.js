import { defineComponents } from '../components.js';
export { b as bindUsa, u as usaEventName } from '../chunks/bind-B_CTL6Qn.js';
import './reveal.js';
import '../chunks/base-DchG4q_S.js';
import './text.js';
import '../chunks/core-DVyTlo9Q.js';
import './tokens.js';
import './interaction.js';
import './feedback.js';
import './background.js';
import '../chunks/variants-C_hv_s23.js';
import './transitions.js';
import './physics.js';
import '../chunks/spring-BhoT09Qb.js';
import './cards.js';
import './click.js';
import '../chunks/fx-DUMVKSvg.js';
import './ui.js';
import './page.js';
import './timeline.js';
import './gesture.js';
import '../chunks/core-D2vF8kZb.js';
import './svg.js';
import './webgl.js';
import './depth.js';
import './layout.js';
import './packs.js';
import './fx.js';
import '../chunks/registry-D23neB4M.js';
import './a11y.js';
import '../chunks/index-tags-DucKMQr_.js';
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
 *   template: `<usa-toggle [checked]="on" (usa:change)="on = $any($event).detail.checked"></usa-toggle>` })
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
