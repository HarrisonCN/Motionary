'use strict';

var components = require('../components.cjs');
require('./reveal.cjs');
require('../chunks/base-CxYU2NK_.cjs');
require('./text.cjs');
require('../chunks/core-HLqH3qkA.cjs');
require('./tokens.cjs');
require('./interaction.cjs');
require('./feedback.cjs');
require('./background.cjs');
require('../chunks/variants-CfJzrzMh.cjs');
require('./transitions.cjs');
require('./physics.cjs');
require('../chunks/spring-Dkpygsuj.cjs');
require('./cards.cjs');
require('./click.cjs');
require('./ui.cjs');
require('./page.cjs');
require('./timeline.cjs');
require('./gesture.cjs');
require('../chunks/core-CctNfzuP.cjs');
require('./svg.cjs');
require('./webgl.cjs');
require('./depth.cjs');
require('./layout.cjs');
require('./packs.cjs');
require('./a11y.cjs');
require('../chunks/index-tags-CIRY2KnU.cjs');
require('./perf.cjs');
require('./bridge.cjs');

/**
 * use-scroll-animate/components/vue — Vue integration (v2.9).
 *
 * ```js
 * // vite.config.js
 * import vue from '@vitejs/plugin-vue';
 * import { isUsaElement } from 'use-scroll-animate/components/vue';
 * export default { plugins: [vue({ template: { compilerOptions: { isCustomElement: isUsaElement } } })] };
 *
 * // main.js
 * import { UsaPlugin } from 'use-scroll-animate/components/vue';
 * app.use(UsaPlugin, { categories: ['click', 'cards'] });
 * ```
 * In templates, listen with `@usa:change="…"` and bind properties with
 * `.prop`: `<usa-toggle :checked.prop="on" @usa:change="on = $event.detail.checked">`.
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
//# sourceMappingURL=vue.cjs.map
