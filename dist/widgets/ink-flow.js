import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, m as matterClass } from '../chunks/matter-s1ApmJnh.js';

function defineInkFlow(tag = 'usa-ink-flow') {
    const ctor = defineElement(tag, Base => {
        class InkFlow extends matterClass(Base, 'ink') {
            static get observedAttributes() { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'seed', 'count', 'strength']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return InkFlow;
    }, { id: 'matter', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineInkFlow };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/ink-flow.js.map