import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, o as orbitView } from '../chunks/activity-Dk2_9o_s.js';

function defineOrbitPass(tag = 'usa-orbit-pass') {
    const ctor = defineElement(tag, Base => {
        class OrbitPass extends activityClass(Base, 'orbit-pass', orbitView, 76) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'title', 'eta']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else if (type === 'change')
                    this.emit('change', detail);
                else if (type === 'tick')
                    this.emit('tick', detail);
                else
                    this.emit('complete', detail);
            }
        }
        return OrbitPass;
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineOrbitPass };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/orbit-pass.js.map