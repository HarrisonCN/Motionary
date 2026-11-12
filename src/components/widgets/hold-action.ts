import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { finite } from '../matter/engine';
import { setMatterData, type MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-hold-action>` — cancellable pointer/keyboard hold. Emits confirmation only; it performs no external action. */
export interface UsaHoldActionElement extends UsaElement {
  readonly value: number;
  readonly confirmed: boolean;
  reset(): void;
  cancel(): void;
  update(data: MatterData): void;
}
export function defineHoldAction(tag = 'usa-hold-action'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class HoldAction extends Base {
      static get observedAttributes(): string[] { return ['label', 'complete-label', 'duration', 'disabled']; }
      private _value = 0;
      private _confirmed = false;
      private _cancel?: () => void;
      private _sync?: () => void;
      get value(): number { return this._value; }
      get confirmed(): boolean { return this._confirmed; }
      update(data: MatterData): void { setMatterData(this, data); }
      cancel(): void { this._cancel?.(); }
      reset(): void { this.cancel(); this._confirmed = false; this._value = 0; this._sync?.(); }
      changed(): void { this.cancel(); this._sync?.(); }
      mount(): void {
        this.classList.add('usa-matter'); this.setAttribute('role', 'group');
        const root = document.createElement('div'); root.className = 'usa-matter-tool';
        const button = document.createElement('button'); button.className = 'usa-hold'; button.type = 'button';
        const status = document.createElement('div'); status.className = 'usa-hold-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); root.append(button, status); this.prepend(root);
        let holding = false, interval: ReturnType<typeof setInterval> | undefined, timeout: ReturnType<typeof setTimeout> | undefined, pointer: number | undefined;
        const duration = () => finite(this.num('duration', 1000), 1000, 250, 10000);
        const sync = () => {
          this.setAttribute('aria-label', this.str('label', 'Hold to confirm')); button.disabled = this.flag('disabled');
          button.textContent = this._confirmed ? this.str('complete-label', 'Confirmed') : this.str('label', 'Hold to confirm');
          button.style.setProperty('--hold', String(this._value / 100)); button.toggleAttribute('data-confirmed', this._confirmed);
          status.textContent = this._confirmed ? 'Confirmed. Call reset() to use again.' : holding ? 'Keep holding · release or Escape to cancel' : `Hold for ${(duration() / 1000).toFixed(2)}s · mouse, touch, Space or Enter`;
        };
        const clear = () => {
          if (interval !== undefined) clearInterval(interval); if (timeout !== undefined) clearTimeout(timeout); interval = timeout = undefined;
          const id = pointer; pointer = undefined;
          if (id !== undefined) { try { if (button.hasPointerCapture?.(id)) button.releasePointerCapture(id); } catch { /* already released */ } }
        };
        const cancel = () => { if (!holding) return; holding = false; clear(); this._value = 0; sync(); this.emit('cancel', { value: 0 }); this.emit('change', { value: 0, confirmed: false }); };
        this._cancel = cancel; this._sync = sync;
        const start = () => {
          if (holding || this.flag('disabled') || this._confirmed || document.hidden) return;
          holding = true; const began = performance.now(), ms = duration(); this._value = 0; sync();
          interval = setInterval(() => { this._value = Math.min(99, (performance.now() - began) / ms * 100); button.style.setProperty('--hold', String(this._value / 100)); }, 40);
          timeout = setTimeout(() => { if (!holding) return; holding = false; clear(); this._value = 100; this._confirmed = true; sync(); this.emit('confirm', { value: 100, duration: ms }); this.emit('change', { value: 100, confirmed: true }); }, ms);
        };
        this.listen(button, 'pointerdown', (e: PointerEvent) => { if (holding || e.button !== 0 || this.flag('disabled')) return; start(); if (holding) { pointer = e.pointerId; try { button.setPointerCapture(e.pointerId); } catch { /* synthetic */ } } });
        for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) this.listen(button, type, cancel);
        this.listen(button, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); cancel(); } else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) start(); } });
        this.listen(button, 'keyup', (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); cancel(); } });
        this.listen(button, 'blur', cancel); this.listen(window, 'blur', cancel); this.listen(document, 'visibilitychange', () => { if (document.hidden) cancel(); });
        this.inView(v => { if (!v) cancel(); });
        this.onCleanup(() => { holding = false; clear(); this._value = this._confirmed ? 100 : 0; this._cancel = this._sync = undefined; root.remove(); }); sync();
      }
    }
    return HoldAction;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
