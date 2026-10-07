import { defineElement, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import { adoptVariants } from './variants';
import { place, nextId, type Placement } from './position';
import css from './tooltip.css?raw';

/**
 * `<usa-tooltip text="…">` — a tooltip for the element it wraps, shown on
 * hover (after `delay` ms, 300) and on keyboard focus, hidden on Esc / blur.
 * It springs in from its placement side and flips to stay on screen; the
 * trigger gets `aria-describedby`.
 * Attributes: `text`, `placement` (`top` default, `bottom`, `left`, `right`),
 * `delay`, `variant`. Reduced motion: fades only.
 */
export interface UsaTooltipElement extends UsaElement {
  show(): void;
  hide(): void;
}

export function defineTooltip(tag = 'usa-tooltip'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) =>
      class UsaTooltip extends Base {
        static get observedAttributes(): string[] {
          return ['text'];
        }
        private _tip: HTMLElement | null = null;
        private _t: ReturnType<typeof setTimeout> | undefined;

        mount(): void {
          const trigger = (this.firstElementChild as HTMLElement) || this;
          const tip = document.createElement('span');
          tip.className = 'usa-tooltip-bubble usa-surface';
          tip.setAttribute('role', 'tooltip');
          tip.id = nextId('usa-tip');
          tip.textContent = this.str('text');
          tip.hidden = true;
          this.append(tip);
          this._tip = tip;
          trigger.setAttribute('aria-describedby', tip.id);
          const later = () => {
            clearTimeout(this._t);
            this._t = setTimeout(() => this.show(), this.num('delay', 300));
          };
          this.listen(this, 'pointerenter', later);
          this.listen(this, 'pointerleave', () => this.hide());
          this.listen(this, 'focusin', () => this.show());
          this.listen(this, 'focusout', () => this.hide());
          this.listen(document, 'keydown', (e: KeyboardEvent) => e.key === 'Escape' && this.hide());
          this.onCleanup(() => {
            clearTimeout(this._t);
            tip.remove();
            trigger.removeAttribute('aria-describedby');
          });
        }

        show(): void {
          const tip = this._tip;
          if (!tip || !tip.hidden || !this.str('text')) return;
          clearTimeout(this._t);
          tip.hidden = false;
          const p = place(tip, (this.firstElementChild as HTMLElement) || this, this.str('placement', 'top') as Placement);
          const d = { top: [0, 6], bottom: [0, -6], left: [6, 0], right: [-6, 0] }[p];
          this.motion(tip, this.reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: `translate(${d[0]}px, ${d[1]}px) scale(0.85)` }, { opacity: 1, transform: 'none' }], this.reduced ? { duration: 120 } : springEasing('stiff'));
        }

        hide(): void {
          clearTimeout(this._t);
          if (this._tip) this._tip.hidden = true;
        }
      },
    { id: 'tooltip', text: css }
  );
}
