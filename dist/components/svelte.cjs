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
require('../chunks/key-click-v7I4K5Sr.cjs');
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
 * motionary/components/svelte — Svelte integration (v3.8).
 * Svelte (3, 4, 5) renders `<usa-*>` tags natively; `use:usa` sets
 * **properties** and `usa:*` listeners in one place, and `defineUsa()`
 * registers the elements on the client only (safe in SvelteKit SSR).
 *
 * ```svelte
 * <script>
 *   import { usa, defineUsa } from 'motionary/components/svelte';
 *   import { onMount } from 'svelte';
 *   onMount(() => defineUsa(['click', 'ui']));
 *   let on = false;
 * </script>
 * <usa-switch use:usa={{ props: { checked: on }, on: { change: (e) => (on = e.detail.checked) } }}></usa-switch>
 * ```
 * Plain `on:usa:change` does not compile in Svelte 3/4 (colon); use the action or `onusa:change` in Svelte 5.
 */
/** Svelte action: `use:usa={{ props, on }}`. */
function usa(node, binding = {}) {
    return bind.bindUsa(node, binding);
}
/** Register the elements (all, or some categories) — call from `onMount` for SSR apps. */
function defineUsa(categories) {
    if (typeof window !== 'undefined')
        components.defineComponents(categories);
}

exports.bindUsa = bind.bindUsa;
exports.usaEventName = bind.usaEventName;
exports.defineUsa = defineUsa;
exports.usa = usa;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.1.0/dist/components/svelte.cjs.map