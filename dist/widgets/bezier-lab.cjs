'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var matterTools = require('../chunks/matter-tools-c9BnIwSX.cjs');
var matter = require('../chunks/matter-CeAHN-RP.cjs');

function defineBezierLab(tag = 'usa-bezier-lab') {
    const ctor = base.defineElement(tag, Base => {
        class BezierLab extends matterTools.matterToolClass(Base, 'bezier') {
            static get observedAttributes() { return ['label', 'disabled', 'x1', 'y1', 'x2', 'y2', 'duration']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return BezierLab;
    }, { id: 'matter', text: matter.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineBezierLab = defineBezierLab;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/bezier-lab.cjs.map