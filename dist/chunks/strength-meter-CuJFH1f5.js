import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from './moments-Cg_NlOYG.js';
import { c as css } from './moments-ui-CQJNkFyY.js';

const STRENGTH_WORDS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
/**
 * A rough 0–4 strength score: length first, then the mix of lower case, upper case, digits and symbols, with a
 * penalty for one repeated character. A hint for people, not a security check.
 */
function passwordScore(text) {
    const s = String(text);
    if (s.length < 6)
        return 0;
    const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(s)).length;
    let score = (s.length >= 12 ? 2 : s.length >= 8 ? 1 : 0) + (kinds >= 3 ? 2 : kinds === 2 ? 1 : 0);
    if (/^(.)\1+$/.test(s))
        score = 1;
    return Math.max(1, Math.min(4, score));
}
function defineStrengthMeter(tag = 'usa-strength-meter') {
    const ctor = defineElement(tag, Base => class StrengthMeter extends Base {
        constructor() {
            super(...arguments);
            this._score = 0;
        }
        static get observedAttributes() { return ['label', 'name', 'placeholder', 'disabled']; }
        get score() { return this._score; }
        changed() { this._sync?.(); }
        mount() {
            const root = make('div', 'usa-moment usa-strength');
            const id = uniqueId('usa-strength');
            const title = make('label', 'usa-strength-label');
            title.htmlFor = id;
            const field = make('span', 'usa-strength-field');
            const input = make('input', 'usa-strength-input');
            input.type = 'password';
            input.id = id;
            input.autocomplete = 'new-password';
            const eye = make('button', 'usa-strength-eye');
            eye.type = 'button';
            eye.setAttribute('aria-pressed', 'false');
            field.append(input, eye);
            const meter = make('span', 'usa-strength-meter');
            meter.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < 4; i++) {
                const seg = make('i');
                seg.style.setProperty('--i', String(i));
                meter.append(seg);
            }
            const word = make('span', 'usa-strength-word');
            const help = make('span', 'usa-sr');
            help.id = `${id}-hint`;
            help.setAttribute('aria-live', 'polite');
            input.setAttribute('aria-describedby', help.id);
            const foot = make('span', 'usa-strength-foot');
            foot.append(meter, word);
            root.append(title, field, foot, help);
            this.append(root);
            let announced = -1;
            const show = () => {
                const score = this._score, empty = !input.value;
                root.dataset.score = empty ? '' : String(score);
                word.textContent = empty ? '' : STRENGTH_WORDS[score];
                if (!empty && score !== announced) {
                    help.textContent = `Strength: ${STRENGTH_WORDS[score]}`;
                    announced = score;
                }
                if (empty) {
                    help.textContent = '';
                    announced = -1;
                }
            };
            const sync = () => {
                title.textContent = this.str('label', 'Password');
                input.name = this.str('name');
                input.placeholder = this.str('placeholder');
                input.disabled = eye.disabled = this.flag('disabled');
                eye.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
                root.toggleAttribute('data-static', this.reduced);
                show();
            };
            this._sync = sync;
            this.listen(input, 'input', () => {
                const next = input.value ? passwordScore(input.value) : 0;
                const moved = next !== this._score;
                this._score = next;
                show();
                if (moved)
                    this.emit('change', { score: next });
            });
            this.listen(eye, 'click', () => {
                const hidden = input.type === 'password';
                input.type = hidden ? 'text' : 'password';
                eye.setAttribute('aria-pressed', String(hidden));
                eye.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
            });
            this.onCleanup(() => { root.remove(); this._sync = undefined; this._score = 0; });
            sync();
        }
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { STRENGTH_WORDS as S, defineStrengthMeter as d, passwordScore as p };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/strength-meter-CuJFH1f5.js.map