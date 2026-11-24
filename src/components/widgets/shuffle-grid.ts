import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { flip, measure, ownChildren } from './kit';
import { shuffleOrder } from './kit-13';
import css from './motion-kit-13.css?raw';

/**
 * A grid of tiles (logos, avatars, photos) that every few seconds trade places, gliding to their new spots. The
 * shuffle only changes where tiles are drawn (CSS order), never the document order, so keyboard and screen reader
 * order stay as written. It pauses while hovered, focused or off screen, and not at all under reduced motion; a
 * pause button lets anyone stop it.
 *
 * Attributes: `interval` (ms; 2800), `columns` (2–10; 4), `gap` (px; 10), `pause-label` (Pause), `play-label` (Play).
 * Event `usa:shuffle` ({ order }).
 */
export interface UsaShuffleGridElement extends UsaElement {
  shuffle(): void;
}

export function defineShuffleGrid(tag = 'usa-shuffle-grid'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ShuffleGrid extends Base {
    static get observedAttributes(): string[] { return ['interval', 'columns', 'gap', 'pause-label', 'play-label']; }
    private _shuffle?: () => void;
    shuffle(): void { this._shuffle?.(); }
    mount(): void {
      const tiles = ownChildren(this);
      const root = make('div', 'usa-kit usa-shuffle');
      root.style.setProperty('--cols', String(Math.max(2, Math.min(10, Math.round(this.num('columns', 4))))));
      root.style.setProperty('--gap', `${Math.max(0, Math.min(60, this.num('gap', 10)))}px`);
      root.toggleAttribute('data-static', this.reduced);
      const grid = make('div', 'usa-shuffle-grid');
      const cells = tiles.map((t) => {
        const cell = make('div', 'usa-shuffle-cell');
        cell.append(t);
        grid.append(cell);
        return cell;
      });
      const toggle = make('button', 'usa-shuffle-toggle');
      toggle.type = 'button';
      root.append(grid);
      if (!this.reduced && cells.length > 1) root.append(toggle);
      this.append(root);
      let seed = 1;
      const doShuffle = () => {
        if (cells.length < 2) return;
        const before = measure(cells);
        const next = shuffleOrder(cells.length, ++seed);
        cells.forEach((c, i) => (c.style.order = String(next[i])));
        flip(before, cells, 620);
        this.emit('shuffle', { order: next.slice() });
      };
      this._shuffle = doShuffle;
      let userPaused = false;
      let hold = false;
      let visible = false;
      const paint = () => {
        toggle.textContent = userPaused ? '▶' : '❚❚';
        toggle.setAttribute('aria-label', userPaused ? this.str('play-label', 'Play') : this.str('pause-label', 'Pause'));
        toggle.setAttribute('aria-pressed', String(userPaused));
      };
      paint();
      const interval = Math.max(800, this.num('interval', 2800));
      let timer = 0;
      if (!this.reduced && cells.length > 1) {
        timer = window.setInterval(() => { if (!userPaused && !hold && visible && !document.hidden) doShuffle(); }, interval);
        this.listen(root, 'pointerenter', () => (hold = true));
        this.listen(root, 'pointerleave', () => (hold = false));
        this.listen(root, 'focusin', () => (hold = true));
        this.listen(root, 'focusout', (e: FocusEvent) => { if (!root.contains(e.relatedTarget as Node)) hold = false; });
        this.listen(toggle, 'click', () => { userPaused = !userPaused; paint(); });
        this.inView((v) => (visible = v));
      }
      this.onCleanup(() => {
        clearInterval(timer);
        for (const t of tiles) this.append(t);
        root.remove();
        this._shuffle = undefined;
      });
    }
  }, { id: 'motion-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
