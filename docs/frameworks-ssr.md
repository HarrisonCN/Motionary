# Next.js, Astro, React, Vue — using `<usa-*>` components (v2.9)

All entry points are **SSR-safe**: importing never touches `window`/`document`; `define*()` is a no-op on the server. Register on the client only.

## Next.js (App Router)
```tsx
// app/usa-provider.tsx
'use client';
import { useEffect } from 'react';
export function UsaProvider() {
  useEffect(() => { import('motionary/components/lazy').then((m) => m.lazyDefine()); }, []);
  return null;
}
// app/layout.tsx → <body><UsaProvider />{children}</body>
```
The raw tags render on the server as plain HTML and upgrade on hydration. Type them with `motionary/components/jsx`:
```ts
// usa-jsx.d.ts
import type { UsaIntrinsicElements } from 'motionary/components/jsx';
declare module 'react' { namespace JSX { interface IntrinsicElements extends UsaIntrinsicElements {} } }
```
Prefer typed wrappers (React 18 sets properties & `usa:*` events for you):
```tsx
'use client';
import * as React from 'react';
import { createUsaComponents } from 'motionary/components/react';
export const { UsaButton, UsaToggle, UsaCard } = createUsaComponents(React);
// <UsaToggle checked={on} onUsaChange={(e) => setOn(e.detail.checked)} />
```
Page transitions in the App Router: wrap `router.push` in `pageTransition(() => router.push(href), { effect: 'slide' })`.

## Astro
```astro
---
// src/layouts/Base.astro
---
<html><body>
  <slot />
  <script>
    import { lazyDefine } from 'motionary/components/lazy';
    import { enableMpaTransitions } from 'motionary/components/page';
    lazyDefine();
    enableMpaTransitions('fade'); // cross-page View Transitions (or use Astro's <ClientRouter />)
  </script>
</body></html>
```
Use the tags directly in `.astro`, `.md` and island components. With `<ClientRouter />` call `lazyDefine()` again on `astro:page-load`.

## Vue / Nuxt
```js
// vite.config.js
import { isUsaElement } from 'motionary/components/vue';
vue({ template: { compilerOptions: { isCustomElement: isUsaElement } } });
// main.js (or a Nuxt client plugin: plugins/usa.client.ts)
import { UsaPlugin } from 'motionary/components/vue';
app.use(UsaPlugin);            // or app.use(UsaPlugin, { categories: ['click', 'ui'] })
```
`<usa-toggle :checked.prop="on" @usa:change="on = $event.detail.checked" />`

## Svelte / Solid / Angular
Custom elements work as-is: Svelte (`on:usa:change`), Solid (`on:usa:change`, `prop:checked`), Angular (`schemas: [CUSTOM_ELEMENTS_SCHEMA]`). Call `defineComponents()` or `lazyDefine()` in the client entry.

## Lazy registration
`lazyDefine()` (from `motionary/components/lazy`) watches the DOM and dynamically imports only the categories whose tags appear — a page with just `<usa-button>` loads the click chunk only.

## Svelte / SvelteKit (v3.8)

```svelte
<script>
  import { onMount } from 'svelte';
  import { usa, defineUsa } from 'motionary/components/svelte';
  onMount(() => defineUsa());
  let on = false;
</script>
<usa-toggle use:usa={{ props: { checked: on }, on: { change: (e) => (on = e.detail.checked) } }}></usa-toggle>
```

## Solid / SolidStart (v3.8)

```tsx
import { onMount } from 'solid-js';
import { defineUsa } from 'motionary/components/solid';
onMount(() => defineUsa());
<usa-toggle prop:checked={on()} on:usa:change={(e) => setOn(e.detail.checked)} />;
```

## Angular (v3.8)

```ts
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { usaInitializer, usaDetail } from 'motionary/components/angular';
// app.config.ts
providers: [{ provide: APP_INITIALIZER, multi: true, useFactory: usaInitializer() }];
// component
@Component({ standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<usa-toggle [checked]="on" (usa:change)="on = detail($event).checked"></usa-toggle>` })
export class Settings { on = false; detail = usaDetail; }
```

MAUI, Flutter WebView, Electron and Tauri: see [hybrid-apps.md](./hybrid-apps.md).
