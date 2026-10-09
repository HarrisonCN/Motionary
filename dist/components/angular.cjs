'use strict';

var components = require('../components.cjs');
var bind = require('../chunks/bind-Ui43-n2d.cjs');
require('./reveal.cjs');
require('../chunks/base-B3me2y0o.cjs');
require('./text.cjs');
require('../chunks/core-KIvPGg0c.cjs');
require('./tokens.cjs');
require('./interaction.cjs');
require('./feedback.cjs');
require('./background.cjs');
require('../chunks/variants-cVfgIaXa.cjs');
require('./transitions.cjs');
require('./physics.cjs');
require('../chunks/spring-DcM7pQgx.cjs');
require('./cards.cjs');
require('./click.cjs');
require('../chunks/fx-BaPAanPW.cjs');
require('./ui.cjs');
require('./page.cjs');
require('./timeline.cjs');
require('./gesture.cjs');
require('../chunks/core-BdLFN0RS.cjs');
require('./svg.cjs');
require('./webgl.cjs');
require('./depth.cjs');
require('./layout.cjs');
require('./packs.cjs');
require('./fx.cjs');
require('../chunks/registry-BB1oO-lR.cjs');
require('../chunks/builtins-Cz3iufK6.cjs');
require('./a11y.cjs');
require('../chunks/index-tags-hLIF2Clq.cjs');
require('./perf.cjs');
require('./bridge.cjs');

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
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/components/angular.cjs.map