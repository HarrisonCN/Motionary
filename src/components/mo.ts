/**
 * motionary/components/mo — the 17.0 `<mo-*>` names.
 *
 * After `defineMoAliases()` every default `<usa-*>` element is also registered as `<mo-*>` (`<usa-switch>` →
 * `<mo-switch>`): a subclass, so attributes, properties and `usa:*` events are the same. The component styles are extended
 * with matching public tag selectors the first time a `<mo-*>` element connects, so pages that never use `mo-*` pay nothing.
 *
 * The no-build bundles (`components.umd.js`, `widgets.umd.js`) call it before they register anything. With ESM, call it
 * once, ideally before you define components; `usa-*` elements defined earlier (the default component set) and `mo-*`
 * elements already on the page are picked up too. Kept out of the component base so `usa-*` pages keep their size.
 *
 * ```ts
 * import { defineMoAliases } from 'motionary/components/mo';
 * import { defineComponents } from 'motionary/components';
 * defineMoAliases();
 * defineComponents();   // <mo-card>, <mo-tabs>, … and <usa-*> both work
 * ```
 */
import { rewriteTagSelectors } from './alias-css.mjs';
import { canDefine } from './base';
import { publicTagNames } from './public-tags.generated';

/** The `mo-*` alias of a default `usa-*` tag (`usa-switch` → `mo-switch`), or `null` for any other tag. */
export const aliasTag = (tag: string): string | null => (/^usa-[a-z]/.test(tag) ? 'mo-' + tag.slice(4) : null);

/** Return a copy of the stylesheet with public tag selectors. */
export const aliasCss = (text: string): string => rewriteTagSelectors(text, tag => 'mo-' + tag.slice(4));

let started = false;
function styleLoaded(event: Event): void {
  if ((event.target as Element)?.matches?.('link[data-usa-css]')) scan();
}
const seen = /*#__PURE__*/ new WeakSet<object>();

/** Extend style selectors in place so media queries, cascade layers and declaration order stay intact. */
function extendSelectors(rules: CSSRuleList): void {
  for (const rule of rules) {
    if ('selectorText' in rule) {
      const style = rule as CSSStyleRule;
      const selector = style.selectorText;
      const renamed = aliasCss(selector + '{').slice(0, -1);
      if (renamed !== selector) style.selectorText = selector + ',' + renamed;
    }
    if ('cssRules' in rule) extendSelectors((rule as CSSGroupingRule).cssRules);
  }
}

function scan(): void {
  const d = document;
  for (const s of [...d.styleSheets, ...(d.adoptedStyleSheets || [])]) {
    const o = s.ownerNode as Element | null;
    if (seen.has(s) || (o && !o.matches('[data-usa],[data-usa-css]'))) continue;
    try {
      if (!s.cssRules.length) continue;
      extendSelectors(s.cssRules);
      seen.add(s);
    } catch {
      // A pending or cross-origin stylesheet may not expose writable rules.
    }
  }
}

function alias(tag: string, ctor: CustomElementConstructor): void {
  const a = aliasTag(tag);
  if (!a || customElements.get(a)) return;
  const C = ctor as any;
  class Alias extends C {
    connectedCallback(): void {
      super.connectedCallback?.();
      // A stable listener also handles a later stylesheet load without adding duplicate listeners.
      document.addEventListener('load', styleLoaded, true);
      scan();
    }
  }
  customElements.define(a, Alias as unknown as CustomElementConstructor);
}

/**
 * Turn on the `<mo-*>` names: every `usa-*` element defined from now on gets its `mo-*` alias, and so do the default
 * components already defined and any `usa-*` definition behind a `<mo-*>` element already on the page. Idempotent.
 */
export function defineMoAliases(): void {
  if (!canDefine() || started) return;
  started = true;
  const reg = customElements;
  const define = reg.define;
  reg.define = function (this: CustomElementRegistry, name: string, ctor: CustomElementConstructor, options?: ElementDefinitionOptions) {
    define.call(this, name, ctor, options);
    alias(name, ctor);
  };
  const names = publicTagNames.split(' ');
  globalThis.document?.querySelectorAll('*').forEach(({ localName }) => {
    if (localName.startsWith('mo-')) names.push(localName.slice(3));
  });
  for (const name of names) {
    const tag = 'usa-' + name;
    const ctor = reg.get(tag);
    if (ctor) alias(tag, ctor);
  }
}

// Applications that enable the mo-* names get the same DOM methods for both spellings.
import type { UsaElementTag } from './frameworks/elements.generated';
type LegacyTag = Extract<UsaElementTag, `usa-${string}`>;
type PublicDomElements = {
  [K in LegacyTag as K extends `usa-${infer Name}` ? `mo-${Name}` : never]:
    K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement;
};
declare global {
  interface HTMLElementTagNameMap extends PublicDomElements {}
}
