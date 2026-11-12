'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var formCraft = require('../chunks/form-craft-i3CaepYO.cjs');
var formOptions = require('../chunks/form-options-lnCyapKT.cjs');

/** Native validity summary or supplied errors; links focus real controls. No values are collected or emitted. */
function defineValidationSummary(tag = 'usa-validation-summary') {
    const ctor = base.defineElement(tag, Base => class ValidationSummary extends Base {
        constructor() {
            super(...arguments);
            this._errors = [];
        }
        static get observedAttributes() { return ['label', 'hint', 'target']; }
        get errors() { return this._errors.map(e => ({ ...e })); }
        set errors(value) { this._errors = Array.isArray(value) ? value.filter(e => e && typeof e.target === 'string' && typeof e.message === 'string').map(e => ({ target: e.target, message: e.message })) : []; this._sync?.(); }
        targetForm() { const target = this.str('target'); const el = target ? document.getElementById(target) : this.closest('form'); return el instanceof HTMLFormElement ? el : null; }
        validate() { const form = this.targetForm(); if (!form)
            return this._errors.length === 0; const errors = []; for (const control of Array.from(form.elements)) {
            if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) || !control.willValidate || control.validity.valid)
                continue;
            if (!control.id)
                control.id = formOptions.choiceId();
            errors.push({ target: control.id, message: control.validationMessage });
        } this.errors = errors; this.emit('validate', { valid: !errors.length, count: errors.length }); return !errors.length; }
        clear() { this.errors = []; }
        changed(name) { if (name === 'target')
            super.changed(name);
        else
            this._sync?.(); }
        mount() {
            const { root, title, hint } = formCraft.formShell(this, 'Please check these fields'), list = formCraft.node('ul', 'usa-form-errors'), status = formCraft.node('div', 'usa-form-hint');
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            root.tabIndex = -1;
            root.append(list, status, hint);
            const animate = formCraft.formMotion(this);
            let queued = false, alive = true;
            const sync = () => { title.textContent = this.str('label', 'Please check these fields'); hint.textContent = this.str('hint'); list.replaceChildren(); this._errors.forEach(issue => { const item = formCraft.node('li'), link = formCraft.node('a', '', issue.message); link.href = '#' + encodeURIComponent(issue.target); link.dataset.target = issue.target; item.append(link); list.append(item); }); status.textContent = this._errors.length ? `${this._errors.length} ${this._errors.length === 1 ? 'field needs' : 'fields need'} attention` : 'No errors'; list.hidden = !this._errors.length; };
            this._sync = sync;
            this.listen(list, 'click', (event) => { const link = event.target.closest('a[data-target]'); if (!link)
                return; event.preventDefault(); const target = document.getElementById(link.dataset.target); if (target instanceof HTMLElement)
                target.focus(); });
            const form = this.targetForm();
            if (form) {
                this.listen(form, 'invalid', () => { if (queued)
                    return; queued = true; queueMicrotask(() => { queued = false; if (alive) {
                    this.validate();
                    animate(root);
                } }); }, { capture: true });
                this.listen(form, 'reset', (event) => queueMicrotask(() => { if (alive && !event.defaultPrevented)
                    this.clear(); }));
                this.listen(form, 'input', () => { if (this._errors.length)
                    this.validate(); });
            }
            this.onCleanup(() => { alive = false; this._sync = undefined; });
            sync();
        }
    }, { id: 'form-craft', text: formCraft.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineValidationSummary = defineValidationSummary;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/validation-summary.cjs.map