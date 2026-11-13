'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var formCraft = require('../chunks/form-craft-i3CaepYO.cjs');
var formOptions = require('../chunks/form-options-lnCyapKT.cjs');

function defineSelect(tag = 'usa-select') {
    const ctor = base.defineElement(tag, Base => class Select extends Base {
        constructor() {
            super(...arguments);
            this._select = null;
        }
        static get observedAttributes() { return ['label', 'hint', 'value', 'options', 'name', 'placeholder', 'required', 'disabled']; }
        get input() { return this._select; }
        get options() { return formOptions.choices(this._options ?? this.str('options', '[]')); }
        set options(value) { this._options = formOptions.choices(value); this._sync?.(true); }
        get value() { return this._select?.value ?? this.str('value'); }
        set value(value) { this.setAttribute('value', String(value)); }
        reset() { this.value = this._initial ?? ''; this._sync?.(); }
        changed(name) { if (name === 'options')
            this._options = undefined; this._sync?.(name === 'options' || name === 'placeholder'); }
        mount() {
            this._initial ?? (this._initial = this.str('value'));
            const { root, title, hint } = formCraft.formShell(this, 'Choose an option'), input = formCraft.node('select');
            root.append(input, hint);
            this._select = input;
            const animate = formCraft.formMotion(this);
            const sync = (rebuild = false) => { if (rebuild) {
                const empty = formCraft.node('option', '', this.str('placeholder', 'Choose an option'));
                empty.value = '';
                input.replaceChildren(empty);
                let group = '';
                let parent = input;
                for (const choice of this.options) {
                    if ((choice.group || '') !== group) {
                        group = choice.group || '';
                        if (group) {
                            const g = formCraft.node('optgroup');
                            g.label = group;
                            input.append(g);
                            parent = g;
                        }
                        else
                            parent = input;
                    }
                    const o = formCraft.node('option', '', choice.label);
                    o.value = choice.value;
                    o.disabled = !!choice.disabled;
                    parent.append(o);
                }
            } title.textContent = this.str('label', 'Choose an option'); hint.textContent = this.str('hint'); input.setAttribute('aria-label', title.textContent); input.name = this.str('name'); input.required = this.flag('required'); input.disabled = this.flag('disabled'); input.value = this.str('value'); };
            this._sync = sync;
            this.listen(input, 'change', () => { this.value = input.value; animate(input); this.emit('change', { value: this.value }); });
            formCraft.formReset(this, () => this.reset());
            this.onCleanup(() => { this._select = null; this._sync = undefined; });
            sync(true);
        }
    }, { id: 'form-craft', text: formCraft.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSelect = defineSelect;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/select.cjs.map