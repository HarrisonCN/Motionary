'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var matterText = require('../chunks/matter-text-CjPBzmSX.cjs');
var matter = require('../chunks/matter-CeAHN-RP.cjs');

function defineTextLoupe(tag = 'usa-text-loupe') {
    const ctor = base.defineElement(tag, Base => {
        class TextLoupe extends matterText.matterTextClass(Base, 'loupe') {
            static get observedAttributes() { return ['label', 'disabled', 'text']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return TextLoupe;
    }, { id: 'matter', text: matter.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTextLoupe = defineTextLoupe;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/text-loupe.cjs.map