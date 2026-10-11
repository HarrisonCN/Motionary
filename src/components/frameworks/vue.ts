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
import { defineComponents, type ComponentCategory } from '../index';
import type { UsaElementAttributeMap, UsaElementEventMap, UsaElementTag } from './elements.generated';

export type { UsaElementAttributeMap, UsaElementEventMap, UsaElementTag } from './elements.generated';

/** Structural `GlobalComponents` entries for every `<usa-*>` tag (no `vue` import): attributes as props, `usa:*` events as `on…` handlers. */
export type UsaGlobalComponents = {
  [K in UsaElementTag]: new () => {
    $props: UsaElementAttributeMap[K] & { [E in keyof UsaElementEventMap[K] as `on${Capitalize<E & string>}`]?: (event: UsaElementEventMap[K][E]) => void } & Record<string, unknown>;
  };
};

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
