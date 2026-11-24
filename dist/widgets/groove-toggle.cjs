'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var momentsUi = require('../chunks/moments-ui-Wb8gBRiX.cjs');

function defineGrooveToggle(tag = 'usa-groove-toggle') {
    const ctor = base.defineElement(tag, Base => class GrooveToggle extends Base {
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
            const root = moments.make('span', 'usa-moment usa-groove');
            const key = moments.make('button', 'usa-groove-key');
            key.type = 'button';
            const mark = moments.make('span', 'usa-groove-mark');
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
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineGrooveToggle = defineGrooveToggle;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/groove-toggle.cjs.map