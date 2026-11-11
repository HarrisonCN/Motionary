import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, b as coffeeView } from '../chunks/activity-Dk2_9o_s.js';

function defineCoffeeTimer(tag = 'usa-coffee-timer') {
    const ctor = defineElement(tag, Base => {
        class CoffeeTimer extends activityClass(Base, 'coffee-timer', coffeeView, 18, 'elapsed') {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'duration', 'drink']; }
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
        return CoffeeTimer;
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineCoffeeTimer };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/coffee-timer.js.map