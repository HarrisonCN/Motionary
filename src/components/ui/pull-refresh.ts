import { defineElement, type UsaElement } from '../base';
import { createSpring, rubberBand, type SpringValue } from '../physics/spring';
import { adoptVariants } from './variants';
import css from './pull-refresh.css?raw';

/**
 * `<usa-pull-refresh>` — pull-to-refresh for a scroll container (itself):
 * pull down at the top (touch / pointer) and a spinner stretches in; past
 * `threshold` (px, 70) releasing fires `usa:refresh` — call
 * `event.detail.done()` (or return a promise to `onrefresh`) to finish.
 * Also exposes `refresh()` for a keyboard / button path.
 * Attributes: `threshold`, `disabled`, `label` (status text, "Refreshing").
 * Reduced motion: no stretch; the spinner simply appears while refreshing.
 */
export interface UsaPullRefreshElement extends UsaElement {
  readonly refreshing: boolean;
  refresh(): Promise<void>;
}

export function definePullRefresh(tag = 'usa-pull-refresh'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) =>
      class UsaPullRefresh extends Base {
        private _y!: SpringValue;
        private _busy = false;
        private _ind: HTMLElement | null = null;
        private _live: HTMLElement | null = null;

        get refreshing(): boolean {
          return this._busy;
        }

        private draw(v: number): void {
          const th = this.num('threshold', 70);
          this.style.setProperty('--usa-pull', `${v.toFixed(1)}px`);
          this.style.setProperty('--usa-pull-p', Math.min(1, v / th).toFixed(3));
          this.toggleAttribute('data-armed', v >= th && !this._busy);
        }

        mount(): void {
          if (!this.querySelector(':scope > .usa-pull-indicator')) {
            this._ind = document.createElement('div');
            this._ind.className = 'usa-pull-indicator';
            this._ind.setAttribute('aria-hidden', 'true');
            this._ind.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" pathLength="100"/></svg>';
            this.prepend(this._ind);
            this._live = document.createElement('span');
            this._live.className = 'usa-sr';
            this._live.setAttribute('role', 'status');
            this.append(this._live);
          }
          this._y = createSpring({ spring: 'stiff', onUpdate: (v) => this.draw(v) });
          let start: number | null = null;
          let id = -1;
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            if (this.flag('disabled') || this._busy || this.scrollTop > 0) return;
            start = e.clientY;
            id = e.pointerId;
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (start === null || e.pointerId !== id) return;
            const d = e.clientY - start;
            if (d <= 0) return;
            this._y.jump(this.reduced ? 0 : rubberBand(d, 220));
            if (this.reduced && d > this.num('threshold', 70)) this.setAttribute('data-armed', '');
          });
          const end = (e: PointerEvent) => {
            if (start === null || e.pointerId !== id) return;
            const d = e.clientY - start;
            start = null;
            const armed = this.hasAttribute('data-armed') || (!this.reduced && this._y.value >= this.num('threshold', 70)) || (this.reduced && d > this.num('threshold', 70));
            if (armed) this.refresh();
            else this._y.set(0);
          };
          this.listen(this, 'pointerup', end);
          this.listen(this, 'pointercancel', end);
        }

        unmount(): void {
          this._y?.stop();
        }

        refresh(): Promise<void> {
          if (this._busy) return Promise.resolve();
          this._busy = true;
          this.removeAttribute('data-armed');
          this.setAttribute('data-refreshing', '');
          this.setAttribute('aria-busy', 'true');
          if (this._live) this._live.textContent = this.str('label', 'Refreshing');
          this._y.set(this.reduced ? 0 : this.num('threshold', 70) * 0.8);
          return new Promise((resolve) => {
            let finished = false;
            const done = () => {
              if (finished) return;
              finished = true;
              this._busy = false;
              this.removeAttribute('data-refreshing');
              this.removeAttribute('aria-busy');
              if (this._live) this._live.textContent = '';
              this._y.set(0);
              resolve();
            };
            const ev = new CustomEvent('usa:refresh', { detail: { done }, bubbles: true, cancelable: true });
            this.dispatchEvent(ev);
            const fn = (this as any).onrefresh;
            if (typeof fn === 'function') Promise.resolve(fn(ev)).then(done, done);
          });
        }
      },
    { id: 'pull-refresh', text: css }
  );
}
