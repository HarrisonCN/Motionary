import { defineElement, EASE_OUT, type UsaElement } from '../base';
import css from './skeleton.css?raw';

/**
 * `<usa-skeleton>` — shimmering placeholders while content loads. With
 * `loading`, it shows `lines` bars (or one block of `width` × `height`,
 * or a `circle`) and hides its children; remove `loading` and the real
 * content fades in.
 *
 * Attributes: `loading`, `lines` (3), `width`, `height` (CSS lengths),
 * `circle`, `radius`, `avatar` (circle + lines, like a list row).
 * `aria-busy` follows `loading`. Reduced motion: no shimmer sweep.
 */
export interface UsaSkeletonElement extends UsaElement {
  loading: boolean;
}

export function defineSkeleton(tag = 'usa-skeleton'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaSkeleton extends Base {
        static get observedAttributes(): string[] {
          return ['loading', 'lines', 'width', 'height', 'circle', 'avatar', 'radius'];
        }

        private _ph: HTMLElement | null = null;

        get loading(): boolean {
          return this.hasAttribute('loading');
        }
        set loading(v: boolean) {
          this.toggleAttribute('loading', !!v);
        }

        changed(name: string): void {
          if (name === 'loading') this.sync(true);
          else {
            this._ph?.remove();
            this._ph = null;
            this.sync(false);
          }
        }

        mount(): void {
          this.sync(false);
        }

        private build(): HTMLElement {
          const ph = document.createElement('div');
          ph.className = 'usa-skeleton-ph';
          ph.setAttribute('aria-hidden', 'true');
          const bone = (cls = '') => {
            const b = document.createElement('span');
            b.className = `usa-bone ${cls}`.trim();
            return b;
          };
          const radius = this.getAttribute('radius');
          if (radius) this.style.setProperty('--usa-skeleton-radius', radius);
          if (this.flag('circle') || this.hasAttribute('width') || this.hasAttribute('height')) {
            const b = bone(this.flag('circle') ? 'usa-bone-circle' : 'usa-bone-block');
            b.style.width = this.str('width', this.flag('circle') ? this.str('height', '48px') : '100%');
            b.style.height = this.str('height', this.flag('circle') ? b.style.width : '120px');
            ph.append(b);
          } else {
            if (this.flag('avatar')) ph.append(bone('usa-bone-circle usa-bone-avatar'));
            const col = document.createElement('div');
            col.className = 'usa-bone-lines';
            const n = Math.max(1, Math.min(20, this.num('lines', 3)));
            for (let i = 0; i < n; i++) col.append(bone(i === n - 1 && n > 1 ? 'usa-bone-last' : ''));
            ph.append(col);
          }
          return ph;
        }

        private sync(animate: boolean): void {
          const loading = this.loading;
          this.setAttribute('aria-busy', String(loading));
          if (loading) {
            if (!this._ph) {
              this._ph = this.build();
              this.prepend(this._ph);
            }
            return;
          }
          if (this._ph) {
            this._ph.remove();
            this._ph = null;
          }
          if (animate && !this.reduced) {
            for (const kid of Array.from(this.children)) {
              this.motion(kid, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: EASE_OUT });
            }
          }
          this.emit('loaded');
        }
      },
    { id: 'skeleton', text: css }
  );
}
