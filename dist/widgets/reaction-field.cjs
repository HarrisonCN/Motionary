'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var matter = require('../chunks/matter-CeAHN-RP.cjs');

function defineReactionField(tag = 'usa-reaction-field') {
    const ctor = base.defineElement(tag, Base => {
        class ReactionField extends matter.matterClass(Base, 'reaction') {
            static get observedAttributes() { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'seed', 'feed', 'kill', 'mode', 'shape']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return ReactionField;
    }, { id: 'matter', text: matter.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineReactionField = defineReactionField;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/reaction-field.cjs.map