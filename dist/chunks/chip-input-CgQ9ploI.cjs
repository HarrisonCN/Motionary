'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var momentsUi = require('./moments-ui-Wb8gBRiX.cjs');

/** Split typed or pasted text into trimmed, non-empty chip values. */
function splitChips(text) {
    return text.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
}
function defineChipInput(tag = 'usa-chip-input') {
    const ctor = base.defineElement(tag, Base => class ChipInput extends Base {
        static get observedAttributes() { return ['value', 'label', 'placeholder', 'max', 'name', 'disabled']; }
        get values() { return splitChips(this.str('value')); }
        set values(list) { this.setAttribute('value', (Array.isArray(list) ? list : []).map((s) => String(s).replace(/,/g, ' ').trim()).filter(Boolean).join(', ')); }
        changed() { this._sync?.(); }
        mount() {
            const root = moments.make('div', 'usa-moment usa-chips');
            const id = moments.uniqueId('usa-chips');
            const title = moments.make('label', 'usa-chips-label');
            title.htmlFor = id;
            const box = moments.make('div', 'usa-chips-box');
            const list = moments.make('ul', 'usa-chips-list');
            const input = moments.make('input', 'usa-chips-input');
            input.type = 'text';
            input.id = id;
            input.autocomplete = 'off';
            const hidden = moments.make('span', 'usa-chips-hidden');
            const status = moments.make('span', 'usa-sr');
            status.setAttribute('role', 'status');
            box.append(list, input);
            root.append(title, box, hidden, status);
            this.append(root);
            const limit = () => Math.round(moments.bound(this.num('max', 0), 0, 50, 0));
            const commit = (next, said) => {
                this.values = next;
                status.textContent = said;
                this.emit('change', { values: this.values });
            };
            const addFrom = (text) => {
                const current = this.values, max = limit();
                const fresh = splitChips(text).filter((v, i, a) => !current.includes(v) && a.indexOf(v) === i);
                const room = max ? Math.max(0, max - current.length) : fresh.length;
                const added = fresh.slice(0, room);
                input.value = '';
                if (!added.length)
                    return;
                commit([...current, ...added], `Added ${added.join(', ')}`);
                list.lastElementChild?.setAttribute('data-new', '');
            };
            const removeAt = (i) => {
                const current = this.values;
                const [gone] = current.splice(i, 1);
                if (gone === undefined)
                    return;
                commit(current, `Removed ${gone}`);
                input.focus();
            };
            const sync = () => {
                const values = this.values, disabled = this.flag('disabled'), max = limit();
                title.textContent = this.str('label', 'Tags');
                input.placeholder = this.str('placeholder', 'Add tag');
                input.disabled = disabled || (max > 0 && values.length >= max);
                root.toggleAttribute('data-disabled', disabled);
                root.toggleAttribute('data-static', this.reduced);
                const had = new Set(Array.from(list.children, (li) => li.dataset.value));
                list.replaceChildren(...values.map((v, i) => {
                    const li = moments.make('li', 'usa-chip');
                    li.dataset.value = v;
                    if (!had.has(v) && had.size)
                        li.setAttribute('data-new', '');
                    const x = moments.make('button', 'usa-chip-remove', '×');
                    x.type = 'button';
                    x.disabled = disabled;
                    x.setAttribute('aria-label', `Remove ${v}`);
                    x.addEventListener('click', () => removeAt(i));
                    li.append(moments.make('span', 'usa-chip-text', v), x);
                    return li;
                }));
                const name = this.str('name');
                hidden.replaceChildren(...(name ? values.map((v) => Object.assign(moments.make('input'), { type: 'hidden', name, value: v })) : []));
            };
            this._sync = sync;
            this.listen(input, 'keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
                    e.preventDefault();
                    addFrom(input.value);
                }
                else if (e.key === 'Enter')
                    e.preventDefault();
                else if (e.key === 'Backspace' && !input.value && this.values.length)
                    removeAt(this.values.length - 1);
            });
            this.listen(input, 'paste', (e) => {
                const text = e.clipboardData?.getData('text') || '';
                if (/[,\n]/.test(text)) {
                    e.preventDefault();
                    addFrom(input.value + text);
                }
            });
            this.listen(input, 'blur', () => { if (input.value.trim())
                addFrom(input.value); });
            this.onCleanup(() => { root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineChipInput = defineChipInput;
exports.splitChips = splitChips;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/chip-input-CgQ9ploI.cjs.map