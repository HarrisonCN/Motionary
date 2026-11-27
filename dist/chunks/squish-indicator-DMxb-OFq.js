import { f as defineElement } from './base-SPDwWyB1.js';
import { c as createSpring } from './spring-Bu3AwUgu.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from './moments-Cg_NlOYG.js';
import { c as css } from './tactile-CJEqqRov.js';

/** Split `"A, B, C"` into trimmed, non-empty, unique option labels (at most 8; falls back to A, B, C). */
function parseOptions(text) {
    const out = [];
    for (const part of text.split(',')) {
        const v = part.trim();
        if (v && !out.includes(v) && out.length < 8)
            out.push(v);
    }
    return out.length ? out : ['A', 'B', 'C'];
}
function defineSquishIndicator(tag = 'usa-squish-indicator') {
    const ctor = defineElement(tag, Base => class SquishIndicator extends Base {
        static get observedAttributes() { return ['options', 'value', 'label', 'name', 'disabled']; }
        get options() { return parseOptions(this.str('options', 'A,B,C')); }
        get value() {
            const opts = this.options, v = this.str('value');
            return opts.includes(v) ? v : opts[0];
        }
        set value(v) { this.setAttribute('value', String(v)); }
        changed(name) { if (name === 'options')
            super.changed(name);
        else
            this._sync?.(); }
        mount() {
            const root = make('fieldset', 'usa-tactile usa-pick');
            const legend = make('legend', 'usa-sr');
            const group = uniqueId('usa-pick');
            const opts = this.options;
            const springs = [];
            const inputs = [];
            root.append(legend);
            opts.forEach((opt, i) => {
                const key = make('label', 'usa-pick-key');
                const input = make('input', 'usa-pick-input');
                input.type = 'radio';
                input.name = group;
                input.value = opt;
                key.append(input, make('span', 'usa-pick-glyph', opt));
                root.append(key);
                inputs.push(input);
                springs.push(createSpring({ value: 0, spring: { stiffness: 420, damping: 13 }, onUpdate: (g) => key.style.setProperty('--grow', g.toFixed(4)) }));
                this.listen(input, 'change', () => {
                    if (!input.checked)
                        return;
                    this.value = opt;
                    this.emit('change', { value: opt, index: i });
                });
            });
            const field = make('input');
            field.type = 'hidden';
            root.append(field);
            this.append(root);
            const sync = () => {
                const v = this.value, disabled = this.flag('disabled');
                legend.textContent = this.str('label', 'Choice');
                root.disabled = disabled;
                field.name = this.str('name');
                field.value = v;
                field.disabled = !field.name;
                inputs.forEach((input, i) => {
                    const on = input.value === v;
                    input.checked = on;
                    input.parentElement.toggleAttribute('data-on', on);
                    if (this.reduced)
                        springs[i].jump(on ? 1 : 0);
                    else
                        springs[i].set(on ? 1 : 0);
                });
                root.toggleAttribute('data-static', this.reduced);
            };
            this._sync = sync;
            this.onCleanup(() => { springs.forEach((s) => s.stop()); root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'tactile', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSquishIndicator as d, parseOptions as p };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/squish-indicator-DMxb-OFq.js.map