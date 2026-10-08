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
 * <usa-toggle use:usa={{ props: { checked: on }, on: { change: (e) => (on = e.detail.checked) } }}></usa-toggle>
 * ```
 * Plain `on:usa:change` does not compile in Svelte 3/4 (colon); use the action or `onusa:change` in Svelte 5.
 */
import { defineComponents, type ComponentCategory } from '../index';
import { bindUsa, type UsaBinding } from './bind';

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
