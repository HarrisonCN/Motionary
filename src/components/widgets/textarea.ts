import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, numberValue, formShell, formReset } from './form-craft';
import { choiceId } from './form-options';
import css from './form-craft.css?raw';

export interface UsaTextareaElement extends UsaElement {
  value: string;
  readonly input: HTMLTextAreaElement | null;
  focusInput(): void;
  reset(): void;
}
/** Native multiline entry with optional bounded auto-resize, a UTF-16 character counter and form reset. */
export function defineTextarea(tag = 'usa-textarea'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Textarea extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'value', 'name', 'placeholder', 'rows', 'max-rows', 'maxlength', 'required', 'disabled', 'readonly', 'auto-resize']; }
    private _sync?: () => void;
    private _initial?: string;
    get input(): HTMLTextAreaElement | null { return this.querySelector('textarea'); }
    get value(): string { return this.str('value'); }
    set value(value: string) { this.setAttribute('value', String(value)); this._sync?.(); }
    focusInput(): void { this.input?.focus(); }
    reset(): void { this.value = this._initial ?? ''; }
    changed(): void { this._sync?.(); }
    mount(): void {
      this._initial ??= this.value;
      const { root, title, hint } = formShell(this, 'Your notes'), input = node('textarea'), footer = node('div', 'usa-form-text-footer'), count = node('output');
      hint.id = choiceId(); count.id = choiceId(); input.setAttribute('aria-describedby', hint.id + ' ' + count.id); footer.append(hint, count); root.append(input, footer);
      const resize = () => {
        if (!this.flag('auto-resize')) { input.style.removeProperty('height'); input.style.removeProperty('overflow-y'); return; }
        const style = getComputedStyle(input), line = parseFloat(style.lineHeight) || 22;
        const extra = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0) + (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
        const rows = input.rows, max = Math.max(rows, numberValue(this.num('max-rows', 10), 10, 2, 40));
        input.style.height = 'auto';
        const needed = Math.max(rows * line + extra, input.scrollHeight + (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0));
        input.style.height = Math.min(needed, max * line + extra) + 'px'; input.style.overflowY = needed > max * line + extra ? 'auto' : 'hidden';
      };
      const sync = () => {
        title.textContent = this.str('label', 'Your notes'); hint.textContent = this.str('hint'); input.setAttribute('aria-label', title.textContent);
        if (input.value !== this.value) input.value = this.value;
        input.name = this.str('name'); input.placeholder = this.str('placeholder'); input.rows = Math.round(numberValue(this.num('rows', 3), 3, 2, 20));
        input.required = this.flag('required'); input.disabled = this.flag('disabled'); input.readOnly = this.flag('readonly');
        const max = Math.floor(numberValue(this.num('maxlength', -1), -1, -1, 1e7)); if (max >= 0) input.maxLength = max; else input.removeAttribute('maxlength');
        count.textContent = input.value.length + (max >= 0 ? ' / ' + max : '') + ' characters'; count.toggleAttribute('data-limit', max >= 0 && input.value.length >= max); resize();
      };
      this._sync = sync;
      this.listen(input, 'input', () => { this.value = input.value; this.emit('input', { value: this.value }); });
      this.listen(input, 'change', () => this.emit('change', { value: this.value }));
      this.listen(window, 'resize', resize); let alive = true; queueMicrotask(() => { if (alive) resize(); }); this.onCleanup(() => { alive = false; });
      formReset(this, () => this.reset()); this.onCleanup(() => { this._sync = undefined; }); sync();
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
