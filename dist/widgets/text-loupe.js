import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as matterTextClass } from '../chunks/matter-text-DCeZNAkM.js';
import { c as css } from '../chunks/matter-s1ApmJnh.js';

function defineTextLoupe(tag = 'usa-text-loupe') {
    const ctor = defineElement(tag, Base => {
        class TextLoupe extends matterTextClass(Base, 'loupe') {
            static get observedAttributes() { return ['label', 'disabled', 'text']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return TextLoupe;
    }, { id: 'matter', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineTextLoupe };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/text-loupe.js.map