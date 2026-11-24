'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var momentsUi = require('../chunks/moments-ui-Wb8gBRiX.cjs');

/** The arrow's hop: up, a small rebound, settle. */
const HOP_FRAMES = [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-7px)', offset: 0.3 },
    { transform: 'translateY(1px)', offset: 0.55 },
    { transform: 'translateY(-2px)', offset: 0.75 },
    { transform: 'translateY(0)' },
];
const DIRECTIONS = ['up', 'down', 'left', 'right'];
function defineBounceButton(tag = 'usa-bounce-button') {
    const ctor = base.defineElement(tag, Base => class BounceButton extends Base {
        static get observedAttributes() { return ['label', 'direction', 'disabled']; }
        press() {
            if (this.flag('disabled'))
                return;
            this._hop?.();
            this.emit('press');
        }
        changed() { this._sync?.(); }
        mount() {
            const root = moments.make('button', 'usa-moment usa-bounce');
            root.type = 'button';
            const text = moments.make('span', 'usa-bounce-label');
            const arrow = moments.make('span', 'usa-bounce-arrow');
            arrow.setAttribute('aria-hidden', 'true');
            const turn = moments.make('span', 'usa-bounce-turn');
            turn.append(arrow);
            root.append(text, turn);
            this.append(root);
            let run = null;
            this._hop = () => { run?.cancel(); run = this.motion(arrow, HOP_FRAMES, { duration: 560, easing: 'ease-out' }); };
            const sync = () => {
                const dir = this.str('direction', 'up');
                root.dataset.direction = DIRECTIONS.includes(dir) ? dir : 'up';
                text.textContent = this.str('label', 'Up');
                arrow.textContent = '↑';
                root.disabled = this.flag('disabled');
            };
            this._sync = sync;
            this.listen(root, 'click', () => this.press());
            this.onCleanup(() => { run?.cancel(); root.remove(); this._sync = undefined; this._hop = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineBounceButton = defineBounceButton;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/bounce-button.cjs.map