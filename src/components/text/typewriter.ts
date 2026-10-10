import { defineElement, srText, type UsaElement } from '../base';
import css from './typewriter.css?raw';

/**
 * `<usa-typewriter>` — types text character by character, optionally cycling
 * through several phrases (typing, pausing, deleting).
 *
 * Attributes: `text` (default: the element's text), `words` (phrases
 * separated by `|`, overrides `text`), `speed` (ms per character, 55),
 * `delete-speed` (ms, 30), `pause` (ms before deleting, 1400), `delay`
 * (ms, 0), `loop`, `cursor="false"` to hide the caret, `start`
 * (`view` | `load` | `manual`, default `view`). The full text is exposed to
 * assistive tech via `aria-label`. Event: `usa:complete` (one pass done).
 * Reduced motion: the text appears at once.
 */
export interface UsaTypewriterElement extends UsaElement {
  /** Phrases being typed. */
  readonly phrases: string[];
  start(): void;
  stop(): void;
  restart(): void;
}

export function defineTypewriter(tag = 'usa-typewriter'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaTypewriter extends Base {
        static get observedAttributes(): string[] {
          return ['text', 'words', 'start', 'speed', 'delete-speed', 'pause', 'loop', 'delay'];
        }

        private _source: string | null = null;
        private _out: HTMLElement | null = null;
        private _timer: ReturnType<typeof setTimeout> | 0 = 0;
        private _running = false;

        get phrases(): string[] {
          const words = this.getAttribute('words');
          if (words) return words.split('|').map((w) => w.trim()).filter(Boolean);
          return [this.getAttribute('text') ?? this._source ?? ''];
        }

        mount(): void {
          if (this._source === null) this._source = (this.textContent || '').trim();
          const phrases = this.phrases;
          const sr = srText(phrases.join(', '));
          this._out = document.createElement('span');
          this._out.className = 'usa-tw-text';
          this._out.setAttribute('aria-hidden', 'true');
          const caret = document.createElement('span');
          caret.className = 'usa-tw-caret';
          caret.setAttribute('aria-hidden', 'true');
          this.replaceChildren(sr, this._out, caret);
          this.toggleAttribute('data-no-cursor', this.getAttribute('cursor') === 'false');
          if (this.reduced) {
            this._out.textContent = phrases[0] || '';
            return;
          }
          const start = this.str('start', 'view');
          if (start === 'load') this.start();
          else if (start === 'view') {
            this.inView((visible) => {
              if (visible && !this._running && !this._out?.textContent) this.start();
            });
          }
        }

        unmount(): void {
          this.stop();
        }

        stop(): void {
          clearTimeout(this._timer as ReturnType<typeof setTimeout>);
          this._timer = 0;
          this._running = false;
          this.removeAttribute('data-typing');
        }

        restart(): void {
          this.stop();
          if (this._out) this._out.textContent = '';
          this.start();
        }

        start(): void {
          if (this._running || !this._out) return;
          const out = this._out;
          const phrases = this.phrases;
          if (this.reduced) {
            out.textContent = phrases[0] || '';
            return;
          }
          this._running = true;
          const speed = this.num('speed', 55);
          const del = this.num('delete-speed', 30);
          const pause = this.num('pause', 1400);
          const loop = this.flag('loop') || phrases.length > 1;
          let p = 0;
          let i = 0;
          let deleting = false;
          const tick = () => {
            const word = phrases[p] || '';
            if (!deleting) {
              i++;
              out.textContent = word.slice(0, i);
              this.setAttribute('data-typing', '');
              if (i >= word.length) {
                this.removeAttribute('data-typing');
                const last = p === phrases.length - 1;
                if (last) this.emit('complete');
                if (!loop && last) {
                  this._running = false;
                  return;
                }
                deleting = true;
                this._timer = setTimeout(tick, pause);
                return;
              }
              this._timer = setTimeout(tick, speed * (0.6 + Math.random() * 0.8));
            } else {
              i--;
              out.textContent = word.slice(0, Math.max(0, i));
              if (i <= 0) {
                deleting = false;
                p = (p + 1) % phrases.length;
                this._timer = setTimeout(tick, speed * 4);
                return;
              }
              this._timer = setTimeout(tick, del);
            }
          };
          this._timer = setTimeout(tick, this.num('delay', 0));
        }
      },
    { id: 'typewriter', text: css }
  );
}
