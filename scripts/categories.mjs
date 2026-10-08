// The component categories, in display order. Each is a directory under
// src/components/ and a subpath export `use-scroll-animate/components/<id>`
// (+ `components/<id>.css`). Keep in sync with COMPONENT_CATEGORIES in
// src/components/index.ts (a test checks it); `npm run sync:exports`
// regenerates the package.json exports from this list.
export const CATEGORIES = ['reveal', 'text', 'interaction', 'feedback', 'background', 'transitions', 'physics', 'cards', 'click', 'ui', 'page', 'timeline', 'gesture', 'svg', 'webgl', 'depth', 'layout', 'packs'];

// Extra `use-scroll-animate/components/<name>` entry points (name → source under src/components/).
export const COMPONENT_ENTRIES = { react: 'frameworks/react', vue: 'frameworks/vue', svelte: 'frameworks/svelte', solid: 'frameworks/solid', angular: 'frameworks/angular', jsx: 'frameworks/jsx', lazy: 'lazy', tokens: 'tokens/index', a11y: 'a11y/index' };
