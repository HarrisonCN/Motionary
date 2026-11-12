import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, f as formShell, n as node, b as formReset } from '../chunks/form-craft-DgeQGc4w.js';
import { c as choices } from '../chunks/form-options-e_FWVRvi.js';

function defineMultiSelect(tag = 'usa-multi-select') {
    const ctor = defineElement(tag, Base => class MultiSelect extends Base {
        static get observedAttributes() { return ['label', 'hint', 'values', 'options', 'name', 'max', 'disabled']; }
        get options() { return choices(this._options ?? this.str('options', '[]')); }
        set options(value) { this._options = choices(value); this._sync?.(true); }
        get values() { let values; try {
            values = JSON.parse(this.str('values', '[]'));
        }
        catch {
            return [];
        } if (!Array.isArray(values))
            return []; const allowed = new Set(this.options.filter(o => !o.disabled).map(o => o.value)); return [...new Set(values.filter((v) => typeof v === 'string' && allowed.has(v)))].slice(0, Math.max(0, Math.floor(this.num('max', 1000)))); }
        set values(values) { this.setAttribute('values', JSON.stringify(Array.isArray(values) ? values : [])); }
        reset() { this.values = this._initial ?? []; this._sync?.(); }
        changed(name) { if (name === 'options')
            this._options = undefined; this._sync?.(name === 'options'); }
        mount() {
            this._initial ?? (this._initial = this.values);
            const { root, title, hint } = formShell(this, 'Select interests'), chips = node('div', 'usa-form-tokens'), search = node('input'), list = node('div', 'usa-form-options');
            search.type = 'search';
            search.placeholder = 'Filter options';
            search.setAttribute('aria-label', 'Filter options');
            list.setAttribute('role', 'group');
            root.append(chips, search, list, hint);
            const rows = new Map();
            const filter = () => rows.forEach((row, value) => { row.label.hidden = !this.options.find(o => o.value === value)?.label.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()); });
            const sync = (rebuild = false) => { title.textContent = this.str('label', 'Select interests'); list.setAttribute('aria-label', title.textContent); hint.textContent = this.str('hint', 'Select any combination.'); if (rebuild) {
                list.replaceChildren();
                rows.clear();
                this.options.forEach(option => { const label = node('label', 'usa-form-check'), input = node('input'); input.type = 'checkbox'; label.append(input, node('span', '', option.label)); rows.set(option.value, { label, input }); list.append(label); });
            } const values = this.values, max = Math.max(0, Math.floor(this.num('max', 1000))); rows.forEach((row, value) => { row.input.value = value; row.input.name = this.str('name'); row.input.checked = values.includes(value); row.input.disabled = this.flag('disabled') || !!this.options.find(o => o.value === value)?.disabled || (!row.input.checked && values.length >= max); }); search.disabled = this.flag('disabled'); chips.replaceChildren(); values.forEach(value => { const chip = node('span', 'usa-form-token', this.options.find(o => o.value === value)?.label || value), remove = node('button', '', '×'); remove.type = 'button'; remove.dataset.remove = value; remove.setAttribute('aria-label', `Remove ${chip.textContent}`); remove.disabled = this.flag('disabled'); chip.append(remove); chips.append(chip); }); filter(); };
            this._sync = sync;
            this.listen(search, 'input', filter);
            this.listen(search, 'keydown', (e) => { if (e.key === 'Escape') {
                search.value = '';
                filter();
            }
            else if (e.key === 'Backspace' && !search.value && this.values.length) {
                this.values = this.values.slice(0, -1);
                this.emit('change', { values: this.values });
            } });
            this.listen(list, 'change', (e) => { const input = e.target; if (this.flag('disabled') || input.disabled || !list.contains(input))
                return; this.values = input.checked ? [...this.values, input.value] : this.values.filter(v => v !== input.value); this.emit('change', { values: this.values }); });
            this.listen(chips, 'click', (e) => { const button = e.target.closest('button[data-remove]'); if (!button || button.disabled)
                return; this.values = this.values.filter(v => v !== button.dataset.remove); search.focus(); this.emit('change', { values: this.values }); });
            formReset(this, () => { search.value = ''; this.reset(); });
            this.onCleanup(() => { this._sync = undefined; });
            sync(true);
        }
    }, { id: 'form-craft', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineMultiSelect };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/multi-select.js.map