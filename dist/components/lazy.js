import { c as categoryForTag } from '../chunks/category-for-tag-WK7MtB-K.js';

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
const loaded = new Map();
/** Category of a tag (`usa-button` → `click`), or `null`. */
const categoryOfTag = (tag) => categoryForTag(tag.toLowerCase()) ?? null;
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
        const c = /^(usa|mo)-/.test(el.localName) && !customElements.get(el.localName) ? categoryOfTag(el.localName) : null;
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
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.3.0/dist/components/lazy.js.map