import { defineComponents } from '../components.js';
import './reveal.js';
import '../chunks/base-ZARFccur.js';
import './text.js';
import './interaction.js';
import './feedback.js';
import './background.js';
import '../chunks/variants-DvnxvRCM.js';
import './transitions.js';
import './physics.js';
import '../chunks/spring-E2ickYNI.js';
import './cards.js';
import './click.js';
import './ui.js';
import './page.js';
import './timeline.js';
import '../chunks/core-Co-6AL0h.js';
import './gesture.js';
import '../chunks/core-DKY-fVzR.js';
import './svg.js';
import './webgl.js';
import './depth.js';
import './layout.js';
import './packs.js';
import '../chunks/index-tags-43Xtd01A.js';

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
