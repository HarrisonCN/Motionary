# `<mo-perf-monitor>` — Perf monitor

> Element name `<mo-perf-monitor>` (default since 17.3); the legacy name `<usa-perf-monitor>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.6: a live performance overlay for motion work — FPS with a sparkline, active Motionary animations, frame-loop callbacks, long tasks and the shared clock — flagging jank.

- **Category:** ui · **since** 9.6
- **Import:** `import { definePerfMonitor } from 'motionary/components/widgets'` then `definePerfMonitor();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `corner`, `warn`
- **Events:** `usa:jank`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/perf-monitor.ts](../../src/components/widgets/perf-monitor.ts)

## Minimal example

```html
<usa-perf-monitor corner="bottom-right"></usa-perf-monitor>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePerfMonitor } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePerfMonitor(); // registers <mo-perf-monitor>

/* then use it in your HTML:
<mo-perf-monitor corner="bottom-right"></mo-perf-monitor>
*/
```
