import { defineElement, type UsaElement } from '../base';
import { morphTo } from './core';
import css from './svg.css?raw';

/**
 * `<usa-morph>` — morphs an SVG path through a list of shapes.
 * Put a `<svg><path></path></svg>` inside (one is created otherwise) and set
 * `paths="M… | M… | M…"` (same command structure morphs smoothly, others
 * switch at the midpoint). Attributes: `trigger` (`click` default · `hover`
 * · `auto` · `view`), `interval` (ms for auto, 2000), `duration` (600).
 * Property `index`, method `next()`, event `usa:change`.
 * Reduced motion: shapes switch without animating; `auto` does not cycle.
 */
export interface UsaMorphElement extends UsaElement {
  readonly index: number;
  next(): Promise<void>;
}

export function defineMorph(tag = 'usa-morph'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaMorph extends Base {
        static get observedAttributes(): string[] {
          return ['paths', 'trigger', 'duration', 'interval'];
        }
        private _i = 0;
        private _path: SVGPathElement | null = null;

        get index(): number {
          return this._i;
        }

        private list(): string[] {
          return this.str('paths').split('|').map((s) => s.trim()).filter(Boolean);
        }

        next(): Promise<void> {
          const l = this.list();
          if (!this._path || l.length < 2) return Promise.resolve();
          this._i = (this._i + 1) % l.length;
          this.emit('change', { index: this._i });
          return morphTo(this._path, l[this._i], { duration: this.num('duration', 600) });
        }

        mount(): void {
          let path = this.querySelector('path');
          if (!path) {
            this.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><path></path></svg>';
            path = this.querySelector('path');
          }
          this._path = path as SVGPathElement;
          const l = this.list();
          if (l[0]) this._path.setAttribute('d', l[this._i % l.length]);
          const t = this.str('trigger', 'click');
          if (t === 'hover') {
            this.listen(this, 'pointerenter', () => void this.next());
            this.listen(this, 'pointerleave', () => void this.next());
          } else if (t === 'auto' || t === 'view') {
            let timer: ReturnType<typeof setInterval> | undefined;
            this.inView((v) => {
              clearInterval(timer);
              if (!v || this.reduced) return;
              if (t === 'view') return void this.next();
              timer = setInterval(() => void this.next(), this.num('interval', 2000));
            });
            this.onCleanup(() => clearInterval(timer));
          } else {
            if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
            if (!this.hasAttribute('role')) this.setAttribute('role', 'button');
            this.listen(this, 'click', () => void this.next());
            this.listen(this, 'keydown', (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                void this.next();
              }
            });
          }
        }
      },
    { id: 'svg', text: css }
  );
}
