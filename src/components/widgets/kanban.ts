import { defineElement, type UsaElement } from '../base';
import { ownChildren } from './shared';
import css from './kanban.css?raw';

/**
 * `<usa-kanban>` (6.8) — a kanban board with drag-sort. Children are the
 * columns (any element; a `[data-title]` attribute or its first heading is
 * the title); the column's `[data-card]` children (or `<li>`s) are cards.
 * Drag a card (pointer or touch): it lifts and tilts toward the drag
 * direction, a placeholder opens where it will land, and the other cards
 * glide out of the way (FLIP). Keyboard: Space / Enter picks a card up,
 * arrows move it (← → between columns, ↑ ↓ within), Space drops, Esc cancels;
 * moves are announced politely. Event `usa:move` (`{ card, from, to, index }`).
 * Reduced motion: no tilt or glide.
 */
export interface UsaKanbanElement extends UsaElement {
  readonly columns: HTMLElement[];
  cardsOf(col: HTMLElement): HTMLElement[];
  move(card: HTMLElement, to: HTMLElement, index: number): void;
}

export function defineKanban(tag = 'usa-kanban'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaKanban extends Base {
        private _cols: HTMLElement[] = [];
        private _live: HTMLElement | null = null;
        private _held: HTMLElement | null = null;

        get columns(): HTMLElement[] {
          return this._cols;
        }

        cardsOf(col: HTMLElement): HTMLElement[] {
          return Array.from(col.children).filter((c): c is HTMLElement => c instanceof HTMLElement && (c.hasAttribute('data-card') || c.localName === 'li'));
        }

        mount(): void {
          this._cols = ownChildren(this);
          this.setAttribute('role', 'group');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Board'));
          if (!this.querySelector(':scope > .usa-kb-live')) {
            const l = document.createElement('span');
            l.className = 'usa-kb-live';
            l.setAttribute('data-usa-part', '');
            l.setAttribute('aria-live', 'polite');
            this.appendChild(l);
          }
          this._live = this.querySelector('.usa-kb-live');
          this._cols.forEach((col) => {
            col.classList.add('usa-kb-col');
            col.setAttribute('role', 'list');
            const title = col.dataset.title || col.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || '';
            if (title) col.setAttribute('aria-label', title);
            this.cardsOf(col).forEach((c) => this.prepCard(c));
          });
          this.listen(this, 'pointerdown', (e: PointerEvent) => this.drag(e));
          this.listen(this, 'keydown', (e: KeyboardEvent) => this.key(e));
        }

        private prepCard(c: HTMLElement): void {
          c.classList.add('usa-kb-card');
          c.setAttribute('role', 'listitem');
          if (!c.hasAttribute('tabindex')) c.tabIndex = 0;
          c.setAttribute('aria-roledescription', 'draggable card');
        }

        private say(msg: string): void {
          if (this._live) this._live.textContent = msg;
        }

        private colName(col: HTMLElement): string {
          return col.getAttribute('aria-label') || `column ${this._cols.indexOf(col) + 1}`;
        }

        /** FLIP: run `change`, then glide every card from its old box. */
        private flip(change: () => void): void {
          const cards = this._cols.flatMap((c) => this.cardsOf(c));
          const before = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
          change();
          if (this.reduced) return;
          for (const c of cards) {
            const a = before.get(c)!;
            const b = c.getBoundingClientRect();
            const dx = a.left - b.left;
            const dy = a.top - b.top;
            if ((dx || dy) && c !== this._held) this.motion(c, [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
          }
        }

        move(card: HTMLElement, to: HTMLElement, index: number): void {
          const from = card.parentElement as HTMLElement;
          const list = this.cardsOf(to).filter((c) => c !== card);
          const i = Math.max(0, Math.min(list.length, index));
          this.flip(() => {
            const ref = list[i] || null;
            if (ref) to.insertBefore(card, ref);
            else to.appendChild(card);
          });
          this.emit('move', { card, from, to, index: i });
        }

        private drag(e: PointerEvent): void {
          const card = (e.target as HTMLElement).closest?.('.usa-kb-card') as HTMLElement | null;
          if (!card || !this.contains(card) || e.button > 0) return;
          const r = card.getBoundingClientRect();
          const ox = e.clientX - r.left;
          const oy = e.clientY - r.top;
          let started = false;
          let lastX = e.clientX;
          const ghost = card;
          const ph = document.createElement('div');
          ph.className = 'usa-kb-ph';
          ph.setAttribute('data-usa-part', '');
          const onMove = (ev: PointerEvent) => {
            if (!started) {
              if (Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 6) return;
              started = true;
              ph.style.height = r.height + 'px';
              card.parentElement!.insertBefore(ph, card);
              ghost.classList.add('usa-kb-lifted');
              ghost.style.width = r.width + 'px';
              ghost.style.position = 'fixed';
              ghost.style.zIndex = '1000';
              ghost.style.pointerEvents = 'none';
            }
            ev.preventDefault();
            const tilt = this.reduced ? 0 : Math.max(-8, Math.min(8, (ev.clientX - lastX) * 0.8));
            lastX = ev.clientX;
            ghost.style.left = ev.clientX - ox + 'px';
            ghost.style.top = ev.clientY - oy + 'px';
            ghost.style.transform = `rotate(${tilt}deg) scale(${this.reduced ? 1 : 1.04})`;
            const col = this._cols.find((c) => {
              const b = c.getBoundingClientRect();
              return ev.clientX >= b.left && ev.clientX <= b.right;
            });
            if (!col) return;
            const cards = this.cardsOf(col).filter((c) => c !== card);
            const at = cards.find((c) => {
              const b = c.getBoundingClientRect();
              return ev.clientY < b.top + b.height / 2;
            });
            if (ph.parentElement !== col || ph.nextElementSibling !== (at || null)) this.flip(() => (at ? col.insertBefore(ph, at) : col.appendChild(ph)));
          };
          const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            if (!started) return;
            const to = ph.parentElement as HTMLElement;
            const index = this.cardsOf(to).filter((c) => c !== card).indexOf(ph.nextElementSibling as HTMLElement);
            const from = card.parentElement as HTMLElement;
            const g = ghost.getBoundingClientRect();
            to.insertBefore(card, ph);
            ph.remove();
            ghost.classList.remove('usa-kb-lifted');
            ghost.style.cssText = '';
            const b = card.getBoundingClientRect();
            if (!this.reduced) this.motion(card, [{ transform: `translate(${g.left - b.left}px,${g.top - b.top}px) rotate(3deg)` }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
            const list = this.cardsOf(to);
            this.emit('move', { card, from, to, index: index < 0 ? list.indexOf(card) : list.indexOf(card) });
            this.say(`Moved to ${this.colName(to)}, position ${list.indexOf(card) + 1}`);
          };
          window.addEventListener('pointermove', onMove, { passive: false });
          window.addEventListener('pointerup', onUp);
          window.addEventListener('pointercancel', onUp);
        }

        private key(e: KeyboardEvent): void {
          const card = (e.target as HTMLElement).closest?.('.usa-kb-card') as HTMLElement | null;
          if (!card) return;
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (this._held === card) {
              card.removeAttribute('aria-grabbed');
              card.classList.remove('usa-kb-held');
              this._held = null;
              this.say(`Dropped in ${this.colName(card.parentElement as HTMLElement)}`);
            } else {
              this._held = card;
              card.setAttribute('aria-grabbed', 'true');
              card.classList.add('usa-kb-held');
              this.say('Picked up. Use arrow keys to move, Space to drop.');
            }
            return;
          }
          if (e.key === 'Escape' && this._held) {
            this._held.classList.remove('usa-kb-held');
            this._held.removeAttribute('aria-grabbed');
            this._held = null;
            return;
          }
          if (this._held !== card) return;
          const col = card.parentElement as HTMLElement;
          const ci = this._cols.indexOf(col);
          const idx = this.cardsOf(col).indexOf(card);
          let to = col;
          let i = idx;
          if (e.key === 'ArrowLeft' && ci > 0) (to = this._cols[ci - 1]), (i = Math.min(idx, this.cardsOf(to).length));
          else if (e.key === 'ArrowRight' && ci < this._cols.length - 1) (to = this._cols[ci + 1]), (i = Math.min(idx, this.cardsOf(to).length));
          else if (e.key === 'ArrowUp') i = Math.max(0, idx - 1);
          else if (e.key === 'ArrowDown') i = idx + 1;
          else return;
          e.preventDefault();
          this.move(card, to, i);
          card.focus();
          this.say(`${this.colName(to)}, position ${this.cardsOf(to).indexOf(card) + 1}`);
        }
      }
      return UsaKanban as unknown as CustomElementConstructor;
    },
    { id: 'kanban', text: css }
  );
}
