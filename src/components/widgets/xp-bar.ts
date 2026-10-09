import { defineElement, type UsaElement } from '../base';
import css from './xp-bar.css?raw';

/**
 * `<usa-xp-bar>` (7.5) — an experience bar: `level`, `xp`, `per` (XP per
 * level, default 100). `add(n)` fills the bar smoothly; when it overflows the
 * bar fills to the end, the level badge pops (“Level up!”) and the bar restarts
 * with the remainder — several levels in a row if needed. A `progressbar`
 * labelled "Level 3, 40 of 100 XP"; level-ups are announced politely.
 * `usa:xp` (`{ level, xp, gained }`), `usa:levelup` (`{ level }`).
 * Reduced motion: the bar and level change at once, no pop.
 */
export interface UsaXpBarElement extends UsaElement {
  level: number;
  xp: number;
  add(n: number): void;
}

/** Apply `gain` XP to (level, xp) with `per` XP per level (7.5). */
export function levelFor(level: number, xp: number, gain: number, per = 100): { level: number; xp: number; ups: number } {
  const p = Math.max(1, per);
  let total = Math.max(0, xp + gain);
  let ups = 0;
  while (total >= p) {
    total -= p;
    ups++;
  }
  return { level: level + ups, xp: total, ups };
}

export function defineXpBar(tag = 'usa-xp-bar'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaXpBar extends Base {
        static get observedAttributes(): string[] {
          return ['level', 'xp', 'per'];
        }
        private _busy = false;
        get level(): number {
          return Math.max(1, Math.floor(this.num('level', 1)));
        }
        set level(v: number) {
          this.setAttribute('level', String(v));
        }
        get xp(): number {
          return Math.max(0, this.num('xp', 0));
        }
        set xp(v: number) {
          this.setAttribute('xp', String(v));
        }
        private get per(): number {
          return Math.max(1, this.num('per', 100));
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML(
            'beforeend',
            '<b class="usa-xp-lvl" data-usa-part aria-hidden="true"></b><span class="usa-xp-track" data-usa-part><i class="usa-xp-fill"></i></span><span class="usa-xp-num" data-usa-part aria-hidden="true"></span><span class="usa-xp-live" data-usa-part aria-live="polite"></span>'
          );
          this.setAttribute('role', 'progressbar');
          this.setAttribute('aria-valuemin', '0');
          this.paint(false);
        }

        changed(): void {
          if (!this._busy && this.querySelector('.usa-xp-fill')) this.paint(false);
        }

        private paint(animate: boolean, from?: number): void {
          const per = this.per;
          const xp = Math.min(this.xp, per);
          (this.querySelector('.usa-xp-lvl') as HTMLElement).textContent = String(this.level);
          (this.querySelector('.usa-xp-num') as HTMLElement).textContent = `${Math.round(xp)} / ${per} XP`;
          this.setAttribute('aria-valuemax', String(per));
          this.setAttribute('aria-valuenow', String(Math.round(xp)));
          this.setAttribute('aria-label', `Level ${this.level}, ${Math.round(xp)} of ${per} XP`);
          const fill = this.querySelector('.usa-xp-fill') as HTMLElement;
          const to = `scaleX(${(xp / per).toFixed(4)})`;
          if (animate && !this.reduced && from !== undefined) this.motion(fill, [{ transform: `scaleX(${from.toFixed(4)})` }, { transform: to }], { duration: 500, easing: 'cubic-bezier(.2,.8,.3,1)' });
          fill.style.transform = to;
        }

        add(n: number): void {
          const per = this.per;
          const start = this.level;
          const r = levelFor(start, Math.min(this.xp, per), Number(n) || 0, per);
          const fill = this.querySelector('.usa-xp-fill') as HTMLElement | null;
          const fromK = Math.min(this.xp, per) / per;
          this._busy = true;
          this.level = r.level;
          this.xp = r.xp;
          this._busy = false;
          if (!fill) return;
          if (r.ups && !this.reduced) {
            this.motion(fill, [{ transform: `scaleX(${fromK.toFixed(4)})` }, { transform: 'scaleX(1)' }], { duration: 380, easing: 'ease-in' });
            const lvl = this.querySelector('.usa-xp-lvl') as HTMLElement;
            this.motion(lvl, [{ transform: 'scale(1)' }, { transform: 'scale(1.6) rotate(-8deg)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: 600, delay: 340, easing: 'ease-out' });
            this.dataset.levelup = '';
            setTimeout(() => {
              delete this.dataset.levelup;
            }, 1200);
            setTimeout(() => this.isConnected && this.paint(true, 0), 380);
            this.paint(false);
            fill.style.transform = 'scaleX(1)';
          } else this.paint(true, fromK);
          if (r.ups) {
            (this.querySelector('.usa-xp-live') as HTMLElement).textContent = `Level up! Level ${r.level}`;
            this.emit('levelup', { level: r.level });
          }
          this.emit('xp', { level: r.level, xp: r.xp, gained: n });
        }
      }
      return UsaXpBar as unknown as CustomElementConstructor;
    },
    { id: 'xp-bar', text: css }
  );
}
