import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, b as bounded, i as instrumentPanel } from '../chunks/instrument-panel-BfMtueXl.js';

function defineContourRelief(tag = 'usa-contour-relief') {
    const ctor = defineElement(tag, Base => class ContourRelief extends Base {
        static get observedAttributes() { return ['value', 'label']; }
        get value() { return Math.round(bounded(this.num('value', 35))); }
        set value(n) { this.setAttribute('value', String(Math.round(bounded(n)))); }
        changed() { this.sync?.(); }
        mount() {
            this.sync = instrumentPanel(this, 'relief', value => this.emit('input', { value }), value => this.emit('change', { value }));
        }
        unmount() { this.sync = undefined; }
    }, { id: 'instrument-panel', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineContourRelief };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/contour-relief.js.map