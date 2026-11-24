'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var momentsUi = require('./moments-ui-Wb8gBRiX.cjs');

/** `"Basic|Free, Pro|$12 a month"` → [{ name: 'Basic', detail: 'Free' }, …]; at most 6 plans. */
function parsePlans(text) {
    return text.split(',').map((item) => {
        const [name, ...rest] = item.split('|');
        return { name: name.trim(), detail: rest.join('|').trim() };
    }).filter((p) => p.name).slice(0, 6);
}
function definePlanPicker(tag = 'usa-plan-picker') {
    const ctor = base.defineElement(tag, Base => class PlanPicker extends Base {
        static get observedAttributes() { return ['plans', 'value', 'label', 'name', 'disabled']; }
        plans() {
            const list = parsePlans(this.str('plans', 'Basic|Free, Pro|$12, Team|$29'));
            return list.length ? list : parsePlans('Basic|Free, Pro|$12, Team|$29');
        }
        get value() {
            const plans = this.plans(), v = this.str('value');
            return plans.some((p) => p.name === v) ? v : plans[0].name;
        }
        set value(v) { this.setAttribute('value', String(v)); }
        changed(name) { if (name === 'plans')
            super.changed(name);
        else
            this._sync?.(); }
        mount() {
            const plans = this.plans();
            const root = moments.make('fieldset', 'usa-moment usa-plans');
            const legend = moments.make('legend', 'usa-plans-legend');
            const row = moments.make('div', 'usa-plans-row');
            const frame = moments.make('span', 'usa-plans-frame');
            frame.setAttribute('aria-hidden', 'true');
            const group = moments.uniqueId('usa-plan');
            const inputs = plans.map((plan, i) => {
                const card = moments.make('label', 'usa-plan');
                const input = moments.make('input', 'usa-plan-input');
                input.type = 'radio';
                input.name = group;
                input.value = plan.name;
                card.style.setProperty('--i', String(i));
                card.append(input, moments.make('span', 'usa-plan-name', plan.name), moments.make('span', 'usa-plan-detail', plan.detail), moments.make('span', 'usa-plan-tick'));
                row.append(card);
                return input;
            });
            row.append(frame);
            root.append(legend, row);
            root.style.setProperty('--count', String(plans.length));
            this.append(root);
            const field = moments.make('input');
            field.type = 'hidden';
            root.append(field);
            const sync = () => {
                const value = this.value, formName = this.str('name');
                legend.textContent = this.str('label', 'Plan');
                root.disabled = this.flag('disabled');
                inputs.forEach((input, i) => {
                    input.checked = input.value === value;
                    if (input.checked)
                        root.style.setProperty('--at', String(i));
                });
                // the radios share a per-instance group name; a form gets the value through one hidden field
                field.name = formName;
                field.value = value;
                field.disabled = !formName;
                root.toggleAttribute('data-static', this.reduced);
            };
            this._sync = sync;
            this.listen(row, 'change', (e) => {
                const input = e.target;
                const index = inputs.indexOf(input);
                if (index < 0)
                    return;
                this.value = input.value;
                this.emit('change', { value: input.value, index });
            });
            this.onCleanup(() => { root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.definePlanPicker = definePlanPicker;
exports.parsePlans = parsePlans;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/plan-picker-BvyfSPXs.cjs.map