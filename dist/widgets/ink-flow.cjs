'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var matter = require('../chunks/matter-CeAHN-RP.cjs');

function defineInkFlow(tag = 'usa-ink-flow') {
    const ctor = base.defineElement(tag, Base => {
        class InkFlow extends matter.matterClass(Base, 'ink') {
            static get observedAttributes() { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'seed', 'count', 'strength']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return InkFlow;
    }, { id: 'matter', text: matter.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineInkFlow = defineInkFlow;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/ink-flow.cjs.map