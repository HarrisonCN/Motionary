'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var instrumentPanel = require('../chunks/instrument-panel-PfifQtqN.cjs');

function defineIrisDiaphragm(tag = 'usa-iris-diaphragm') {
    const ctor = base.defineElement(tag, Base => class IrisDiaphragm extends Base {
        static get observedAttributes() { return ['value', 'label']; }
        get value() { return Math.round(instrumentPanel.bounded(this.num('value', 45))); }
        set value(n) { this.setAttribute('value', String(Math.round(instrumentPanel.bounded(n)))); }
        changed() { this.sync?.(); }
        mount() {
            this.sync = instrumentPanel.instrumentPanel(this, 'iris', value => this.emit('input', { value }), value => this.emit('change', { value }));
        }
        unmount() { this.sync = undefined; }
    }, { id: 'instrument-panel', text: instrumentPanel.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineIrisDiaphragm = defineIrisDiaphragm;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/iris-diaphragm.cjs.map