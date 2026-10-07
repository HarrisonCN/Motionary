import { defineComponents } from '../components.js';
import './reveal.js';
import '../chunks/base-Cu-86Z31.js';
import './text.js';
import './interaction.js';
import './feedback.js';
import './background.js';
import '../chunks/variants-BQ3gCb5L.js';
import './transitions.js';
import './physics.js';
import '../chunks/spring-BV-cpTHC.js';
import './cards.js';
import './click.js';
import './ui.js';
import './page.js';
import './timeline.js';
import './gesture.js';
import '../chunks/index-tags-DZ-gjMZc.js';

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
        defineComponents(options.categories);
    },
};

export { UsaPlugin, isUsaElement };
//# sourceMappingURL=vue.js.map
