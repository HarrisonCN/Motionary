import type { UsaBase } from '../base';

export function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag); el.className = cls; el.textContent = text; return el;
}
export function numberValue(value: unknown, fallback: number, min = -1e12, max = 1e12): number {
  const n = Number(value); return Math.max(min, Math.min(max, Number.isFinite(n) ? n : fallback));
}
export function formReset(host: UsaBase, reset: () => void): void {
  let active = true; host.onCleanup(() => { active = false; });
  const form = host.closest('form');
  if (form) host.listen(form, 'reset', (event: Event) => queueMicrotask(() => { if (active && host.isConnected && !event.defaultPrevented) reset(); }));
}
export function formMotion(host: UsaBase): (el: Element) => void {
  const animations = new Set<Animation>();
  const cancel = () => { animations.forEach(a => a.cancel()); animations.clear(); };
  if (typeof matchMedia === 'function') host.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', cancel);
  host.listen(document, 'visibilitychange', () => { if (document.hidden) cancel(); }); host.onCleanup(cancel);
  return el => {
    cancel(); const a = host.motion(el, [{ opacity: .5, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
    if (a) { animations.add(a); a.finished.then(() => animations.delete(a), () => animations.delete(a)); }
  };
}
export function formShell(host: UsaBase, fallback: string): { root: HTMLDivElement; title: HTMLDivElement; hint: HTMLDivElement } {
  host.classList.add('usa-form'); const root = node('div', 'usa-form-frame');
  const title = node('div', 'usa-form-label', host.getAttribute('label') || fallback);
  const hint = node('div', 'usa-form-hint', host.getAttribute('hint') || '');
  root.append(title); host.prepend(root); host.onCleanup(() => root.remove()); return { root, title, hint };
}
