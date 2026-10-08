import { defineComponents } from '../components.js';
import { b as bindUsa } from '../chunks/bind-B_CTL6Qn.js';
export { u as usaEventName } from '../chunks/bind-B_CTL6Qn.js';
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
    return bindUsa(node, binding);
}
/** Register the elements (all, or some categories) — call from `onMount` for SSR apps. */
function defineUsa(categories) {
    if (typeof window !== 'undefined')
        defineComponents(categories);
}

export { bindUsa, defineUsa, usa };
//# sourceMappingURL=svelte.js.map
