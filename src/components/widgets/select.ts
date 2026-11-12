import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, formShell, formReset, formMotion } from './form-craft';
import { choices, type FormChoice } from './form-options';
import css from './form-craft.css?raw';
export type { FormChoice } from './form-options';

/** Styled native select: platform keyboard, optgroups, validation and real form submission. */
export interface UsaSelectElement extends UsaElement { value: string; options: FormChoice[]; reset(): void; readonly input: HTMLSelectElement | null; }
export function defineSelect(tag = 'usa-select'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Select extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'value', 'options', 'name', 'placeholder', 'required', 'disabled']; }
    private _select: HTMLSelectElement | null = null; private _options?: FormChoice[]; private _initial?: string; private _sync?: (rebuild?: boolean) => void;
    get input(): HTMLSelectElement | null { return this._select; }
    get options(): FormChoice[] { return choices(this._options ?? this.str('options', '[]')); } set options(value: FormChoice[]) { this._options = choices(value); this._sync?.(true); }
    get value(): string { return this._select?.value ?? this.str('value'); } set value(value: string) { this.setAttribute('value', String(value)); }
    reset(): void { this.value = this._initial ?? ''; this._sync?.(); }
    changed(name: string): void { if (name === 'options') this._options = undefined; this._sync?.(name === 'options' || name === 'placeholder'); }
    mount(): void {
      this._initial ??= this.str('value'); const { root, title, hint } = formShell(this, 'Choose an option'), input = node('select'); root.append(input, hint); this._select = input; const animate = formMotion(this);
      const sync = (rebuild = false) => { if (rebuild) { const empty = node('option', '', this.str('placeholder', 'Choose an option')); empty.value = ''; input.replaceChildren(empty); let group = ''; let parent: HTMLSelectElement | HTMLOptGroupElement = input; for (const choice of this.options) { if ((choice.group || '') !== group) { group = choice.group || ''; if (group) { const g = node('optgroup'); g.label = group; input.append(g); parent = g; } else parent = input; } const o = node('option', '', choice.label); o.value = choice.value; o.disabled = !!choice.disabled; parent.append(o); } } title.textContent = this.str('label', 'Choose an option'); hint.textContent = this.str('hint'); input.setAttribute('aria-label', title.textContent); input.name = this.str('name'); input.required = this.flag('required'); input.disabled = this.flag('disabled'); input.value = this.str('value'); };
      this._sync = sync; this.listen(input, 'change', () => { this.value = input.value; animate(input); this.emit('change', { value: this.value }); }); formReset(this, () => this.reset()); this.onCleanup(() => { this._select = null; this._sync = undefined; }); sync(true);
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
