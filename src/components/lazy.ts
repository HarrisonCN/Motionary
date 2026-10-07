/**
 * use-scroll-animate/components/lazy — lazy, per-category registration (v2.9).
 *
 * `lazyDefine()` scans the page (and watches it with a MutationObserver) for
 * `<usa-*>` tags that are not registered yet and dynamically imports only the
 * categories they belong to. Bundlers split each category into its own chunk,
 * so a page that only uses `<usa-button>` loads just the click category.
 *
 * ```js
 * import { lazyDefine } from 'use-scroll-animate/components/lazy';
 * lazyDefine(); // returns a stop() function
 * ```
 */
import { COMPONENT_CATEGORIES, type ComponentCategory } from './index-tags';

const LOADERS: Record<ComponentCategory, () => Promise<Record<string, any>>> = {
  reveal: () => import('./reveal/index'),
  text: () => import('./text/index'),
  interaction: () => import('./interaction/index'),
  feedback: () => import('./feedback/index'),
  background: () => import('./background/index'),
  transitions: () => import('./transitions/index'),
  physics: () => import('./physics/index'),
  cards: () => import('./cards/index'),
  click: () => import('./click/index'),
  ui: () => import('./ui/index'),
  page: () => import('./page/index'),
  timeline: () => import('./timeline/index'),
  gesture: () => import('./gesture/index'),
  svg: () => import('./svg/index'),
  webgl: () => import('./webgl/index'),
};

const TAG_TO_CAT = new Map<string, ComponentCategory>();
for (const [cat, tags] of Object.entries(COMPONENT_CATEGORIES)) for (const t of tags) TAG_TO_CAT.set(t, cat as ComponentCategory);
const loaded = new Map<ComponentCategory, Promise<void>>();

/** Category of a tag (`usa-button` → `click`), or `null`. */
export const categoryOfTag = (tag: string): ComponentCategory | null => TAG_TO_CAT.get(tag.toLowerCase()) ?? null;

/** Load and register one category (once). */
export function loadCategory(cat: ComponentCategory): Promise<void> {
  let p = loaded.get(cat);
  if (!p) {
    p = LOADERS[cat]().then((m) => {
      const fn = Object.keys(m).find((k) => /^define[A-Z]\w*Components$/.test(k));
      if (fn) m[fn]();
    });
    loaded.set(cat, p);
  }
  return p;
}

/** Register the categories needed by the `<usa-*>` tags under `root`. Resolves when they are defined. */
export async function defineUsed(root: ParentNode = document): Promise<ComponentCategory[]> {
  if (typeof customElements === 'undefined') return [];
  const cats = new Set<ComponentCategory>();
  const scan = (el: Element) => {
    const c = el.localName.startsWith('usa-') && !customElements.get(el.localName) ? categoryOfTag(el.localName) : null;
    if (c) cats.add(c);
  };
  if ((root as Element).localName) scan(root as Element);
  root.querySelectorAll('*').forEach(scan);
  await Promise.all([...cats].map(loadCategory));
  return [...cats];
}

/** `defineUsed()` now and whenever new `<usa-*>` elements are added. Returns a stop function. */
export function lazyDefine(root: ParentNode = typeof document !== 'undefined' ? document : (undefined as any)): () => void {
  if (!root || typeof MutationObserver === 'undefined') return () => undefined;
  defineUsed(root);
  const mo = new MutationObserver((records) => {
    for (const r of records) r.addedNodes.forEach((n) => n.nodeType === 1 && defineUsed(n as Element));
  });
  mo.observe(root as Node, { childList: true, subtree: true });
  return () => mo.disconnect();
}
