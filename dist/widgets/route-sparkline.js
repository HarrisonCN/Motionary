import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, h as routeView } from '../chunks/activity-G3K6LHEP.js';

function defineRouteSparkline(tag = 'usa-route-sparkline') {
    const ctor = defineElement(tag, Base => {
        class RouteSparkline extends activityClass(Base, 'route-sparkline', routeView, 6.5) {
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
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineRouteSparkline };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/route-sparkline.js.map