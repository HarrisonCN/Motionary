import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, formShell, formReset, formMotion } from './form-craft';
import { choices, choiceId, type FormChoice } from './form-options';

import css from './form-craft.css?raw';
export interface UsaComboboxElement extends UsaElement { value: string; options: FormChoice[]; show(): void; hide(): void; reset(): void; }
export function defineCombobox(tag = 'usa-combobox'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Combobox extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'value', 'options', 'name', 'placeholder', 'required', 'disabled']; }
    private _options?: FormChoice[]; private _sync?: () => void; private _show?: (on: boolean) => void; private _initial?: string;
    get value(): string { const value = this.str('value'); return this.options.some(o => o.value === value && !o.disabled) ? value : ''; } set value(value: string) { this.setAttribute('value', String(value)); }
    get options(): FormChoice[] { return choices(this._options ?? this.str('options', '[]')); } set options(value: FormChoice[]) { this._options = choices(value); this._sync?.(); }
    show(): void { this._show?.(true); } hide(): void { this._show?.(false); } reset(): void { this.value = this._initial ?? ''; this.hide(); this._sync?.(); }
    changed(name: string): void { if (name === 'options') this._options = undefined; this._sync?.(); }
    mount(): void {
      this._initial ??= this.value; const { root, title, hint } = formShell(this, 'Search and choose'), input = node('input'), hidden = node('input'), list = node('div', 'usa-form-options');
      input.type = 'text'; input.autocomplete = 'off'; input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-haspopup', 'listbox'); list.id = choiceId(); list.setAttribute('role', 'listbox'); input.setAttribute('aria-controls', list.id); hidden.type = 'hidden'; root.append(input, hidden, list, hint);
      let opened = false, query = '', active = -1, visible: FormChoice[] = [], alive = true; const animate = formMotion(this);
      const render = () => { visible = this.options.filter(o => o.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())); if (active < 0 || active >= visible.length || visible[active].disabled) active = visible.findIndex(o => !o.disabled); list.replaceChildren(); visible.forEach((option, i) => { const row = node('div', 'usa-form-option', option.label); row.id = list.id + '-' + i; row.dataset.value = option.value; row.setAttribute('role', 'option'); row.setAttribute('aria-selected', String(option.value === this.value)); row.setAttribute('aria-disabled', String(!!option.disabled)); row.toggleAttribute('data-active', i === active); list.append(row); }); if (!visible.length) list.append(node('div', 'usa-form-option', 'No results')); if (opened && active >= 0) input.setAttribute('aria-activedescendant', list.id + '-' + active); else input.removeAttribute('aria-activedescendant'); };
      const setOpen = (on: boolean) => { opened = on && !this.flag('disabled'); if (!opened) { query = ''; input.value = this.options.find(o => o.value === this.value)?.label || ''; } list.hidden = !opened; input.setAttribute('aria-expanded', String(opened)); render(); if (opened) animate(list); };
      const sync = () => { title.textContent = this.str('label', 'Search and choose'); hint.textContent = this.str('hint'); input.setAttribute('aria-label', title.textContent); input.placeholder = this.str('placeholder', 'Search options'); input.disabled = this.flag('disabled'); input.required = this.flag('required'); input.setCustomValidity(this.flag('required') && !this.options.some(o => o.value === this.value && !o.disabled) ? 'Choose an option from the list.' : ''); hidden.name = this.str('name'); hidden.value = this.value; hidden.disabled = input.disabled; if (!opened) input.value = this.options.find(o => o.value === this.value)?.label || ''; if (input.disabled) setOpen(false); else render(); };
      this._sync = sync; this._show = on => { setOpen(on); if (on) input.focus(); };
      const select = (option?: FormChoice) => { if (!option || option.disabled || this.flag('disabled')) return; this.value = option.value; setOpen(false); input.focus(); this.emit('change', { value: this.value }); };
      this.listen(input, 'input', () => { query = input.value; active = -1; setOpen(true); this.emit('query', { query }); }); this.listen(input, 'click', () => { query = ''; setOpen(true); });
      this.listen(input, 'keydown', (e: KeyboardEvent) => { if (this.flag('disabled') || e.isComposing) return; if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const was = opened; if (!opened) { query = ''; setOpen(true); } const enabled = visible.map((o, i) => o.disabled ? -1 : i).filter(i => i >= 0); if (enabled.length && was) { const current = enabled.indexOf(active); active = enabled[(current + (e.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length]; render(); document.getElementById(list.id + '-' + active)?.scrollIntoView({ block: 'nearest' }); } } else if (e.key === 'Enter' && opened) { e.preventDefault(); select(visible[active]); } else if (e.key === 'Escape' && opened) { e.preventDefault(); setOpen(false); } else if (e.key === 'Tab') setOpen(false); else if (opened && (e.key === 'Home' || e.key === 'End')) { e.preventDefault(); const indexes = visible.map((o, i) => o.disabled ? -1 : i).filter(i => i >= 0); active = e.key === 'Home' ? indexes[0] ?? -1 : indexes[indexes.length - 1] ?? -1; render(); } });
      // WebKit touch does not promise a compatibility click after a canceled
      // pointerdown. Commit a stationary pointer release directly; scrolling
      // cancels the gesture. Keep click for keyboard/assistive activation.
      let press: { id: number; x: number; y: number; value: string } | undefined;
      this.listen(list, 'pointerdown', (e: PointerEvent) => {
        if (!e.isPrimary || e.button !== 0) return;
        const row = (e.target as Element).closest<HTMLElement>('[data-value]');
        if (row && list.contains(row)) { e.preventDefault(); press = { id: e.pointerId, x: e.clientX, y: e.clientY, value: row.dataset.value! }; }
      });
      this.listen(list, 'pointercancel', () => { press = undefined; });
      this.listen(list, 'pointerup', (e: PointerEvent) => {
        const down = press; press = undefined;
        const row = (e.target as Element).closest<HTMLElement>('[data-value]');
        if (down && down.id === e.pointerId && row?.dataset.value === down.value && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10) { e.preventDefault(); select(visible.find(o => o.value === down.value)); }
      });
      this.listen(list, 'click', (e: MouseEvent) => { if (e.detail) return; const row = (e.target as Element).closest<HTMLElement>('[data-value]'); if (row && list.contains(row)) select(visible.find(o => o.value === row.dataset.value)); });
      this.listen(document, 'pointerdown', (e: PointerEvent) => { if (!e.composedPath().includes(this)) setOpen(false); }); this.listen(this, 'focusout', () => queueMicrotask(() => { if (alive && !this.contains(document.activeElement)) setOpen(false); }));
      formReset(this, () => this.reset()); this.onCleanup(() => { alive = false; this._sync = this._show = undefined; }); sync(); setOpen(false);
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
