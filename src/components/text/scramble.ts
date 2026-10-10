import { defineElement, srText, raf, caf, now, type UsaElement } from '../base';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\?!';

/**
 * `<usa-scramble>` — "decodes" text out of random glyphs, left to right.
 *
 * Attributes: `text` (default: the element's text), `duration` (ms, 900),
 * `chars` (glyph set), `trigger` (`view` | `hover` | `load` | `manual`,
 * default `view`). Spaces and punctuation stay in place. Uses a monospace-
 * friendly fixed width per glyph only if you style it so; the element sets
 * nothing that causes reflow beyond its own text. Event: `usa:complete`.
 * Reduced motion: shows the final text.
 */
export interface UsaScrambleElement extends UsaElement {
  play(): Promise<void>;
}

/** One frame of the scramble: the first `progress` share is resolved. */
export function scrambleFrame(text: string, progress: number, glyphs = GLYPHS, rnd: () => number = Math.random): string {
  const done = Math.floor(text.length * progress);
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += i < done || /\s|[.,:;!?'"()\-–—]/.test(ch) ? ch : glyphs[Math.floor(rnd() * glyphs.length)];
  }
  return out;
}

export function defineScramble(tag = 'usa-scramble'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaScramble extends Base {
        static get observedAttributes(): string[] {
          return ['text', 'trigger', 'duration', 'chars'];
        }

        private _source: string | null = null;
        private _out: HTMLElement | null = null;
        private _frame = 0;

        private get text(): string {
          return this.getAttribute('text') ?? this._source ?? '';
        }

        mount(): void {
          if (this._source === null) this._source = (this.textContent || '').trim();
          this._out = document.createElement('span');
          this._out.setAttribute('aria-hidden', 'true');
          this._out.textContent = this.text;
          this.replaceChildren(srText(this.text), this._out);
          if (this.reduced) return;
          const trigger = this.str('trigger', 'view');
          if (trigger === 'load') this.play();
          else if (trigger === 'hover') {
            this.listen(this, 'pointerenter', () => this.play());
            this.listen(this, 'focusin', () => this.play());
          } else if (trigger === 'view') {
            let played = false;
            this.inView((v) => {
              if (v && !played) {
                played = true;
                this.play();
              }
            });
          }
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
        }

        play(): Promise<void> {
          caf(this._frame);
          const out = this._out;
          const text = this.text;
          if (!out || this.reduced) {
            if (out) out.textContent = text;
            return Promise.resolve();
          }
          const duration = this.num('duration', 900);
          const glyphs = this.str('chars', GLYPHS) || GLYPHS;
          const t0 = now();
          let last = -1;
          return new Promise((resolve) => {
            const step = () => {
              const p = Math.min(1, Math.max(0, now() - t0) / duration);
              // ~30 fps glyph churn is plenty and halves DOM writes
              const bucket = Math.floor(p * duration / 33);
              if (bucket !== last || p === 1) {
                last = bucket;
                out.textContent = p === 1 ? text : scrambleFrame(text, p, glyphs);
              }
              if (p < 1) this._frame = raf(step);
              else {
                this._frame = 0;
                this.emit('complete');
                resolve();
              }
            };
            this._frame = raf(step);
          });
        }
      },
    undefined
  );
}
