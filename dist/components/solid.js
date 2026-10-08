import { createRenderEffect, onCleanup } from 'solid-js';
import { defineComponents } from '../components.js';
import { b as bindUsa } from '../chunks/bind-B_CTL6Qn.js';
export { u as usaEventName } from '../chunks/bind-B_CTL6Qn.js';
import './reveal.js';
import '../chunks/base-CZiIAMBc.js';
import './text.js';
import '../chunks/core-CJHJeMI_.js';
import './tokens.js';
import './interaction.js';
import './feedback.js';
import './background.js';
import '../chunks/variants-D9n-3x27.js';
import './transitions.js';
import './physics.js';
import '../chunks/spring-BS5tg6aK.js';
import './cards.js';
import './click.js';
import './ui.js';
import './page.js';
import './timeline.js';
import './gesture.js';
import '../chunks/core-COi3DrLx.js';
import './svg.js';
import './webgl.js';
import './depth.js';
import './layout.js';
import './packs.js';
import './a11y.js';
import '../chunks/index-tags-43Xtd01A.js';
import './perf.js';
import './bridge.js';

/**
 * use-scroll-animate/components/solid — Solid integration (v3.8).
 * Solid renders custom elements natively: set properties with `prop:` and
 * listen with `on:` (`<usa-toggle prop:checked={on()} on:usa:change={…}>`).
 * This entry adds `defineUsa()` (client only, SolidStart-safe), a `usa`
 * directive for `use:usa={{ props, on }}`, and JSX types.
 *
 * ```tsx
 * import { defineUsa, usa } from 'use-scroll-animate/components/solid';
 * import type {} from 'use-scroll-animate/components/solid'; // JSX types
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
//# sourceMappingURL=solid.js.map
