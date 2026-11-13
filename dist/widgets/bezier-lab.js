import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as matterToolClass } from '../chunks/matter-tools-vu63cR1E.js';
import { c as css } from '../chunks/matter-s1ApmJnh.js';

function defineBezierLab(tag = 'usa-bezier-lab') {
    const ctor = defineElement(tag, Base => {
        class BezierLab extends matterToolClass(Base, 'bezier') {
            static get observedAttributes() { return ['label', 'disabled', 'x1', 'y1', 'x2', 'y2', 'duration']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return BezierLab;
    }, { id: 'matter', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineBezierLab };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/bezier-lab.js.map