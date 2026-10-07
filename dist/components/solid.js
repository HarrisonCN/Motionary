import { defineComponents } from '../components.js';
import { b as bindUsa } from '../chunks/bind-B_CTL6Qn.js';
export { u as usaEventName } from '../chunks/bind-B_CTL6Qn.js';
import './reveal.js';
import '../chunks/base-BRIPyPtX.js';
import './text.js';
import './interaction.js';
import './feedback.js';
import './background.js';
import '../chunks/variants-DTypaOH3.js';
import './transitions.js';
import './physics.js';
import '../chunks/spring-UBPhrh1X.js';
import './cards.js';
import './click.js';
import './ui.js';
import './page.js';
import './timeline.js';
import './gesture.js';
import '../chunks/core-CYozf_E-.js';
import './svg.js';
import './webgl.js';
import './depth.js';
import './layout.js';
import './packs.js';
import '../chunks/index-tags-BmQR17Sb.js';

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
 * accessor; the binding is read once on mount and re-read whenever
 * `refresh()` on the returned handle is called (or wrap it in `createEffect`).
 */
function usa(el, accessor) {
    const b = bindUsa(el, accessor() || {});
    return { refresh: () => b.update(accessor() || {}), destroy: b.destroy };
}
/** Register the elements (all, or some categories) — call from `onMount` in SSR apps. */
function defineUsa(categories) {
    if (typeof window !== 'undefined')
        defineComponents(categories);
}

export { bindUsa, defineUsa, usa };
//# sourceMappingURL=solid.js.map
