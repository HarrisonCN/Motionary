/**
 * motionary/components/solid — Solid integration (v3.8).
 * Solid renders custom elements natively: set properties with `prop:` and
 * listen with `on:` (`<usa-toggle prop:checked={on()} on:usa:change={…}>`).
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
import { createRenderEffect, onCleanup } from 'solid-js';
import { defineComponents, type ComponentCategory } from '../index';
import { bindUsa, type UsaBinding } from './bind';
import type { UsaIntrinsicElements } from './jsx';

export { bindUsa, usaEventName } from './bind';
export type { UsaBinding } from './bind';

/**
 * Solid directive (`use:usa`). Solid calls it with the element and an
 * accessor; since 4.0.1 the binding is tracked with `createRenderEffect`, so
 * signals read inside `{{ props, on }}` update the element automatically and
 * the listeners are removed on cleanup. `refresh()` is kept for code that
 * calls the directive outside a reactive owner.
 */
export function usa(el: HTMLElement, accessor: () => UsaBinding | undefined): { refresh(): void; destroy(): void } {
  let b: ReturnType<typeof bindUsa> | null = null;
  const run = () => {
    const v = accessor() || {};
    if (b) b.update(v);
    else b = bindUsa(el, v);
  };
  createRenderEffect(run);
  if (!b) run();
  const destroy = () => b?.destroy();
  onCleanup(destroy);
  return { refresh: run, destroy };
}

/** Register the elements (all, or some categories) — call from `onMount` in SSR apps. */
export function defineUsa(categories?: ComponentCategory[]): void {
  if (typeof window !== 'undefined') defineComponents(categories);
}

/** JSX intrinsic elements for Solid (same attribute types as the React/Preact ones). */
export type SolidUsaIntrinsicElements = UsaIntrinsicElements;
