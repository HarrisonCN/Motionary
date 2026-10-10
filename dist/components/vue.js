import { defineComponents } from '../components.js';
import './reveal.js';
import '../chunks/base-nzeN_ux7.js';
import './text.js';
import '../chunks/core-Bar7NFx7.js';
import './tokens.js';
import './interaction.js';
import './feedback.js';
import './background.js';
import '../chunks/variants-DY08myqK.js';
import './transitions.js';
import './physics.js';
import '../chunks/spring-BX7EJst7.js';
import './cards.js';
import './click.js';
import '../chunks/fx-qAVpKs8e.js';
import './ui.js';
import './page.js';
import './timeline.js';
import './gesture.js';
import '../chunks/core-DVGtPabi.js';
import './svg.js';
import '../chunks/key-click-BLm3BI8_.js';
import './webgl.js';
import './depth.js';
import './layout.js';
import './packs.js';
import './fx.js';
import '../chunks/registry-PxXkPc1Q.js';
import '../chunks/builtins-hBOeCPXL.js';
import './a11y.js';
import '../chunks/index-tags-B-JBecYg.js';
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
        defineComponents(options.categories);
    },
};

export { UsaPlugin, isUsaElement };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/components/vue.js.map