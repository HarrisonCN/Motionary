/**
 * 11.8 (component contract · keyboard): a host that acts on click becomes keyboard-reachable — `tabindex="0"` and
 * `role="button"` unless the page set them or a focusable control is inside, and Enter / Space on the host → `click()`.
 * Both attributes are removed again on disconnect.
 */
export function keyClick(el: HTMLElement & { onCleanup(fn: () => void): void; listen(t: EventTarget, type: string, fn: (e: any) => void): void }): void {
  if (el.querySelector('a[href],button,input,select,textarea,summary,[tabindex]')) return;
  for (const [n, v] of [['tabindex', '0'], ['role', 'button']]) {
    if (el.hasAttribute(n)) continue;
    el.setAttribute(n, v);
    el.onCleanup(() => el.removeAttribute(n));
  }
  el.listen(el, 'keydown', (e: KeyboardEvent) => {
    if (e.target !== el || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    el.click();
  });
}
