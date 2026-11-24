import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { dataNum, ownChildren } from './kit';
import css from './ui-blocks.css?raw';

/**
 * A bento grid: tiles of different sizes that rise in one after another the first time the grid scrolls into view.
 * A soft light follows the pointer across the tile under it and the tile lifts a little. Each element child is a
 * tile; `data-span` (columns, 1–4) and `data-rows` (rows, 1–3) size it. The tiles keep their own content and
 * semantics; on narrow screens (under `collapse` px) every tile takes the full width.
 *
 * Attributes: `columns` (2–6; 4), `gap` (px; 12), `collapse` (px; 560), `stagger` (ms between tiles; 70).
 */
export type UsaBentoElement = UsaElement;

export function defineBento(tag = 'usa-bento'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Bento extends Base {
    static get observedAttributes(): string[] { return ['columns', 'gap', 'collapse', 'stagger']; }
    mount(): void {
      const tiles = ownChildren(this);
      const root = make('div', 'usa-kit usa-bento');
      const cols = Math.round(Math.min(6, Math.max(2, this.num('columns', 4))));
      root.style.setProperty('--cols', String(cols));
      root.style.setProperty('--gap', `${Math.max(0, this.num('gap', 12))}px`);
      const stagger = Math.max(0, Math.min(300, this.num('stagger', 70)));
      for (const [i, t] of tiles.entries()) {
        const cell = make('div', 'usa-bento-tile');
        cell.style.gridColumn = `span ${Math.round(Math.min(cols, Math.max(1, dataNum(t, 'span', 1))))}`;
        cell.style.gridRow = `span ${Math.round(Math.min(3, Math.max(1, dataNum(t, 'rows', 1))))}`;
        cell.style.setProperty('--i', String(i));
        cell.append(t);
        root.append(cell);
      }
      root.style.setProperty('--stagger', `${stagger}ms`);
      this.append(root);
      const collapse = Math.max(0, this.num('collapse', 560));
      const fit = () => root.toggleAttribute('data-narrow', root.clientWidth < collapse);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(fit);
        ro.observe(root);
        this.onCleanup(() => ro.disconnect());
      }
      fit();
      root.toggleAttribute('data-static', this.reduced);
      let seen = false;
      this.inView((visible) => {
        if (visible && !seen) { seen = true; root.setAttribute('data-in', ''); }
      }, { threshold: 0.1 });
      this.listen(root, 'pointermove', (e: PointerEvent) => {
        const cell = (e.target as Element).closest?.('.usa-bento-tile') as HTMLElement | null;
        if (!cell || this.reduced) return;
        const r = cell.getBoundingClientRect();
        cell.style.setProperty('--x', `${e.clientX - r.left}px`);
        cell.style.setProperty('--y', `${e.clientY - r.top}px`);
      }, { passive: true });
      this.onCleanup(() => {
        this.append(...tiles);
        root.remove();
      });
    }
  }, { id: 'ui-blocks', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
