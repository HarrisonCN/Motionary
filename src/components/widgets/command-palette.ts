import { defineElement, type UsaElement } from '../base';
import css from './command-palette.css?raw';

/**
 * `<usa-command-palette>` (7.9) — a ⌘K command palette on the native
 * `<dialog>` (top layer, Esc, focus returns to the opener): it scales in,
 * the results filter as you type (fuzzy, matched letters highlighted) and
 * stagger in, a highlight glides to the active row (↑ / ↓, Enter runs it).
 * Commands come from child `<option value="id" data-group="Navigation"
 * data-keys="mod+n">Label</option>` elements or `setCommands([{ id, label,
 * group?, keys? }])`. `hotkey` (default `mod+k`; `none` to disable) opens it
 * from anywhere; `placeholder`, `label`. `show()`, `close()`, `toggle()`,
 * `opened`; `usa:run` { id, label }, `usa:open`, `usa:close`. A `combobox` +
 * `listbox`; reduced motion: no scale, stagger or glide.
 */
export interface PaletteCommand {
  id: string;
  label: string;
  group?: string;
  keys?: string;
}
export interface UsaCommandPaletteElement extends UsaElement {
  readonly opened: boolean;
  commands: PaletteCommand[];
  setCommands(list: PaletteCommand[]): void;
  show(): void;
  close(): void;
  toggle(): void;
}

/**
 * Fuzzy match: every query letter in order. Returns a score (higher is
 * better; -1 = no match) and the matched indexes (7.9).
 */
export function fuzzyMatch(query: string, text: string): { score: number; hits: number[] } {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return { score: 0, hits: [] };
  const hits: number[] = [];
  let score = 0;
  let from = 0;
  let prev = -2;
  for (const ch of q) {
    if (ch === ' ') continue;
    const i = t.indexOf(ch, from);
    if (i < 0) return { score: -1, hits: [] };
    hits.push(i);
    score += i === prev + 1 ? 3 : 1; // consecutive letters
    if (i === 0 || /[\s\-_/]/.test(t[i - 1])) score += 2; // word starts
    prev = i;
    from = i + 1;
  }
  return { score: score - t.length / 100, hits };
}

/** "mod+shift+k" → ["⌘", "⇧", "K"] on Apple platforms, ["Ctrl", "Shift", "K"] elsewhere (7.9). */
export function keyLabels(keys: string, apple = isApple()): string[] {
  const map: Record<string, [string, string]> = { mod: ['⌘', 'Ctrl'], cmd: ['⌘', '⌘'], meta: ['⌘', 'Win'], ctrl: ['⌃', 'Ctrl'], shift: ['⇧', 'Shift'], alt: ['⌥', 'Alt'], option: ['⌥', 'Alt'], enter: ['↵', 'Enter'], esc: ['Esc', 'Esc'], escape: ['Esc', 'Esc'], up: ['↑', '↑'], down: ['↓', '↓'], left: ['←', '←'], right: ['→', '→'], space: ['Space', 'Space'], tab: ['⇥', 'Tab'], backspace: ['⌫', 'Backspace'] };
  return keys
    .split('+')
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => (map[k.toLowerCase()] ? map[k.toLowerCase()][apple ? 0 : 1] : k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1)));
}

