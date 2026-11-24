import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from './moments-Cg_NlOYG.js';
import { c as css } from './page-kit-I4BlQKxV.js';

/** A plain, permissive email check: something@something.tld, no spaces, at most 254 characters. */
function isEmail(text) {
    const s = String(text ?? '').trim();
    return s.length <= 254 && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(s);
}
const CHECK = '<svg class="usa-sub-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function defineSubscribe(tag = 'usa-subscribe') {
    const ctor = defineElement(tag, Base => class Subscribe extends Base {
        constructor() {
            super(...arguments);
            this._state = 'idle';
        }
        static get observedAttributes() { return ['label', 'placeholder', 'button-label', 'success', 'invalid']; }
        get state() { return this._state; }
        done() { if (this._state === 'sending') {
            this._set?.('done');
            this.emit('done');
        } }
        error(message) { if (this._state === 'sending') {
            const m = String(message || 'Something went wrong. Try again.');
            this._set?.('error', m);
            this.emit('error', { message: m });
        } }
        reset() { this._set?.('idle'); }
        mount() {
            const form = make('form', 'usa-kit usa-sub');
            form.noValidate = true;
            const row = make('div', 'usa-sub-row');
            const input = make('input', 'usa-sub-input');
            input.type = 'email';
            input.name = 'email';
            input.autocomplete = 'email';
            input.required = true;
            input.placeholder = this.str('placeholder', 'you@example.com');
            input.setAttribute('aria-label', this.str('label', 'Email address'));
            const btn = make('button', 'usa-sub-btn');
            btn.type = 'submit';
            const text = make('span', 'usa-sub-text', this.str('button-label', 'Subscribe'));
            btn.append(text);
            btn.insertAdjacentHTML('beforeend', CHECK);
            const check = btn.lastElementChild;
            const msg = make('p', 'usa-sub-msg');
            msg.id = uniqueId('usa-sub');
            msg.setAttribute('role', 'status');
            input.setAttribute('aria-describedby', msg.id);
            row.append(input, btn);
            form.append(row, msg);
            this.append(form);
            const set = (s, m = '') => {
                this._state = s;
                form.dataset.state = s;
                form.toggleAttribute('data-static', this.reduced);
                const sending = s === 'sending', done = s === 'done';
                btn.disabled = sending || done;
                input.readOnly = sending || done;
                input.setAttribute('aria-invalid', String(s === 'error'));
                text.hidden = done;
                check.style.display = done ? '' : 'none';
                btn.setAttribute('aria-label', done ? this.str('success', 'Thanks! Check your inbox.') : this.str('button-label', 'Subscribe'));
                msg.textContent = done ? this.str('success', 'Thanks! Check your inbox.') : m;
            };
            this._set = set;
            this.listen(form, 'submit', (e) => {
                e.preventDefault();
                if (this._state === 'sending' || this._state === 'done')
                    return;
                const email = input.value.trim();
                if (!isEmail(email)) {
                    set('error', this.str('invalid', 'Enter a valid email address'));
                    void form.offsetWidth;
                    input.focus();
                    return;
                }
                set('sending');
                const free = this.emit('subscribe', { email });
                if (free) {
                    set('done');
                    this.emit('done');
                }
            });
            this.listen(input, 'input', () => { if (this._state === 'error')
                set('idle'); });
            this.onCleanup(() => {
                form.remove();
                this._set = undefined;
                this._state = 'idle';
            });
            set('idle');
        }
    }, { id: 'page-kit', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSubscribe as d, isEmail as i };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/subscribe-knrVYwWb.js.map