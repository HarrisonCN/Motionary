import { defineElement, type UsaElement } from '../base';
import { arrowIndex, nextId } from './shared';
import css from './install-button.css?raw';

/**
 * `<usa-install-button package="motionary" managers="npm pnpm yarn bun cdn" cdn="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js">`
 * (10.1) — one-click install snippet: package-manager tabs (npm, pnpm, yarn,
 * bun, CDN), the command in a code row and a copy button that confirms with
 * a check. `package`, `dev` (dev dependency), `managers`, `cdn` (URL for the
 * CDN tab; `<script>` for .js URLs, `@import` for .css), `manager` (initial
 * tab). `command(manager)`, `copy()`; `usa:copy` `{ text, manager }`.
 */
export interface UsaInstallButtonElement extends UsaElement {
  command(manager?: string): string;
  copy(): Promise<string>;
}

const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun', 'cdn'];

export function defineInstallButton(tag = 'usa-install-button'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaInstallButton extends Base {
        static get observedAttributes(): string[] {
          return ['package', 'managers', 'cdn', 'dev', 'manager'];
        }
        private cur = 'npm';
        private list(): string[] {
          const l = this.str('managers', 'npm pnpm yarn cdn').split(/[\s,]+/).filter((m) => MANAGERS.includes(m));
          return l.length ? l : ['npm'];
        }
        command(manager = this.cur): string {
          const pkg = this.str('package', 'motionary');
          const dev = this.flag('dev');
          switch (manager) {
            case 'pnpm': return `pnpm add ${dev ? '-D ' : ''}${pkg}`;
            case 'yarn': return `yarn add ${dev ? '-D ' : ''}${pkg}`;
            case 'bun': return `bun add ${dev ? '-d ' : ''}${pkg}`;
            case 'cdn': {
              const url = this.str('cdn', `https://cdn.jsdelivr.net/npm/${pkg}/+esm`);
              return url.endsWith('.css') ? `<link rel="stylesheet" href="${url}">` : /\+esm$|\.mjs$/.test(url) ? `<script type="module">import * as m from '${url}';</script>` : `<script src="${url}"></script>`;
            }
            default: return `npm i ${dev ? '-D ' : ''}${pkg}`;
          }
        }
        mount(): void {
          const list = this.list();
          this.cur = list.includes(this.str('manager')) ? this.str('manager') : list[0];
          // 13.1.0: full tabs pattern — tabs control the command row (tabpanel), one tab stop, arrows / Home / End
          const id = nextId('usa-ib');
          this.innerHTML = `<div role="tablist" aria-label="Package manager">${list.map((m) => `<button type="button" role="tab" id="${id}-${m}" aria-controls="${id}" data-m="${m}">${m === 'cdn' ? 'CDN' : m}</button>`).join('')}</div><div class="usa-ib-row" id="${id}" role="tabpanel"><code></code><button type="button" class="usa-ib-copy" aria-live="polite">Copy</button></div>`;
          const tabs = Array.from(this.querySelectorAll<HTMLElement>('[role=tab]'));
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const i = tabs.indexOf(e.target as HTMLElement);
            const j = i < 0 ? -1 : arrowIndex(e, i, tabs.length);
            if (j < 0) return;
            e.preventDefault();
            this.cur = tabs[j].dataset.m!;
            show(true);
            tabs[j].focus();
          });
          const show = (animate = false) => {
            tabs.forEach((t) => {
              const on = t.dataset.m === this.cur;
              t.setAttribute('aria-selected', String(on));
              t.tabIndex = on ? 0 : -1;
              if (on) this.querySelector('[role=tabpanel]')?.setAttribute('aria-labelledby', t.id);
            });
            const code = this.querySelector('code') as HTMLElement;
            code.textContent = this.command();
            if (animate && !this.reduced) this.motion(code, [{ opacity: 0.25, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
          };
          this.listen(this, 'click', (e: Event) => {
            const t = e.target as HTMLElement;
            const tab = t.closest?.('[data-m]') as HTMLElement | null;
            if (tab) {
              this.cur = tab.dataset.m!;
              show(true);
            }
            if (t.closest?.('.usa-ib-copy')) this.copy();
          });
          show();
        }
        async copy(): Promise<string> {
          const text = this.command();
          try {
            await (navigator as any).clipboard?.writeText(text);
          } catch {
            /* clipboard blocked: the snippet stays selectable */
          }
          const b = this.querySelector('.usa-ib-copy') as HTMLElement | null;
          if (b) {
            b.textContent = '✓ Copied';
            b.setAttribute('data-copied', '');
            if (!this.reduced) this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(.9)', offset: 0.3 }, { transform: 'scale(1.06)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
            const id = setTimeout(() => {
              b.textContent = 'Copy';
              b.removeAttribute('data-copied');
            }, 1600);
            this.onCleanup(() => clearTimeout(id));
          }
          this.emit('copy', { text, manager: this.cur });
          return text;
        }
      }
      return UsaInstallButton as unknown as CustomElementConstructor;
    },
    { id: 'install-button', text: css }
  );
}
