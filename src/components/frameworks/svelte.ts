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
import { defineComponents, type ComponentCategory } from '../index';
import { bindUsa, type UsaBinding } from './bind';
import type { UsaElementAttributeMap, UsaElementTag } from './elements.generated';

export type { UsaElementAttributeMap, UsaElementEventMap, UsaElementTag } from './elements.generated';

/** `SvelteHTMLElements` entries for every `<usa-*>` tag (no `svelte` import): documented attributes + any other attribute. */
export type UsaSvelteElements = { [K in UsaElementTag]: UsaElementAttributeMap[K] & { [attr: string]: any } };

export { bindUsa, usaEventName } from './bind';
export type { UsaBinding } from './bind';

/** Svelte action: `use:usa={{ props, on }}`. */
export function usa(node: HTMLElement, binding: UsaBinding = {}): { update(b: UsaBinding): void; destroy(): void } {
  return bindUsa(node, binding);
}

/** Register the elements (all, or some categories) — call from `onMount` for SSR apps. */
export function defineUsa(categories?: ComponentCategory[]): void {
  if (typeof window !== 'undefined') defineComponents(categories);
}
