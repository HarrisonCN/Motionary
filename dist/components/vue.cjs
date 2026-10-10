'use strict';

var components = require('../components.cjs');
require('./reveal.cjs');
require('../chunks/base-B3me2y0o.cjs');
require('./text.cjs');
require('../chunks/core-KIvPGg0c.cjs');
require('./tokens.cjs');
require('./interaction.cjs');
require('./feedback.cjs');
require('./background.cjs');
require('../chunks/variants-cVfgIaXa.cjs');
require('./transitions.cjs');
require('./physics.cjs');
require('../chunks/spring-DcM7pQgx.cjs');
require('./cards.cjs');
require('./click.cjs');
require('../chunks/fx-BaPAanPW.cjs');
require('./ui.cjs');
require('./page.cjs');
require('./timeline.cjs');
require('./gesture.cjs');
require('../chunks/core-BdLFN0RS.cjs');
require('./svg.cjs');
require('../chunks/key-click-v7I4K5Sr.cjs');
require('./webgl.cjs');
require('./depth.cjs');
require('./layout.cjs');
require('./packs.cjs');
require('./fx.cjs');
require('../chunks/registry-BB1oO-lR.cjs');
require('../chunks/builtins-Cz3iufK6.cjs');
require('./a11y.cjs');
require('../chunks/index-tags-hLIF2Clq.cjs');
require('./perf.cjs');
require('./bridge.cjs');

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
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/components/vue.cjs.map