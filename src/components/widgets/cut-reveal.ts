import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren } from './kit';
import css from './motion-surfaces.css?raw';

export type CutStyle = 'slice' | 'shred' | 'split' | 'tear';

/** The clip-path polygons of `count` strips (horizontal for slice, vertical for shred), in percent. */
export function stripClips(style: CutStyle, count: number): string[] {
  const n = Math.max(1, Math.min(24, Math.round(count)));
  if (style === 'split') return ['inset(0 50% 0 0)', 'inset(0 0 0 50%)'];
  if (style === 'tear') {
    // a jagged vertical tear down the middle; both halves share the same zigzag edge
    const pts: string[] = [];
    for (let i = 0; i <= 10; i++) pts.push(`${50 + (i % 2 ? 3 : -3)}% ${i * 10}%`);
    return [`polygon(0 0, ${pts.join(', ')}, 0 100%)`, `polygon(100% 0, ${pts.join(', ')}, 100% 100%)`];
  }
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((i / n) * 100).toFixed(3), b = (100 - ((i + 1) / n) * 100).toFixed(3);
    out.push(style === 'shred' ? `inset(0 ${b}% 0 ${a}%)` : `inset(${a}% 0 ${b}% 0)`);
  }
  return out;
}

/**
 * A cut transition for any content: copies of it are cut into strips (`slice` horizontal, `shred` vertical), two
 * halves (`split`) or two torn halves (`tear`) that fly in from alternating sides and meet, then the real content
 * takes their place. `play('out')` cuts it apart again and leaves it hidden. The copies are `aria-hidden`, `inert`
 * and stripped of ids; while they move, the real content is only made transparent, so it keeps its place in the
 * layout and in the accessibility tree. Plays
 * when it scrolls into view unless `trigger="manual"`. Reduced motion fades instead.
 *
 * Attributes: `cut` (slice | shred | split | tear; slice), `pieces` (strips for slice / shred, 2–24; 6),
 * `duration` (ms; 900), `trigger` (view | manual; view).
 * Method `play(direction?: 'in' | 'out')` (a promise). Event `usa:done` ({ direction }).
 */
export interface UsaCutRevealElement extends UsaElement {
  play(direction?: 'in' | 'out'): Promise<void>;
}

export function defineCutReveal(tag = 'usa-cut-reveal'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class CutReveal extends Base {
    static get observedAttributes(): string[] { return ['cut', 'pieces', 'duration', 'trigger']; }
    private _play?: (d: 'in' | 'out') => Promise<void>;
    play(direction: 'in' | 'out' = 'in'): Promise<void> { return this._play?.(direction === 'out' ? 'out' : 'in') ?? Promise.resolve(); }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('div', 'usa-kit usa-cut');
      const content = make('div', 'usa-cut-content');
      content.append(...kids);
      const layer = make('div', 'usa-cut-layer');
      layer.setAttribute('aria-hidden', 'true');
      root.append(content, layer);
      this.append(root);
      const styles: CutStyle[] = ['slice', 'shred', 'split', 'tear'];
      const cut = (styles.includes(this.str('cut') as CutStyle) ? this.str('cut') : 'slice') as CutStyle;
      const pieces = Math.round(Math.min(24, Math.max(2, this.num('pieces', 6))));
      const duration = Math.max(200, this.num('duration', 900));
      const manual = this.str('trigger') === 'manual';
      // veiled (transparent, still in the accessibility tree) until the first cut-in has played
      if (!manual && !this.reduced) content.setAttribute('data-veil', '');
      let running: Animation[] = [];
      const clear = () => { for (const a of running) a.cancel(); running = []; layer.textContent = ''; };
      const copy = () => {
        const c = content.cloneNode(true) as HTMLElement;
        c.className = 'usa-cut-piece';
        c.inert = true;
        for (const el of [c, ...Array.from(c.querySelectorAll('[id]'))]) el.removeAttribute('id');
        c.removeAttribute('data-veil');
        c.style.visibility = '';
        return c;
      };
      this._play = (dir) => {
        clear();
        if (this.reduced) {
          content.removeAttribute('data-veil');
          content.style.visibility = dir === 'out' ? 'hidden' : '';
          const a = this.motion(content, dir === 'out' ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
          const done = () => { this.emit('done', { direction: dir }); };
          return a ? a.finished.then(done, done) : (done(), Promise.resolve());
        }
        const clips = stripClips(cut, pieces);
        const vertical = cut === 'shred';
        content.style.visibility = '';
        content.setAttribute('data-veil', '');
        const anims = clips.map((clip, i) => {
          const piece = copy();
          piece.style.clipPath = clip;
          layer.append(piece);
          const side = i % 2 ? 1 : -1;
          const far = cut === 'split' || cut === 'tear' ? 60 : 110;
          const offset = vertical ? `translateY(${side * far}%)` : `translateX(${side * far}%)`;
          const twist = cut === 'tear' ? ` rotate(${side * 4}deg)` : '';
          const away: Keyframe = { transform: offset + twist, opacity: cut === 'split' || cut === 'tear' ? 0 : 1 };
          const home: Keyframe = { transform: 'none', opacity: 1 };
          const delay = cut === 'split' || cut === 'tear' ? 0 : (i * duration * 0.35) / clips.length;
          return this.motion(piece, dir === 'out' ? [home, away] : [away, home], { duration: duration * 0.65, delay, easing: dir === 'out' ? 'cubic-bezier(.55,0,.75,.2)' : 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
        });
        running = anims.filter(Boolean) as Animation[];
        const finish = () => {
          clear();
          content.removeAttribute('data-veil');
          content.style.visibility = dir === 'out' ? 'hidden' : '';
          this.emit('done', { direction: dir });
        };
        return Promise.all(running.map((a) => a.finished)).then(finish, () => {});
      };
      if (!manual) {
        let seen = false;
        this.inView((v) => { if (v && !seen) { seen = true; void this._play?.('in'); } }, { threshold: 0.25 });
      }
      this.onCleanup(() => {
        clear();
        content.style.visibility = '';
        content.removeAttribute('data-veil');
        this.append(...kids);
        root.remove();
        this._play = undefined;
      });
    }
  }, { id: 'motion-surfaces', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
