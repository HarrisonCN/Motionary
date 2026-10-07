import { defineElement, type UsaElement } from '../base';
import { applyPack, PACKS } from './core';

/**
 * `<usa-pack name="ecommerce">` — applies an effect pack (`ecommerce` ·
 * `portfolio` · `dashboard` · `game` · `landing`) to its subtree:
 * descendants opt in with `data-role` (see `PACKS`). Re-applies when
 * `name` changes; undone on disconnect.
 */
export interface UsaPackElement extends UsaElement {
  readonly roles: string[];
}

export function definePack(tag = 'usa-pack'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) =>
    class UsaPack extends Base {
      static get observedAttributes(): string[] {
        return ['name'];
      }
      get roles(): string[] {
        return Object.keys(PACKS[this.str('name', 'landing')] || {});
      }
      mount(): void {
        this.style.display ||= 'block';
        this.onCleanup(applyPack(this.str('name', 'landing'), this));
      }
    }
  );
}
