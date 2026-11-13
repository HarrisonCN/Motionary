import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, formShell, formReset } from './form-craft';
import { choices, type FormChoice } from './form-options';
import css from './form-craft.css?raw';
export interface UsaMultiSelectElement extends UsaElement { values: string[]; options: FormChoice[]; reset(): void; }
export function defineMultiSelect(tag = 'usa-multi-select'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class MultiSelect extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'values', 'options', 'name', 'max', 'disabled']; }
    private _options?: FormChoice[]; private _sync?: (rebuild?: boolean) => void; private _initial?: string[];
    get options(): FormChoice[] { return choices(this._options ?? this.str('options', '[]')); } set options(value: FormChoice[]) { this._options = choices(value); this._sync?.(true); }
    get values(): string[] { let values: unknown; try { values = JSON.parse(this.str('values', '[]')); } catch { return []; } if (!Array.isArray(values)) return []; const allowed = new Set(this.options.filter(o => !o.disabled).map(o => o.value)); return [...new Set(values.filter((v): v is string => typeof v === 'string' && allowed.has(v)))].slice(0, Math.max(0, Math.floor(this.num('max', 1000)))); }
    set values(values: string[]) { this.setAttribute('values', JSON.stringify(Array.isArray(values) ? values : [])); }
    reset(): void { this.values = this._initial ?? []; this._sync?.(); }
    changed(name: string): void { if (name === 'options') this._options = undefined; this._sync?.(name === 'options'); }
    mount(): void {
      this._initial ??= this.values; const { root, title, hint } = formShell(this, 'Select interests'), chips = node('div', 'usa-form-tokens'), search = node('input'), list = node('div', 'usa-form-options'); search.type = 'search'; search.placeholder = 'Filter options'; search.setAttribute('aria-label', 'Filter options'); list.setAttribute('role', 'group'); root.append(chips, search, list, hint);
      const rows = new Map<string, { label: HTMLLabelElement; input: HTMLInputElement }>();
      const filter = () => rows.forEach((row, value) => { row.label.hidden = !this.options.find(o => o.value === value)?.label.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()); });
      const sync = (rebuild = false) => { title.textContent = this.str('label', 'Select interests'); list.setAttribute('aria-label', title.textContent); hint.textContent = this.str('hint', 'Select any combination.'); if (rebuild) { list.replaceChildren(); rows.clear(); this.options.forEach(option => { const label = node('label', 'usa-form-check'), input = node('input'); input.type = 'checkbox'; label.append(input, node('span', '', option.label)); rows.set(option.value, { label, input }); list.append(label); }); } const values = this.values, max = Math.max(0, Math.floor(this.num('max', 1000))); rows.forEach((row, value) => { row.input.value = value; row.input.name = this.str('name'); row.input.checked = values.includes(value); row.input.disabled = this.flag('disabled') || !!this.options.find(o => o.value === value)?.disabled || (!row.input.checked && values.length >= max); }); search.disabled = this.flag('disabled'); chips.replaceChildren(); values.forEach(value => { const chip = node('span', 'usa-form-token', this.options.find(o => o.value === value)?.label || value), remove = node('button', '', '×'); remove.type = 'button'; remove.dataset.remove = value; remove.setAttribute('aria-label', `Remove ${chip.textContent}`); remove.disabled = this.flag('disabled'); chip.append(remove); chips.append(chip); }); filter(); };
      this._sync = sync; this.listen(search, 'input', filter); this.listen(search, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') { search.value = ''; filter(); } else if (e.key === 'Backspace' && !search.value && this.values.length) { this.values = this.values.slice(0, -1); this.emit('change', { values: this.values }); } });
      this.listen(list, 'change', (e: Event) => { const input = e.target as HTMLInputElement; if (this.flag('disabled') || input.disabled || !list.contains(input)) return; this.values = input.checked ? [...this.values, input.value] : this.values.filter(v => v !== input.value); this.emit('change', { values: this.values }); });
      this.listen(chips, 'click', (e: Event) => { const button = (e.target as Element).closest<HTMLButtonElement>('button[data-remove]'); if (!button || button.disabled) return; this.values = this.values.filter(v => v !== button.dataset.remove); search.focus(); this.emit('change', { values: this.values }); });
      formReset(this, () => { search.value = ''; this.reset(); }); this.onCleanup(() => { this._sync = undefined; }); sync(true);
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
