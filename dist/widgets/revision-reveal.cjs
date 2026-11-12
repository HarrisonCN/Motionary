'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var matterText = require('../chunks/matter-text-CjPBzmSX.cjs');
var matter = require('../chunks/matter-CeAHN-RP.cjs');

function defineRevisionReveal(tag = 'usa-revision-reveal') {
    const ctor = base.defineElement(tag, Base => {
        class RevisionReveal extends matterText.matterTextClass(Base, 'revision') {
            static get observedAttributes() { return ['label', 'disabled', 'text', 'draft', 'value']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return RevisionReveal;
    }, { id: 'matter', text: matter.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineRevisionReveal = defineRevisionReveal;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/revision-reveal.cjs.map