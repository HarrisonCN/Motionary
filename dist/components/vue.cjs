'use strict';

var components = require('../components.cjs');

/**
 * motionary/components/vue — Vue integration (v2.9).
 *
 * ```js
 * // vite.config.js
 * import vue from '@vitejs/plugin-vue';
 * import { isUsaElement } from 'motionary/components/vue';
 * export default { plugins: [vue({ template: { compilerOptions: { isCustomElement: isUsaElement } } })] };
 *
 * // main.js
 * import { UsaPlugin } from 'motionary/components/vue';
 * app.use(UsaPlugin, { categories: ['click', 'cards'] });
 * ```
 * In templates, listen with `@usa:change="…"` and bind properties with
 * `.prop`: `<usa-switch :checked.prop="on" @usa:change="on = $event.detail.checked">`.
 *
 * Template types (13.5.0, generated from the manifest; Volar / vue-tsc):
 * ```ts
 * // src/usa-vue.d.ts
 * import type { UsaGlobalComponents } from 'motionary/components/vue';
 * declare module 'vue' { interface GlobalComponents extends UsaGlobalComponents {} }
 * ```
 */
/** `compilerOptions.isCustomElement` predicate for every `<usa-*>` tag. */
const isUsaElement = (tag) => tag.startsWith('usa-');
/** Vue plugin: registers the `<usa-*>` elements (client only) and sets `isCustomElement` at runtime. */
const UsaPlugin = {
    install(app, options = {}) {
        var _a;
        const co = ((_a = app.config).compilerOptions || (_a.compilerOptions = {}));
        const prev = co.isCustomElement;
        co.isCustomElement = (t) => isUsaElement(t) || !!prev?.(t);
        components.defineComponents(options.categories);
    },
};

exports.UsaPlugin = UsaPlugin;
exports.isUsaElement = isUsaElement;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.1.0/dist/components/vue.cjs.map