import { defineElement, type UsaElement } from '../base';
import { paperRandom } from '../fx2/paper';
import css from './sticky-wall.css?raw';

/**
 * `<usa-sticky-wall>` (8.5) — a wall of sticky notes: each child becomes a
 * note with a paper colour (`data-color` yellow · pink · blue · green, or
 * cycling), a slight random tilt (`seed`) and a pin, and the notes drop onto
 * the wall one by one when it scrolls into view. Clicking / Enter on a note
 * lifts it to the front (`usa:pick` { index }). A `list` of `listitem`s;
 * reduced motion: notes are simply there.
 */
export interface UsaStickyWallElement extends UsaElement {
  readonly notes: HTMLElement[];
  pick(index: number): void;
}

const COLORS = ['yellow', 'pink', 'blue', 'green'];

export function defineStickyWall(tag = 'usa-sticky-wall'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaStickyWall extends Base {
        static get observedAttributes(): string[] {
          return ['seed', 'label'];
        }
        private _z = 1;
        get notes(): HTMLElement[] {
          return Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part')) as HTMLElement[];
        }
        mount(): void {
          this.setAttribute('role', 'list');
          if (this.hasAttribute('label')) this.setAttribute('aria-label', this.str('label'));
          const r = paperRandom(this.num('seed', 3));
          const notes = this.notes;
          notes.forEach((n, i) => {
            n.classList.add('usa-sticky');
            n.setAttribute('role', 'listitem');
            n.tabIndex = 0;
            const c = COLORS.includes(n.dataset.color || '') ? (n.dataset.color as string) : COLORS[i % COLORS.length];
            n.setAttribute('data-paper', c);
            n.style.setProperty('--tilt', `${((r() - 0.5) * 8).toFixed(1)}deg`);
          });
          let shown = false;
          this.inView((v) => {
            if (!v || shown || this.reduced) return;
            shown = true;
            notes.forEach((n, i) => this.motion(n, [{ transform: 'translateY(-40px) rotate(calc(var(--tilt) * 3)) scale(1.1)', opacity: 0 }, { transform: 'translateY(4px) rotate(var(--tilt))', opacity: 1, offset: 0.75 }, { transform: 'rotate(var(--tilt))', opacity: 1 }], { duration: 520, delay: i * 110, easing: 'cubic-bezier(.3,1.2,.5,1)', fill: 'backwards' }));
          }, { threshold: 0.2 });
          this.listen(this, 'click', (e: Event) => {
            const n = (e.target as Element).closest?.('.usa-sticky');
            if (n && n.parentElement === this) this.pick(this.notes.indexOf(n as HTMLElement));
          });
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const n = (e.target as Element).closest?.('.usa-sticky');
            if (n && n.parentElement === this && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              this.pick(this.notes.indexOf(n as HTMLElement));
            }
          });
        }
        /** Lift note `index` to the front with a little wiggle. */
        pick(index: number): void {
          const n = this.notes[index];
          if (!n) return;
          n.style.zIndex = String(++this._z);
          this.notes.forEach((x) => x.removeAttribute('data-picked'));
          n.setAttribute('data-picked', '');
          if (!this.reduced) this.motion(n, [{ transform: 'rotate(var(--tilt)) scale(1)' }, { transform: 'rotate(0deg) scale(1.08)', offset: 0.4 }, { transform: 'rotate(var(--tilt)) scale(1.04)' }], { duration: 360, easing: 'ease-out' });
          this.emit('pick', { index });
        }
      }
      return UsaStickyWall as unknown as CustomElementConstructor;
    },
    { id: 'sticky-wall', text: css }
  );
}
