import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, w as workoutView } from '../chunks/activity-G3K6LHEP.js';

function defineWorkoutPlayer(tag = 'usa-workout-player') {
    const ctor = defineElement(tag, Base => {
        class WorkoutPlayer extends activityClass(Base, 'workout-player', workoutView, 1515, 'elapsed') {
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
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineWorkoutPlayer };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/workout-player.js.map