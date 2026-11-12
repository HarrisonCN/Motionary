import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, f as formShell, n as node, a as formMotion } from '../chunks/form-craft-saDInBKK.js';
import { a as choiceId } from '../chunks/form-options-e_FWVRvi.js';

/** Explicit native modal dialog. No exit-intent tracking, timers, navigation or subscription requests. */
function defineCtaPopup(tag = 'usa-cta-popup') {
    const ctor = defineElement(tag, Base => class CtaPopup extends Base {
        constructor() {
            super(...arguments);
            this._reason = 'dismiss';
        }
        static get observedAttributes() { return ['label', 'hint', 'title', 'message', 'action-label', 'open', 'disabled']; }
        get open() { return this.flag('open'); }
        set open(value) { value ? this.show() : this.hide(); }
        show() { if (!this.flag('disabled'))
            this.setFlag('open', true); }
        hide(reason = 'dismiss') { this._reason = reason; this.setFlag('open', false); }
        changed() { this._sync?.(); }
        mount() {
            const { root, title, hint } = formShell(this, 'Continue'), trigger = node('button', '', 'Open'), dialog = node('dialog', 'usa-form-dialog'), card = node('div', 'usa-form-frame'), heading = node('h3'), message = node('p'), bar = node('div', 'usa-form-row'), close = node('button', '', 'Not now'), confirm = node('button', '', 'Continue');
            trigger.type = close.type = confirm.type = 'button';
            trigger.setAttribute('aria-haspopup', 'dialog');
            confirm.dataset.primary = '';
            heading.id = choiceId();
            dialog.setAttribute('aria-labelledby', heading.id);
            bar.append(close, confirm);
            card.append(heading, message, bar);
            dialog.append(card);
            root.append(trigger, dialog, hint);
            this._dialog = dialog;
            let opener = null, alive = true;
            const animate = formMotion(this);
            const sync = () => { title.textContent = this.str('label', 'Continue'); trigger.textContent = title.textContent; hint.textContent = this.str('hint'); heading.textContent = this.str('title', 'Make room for your next idea.'); message.textContent = this.str('message', 'Choose when you are ready. This dialog only emits a confirmation event.'); confirm.textContent = this.str('action-label', 'Continue'); trigger.disabled = confirm.disabled = this.flag('disabled'); trigger.setAttribute('aria-expanded', String(this.open)); if (this.open && !dialog.open) {
                opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
                if (typeof dialog.showModal === 'function')
                    dialog.showModal();
                else
                    dialog.setAttribute('open', '');
                close.focus();
                animate(card);
                this.emit('open', { open: true });
            }
            else if (!this.open && dialog.open) {
                if (typeof dialog.close === 'function')
                    dialog.close();
                else {
                    dialog.removeAttribute('open');
                    this.emit('close', { reason: this._reason });
                    opener?.focus();
                }
            } };
            this._sync = sync;
            this.listen(trigger, 'click', () => { trigger.focus(); this.show(); });
            this.listen(close, 'click', () => this.hide('dismiss'));
            this.listen(confirm, 'click', () => { if (this.flag('disabled'))
                return; if (this.emit('confirm', { confirmed: true }))
                this.hide('confirm'); });
            this.listen(dialog, 'keydown', (event) => { if (event.key !== 'Tab' || !dialog.open)
                return; const buttons = [close, confirm].filter(button => !button.disabled); if (!buttons.length)
                return; event.preventDefault(); const current = buttons.indexOf(document.activeElement), direction = event.shiftKey ? -1 : 1; buttons[current < 0 ? 0 : (current + direction + buttons.length) % buttons.length].focus(); });
            this.listen(dialog, 'cancel', (e) => { e.preventDefault(); this.hide('escape'); });
            this.listen(dialog, 'close', () => { if (!alive)
                return; this.setFlag('open', false); if (opener?.isConnected)
                opener.focus(); this.emit('close', { reason: this._reason }); });
            this.listen(dialog, 'click', (e) => { if (e.target !== dialog)
                return; const r = card.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
                this.hide('backdrop'); });
            this.onCleanup(() => { alive = false; if (dialog.open) {
                if (typeof dialog.close === 'function')
                    dialog.close();
                else
                    dialog.removeAttribute('open');
            } this._dialog = undefined; this._sync = undefined; });
            sync();
        }
    }, { id: 'form-craft', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineCtaPopup };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/cta-popup.js.map