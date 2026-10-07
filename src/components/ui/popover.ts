import { defineElement, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import { adoptVariants } from './variants';
import { place, nextId, type Placement } from './position';
import css from './popover.css?raw';

/**
 * `<usa-popover>` — a click-to-open popover: the first element child is the
 * trigger, `[data-popover]` is the content. Springs open from the trigger,
 * flips to stay on screen; Esc or an outside click closes and focus returns
 * to the trigger. `aria-expanded` / `aria-controls` on the trigger.
 * Attributes: `open`, `placement` (`bottom` default), `variant`. Events:
 * `usa:open`, `usa:close`. Reduced motion: fades only.
 */
export interface UsaPopoverElement extends UsaElement {
  open: boolean;
  toggle(force?: boolean): void;
}

export function definePopover(tag = 'usa-popover'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) =>
      class UsaPopover extends Base {
        get open(): boolean {
          return this.flag('open');
        }
        set open(v: boolean) {
          this.toggle(v);
        }
        private parts(): [HTMLElement | null, HTMLElement | null] {
          return [this.firstElementChild as HTMLElement | null, this.querySelector<HTMLElement>(':scope > [data-popover]')];
        }

        mount(): void {
          const [trigger, panel] = this.parts();
          if (!trigger || !panel || trigger === panel) return;
          panel.id ||= nextId('usa-pop');
          panel.classList.add('usa-surface', 'usa-popover-panel');
          if (!panel.hasAttribute('role')) panel.setAttribute('role', 'dialog');
          panel.tabIndex = -1;
          trigger.setAttribute('aria-controls', panel.id);
          trigger.setAttribute('aria-haspopup', 'dialog');
          this.render(false);
          this.listen(trigger, 'click', () => this.toggle());
          this.listen(document, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape' && this.open) {
              this.toggle(false);
              trigger.focus();
            }
          });
          this.listen(document, 'pointerdown', (e: PointerEvent) => this.open && !this.contains(e.target as Node) && this.toggle(false));
          this.listen(window, 'resize', () => this.open && place(panel, trigger, this.str('placement', 'bottom') as Placement));
        }

        private render(animate: boolean): void {
          const [trigger, panel] = this.parts();
          if (!trigger || !panel) return;
          trigger.setAttribute('aria-expanded', String(this.open));
          panel.hidden = !this.open;
          if (!this.open) return;
          const p = place(panel, trigger, this.str('placement', 'bottom') as Placement);
          if (!animate) return;
          const origin = { top: '50% 100%', bottom: '50% 0', left: '100% 50%', right: '0 50%' }[p];
          panel.style.transformOrigin = origin;
          this.motion(panel, this.reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }], this.reduced ? { duration: 120 } : springEasing('wobbly'));
          panel.focus({ preventScroll: true });
        }

        toggle(force?: boolean): void {
          const next = force === undefined ? !this.open : force;
          if (next === this.open) return;
          this.setFlag('open', next);
          this.render(true);
          this.emit(next ? 'open' : 'close');
        }
      },
    { id: 'popover', text: css }
  );
}
