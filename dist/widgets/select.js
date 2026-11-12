import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, f as formShell, n as node, a as formMotion, b as formReset } from '../chunks/form-craft-CGsmJjVw.js';
import { c as choices } from '../chunks/form-options-e_FWVRvi.js';

function defineSelect(tag = 'usa-select') {
    const ctor = defineElement(tag, Base => class Select extends Base {
        constructor() {
            super(...arguments);
            this._select = null;
        }
        static get observedAttributes() { return ['label', 'hint', 'value', 'options', 'name', 'placeholder', 'required', 'disabled']; }
        get input() { return this._select; }
        get options() { return choices(this._options ?? this.str('options', '[]')); }
        set options(value) { this._options = choices(value); this._sync?.(true); }
        get value() { return this._select?.value ?? this.str('value'); }
        set value(value) { this.setAttribute('value', String(value)); }
        reset() { this.value = this._initial ?? ''; this._sync?.(); }
        changed(name) { if (name === 'options')
            this._options = undefined; this._sync?.(name === 'options' || name === 'placeholder'); }
        mount() {
            this._initial ?? (this._initial = this.str('value'));
            const { root, title, hint } = formShell(this, 'Choose an option'), input = node('select');
            root.append(input, hint);
            this._select = input;
            const animate = formMotion(this);
            const sync = (rebuild = false) => { if (rebuild) {
                const empty = node('option', '', this.str('placeholder', 'Choose an option'));
                empty.value = '';
                input.replaceChildren(empty);
                let group = '';
                let parent = input;
                for (const choice of this.options) {
                    if ((choice.group || '') !== group) {
                        group = choice.group || '';
                        if (group) {
                            const g = node('optgroup');
                            g.label = group;
                            input.append(g);
                            parent = g;
                        }
                        else
                            parent = input;
                    }
                    const o = node('option', '', choice.label);
                    o.value = choice.value;
                    o.disabled = !!choice.disabled;
                    parent.append(o);
                }
            } title.textContent = this.str('label', 'Choose an option'); hint.textContent = this.str('hint'); input.setAttribute('aria-label', title.textContent); input.name = this.str('name'); input.required = this.flag('required'); input.disabled = this.flag('disabled'); input.value = this.str('value'); };
            this._sync = sync;
            this.listen(input, 'change', () => { this.value = input.value; animate(input); this.emit('change', { value: this.value }); });
            formReset(this, () => this.reset());
            this.onCleanup(() => { this._select = null; this._sync = undefined; });
            sync(true);
        }
    }, { id: 'form-craft', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSelect };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/select.js.map