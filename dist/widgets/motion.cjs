'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var components_dsl = require('../components/dsl.cjs');
require('../chunks/registry-BB1oO-lR.cjs');

var css = "usa-motion{display:block}";

function defineMotion(tag = 'usa-motion') {
    return base.defineElement(tag, (Base) => {
        class UsaMotion extends Base {
            constructor() {
                super(...arguments);
                this._errors = [];
            }
            static get observedAttributes() {
                return ['rules'];
            }
            get parsed() {
                return components_dsl.parseMotion(this.str('rules')).rules;
            }
            get errors() {
                return this._errors.slice();
            }
            mount() {
                this._errors = [];
                this.onCleanup(components_dsl.bindMotion(this, this.str('rules'), (m) => {
                    this._errors.push(m);
                    this.emit('motion-error', { message: m });
                }));
            }
        }
        return UsaMotion;
    }, { id: 'motion', text: css });
}

exports.defineMotion = defineMotion;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/widgets/motion.cjs.map