'use strict';

var components = require('../components.cjs');
var indexTags = require('../chunks/index-tags-hLIF2Clq.cjs');
var bind = require('../chunks/bind-Ui43-n2d.cjs');
require('./reveal.cjs');
require('../chunks/base-vu_KhBiv.cjs');
require('./text.cjs');
require('../chunks/core-E18xla6s.cjs');
require('./tokens.cjs');
require('./interaction.cjs');
require('./feedback.cjs');
require('./background.cjs');
require('../chunks/variants-Dk-FItCT.cjs');
require('./transitions.cjs');
require('./physics.cjs');
require('../chunks/spring-Q3Y-pHuP.cjs');
require('./cards.cjs');
require('./click.cjs');
require('../chunks/fx-lszndeFU.cjs');
require('./ui.cjs');
require('./page.cjs');
require('./timeline.cjs');
require('./gesture.cjs');
require('../chunks/core-DfkeC4s-.cjs');
require('./svg.cjs');
require('../chunks/key-click-v7I4K5Sr.cjs');
require('./webgl.cjs');
require('./depth.cjs');
require('./layout.cjs');
require('./packs.cjs');
require('./fx.cjs');
require('../chunks/registry-EziiQiWO.cjs');
require('../chunks/builtins-A9ihuDwy.cjs');
require('./a11y.cjs');
require('./perf.cjs');
require('./bridge.cjs');

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
/** Read `event.detail` from a `usa:*` event in a template handler: `(usa:change)="on = usaDetail($event).checked"`. */
const usaDetail = (e) => e.detail;

exports.bindUsa = bind.bindUsa;
exports.usaEventName = bind.usaEventName;
exports.USA_TAGS = USA_TAGS;
exports.defineUsa = defineUsa;
exports.isUsaElement = isUsaElement;
exports.provideUsa = provideUsa;
exports.usaDetail = usaDetail;
exports.usaInitializer = usaInitializer;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/components/angular.cjs.map