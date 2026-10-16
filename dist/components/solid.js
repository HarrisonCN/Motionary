import { createRenderEffect, onCleanup } from 'solid-js';
import { defineComponents } from '../components.js';
import { b as bindUsa } from '../chunks/bind-B_CTL6Qn.js';
export { u as usaEventName } from '../chunks/bind-B_CTL6Qn.js';

/**
 * motionary/components/solid — Solid integration (v3.8).
 * Solid renders custom elements natively: set properties with `prop:` and
 * listen with the `use:usa` directive (`<usa-switch prop:checked={on()} use:usa={{ on: { change: … } }}>`).
 * 13.5.0: `on:usa:change` is **not valid JSX** (an attribute name has at most one colon) — use `use:usa`.
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
            b = bindUsa(el, v);
    };
    createRenderEffect(run);
    if (!b)
        run();
    const destroy = () => b?.destroy();
    onCleanup(destroy);
    return { refresh: run, destroy };
}
/** Register the elements (all, or some categories) — call from `onMount` in SSR apps. */
function defineUsa(categories) {
    if (typeof window !== 'undefined')
        defineComponents(categories);
}

export { bindUsa, defineUsa, usa };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.9.0/dist/components/solid.js.map