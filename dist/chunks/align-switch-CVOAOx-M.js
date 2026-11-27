import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from './moments-Cg_NlOYG.js';
import { c as css } from './moments-ui-CQJNkFyY.js';

const ALIGNMENTS = ['left', 'center', 'right'];
const NAMES = { left: 'Align left', center: 'Align centre', right: 'Align right' };
function defineAlignSwitch(tag = 'usa-align-switch') {
    const ctor = defineElement(tag, Base => class AlignSwitch extends Base {
        static get observedAttributes() { return ['value', 'label', 'disabled']; }
        get value() {
            const v = this.str('value', 'left');
            return ALIGNMENTS.includes(v) ? v : 'left';
        }
        set value(v) { this.setAttribute('value', String(v)); }
        changed() { this._sync?.(); }
        mount() {
            const root = make('fieldset', 'usa-moment usa-align');
            const legend = make('legend', 'usa-sr');
            const preview = make('span', 'usa-align-preview');
            preview.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < 3; i++) {
                const line = make('i', 'usa-align-line');
                line.style.setProperty('--i', String(i));
                preview.append(line);
            }
            const track = make('span', 'usa-align-track');
            const thumb = make('span', 'usa-align-thumb');
            thumb.setAttribute('aria-hidden', 'true');
            track.append(thumb);
            const group = uniqueId('usa-align');
            const inputs = ALIGNMENTS.map((a) => {
                const option = make('label', 'usa-align-option');
                const input = make('input', 'usa-align-input');
                input.type = 'radio';
                input.name = group;
                input.value = a;
                input.setAttribute('aria-label', NAMES[a]);
                const icon = make('span', 'usa-align-icon');
                icon.dataset.align = a;
                icon.setAttribute('aria-hidden', 'true');
                for (let i = 0; i < 3; i++)
                    icon.append(make('i'));
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
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { ALIGNMENTS as A, defineAlignSwitch as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/align-switch-CVOAOx-M.js.map