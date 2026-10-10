import { defineElement, type UsaElement } from '../base';
import css from './menu-toggle.css?raw';

/**
 * `<usa-menu-toggle>` (6.6) — the hamburger button that morphs into its
 * "open" icon: `variant="cross"` (✕, default), `arrow` (←), `minus` (—) or
 * `plus-x` (+ turning into ✕). It is a real `<button>`-like control
 * (`role="button"`, Space / Enter, `aria-expanded`); `for="<id>"` sets
 * `aria-controls` and toggles the `hidden` attribute (or `.open()` /
 * `.close()` / `.show()`) of that element. `pressed` reflects the state.
 * Event `usa:toggle` (`{ open }`). Reduced motion: the icon switches without
 * the morph.
 */
export interface UsaMenuToggleElement extends UsaElement {
  open: boolean;
  toggle(force?: boolean): void;
}

export const TOGGLE_VARIANTS = ['cross', 'arrow', 'minus', 'plus-x'] as const;

export function defineMenuToggle(tag = 'usa-menu-toggle'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMenuToggle extends Base {
        static get observedAttributes(): string[] {
          return ['variant', 'label', 'for'];
        }
        private _open = false;

        get open(): boolean {
          return this._open;
        }
        set open(v: boolean) {
          this.toggle(v);
        }

        mount(): void {
          const v = this.str('variant', 'cross');
          this.dataset.variant = (TOGGLE_VARIANTS as readonly string[]).includes(v) ? v : 'cross';
          if (!this.querySelector(':scope > .usa-mt-box')) {
            const box = document.createElement('span');
            box.className = 'usa-mt-box';
            box.setAttribute('aria-hidden', 'true');
            box.setAttribute('data-usa-part', '');
            box.innerHTML = '<span class="usa-mt-bar"></span><span class="usa-mt-bar"></span><span class="usa-mt-bar"></span>';
            this.prepend(box);
          }
          this.setAttribute('role', 'button');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          if (!this.hasAttribute('aria-label') && !this.textContent?.trim()) this.setAttribute('aria-label', this.str('label', 'Menu'));
          const id = this.str('for', '');
          if (id) this.setAttribute('aria-controls', id);
          this._open = this.flag('pressed');
          this.sync(false);
          this.listen(this, 'click', () => this.toggle());
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.toggle();
            }
          });
        }

        private sync(animate: boolean): void {
          this.setAttribute('aria-expanded', String(this._open));
          this.toggleAttribute('data-open', this._open);
          this.toggleAttribute('data-animate', animate && !this.reduced);
          const target = this.str('for', '') ? (document.getElementById(this.str('for', '')) as (HTMLElement & { open?: unknown; show?: () => void; close?: () => void }) | null) : null;
          if (!target || !animate) return;
          if (this._open && typeof target.show === 'function') target.show();
          else if (!this._open && typeof target.close === 'function') target.close();
          else target.hidden = !this._open;
        }

        toggle(force?: boolean): void {
          const next = typeof force === 'boolean' ? force : !this._open;
          if (next === this._open) return;
          this._open = next;
          this.toggleAttribute('pressed', next);
          this.sync(true);
          this.emit('toggle', { open: next });
        }
      }
      return UsaMenuToggle as unknown as CustomElementConstructor;
    },
    { id: 'menu-toggle', text: css }
  );
}
