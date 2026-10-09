# Prompt guide: getting good Motionary code from an AI assistant

Motionary publishes machine-readable docs so assistants can stop guessing. These prompts and checks get reliable results.

## 1. Give the model the manifest

> Use Motionary. Before writing code, read https://harrisoncn.github.io/Motionary/llms.txt (and llms-full.txt for details). Only use tags, attributes and events listed there.

With an MCP-capable client (from 10.4) connect `npx motionary-mcp` instead; it answers `search_components` / `get_component` / `scaffold_snippet` from the same manifest.

## 2. Ask for a component by intent, then let the model pick

Good: *"A pricing section where the cards slide in as you scroll and the middle one is pinned while the others pass."*
The model should search the manifest (`scroll`, `pin`, `reveal`) and pick, e.g., `<usa-scroll-scene pin>` + `<usa-reveal>`.

Less good: *"Use usa-pin-cards"* — a tag that does not exist. Ask the model to confirm every tag against the manifest.

## 3. Ask for the minimal example first

> Start from the component's `example` in the manifest, then change only what I asked for.

Manifest examples are tested in the gallery, so starting from them avoids broken markup.

## 4. Prerequisites — the most common mistake

If a component's manifest entry has `requires`, the generated code **must** include, in this order:

1. the install command (`npm i motionary`, or the official runtime it names, e.g. `npm i @rive-app/canvas`);
2. the runtime import and `use(...)` registration (or the CDN `<script>` tags: `runtime.iife.js` first, then the module);
3. the component's define function;
4. the markup.

Checklist to paste into a review prompt:

- [ ] every `<usa-*>` tag exists in `components.json`;
- [ ] every attribute is listed in that component's `attributes`;
- [ ] events are `usa:*` names from `events`;
- [ ] `requires` prerequisites are installed, imported and registered before the define call;
- [ ] no third-party animation library was added unless the manifest asks for it;
- [ ] nothing disables reduced-motion handling.

## 5. Common misuses

| Mistake | Fix |
|---|---|
| Importing from `use-scroll-animate` in new code | import from `motionary` (same build) |
| Calling `defineX()` during SSR and expecting output | define on the client; SSR renders the light-DOM content |
| Forgetting `use(module)` for runtime-powered components | follow the component's Prerequisites (the visible error tells you the exact line) |
| Using `<usa-carousel>` APIs from other libraries (Swiper, Embla) | use only the documented attributes of the Motionary element |
| Animating with inline `transition` on the same properties a component animates | let the component own its motion |

## 6. Validation

From 10.7, `motionary-mcp`'s `validate_snippet` checks tags, attributes and prerequisites automatically.
