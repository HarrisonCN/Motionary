import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-ui-CQJNkFyY.js';

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
    const ctor = defineElement(tag, Base => class TadaButton extends Base {
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
            const root = make('button', 'usa-moment usa-tada');
            root.type = 'button';
            const star = make('span', 'usa-tada-star', '★');
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
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineTadaButton };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/tada-button.js.map