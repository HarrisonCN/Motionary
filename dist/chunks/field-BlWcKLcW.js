import { f as defineElement } from './base-zSGb8ujt.js';

var css = "usa-field{display:block;width:var(--usa-fld-w,280px);max-width:100%;font:500 14px/1.3 system-ui,sans-serif;--usa-fld-accent:#6366f1;--usa-fld-bad:#e11d48;--usa-fld-good:#16a34a}.usa-fld{position:relative;padding-top:18px}.usa-fld-input{display:block;box-sizing:border-box;width:100%;padding:8px 30px 8px 2px;border:0;border-bottom:2px solid var(--usa-fld-rule,rgba(100,116,139,.45));background:transparent;color:inherit;font:inherit;outline:none;border-radius:0}.usa-fld-label{position:absolute;left:2px;top:26px;color:var(--usa-fld-muted,#64748b);pointer-events:none;transform-origin:0 0;transition:transform .22s cubic-bezier(.2,.8,.2,1),color .2s}usa-field[data-focus] .usa-fld-label,usa-field[data-filled] .usa-fld-label,.usa-fld-input:not(:placeholder-shown)+.usa-fld-label{transform:translateY(-24px) scale(.8)}usa-field[data-focus] .usa-fld-label{color:var(--usa-fld-accent)}.usa-fld-line{position:absolute;left:0;right:0;top:calc(18px + 2.3em - 1px);height:2px;background:var(--usa-fld-accent);transform:scaleX(0);transition:transform .3s cubic-bezier(.2,.8,.2,1)}usa-field[data-focus] .usa-fld-line{transform:scaleX(1)}usa-field[data-invalid] .usa-fld-line{transform:scaleX(1);background:var(--usa-fld-bad)}usa-field[data-invalid] .usa-fld-label{color:var(--usa-fld-bad)}.usa-fld-ok{position:absolute;right:2px;top:24px;width:20px;height:20px;fill:none;stroke:var(--usa-fld-good);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.usa-fld-ok path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .35s ease-out}usa-field[data-valid] .usa-fld-ok path{stroke-dashoffset:0}.usa-fld-meter{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:6px}.usa-fld-meter i{height:4px;border-radius:2px;background:rgba(100,116,139,.25);transform-origin:0 50%;transition:background .25s}.usa-fld-meter[data-score=\"1\"] i:nth-child(-n+1){background:#ef4444}.usa-fld-meter[data-score=\"2\"] i:nth-child(-n+2){background:#f59e0b}.usa-fld-meter[data-score=\"3\"] i:nth-child(-n+3){background:#84cc16}.usa-fld-meter[data-score=\"4\"] i{background:#16a34a}.usa-fld-msg{margin:4px 0 0;min-height:1.3em;font-size:12px;color:var(--usa-fld-muted,#64748b)}usa-field[data-invalid] .usa-fld-msg{color:var(--usa-fld-bad)}@media (prefers-reduced-motion:reduce){.usa-fld-label,.usa-fld-line,.usa-fld-ok path,.usa-fld-meter i{transition:none}}";

/** 0–4 password strength score with a label (7.7). */
function passwordStrength(pw) {
    let s = 0;
    if (pw.length >= 8)
        s++;
    if (pw.length >= 12)
        s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw))
        s++;
    if (/\d/.test(pw))
        s++;
    if (/[^A-Za-z0-9]/.test(pw))
        s++;
    if (!pw)
        s = 0;
    else if (pw.length < 6)
        s = Math.min(s, 1);
    const score = Math.min(4, s);
    return { score, label: ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score] };
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let uid = 0;
const PASS = ['type', 'name', 'required', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'inputmode', 'placeholder'];
function defineField(tag = 'usa-field') {
    return defineElement(tag, (Base) => {
        class UsaField extends Base {
            constructor() {
                super(...arguments);
                this._id = `usa-fld-${++uid}`;
                this._checking = false;
            }
            static get observedAttributes() {
                return ['label', 'hint', 'error', 'strength', ...PASS];
            }
            get input() {
                return this.querySelector('.usa-fld-input');
            }
            get value() {
                return this.input?.value ?? this.str('value');
            }
            set value(v) {
                if (this.input) {
                    this.input.value = v;
                    this.sync();
                }
                else
                    this.setAttribute('value', v);
            }
            mount() {
                const keep = this.input?.value ?? this.str('value');
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const id = this._id;
                const strength = this.flag('strength');
                const attrs = PASS.filter((a) => this.hasAttribute(a))
                    .map((a) => (a === 'required' ? ' required' : ` ${a}="${esc(this.str(a))}"`))
                    .join('');
                this.insertAdjacentHTML('beforeend', `<div class="usa-fld" data-usa-part><input class="usa-fld-input" id="${id}"${attrs} aria-describedby="${id}-msg"${this.hasAttribute('type') ? '' : ' type="text"'}><label class="usa-fld-label" for="${id}">${esc(this.str('label', 'Label'))}</label><span class="usa-fld-line" aria-hidden="true"></span><svg class="usa-fld-ok" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg>${strength ? '<div class="usa-fld-meter" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' : ''}<p class="usa-fld-msg" id="${id}-msg" aria-live="polite">${esc(this.str('hint'))}</p></div>`);
                const input = this.input;
                input.value = keep;
                this.listen(input, 'input', () => {
                    if (this.hasAttribute('data-invalid'))
                        this.validate();
                    this.sync();
                });
                this.listen(input, 'focus', () => this.setAttribute('data-focus', ''));
                this.listen(input, 'blur', () => {
                    this.removeAttribute('data-focus');
                    if (input.value || input.required)
                        this.validate();
                });
                // form submit / reportValidity(): show our message instead of the browser bubble
                this.listen(input, 'invalid', (e) => {
                    e.preventDefault();
                    if (!this._checking)
                        this.validate();
                });
                this.sync();
            }
            sync() {
                const input = this.input;
                if (!input)
                    return;
                this.setFlag('data-filled', !!input.value);
                const meter = this.querySelector('.usa-fld-meter');
                if (meter) {
                    const { score, label } = passwordStrength(input.value);
                    meter.setAttribute('data-score', String(score));
                    if (!this.hasAttribute('data-invalid')) {
                        const msg = this.querySelector('.usa-fld-msg');
                        msg.textContent = input.value ? `Strength: ${label}` : this.str('hint');
                    }
                }
            }
            /** Runs native validation; animates and emits `usa:valid` / `usa:invalid`. */
            validate() {
                const input = this.input;
                if (!input)
                    return false;
                this._checking = true;
                const ok = input.checkValidity();
                this._checking = false;
                const msg = this.querySelector('.usa-fld-msg');
                const was = this.hasAttribute('data-invalid');
                this.setFlag('data-invalid', !ok);
                this.setFlag('data-valid', ok && !!input.value);
                input.setAttribute('aria-invalid', String(!ok));
                if (!ok) {
                    msg.textContent = this.str('error') || input.validationMessage || 'Please check this field';
                    if (!was && !this.reduced) {
                        this.motion(this.querySelector('.usa-fld'), [{ transform: 'none' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
                        this.motion(msg, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
                    }
                    this.emit('invalid', { value: input.value, message: msg.textContent });
                }
                else {
                    msg.textContent = this.str('hint');
                    this.sync();
                    if (input.value)
                        this.emit('valid', { value: input.value });
                }
                return ok;
            }
        }
        return UsaField;
    }, { id: 'field', text: css });
}

export { defineField as d, passwordStrength as p };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.1.0/dist/chunks/field-BlWcKLcW.js.map