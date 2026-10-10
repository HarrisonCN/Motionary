import { defineElement, type UsaElement } from '../base';
import css from './loading-bar.css?raw';

/**
 * `<usa-loading-bar>` — a slim top loading bar for route changes and fetches
 * (NProgress-style): `start()` trickles towards 90 %, `done()` completes and
 * fades out, `set(0–1)` for real progress. `loadingBar` drives the first bar
 * on the page (created on demand). `role="progressbar"`, `aria-busy`.
 * Attributes: `color`, `height` (px, 3), `position` (`top` default, `bottom`).
 * Reduced motion: no trickle animation — the bar shows / hides.
 */
export interface UsaLoadingBarElement extends UsaElement {
  readonly progress: number;
  start(): void;
  set(p: number): void;
  done(): void;
}

export function defineLoadingBar(tag = 'usa-loading-bar'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaLoadingBar extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'color', 'height'];
        }
        private _p = 0;
        private _t: ReturnType<typeof setInterval> | undefined;
        private _h: ReturnType<typeof setTimeout> | undefined;
        get progress(): number {
          return this._p;
        }
        mount(): void {
          if (!this.querySelector('.usa-loading-bar-fill')) this.innerHTML = '<span class="usa-loading-bar-fill"></span>';
          this.setAttribute('role', 'progressbar');
          this.setAttribute('aria-label', this.str('label', 'Loading'));
          this.setAttribute('aria-valuemin', '0');
          this.setAttribute('aria-valuemax', '100');
          if (this.str('color')) this.style.setProperty('--usa-loading-color', this.str('color'));
          this.style.setProperty('--usa-loading-h', `${this.num('height', 3)}px`);
          this.paint();
        }
        unmount(): void {
          clearInterval(this._t);
          clearTimeout(this._h);
        }
        private paint(): void {
          this.style.setProperty('--usa-loading', this._p.toFixed(4));
          this.setAttribute('aria-valuenow', String(Math.round(this._p * 100)));
        }
        start(): void {
          clearTimeout(this._h);
          clearInterval(this._t);
          this.setAttribute('data-active', '');
          this.setAttribute('aria-busy', 'true');
          this._p = Math.max(this._p, 0.08);
          this.paint();
          this._t = setInterval(() => {
            this._p += (0.9 - this._p) * (this.reduced ? 0.5 : 0.08);
            this.paint();
          }, 200);
        }
        set(p: number): void {
          this.setAttribute('data-active', '');
          this._p = Math.max(0, Math.min(1, p));
          this.paint();
        }
        done(): void {
          clearInterval(this._t);
          this._p = 1;
          this.paint();
          this.removeAttribute('aria-busy');
          this._h = setTimeout(() => {
            this.removeAttribute('data-active');
            this._h = setTimeout(() => {
              this._p = 0;
              this.paint();
            }, 300);
          }, 250);
        }
      },
    { id: 'loading-bar', text: css }
  );
}

function bar(): UsaLoadingBarElement | null {
  if (typeof document === 'undefined') return null;
  let el = document.querySelector('usa-loading-bar') as UsaLoadingBarElement | null;
  if (!el) {
    defineLoadingBar();
    el = document.createElement('usa-loading-bar') as UsaLoadingBarElement;
    document.body.appendChild(el);
  }
  return typeof el.start === 'function' ? el : null;
}

/** Drive the page's `<usa-loading-bar>` (created on first use). */
export const loadingBar = {
  start: (): void => bar()?.start(),
  set: (p: number): void => bar()?.set(p),
  done: (): void => bar()?.done(),
  /** Run `task` with the bar shown; resolves with its result. */
  async track<T>(task: Promise<T> | (() => Promise<T>)): Promise<T> {
    bar()?.start();
    try {
      return await (typeof task === 'function' ? task() : task);
    } finally {
      bar()?.done();
    }
  },
};
