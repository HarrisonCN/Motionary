/**
 * Framework-neutral binding for `<usa-*>` elements (v3.8): set DOM
 * **properties** and listen to `usa:*` events, with update / destroy — the
 * shape Svelte actions, Solid directives and Angular directives all share.
 */
export interface UsaBinding {
  /** DOM properties to set (`checked`, `value`, `open`, `index`…). */
  props?: Record<string, unknown>;
  /** Event handlers by name; `change` is shorthand for `usa:change`. */
  on?: Record<string, (e: CustomEvent) => void>;
}

/** Normalise an event key: `change` → `usa:change`, `usa:change` stays. */
export const usaEventName = (k: string): string => (k.includes(':') ? k : `usa:${k}`);

/** Bind properties and `usa:*` listeners to an element; returns `{ update, destroy }`. */
export function bindUsa(el: HTMLElement, binding: UsaBinding = {}): { update(b: UsaBinding): void; destroy(): void } {
  let current: [string, EventListener][] = [];
  const apply = (b: UsaBinding) => {
    current.forEach(([n, f]) => el.removeEventListener(n, f));
    current = Object.entries(b.on || {}).map(([k, f]) => [usaEventName(k), f as unknown as EventListener]);
    current.forEach(([n, f]) => el.addEventListener(n, f));
    for (const [k, v] of Object.entries(b.props || {})) if ((el as any)[k] !== v) (el as any)[k] = v;
  };
  apply(binding);
  return {
    update: apply,
    destroy: () => current.forEach(([n, f]) => el.removeEventListener(n, f)),
  };
}
