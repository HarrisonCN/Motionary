'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var matter = require('../chunks/matter-CeAHN-RP.cjs');

function defineFluidType(tag = 'usa-fluid-type') {
    const ctor = base.defineElement(tag, Base => {
        class FluidType extends matter.matterClass(Base, 'fluid') {
            static get observedAttributes() { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'text', 'fill']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return FluidType;
    }, { id: 'matter', text: matter.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineFluidType = defineFluidType;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/fluid-type.cjs.map