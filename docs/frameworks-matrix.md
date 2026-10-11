# Framework regression matrix (13.5.0)

`test/frameworks/` holds one small fixture app per framework. Each one is server-rendered in plain Node (no DOM), then
hydrated in Chromium against the **built** package (`dist/`, resolved through `node_modules/motionary` → repository
root, exactly like an installed package). CI runs it in the `Frameworks` workflow (`.github/workflows/frameworks.yml`: one job per framework, Chromium only,
not a required check). The cross-engine component suite stays in `test/browser` ([browser-matrix.md](browser-matrix.md)).

## Tested versions and results

| Fixture | Versions (pinned) | Element pattern under test | SSR → hydrate | Property binding | `usa:*` event | Unmount | Keep-alive | Types (`tsc --noEmit`) |
|---|---|---|---|---|---|---|---|---|
| `react18` | react / react-dom 18.3.1 | `createUsaComponents(React)` wrappers (`UsaSwitch`, `onUsaChange`) | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `react19` | react / react-dom 19.3.0 | raw `<usa-switch checked={…}>` + ref callback over `bindUsa` | ✓ | ✓ | ✓ | ✓ | — | ✓ (`UsaReact19IntrinsicElements`) |
| `vue3` | vue 3.5.43 | `:checked.prop` + `@usa:change`, `isCustomElement: isUsaElement` | ✓ | ✓ | ✓ | ✓ | ✓ `<KeepAlive>` | ✓ (`UsaGlobalComponents`) |
| `svelte5` | svelte 5.57.2 | `use:usa={{ props, on }}` action | ✓ | ✓ | ✓ | ✓ | — | ✓ (`UsaSvelteElements`) |
| `solid` | solid-js 1.9.17 (babel-preset-solid 1.9.16) | `prop:checked` + `use:usa` directive | ✓ | ✓ | ✓ | ✓ | — | ✓ (`UsaIntrinsicElements`) |
| `angular` | @angular/* 21.2.25 (JIT, zoneless, hydration) | `CUSTOM_ELEMENTS_SCHEMA`, `[checked]` + `[usaOn]` directive over `bindUsa` | ✓ | ✓ | ✓ | ✓ | — | ✓ |

Each fixture also fails the build on any bundler warning (except esbuild's harmless `ignored-bare-import` into
`dist/chunks`) and on any warning printed during server rendering.

Types: `svelte5` and `solid` type-check type-level assertion files only (`types/check.ts(x)`); `.svelte` templates and Vue
templates are not type-checked (`svelte-check` / `vue-tsc` are not part of the matrix — deferred).

## Bugs the matrix found (fixed in 13.5.0)

- **React wrappers covered only the core tags.** `createUsaComponents(React)` built wrappers for the 86 core-category
  tags; every widget (`UsaSwitch`, `UsaTabs`, …) was `undefined`. Wrappers are now created lazily for any `Usa*` name.
  The JSX types had the same gap (`<usa-switch>` was not an intrinsic element) and now cover all 209 manifest tags.
- **React 18 SSR warning.** The wrappers called `useLayoutEffect` on the server; they now use `useEffect` when there is
  no `document`.
- **Properties set before the element is defined were lost.** Vue `.prop`, Solid `prop:` and the React 18 wrappers can
  set `checked` on the element before `customElements.define()` runs; that own property shadowed the class accessor.
  The element base now re-applies such properties on upgrade.
- **`kebab()` broke tags with digit segments** (`UsaCarousel3d` → `usa-carousel3d`); now `usa-carousel-3d`.
- **Bare chunk imports.** Hoisted chunk imports made esbuild / Vite print `ignored-bare-import` for every entry; the
  build no longer hoists transitive imports.

## Documentation that was wrong (fixed in 13.5.0)

- **React 19 + SSR:** React 19 does not attach custom-element event props (`onusa:change`) to server-rendered elements
  it hydrates (only to elements it creates on the client). Use a ref callback over `bindUsa`
  ([frameworks-ssr.md](frameworks-ssr.md)).
- **Angular:** `(usa:change)` does not compile in Angular 17+ (`Unexpected global target 'usa'`). Use the `[usaOn]`
  directive over `bindUsa`.
- **Solid:** `on:usa:change` is not valid JSX (two colons). Use `use:usa`.
- **Svelte 5:** `onusa:change` triggers `attribute_illegal_colon`. Use the `use:usa` action in every Svelte version.

## Not covered yet

- Meta-framework apps (Next.js, Nuxt, SvelteKit, SolidStart, Analog) — the fixtures use each framework's own SSR API.
- A performance baseline per framework.
- `vue-tsc` / `svelte-check` template type-checking.

## Run it locally

```bash
npm run build
for fw in react18 react19 vue3 svelte5 solid angular; do
  (cd test/frameworks/$fw && npm install --no-save) && node test/frameworks/build.mjs $fw
done
node test/frameworks/typecheck.mjs
npx playwright test -c test/frameworks/playwright.config.mjs      # FW=vue3 for one framework
```
