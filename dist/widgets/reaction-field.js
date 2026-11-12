import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, m as matterClass } from '../chunks/matter-s1ApmJnh.js';

function defineReactionField(tag = 'usa-reaction-field') {
    const ctor = defineElement(tag, Base => {
        class ReactionField extends matterClass(Base, 'reaction') {
            static get observedAttributes() { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'seed', 'feed', 'kill', 'mode', 'shape']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else
                    this.emit('change', detail);
            }
        }
        return ReactionField;
    }, { id: 'matter', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineReactionField };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/reaction-field.js.map