import { defineElement, type UsaElement } from '../base';
import css from './switch.css?raw';

/**
 * `<usa-switch>` (6.7) — toggle switch variants: `ios` (the thumb stretches
 * while pressed and slides), `daynight` (sun → moon with stars and
 * clouds), `bounce` (the thumb squashes and bounces at the end) and
 * `liquid` (a gooey fill pours behind the thumb). A real switch:
 * `role="switch"`, `aria-checked`, Space / Enter, `disabled`; `checked`
 * property / attribute; inside a `<form>` with `name` it submits `value`
 * ("on") when checked. Event `usa:change` (`{ checked }`). Reduced motion:
 * no squash, bounce or pour — it just switches.
 */
export interface UsaSwitchElement extends UsaElement {
  checked: boolean;
  toggle(force?: boolean): void;
}

export const SWITCH_VARIANTS = ['ios', 'daynight', 'bounce', 'liquid'] as const;

export function defineSwitch(tag = 'usa-switch'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSwitch extends Base {
        static get observedAttributes(): string[] {
          return ['variant'];
        }
        private _on = false;
        private _input: HTMLInputElement | null = null;

        get checked(): boolean {
          return this._on;
        }
        set checked(v: boolean) {
          this.toggle(!!v, false);
        }

        mount(): void {
          const v = this.str('variant', 'ios');
          this.dataset.variant = (SWITCH_VARIANTS as readonly string[]).includes(v) ? v : 'ios';
          if (!this.querySelector(':scope > .usa-sw-track')) {
            const t = document.createElement('span');
            t.className = 'usa-sw-track';
            t.setAttribute('aria-hidden', 'true');
            t.setAttribute('data-usa-part', '');
            t.innerHTML = '<span class="usa-sw-fill"></span><span class="usa-sw-deco"></span><span class="usa-sw-thumb"></span>';
            this.prepend(t);
          }
          this.setAttribute('role', 'switch');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          if (!this.hasAttribute('aria-label') && !this.textContent?.trim()) this.setAttribute('aria-label', this.str('label', 'Toggle'));
          this._on = this.flag('checked');
          if (this.str('name', '') && !this._input) {
            this._input = document.createElement('input');
            this._input.type = 'hidden';
            this._input.setAttribute('data-usa-part', '');
            this.appendChild(this._input);
          }
          this.sync(false);
          const thumb = this.querySelector('.usa-sw-thumb') as HTMLElement;
          this.listen(this, 'pointerdown', () => !this.reduced && this.toggleAttribute('data-press', true));
          this.listen(this, 'pointerup', () => this.removeAttribute('data-press'));
          this.listen(this, 'pointerleave', () => this.removeAttribute('data-press'));
          this.listen(this, 'click', () => this.toggle(undefined, true));
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              this.toggle(undefined, true);
            }
          });
          void thumb;
        }

        private sync(animate: boolean): void {
          this.setAttribute('aria-checked', String(this._on));
          this.toggleAttribute('data-on', this._on);
          this.toggleAttribute('data-animate', animate && !this.reduced);
          if (this._input) {
            this._input.name = this.str('name', '');
            this._input.value = this.str('value', 'on');
            this._input.disabled = !this._on;
          }
          if (!animate || this.reduced) return;
          const thumb = this.querySelector('.usa-sw-thumb');
          if (thumb && this.dataset.variant === 'bounce') this.motion(thumb, [{ scale: '1 1' }, { scale: '1.35 .7', offset: 0.55 }, { scale: '.9 1.1', offset: 0.75 }, { scale: '1 1' }], { duration: 520, easing: 'ease-out' });
          const fill = this.querySelector('.usa-sw-fill');
          if (fill && this.dataset.variant === 'liquid') this.motion(fill, [{ borderRadius: '50% 50% 40% 60%' }, { borderRadius: '30% 70% 60% 40%', offset: 0.5 }, { borderRadius: '999px' }], { duration: 600, easing: 'ease-out' });
        }

        toggle(force?: boolean, user = false): void {
          if (this.flag('disabled') && user) return;
          const next = typeof force === 'boolean' ? force : !this._on;
          if (next === this._on) return;
          this._on = next;
          this.toggleAttribute('checked', next);
          this.sync(user);
          if (user) this.emit('change', { checked: next });
        }
      }
      return UsaSwitch as unknown as CustomElementConstructor;
    },
    { id: 'switch', text: css }
  );
}
