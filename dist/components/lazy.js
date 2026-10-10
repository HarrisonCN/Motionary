import { C as COMPONENT_CATEGORIES } from '../chunks/index-tags-B-JBecYg.js';

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
    reveal: () => import('./reveal.js'),
    text: () => import('./text.js'),
    interaction: () => import('./interaction.js'),
    feedback: () => import('./feedback.js'),
    background: () => import('./background.js'),
    transitions: () => import('./transitions.js'),
    physics: () => import('./physics.js'),
    cards: () => import('./cards.js'),
    click: () => import('./click.js'),
    ui: () => import('./ui.js'),
    page: () => import('./page.js'),
    timeline: () => import('./timeline.js'),
    gesture: () => import('./gesture.js'),
    svg: () => import('./svg.js'),
    webgl: () => import('./webgl.js'),
    depth: () => import('./depth.js'),
    layout: () => import('./layout.js'),
    packs: () => import('./packs.js'),
    fx: () => import('./fx.js'),
};
const TAG_TO_CAT = /*#__PURE__*/ new Map();
for (const [cat, tags] of Object.entries(COMPONENT_CATEGORIES))
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

export { categoryOfTag, defineUsed, lazyDefine, loadCategory };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.0/dist/components/lazy.js.map