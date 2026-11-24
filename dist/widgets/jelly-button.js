import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-ui-CQJNkFyY.js';

/** The wobble a press plays: a quick squash, then decaying stretch and squash back to rest. */
const JELLY_FRAMES = [
    { transform: 'scale(1, 1)' },
    { transform: 'scale(1.18, .82)', offset: 0.18 },
    { transform: 'scale(.88, 1.12)', offset: 0.36 },
    { transform: 'scale(1.06, .94)', offset: 0.54 },
    { transform: 'scale(.98, 1.02)', offset: 0.72 },
    { transform: 'scale(1, 1)' },
];
function defineJellyButton(tag = 'usa-jelly-button') {
    const ctor = defineElement(tag, Base => class JellyButton extends Base {
        static get observedAttributes() { return ['label', 'glyph', 'disabled']; }
        press() {
            if (this.flag('disabled'))
                return;
            this._wobble?.();
            this.emit('press');
        }
        changed() { this._sync?.(); }
        mount() {
            const root = make('button', 'usa-moment usa-jelly');
            root.type = 'button';
            const glyph = make('span', 'usa-jelly-glyph');
            glyph.setAttribute('aria-hidden', 'true');
            root.append(glyph);
            this.append(root);
            let run = null;
            this._wobble = () => { run?.cancel(); run = this.motion(root, JELLY_FRAMES, { duration: 620, easing: 'linear' }); };
            const sync = () => {
                glyph.textContent = this.str('glyph', '+');
                root.setAttribute('aria-label', this.str('label', 'Add'));
                root.disabled = this.flag('disabled');
            };
            this._sync = sync;
            this.listen(root, 'click', () => this.press());
            this.onCleanup(() => { run?.cancel(); root.remove(); this._sync = undefined; this._wobble = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineJellyButton };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/jelly-button.js.map