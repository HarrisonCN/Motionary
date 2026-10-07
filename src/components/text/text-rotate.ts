import { defineElement, srText, EASE_SPRING, EASE_OUT, type UsaElement } from '../base';
import css from './text-rotate.css?raw';

/**
 * `<usa-text-rotate>` — cycles through words in place ("Build *fast* /
 * *small* / *typed* apps"). All words share one grid cell, so the width is
 * that of the longest word and nothing around it reflows.
 *
 * Attributes: `words` (separated by `|`, default: the element's text split
 * on `|`), `interval` (ms, 2200), `effect` (`slide` | `fade` | `flip` |
 * `blur`, default `slide`), `paused`. Pauses while off-screen and on hover
 * is not needed. Event: `usa:change` (`detail.index`, `detail.word`).
 * Reduced motion: words still change, without movement (fade only).
 */
export interface UsaTextRotateElement extends UsaElement {
  readonly index: number;
  next(): void;
}

export function defineTextRotate(tag = 'usa-text-rotate'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaTextRotate extends Base {
        static get observedAttributes(): string[] {
          return ['words', 'interval', 'paused'];
        }

        private _source: string | null = null;
        private _index = 0;
        private _timer: ReturnType<typeof setInterval> | 0 = 0;
        private _visible = true;

        get index(): number {
          return this._index;
        }

        private get words(): string[] {
          return (this.getAttribute('words') ?? this._source ?? '').split('|').map((w) => w.trim()).filter(Boolean);
        }

        mount(): void {
          if (this._source === null) this._source = (this.textContent || '').trim();
          const words = this.words;
          this.replaceChildren(
            srText(words.join(', ')),
            ...words.map((w, i) => {
              const s = document.createElement('span');
              s.className = 'usa-rotate-word';
              s.textContent = w;
              s.setAttribute('aria-hidden', 'true');
              if (i !== this._index) s.setAttribute('data-hidden', '');
              return s;
            })
          );
          if (this._index >= words.length) this._index = 0;
          if (words.length < 2) return;
          this.inView((v) => (this._visible = v));
          if (!this.flag('paused')) {
            this._timer = setInterval(() => {
              if (this._visible && !(typeof document !== 'undefined' && document.hidden)) this.next();
            }, Math.max(400, this.num('interval', 2200)));
          }
        }

        unmount(): void {
          clearInterval(this._timer as ReturnType<typeof setInterval>);
          this._timer = 0;
        }

        next(): void {
          const els = Array.from(this.querySelectorAll<HTMLElement>('.usa-rotate-word'));
          if (els.length < 2) return;
          const prev = els[this._index];
          this._index = (this._index + 1) % els.length;
          const cur = els[this._index];
          prev.setAttribute('data-hidden', '');
          cur.removeAttribute('data-hidden');
          const effect = this.reduced ? 'fade' : this.str('effect', 'slide');
          const [inFrom, outTo] =
            effect === 'fade'
              ? [{ opacity: 0 }, { opacity: 0 }]
              : effect === 'flip'
                ? [{ opacity: 0, transform: 'perspective(400px) rotateX(-90deg)' }, { opacity: 0, transform: 'perspective(400px) rotateX(90deg)' }]
                : effect === 'blur'
                  ? [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 0, filter: 'blur(8px)' }]
                  : [{ opacity: 0, transform: 'translateY(0.8em)' }, { opacity: 0, transform: 'translateY(-0.8em)' }];
          const neutral = { opacity: 1, transform: 'none', filter: 'none' };
          const pick = (f: Keyframe) => Object.fromEntries(Object.keys(f).map((k) => [k, (neutral as any)[k]]));
          this.motion(prev, [{ ...pick(outTo) }, outTo], { duration: 380, easing: EASE_OUT });
          this.motion(cur, [inFrom, pick(inFrom)], { duration: 520, easing: effect === 'slide' ? EASE_SPRING : EASE_OUT });
          this.emit('change', { index: this._index, word: cur.textContent });
        }
      },
    { id: 'text-rotate', text: css }
  );
}
