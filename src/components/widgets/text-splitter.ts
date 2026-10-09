import { defineElement, type UsaElement } from '../base';
import { runtimeModule } from './runtime-link';
import { requireModule } from '../../runtime/registry';
import type { CoreApi } from '../../runtime/index';
import type { TextApi, SplitResult } from '../../runtime/text';
import type { Playable } from '../../runtime/tween';
import css from './text-splitter.css?raw';

/**
 * `<usa-text-splitter split="chars" effect="rise" stagger="30">Hello world</usa-text-splitter>`
 * (10.3) — splits its text into characters, words or lines with
 * **`motionary/runtime/text`** (requires `use(text)` first) and animates the
 * pieces in with a runtime stagger when it scrolls into view. Accessible: the
 * element keeps an `aria-label` with the full text. `split` (chars | words |
 * lines), `effect` (rise | fade | blur | flip | wave), `stagger` (ms),
 * `duration` (ms), `loop` (replay every few seconds), `trigger` (view | load | hover).
 * `replay()`, `pieces()`; `usa:split`, `usa:done`.
 */
export interface UsaTextSplitterElement extends UsaElement {
  replay(): void;
  pieces(): HTMLElement[];
}

const FROM: Record<string, Record<string, string | number>> = {
  rise: { y: '0.9em', opacity: 0 },
  fade: { opacity: 0 },
  blur: { opacity: 0, filter: 'blur(8px)', scale: 1.3 },
  flip: { rotate: -90, opacity: 0, y: '0.4em' },
  wave: { y: '-0.6em', opacity: 0, scale: 0.6 },
};
const TO: Record<string, Record<string, string | number>> = {
  rise: { y: '0em', opacity: 1 },
  fade: { opacity: 1 },
  blur: { opacity: 1, filter: 'blur(0px)', scale: 1 },
  flip: { rotate: 0, opacity: 1, y: '0em' },
  wave: { y: '0em', opacity: 1, scale: 1 },
};

export function defineTextSplitter(tag = 'usa-text-splitter'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaTextSplitter extends Base {
        static get observedAttributes(): string[] {
          return ['split', 'effect', 'stagger', 'duration', 'loop', 'trigger'];
        }
        private res: SplitResult | null = null;
        private anim: Playable | null = null;
        pieces(): HTMLElement[] {
          const r = this.res;
          if (!r) return [];
          const by = this.str('split', 'chars');
          return by === 'lines' && r.lines.length ? r.lines : by === 'words' ? r.words : r.chars;
        }
        mount(): void {
          const tx = runtimeModule<TextApi>(this, 'text');
          if (!tx) return;
          const by = this.str('split', 'chars');
          this.res = tx.splitText(this, { type: by === 'lines' ? 'words,lines' : by === 'words' ? 'words' : 'chars,words' });
          this.emit('split', { count: this.pieces().length });
          this.onCleanup(() => {
            this.anim?.kill();
            this.res?.revert();
            this.res = null;
          });
          const trig = this.str('trigger', 'view');
          if (trig === 'load') this.replay();
          else if (trig === 'hover') this.listen(this, 'pointerenter', () => this.replay());
          else {
            this.pieces().forEach((p) => (p.style.opacity = this.reduced ? '' : '0'));
            this.inView((v) => v && !this.anim && this.replay());
          }
          if (this.flag('loop')) {
            const id = setInterval(() => this.replay(), Math.max(2500, this.num('duration', 600) + this.num('stagger', 30) * this.pieces().length + 1500));
            this.onCleanup(() => clearInterval(id));
          }
        }
        replay(): void {
          const pieces = this.pieces();
          if (!pieces.length) return;
          this.anim?.kill();
          if (this.reduced) {
            pieces.forEach((p) => (p.style.opacity = ''));
            this.emit('done');
            return;
          }
          const core = requireModule<CoreApi>('core');
          const fx = FROM[this.str('effect', 'rise')] ? this.str('effect', 'rise') : 'rise';
          this.anim = core.tween(pieces, { from: FROM[fx], to: TO[fx], duration: this.num('duration', 600), stagger: this.num('stagger', 30), ease: fx === 'wave' ? 'back-out' : 'cubic-out', onComplete: () => this.emit('done') });
        }
      }
      return UsaTextSplitter as unknown as CustomElementConstructor;
    },
    { id: 'text-splitter', text: css }
  );
}
