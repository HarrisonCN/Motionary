'use strict';

var base = require('../chunks/base-BvH4nAcv.cjs');
var indexTags = require('../chunks/index-tags-hLIF2Clq.cjs');

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
/** The `mo-*` alias of a default `usa-*` tag (`usa-switch` → `mo-switch`), or `null` for any other tag. */
const aliasTag = (tag) => (/^usa-[a-z]/.test(tag) ? 'mo-' + tag.slice(4) : null);
const TAG_RE = /(^|[^\w.#[\-])usa-(?=[a-z])/g;
/**
 * `usa-…` → `mo-…` in selectors only (the text in front of each `{` that is not an at-rule); declarations, at-rule
 * preludes such as `@keyframes usa-spin`, classes, attributes and custom properties are untouched.
 */
const aliasCss = (text) => text.replace(/(^|[{};])([^{};]*)(?=\{)/g, (_m, a, s) => a + (s.trim()[0] === '@' ? s : s.replace(TAG_RE, '$1mo-')));
let started = false;
let active = false;
let last = -1;
let n = 0;
const seen = /*#__PURE__*/ new WeakSet();
/** Copy the Motionary stylesheets added since the last look (and the user's adopted sheets) with mo-* selectors. */
function scan() {
    const d = document;
    const adopted = d.adoptedStyleSheets || [];
    const links = d.querySelectorAll('link[data-usa-css]');
    const key = d.styleSheets.length * 1e6 + adopted.length * 1e3 + links.length;
    if (key === last)
        return;
    last = key;
    links.forEach((l) => {
        if (!seen.has(l)) {
            seen.add(l);
            l.addEventListener('load', () => ((last = -1), scan())); // lite: CSS files arrive later
        }
    });
    for (const s of [...Array.from(d.styleSheets), ...adopted]) {
        const o = s.ownerNode;
        if (seen.has(s) || (o && !o.matches('[data-usa],[data-usa-css]')))
            continue;
        let css;
        try {
            css = Array.from(s.cssRules, (r) => r.cssText).join('\n');
        }
        catch {
            continue; // not loaded yet, or a cross-origin file without CORS
        }
        seen.add(s);
        const a = aliasCss(css);
        if (a !== css)
            base.adoptStyles('mo:' + n++, a);
    }
}
function alias(tag, ctor) {
    const a = aliasTag(tag);
    if (!a || customElements.get(a))
        return;
    const C = ctor;
    class Alias extends C {
        connectedCallback() {
            const r = super.connectedCallback?.();
            active = true;
            scan();
            return r;
        }
    }
    try {
        customElements.define(a, Alias);
    }
    catch {
        /* the name is taken by another library */
    }
}
/**
 * Turn on the `<mo-*>` names: every `usa-*` element defined from now on gets its `mo-*` alias, and so do the default
 * components already defined and any `usa-*` definition behind a `<mo-*>` element already on the page. Idempotent.
 */
function defineMoAliases() {
    if (!base.canDefine() || started)
        return;
    started = true;
    const reg = customElements;
    const define = reg.define;
    reg.define = function (name, ctor, options) {
        define.call(this, name, ctor, options);
        alias(name, ctor);
    };
    const tags = Object.values(indexTags.COMPONENT_CATEGORIES).flat();
    if (typeof document !== 'undefined')
        document.querySelectorAll('*').forEach((e) => e.localName.startsWith('mo-') && tags.push('usa-' + e.localName.slice(3)));
    for (const t of tags) {
        const c = reg.get(t);
        if (c)
            alias(t, c);
    }
    if (active)
        scan();
}

exports.aliasCss = aliasCss;
exports.aliasTag = aliasTag;
exports.defineMoAliases = defineMoAliases;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.0.0-rc.1/dist/components/mo.cjs.map