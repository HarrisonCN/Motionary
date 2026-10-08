import { defineComponents } from '../components.js';
import './reveal.js';
import '../chunks/base-D5MHqeDd.js';
import './text.js';
import '../chunks/core-DyJu5r5a.js';
import './tokens.js';
import './interaction.js';
import './feedback.js';
import './background.js';
import '../chunks/variants-CoZn3k_5.js';
import './transitions.js';
import './physics.js';
import '../chunks/spring-B-9MZOrW.js';
import './cards.js';
import './click.js';
import '../chunks/fx-DlGRMJ-Z.js';
import './ui.js';
import './page.js';
import './timeline.js';
import './gesture.js';
import '../chunks/core-ZGo4hOEk.js';
import './svg.js';
import './webgl.js';
import './depth.js';
import './layout.js';
import './packs.js';
import './fx.js';
import '../chunks/registry-CTLWeg-J.js';
import './a11y.js';
import '../chunks/index-tags-DucKMQr_.js';
import './perf.js';
import './bridge.js';

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
