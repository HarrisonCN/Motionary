'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit12 = require('../chunks/kit-12-B4H_NaC_.cjs');
var uiKit15 = require('../chunks/ui-kit-15-D2S59TJU.cjs');

function defineToggleGroup(tag = 'usa-toggle-group') {
    const ctor = base.defineElement(tag, Base => class ToggleGroup extends Base {
        constructor() {
            super(...arguments);
            this._value = [];
        }
        static get observedAttributes() { return ['options', 'values', 'value', 'multiple', 'required', 'name', 'label', 'size']; }
        get value() { return this._value.slice(); }
        mount() {
            const labels = kit.list(this.str('options'), 24);
            const given = kit.list(this.str('values'), 24);
            const vals = labels.map((l, i) => given[i] || l);
            const multiple = this.flag('multiple');
            const required = this.flag('required');
            const start = this.str('value');
            if (start !== this._seen) {
                this._seen = start;
                this._value = kit.list(start, 24).filter((v) => vals.includes(v));
            }
            else
                this._value = this._value.filter((v) => vals.includes(v));
            if (!multiple)
                this._value = this._value.slice(0, 1);
            if (required && !this._value.length && vals.length)
                this._value = [vals[0]];
            const root = moments.make('div', 'usa-kit usa-tgroup');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', this.str('label', 'Options'));
            const size = this.str('size', 'md');
            root.dataset.size = ['sm', 'lg'].includes(size) ? size : 'md';
            root.toggleAttribute('data-static', this.reduced);
            const buttons = labels.map((l, i) => {
                const b = moments.make('button', 'usa-tgroup-btn', l);
                b.type = 'button';
                b.dataset.value = vals[i];
                root.append(b);
                return b;
            });
            const hidden = this.str('name') ? moments.make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
                root.append(hidden);
            }
            this.append(root);
            let focus = Math.max(0, vals.indexOf(this._value[0]));
            const paint = () => {
                buttons.forEach((b, i) => {
                    b.setAttribute('aria-pressed', String(this._value.includes(vals[i])));
                    b.tabIndex = i === focus ? 0 : -1;
                });
                if (hidden)
                    hidden.value = this._value.join(',');
            };
            paint();
            const press = (i) => {
                const v = vals[i];
                const on = this._value.includes(v);
                if (on && required && this._value.length === 1)
                    return;
                if (multiple)
                    this._value = on ? this._value.filter((x) => x !== v) : vals.filter((x) => x === v || this._value.includes(x));
                else
                    this._value = on ? [] : [v];
                focus = i;
                paint();
                this.emit('change', { value: this._value.slice(), index: i });
            };
            this.listen(root, 'click', (e) => {
                const i = buttons.indexOf(e.target.closest('.usa-tgroup-btn'));
                if (i >= 0)
                    press(i);
            });
            this.listen(root, 'keydown', (e) => {
                const i = buttons.indexOf(e.target);
                if (i < 0)
                    return;
                const next = kit12.rovingIndex(e.key, i, buttons.length, getComputedStyle(root).direction === 'rtl');
                if (next < 0)
                    return;
                e.preventDefault();
                focus = next;
                paint();
                buttons[next].focus();
            });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'ui-kit-15', text: uiKit15.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineToggleGroup = defineToggleGroup;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/toggle-group.cjs.map