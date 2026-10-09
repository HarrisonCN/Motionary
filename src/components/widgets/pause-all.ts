import { defineElement, getClock, setClock, onClockChange, type UsaElement } from '../base';
import css from './pause-all.css?raw';

/**
 * `<usa-pause-all>` (9.5) — one button that pauses all motion on the page
 * (WCAG 2.2.2 "Pause, Stop, Hide"): it pauses Motionary's shared clock
 * (every component, effect and frame loop), every other CSS / WAAPI
 * animation in the document and autoplaying media; pressing again resumes
 * them. Stays in sync with `motionClock`. `scope` (a selector) limits it to
 * one subtree's animations and media and leaves the shared clock alone.
 * `paused`, `toggle()`;
 * `usa:pause-all` { paused }. A real `button` with `aria-pressed`.
 */
export interface UsaPauseAllElement extends UsaElement {
  readonly paused: boolean;
  toggle(): void;
}

export function definePauseAll(tag = 'usa-pause-all'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaPauseAll extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'scope', 'resume-label'];
        }
        private _held: Animation[] = [];
        private _media: HTMLMediaElement[] = [];
        private _local = false;
        private sync: () => void = () => undefined;
        private root(): Element | null {
          const s = this.str('scope');
          return s ? document.querySelector(s) : null;
        }
        get paused(): boolean {
          return this.str('scope') ? this._local : getClock().paused;
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML('beforeend', `<button type="button" class="usa-pa-btn" data-usa-part><span class="usa-pa-icon" aria-hidden="true"></span><span class="usa-pa-text"></span></button>`);
          const b = this.querySelector('.usa-pa-btn') as HTMLButtonElement;
          this.listen(b, 'click', () => this.toggle());
          this.sync = () => {
            const p = this.paused;
            b.setAttribute('aria-pressed', String(p));
            (b.querySelector('.usa-pa-text') as HTMLElement).textContent = p ? this.str('resume-label', 'Play animations') : this.str('label', 'Pause animations');
            this.setFlag('data-paused', p);
          };
          this.onCleanup(onClockChange(() => this.sync()));
          this.sync();
        }
        toggle(): void {
          const pause = !this.paused;
          const scoped = !!this.str('scope');
          const root = scoped ? this.root() : document.documentElement;
          if (!root) return;
          if (pause) {
            const all = scoped ? (root as Element).getAnimations?.({ subtree: true }) || [] : typeof document.getAnimations === 'function' ? document.getAnimations() : [];
            this._held = all.filter((a) => a.playState === 'running');
            this._held.forEach((a) => a.pause());
            this._media = Array.from(root.querySelectorAll<HTMLMediaElement>('video, audio')).filter((m) => !m.paused);
            this._media.forEach((m) => m.pause());
            root.setAttribute('data-usa-paused', '');
          } else {
            this._held.splice(0).forEach((a) => a.play());
            this._media.splice(0).forEach((m) => m.play?.()?.catch?.(() => undefined));
            root.removeAttribute('data-usa-paused');
          }
          if (scoped) {
            this._local = pause;
            this.sync();
          } else setClock({ paused: pause });
          this.emit('pause-all', { paused: pause });
        }
      }
      return UsaPauseAll as unknown as CustomElementConstructor;
    },
    { id: 'pause-all', text: css }
  );
}
