import { defineElement, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import { adoptVariants } from './variants';
import css from './fab.css?raw';

/**
 * `<usa-fab>` — floating action button with a speed dial. The first element
 * child is the main button; the others are actions that fan out with a
 * staggered spring when it opens (`direction="up"` default, `down`, `left`,
 * `right`, `radial`). Esc / outside click closes; `aria-expanded` on the
 * main button; actions are hidden from AT while closed.
 * Attributes: `open`, `direction`, `position` (`bottom-right` default, `bottom-left`,
 * `inline`), `gap` (px, 56), `variant`. Events: `usa:toggle` (`{ open }`).
 * Reduced motion: actions appear without travel.
 */
export interface UsaFabElement extends UsaElement {
  open: boolean;
  toggle(force?: boolean): void;
}

export function defineFab(tag = 'usa-fab'): CustomElementConstructor | undefined {
  // contract-exempt: attr-unobserved — open: state reflected by the element itself (set the property instead); observing it would re-mount on every change
  adoptVariants();
  return defineElement(
    tag,
    (Base) =>
      class UsaFab extends Base {
        static get observedAttributes(): string[] {
          return ['direction', 'gap'];
        }
        get open(): boolean {
          return this.flag('open');
        }
        set open(v: boolean) {
          this.toggle(v);
        }

        private parts(): [HTMLElement | null, HTMLElement[]] {
          const kids = Array.from(this.children) as HTMLElement[];
          return [kids[0] || null, kids.slice(1)];
        }

        private offset(i: number, n: number): [number, number] {
          const g = this.num('gap', 56) * (i + 1);
          switch (this.str('direction', 'up')) {
            case 'down':
              return [0, g];
            case 'left':
              return [-g, 0];
            case 'right':
              return [g, 0];
            case 'radial': {
              const a = Math.PI + (n > 1 ? (i / (n - 1)) * (Math.PI / 2) : Math.PI / 4);
              const r = this.num('gap', 56) * 1.6;
              return [Math.cos(a) * r, Math.sin(a) * r];
            }
            default:
              return [0, -g];
          }
        }

        mount(): void {
          const [main, actions] = this.parts();
          if (!main) return;
          main.classList.add('usa-fab-main');
          main.setAttribute('aria-haspopup', 'true');
          actions.forEach((a) => a.classList.add('usa-fab-action'));
          this.apply(false);
          this.listen(main, 'click', () => this.toggle());
          this.listen(document, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape' && this.open) {
              this.toggle(false);
              main.focus();
            }
          });
          this.listen(document, 'pointerdown', (e: PointerEvent) => this.open && !this.contains(e.target as Node) && this.toggle(false));
          this.listen(this, 'click', (e: MouseEvent) => {
            const a = (e.target as Element).closest?.('.usa-fab-action');
            if (a && this.contains(a)) this.toggle(false);
          });
        }

        private apply(animate: boolean): void {
          const [main, actions] = this.parts();
          if (!main) return;
          const open = this.open;
          main.setAttribute('aria-expanded', String(open));
          actions.forEach((a, i) => {
            const [x, y] = this.offset(i, actions.length);
            a.toggleAttribute('inert', !open);
            a.setAttribute('aria-hidden', String(!open));
            const to = open ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(1)` : 'translate(0, 0) scale(0.4)';
            const from = a.style.transform || 'translate(0, 0) scale(0.4)';
            a.style.transform = this.reduced ? (open ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` : 'translate(0, 0)') : to;
            a.style.opacity = open ? '1' : '0';
            if (animate && !this.reduced) {
              const t = springEasing(open ? 'wobbly' : 'stiff');
              this.motion(a, [{ transform: from, opacity: open ? 0 : 1 }, { transform: to, opacity: open ? 1 : 0 }], { ...t, delay: (open ? i : actions.length - 1 - i) * 35 });
            }
          });
        }

        toggle(force?: boolean): void {
          const next = force === undefined ? !this.open : force;
          if (next === this.open) return;
          this.setFlag('open', next);
          this.apply(true);
          this.emit('toggle', { open: next });
        }
      },
    { id: 'fab', text: css }
  );
}
