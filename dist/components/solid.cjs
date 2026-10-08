'use strict';

var solidJs = require('solid-js');
var components = require('../components.cjs');
var bind = require('../chunks/bind-Ui43-n2d.cjs');
require('./reveal.cjs');
require('../chunks/base-BaQV-2ha.cjs');
require('./text.cjs');
require('../chunks/core-BGAyaY6L.cjs');
require('./tokens.cjs');
require('./interaction.cjs');
require('./feedback.cjs');
require('./background.cjs');
require('../chunks/variants-BhjyddG8.cjs');
require('./transitions.cjs');
require('./physics.cjs');
require('../chunks/spring-Dgx187Vh.cjs');
require('./cards.cjs');
require('./click.cjs');
require('../chunks/fx-lBGVtQO1.cjs');
require('./ui.cjs');
require('./page.cjs');
require('./timeline.cjs');
require('./gesture.cjs');
require('../chunks/core-zq17EeCI.cjs');
require('./svg.cjs');
require('./webgl.cjs');
require('./depth.cjs');
require('./layout.cjs');
require('./packs.cjs');
require('./fx.cjs');
require('../chunks/registry-DehBVRDV.cjs');
require('../chunks/builtins-xalxV2d5.cjs');
require('./a11y.cjs');
require('../chunks/index-tags-BTMwrfgV.cjs');
require('./perf.cjs');
require('./bridge.cjs');

/**
 * motionary/components/solid — Solid integration (v3.8).
 * Solid renders custom elements natively: set properties with `prop:` and
 * listen with `on:` (`<usa-switch prop:checked={on()} on:usa:change={…}>`).
 * This entry adds `defineUsa()` (client only, SolidStart-safe), a `usa`
 * directive for `use:usa={{ props, on }}`, and JSX types.
 *
 * ```tsx
 * import { defineUsa, usa } from 'motionary/components/solid';
 * import type {} from 'motionary/components/solid'; // JSX types
 * onMount(() => defineUsa());
 * false && usa; // keep the directive import (Solid convention)
 * <usa-card use:usa={{ on: { flip: (e) => console.log(e.detail) } }} effect="flip">…</usa-card>
 * ```
 */
/**
 * Solid directive (`use:usa`). Solid calls it with the element and an
 * accessor; since 4.0.1 the binding is tracked with `createRenderEffect`, so
 * signals read inside `{{ props, on }}` update the element automatically and
 * the listeners are removed on cleanup. `refresh()` is kept for code that
 * calls the directive outside a reactive owner.
 */
function usa(el, accessor) {
    let b = null;
    const run = () => {
        const v = accessor() || {};
        if (b)
            b.update(v);
        else
            b = bind.bindUsa(el, v);
    };
    solidJs.createRenderEffect(run);
    if (!b)
        run();
    const destroy = () => b?.destroy();
    solidJs.onCleanup(destroy);
    return { refresh: run, destroy };
}
/** Register the elements (all, or some categories) — call from `onMount` in SSR apps. */
function defineUsa(categories) {
    if (typeof window !== 'undefined')
        components.defineComponents(categories);
}

exports.bindUsa = bind.bindUsa;
exports.usaEventName = bind.usaEventName;
exports.defineUsa = defineUsa;
exports.usa = usa;
//# sourceMappingURL=solid.cjs.map
