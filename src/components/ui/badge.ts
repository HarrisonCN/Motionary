import { defineElement, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import { adoptVariants } from './variants';
import css from './badge.css?raw';

/**
 * `<usa-badge>` — a count / dot badge on whatever it wraps; bumps with a
 * spring whenever the value changes and pulses with `pulse`.
 * Attributes: `value` (number or text; 0 / empty hides it unless
 * `show-zero`), `max` (99 → "99+"), `dot`, `pulse`, `label` (accessible
 * text, default "{n} new"), `variant`. Reduced motion: no bump or pulse.
 */
export interface UsaBadgeElement extends UsaElement {
  value: string;
}

export function defineBadge(tag = 'usa-badge'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) =>
      class UsaBadge extends Base {
        static get observedAttributes(): string[] {
          return ['value', 'max', 'dot', 'label'];
        }
        private _el: HTMLElement | null = null;
        get value(): string {
          return this.str('value');
        }
        set value(v: string) {
          this.setAttribute('value', String(v));
        }

        mount(): void {
          if (!this._el || !this._el.isConnected) {
            this._el = document.createElement('span');
            this._el.className = 'usa-badge-count';
            this.append(this._el);
          }
          this.sync(false);
        }

        changed(name: string): void {
          this.sync(name === 'value');
        }

        private sync(bump: boolean): void {
          const el = this._el;
          if (!el) return;
          const raw = this.value;
          const n = Number(raw);
          const max = this.num('max', 99);
          const text = this.flag('dot') ? '' : raw !== '' && Number.isFinite(n) && n > max ? `${max}+` : raw;
          const empty = !this.flag('dot') && (raw === '' || (raw === '0' && !this.flag('show-zero')));
          el.textContent = text;
          el.hidden = empty;
          this.toggleAttribute('data-dot', this.flag('dot'));
          const label = this.str('label', raw ? `${raw} new` : 'New');
          el.setAttribute('aria-label', label.replace('{n}', raw));
          el.setAttribute('role', 'status');
          if (bump && !empty && !this.reduced) this.motion(el, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], springEasing('bouncy'));
        }
      },
    { id: 'badge', text: css }
  );
}
