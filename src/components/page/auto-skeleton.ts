import { defineElement, type UsaElement } from '../base';
import css from './auto-skeleton.css?raw';

/**
 * `<usa-auto-skeleton loading>` — automatic skeletons: while `loading` is
 * set, every text block, image, button and input inside is drawn as a
 * shimmering placeholder of its own size — no separate skeleton markup.
 * Remove `loading` (or set `.loading = false`) and the content fades in.
 * `aria-busy` while loading. Opt elements out with `data-no-skeleton`.
 * Reduced motion: static placeholders, no shimmer or fade.
 */
export interface UsaAutoSkeletonElement extends UsaElement {
  loading: boolean;
}

export function defineAutoSkeleton(tag = 'usa-auto-skeleton'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaAutoSkeleton extends Base {
        static get observedAttributes(): string[] {
          return ['loading'];
        }
        get loading(): boolean {
          return this.flag('loading');
        }
        set loading(v: boolean) {
          this.setFlag('loading', v);
        }
        mount(): void {
          this.sync(false);
        }
        changed(): void {
          this.sync(true);
        }
        private sync(animate: boolean): void {
          if (this.loading) this.setAttribute('aria-busy', 'true');
          else {
            this.removeAttribute('aria-busy');
            if (animate && !this.reduced) this.motion(this, [{ opacity: 0.4 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
          }
        }
      },
    { id: 'auto-skeleton', text: css }
  );
}
