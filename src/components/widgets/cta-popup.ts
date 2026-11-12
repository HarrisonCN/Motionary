import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, formShell, formMotion } from './form-craft';
import { choiceId } from './form-options';
import css from './form-craft.css?raw';
export interface UsaCtaPopupElement extends UsaElement { open: boolean; show(): void; hide(reason?: string): void; }
/** Explicit native modal dialog. No exit-intent tracking, timers, navigation or subscription requests. */
export function defineCtaPopup(tag = 'usa-cta-popup'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class CtaPopup extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'title', 'message', 'action-label', 'open', 'disabled']; }
    private _sync?: () => void; private _dialog?: HTMLDialogElement; private _reason = 'dismiss';
    get open(): boolean { return this.flag('open'); } set open(value: boolean) { value ? this.show() : this.hide(); }
    show(): void { if (!this.flag('disabled')) this.setFlag('open', true); }
    hide(reason = 'dismiss'): void { this._reason = reason; this.setFlag('open', false); }
    changed(): void { this._sync?.(); }
    mount(): void {
      const { root, title, hint } = formShell(this, 'Continue'), trigger = node('button', '', 'Open'), dialog = node('dialog', 'usa-form-dialog'), card = node('div', 'usa-form-frame'), heading = node('h3'), message = node('p'), bar = node('div', 'usa-form-row'), close = node('button', '', 'Not now'), confirm = node('button', '', 'Continue');
      trigger.type = close.type = confirm.type = 'button'; trigger.setAttribute('aria-haspopup', 'dialog'); confirm.dataset.primary = ''; heading.id = choiceId(); dialog.setAttribute('aria-labelledby', heading.id); bar.append(close, confirm); card.append(heading, message, bar); dialog.append(card); root.append(trigger, dialog, hint); this._dialog = dialog;
      let opener: HTMLElement | null = null, alive = true; const animate = formMotion(this);
      const sync = () => { title.textContent = this.str('label', 'Continue'); trigger.textContent = title.textContent; hint.textContent = this.str('hint'); heading.textContent = this.str('title', 'Make room for your next idea.'); message.textContent = this.str('message', 'Choose when you are ready. This dialog only emits a confirmation event.'); confirm.textContent = this.str('action-label', 'Continue'); trigger.disabled = confirm.disabled = this.flag('disabled'); trigger.setAttribute('aria-expanded', String(this.open)); if (this.open && !dialog.open) { opener = document.activeElement instanceof HTMLElement ? document.activeElement : null; if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); close.focus(); animate(card); this.emit('open', { open: true }); } else if (!this.open && dialog.open) { if (typeof dialog.close === 'function') dialog.close(); else { dialog.removeAttribute('open'); this.emit('close', { reason: this._reason }); opener?.focus(); } } };
      this._sync = sync; this.listen(trigger, 'click', () => { trigger.focus(); this.show(); }); this.listen(close, 'click', () => this.hide('dismiss')); this.listen(confirm, 'click', () => { if (this.flag('disabled')) return; if (this.emit('confirm', { confirmed: true })) this.hide('confirm'); });
      this.listen(dialog, 'cancel', (e: Event) => { e.preventDefault(); this.hide('escape'); }); this.listen(dialog, 'close', () => { if (!alive) return; this.setFlag('open', false); if (opener?.isConnected) opener.focus(); this.emit('close', { reason: this._reason }); });
      this.listen(dialog, 'click', (e: MouseEvent) => { if (e.target !== dialog) return; const r = card.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) this.hide('backdrop'); });
      this.onCleanup(() => { alive = false; if (dialog.open) { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); } this._dialog = undefined; this._sync = undefined; }); sync();
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
