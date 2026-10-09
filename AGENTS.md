# AGENTS.md — using Motionary from an AI assistant

This file tells AI coding agents (and the people prompting them) how to pick and use Motionary components correctly. It applies to code that *uses* Motionary; contributors should also read [CONTRIBUTING.md](CONTRIBUTING.md).

## Sources of truth (read these, do not guess)

| What | Where |
|---|---|
| Every component: tag, attributes, events, slots, methods, import path, define function, CDN URL, minimal example, prerequisites | `motionary/manifest.json` in the npm package · `https://harrisoncn.github.io/Motionary/components.json` (JSON Schema: `components.schema.json`) |
| Short index for LLMs | `https://harrisoncn.github.io/Motionary/llms.txt` |
| Full reference in one file | `https://harrisoncn.github.io/Motionary/llms-full.txt` |
| One Markdown page per component | [`docs/components/<tag>.md`](docs/components/README.md) |
| Runtime modules (`motionary/runtime/*`) and their compatibility tables | [`docs/runtime/`](docs/runtime/) |
| Prompting tips and common mistakes | [`docs/ai-prompt-guide.md`](docs/ai-prompt-guide.md) |

All of these are generated from the source at build time, so they match the installed version. If a tag or attribute is not in the manifest, it does not exist — do not invent it.

## Rules

1. **Install once:** `npm i motionary` (the old name `use-scroll-animate` is a compatibility alias). No other packages are needed except the few components whose manifest entry lists an official third-party runtime under `requires` (e.g. `<usa-rive>` from 10.6 needs `@rive-app/canvas`).
2. **Register before use.** Each component has a define function: `import { defineX } from '<import.path>'; defineX();` — or load the CDN bundle (`components.umd.js`, plus `widgets.umd.js` for 6.x+ widgets), which registers everything.
3. **Prerequisites first.** If a component's `requires` is non-empty, register those modules *before* the component mounts:
   ```js
   import { use } from 'motionary/runtime';
   import { scroll } from 'motionary/runtime/scroll';
   use(scroll);                 // also registers the runtime core
   import { defineScrollScene } from 'motionary/components/widgets';
   defineScrollScene();
   ```
   On a plain HTML page load `runtime.iife.js` first, then each `runtime/<module>.iife.js`, then the component bundles. A missing module shows a visible error that names the exact install / import / CDN fix.
4. **Use only documented attributes, events (`usa:*`) and methods.** Attribute values are strings; boolean attributes are present/absent.
5. **Accessibility is built in.** Every component honours `prefers-reduced-motion`; do not add your own motion overrides unless asked. Keep real text in the light DOM (components split / animate it accessibly).
6. **Frameworks:** Web Components work everywhere. React: `motionary/components/react` (`createUsaComponents`); Vue: mark `usa-*` as custom elements; Svelte / Solid / Angular helpers live in `motionary/components/<framework>`.
7. **SSR:** importing any entry is safe on the server (nothing touches `window` at import); call define functions / `use()` on the client.
8. **Prefer the smallest import:** a single category (`motionary/components/cards`), a single runtime module, or `motionary/core` for presets only.

## Minimal templates

Plain HTML:

```html
<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>
<usa-reveal effect="fade-up"><h2>Hello</h2></usa-reveal>
```

Bundler:

```js
import { defineReveal } from 'motionary/components/reveal';
defineReveal();
```

Declarative motion without components (10.2):

```html
<ul data-motion="enter: fade-up 500ms stagger 80ms"><li>One</li><li>Two</li></ul>
<script type="module">
  import { createMotion, applyMotionAttributes } from 'motionary/core';
  applyMotionAttributes(createMotion());
</script>
```
