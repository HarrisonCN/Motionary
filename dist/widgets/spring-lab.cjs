'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var matterTools = require('../chunks/matter-tools-c9BnIwSX.cjs');
var matter = require('../chunks/matter-CeAHN-RP.cjs');

function defineSpringLab(tag = 'usa-spring-lab') {
    const ctor = base.defineElement(tag, Base => {
        class SpringLab extends matterTools.matterToolClass(Base, 'spring') {
            static get observedAttributes() { return ['label', 'disabled', 'stiffness', 'damping', 'mass']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return SpringLab;
    }, { id: 'matter', text: matter.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSpringLab = defineSpringLab;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/spring-lab.cjs.map