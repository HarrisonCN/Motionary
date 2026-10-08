import { defineElement, type UsaElement } from '../base';
import { bindEffect, playEffect, EFFECT_TRIGGERS, type EffectTrigger } from './registry';

/**
 * `<usa-fx effect="pop" trigger="click">` — plays any registered effect
 * (`registerEffect()`) on its first element child (or itself with `self`).
 * `trigger`: `click` (default) · `hover` · `enter` · `load` · `loop` · `manual`;
 * `options` (JSON) is passed to the effect; `once`. Method `play()`.
 */
export interface UsaFxElement extends UsaElement {
  readonly target: HTMLElement;
  play(): Promise<void>;
}

export function defineFx(tag = 'usa-fx'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) =>
    class UsaFx extends Base {
      static get observedAttributes(): string[] {
        return ['effect', 'trigger', 'options'];
      }
      get target(): HTMLElement {
        return this.flag('self') ? this : ((this.firstElementChild as HTMLElement) || this);
      }
      private opts(): Record<string, unknown> {
        try {
          return JSON.parse(this.str('options', '{}')) || {};
        } catch {
          return {};
        }
      }
      play(): Promise<void> {
        return playEffect(this.target, this.str('effect', 'pop'), this.opts()).catch(() => undefined);
      }
      mount(): void {
        if (!this.style.display) this.style.display = 'inline-block';
        const name = this.str('effect', 'pop');
        const t = this.str('trigger', 'click') as EffectTrigger;
        try {
          this.onCleanup(bindEffect(this.target, name, { ...this.opts(), trigger: EFFECT_TRIGGERS.includes(t) ? t : 'click', once: this.flag('once') }));
          this.removeAttribute('data-unknown');
        } catch {
          this.setAttribute('data-unknown', name); // not registered (yet)
        }
      }
    }
  );
}
