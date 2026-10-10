import { defineElement, type UsaElement } from '../base';
import css from './splash.css?raw';

/**
 * `<usa-splash>` — an app splash / launch screen: shows its content (logo,
 * spinner) over the page, then leaves with `exit` (`fade` default, `scale`,
 * `slide-up`, `circle`) once the page has loaded (or when you call
 * `done()`), but never sooner than `min` ms (600) — no flash.
 * Attributes: `min`, `exit`, `manual` (wait for `done()`), `label`.
 * Events: `usa:done`. The page underneath is `aria-busy` until then.
 * Reduced motion: fades.
 */
export interface UsaSplashElement extends UsaElement {
  done(): Promise<void>;
}

export function defineSplash(tag = 'usa-splash'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaSplash extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'manual', 'min', 'exit'];
        }
        private _t0 = 0;
        private _gone = false;
        mount(): void {
          this._t0 = Date.now();
          this.setAttribute('role', 'status');
          this.setAttribute('aria-label', this.str('label', 'Loading'));
          document.body?.setAttribute('aria-busy', 'true');
          if (this.flag('manual')) return;
          if (document.readyState === 'complete') this.done();
          else this.listen(window, 'load', () => this.done(), { once: true });
        }
        async done(): Promise<void> {
          if (this._gone) return;
          this._gone = true;
          const wait = Math.max(0, this.num('min', 600) - (Date.now() - this._t0));
          if (wait) await new Promise((r) => setTimeout(r, wait));
          const exit = this.reduced ? 'fade' : this.str('exit', 'fade');
          const frames: Record<string, Keyframe[]> = {
            fade: [{ opacity: 1 }, { opacity: 0 }],
            scale: [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.15)' }],
            'slide-up': [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
            circle: [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }],
          };
          const a = this.motion(this, frames[exit] || frames.fade, { duration: this.reduced ? 200 : 550, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' });
          await a?.finished.catch(() => undefined);
          document.body?.removeAttribute('aria-busy');
          this.hidden = true;
          this.emit('done');
        }
      },
    { id: 'splash', text: css }
  );
}
