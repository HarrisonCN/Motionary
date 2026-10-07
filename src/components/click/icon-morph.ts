import { defineElement, type UsaElement } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';
import css from './icon-morph.css?raw';

type Pt = [number, number];
type Quad = [Pt, Pt, Pt, Pt];
const C: Quad = [[12, 12], [12, 12], [12, 12], [12, 12]];

/**
 * Morphable icons: every icon is three quads (four points each) on a 24×24
 * grid, so any icon can morph into any other by interpolating points.
 */
export const MORPH_ICONS: Record<string, [Quad, Quad, Quad]> = {
  play: [[[7, 5], [12.5, 8.25], [12.5, 15.75], [7, 19]], [[12.5, 8.25], [19, 12], [19, 12], [12.5, 15.75]], C],
  pause: [[[6, 5], [10, 5], [10, 19], [6, 19]], [[14, 5], [18, 5], [18, 19], [14, 19]], C],
  menu: [[[4, 6], [20, 6], [20, 8], [4, 8]], [[4, 11], [20, 11], [20, 13], [4, 13]], [[4, 16], [20, 16], [20, 18], [4, 18]]],
  close: [[[5.2, 6.6], [6.6, 5.2], [18.8, 17.4], [17.4, 18.8]], C, [[17.4, 5.2], [18.8, 6.6], [6.6, 18.8], [5.2, 17.4]]],
  plus: [[[11, 4], [13, 4], [13, 20], [11, 20]], [[4, 11], [20, 11], [20, 13], [4, 13]], C],
  minus: [[[4, 11], [20, 11], [20, 13], [4, 13]], [[4, 11], [20, 11], [20, 13], [4, 13]], C],
  check: [[[4.3, 12.7], [5.7, 11.3], [10.4, 16], [9, 17.4]], [[9, 17.4], [7.6, 16], [18.3, 5.3], [19.7, 6.7]], C],
  'arrow-right': [[[4, 11], [17, 11], [17, 13], [4, 13]], [[12.6, 6.4], [14, 5], [21, 12], [19.6, 13.4]], [[19.6, 10.6], [21, 12], [14, 19], [12.6, 17.6]]],
};

/** SVG path data for an icon, or for the interpolation `t` (0–1) between two. */
export function morphPath(from: string, to: string = from, t = 0): string {
  const a = MORPH_ICONS[from] || MORPH_ICONS.menu;
  const b = MORPH_ICONS[to] || a;
  return a
    .map((q, i) => {
      const pts = q.map((p, j) => {
        const r = b[i][j];
        return `${(p[0] + (r[0] - p[0]) * t).toFixed(2)} ${(p[1] + (r[1] - p[1]) * t).toFixed(2)}`;
      });
      return `M${pts.join('L')}Z`;
    })
    .join('');
}

/**
 * `<usa-icon-morph>` — an icon that morphs between shapes with a spring:
 * play ↔ pause, menu ↔ close, plus ↔ minus, check, arrow-right…
 *
 * Attributes: `icons` (comma list, cycled; default `play,pause`), `index`
 * (current, 0), `size` (px, 24), `toggle` (makes it a button that cycles
 * on click / Enter / Space), `labels` (comma list of accessible names per
 * icon, e.g. `Play,Pause`), `preset` (spring, `wobbly`). Methods:
 * `next()`, `show(nameOrIndex)`. Events: `usa:change` (`{ index, icon }`).
 * Inside a `<usa-button>` or `<button>` it is decorative. Reduced motion:
 * the icon switches instantly.
 */
export interface UsaIconMorphElement extends UsaElement {
  index: number;
  readonly icon: string;
  next(): void;
  show(icon: string | number): void;
}

export function defineIconMorph(tag = 'usa-icon-morph'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaIconMorph extends Base {
        static get observedAttributes(): string[] {
          return ['icons', 'size', 'toggle'];
        }

        private _i = 0;
        private _from = 'play';
        private _to = 'play';
        private _t!: SpringValue;

        private list(): string[] {
          return this.str('icons', 'play,pause').split(',').map((s) => s.trim()).filter((s) => MORPH_ICONS[s]);
        }
        get index(): number {
          return this._i;
        }
        set index(v: number) {
          this.show(v);
        }
        get icon(): string {
          return this.list()[this._i] || 'play';
        }

        private draw(t: number): void {
          this.querySelector('path')?.setAttribute('d', morphPath(this._from, this._to, t));
        }

        mount(): void {
          const size = this.num('size', 24);
          this.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path/></svg>`;
          this._i = Math.max(0, Math.min(this.list().length - 1, this.num('index', 0)));
          this._from = this._to = this.icon;
          this._t = createSpring({ value: 1, spring: this.str('preset', 'wobbly'), onUpdate: (v) => this.draw(v) });
          this.draw(1);
          if (this.flag('toggle')) {
            this.setAttribute('role', 'button');
            if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
            this.listen(this, 'click', () => this.next());
            this.listen(this, 'keydown', (e: KeyboardEvent) => {
              if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                e.preventDefault();
                this.next();
              }
            });
          }
          this.label();
        }

        unmount(): void {
          this._t?.stop();
        }

        private label(): void {
          const labels = this.str('labels').split(',').map((s) => s.trim());
          const l = labels[this._i];
          if (l) this.setAttribute('aria-label', l);
          if (!this.flag('toggle') && !l) this.setAttribute('aria-hidden', 'true');
        }

        show(icon: string | number): void {
          const list = this.list();
          const i = typeof icon === 'number' ? ((icon % list.length) + list.length) % list.length : list.indexOf(icon);
          if (i < 0 || !this._t) return;
          const name = list[i];
          // morph from wherever we are now (interruptible)
          const cur = this._t.value;
          this._from = cur >= 0.5 ? this._to : this._from;
          this._to = name;
          this._i = i;
          this._t.jump(0);
          this._t.set(1);
          this.label();
          this.emit('change', { index: i, icon: name });
        }

        next(): void {
          this.show(this._i + 1);
        }
      },
    { id: 'icon-morph', text: css }
  );
}
