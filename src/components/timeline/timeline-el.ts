import { defineElement, type UsaElement } from '../base';
import { timeline, TIMELINE_PRESETS, type Timeline } from './core';
import css from './timeline.css?raw';

/**
 * `<usa-timeline>` — declarative choreography. Every descendant with
 * `data-tl="<preset>"` becomes a step, in document order; `data-at`
 * (`'-=200'`, `'<'`, `'label+=100'`, ms), `data-duration` and `data-label`
 * fine-tune it.
 *
 * Attributes: `trigger` (`view` default · `click` · `manual`), `scrub`
 * (progress follows scroll instead of playing), `overlap` (ms each step
 * overlaps the previous, default 0), `duration` (600), `stagger` (ms),
 * `repeat` (replay every time it enters the viewport). 4.1: `scrub` runs on native
 * ScrollTimeline / ViewTimeline when supported (`data-native` is set); `scrub="scroll"`
 * and `smooth` tune it (5.0: `scrub="js"` removed — the JS engine is automatic). Methods: `play()`,
 * `reverse()`, `seek(t)`; property `timeline`. Event `usa:complete`.
 * Reduced motion: steps appear in their final state.
 */
export interface UsaTimelineElement extends UsaElement {
  readonly timeline: Timeline | null;
  play(): Promise<void>;
  reverse(): Promise<void>;
  seek(to: number | string): void;
}

export function defineTimeline(tag = 'usa-timeline'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaTimeline extends Base {
        static get observedAttributes(): string[] {
          return ['scrub', 'trigger', 'overlap', 'duration', 'stagger', 'smooth', 'repeat'];
        }
        private _tl: Timeline | null = null;

        get timeline(): Timeline | null {
          return this._tl;
        }

        play(): Promise<void> {
          return this._tl ? this._tl.play(0).then(() => void this.emit('complete')) : Promise.resolve();
        }

        reverse(): Promise<void> {
          return this._tl ? this._tl.reverse() : Promise.resolve();
        }

        seek(to: number | string): void {
          this._tl?.seek(to);
        }

        mount(): void {
          const overlap = this.num('overlap', 0);
          const tl = (this._tl = timeline({ defaults: { duration: this.num('duration', 600), stagger: this.num('stagger', 0) } }));
          this.querySelectorAll<HTMLElement>('[data-tl]').forEach((el, i) => {
            if (el.dataset.label) tl.label(el.dataset.label);
            const name = el.dataset.tl || 'fade';
            tl.to(el, TIMELINE_PRESETS[name] ? name : 'fade', {
              at: el.dataset.at ?? (i && overlap ? `-=${overlap}` : undefined),
              duration: el.dataset.duration ? Number(el.dataset.duration) : undefined,
            });
          });
          this.onCleanup(() => tl.cancel());
          if (this.reduced) {
            tl.seek(tl.duration);
            return;
          }
          if (this.flag('scrub')) {
            // 4.1: native ScrollTimeline / ViewTimeline when available; `smooth`
            // (0–0.95) or `scrub="js"` opt into the JS engine, `scrub="scroll"`
            // follows this element's own scroll position.
            const v = this.str('scrub');
            const stop = tl.scrub(this, { smooth: this.num('smooth', 0), engine: 'auto', source: v === 'scroll' ? 'scroll' : 'view' });
            this.toggleAttribute('data-native', stop.native);
            this.onCleanup(stop);
            return;
          }
          const trigger = this.str('trigger', 'view');
          if (trigger === 'click') {
            // 4.0.1: show the finished composition until the first click
            // (it used to sit invisible at t=0); Enter / Space replay it too.
            tl.seek(tl.duration);
            this.listen(this, 'click', () => void this.play());
            this.listen(this, 'keydown', (e: KeyboardEvent) => {
              if (e.target === this && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                void this.play();
              }
            });
            if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
            return;
          }
          tl.seek(0);
          if (trigger === 'view') {
            let played = false;
            this.inView((v) => {
              if (v && (!played || this.flag('repeat'))) {
                played = true;
                void this.play();
              } else if (!v && this.flag('repeat')) tl.seek(0);
            }, { threshold: 0.2 });
          }
        }

        unmount(): void {
          this._tl = null;
        }
      },
    { id: 'timeline', text: css }
  );
}