/** Does a KeyboardEvent match "mod+k"-style keys? (7.9) */
export function matchesKeys(e: KeyboardEvent, keys: string, apple = isApple()): boolean {
  const parts = keys.toLowerCase().split('+').map((k) => k.trim()).filter(Boolean);
  const key = parts.filter((p) => !['mod', 'cmd', 'meta', 'ctrl', 'shift', 'alt', 'option'].includes(p))[0];
  if (!key) return false;
  const want = { meta: false, ctrl: false, shift: parts.includes('shift'), alt: parts.includes('alt') || parts.includes('option') };
  if (parts.includes('mod')) want[apple ? 'meta' : 'ctrl'] = true;
  if (parts.includes('cmd') || parts.includes('meta')) want.meta = true;
  if (parts.includes('ctrl')) want.ctrl = true;
  const names: Record<string, string> = { esc: 'escape', space: ' ', up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' };
  const k = (e.key || '').toLowerCase();
  return k === (names[key] || key) && e.metaKey === want.meta && e.ctrlKey === want.ctrl && e.shiftKey === want.shift && e.altKey === want.alt;
}

export function isApple(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test((navigator as any).userAgentData?.platform || navigator.platform || navigator.userAgent || '');
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
let uid = 0;

export function defineCommandPalette(tag = 'usa-command-palette'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaCommandPalette extends Base {
        static get observedAttributes(): string[] {
          return ['placeholder', 'label', 'hotkey'];
        }
        private _cmds: PaletteCommand[] | null = null;
        private _id = `usa-cp-${++uid}`;
        private _active = 0;
        private _shown: PaletteCommand[] = [];
        private _opener: Element | null = null;
        get commands(): PaletteCommand[] {
          if (this._cmds) return this._cmds.slice();
          return Array.from(this.querySelectorAll(':scope > option')).map((o) => ({ id: (o as HTMLOptionElement).value || (o.textContent || '').trim(), label: (o.textContent || '').trim(), group: o.getAttribute('data-group') || undefined, keys: o.getAttribute('data-keys') || undefined }));
        }
        set commands(v: PaletteCommand[]) {
          this.setCommands(v);
        }
        setCommands(list: PaletteCommand[]): void {
          this._cmds = list.map((c) => ({ ...c, id: String(c.id), label: String(c.label) }));
          this.render();
        }
        private get dlg(): HTMLDialogElement | null {
          return this.querySelector('.usa-cp');
        }
        get opened(): boolean {
          return !!this.dlg?.hasAttribute('open');
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const id = this._id;
          this.insertAdjacentHTML(
            'beforeend',
            `<dialog class="usa-cp" data-usa-part aria-label="${esc(this.str('label', 'Command palette'))}"><div class="usa-cp-box"><input class="usa-cp-q" role="combobox" aria-expanded="true" aria-controls="${id}-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="${esc(this.str('placeholder', 'Type a command or search…'))}"><div class="usa-cp-list" id="${id}-list" role="listbox"><span class="usa-cp-hl" aria-hidden="true"></span></div><p class="usa-cp-empty" hidden>No results</p></div></dialog>`
          );
          const dlg = this.dlg as HTMLDialogElement;
          const q = this.querySelector('.usa-cp-q') as HTMLInputElement;
          this.listen(q, 'input', () => this.render(true));
          this.listen(q, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              this.move(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              this.run(this._active);
            } else if (e.key === 'Escape' && typeof dlg.showModal !== 'function') this.close();
          });
          this.listen(dlg, 'click', (e: MouseEvent) => {
            if (e.target === dlg) this.close();
          });
          this.listen(dlg, 'cancel', (e: Event) => {
            e.preventDefault();
            this.close();
          });
          const hk = this.str('hotkey', 'mod+k');
          if (hk !== 'none')
            this.listen(document, 'keydown', (e: KeyboardEvent) => {
              if (matchesKeys(e, hk)) {
                e.preventDefault();
                this.toggle();
              }
            });
          this.render();
        }
        private render(typed = false): void {
          const list = this.querySelector('.usa-cp-list');
          if (!list) return;
          const q = (this.querySelector('.usa-cp-q') as HTMLInputElement).value;
          const all = this.commands;
          const scored = all
            .map((c, i) => ({ c, i, m: fuzzyMatch(q, c.label) }))
            .filter((x) => x.m.score >= 0)
            .sort((a, b) => (q ? b.m.score - a.m.score : 0) || a.i - b.i);
          this._shown = scored.map((x) => x.c);
          this._active = 0;
          list.querySelectorAll('.usa-cp-item, .usa-cp-group').forEach((n) => n.remove());
          let html = '';
          let group: string | undefined = '\u0000';
          scored.forEach(({ c, m }, i) => {
            if (!q && c.group !== group) {
              group = c.group;
              if (group) html += `<div class="usa-cp-group" role="presentation">${esc(group)}</div>`;
            }
            const label = Array.from(c.label)
              .map((ch, j) => (m.hits.includes(j) ? `<mark>${esc(ch)}</mark>` : esc(ch)))
              .join('');
            const keys = c.keys ? `<span class="usa-cp-keys">${keyLabels(c.keys).map((k) => `<kbd>${esc(k)}</kbd>`).join('')}</span>` : '';
            html += `<div class="usa-cp-item" role="option" id="${this._id}-o${i}" data-i="${i}" aria-selected="false"><span class="usa-cp-label">${label}</span>${keys}</div>`;
          });
          list.insertAdjacentHTML('beforeend', html);
          list.querySelectorAll<HTMLElement>('.usa-cp-item').forEach((el) => {
            el.addEventListener('pointermove', () => this.select(Number(el.dataset.i)));
            el.addEventListener('click', () => this.run(Number(el.dataset.i)));
          });
          (this.querySelector('.usa-cp-empty') as HTMLElement).hidden = scored.length > 0;
          this.select(0, false);
          if (typed && !this.reduced) list.querySelectorAll('.usa-cp-item').forEach((el, i) => i < 8 && this.motion(el, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 200, delay: i * 25, easing: 'ease-out', fill: 'backwards' }));
        }
        private select(i: number, glide = true): void {
          const items = Array.from(this.querySelectorAll<HTMLElement>('.usa-cp-item'));
          const q = this.querySelector('.usa-cp-q') as HTMLInputElement | null;
          const hl = this.querySelector('.usa-cp-hl') as HTMLElement | null;
          if (!items.length || !q || !hl) {
            q?.removeAttribute('aria-activedescendant');
            if (hl) hl.style.opacity = '0';
            return;
          }
          this._active = Math.max(0, Math.min(items.length - 1, i));
          items.forEach((el, j) => el.setAttribute('aria-selected', String(j === this._active)));
          const el = items[this._active];
          q.setAttribute('aria-activedescendant', el.id);
          const to = `translateY(${el.offsetTop}px)`;
          const from = hl.style.transform;
          hl.style.opacity = '1';
          hl.style.height = `${el.offsetHeight || 36}px`;
          hl.style.transform = to;
          if (glide && from && from !== to && !this.reduced) this.motion(hl, [{ transform: from }, { transform: to }], { duration: 160, easing: 'cubic-bezier(.2,.8,.2,1)' });
          (el as any).scrollIntoView?.({ block: 'nearest' });
        }
        private move(d: number): void {
          const n = this._shown.length;
          if (n) this.select((this._active + d + n) % n);
        }
        private run(i: number): void {
          const c = this._shown[i];
          if (!c) return;
          this.emit('run', { id: c.id, label: c.label });
          this.close();
        }
        show(): void {
          const dlg = this.dlg;
          if (!dlg || this.opened) return;
          this._opener = document.activeElement;
          const q = this.querySelector('.usa-cp-q') as HTMLInputElement;
          q.value = '';
          this.render();
          if (typeof dlg.showModal === 'function') {
            try {
              dlg.showModal();
            } catch {
              dlg.setAttribute('open', '');
            }
          } else dlg.setAttribute('open', '');
          this.select(0, false);
          q.focus();
          if (!this.reduced) this.motion(this.querySelector('.usa-cp-box') as Element, [{ opacity: 0, transform: 'translateY(-8px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
          this.emit('open');
        }
        close(): void {
          const dlg = this.dlg;
          if (!dlg || !this.opened) return;
          const done = () => {
            if (typeof dlg.close === 'function' && dlg.open) dlg.close();
            dlg.removeAttribute('open');
            (this._opener as HTMLElement | null)?.focus?.();
            this.emit('close');
          };
          const a = this.reduced ? null : this.motion(this.querySelector('.usa-cp-box') as Element, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { duration: 140, easing: 'ease-in' });
          if (a) a.finished.then(done, done);
          else done();
        }
        toggle(): void {
          if (this.opened) this.close();
          else this.show();
        }
      }
      return UsaCommandPalette as unknown as CustomElementConstructor;
    },
    { id: 'command-palette', text: css }
  );
}
