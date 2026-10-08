// The component categories, in display order. Each is a directory under
// src/components/ and a subpath export `motionary/components/<id>`
// (+ `components/<id>.css`). Keep in sync with COMPONENT_CATEGORIES in
// src/components/index.ts (a test checks it); `npm run sync:exports`
// regenerates the package.json exports from this list.
export const CATEGORIES = ['reveal', 'text', 'interaction', 'feedback', 'background', 'transitions', 'physics', 'cards', 'click', 'ui', 'page', 'timeline', 'gesture', 'svg', 'webgl', 'depth', 'layout', 'packs', 'fx'];

// Extra `motionary/components/<name>` entry points (name → source under src/components/).
export const COMPONENT_ENTRIES = { react: 'frameworks/react', vue: 'frameworks/vue', svelte: 'frameworks/svelte', solid: 'frameworks/solid', angular: 'frameworks/angular', jsx: 'frameworks/jsx', lazy: 'lazy', tokens: 'tokens/index', a11y: 'a11y/index', perf: 'perf/index', bridge: 'bridge/index', effects: 'effects/index', widgets: 'widgets/index', fx2: 'fx2/index', 'fx-gpu': 'fx2/gpu', 'fx-text': 'fx2/text3', 'fx-light': 'fx2/light', 'fx-3d': 'fx2/depth3', 'fx-morph': 'fx2/morph2', 'fx-transitions': 'fx2/transitions2', 'fx-weather': 'fx2/weather', 'fx-physics': 'fx2/physics2', 'fx-focus': 'fx2/focus', marketplace: 'fx2/manifest', lite: 'lite' };
