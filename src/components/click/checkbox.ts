import { defineElement, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import css from './checkbox.css?raw';

/**
 * `<usa-checkbox>` — an animated, form-associated checkbox: the box springs
 * and the check mark draws itself. `role="checkbox"` + `aria-checked`
 * (`mixed` with `indeterminate`).
 *
 * Attributes: `checked`, `indeterminate`, `disabled`, `name`, `value`
 * (`on`), `label`, `shape` (`square` default, `circle`). Events: `change`,
 * `usa:change` (`{ checked }`). Reduced motion: no spring or drawing.
 */
export interface UsaCheckboxElement extends UsaElement {
  checked: boolean;
  indeterminate: boolean;
  toggle(force?: boolean): void;
}

export function defineCheckbox(tag = 'usa-checkbox'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaCheckbox extends Base {
        static formAssociated = true;
        static get observedAttributes(): string[] {
          return ['checked', 'indeterminate', 'disabled', 'label', 'value'];
        }

        private _internals: ElementInternals | null = null;

        constructor() {
          super();
          try {
            this._internals = (this as any).attachInternals?.() ?? null;
          } catch {
            this._internals = null;
          }
        }

        get checked(): boolean {
          return this.flag('checked');
        }
        set checked(v: boolean) {
          this.setFlag('checked', v);
        }
        get indeterminate(): boolean {
          return this.flag('indeterminate');
        }
        set indeterminate(v: boolean) {
          this.setFlag('indeterminate', v);
        }

        mount(): void {
          if (!this.querySelector(':scope > .usa-checkbox-box')) {
            this.insertAdjacentHTML(
              'afterbegin',
              '<span class="usa-checkbox-box" aria-hidden="true"><svg viewBox="0 0 24 24"><path class="usa-checkbox-check" d="M5 12.5l4.2 4.2L19 7" pathLength="1"/><path class="usa-checkbox-dash" d="M6 12h12" pathLength="1"/></svg></span>'
            );
          }
          this.setAttribute('role', 'checkbox');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          this.sync();
          this.listen(this, 'click', () => this.toggle());
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === ' ' && !e.repeat) {
              e.preventDefault();
              this.toggle();
            }
          });
        }

        changed(): void {
          this.sync();
        }

        private sync(): void {
          this.setAttribute('aria-checked', this.indeterminate ? 'mixed' : String(this.checked));
          if (this.str('label')) this.setAttribute('aria-label', this.str('label'));
          this.toggleAttribute('aria-disabled', this.flag('disabled'));
          this._internals?.setFormValue?.(this.checked ? this.str('value', 'on') : null);
        }

        toggle(force?: boolean): void {
          if (this.flag('disabled')) return;
          const next = force === undefined ? !this.checked || this.indeterminate : force;
          this.indeterminate = false;
          this.checked = next;
          this.sync();
          const box = this.querySelector('.usa-checkbox-box');
          if (box && !this.reduced) this.motion(box, [{ transform: 'scale(0.75)' }, { transform: 'scale(1)' }], springEasing('bouncy'));
          this.dispatchEvent(new Event('change', { bubbles: true }));
          this.emit('change', { checked: next });
        }
      }
      return UsaCheckbox as unknown as CustomElementConstructor;
    },
    { id: 'checkbox', text: css }
  );
}
