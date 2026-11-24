import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, formatNumber, list } from './kit';
import { numbers, rovingIndex } from './kit-12';
import { squarify } from './kit-13';
import css from './parts-kit-13.css?raw';

const PALETTE = ['#4f46e5', '#0891b2', '#d97706', '#db2777', '#059669', '#7c3aed', '#ea580c', '#475569'];

/**
 * A squarified treemap: each value becomes a tile whose area matches its share, laid out to keep tiles close to
 * square. Tiles scale in from their own centres, biggest first, when the map scrolls into view, and label themselves
 * when there is room. Every tile is a button in one tab stop (arrow keys move between them in reading order) with its
 * name, value and share, and a pick is reported.
 *
 * Attributes: `values`, `labels`, `colors`, `label` (Treemap), `unit`, `ratio` (width / height; 1.8).
 * Event `usa:select` ({ index, value, share }).
 */
export interface UsaTreemapElement extends UsaElement {}

export function defineTreemap(tag = 'usa-treemap'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Treemap extends Base {
    static get observedAttributes(): string[] { return ['values', 'labels', 'colors', 'label', 'unit', 'ratio']; }
    mount(): void {
      const values = numbers(this.str('values'), 60);
      const labels = list(this.str('labels'), 60);
      const colors = list(this.str('colors'), 60).map(cleanColor);
      const unit = this.str('unit');
      const ratio = Math.max(0.5, Math.min(4, this.num('ratio', 1.8)));
      const W = 100 * ratio, H = 100;
      const rects = squarify(values, W, H);
      const total = values.reduce((a, b) => a + b, 0) || 1;
      const root = make('div', 'usa-kit usa-tmap');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Treemap'));
      root.style.setProperty('--ratio', String(ratio));
      root.toggleAttribute('data-static', this.reduced);
      const order = values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(([, i]) => i);
      // reading order: top to bottom, then left to right
      const reading = values.map((_, i) => i).filter((i) => rects[i].w > 0).sort((a, b) => rects[a].y - rects[b].y || rects[a].x - rects[b].x);
      const tiles: HTMLButtonElement[] = [];
      for (const i of reading) {
        const r = rects[i];
        const b = make('button', 'usa-tmap-tile');
        b.type = 'button';
        b.style.cssText = `left:${(r.x / W) * 100}%;top:${(r.y / H) * 100}%;width:${(r.w / W) * 100}%;height:${(r.h / H) * 100}%`;
        b.style.setProperty('--c', colors[i] || PALETTE[i % PALETTE.length]);
        b.style.setProperty('--i', String(order.indexOf(i)));
        const share = values[i] / total;
        const name = labels[i] || `#${i + 1}`;
        const small = (r.w / W) * (r.h / H) < 0.035;
        if (small) b.setAttribute('data-small', '');
        b.append(make('span', 'usa-tmap-name', name), make('span', 'usa-tmap-val', `${formatNumber(values[i], 1)}${unit ? ` ${unit}` : ''} · ${formatNumber(share * 100, 1)}%`));
        b.setAttribute('aria-label', `${name}: ${formatNumber(values[i], 1)}${unit ? ` ${unit}` : ''}, ${formatNumber(share * 100, 1)}%`);
        b.title = b.getAttribute('aria-label') || '';
        b.tabIndex = tiles.length ? -1 : 0;
        this.listen(b, 'click', () => this.emit('select', { index: i, value: values[i], share }));
        tiles.push(b);
        root.append(b);
      }
      this.append(root);
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        const k = tiles.indexOf(e.target as HTMLButtonElement);
        const to = rovingIndex(e.key, k, tiles.length);
        if (k < 0 || to < 0) return;
        e.preventDefault();
        tiles[k].tabIndex = -1;
        tiles[to].tabIndex = 0;
        tiles[to].focus();
      });
      let shown = false;
      this.inView((v) => { if (v && !shown) { shown = true; root.setAttribute('data-in', ''); } });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'parts-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
