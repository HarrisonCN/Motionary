// browser: the full build (runtime template compiler); Node resolves `vue` to its server build (compiler included)
const define = { __VUE_OPTIONS_API__: 'true', __VUE_PROD_DEVTOOLS__: 'false', __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true' };
export default { esbuild: { define }, client: { alias: { vue: 'vue/dist/vue.esm-bundler.js' } } };
