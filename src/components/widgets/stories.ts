import { defineElement, type UsaElement } from '../base';
import { ownChildren, part, dropParts } from './shared';
import css from './stories.css?raw';

/**
 * `<usa-stories>` (6.2) — story viewer: segmented progress bars at the top,
 * auto-advance, tap the left / right third to go back / forward, press and
 * hold to pause, a pause button (WCAG 2.2.2). Each child is one story.
 * Attributes: `duration` (ms per story, 5000), `loop`, `paused`.
 * API: `next()`, `prev()`, `goTo(i)`, `pause()`, `play()`, `index`.
 * Events: `usa:change` (`{ index }`), `usa:end`. Reduced motion: no
 * auto-advance (paused until the user navigates), cross-fade only.
 */
export interface UsaStoriesElement extends UsaElement {
  readonly index: number;
  next(): void;
  prev(): void;
  goTo(i: number): void;
  pause(): void;
  play(): void;
}

export function defineStories(tag = 'usa-stories'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaStories extends Base {
        static get observedAttributes(): string[] {
          return ['duration', 'loop'];
        }
        private _i = 0;
        private _items: HTMLElement[] = [];
        private _bars: HTMLElement[] = [];
        private _fill: Animation | null = null;
        private _btn: HTMLButtonElement | null = null;
        get index(): number {
          return this._i;
        }
        mount(): void {
          dropParts(this);
          this._items = ownChildren(this);
          const bars = part('div', 'usa-stories-bars', { 'aria-hidden': 'true' });
          this._bars = this._items.map(() => {
            const b = part('div', 'usa-stories-bar', {}, '<i></i>');
            bars.append(b);
            return b;
          });
          this._btn = part('button', 'usa-stories-toggle', { type: 'button' });
          this.listen(this._btn, 'click', (e: Event) => {
            e.stopPropagation();
            this.hasAttribute('paused') ? this.play() : this.pause();
          });
          this.append(bars, this._btn);
          this.setAttribute('role', 'region');
          this.setAttribute('aria-roledescription', 'stories');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Stories');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          if (this.reduced) this.setAttribute('paused', '');
          let held = false;
          let downAt = 0;
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            if ((e.target as Element).closest('button,a')) return;
            downAt = performance.now();
            held = !this.hasAttribute('paused');
            if (held) this._fill?.pause();
          });
          this.listen(this, 'pointerup', (e: PointerEvent) => {
            if ((e.target as Element).closest('button,a') || !downAt) return;
            const long = performance.now() - downAt > 350;
            downAt = 0;
            if (held && !this.hasAttribute('paused')) this._fill?.play();
            if (long) return;
            const r = this.getBoundingClientRect();
            e.clientX - r.left < r.width / 3 ? this.prev() : this.next();
          });
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') this.next();
            else if (e.key === 'ArrowLeft') this.prev();
            else if (e.key === ' ') (e.preventDefault(), this.hasAttribute('paused') ? this.play() : this.pause());
          });
          this.onCleanup(() => this._fill?.cancel());
          this.goTo(Math.min(this._i, Math.max(0, this._items.length - 1)), true);
        }
        private label(): void {
          if (this._btn) {
            const p = this.hasAttribute('paused');
            this._btn.textContent = p ? '▶' : '❚❚';
            this._btn.setAttribute('aria-label', p ? 'Play stories' : 'Pause stories');
          }
        }
        goTo(i: number, initial = false): void {
          const n = this._items.length;
          if (!n) return;
          if (i >= n && !this.flag('loop')) {
            this.emit('end');
            this.pause();
            return;
          }
          const t = ((i % n) + n) % n;
          const changed = t !== this._i || initial;
          this._i = t;
          this._items.forEach((s, k) => {
            s.toggleAttribute('data-active', k === t);
            s.setAttribute('aria-hidden', String(k !== t));
          });
          this._bars.forEach((b, k) => b.toggleAttribute('data-done', k < t));
          this._fill?.cancel();
          const fillEl = this._bars[t]?.firstElementChild as HTMLElement | undefined;
          this._fill = fillEl ? fillEl.animate?.([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: Math.max(800, this.num('duration', 5000)), fill: 'forwards' }) ?? null : null;
          if (this._fill) {
            const a = this._fill;
            a.onfinish = () => this._fill === a && this.goTo(this._i + 1);
            if (this.hasAttribute('paused')) a.pause();
          }
          this.label();
          if (changed && !initial) this.emit('change', { index: t });
        }
        next(): void {
          this.goTo(this._i + 1);
        }
        prev(): void {
          this.goTo(Math.max(0, this._i - 1));
        }
        pause(): void {
          this.setAttribute('paused', '');
          this._fill?.pause();
          this.label();
        }
        play(): void {
          this.removeAttribute('paused');
          if (this._fill?.playState === 'finished') this.goTo(this._i + 1 >= this._items.length ? 0 : this._i + 1);
          else this._fill?.play();
          this.label();
        }
      }
      return UsaStories as unknown as CustomElementConstructor;
    },
    { id: 'stories', text: css }
  );
}
