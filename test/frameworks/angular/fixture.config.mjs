// Angular decorators (legacy TS decorators, as the Angular compiler expects) through esbuild; JIT, so no ngc step.
export default { esbuild: { tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } } } };
