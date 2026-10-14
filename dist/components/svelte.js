import { defineComponents } from '../components.js';
import { b as bindUsa } from '../chunks/bind-B_CTL6Qn.js';
export { u as usaEventName } from '../chunks/bind-B_CTL6Qn.js';

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
 * Use the action in every Svelte version: plain `on:usa:change` does not compile in Svelte 3/4 (colon), and in
 * Svelte 5 `onusa:change` triggers the `attribute_illegal_colon` warning (13.5.0) — `use:usa` is warning-free.
 *
 * Element types (13.5.0, generated from the manifest; svelte-check):
 * ```ts
 * // src/usa-svelte.d.ts
 * import type { UsaSvelteElements } from 'motionary/components/svelte';
 * declare module 'svelte/elements' { interface SvelteHTMLElements extends UsaSvelteElements {} }
 * ```
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
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v15.0.0-rc.1/dist/components/svelte.js.map