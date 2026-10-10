'use strict';

var components = require('../components.cjs');
require('./reveal.cjs');
require('../chunks/base-BG_mxssu.cjs');
require('./text.cjs');
require('../chunks/core-DMrg99HN.cjs');
require('./tokens.cjs');
require('./interaction.cjs');
require('./feedback.cjs');
require('./background.cjs');
require('../chunks/variants-D7gblATl.cjs');
require('./transitions.cjs');
require('./physics.cjs');
require('../chunks/spring-CibVO2Tk.cjs');
require('./cards.cjs');
require('./click.cjs');
require('../chunks/fx-aA8nn1zv.cjs');
require('./ui.cjs');
require('./page.cjs');
require('./timeline.cjs');
require('./gesture.cjs');
require('../chunks/core-Bg5WaRYY.cjs');
require('./svg.cjs');
require('../chunks/key-click-v7I4K5Sr.cjs');
require('./webgl.cjs');
require('./depth.cjs');
require('./layout.cjs');
require('./packs.cjs');
require('./fx.cjs');
require('../chunks/registry-LE5iyTqw.cjs');
require('../chunks/builtins-Dk6hr4_C.cjs');
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
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/components/vue.cjs.map