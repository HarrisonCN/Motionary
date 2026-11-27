import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { b as bound, m as make } from './moments-Cg_NlOYG.js';
import { c as css } from './moments-ui-CQJNkFyY.js';

/** A side-to-side shake that dies down. */
const SHAKE_FRAMES = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-9px)', offset: 0.12 },
    { transform: 'translateX(8px)', offset: 0.28 },
    { transform: 'translateX(-6px)', offset: 0.44 },
    { transform: 'translateX(4px)', offset: 0.6 },
    { transform: 'translateX(-2px)', offset: 0.78 },
    { transform: 'translateX(0)' },
];
/** Keep the digits of `text`, at most `length` of them. */
function digitsOf(text, length) {
    return Array.from(String(text).replace(/\D/g, '')).slice(0, length);
}
function defineCodeShake(tag = 'usa-code-shake') {
    const ctor = defineElement(tag, Base => class CodeShake extends Base {
        constructor() {
            super(...arguments);
            this._boxes = [];
        }
        static get observedAttributes() { return ['length', 'label', 'disabled']; }
        get value() { return this._boxes.map((b) => b.value).join(''); }
        reject() { this._shake?.(); }
        accept() { this._state?.('ok'); }
        clear() {
            this._boxes.forEach((b) => { b.value = ''; });
            this._state?.('');
            this._boxes[0]?.focus();
        }
        changed(name) { if (name === 'length')
            super.changed(name);
        else
            this._sync?.(); }
        mount() {
            const length = Math.round(bound(this.num('length', 4), 4, 8, 4));
            const root = make('fieldset', 'usa-moment usa-code');
            const legend = make('legend', 'usa-code-label');
            const row = make('span', 'usa-code-row');
            const status = make('span', 'usa-sr');
            status.setAttribute('role', 'status');
            const boxes = Array.from({ length }, (_, i) => {
                const box = make('input', 'usa-code-box');
                box.type = 'text';
                box.inputMode = 'numeric';
                box.maxLength = 1;
                box.autocomplete = i === 0 ? 'one-time-code' : 'off';
                box.setAttribute('pattern', '[0-9]*');
                box.setAttribute('aria-label', `Digit ${i + 1} of ${length}`);
                row.append(box);
                return box;
            });
            this._boxes = boxes;
            root.append(legend, row, status);
            this.append(root);
            let run = null;
            const state = (s) => {
                if (s)
                    root.dataset.state = s;
                else
                    delete root.dataset.state;
                status.textContent = s === 'ok' ? 'Code accepted' : s === 'error' ? 'Wrong code, try again' : '';
            };
            this._state = state;
            this._shake = () => {
                state('error');
                run?.cancel();
                run = this.motion(row, SHAKE_FRAMES, { duration: 460, easing: 'ease-out' });
                boxes.forEach((b) => { b.value = ''; });
                boxes[0]?.focus();
            };
            const fill = (from, text) => {
                const digits = digitsOf(text, length - from);
                digits.forEach((d, k) => { boxes[from + k].value = d; });
                const next = Math.min(length - 1, from + digits.length);
                boxes[next].focus();
                if (boxes.every((b) => b.value))
                    this.emit('complete', { length });
            };
            const sync = () => {
                legend.textContent = this.str('label', 'Verification code');
                const disabled = this.flag('disabled');
                root.disabled = disabled;
                root.toggleAttribute('data-static', this.reduced);
            };
            this._sync = sync;
            boxes.forEach((box, i) => {
                this.listen(box, 'input', () => {
                    if (root.dataset.state)
                        state('');
                    const text = box.value;
                    box.value = '';
                    if (text)
                        fill(i, text);
                });
                this.listen(box, 'keydown', (e) => {
                    if (e.key === 'Backspace' && !box.value && i > 0) {
                        boxes[i - 1].value = '';
                        boxes[i - 1].focus();
                        e.preventDefault();
                    }
                    else if (e.key === 'ArrowLeft' && i > 0) {
                        boxes[i - 1].focus();
                        e.preventDefault();
                    }
                    else if (e.key === 'ArrowRight' && i < length - 1) {
                        boxes[i + 1].focus();
                        e.preventDefault();
                    }
                });
                this.listen(box, 'paste', (e) => {
                    e.preventDefault();
                    if (root.dataset.state)
                        state('');
                    fill(i, e.clipboardData?.getData('text') || '');
                });
                this.listen(box, 'focus', () => box.select());
            });
            this.onCleanup(() => { run?.cancel(); root.remove(); this._boxes = []; this._sync = undefined; this._shake = undefined; this._state = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { digitsOf as a, defineCodeShake as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/code-shake-91pvAJbW.js.map