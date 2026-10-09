import { defineElement, type UsaElement } from '../base';
import { blobRadius } from '../fx2/organic';
import css from './organic-card.css?raw';

/**
 * `<usa-organic-card>` (8.3) — a card with a soft, living blob shape: its
 * outline slowly breathes while on screen, morphs towards the pointer on
 * hover and settles into a rounder shape on focus. A gradient `tint`
 * (`leaf` · `ocean` · `petal` · `sand`) sits behind the content. The content
 * is your own markup; `seed` picks the starting shape. Reduced motion: a
 * static blob.
 */
export interface UsaOrganicCardElement extends UsaElement {
  morph(seed?: number): void;
}

export function defineOrganicCard(tag = 'usa-organic-card'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaOrganicCard extends Base {
        static get observedAttributes(): string[] {
          return ['tint', 'seed'];
        }
        private _seed = 1;
        private _loop: Animation | null = null;
        mount(): void {
          this._seed = this.num('seed', 1);
          this.setAttribute('data-tint', ['ocean', 'petal', 'sand'].includes(this.str('tint')) ? this.str('tint') : 'leaf');
          this.style.borderRadius = blobRadius(this._seed);
          this.inView((v) => {
            this._loop?.cancel();
            this._loop = null;
            if (!v || this.reduced) return;
            const frames: Keyframe[] = [0, 1, 2, 0].map((k, i) => ({ borderRadius: blobRadius(this._seed + k), offset: i / 3 }));
            this._loop = this.motion(this, frames, { duration: 9000, iterations: Infinity, easing: 'ease-in-out' });
          });
          this.listen(this, 'pointerenter', () => this.morph(this._seed + 7));
          this.listen(this, 'pointerleave', () => this.morph(this._seed));
          this.onCleanup(() => this._loop?.cancel());
        }
        /** Morph to the blob shape of `seed` (random when omitted). */
        morph(seed = Math.random() * 100): void {
          const to = blobRadius(seed);
          const from = this.style.borderRadius || to;
          this.style.borderRadius = to;
          if (!this.reduced) this.motion(this, [{ borderRadius: from }, { borderRadius: to }], { duration: 700, easing: 'cubic-bezier(.3,1.3,.5,1)', composite: 'replace' } as KeyframeAnimationOptions);
        }
      }
      return UsaOrganicCard as unknown as CustomElementConstructor;
    },
    { id: 'organic-card', text: css }
  );
}
