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
import { canDefine } from './base';
import { publicTagNames } from './public-tags.generated';

/** The `mo-*` alias of a default `usa-*` tag (`usa-switch` → `mo-switch`), or `null` for any other tag. */
export const aliasTag = (tag: string): string | null => (/^usa-[a-z]/.test(tag) ? 'mo-' + tag.slice(4) : null);

// Keep strings, comments, attribute selectors and escaped identifiers opaque. Braces / semicolons inside them
// are content, not rule boundaries (and an attribute value that happens to name a component must stay unchanged).
const CSS_TOKENS = /\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\[(?:\\[\s\S]|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|[^\]\\])*\]|(?:\\[\s\S]|[\w-]|[^\x00-\x7f])+|[^\w]/g;
/**
 * `usa-…` → `mo-…` in selectors only (the text in front of each `{` that is not an at-rule); declarations, at-rule
 * preludes such as `@keyframes usa-spin`, classes, attributes and custom properties are untouched.
 */
export const aliasCss = (text: string): string => {
  let out = '', raw = '', renamed = '', first = '', previous = '';
  for (const [token] of text.matchAll(CSS_TOKENS)) {
    if (token === '{' || token === '}' || token === ';') {
      out += (token === '{' && first !== '@' ? renamed : raw) + token;
      raw = renamed = first = previous = '';
    } else {
      raw += token;
      const comment = token.startsWith('/*');
      if (!first && !comment && token.trim()) first = token;
      renamed += /^usa-[a-z]/.test(token) && previous !== '.' && previous !== '#' && previous !== ':'
        ? 'mo-' + token.slice(4) : token;
      if (!comment) previous = token;
    }
  }
  return out + raw;
};

let started = false;
let active = false;
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
      if (!active) {
        active = true;
        // A retry may be requested by a usa-* sibling after the mo-* element has already mounted.
        document.addEventListener('load', (event) => {
          if ((event.target as Element | null)?.matches?.('link[data-usa-css]')) scan();
        }, true);
      }
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
  const tags: string[] = publicTagNames.split(' ').map(name => 'usa-' + name);
  if (typeof document !== 'undefined') document.querySelectorAll('*').forEach((e) => e.localName.startsWith('mo-') && tags.push('usa-' + e.localName.slice(3)));
  for (const t of tags) {
    const c = reg.get(t);
    if (c) alias(t, c);
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
