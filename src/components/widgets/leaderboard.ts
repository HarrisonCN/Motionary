import { defineElement, type UsaElement } from '../base';
import css from './leaderboard.css?raw';

export interface LeaderRow {
  name: string;
  score: number;
  avatar?: string;
}

/**
 * `<usa-leaderboard>` (7.5) — a ranked list from `<li data-score>` children or
 * the `rows` property. When scores change, rows glide to their new rank
 * (FLIP), climbers flash green with ▲n, fallers red with ▼n, and scores roll.
 * Top three get 🥇🥈🥉. `limit`, `me` (name to highlight). An ordered list
 * whose items read "1. Ada, 980 points"; rank changes are announced politely.
 * `usa:rank` (`{ name, from, to }`). Reduced motion: rows jump, no flash or roll.
 */
export interface UsaLeaderboardElement extends UsaElement {
  rows: LeaderRow[];
  setScore(name: string, score: number): void;
}

/** Sort rows by score desc, then name (7.5). */
export const rankRows = (rows: LeaderRow[]): LeaderRow[] => [...rows].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

const MEDAL = ['🥇', '🥈', '🥉'];

export function defineLeaderboard(tag = 'usa-leaderboard'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaLeaderboard extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'limit', 'me'];
        }
        private _rows: LeaderRow[] = [];
        get rows(): LeaderRow[] {
          return rankRows(this._rows).map((r) => ({ ...r }));
        }
        set rows(v: LeaderRow[]) {
          this._rows = (v || []).map((r) => ({ ...r, score: Number(r.score) || 0 }));
          if (this.isConnected) this.render();
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const seed = Array.from(this.querySelectorAll<HTMLElement>(':scope > li'));
          if (seed.length) this._rows = seed.map((li) => ({ name: (li.textContent || '').trim(), score: Number(li.dataset.score) || 0, avatar: li.dataset.avatar }));
          seed.forEach((li) => li.remove());
          this.insertAdjacentHTML('beforeend', '<ol class="usa-lb-list" data-usa-part></ol><span class="usa-lb-live" data-usa-part aria-live="polite"></span>');
          this.querySelector('.usa-lb-list')!.setAttribute('aria-label', this.str('label', 'Leaderboard'));
          this.render();
        }

        setScore(name: string, score: number): void {
          const r = this._rows.find((x) => x.name === name);
          if (r) r.score = score;
          else this._rows.push({ name, score });
          this.render();
        }

        private render(): void {
          const list = this.querySelector('.usa-lb-list') as HTMLElement | null;
          if (!list) return;
          const ranked = rankRows(this._rows).slice(0, this.num('limit', 10));
          const old = new Map<string, { li: HTMLElement; top: number; rank: number; score: number }>();
          Array.from(list.children).forEach((li) => {
            const h = li as HTMLElement;
            old.set(h.dataset.name!, { li: h, top: h.getBoundingClientRect().top, rank: Number(h.dataset.rank), score: Number(h.dataset.score) });
          });
          const me = this.str('me', '');
          const moves: string[] = [];
          ranked.forEach((r, i) => {
            const prev = old.get(r.name);
            old.delete(r.name);
            const li = prev?.li || document.createElement('li');
            if (!prev) {
              li.className = 'usa-lb-row';
              li.innerHTML = '<b class="usa-lb-rank" aria-hidden="true"></b><span class="usa-lb-av" aria-hidden="true"></span><span class="usa-lb-name"></span><i class="usa-lb-delta" aria-hidden="true"></i><span class="usa-lb-score"></span>';
            }
            li.dataset.name = r.name;
            li.dataset.rank = String(i + 1);
            li.dataset.score = String(r.score);
            li.toggleAttribute('data-me', r.name === me);
            (li.querySelector('.usa-lb-rank') as HTMLElement).textContent = MEDAL[i] || String(i + 1);
            const av = li.querySelector('.usa-lb-av') as HTMLElement;
            av.textContent = r.avatar ? '' : Array.from(r.name)[0] || '?';
            av.style.backgroundImage = r.avatar ? `url("${r.avatar}")` : '';
            (li.querySelector('.usa-lb-name') as HTMLElement).textContent = r.name;
            li.setAttribute('aria-label', `${i + 1}. ${r.name}, ${r.score} points`);
            const sc = li.querySelector('.usa-lb-score') as HTMLElement;
            const delta = li.querySelector('.usa-lb-delta') as HTMLElement;
            list.appendChild(li);
            if (prev && prev.rank !== i + 1) {
              const d = prev.rank - (i + 1);
              delta.textContent = d > 0 ? `▲${d}` : `▼${-d}`;
              li.dataset.move = d > 0 ? 'up' : 'down';
              moves.push(`${r.name} ${d > 0 ? 'up' : 'down'} to ${i + 1}`);
              this.emit('rank', { name: r.name, from: prev.rank, to: i + 1 });
            } else if (prev) {
              delete li.dataset.move;
              delta.textContent = '';
            }
            if (!this.reduced && prev) {
              const dy = prev.top - li.getBoundingClientRect().top;
              if (dy) this.motion(li, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.9,.3,1)' });
              if (li.dataset.move) this.motion(li, [{ backgroundColor: li.dataset.move === 'up' ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.2)' }, { backgroundColor: 'transparent' }], { duration: 1200, composite: 'add' } as KeyframeAnimationOptions);
            }
            this.roll(sc, prev ? prev.score : r.score, r.score);
          });
          old.forEach(({ li }) => li.remove());
          if (moves.length) (this.querySelector('.usa-lb-live') as HTMLElement).textContent = moves.join('; ');
        }

        private roll(el: HTMLElement, from: number, to: number): void {
          if (this.reduced || from === to || typeof requestAnimationFrame !== 'function') return void (el.textContent = to.toLocaleString());
          const t0 = performance.now();
          const f = (now: number) => {
            const k = Math.min(1, (now - t0) / 600);
            el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))).toLocaleString();
            if (k < 1) requestAnimationFrame(f);
          };
          requestAnimationFrame(f);
        }
      }
      return UsaLeaderboard as unknown as CustomElementConstructor;
    },
    { id: 'leaderboard', text: css }
  );
}
