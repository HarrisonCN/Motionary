import { defineElement, type UsaElement } from '../base';
import css from './terminal.css?raw';

/**
 * `<usa-terminal title="zsh">` (8.2) — a retro terminal window: child lines
 * `<p data-cmd>npm i motionary</p>` are typed after the `prompt` (default
 * `$`) character by character with a blinking block cursor, other children
 * print as output, one after another, when the window scrolls into view.
 * `speed` (ms per character), `theme` (`dark` · `green` · `amber`), `loop`;
 * `replay()`, `skip()`; `usa:done`. A labelled `log` region; reduced motion:
 * everything is shown at once.
 */
export interface UsaTerminalElement extends UsaElement {
  replay(): void;
  skip(): void;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineTerminal(tag = 'usa-terminal'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaTerminal extends Base {
        static get observedAttributes(): string[] {
          return ['title', 'prompt', 'theme', 'speed'];
        }
        private _lines: { cmd: boolean; text: string }[] = [];
        private _timer = 0 as unknown as ReturnType<typeof setTimeout>;
        private _run = 0;
        mount(): void {
          const src = Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part')) as HTMLElement[];
          if (src.length) this._lines = src.map((c) => ({ cmd: c.hasAttribute('data-cmd'), text: (c.textContent || '').replace(/\s+$/, '') }));
          src.forEach((c) => c.remove());
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('data-theme', ['green', 'amber'].includes(this.str('theme')) ? this.str('theme') : 'dark');
          this.insertAdjacentHTML(
            'beforeend',
            `<div class="usa-term" data-usa-part><div class="usa-term-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(this.str('title', 'terminal'))}</span></div><div class="usa-term-body" role="log" aria-label="${esc(this.str('title', 'Terminal'))}"></div></div>`
          );
          let started = false;
          this.inView((v) => {
            if (v && !started) {
              started = true;
              this.replay();
            }
          }, { threshold: 0.3 });
          this.onCleanup(() => clearTimeout(this._timer));
        }
        private line(l: { cmd: boolean; text: string }): HTMLElement {
          const body = this.querySelector('.usa-term-body') as HTMLElement;
          const p = document.createElement('p');
          p.className = l.cmd ? 'usa-term-cmd' : 'usa-term-out';
          if (l.cmd) p.innerHTML = `<span class="usa-term-ps" aria-hidden="true">${esc(this.str('prompt', '$'))} </span><span class="usa-term-tx"></span>`;
          body.appendChild(p);
          return p;
        }
        /** Clear and type everything again. */
        replay(): void {
          clearTimeout(this._timer);
          const run = ++this._run;
          const body = this.querySelector('.usa-term-body');
          if (!body) return;
          body.textContent = '';
          if (this.reduced) return this.skip();
          const speed = Math.max(5, this.num('speed', 45));
          let i = 0;
          const next = () => {
            if (run !== this._run || !this.isConnected) return;
            body.querySelectorAll('.usa-term-cursor').forEach((c) => c.remove());
            const l = this._lines[i++];
            if (!l) {
              const last = this.line({ cmd: true, text: '' });
              last.insertAdjacentHTML('beforeend', '<span class="usa-term-cursor" aria-hidden="true"></span>');
              this.emit('done');
              if (this.flag('loop')) this._timer = setTimeout(() => this.replay(), 2500);
              return;
            }
            const p = this.line(l);
            if (!l.cmd) {
              p.textContent = l.text;
              this.motion(p, [{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
              this._timer = setTimeout(next, 120);
              return;
            }
            const tx = p.querySelector('.usa-term-tx') as HTMLElement;
            const cur = document.createElement('span');
            cur.className = 'usa-term-cursor';
            cur.setAttribute('aria-hidden', 'true');
            p.appendChild(cur);
            let k = 0;
            const type = () => {
              if (run !== this._run) return;
              tx.textContent = l.text.slice(0, ++k);
              if (k < l.text.length) this._timer = setTimeout(type, speed * (0.6 + Math.random() * 0.8));
              else this._timer = setTimeout(next, 350);
            };
            this._timer = setTimeout(type, 250);
          };
          next();
        }
        /** Show every line at once. */
        skip(): void {
          clearTimeout(this._timer);
          this._run++;
          const body = this.querySelector('.usa-term-body');
          if (!body) return;
          body.textContent = '';
          for (const l of this._lines) {
            const p = this.line(l);
            if (l.cmd) (p.querySelector('.usa-term-tx') as HTMLElement).textContent = l.text;
            else p.textContent = l.text;
          }
          this.emit('done');
        }
      }
      return UsaTerminal as unknown as CustomElementConstructor;
    },
    { id: 'terminal', text: css }
  );
}
