# motionary · Animation Store

A "shop" for every effect of the library: each preset, feature and framework
adapter is a product card with a live preview; open one to tweak its options
and copy the generated code (Vanilla / React / Vue / Svelte / Solid /
`<scroll-animate>` / CDN).

- **No build step, no framework.** `app.js` imports the library from `../dist/`
  (dogfooding the ESM build, plus `dist/element.js` and `dist/svelte.js`) and
  falls back to `https://unpkg.com/motionary@6/dist/`.
- `catalog.js` (cards), `codegen.js` (snippets) and `i18n.js` (English / 中文)
  are plain data/pure functions covered by `test/showcase.test.ts`.

## Component gallery (`components.html`)

`components.html` + `gallery.js` showcase the 30 `<usa-*>` animated components
(`motionary/components`) by category, with live demos, search and
code tabs (HTML / ES module / React / Vue / Electron·Tauri·WebView2). It imports
`../dist/components.js` (CDN fallback). `components-catalog.js` and
`gallery-i18n.js` are pure data covered by `test/components-showcase.test.ts`.

## Run locally

```bash
npm run build          # only if dist/ is missing or stale
npx serve .            # or: python3 -m http.server
# open http://localhost:3000/showcase/   (deep link: /showcase/#flip-up)
# components: http://localhost:3000/showcase/components.html#cat-text
```

It must be served from the repository root so `../dist/` resolves.

## Deploy

`.github/workflows/pages.yml` builds `dist/` and publishes `showcase/`,
`demo/` and `dist/` to GitHub Pages on every push to `main`
(Settings → Pages → Source: **GitHub Actions**).
