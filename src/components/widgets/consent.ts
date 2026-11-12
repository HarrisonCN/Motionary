import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, formShell, formReset, formMotion } from './form-craft';
import css from './form-craft.css?raw';
export interface UsaConsentElement extends UsaElement { preferences: { analytics: boolean; marketing: boolean }; reset(): void; }
/** Explicit preference controls. Emits a decision; does not read/write cookies or storage, or activate services. */
export function defineConsent(tag = 'usa-consent'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Consent extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'analytics', 'marketing', 'disabled', 'name']; }
    private _sync?: () => void; private _initial?: { analytics: boolean; marketing: boolean };
    get preferences(): { analytics: boolean; marketing: boolean } { return { analytics: this.flag('analytics'), marketing: this.flag('marketing') }; }
    set preferences(value: { analytics: boolean; marketing: boolean }) { this.setFlag('analytics', !!value?.analytics); this.setFlag('marketing', !!value?.marketing); }
    reset(): void { this.preferences = this._initial ?? { analytics: false, marketing: false }; this._sync?.(); }
    changed(): void { this._sync?.(); }
    mount(): void {
      this._initial ??= this.preferences; const { root, title, hint } = formShell(this, 'Your preferences'); const inputs = new Map<string, HTMLInputElement>();
      for (const [key, label, note] of [['essential', 'Essential', 'Needed for the requested functionality'], ['analytics', 'Analytics', 'Optional usage measurement'], ['marketing', 'Personalization', 'Optional recommendations']]) { const row = node('label', 'usa-form-check'), input = node('input'), text = node('span', '', label); input.type = 'checkbox'; text.append(node('small', '', note)); row.append(input, text); root.append(row); inputs.set(key, input); }
      const bar = node('div', 'usa-form-row'), reject = node('button', '', 'Essential only'), save = node('button', '', 'Save preferences'); reject.type = save.type = 'button'; save.dataset.primary = ''; bar.style.marginTop = '20px'; bar.append(reject, save); root.append(bar, hint); const animate = formMotion(this);
      const sync = () => { title.textContent = this.str('label', 'Your preferences'); hint.textContent = this.str('hint', 'Nothing is stored until your application handles this choice.'); const p = this.preferences; inputs.forEach((input, key) => { input.checked = key === 'essential' || p[key as keyof typeof p]; input.disabled = key === 'essential' || this.flag('disabled'); input.name = this.str('name') && key !== 'essential' ? this.str('name') + '-' + key : ''; input.value = 'yes'; }); save.disabled = reject.disabled = this.flag('disabled'); };
      this._sync = sync; for (const key of ['analytics', 'marketing']) this.listen(inputs.get(key)!, 'change', () => { if (this.flag('disabled')) return; this.setFlag(key, inputs.get(key)!.checked); this.emit('change', { ...this.preferences }); });
      this.listen(save, 'click', () => { animate(hint); this.emit('consent', { ...this.preferences }); }); this.listen(reject, 'click', () => { this.preferences = { analytics: false, marketing: false }; this.emit('consent', { ...this.preferences }); });
      formReset(this, () => this.reset()); this.onCleanup(() => { this._sync = undefined; }); sync();
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
