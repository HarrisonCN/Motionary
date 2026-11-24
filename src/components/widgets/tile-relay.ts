import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { bound, make } from './moments';
import css from './moments.css?raw';

/**
 * A loading indicator in which a highlight is handed from tile to tile around a small grid, each tile squashing a
 * little as it takes the baton. Pure CSS animation: it pauses while off screen and stands still under reduced motion.
 *
 * Attributes: `size` (2 or 3 tiles a side, 2), `duration` (ms for one lap, 600–6000, 1400), `label` (Loading),
 * `paused`. The label is announced once through `role="status"`.
 */
export interface UsaTileRelayElement extends UsaElement {
  paused: boolean;
}

/** Clockwise order of the outer ring of an n×n grid (row-major indices). */
export function relayOrder(n: number): number[] {
  if (n <= 1) return [0];
  const out: number[] = [];
  for (let c = 0; c < n; c++) out.push(c);
  for (let r = 1; r < n; r++) out.push(r * n + n - 1);
  for (let c = n - 2; c >= 0; c--) out.push((n - 1) * n + c);
  for (let r = n - 2; r >= 1; r--) out.push(r * n);
  return out;
}

export function defineTileRelay(tag = 'usa-tile-relay'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class TileRelay extends Base {
    static get observedAttributes(): string[] { return ['size', 'duration', 'label', 'paused']; }
    get paused(): boolean { return this.flag('paused'); }
    set paused(on: boolean) { this.setFlag('paused', !!on); }
    mount(): void {
      const n = this.num('size', 2) >= 3 ? 3 : 2;
      const lap = bound(this.num('duration', 1400), 600, 6000, 1400);
      const order = relayOrder(n);
      const root = make('div', 'usa-moment usa-relay');
      root.setAttribute('role', 'status');
      root.style.setProperty('--n', String(n));
      root.style.setProperty('--lap', `${lap}ms`);
      root.style.setProperty('--count', String(order.length));
      const grid = make('span', 'usa-relay-grid');
      grid.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < n * n; i++) {
        const tile = make('i', 'usa-relay-tile');
        const k = order.indexOf(i);
        if (k < 0) tile.dataset.core = '';
        else tile.style.setProperty('--k', String(k));
        grid.append(tile);
      }
      root.append(grid, make('span', 'usa-sr', this.str('label', 'Loading')));
      root.toggleAttribute('data-static', this.reduced);
      root.toggleAttribute('data-paused', this.paused);
      this.append(root);
      this.inView((visible) => root.toggleAttribute('data-offscreen', !visible));
      this.onCleanup(() => root.remove());
    }
  }, { id: 'moments', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
