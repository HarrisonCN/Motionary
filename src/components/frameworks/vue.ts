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
import { defineComponents, type ComponentCategory } from '../index';

/** `compilerOptions.isCustomElement` predicate for every `<usa-*>` tag. */
export const isUsaElement = (tag: string): boolean => tag.startsWith('usa-');

export interface UsaPluginOptions {
  /** Only register these categories (default: all). */
  categories?: ComponentCategory[];
}

/** Vue plugin: registers the `<usa-*>` elements (client only) and sets `isCustomElement` at runtime. */
export const UsaPlugin = {
  install(app: { config: { compilerOptions?: { isCustomElement?: (t: string) => boolean } } }, options: UsaPluginOptions = {}): void {
    const co = (app.config.compilerOptions ||= {});
    const prev = co.isCustomElement;
    co.isCustomElement = (t: string) => isUsaElement(t) || !!prev?.(t);
    defineComponents(options.categories);
  },
};
