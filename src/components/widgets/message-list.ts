import { defineElement, type UsaElement } from '../base';
import css from './message-list.css?raw';

export interface ChatMessage {
  text: string;
  from?: string;
  me?: boolean;
  time?: string;
}

/**
 * `<usa-message-list>` (7.4) — a chat thread. Messages come from `<p>`
 * children (`data-me`, `data-from`, `data-time`) or `push(msg)`: each new
 * bubble pops in from its side, consecutive bubbles from the same sender are
 * grouped, and the list sticks to the bottom (smooth scroll) unless the
 * reader scrolled up — then a “↓ New messages” pill appears. `typing(name)`
 * shows an animated “… is typing” bubble until the next message (or
 * `typing(false)`). A `log` with `aria-live="polite"`. Reduced motion: no pop
 * or smooth scroll, the typing dots are static.
 */
export interface UsaMessageListElement extends UsaElement {
  readonly messages: ChatMessage[];
  push(msg: ChatMessage): void;
  typing(who: string | false): void;
}

export function defineMessageList(tag = 'usa-message-list'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMessageList extends Base {
        private _msgs: ChatMessage[] = [];
        get messages(): ChatMessage[] {
          return this._msgs.map((m) => ({ ...m }));
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const seed = Array.from(this.querySelectorAll<HTMLElement>(':scope > p'));
          this._msgs = [];
          this.insertAdjacentHTML('beforeend', '<ol class="usa-ml-list" data-usa-part role="log" aria-live="polite"></ol><button type="button" class="usa-ml-new" data-usa-part hidden>↓ New messages</button>');
          (this.querySelector('.usa-ml-list') as HTMLElement).setAttribute('aria-label', this.str('label', 'Messages'));
          seed.forEach((p) => {
            p.hidden = true;
            this.add({ text: p.textContent || '', me: p.hasAttribute('data-me'), from: p.dataset.from, time: p.dataset.time }, false);
          });
          const list = this.querySelector('.usa-ml-list') as HTMLElement;
          const pill = this.querySelector('.usa-ml-new') as HTMLElement;
          this.listen(list, 'scroll', () => this.atBottom() && (pill.hidden = true));
          this.listen(pill, 'click', () => this.toBottom(true));
          this.toBottom(false);
        }

        private atBottom(): boolean {
          const l = this.querySelector('.usa-ml-list') as HTMLElement;
          return l.scrollHeight - l.scrollTop - l.clientHeight < 24;
        }
        private toBottom(smooth: boolean): void {
          const l = this.querySelector('.usa-ml-list') as HTMLElement;
          if (typeof l.scrollTo === 'function') l.scrollTo({ top: l.scrollHeight, behavior: smooth && !this.reduced ? 'smooth' : 'auto' });
          else l.scrollTop = l.scrollHeight;
          (this.querySelector('.usa-ml-new') as HTMLElement).hidden = true;
        }

        private add(m: ChatMessage, animate: boolean): void {
          const list = this.querySelector('.usa-ml-list') as HTMLElement;
          const stick = this.atBottom();
          this.typing(false);
          const prev = this._msgs[this._msgs.length - 1];
          this._msgs.push({ ...m });
          const li = document.createElement('li');
          li.className = 'usa-ml-msg';
          li.dataset.side = m.me ? 'right' : 'left';
          if (prev && !!prev.me === !!m.me && prev.from === m.from) li.dataset.grouped = '';
          li.innerHTML = '<span class="usa-ml-from"></span><span class="usa-ml-bubble"></span><time class="usa-ml-time"></time>';
          (li.querySelector('.usa-ml-from') as HTMLElement).textContent = m.me ? '' : m.from || '';
          (li.querySelector('.usa-ml-bubble') as HTMLElement).textContent = m.text;
          (li.querySelector('.usa-ml-time') as HTMLElement).textContent = m.time || '';
          list.appendChild(li);
          if (animate && !this.reduced) {
            li.style.transformOrigin = m.me ? '100% 100%' : '0 100%';
            this.motion(li, [{ transform: `translateX(${m.me ? 20 : -20}px) scale(.7)`, opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: 0.65 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1)' });
          }
          if (stick || m.me) this.toBottom(animate);
          else (this.querySelector('.usa-ml-new') as HTMLElement).hidden = false;
        }

        push(msg: ChatMessage): void {
          this.add(msg, true);
          this.emit('message', { message: { ...msg } });
        }

        typing(who: string | false): void {
          const list = this.querySelector('.usa-ml-list') as HTMLElement | null;
          if (!list) return;
          list.querySelector('.usa-ml-typing')?.remove();
          if (who === false || who === '') return;
          const li = document.createElement('li');
          li.className = 'usa-ml-msg usa-ml-typing';
          li.dataset.side = 'left';
          li.innerHTML = '<span class="usa-ml-bubble"><i></i><i></i><i></i></span>';
          li.setAttribute('aria-label', `${who} is typing`);
          list.appendChild(li);
          if (this.atBottom() || list.children.length < 3) this.toBottom(false);
        }
      }
      return UsaMessageList as unknown as CustomElementConstructor;
    },
    { id: 'message-list', text: css }
  );
}
