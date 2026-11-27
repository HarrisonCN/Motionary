'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var momentsUi = require('../chunks/moments-ui-Wb8gBRiX.cjs');

/** "Tada": shrink, shake with a slight tilt, grow back. */
const TADA_FRAMES = [
    { transform: 'scale(1) rotate(0)' },
    { transform: 'scale(.9) rotate(-4deg)', offset: 0.1 },
    { transform: 'scale(.9) rotate(-4deg)', offset: 0.2 },
    { transform: 'scale(1.12) rotate(5deg)', offset: 0.3 },
    { transform: 'scale(1.12) rotate(-5deg)', offset: 0.45 },
    { transform: 'scale(1.12) rotate(5deg)', offset: 0.6 },
    { transform: 'scale(1.12) rotate(-3deg)', offset: 0.75 },
    { transform: 'scale(1) rotate(0)' },
];
function defineTadaButton(tag = 'usa-tada-button') {
    const ctor = base.defineElement(tag, Base => class TadaButton extends Base {
        static get observedAttributes() { return ['pressed', 'label', 'disabled']; }
        get pressed() { return this.flag('pressed'); }
        set pressed(on) { this.setFlag('pressed', !!on); }
        toggle(force) {
            if (this.flag('disabled'))
                return this.pressed;
            this.pressed = force === undefined ? !this.pressed : !!force;
            return this.pressed;
        }
        changed() { this._sync?.(); }
        mount() {
            const root = moments.make('button', 'usa-moment usa-tada');
            root.type = 'button';
            const star = moments.make('span', 'usa-tada-star', '★');
            star.setAttribute('aria-hidden', 'true');
            root.append(star);
            this.append(root);
            let run = null;
            const sync = () => {
                root.setAttribute('aria-label', this.str('label', 'Favourite'));
                root.setAttribute('aria-pressed', String(this.pressed));
                root.toggleAttribute('data-on', this.pressed);
                root.disabled = this.flag('disabled');
            };
            this._sync = sync;
            this.listen(root, 'click', () => {
                if (this.flag('disabled'))
                    return;
                const pressed = this.toggle();
                if (pressed) {
                    run?.cancel();
                    run = this.motion(root, TADA_FRAMES, { duration: 800, easing: 'ease-in-out' });
                }
                this.emit('change', { pressed });
            });
            this.onCleanup(() => { run?.cancel(); root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTadaButton = defineTadaButton;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/tada-button.cjs.map