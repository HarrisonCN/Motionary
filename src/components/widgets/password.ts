import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, formShell, formReset } from './form-craft';
import css from './form-craft.css?raw';

/** Password entry with a reversible reveal button; values are never included in emitted event details. */
export interface UsaPasswordElement extends UsaElement { value: string; revealed: boolean; readonly input: HTMLInputElement | null; reset(): void; }
export function definePassword(tag = 'usa-password'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Password extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'value', 'name', 'disabled', 'required', 'minlength', 'maxlength', 'autocomplete', 'placeholder', 'revealed']; }
    private _input: HTMLInputElement | null = null; private _sync?: (attribute?: string) => void; private _initial?: string; private _value?: string;
    get input(): HTMLInputElement | null { return this._input; }
    get value(): string { return this._input?.value ?? this._value ?? this.str('value'); }
    set value(value: string) { this._value = String(value); if (this._input) { this._input.value = this._value; this._sync?.(); } }
    get revealed(): boolean { return this.flag('revealed'); } set revealed(value: boolean) { this.setFlag('revealed', value); }
    reset(): void { this.value = this._initial ?? ''; this.revealed = false; }
    changed(name: string): void { this._sync?.(name); }
    mount(): void {
      const value = this.value; this._initial ??= value;
      const { root, title, hint } = formShell(this, 'Password'), row = node('div', 'usa-form-row'), input = node('input'), reveal = node('button', '', 'Show');
      input.value = value; input.type = 'password'; reveal.type = 'button'; row.append(input, reveal); root.append(row, hint); this._input = input;
      const sync = (attribute?: string) => { if (attribute === 'value') input.value = this.str('value'); title.textContent = this.str('label', 'Password'); input.setAttribute('aria-label', title.textContent); input.name = this.str('name'); input.disabled = reveal.disabled = this.flag('disabled'); input.required = this.flag('required'); input.type = this.revealed ? 'text' : 'password'; input.setAttribute('autocomplete', this.str('autocomplete', 'new-password')); input.placeholder = this.str('placeholder', 'Enter password'); for (const key of ['minlength', 'maxlength']) { if (this.hasAttribute(key)) input.setAttribute(key, this.str(key)); else input.removeAttribute(key); } reveal.textContent = this.revealed ? 'Hide' : 'Show'; reveal.setAttribute('aria-label', this.revealed ? 'Hide password' : 'Show password'); reveal.setAttribute('aria-pressed', String(this.revealed)); hint.textContent = this.str('hint', 'Use a unique password.'); };
      this._sync = sync;
      this.listen(reveal, 'click', () => { const start = input.selectionStart, end = input.selectionEnd; this.revealed = !this.revealed; input.focus(); if (start !== null && end !== null) input.setSelectionRange(start, end); this.emit('action', { action: this.revealed ? 'reveal' : 'hide' }); });
      this.listen(input, 'input', () => this.emit('input', { filled: !!input.value })); this.listen(input, 'change', () => this.emit('change', { filled: !!input.value }));
      this.listen(input, 'keydown', (e: KeyboardEvent) => { hint.textContent = e.getModifierState('CapsLock') ? 'Caps Lock is on' : this.str('hint', 'Use a unique password.'); }); this.listen(input, 'blur', () => { hint.textContent = this.str('hint', 'Use a unique password.'); });
      formReset(this, () => this.reset()); this.onCleanup(() => { this._value = input.value; this._sync = undefined; this._input = null; this.revealed = false; }); sync();
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
