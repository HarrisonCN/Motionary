// The component categories, in display order. Each is a directory under
// src/components/ and a subpath export `use-scroll-animate/components/<id>`
// (+ `components/<id>.css`). Keep in sync with COMPONENT_CATEGORIES in
// src/components/index.ts (a test checks it); `npm run sync:exports`
// regenerates the package.json exports from this list.
export const CATEGORIES = ['reveal', 'text', 'interaction', 'feedback', 'background', 'transitions', 'physics'];
