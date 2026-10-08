import { deprecate, defineElement, type UsaElement } from '../base';
import css from './toggle.css?raw';

/**
 * `<usa-toggle>` — an accessible switch whose knob stretches while pressed
 * and glides across (the Windows 11 / iOS toggle). `role="switch"`,
 * keyboard (Space / Enter), and form-associated where `ElementInternals`
 * exists (submits `value`, default `"on"`, under `name` when checked).
 *
 * Attributes: `checked`, `disabled`, `name`, `value`, `label`
 * (accessible name if there is no `aria-label` / `<label>`). Events:
 * `change` and `usa:change` (`detail.checked`). Reduced motion: no glide.
 */
export interface UsaToggleElement extends UsaElement {
  checked: boolean;
  disabled: boolean;
  toggle(force?: boolean): void;
}

export function defineToggle(tag = 'usa-toggle'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaToggle extends Base {
        static formAssociated = true;
        static get observedAttributes(): string[] {
          return ['checked', 'disabled', 'label'];
        }

        private _internals: ElementInternals | null = null;

        constructor() {
          super();
          try {
            this._internals = typeof (this as any).attachInternals === 'function' ? (this as any).attachInternals() : null;
          } catch {
            this._internals = null;
          }
        }

        get checked(): boolean {
          return this.hasAttribute('checked');
        }
        set checked(v: boolean) {
          this.toggleAttribute('checked', !!v);
        }
        get disabled(): boolean {
          return this.hasAttribute('disabled');
        }
        set disabled(v: boolean) {
          this.toggleAttribute('disabled', !!v);
        }

        changed(): void {
          this.sync();
        }

        private sync(): void {
          this.setAttribute('aria-checked', String(this.checked));
          this.setAttribute('aria-disabled', String(this.disabled));
          this.tabIndex = this.disabled ? -1 : 0;
          const label = this.getAttribute('label');
          if (label && !this.hasAttribute('aria-label')) this.setAttribute('aria-label', label);
          this._internals?.setFormValue?.(this.checked ? this.str('value', 'on') : null);
        }

        mount(): void {
          deprecate('usa-toggle', '<usa-toggle> is deprecated since 6.9 and removed in 7.0 — use <usa-switch> (motionary/components/widgets; npx usa-codemod-7).');
          if (!this.querySelector(':scope > .usa-toggle-track')) {
            const track = document.createElement('span');
            track.className = 'usa-toggle-track';
            track.setAttribute('aria-hidden', 'true');
            const knob = document.createElement('span');
            knob.className = 'usa-toggle-knob';
            track.append(knob);
            this.prepend(track);
          }
          this.setAttribute('role', 'switch');
          this.sync();
          this.listen(this, 'click', () => this.toggle());
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              if (!e.repeat) this.toggle();
            }
          });
          this.listen(this, 'pointerdown', () => !this.disabled && this.setAttribute('data-pressed', ''));
          for (const t of ['pointerup', 'pointerleave', 'pointercancel']) this.listen(this, t, () => this.removeAttribute('data-pressed'));
        }

        toggle(force?: boolean): void {
          if (this.disabled) return;
          const next = force === undefined ? !this.checked : force;
          if (next === this.checked) return;
          this.checked = next;
          this.sync();
          this.dispatchEvent(new Event('change', { bubbles: true }));
          this.emit('change', { checked: next });
        }
      },
    { id: 'toggle', text: css }
  );
}
