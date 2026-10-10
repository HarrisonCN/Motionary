/** Helpers shared by the 6.x widgets (`motionary/components/widgets`). */
export const clampN = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

/** Children of `el` that are elements and not created by the widget itself. */
export const ownChildren = (el: Element, skip = '[data-usa-part]'): HTMLElement[] =>
  Array.from(el.children).filter((c): c is HTMLElement => c instanceof HTMLElement && !c.matches(skip));

/** Create a part element (marked so re-mounts can find / skip it). */
export function part<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, attrs: Record<string, string> = {}, html = ''): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  n.className = cls;
  n.setAttribute('data-usa-part', '');
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (html) n.innerHTML = html;
  return n;
}

/** Remove the parts a previous mount created. */
export const dropParts = (el: Element): void => el.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());

let uid = 0;
/** A document-unique id with a prefix. */
export const nextId = (p: string): string => `${p}-${++uid}`;

/** Roving arrow-key focus over `items` (horizontal or vertical); returns the new index or -1. */
export function arrowIndex(e: KeyboardEvent, i: number, n: number, vertical = false): number {
  const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
  const next = vertical ? 'ArrowDown' : 'ArrowRight';
  if (e.key === prev) return (i - 1 + n) % n;
  if (e.key === next) return (i + 1) % n;
  if (e.key === 'Home') return 0;
  if (e.key === 'End') return n - 1;
  return -1;
}

/** A `locale` attribute as a valid BCP 47 tag, or `undefined` (the user's locale) when it is not one (13.1.0: an
 * invalid tag threw a RangeError from Intl / toLocale*String instead of falling back). */
export function localeAttr(tag: string): string | undefined {
  try {
    return tag ? Intl.getCanonicalLocales(tag)[0] : undefined;
  } catch {
    return undefined;
  }
}
