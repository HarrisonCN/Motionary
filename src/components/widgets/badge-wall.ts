import { defineElement, type UsaElement } from '../base';
import css from './badge-wall.css?raw';

export interface WallBadge {
  name: string;
  icon: string;
  locked: boolean;
}

/**
 * `<usa-badge-wall>` (7.5) — an achievement grid from `<li data-icon
 * data-locked>` children: locked badges are grey with a 🔒; `unlock(name)`
 * flips the badge over to its colour side with a shine, and the
 * “3 / 8 unlocked” counter rolls. Each badge is a labelled list item
 * ("First win, unlocked"); unlocks are announced politely. `badges`,
 * `usa:unlock` (`{ name }`). Reduced motion: the badge just changes, no flip.
 */
export interface UsaBadgeWallElement extends UsaElement {
  readonly badges: WallBadge[];
  unlock(name: string): boolean;
}

/** Unlocked / total counts for a badge list (7.5). */
export const badgeProgress = (b: WallBadge[]): { unlocked: number; total: number } => ({ unlocked: b.filter((x) => !x.locked).length, total: b.length });

export function defineBadgeWall(tag = 'usa-badge-wall'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaBadgeWall extends Base {
        private _b: WallBadge[] = [];
        get badges(): WallBadge[] {
          return this._b.map((b) => ({ ...b }));
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const seed = Array.from(this.querySelectorAll<HTMLElement>(':scope > li'));
          if (seed.length) this._b = seed.map((li) => ({ name: (li.textContent || '').trim(), icon: li.dataset.icon || '🏅', locked: li.hasAttribute('data-locked') }));
          seed.forEach((li) => li.remove());
          this.insertAdjacentHTML('beforeend', '<p class="usa-bw-count" data-usa-part></p><ul class="usa-bw-grid" data-usa-part></ul><span class="usa-bw-live" data-usa-part aria-live="polite"></span>');
          const grid = this.querySelector('.usa-bw-grid') as HTMLElement;
          grid.setAttribute('aria-label', this.str('label', 'Achievements'));
          for (const b of this._b) {
            const li = document.createElement('li');
            li.className = 'usa-bw-badge';
            li.innerHTML = '<span class="usa-bw-icon" aria-hidden="true"></span><span class="usa-bw-name"></span>';
            (li.querySelector('.usa-bw-icon') as HTMLElement).textContent = b.icon;
            (li.querySelector('.usa-bw-name') as HTMLElement).textContent = b.name;
            li.dataset.name = b.name;
            grid.appendChild(li);
            this.paintBadge(li, b);
          }
          this.count();
        }

        private paintBadge(li: HTMLElement, b: WallBadge): void {
          li.toggleAttribute('data-locked', b.locked);
          li.setAttribute('aria-label', `${b.name}, ${b.locked ? 'locked' : 'unlocked'}`);
        }

        private count(): void {
          const p = badgeProgress(this._b);
          (this.querySelector('.usa-bw-count') as HTMLElement).textContent = `${p.unlocked} / ${p.total} unlocked`;
        }

        unlock(name: string): boolean {
          const b = this._b.find((x) => x.name === name && x.locked);
          if (!b) return false;
          b.locked = false;
          const li = Array.from(this.querySelectorAll<HTMLElement>('.usa-bw-badge')).find((x) => x.dataset.name === name);
          if (li) {
            if (!this.reduced) {
              this.motion(li, [{ transform: 'perspective(400px) rotateY(0)' }, { transform: 'perspective(400px) rotateY(90deg)', offset: 0.45 }, { transform: 'perspective(400px) rotateY(0) scale(1.12)', offset: 0.8 }, { transform: 'none' }], { duration: 700, easing: 'ease-out' });
              setTimeout(() => this.paintBadge(li, b), 300);
              li.dataset.shine = '';
              setTimeout(() => delete li.dataset.shine, 1100);
            } else this.paintBadge(li, b);
            li.setAttribute('aria-label', `${b.name}, unlocked`);
          }
          this.count();
          (this.querySelector('.usa-bw-live') as HTMLElement).textContent = `Unlocked: ${name}`;
          this.emit('unlock', { name });
          return true;
        }
      }
      return UsaBadgeWall as unknown as CustomElementConstructor;
    },
    { id: 'badge-wall', text: css }
  );
}
