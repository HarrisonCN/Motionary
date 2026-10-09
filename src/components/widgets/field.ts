import { defineElement, type UsaElement } from '../base';
import css from './field.css?raw';

/**
 * `<usa-field>` (7.7) — an animated text input: the `label` floats up when
 * the field is focused or filled, the underline grows from the caret, and the
 * field validates on blur (native constraint validation: `type`, `required`,
 * `pattern`, `minlength`, `maxlength`). Invalid → the field shakes and the
 * message slides in (`usa:invalid`); valid → a check draws itself
 * (`usa:valid`). With `strength` (on `type="password"`) a 4-step strength
 * meter fills as you type (`passwordStrength()`). The `<input>` lives in the
 * light DOM, so a surrounding `<form>` submits it by its `name`. Reduced
 * motion: no shake, no slide — states switch at once.
 */
export interface UsaFieldElement extends UsaElement {
  value: string;
  readonly input: HTMLInputElement | null;
  validate(): boolean;
}

/** 0–4 password strength score with a label (7.7). */
export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (!pw) s = 0;
  else if (pw.length < 6) s = Math.min(s, 1);
  const score = Math.min(4, s) as 0 | 1 | 2 | 3 | 4;
  return { score, label: ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score] };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
let uid = 0;
const PASS = ['type', 'name', 'required', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'inputmode', 'placeholder'];

export function defineField(tag = 'usa-field'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaField extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'hint', 'error', 'strength', ...PASS];
        }
        private _id = `usa-fld-${++uid}`;
        private _checking = false;
        get input(): HTMLInputElement | null {
          return this.querySelector('.usa-fld-input');
        }
        get value(): string {
          return this.input?.value ?? this.str('value');
        }
        set value(v: string) {
          if (this.input) {
            this.input.value = v;
            this.sync();
          } else this.setAttribute('value', v);
        }
        mount(): void {
          const keep = this.input?.value ?? this.str('value');
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const id = this._id;
          const strength = this.flag('strength');
          const attrs = PASS.filter((a) => this.hasAttribute(a))
            .map((a) => (a === 'required' ? ' required' : ` ${a}="${esc(this.str(a))}"`))
            .join('');
          this.insertAdjacentHTML(
            'beforeend',
            `<div class="usa-fld" data-usa-part><input class="usa-fld-input" id="${id}"${attrs} aria-describedby="${id}-msg"${this.hasAttribute('type') ? '' : ' type="text"'}><label class="usa-fld-label" for="${id}">${esc(this.str('label', 'Label'))}</label><span class="usa-fld-line" aria-hidden="true"></span><svg class="usa-fld-ok" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg>${strength ? '<div class="usa-fld-meter" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' : ''}<p class="usa-fld-msg" id="${id}-msg" aria-live="polite">${esc(this.str('hint'))}</p></div>`
          );
          const input = this.input as HTMLInputElement;
          input.value = keep;
          this.listen(input, 'input', () => {
            if (this.hasAttribute('data-invalid')) this.validate();
            this.sync();
          });
          this.listen(input, 'focus', () => this.setAttribute('data-focus', ''));
          this.listen(input, 'blur', () => {
            this.removeAttribute('data-focus');
            if (input.value || input.required) this.validate();
          });
          // form submit / reportValidity(): show our message instead of the browser bubble
          this.listen(input, 'invalid', (e: Event) => {
            e.preventDefault();
            if (!this._checking) this.validate();
          });
          this.sync();
        }
        private sync(): void {
          const input = this.input;
          if (!input) return;
          this.setFlag('data-filled', !!input.value);
          const meter = this.querySelector('.usa-fld-meter');
          if (meter) {
            const { score, label } = passwordStrength(input.value);
            meter.setAttribute('data-score', String(score));
            if (!this.hasAttribute('data-invalid')) {
              const msg = this.querySelector('.usa-fld-msg') as HTMLElement;
              msg.textContent = input.value ? `Strength: ${label}` : this.str('hint');
            }
          }
        }
        /** Runs native validation; animates and emits `usa:valid` / `usa:invalid`. */
        validate(): boolean {
          const input = this.input;
          if (!input) return false;
          this._checking = true;
          const ok = input.checkValidity();
          this._checking = false;
          const msg = this.querySelector('.usa-fld-msg') as HTMLElement;
          const was = this.hasAttribute('data-invalid');
          this.setFlag('data-invalid', !ok);
          this.setFlag('data-valid', ok && !!input.value);
          input.setAttribute('aria-invalid', String(!ok));
          if (!ok) {
            msg.textContent = this.str('error') || input.validationMessage || 'Please check this field';
            if (!was && !this.reduced) {
              this.motion(this.querySelector('.usa-fld') as Element, [{ transform: 'none' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
              this.motion(msg, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
            }
            this.emit('invalid', { value: input.value, message: msg.textContent });
          } else {
            msg.textContent = this.str('hint');
            this.sync();
            if (input.value) this.emit('valid', { value: input.value });
          }
          return ok;
        }
      }
      return UsaField as unknown as CustomElementConstructor;
    },
    { id: 'field', text: css }
  );
}
