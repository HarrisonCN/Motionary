import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { l as list, c as cleanColor } from '../chunks/kit-DugHPVcq.js';
import { r as rovingIndex } from '../chunks/kit-12-C5AMRg3h.js';
import { i as inkOn } from '../chunks/kit-15-gywnm88n.js';
import { c as css } from '../chunks/ui-kit-15--UZAZBHt.js';

function defineColorSwatches(tag = 'usa-color-swatches') {
    const ctor = defineElement(tag, Base => class ColorSwatches extends Base {
        constructor() {
            super(...arguments);
            this._value = '';
        }
        static get observedAttributes() { return ['colors', 'names', 'value', 'name', 'label', 'shape', 'size']; }
        get value() { return this._value; }
        mount() {
            const colors = list(this.str('colors'), 40).map(cleanColor).filter(Boolean);
            const names = list(this.str('names'), 40);
            const start = this.str('value');
            if (start !== this._seen) {
                this._seen = start;
                this._value = colors.includes(start) ? start : colors[0] || '';
            }
            else if (!colors.includes(this._value))
                this._value = colors[0] || '';
            const root = make('div', 'usa-kit usa-swatch');
            root.toggleAttribute('data-static', this.reduced);
            root.dataset.shape = this.str('shape') === 'square' ? 'square' : 'circle';
            root.style.setProperty('--usa-swatch-size', `${Math.max(16, Math.min(80, this.num('size', 32)))}px`);
            const row = make('div', 'usa-swatch-row');
            row.setAttribute('role', 'radiogroup');
            row.setAttribute('aria-label', this.str('label', 'Colour'));
            const caption = make('span', 'usa-swatch-name');
            caption.setAttribute('aria-hidden', 'true');
            const buttons = colors.map((c, i) => {
                const b = make('button', 'usa-swatch-btn');
                b.type = 'button';
                b.setAttribute('role', 'radio');
                b.setAttribute('aria-label', names[i] || c);
                b.style.setProperty('--c', c);
                b.style.setProperty('--ink', inkOn(c));
                row.append(b);
                return b;
            });
            const hidden = this.str('name') ? make('input') : null;
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
                const next = rovingIndex(e.key, i, buttons.length, getComputedStyle(root).direction === 'rtl');
                if (next < 0)
                    return;
                e.preventDefault();
                pick(next);
                buttons[next].focus();
            });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'ui-kit-15', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineColorSwatches };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/color-swatches.js.map