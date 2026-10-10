'use strict';

var indexTags = require('../chunks/index-tags-hLIF2Clq.cjs');

/**
 * motionary/components/lazy — lazy, per-category registration (v2.9).
 *
 * `lazyDefine()` scans the page (and watches it with a MutationObserver) for
 * `<usa-*>` tags that are not registered yet and dynamically imports only the
 * categories they belong to. Bundlers split each category into its own chunk,
 * so a page that only uses `<usa-button>` loads just the click category.
 *
 * ```js
 * import { lazyDefine } from 'motionary/components/lazy';
 * lazyDefine(); // returns a stop() function
 * ```
 */
const LOADERS = {
    reveal: () => Promise.resolve().then(function () { return require('./reveal.cjs'); }),
    text: () => Promise.resolve().then(function () { return require('./text.cjs'); }),
    interaction: () => Promise.resolve().then(function () { return require('./interaction.cjs'); }),
    feedback: () => Promise.resolve().then(function () { return require('./feedback.cjs'); }),
    background: () => Promise.resolve().then(function () { return require('./background.cjs'); }),
    transitions: () => Promise.resolve().then(function () { return require('./transitions.cjs'); }),
    physics: () => Promise.resolve().then(function () { return require('./physics.cjs'); }),
    cards: () => Promise.resolve().then(function () { return require('./cards.cjs'); }),
    click: () => Promise.resolve().then(function () { return require('./click.cjs'); }),
    ui: () => Promise.resolve().then(function () { return require('./ui.cjs'); }),
    page: () => Promise.resolve().then(function () { return require('./page.cjs'); }),
    timeline: () => Promise.resolve().then(function () { return require('./timeline.cjs'); }),
    gesture: () => Promise.resolve().then(function () { return require('./gesture.cjs'); }),
    svg: () => Promise.resolve().then(function () { return require('./svg.cjs'); }),
    webgl: () => Promise.resolve().then(function () { return require('./webgl.cjs'); }),
    depth: () => Promise.resolve().then(function () { return require('./depth.cjs'); }),
    layout: () => Promise.resolve().then(function () { return require('./layout.cjs'); }),
    packs: () => Promise.resolve().then(function () { return require('./packs.cjs'); }),
    fx: () => Promise.resolve().then(function () { return require('./fx.cjs'); }),
};
const TAG_TO_CAT = /*#__PURE__*/ new Map();
for (const [cat, tags] of Object.entries(indexTags.COMPONENT_CATEGORIES))
    for (const t of tags)
        TAG_TO_CAT.set(t, cat);
const loaded = new Map();
/** Category of a tag (`usa-button` → `click`), or `null`. */
const categoryOfTag = (tag) => TAG_TO_CAT.get(tag.toLowerCase()) ?? null;
/** Load and register one category (once). */
function loadCategory(cat) {
    let p = loaded.get(cat);
    if (!p) {
        p = LOADERS[cat]().then((m) => {
            const fn = Object.keys(m).find((k) => /^define[A-Z]\w*Components$/.test(k));
            if (fn)
                m[fn]();
        });
        loaded.set(cat, p);
    }
    return p;
}
/** Register the categories needed by the `<usa-*>` tags under `root`. Resolves when they are defined. */
async function defineUsed(root = document) {
    if (typeof customElements === 'undefined')
        return [];
    const cats = new Set();
    const scan = (el) => {
        const c = el.localName.startsWith('usa-') && !customElements.get(el.localName) ? categoryOfTag(el.localName) : null;
        if (c)
            cats.add(c);
    };
    if (root.localName)
        scan(root);
    root.querySelectorAll('*').forEach(scan);
    await Promise.all([...cats].map(loadCategory));
    return [...cats];
}
/** `defineUsed()` now and whenever new `<usa-*>` elements are added. Returns a stop function. */
function lazyDefine(root = typeof document !== 'undefined' ? document : undefined) {
    if (!root || typeof MutationObserver === 'undefined')
        return () => undefined;
    defineUsed(root);
    const mo = new MutationObserver((records) => {
        for (const r of records)
            r.addedNodes.forEach((n) => n.nodeType === 1 && defineUsed(n));
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
}

exports.categoryOfTag = categoryOfTag;
exports.defineUsed = defineUsed;
exports.lazyDefine = lazyDefine;
exports.loadCategory = loadCategory;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.9.0/dist/components/lazy.cjs.map