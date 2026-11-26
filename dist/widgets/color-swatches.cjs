'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit12 = require('../chunks/kit-12-B4H_NaC_.cjs');
var kit15 = require('../chunks/kit-15-D1Ovwhys.cjs');
var uiKit15 = require('../chunks/ui-kit-15-D2S59TJU.cjs');

function defineColorSwatches(tag = 'usa-color-swatches') {
    const ctor = base.defineElement(tag, Base => class ColorSwatches extends Base {
        constructor() {
            super(...arguments);
            this._value = '';
        }
        static get observedAttributes() { return ['colors', 'names', 'value', 'name', 'label', 'shape', 'size']; }
        get value() { return this._value; }
        mount() {
            const colors = kit.list(this.str('colors'), 40).map(kit.cleanColor).filter(Boolean);
            const names = kit.list(this.str('names'), 40);
            const start = this.str('value');
            if (start !== this._seen) {
                this._seen = start;
                this._value = colors.includes(start) ? start : colors[0] || '';
            }
            else if (!colors.includes(this._value))
                this._value = colors[0] || '';
            const root = moments.make('div', 'usa-kit usa-swatch');
            root.toggleAttribute('data-static', this.reduced);
            root.dataset.shape = this.str('shape') === 'square' ? 'square' : 'circle';
            root.style.setProperty('--usa-swatch-size', `${Math.max(16, Math.min(80, this.num('size', 32)))}px`);
            const row = moments.make('div', 'usa-swatch-row');
            row.setAttribute('role', 'radiogroup');
            row.setAttribute('aria-label', this.str('label', 'Colour'));
            const caption = moments.make('span', 'usa-swatch-name');
            caption.setAttribute('aria-hidden', 'true');
            const buttons = colors.map((c, i) => {
                const b = moments.make('button', 'usa-swatch-btn');
                b.type = 'button';
                b.setAttribute('role', 'radio');
                b.setAttribute('aria-label', names[i] || c);
                b.style.setProperty('--c', c);
                b.style.setProperty('--ink', kit15.inkOn(c));
                row.append(b);
                return b;
            });
            const hidden = this.str('name') ? moments.make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
            }
            root.append(row, caption);
            if (hidden)
                root.append(hidden);
            this.append(root);
            const paint = () => {
                const k = colors.indexOf(this._value);
                buttons.forEach((b, i) => {
                    b.setAttribute('aria-checked', String(i === k));
                    b.tabIndex = i === (k < 0 ? 0 : k) ? 0 : -1;
                });
                caption.textContent = k >= 0 ? names[k] || colors[k] : '';
                if (hidden)
                    hidden.value = this._value;
            };
            paint();
            const pick = (i) => {
                const changed = colors[i] !== this._value;
                this._value = colors[i];
                paint();
                if (changed)
                    this.emit('change', { value: colors[i], index: i, name: names[i] || colors[i] });
            };
            this.listen(row, 'click', (e) => {
                const i = buttons.indexOf(e.target.closest('.usa-swatch-btn'));
                if (i >= 0)
                    pick(i);
            });
            this.listen(row, 'keydown', (e) => {
                const i = buttons.indexOf(e.target);
                if (i < 0)
                    return;
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    pick(i);
                    return;
                }
                const next = kit12.rovingIndex(e.key, i, buttons.length, getComputedStyle(root).direction === 'rtl');
                if (next < 0)
                    return;
                e.preventDefault();
                pick(next);
                buttons[next].focus();
            });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'ui-kit-15', text: uiKit15.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineColorSwatches = defineColorSwatches;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/color-swatches.cjs.map