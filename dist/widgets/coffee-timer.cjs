'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-XCjQREWy.cjs');

function defineCoffeeTimer(tag = 'usa-coffee-timer') {
    const ctor = base.defineElement(tag, Base => {
        class CoffeeTimer extends activity.activityClass(Base, 'coffee-timer', activity.coffeeView, 18, 'elapsed') {
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
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineCoffeeTimer = defineCoffeeTimer;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/coffee-timer.cjs.map