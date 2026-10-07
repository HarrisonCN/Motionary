import { defineElement, type UsaElement } from '../base';
import css from './marquee.css?raw';

/**
 * `<usa-marquee>` — an infinite, seamless ticker of its children (logos,
 * testimonials, tags). The content is cloned (clones are `aria-hidden` and
 * `inert`) and the track slides with one WAAPI `transform` animation whose
 * duration follows the measured width, so the speed is constant.
 *
 * Attributes: `speed` (px/s, 50), `direction` (`left` default | `right` |
 * `up` | `down`), `gap` (px, 32), `pause-on-hover`, `fade` (soft edges),
 * `paused`. Pauses off-screen. Reduced motion: no movement; the row
 * becomes scrollable instead.
 */
export interface UsaMarqueeElement extends UsaElement {
  pause(): void;
  resume(): void;
}

export function defineMarquee(tag = 'usa-marquee'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaMarquee extends Base {
        static get observedAttributes(): string[] {
          return ['speed', 'direction', 'gap', 'paused'];
        }

        private _track: HTMLElement | null = null;
        private _anim: Animation | null = null;
        private _hover = false;
        private _visible = true;
        private _size = 0;

        private get vertical(): boolean {
          const d = this.str('direction', 'left');
          return d === 'up' || d === 'down';
        }

        mount(): void {
          if (!this._track) {
            const track = document.createElement('div');
            track.className = 'usa-marquee-track';
            const group = document.createElement('div');
            group.className = 'usa-marquee-group';
            group.append(...Array.from(this.childNodes));
            track.append(group);
            this.append(track);
            this._track = track;
          }
          this.toggleAttribute('data-vertical', this.vertical);
          this.style.setProperty('--usa-marquee-gap', `${this.num('gap', 32)}px`);
          if (this.reduced) {
            this.setAttribute('data-static', '');
            this.syncClones(1);
            return;
          }
          this.removeAttribute('data-static');
          this.build();
          if (typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => this.build());
            ro.observe(this._track.firstElementChild as Element);
            this.onCleanup(() => ro.disconnect());
          }
          this.inView((v) => {
            this._visible = v;
            this.sync();
          });
          this.listen(this, 'pointerenter', () => ((this._hover = true), this.sync()));
          this.listen(this, 'pointerleave', () => ((this._hover = false), this.sync()));
          this.listen(this, 'focusin', () => ((this._hover = true), this.sync()));
          this.listen(this, 'focusout', () => ((this._hover = false), this.sync()));
        }

        unmount(): void {
          this._anim?.cancel();
          this._anim = null;
          this._size = 0;
        }

        private syncClones(n: number): void {
          const track = this._track!;
          const group = track.firstElementChild as HTMLElement;
          while (track.children.length > n) track.lastElementChild!.remove();
          while (track.children.length < n) {
            const clone = group.cloneNode(true) as HTMLElement;
            clone.setAttribute('aria-hidden', 'true');
            clone.setAttribute('inert', '');
            track.append(clone);
          }
        }

        private build(): void {
          const track = this._track!;
          const group = track.firstElementChild as HTMLElement;
          const vertical = this.vertical;
          const gap = this.num('gap', 32);
          const measured = vertical ? group.offsetHeight : group.offsetWidth;
          if (!measured) return; // not laid out yet: the ResizeObserver calls back
          const size = measured + gap;
          if (this._anim && this._size === size) return;
          this._size = size;
          const box = (vertical ? this.clientHeight : this.clientWidth) || size;
          // Enough copies to cover the box twice
          this.syncClones(Math.min(50, Math.max(2, Math.ceil(box / size) + 1)));
          const progress = this._anim?.effect?.getComputedTiming().progress ?? 0;
          this._anim?.cancel();
          const axis = vertical ? 'Y' : 'X';
          const reverse = ['right', 'down'].includes(this.str('direction', 'left'));
          const frames = [{ transform: `translate${axis}(0)` }, { transform: `translate${axis}(${-size}px)` }];
          this._anim = this.motion(track, reverse ? frames.reverse() : frames, {
            duration: (Math.max(1, size) / Math.max(1, this.num('speed', 50))) * 1000,
            iterations: Infinity,
          });
          if (this._anim && progress) this._anim.currentTime = progress * Number(this._anim.effect?.getTiming().duration || 0);
          this.sync();
        }

        private sync(): void {
          const a = this._anim;
          if (!a) return;
          const stop = this.flag('paused') || !this._visible || (this._hover && this.flag('pause-on-hover'));
          if (stop && a.playState === 'running') a.pause();
          else if (!stop && a.playState === 'paused') a.play();
        }

        pause(): void {
          this.setAttribute('paused', '');
        }
        resume(): void {
          this.removeAttribute('paused');
        }

        changed(name: string): void {
          if (name === 'paused') this.sync();
          else super.changed(name);
        }
      },
    { id: 'marquee', text: css }
  );
}
