// `import css from './x.css?raw'` — the stylesheet's text (Vite/Vitest
// built-in; a small plugin in rollup.config.mjs for the library build).
declare module '*.css?raw' {
  const css: string;
  export default css;
}
