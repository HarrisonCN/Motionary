import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { parseMotion, bindMotion } from '../components/dsl.js';
import '../chunks/registry-CYojuxi5.js';

var css = "usa-motion{display:block}";

function defineMotion(tag = 'usa-motion') {
    return defineElement(tag, (Base) => {
        class UsaMotion extends Base {
            constructor() {
                super(...arguments);
                this._errors = [];
            }
            static get observedAttributes() {
                return ['rules'];
            }
            get parsed() {
                return parseMotion(this.str('rules')).rules;
            }
            get errors() {
                return this._errors.slice();
            }
            mount() {
                this._errors = [];
                this.onCleanup(bindMotion(this, this.str('rules'), (m) => {
                    this._errors.push(m);
                    this.emit('motion-error', { message: m });
                }));
            }
        }
        return UsaMotion;
    }, { id: 'motion', text: css });
}

export { defineMotion };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.0.0/dist/widgets/motion.js.map