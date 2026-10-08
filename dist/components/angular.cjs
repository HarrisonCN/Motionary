'use strict';

var components = require('../components.cjs');
var bind = require('../chunks/bind-Ui43-n2d.cjs');
require('./reveal.cjs');
require('../chunks/base-CxYU2NK_.cjs');
require('./text.cjs');
require('../chunks/core-HLqH3qkA.cjs');
require('./tokens.cjs');
require('./interaction.cjs');
require('./feedback.cjs');
require('./background.cjs');
require('../chunks/variants-CfJzrzMh.cjs');
require('./transitions.cjs');
require('./physics.cjs');
require('../chunks/spring-Dkpygsuj.cjs');
require('./cards.cjs');
require('./click.cjs');
require('./ui.cjs');
require('./page.cjs');
require('./timeline.cjs');
require('./gesture.cjs');
require('../chunks/core-CctNfzuP.cjs');
require('./svg.cjs');
require('./webgl.cjs');
require('./depth.cjs');
require('./layout.cjs');
require('./packs.cjs');
require('./a11y.cjs');
require('../chunks/index-tags-CIRY2KnU.cjs');
require('./perf.cjs');
require('./bridge.cjs');

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
/** `APP_INITIALIZER` factory: registers the elements in the browser (no-op during SSR). */
function usaInitializer(categories) {
    return () => () => {
        if (typeof window !== 'undefined')
            components.defineComponents(categories);
    };
}
/** Register the elements directly (e.g. in `main.ts` before `bootstrapApplication`). */
function defineUsa(categories) {
    if (typeof window !== 'undefined')
        components.defineComponents(categories);
}
/** Read `event.detail` from a `usa:*` event in a template handler: `(usa:change)="on = usaDetail($event).checked"`. */
const usaDetail = (e) => e.detail;

exports.bindUsa = bind.bindUsa;
exports.usaEventName = bind.usaEventName;
exports.defineUsa = defineUsa;
exports.usaDetail = usaDetail;
exports.usaInitializer = usaInitializer;
//# sourceMappingURL=angular.cjs.map
