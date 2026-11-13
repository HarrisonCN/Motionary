import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as matterToolClass } from '../chunks/matter-tools-vu63cR1E.js';
import { c as css } from '../chunks/matter-s1ApmJnh.js';

function defineSpringLab(tag = 'usa-spring-lab') {
    const ctor = defineElement(tag, Base => {
        class SpringLab extends matterToolClass(Base, 'spring') {
            static get observedAttributes() { return ['label', 'disabled', 'stiffness', 'damping', 'mass']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return SpringLab;
    }, { id: 'matter', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSpringLab };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/spring-lab.js.map