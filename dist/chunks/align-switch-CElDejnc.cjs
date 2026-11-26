'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var momentsUi = require('./moments-ui-Wb8gBRiX.cjs');

const ALIGNMENTS = ['left', 'center', 'right'];
const NAMES = { left: 'Align left', center: 'Align centre', right: 'Align right' };
function defineAlignSwitch(tag = 'usa-align-switch') {
    const ctor = base.defineElement(tag, Base => class AlignSwitch extends Base {
        static get observedAttributes() { return ['value', 'label', 'disabled']; }
        get value() {
            const v = this.str('value', 'left');
            return ALIGNMENTS.includes(v) ? v : 'left';
        }
        set value(v) { this.setAttribute('value', String(v)); }
        changed() { this._sync?.(); }
        mount() {
            const root = moments.make('fieldset', 'usa-moment usa-align');
            const legend = moments.make('legend', 'usa-sr');
            const preview = moments.make('span', 'usa-align-preview');
            preview.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < 3; i++) {
                const line = moments.make('i', 'usa-align-line');
                line.style.setProperty('--i', String(i));
                preview.append(line);
            }
            const track = moments.make('span', 'usa-align-track');
            const thumb = moments.make('span', 'usa-align-thumb');
            thumb.setAttribute('aria-hidden', 'true');
            track.append(thumb);
            const group = moments.uniqueId('usa-align');
            const inputs = ALIGNMENTS.map((a) => {
                const option = moments.make('label', 'usa-align-option');
                const input = moments.make('input', 'usa-align-input');
                input.type = 'radio';
                input.name = group;
                input.value = a;
                input.setAttribute('aria-label', NAMES[a]);
                const icon = moments.make('span', 'usa-align-icon');
                icon.dataset.align = a;
                icon.setAttribute('aria-hidden', 'true');
                for (let i = 0; i < 3; i++)
                    icon.append(moments.make('i'));
                option.append(input, icon);
                track.append(option);
                return input;
            });
            root.append(legend, preview, track);
            this.append(root);
            const sync = () => {
                const value = this.value;
                legend.textContent = this.str('label', 'Text alignment');
                root.dataset.align = value;
                root.style.setProperty('--at', String(ALIGNMENTS.indexOf(value)));
                inputs.forEach((input) => { input.checked = input.value === value; });
                root.disabled = this.flag('disabled');
                root.toggleAttribute('data-static', this.reduced);
            };
            this._sync = sync;
            this.listen(track, 'change', (e) => {
                const input = e.target;
                if (!inputs.includes(input))
                    return;
                this.value = input.value;
                this.emit('change', { value: this.value });
            });
            this.onCleanup(() => { root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.ALIGNMENTS = ALIGNMENTS;
exports.defineAlignSwitch = defineAlignSwitch;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/align-switch-CElDejnc.cjs.map