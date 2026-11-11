/**
 * motionary/components/mo — the 17.0 `<mo-*>` names.
 *
 * After `defineMoAliases()` every default `<usa-*>` element is also registered as `<mo-*>` (`<usa-switch>` →
 * `<mo-switch>`): a subclass, so attributes, properties and `usa:*` events are the same. The component styles are copied
 * with renamed tag selectors the first time a `<mo-*>` element connects, so pages that never use `mo-*` pay nothing.
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
import { adoptStyles, canDefine } from './base';
import { publicTagNames } from './public-tags.generated';

/** The `mo-*` alias of a default `usa-*` tag (`usa-switch` → `mo-switch`), or `null` for any other tag. */
export const aliasTag = (tag: string): string | null => (/^usa-[a-z]/.test(tag) ? 'mo-' + tag.slice(4) : null);

/**
 * `usa-…` → `mo-…` in selectors only (the text in front of each `{` that is not an at-rule); declarations, at-rule
 * preludes such as `@keyframes usa-spin`, classes, attributes and custom properties are untouched. 17.3.1: the tokenizer
 * lives in `alias-css.mjs`, shared with the build, which writes `:is(usa-x,mo-x)` into the standalone CSS files.
 */
export const aliasCss = (text: string): string => rewriteTagSelectors(text, (tag) => 'mo-' + tag.slice(4));

let started = false;
let active = false;
let n = 0;
const seen = /*#__PURE__*/ new WeakSet<object>();

/** Copy the Motionary stylesheets added since the last look (and the user's adopted sheets) with mo-* selectors. */
function scan(): void {
  const d = document;
  const adopted: CSSStyleSheet[] = (d as any).adoptedStyleSheets || [];
  for (const s of [...Array.from(d.styleSheets), ...adopted]) {
    const o = s.ownerNode as Element | null;
    if (seen.has(s) || (o && !o.matches('[data-usa],[data-usa-css]'))) continue;
    let css: string;
    try {
      css = Array.from(s.cssRules, (r) => r.cssText).join('\n');
    } catch {
      continue; // not loaded yet, or a cross-origin file without CORS
    }
    if (!css) continue; // a pending link may expose an empty rule list before its load event
    seen.add(s);
    const a = aliasCss(css);
    if (a !== css) adoptStyles('mo:' + n++, a);
  }
}

function alias(tag: string, ctor: CustomElementConstructor): void {
  const a = aliasTag(tag);
  if (!a || customElements.get(a)) return;
  const C = ctor as any;
  class Alias extends C {
    connectedCallback(): unknown {
      const r = super.connectedCallback?.();
      if (!active) {
        active = true;
        // A retry may be requested by a usa-* sibling after the mo-* element has already mounted.
        document.addEventListener('load', (event) => {
          if (event.target instanceof HTMLLinkElement && event.target.hasAttribute('data-usa-css')) scan();
        }, true);
      }
      scan();
      return r;
    }
  }
  try {
    customElements.define(a, Alias as unknown as CustomElementConstructor);
  } catch {
    /* the name is taken by another library */
  }
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
  // 17.3.1: every public tag from the manifest (core and widgets), so widgets defined before this call get their mo-* name too.
  const tags: string[] = publicTagNames.split(' ').map((name) => 'usa-' + name);
  if (typeof document !== 'undefined') document.querySelectorAll('*').forEach((e) => e.localName.startsWith('mo-') && tags.push('usa-' + e.localName.slice(3)));
  for (const t of tags) {
    const c = reg.get(t);
    if (c) alias(t, c);
  }
  if (active) scan();
}

// 17.3.1: the mo-* spellings get the same DOM types as their usa-* elements (document.querySelector('mo-switch') …).
import type { UsaElementTag } from './frameworks/elements.generated';
type LegacyTag = Extract<UsaElementTag, `usa-${string}`>;
type PublicDomElements = {
  [K in LegacyTag as K extends `usa-${infer Name}` ? `mo-${Name}` : never]: K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement;
};
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface HTMLElementTagNameMap extends PublicDomElements {}
}
