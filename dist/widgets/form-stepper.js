import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, f as formShell, n as node, a as formMotion, d as numberValue, b as formReset } from '../chunks/form-craft-saDInBKK.js';

/** Validated steps around original light-DOM fields. Completion emits an event; the application owns submission. */
function defineFormStepper(tag = 'usa-form-stepper') {
    const ctor = defineElement(tag, Base => class FormStepper extends Base {
        constructor() {
            super(...arguments);
            this._index = 0;
            this._count = 0;
            this._reflecting = false;
        }
        static get observedAttributes() { return ['label', 'hint', 'step', 'disabled', 'back-label', 'next-label', 'complete-label']; }
        get step() { return this._index; }
        set step(index) { if (this._go)
            this.goTo(index);
        else
            this.setAttribute('step', String(index)); }
        get count() { return this._count; }
        goTo(index) { return this._go?.(index, true) ?? false; }
        back() { return this.goTo(this.step - 1); }
        next() { return this.goTo(this.step + 1); }
        reset() { this._reset?.(); }
        refresh() { this._refresh?.(); }
        changed(name) { if (this._reflecting)
            return; if (name === 'step')
            this._go?.(this.num('step', 0));
        else
            this._sync?.(); }
        mount() {
            const { root, title, hint } = formShell(this, 'One step at a time'), nav = node('ol', 'usa-form-step-nav'), status = node('div', 'usa-form-hint'), meter = node('div', 'usa-form-meter'), fill = node('i'), actions = node('div', 'usa-form-row usa-form-step-actions'), back = node('button'), next = node('button');
            status.setAttribute('role', 'status');
            nav.setAttribute('aria-label', 'Form steps');
            meter.setAttribute('aria-hidden', 'true');
            meter.append(fill);
            root.append(nav, meter, hint);
            back.type = next.type = 'button';
            next.dataset.primary = '';
            actions.append(back, next);
            this.append(status, actions);
            let panels = [], buttons = [], checking = false, invalidPending = false, invalidTimer;
            const saved = new Map(), animate = formMotion(this);
            const reflect = () => { this._reflecting = true; this.setAttribute('step', String(this._index)); this._reflecting = false; };
            const sync = () => {
                title.textContent = this.str('label', 'One step at a time');
                hint.textContent = this.str('hint');
                panels.forEach((panel, i) => { panel.hidden = i !== this.step; });
                buttons.forEach((button, i) => { button.disabled = this.flag('disabled'); if (i === this.step)
                    button.setAttribute('aria-current', 'step');
                else
                    button.removeAttribute('aria-current'); });
                back.textContent = this.str('back-label', 'Back');
                next.textContent = this.step === panels.length - 1 ? this.str('complete-label', 'Complete') : this.str('next-label', 'Continue');
                back.disabled = this.flag('disabled') || this.step <= 0;
                next.disabled = this.flag('disabled') || !panels.length;
                status.textContent = panels.length ? `Step ${this.step + 1} of ${panels.length}` : 'Add a section with data-form-step to begin.';
                meter.style.setProperty('--progress', panels.length ? ((this.step + 1) / panels.length * 100) + '%' : '0%');
            };
            const focusPanel = () => { const panel = panels[this.step]; if (!panel)
                return; const field = panel.querySelector('input:not([type=hidden]):not(:disabled),textarea:not(:disabled),select:not(:disabled),button:not(:disabled),a[href]'); if (field)
                field.focus();
            else {
                panel.tabIndex = -1;
                panel.focus();
            } };
            const show = (index, focus = false) => { const previous = this.step; this._index = index; reflect(); sync(); if (index !== previous) {
                animate(panels[index]);
                this.emit('step-change', { step: index, previous, count: panels.length });
            } if (focus)
                focusPanel(); };
            const valid = (index) => {
                const fields = Array.from(panels[index]?.querySelectorAll('input,textarea,select') ?? []);
                checking = true;
                const bad = fields.find(field => field.willValidate && !field.checkValidity());
                checking = false;
                if (!bad)
                    return true;
                show(index);
                bad.focus();
                checking = true;
                bad.reportValidity();
                checking = false;
                this.emit('invalid', { step: index });
                return false;
            };
            this._reset = () => { if (panels.length)
                show(0); };
            this._go = (value, focus = false) => {
                if (!panels.length || this.flag('disabled')) {
                    reflect();
                    return false;
                }
                const index = Math.round(numberValue(value, this.step, 0, panels.length - 1));
                if (index > this.step)
                    for (let i = this.step; i < index; i++)
                        if (!valid(i))
                            return false;
                show(index, focus);
                return true;
            };
            const refresh = () => {
                panels = Array.from(this.children).filter((el) => el instanceof HTMLElement && el.hasAttribute('data-form-step'));
                for (const [panel, state] of saved)
                    if (!panels.includes(panel)) {
                        panel.hidden = state.hidden;
                        if (state.tabindex === null)
                            panel.removeAttribute('tabindex');
                        else
                            panel.setAttribute('tabindex', state.tabindex);
                        if (!state.panelClass)
                            panel.classList.remove('usa-form-panel');
                        saved.delete(panel);
                    }
                panels.forEach(panel => { if (!saved.has(panel))
                    saved.set(panel, { hidden: panel.hidden, tabindex: panel.getAttribute('tabindex'), panelClass: panel.classList.contains('usa-form-panel') }); panel.classList.add('usa-form-panel'); });
                this._count = panels.length;
                nav.replaceChildren();
                buttons = panels.map((panel, i) => { const item = node('li'), button = node('button', '', panel.getAttribute('data-step-title') || 'Step ' + (i + 1)); button.type = 'button'; button.dataset.step = String(i); item.append(button); nav.append(item); return button; });
                this._index = Math.round(numberValue(this.step, 0, 0, Math.max(0, panels.length - 1)));
                reflect();
                sync();
            };
            this._refresh = refresh;
            this._sync = sync;
            this.listen(nav, 'click', (event) => { const button = event.target.closest('button[data-step]'); if (button && nav.contains(button))
                this.goTo(Number(button.dataset.step)); });
            this.listen(back, 'click', () => this.back());
            this.listen(next, 'click', () => { if (this.step < panels.length - 1)
                this.next();
            else {
                for (let i = 0; i < panels.length; i++)
                    if (!valid(i))
                        return;
                this.emit('complete', { step: this.step, count: panels.length });
            } });
            // Direct native form submission can discover an invalid control in a hidden
            // step. Reveal the first such step before the browser tries to focus it.
            this.listen(this, 'invalid', (event) => { if (checking || invalidPending)
                return; const index = panels.findIndex(panel => panel.contains(event.target)); if (index < 0)
                return; invalidPending = true; show(index); invalidTimer = setTimeout(() => { invalidPending = false; }, 0); }, { capture: true });
            formReset(this, () => this.reset());
            this.onCleanup(() => { clearTimeout(invalidTimer); status.remove(); actions.remove(); for (const [panel, state] of saved) {
                panel.hidden = state.hidden;
                if (state.tabindex === null)
                    panel.removeAttribute('tabindex');
                else
                    panel.setAttribute('tabindex', state.tabindex);
                if (!state.panelClass)
                    panel.classList.remove('usa-form-panel');
            } this._go = this._sync = this._refresh = this._reset = undefined; });
            const requested = this.num('step', 0);
            this._index = 0;
            refresh();
            this._go(requested);
        }
    }, { id: 'form-craft', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineFormStepper };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/form-stepper.js.map