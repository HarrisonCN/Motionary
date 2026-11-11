'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-BAhympNW.cjs');

function defineRouteSparkline(tag = 'usa-route-sparkline') {
    const ctor = base.defineElement(tag, Base => {
        class RouteSparkline extends activity.activityClass(Base, 'route-sparkline', activity.routeView, 6.5) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'values', 'title', 'status', 'unit']; }
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
        return RouteSparkline;
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineRouteSparkline = defineRouteSparkline;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/route-sparkline.cjs.map