'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var matter = require('../chunks/matter-CeAHN-RP.cjs');

function defineGravityWell(tag = 'usa-gravity-well') {
    const ctor = base.defineElement(tag, Base => {
        class GravityWell extends matter.matterClass(Base, 'gravity') {
            static get observedAttributes() { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'seed', 'count', 'strength']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return GravityWell;
    }, { id: 'matter', text: matter.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineGravityWell = defineGravityWell;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/gravity-well.cjs.map