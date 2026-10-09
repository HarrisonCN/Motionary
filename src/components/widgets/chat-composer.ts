import { defineElement, type UsaElement } from '../base';
import css from './chat-composer.css?raw';

/**
 * `<usa-chat-composer>` (7.8) — an AI chat input: the textarea grows with its
 * text (up to `rows` lines, default 6), Enter sends (Shift+Enter = new line),
 * the send button pops when there is text and morphs into a Stop button while
 * `busy` — then a soft "thinking" glow runs round the composer. Sending emits
 * `usa:send` { text } (cancelable — call `preventDefault()` to keep the text)
 * and clears it; Stop emits `usa:stop`. `placeholder`, `label`, `send()`,
 * `clear()`, `value`. Reduced motion: no glow, no pop.
 */
export interface UsaChatComposerElement extends UsaElement {
  value: string;
  busy: boolean;
  send(): boolean;
  clear(): void;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineChatComposer(tag = 'usa-chat-composer'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaChatComposer extends Base {
        static get observedAttributes(): string[] {
          return ['placeholder', 'label', 'rows', 'busy'];
        }
        private get area(): HTMLTextAreaElement | null {
          return this.querySelector('.usa-cc-input');
        }
        get value(): string {
          return this.area?.value ?? '';
        }
        set value(v: string) {
          const a = this.area;
          if (!a) return;
          a.value = v;
          this.sync();
        }
        get busy(): boolean {
          return this.flag('busy');
        }
        set busy(on: boolean) {
          this.setFlag('busy', on);
        }
        mount(): void {
          const keep = this.area?.value ?? this.str('value');
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const label = this.str('label', 'Message');
          this.insertAdjacentHTML(
            'beforeend',
            `<div class="usa-cc" data-usa-part><span class="usa-cc-glow" aria-hidden="true"></span><textarea class="usa-cc-input" rows="1" aria-label="${esc(label)}" placeholder="${esc(this.str('placeholder', 'Ask anything…'))}"></textarea><button type="button" class="usa-cc-send" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="usa-cc-arrow" d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/><rect class="usa-cc-stop" x="7" y="7" width="10" height="10" rx="2"/></svg></button></div>`
          );
          const a = this.area as HTMLTextAreaElement;
          a.value = keep;
          this.listen(a, 'input', () => this.sync());
          this.listen(a, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
              e.preventDefault();
              if (!this.busy) this.send();
            }
          });
          this.listen(this.querySelector('.usa-cc-send') as Element, 'click', () => {
            if (this.busy) {
              this.emit('stop');
              this.busy = false;
            } else this.send();
          });
          this.sync(true);
          this.state();
        }
        changed(name: string): void {
          if (name === 'busy') return this.state();
          super.changed(name);
        }
        private state(): void {
          const b = this.querySelector('.usa-cc-send') as HTMLElement | null;
          if (!b) return;
          b.setAttribute('aria-label', this.busy ? 'Stop generating' : 'Send');
          this.setFlag('data-busy', this.busy);
          this.sync(true);
        }
        private sync(quiet = false): void {
          const a = this.area;
          if (!a) return;
          const max = Math.max(1, Math.round(this.num('rows', 6)));
          a.style.height = 'auto';
          const lh = parseFloat(getComputedStyle(a).lineHeight) || 20;
          const h = a.scrollHeight;
          if (h > 0) a.style.height = `${Math.min(h, lh * max + 16)}px`;
          const had = this.hasAttribute('data-ready');
          const ready = !!a.value.trim() || this.busy;
          this.setFlag('data-ready', ready);
          if (ready && !had && !quiet && !this.reduced) this.motion(this.querySelector('.usa-cc-send') as Element, [{ transform: 'scale(.6)' }, { transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 260, easing: 'ease-out' });
        }
        /** Emits `usa:send` with the trimmed text and clears it (unless prevented). */
        send(): boolean {
          const text = this.value.trim();
          if (!text) return false;
          if (!this.emit('send', { text })) return false;
          this.clear();
          return true;
        }
        clear(): void {
          this.value = '';
        }
      }
      return UsaChatComposer as unknown as CustomElementConstructor;
    },
    { id: 'chat-composer', text: css }
  );
}
