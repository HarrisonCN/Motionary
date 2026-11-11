'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-XCjQREWy.cjs');

function defineWorkoutPlayer(tag = 'usa-workout-player') {
    const ctor = base.defineElement(tag, Base => {
        class WorkoutPlayer extends activity.activityClass(Base, 'workout-player', activity.workoutView, 1515, 'elapsed') {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'distance', 'unit', 'reset-label', 'target-label']; }
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
        return WorkoutPlayer;
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineWorkoutPlayer = defineWorkoutPlayer;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/workout-player.cjs.map