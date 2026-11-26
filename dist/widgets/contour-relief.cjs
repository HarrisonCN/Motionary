'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var instrumentPanel = require('../chunks/instrument-panel-PfifQtqN.cjs');

function defineContourRelief(tag = 'usa-contour-relief') {
    const ctor = base.defineElement(tag, Base => class ContourRelief extends Base {
        static get observedAttributes() { return ['value', 'label']; }
        get value() { return Math.round(instrumentPanel.bounded(this.num('value', 35))); }
        set value(n) { this.setAttribute('value', String(Math.round(instrumentPanel.bounded(n)))); }
        changed() { this.sync?.(); }
        mount() {
            this.sync = instrumentPanel.instrumentPanel(this, 'relief', value => this.emit('input', { value }), value => this.emit('change', { value }));
        }
        unmount() { this.sync = undefined; }
    }, { id: 'instrument-panel', text: instrumentPanel.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineContourRelief = defineContourRelief;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/contour-relief.cjs.map