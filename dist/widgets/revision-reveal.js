import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as matterTextClass } from '../chunks/matter-text-DCeZNAkM.js';
import { c as css } from '../chunks/matter-s1ApmJnh.js';

function defineRevisionReveal(tag = 'usa-revision-reveal') {
    const ctor = defineElement(tag, Base => {
        class RevisionReveal extends matterTextClass(Base, 'revision') {
            static get observedAttributes() { return ['label', 'disabled', 'text', 'draft', 'value']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return RevisionReveal;
    }, { id: 'matter', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineRevisionReveal };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/revision-reveal.js.map