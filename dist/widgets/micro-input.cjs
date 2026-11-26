'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var micro = require('../chunks/micro-3qfNbgwt.cjs');
var microKit16$1 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var microKit16 = require('../chunks/micro-kit-16-CPdfvyga.cjs');

const SVG = 'http://www.w3.org/2000/svg';
const TYPES = ['text', 'email', 'password', 'url', 'tel', 'search', 'number'];
function defineMicroInput(tag = 'usa-micro-input') {
    const ctor = base.defineElement(tag, (Base) => class MicroInput extends Base {
        constructor() {
            super(...arguments);
            this._value = '';
            this._input = null;
            this._check = null;
        }
        static get observedAttributes() {
            return ['label', 'type', 'value', 'name', 'required', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'hint', 'error', 'success', 'disabled', 'feel', 'haptics'];
        }
        get value() {
            return this._input ? this._input.value : this._value;
        }
        set value(v) {
            this._value = String(v ?? '');
            if (this._input) {
                this._input.value = this._value;
                this._input.dispatchEvent(new Event('input'));
            }
        }
        validate() {
            return this._check ? this._check(true) : true;
        }
        mount() {
            const attr = this.getAttribute('value');
            if (attr !== this._seen) {
                this._seen = attr;
                this._value = attr ?? '';
            }
            const id = microKit16$1.uid('mo-minput');
            const root = moments.make('div', 'usa-mkit usa-minput');
            const field = moments.make('label', 'usa-minput-field');
            const label = moments.make('span', 'usa-minput-label', this.str('label', 'Text'));
            const input = moments.make('input', 'usa-minput-control');
            const type = this.str('type', 'text');
            input.type = TYPES.includes(type) ? type : 'text';
            input.id = id;
            input.value = this._value;
            input.disabled = this.flag('disabled');
            for (const a of ['name', 'pattern', 'minlength', 'maxlength', 'autocomplete'])
                if (this.hasAttribute(a))
                    input.setAttribute(a, this.str(a));
            input.required = this.flag('required');
            const line = moments.make('span', 'usa-minput-line');
            const ok = document.createElementNS(SVG, 'svg');
            ok.setAttribute('viewBox', '0 0 24 24');
            ok.setAttribute('aria-hidden', 'true');
            ok.setAttribute('class', 'usa-minput-ok');
            const okPath = document.createElementNS(SVG, 'path');
            okPath.setAttribute('d', 'M5.5 12.5l4.2 4.2L18.5 7.5');
            ok.append(okPath);
            field.append(label, input, line, ok);
            const meta = moments.make('div', 'usa-minput-meta');
            const msg = moments.make('span', 'usa-minput-msg', this.str('hint'));
            msg.id = `${id}-msg`;
            msg.setAttribute('aria-live', 'polite');
            const max = Number(this.str('maxlength'));
            const count = Number.isFinite(max) && max > 0 ? moments.make('span', 'usa-minput-count') : null;
            if (count)
                count.setAttribute('aria-hidden', 'true');
            meta.append(msg);
            if (count)
                meta.append(count);
            input.setAttribute('aria-describedby', msg.id);
            root.append(field, meta);
            this.append(root);
            this._input = input;
            const group = microKit16$1.hostSprings(this, { f: input.value ? 1 : 0, l: 0, k: 0 }, (v) => {
                const f = v.f;
                label.style.transform = `translateY(${Math.round(-f * 22 * 10) / 10}px) scale(${Math.round((1 - f * 0.22) * 1000) / 1000})`;
                line.style.transform = `scaleX(${Math.round(Math.max(0, v.l) * 1000) / 1000})`;
                ok.style.transform = `scale(${Math.round(Math.max(0, v.k) * 1000) / 1000})`;
                ok.style.opacity = String(Math.min(1, Math.max(0, v.k)));
            });
            let touched = false;
            let near = false;
            const countPaint = () => {
                if (!count)
                    return;
                const n = input.value.length;
                count.textContent = `${n}/${max}`;
                const close = n >= max * 0.9;
                count.toggleAttribute('data-near', close);
                if (close && !near)
                    micro.feedback(count, n >= max ? 'shake' : 'pop');
                near = close;
            };
            countPaint();
            const check = (loud) => {
                const valid = input.validity ? input.validity.valid : true; // validity, not checkValidity(): that fires `invalid` again
                root.toggleAttribute('data-invalid', !valid);
                input.setAttribute('aria-invalid', String(!valid));
                if (!valid) {
                    const message = this.str('error') || input.validationMessage || 'Please check this field.';
                    msg.textContent = message;
                    group.set({ k: 0 }, { spring: 'smooth' });
                    if (loud) {
                        micro.feedback(field, 'shake');
                        microKit16$1.tick(this, [10, 50, 10]);
                        this.emit('invalid', { message });
                    }
                    return false;
                }
                msg.textContent = this.str('hint');
                const show = this.flag('success') && !!input.value;
                if (show && group.target('k') < 1) {
                    group.set({ k: 1 }, { spring: 'pop' });
                    if (loud)
                        this.emit('valid', { value: input.value });
                }
                else if (!show)
                    group.set({ k: 0 }, { spring: 'smooth' });
                return true;
            };
            this._check = check;
            const float = () => group.set({ f: document.activeElement === input || input.value ? 1 : 0 }, { spring: 'toggle' });
            this.listen(field, 'pointerdown', (e) => {
                const r = field.getBoundingClientRect();
                if (r.width)
                    line.style.transformOrigin = `${Math.round(((e.clientX - r.left) / r.width) * 1000) / 10}% 50%`;
            });
            this.listen(input, 'focus', () => {
                float();
                group.set({ l: 1 }, { spring: 'smooth' });
            });
            this.listen(input, 'blur', () => {
                float();
                group.set({ l: 0 }, { spring: 'smooth' });
                line.style.transformOrigin = '';
                if (touched || input.value)
                    check(true);
                touched = true;
            });
            this.listen(input, 'input', () => {
                this._value = input.value;
                float();
                countPaint();
                if (root.hasAttribute('data-invalid') || this.flag('success'))
                    check(false);
                this.emit('input', { value: input.value });
            });
            this.listen(input, 'invalid', (e) => {
                e.preventDefault();
                check(true);
            });
            if (input.value)
                check(false);
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._input = null;
                this._check = null;
            });
        }
    }, { id: 'micro-kit-16', text: microKit16.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMicroInput = defineMicroInput;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/micro-input.cjs.map