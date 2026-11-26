import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-ui-CQJNkFyY.js';

function defineGrooveToggle(tag = 'usa-groove-toggle') {
    const ctor = defineElement(tag, Base => class GrooveToggle extends Base {
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
            const root = make('span', 'usa-moment usa-groove');
            const key = make('button', 'usa-groove-key');
            key.type = 'button';
            const mark = make('span', 'usa-groove-mark');
            mark.setAttribute('aria-hidden', 'true');
            key.append(mark);
            root.append(key);
            this.append(root);
            const sync = () => {
                key.setAttribute('aria-label', this.str('label', 'Pin'));
                key.setAttribute('aria-pressed', String(this.pressed));
                root.toggleAttribute('data-on', this.pressed);
                root.toggleAttribute('data-static', this.reduced);
                key.disabled = this.flag('disabled');
            };
            this._sync = sync;
            this.listen(key, 'click', () => {
                if (this.flag('disabled'))
                    return;
                this.emit('change', { pressed: this.toggle() });
            });
            this.onCleanup(() => { root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineGrooveToggle };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/groove-toggle.js.map