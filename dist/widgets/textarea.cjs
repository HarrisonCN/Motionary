'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var formCraft = require('../chunks/form-craft-i3CaepYO.cjs');
var formOptions = require('../chunks/form-options-lnCyapKT.cjs');

/** Native multiline entry with optional bounded auto-resize, a UTF-16 character counter and form reset. */
function defineTextarea(tag = 'usa-textarea') {
    const ctor = base.defineElement(tag, Base => class Textarea extends Base {
        static get observedAttributes() { return ['label', 'hint', 'value', 'name', 'placeholder', 'rows', 'max-rows', 'maxlength', 'required', 'disabled', 'readonly', 'auto-resize']; }
        get input() { return this.querySelector('textarea'); }
        get value() { return this.str('value'); }
        set value(value) { this.setAttribute('value', String(value)); this._sync?.(); }
        focusInput() { this.input?.focus(); }
        reset() { this.value = this._initial ?? ''; }
        changed() { this._sync?.(); }
        mount() {
            this._initial ?? (this._initial = this.value);
            const { root, title, hint } = formCraft.formShell(this, 'Your notes'), input = formCraft.node('textarea'), footer = formCraft.node('div', 'usa-form-text-footer'), count = formCraft.node('output');
            hint.id = formOptions.choiceId();
            count.id = formOptions.choiceId();
            input.setAttribute('aria-describedby', hint.id + ' ' + count.id);
            footer.append(hint, count);
            root.append(input, footer);
            const resize = () => {
                if (!this.flag('auto-resize')) {
                    input.style.removeProperty('height');
                    input.style.removeProperty('overflow-y');
                    return;
                }
                const style = getComputedStyle(input), line = parseFloat(style.lineHeight) || 22;
                const extra = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0) + (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
                const rows = input.rows, max = Math.max(rows, formCraft.numberValue(this.num('max-rows', 10), 10, 2, 40));
                input.style.height = 'auto';
                const needed = Math.max(rows * line + extra, input.scrollHeight + (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0));
                input.style.height = Math.min(needed, max * line + extra) + 'px';
                input.style.overflowY = needed > max * line + extra ? 'auto' : 'hidden';
            };
            const sync = () => {
                title.textContent = this.str('label', 'Your notes');
                hint.textContent = this.str('hint');
                input.setAttribute('aria-label', title.textContent);
                if (input.value !== this.value)
                    input.value = this.value;
                input.name = this.str('name');
                input.placeholder = this.str('placeholder');
                input.rows = Math.round(formCraft.numberValue(this.num('rows', 3), 3, 2, 20));
                input.required = this.flag('required');
                input.disabled = this.flag('disabled');
                input.readOnly = this.flag('readonly');
                const max = Math.floor(formCraft.numberValue(this.num('maxlength', -1), -1, -1, 1e7));
                if (max >= 0)
                    input.maxLength = max;
                else
                    input.removeAttribute('maxlength');
                count.textContent = input.value.length + (max >= 0 ? ' / ' + max : '') + ' characters';
                count.toggleAttribute('data-limit', max >= 0 && input.value.length >= max);
                resize();
            };
            this._sync = sync;
            this.listen(input, 'input', () => { this.value = input.value; this.emit('input', { value: this.value }); });
            this.listen(input, 'change', () => this.emit('change', { value: this.value }));
            this.listen(window, 'resize', resize);
            let alive = true;
            queueMicrotask(() => { if (alive)
                resize(); });
            this.onCleanup(() => { alive = false; });
            formCraft.formReset(this, () => this.reset());
            this.onCleanup(() => { this._sync = undefined; });
            sync();
        }
    }, { id: 'form-craft', text: formCraft.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTextarea = defineTextarea;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/textarea.cjs.map