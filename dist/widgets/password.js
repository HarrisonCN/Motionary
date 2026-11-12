import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, f as formShell, n as node, b as formReset } from '../chunks/form-craft-DgeQGc4w.js';

function definePassword(tag = 'usa-password') {
    const ctor = defineElement(tag, Base => class Password extends Base {
        constructor() {
            super(...arguments);
            this._input = null;
        }
        static get observedAttributes() { return ['label', 'hint', 'value', 'name', 'disabled', 'required', 'minlength', 'maxlength', 'autocomplete', 'placeholder', 'revealed']; }
        get input() { return this._input; }
        get value() { return this._input?.value ?? this._value ?? this.str('value'); }
        set value(value) { this._value = String(value); if (this._input) {
            this._input.value = this._value;
            this._sync?.();
        } }
        get revealed() { return this.flag('revealed'); }
        set revealed(value) { this.setFlag('revealed', value); }
        reset() { this.value = this._initial ?? ''; this.revealed = false; }
        changed(name) { this._sync?.(name); }
        mount() {
            const value = this.value;
            this._initial ?? (this._initial = value);
            const { root, title, hint } = formShell(this, 'Password'), row = node('div', 'usa-form-row'), input = node('input'), reveal = node('button', '', 'Show');
            input.value = value;
            input.type = 'password';
            reveal.type = 'button';
            row.append(input, reveal);
            root.append(row, hint);
            this._input = input;
            const sync = (attribute) => { if (attribute === 'value')
                input.value = this.str('value'); title.textContent = this.str('label', 'Password'); input.setAttribute('aria-label', title.textContent); input.name = this.str('name'); input.disabled = reveal.disabled = this.flag('disabled'); input.required = this.flag('required'); input.type = this.revealed ? 'text' : 'password'; input.setAttribute('autocomplete', this.str('autocomplete', 'new-password')); input.placeholder = this.str('placeholder', 'Enter password'); for (const key of ['minlength', 'maxlength']) {
                if (this.hasAttribute(key))
                    input.setAttribute(key, this.str(key));
                else
                    input.removeAttribute(key);
            } reveal.textContent = this.revealed ? 'Hide' : 'Show'; reveal.setAttribute('aria-label', this.revealed ? 'Hide password' : 'Show password'); reveal.setAttribute('aria-pressed', String(this.revealed)); hint.textContent = this.str('hint', 'Use a unique password.'); };
            this._sync = sync;
            this.listen(reveal, 'click', () => { const start = input.selectionStart, end = input.selectionEnd; this.revealed = !this.revealed; input.focus(); if (start !== null && end !== null)
                input.setSelectionRange(start, end); this.emit('action', { action: this.revealed ? 'reveal' : 'hide' }); });
            this.listen(input, 'input', () => this.emit('input', { filled: !!input.value }));
            this.listen(input, 'change', () => this.emit('change', { filled: !!input.value }));
            this.listen(input, 'keydown', (e) => { hint.textContent = e.getModifierState('CapsLock') ? 'Caps Lock is on' : this.str('hint', 'Use a unique password.'); });
            this.listen(input, 'blur', () => { hint.textContent = this.str('hint', 'Use a unique password.'); });
            formReset(this, () => this.reset());
            this.onCleanup(() => { this._value = input.value; this._sync = undefined; this._input = null; this.revealed = false; });
            sync();
        }
    }, { id: 'form-craft', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { definePassword };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/password.js.map