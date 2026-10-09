# @rive-app/canvas — Official Rive runtime

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

The official MIT-licensed Rive runtime, used by <usa-rive> to play .riv files (artboards, animations, state machines with inputs). Optional peer dependency: lazy-loaded on first use, never bundled into Motionary.

**Runtime tier:** standard — see [runtime tiers](../runtime-tiers.md).

**Official third-party runtime** (optional peer dependency, lazy-loaded). Why not our own: .riv is Rive’s proprietary binary format with a state-machine runtime; the official runtime is the only faithful player, so Motionary does not reimplement it.

## Prerequisites

1. **Install:** `npm i @rive-app/canvas`
2. **Import path:** `@rive-app/canvas`
3. **CDN:**

```html
<script src="https://unpkg.com/@rive-app/canvas@2.44.1/rive.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/@rive-app/canvas@2.44.1/+esm`

4. **Import order & registration:** Install the official runtime next to motionary, then hand <usa-rive> a lazy loader with provideRiveRuntime(() => import('@rive-app/canvas')) before the element mounts — your bundler splits the runtime into its own chunk, fetched only when the first <usa-rive> appears. Without a bundler: load the official rive.js from a CDN before the component bundles (window.rive), use an import map, or set runtime-src on the element. Missing → a clear message in place + usa:runtime-missing.

```js
import { provideRiveRuntime } from 'motionary/components/widgets';
provideRiveRuntime(() => import('@rive-app/canvas')); // lazy: fetched when the first <usa-rive> mounts
```

## Example

```js
// npm i @rive-app/canvas
import { defineRive } from 'motionary/components/widgets';
defineRive();
// <usa-rive src="/anim/icon.riv" state-machine="State Machine 1" autoplay></usa-rive>
```

## Exports

`provideRiveRuntime` · `loadRiveRuntime` · `RIVE_PEER` · `RIVE_CDN`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| .riv files: artboards, linear animations | ✅ yes | played by the official runtime |
| state machines + inputs (boolean, number, trigger) | ✅ yes | el.input(name) |
| fit: contain, cover, fill, fitWidth, fitHeight, none | ✅ yes |  |
| lazy loading, clear error when the runtime is missing | ✅ yes | usa:runtime-missing |
| reduced motion | ✅ yes | no autoplay (first frame) |
| WebGL2 renderer (@rive-app/webgl2) | ◐ partial | pass its URL as runtime-src or provideRiveRuntime(() => import('@rive-app/webgl2')) |
| SSR | ✅ yes | nothing loads until the element mounts in a browser |

## Components that need it

- `<usa-rive>` — Rive player (official runtime)
