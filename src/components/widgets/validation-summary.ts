import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, formShell, formMotion } from './form-craft';
import { choiceId } from './form-options';
import css from './form-craft.css?raw';
export interface FormIssue { target: string; message: string; }
export interface UsaValidationSummaryElement extends UsaElement { errors: FormIssue[]; validate(): boolean; clear(): void; }
/** Native validity summary or supplied errors; links focus real controls. No values are collected or emitted. */
export function defineValidationSummary(tag = 'usa-validation-summary'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ValidationSummary extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'target']; }
    private _errors: FormIssue[] = []; private _sync?: () => void;
    get errors(): FormIssue[] { return this._errors.map(e => ({ ...e })); }
    set errors(value: FormIssue[]) { this._errors = Array.isArray(value) ? value.filter(e => e && typeof e.target === 'string' && typeof e.message === 'string').map(e => ({ target: e.target, message: e.message })) : []; this._sync?.(); }
    private targetForm(): HTMLFormElement | null { const target = this.str('target'); const el = target ? document.getElementById(target) : this.closest('form'); return el instanceof HTMLFormElement ? el : null; }
    validate(): boolean { const form = this.targetForm(); if (!form) return this._errors.length === 0; const errors: FormIssue[] = []; for (const control of Array.from(form.elements)) { if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) || !control.willValidate || control.validity.valid) continue; if (!control.id) control.id = choiceId(); errors.push({ target: control.id, message: control.validationMessage }); } this.errors = errors; this.emit('validate', { valid: !errors.length, count: errors.length }); return !errors.length; }
    clear(): void { this.errors = []; }
    changed(name: string): void { if (name === 'target') super.changed(name); else this._sync?.(); }
    mount(): void {
      const { root, title, hint } = formShell(this, 'Please check these fields'), list = node('ul', 'usa-form-errors'), status = node('div', 'usa-form-hint'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); root.tabIndex = -1; root.append(list, status, hint); const animate = formMotion(this); let queued = false, alive = true;
      const sync = () => { title.textContent = this.str('label', 'Please check these fields'); hint.textContent = this.str('hint'); list.replaceChildren(); this._errors.forEach(issue => { const item = node('li'), link = node('a', '', issue.message); link.href = '#' + encodeURIComponent(issue.target); link.dataset.target = issue.target; item.append(link); list.append(item); }); status.textContent = this._errors.length ? `${this._errors.length} ${this._errors.length === 1 ? 'field needs' : 'fields need'} attention` : 'No errors'; list.hidden = !this._errors.length; };
      this._sync = sync; this.listen(list, 'click', (event: MouseEvent) => { const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-target]'); if (!link) return; event.preventDefault(); const target = document.getElementById(link.dataset.target!); if (target instanceof HTMLElement) target.focus(); });
      const form = this.targetForm(); if (form) { this.listen(form, 'invalid', () => { if (queued) return; queued = true; queueMicrotask(() => { queued = false; if (alive) { this.validate(); animate(root); } }); }, { capture: true }); this.listen(form, 'reset', (event: Event) => queueMicrotask(() => { if (alive && !event.defaultPrevented) this.clear(); })); this.listen(form, 'input', () => { if (this._errors.length) this.validate(); }); }
      this.onCleanup(() => { alive = false; this._sync = undefined; }); sync();
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
