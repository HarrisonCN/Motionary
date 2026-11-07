# Liquid navigation in 17.1

The existing `<usa-liquid-nav>` supports horizontal navigation and vertical sidebars. Rapid selections cancel the previous animation after reading its visible position, so the drop continues without jumping back to an old destination. A ResizeObserver tracks the host and items, including label or font size changes. Disconnecting cancels running animations and observers. Size updates use the observer batch without a separate frame scheduler.

```js
import { defineLiquidNav } from 'motionary/components/widgets';
defineLiquidNav();
```

```html
<usa-liquid-nav orientation="vertical" label="Workspace" value="0">
  <a href="/overview">Overview</a>
  <a href="/projects">Projects</a>
  <a href="/settings">Settings</a>
</usa-liquid-nav>
```

Omit `orientation` for a horizontal bar. Arrow keys move focus and skip disabled, hidden or inert items. Horizontal arrows follow the computed text direction. Vertical navigation uses Up/Down. Home/End focus the first/last enabled item. Moving focus alone does not navigate. Native link activation and button behaviour remain available.

The `value` attribute and property update the active index without emitting a user event. A user selection emits `usa:change` with `{ index, item }` and synchronises `value` for reconnects. An explicit `value` takes precedence over initial `aria-current="page"` markup. With reduced motion, the indicator jumps directly to its destination.

The showcase's Liquid nav card has an orientation control. The generated [component reference](components/usa-liquid-nav.md) includes the new attribute. This widget stays outside the core and lite entries and adds no runtime dependency.

Validation includes unit regressions and Playwright geometry, animation interruption, keyboard, resizing, reduced-motion and cleanup checks in Chromium, Firefox and WebKit. Mobile projects use device emulation and do not establish physical-device performance.
