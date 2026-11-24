import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { list } from './kit';
import { flapSteps } from './kit-13';
import css from './motion-kit-13.css?raw';

const CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/';

/**
 * A split-flap display, like an old departures board. Each character sits on a flap that folds down through the
 * alphabet until it reaches its letter, one column slightly after the other. Set `value` to change the text, or give
 * `words` to cycle through a list. Screen readers get the plain text through a polite live region, once per change.
 * Under reduced motion the letters change without flipping.
 *
 * Attributes: `value` (the child text), `words` (comma-separated; cycles), `interval` (ms between words; 3000),
 * `length` (columns; the longest text), `charset` (letters to flip through; A–Z, 0–9 and :.-/), `speed` (ms per flap; 60).
 * Event `usa:change` ({ value }).
 */
export interface UsaSplitFlapElement extends UsaElement {
  value: string;
}

export function defineSplitFlap(tag = 'usa-split-flap'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SplitFlap extends Base {
    static get observedAttributes(): string[] { return ['value', 'words', 'interval', 'length', 'charset', 'speed']; }
    private _text = '';
    private _show?: (v: string) => void;
    get value(): string { return this.getAttribute('value') ?? this._text; }
    set value(v: string) { this.setAttribute('value', String(v ?? '')); }
    changed(name: string): void { if (name === 'value' && this._show) this._show(this.value); else super.changed(name); }
    mount(): void {
      const nodes = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
      if (!this._text) this._text = (this.textContent || '').trim();
      for (const n of nodes) n.remove();
      const words = list(this.str('words'), 30);
      const charset = (this.str('charset') || CHARSET).toUpperCase();
      const up = (s: string) => s.toUpperCase();
      const len = Math.max(1, Math.min(40, Math.round(this.num('length', Math.max(this.value.length, ...words.map((w) => w.length), 1)))));
      const speed = Math.max(20, Math.min(400, this.num('speed', 60)));
      const root = make('span', 'usa-kit usa-flap');
      root.style.setProperty('--flap-ms', `${speed}ms`);
      root.toggleAttribute('data-static', this.reduced);
      const live = make('span', 'usa-kit-sr');
      live.setAttribute('aria-live', 'polite');
      const board = make('span', 'usa-flap-board');
      board.setAttribute('aria-hidden', 'true');
      const cells = Array.from({ length: len }, () => {
        const c = make('span', 'usa-flap-cell');
        const top = make('span', 'usa-flap-top');
        const bot = make('span', 'usa-flap-bot');
        const leaf = make('span', 'usa-flap-leaf');
        const leafBack = make('span', 'usa-flap-leaf-back');
        c.append(top, bot, leaf, leafBack);
        board.append(c);
        return { c, top, bot, leaf, leafBack, ch: ' ', timer: 0 };
      });
      root.append(board, live);
      this.append(root);
      const setFace = (cell: (typeof cells)[number], ch: string) => {
        cell.ch = ch;
        cell.top.textContent = cell.bot.textContent = ch;
      };
      const flipTo = (cell: (typeof cells)[number], target: string, delay: number) => {
        clearTimeout(cell.timer);
        if (this.reduced) { setFace(cell, target); return; }
        let steps = Math.min(charset.length, flapSteps(cell.ch, target, charset));
        if (!steps) return;
        const tick = () => {
          const i = charset.indexOf(cell.ch);
          const next = steps <= 1 || i < 0 ? target : charset[(i + 1) % charset.length];
          cell.leaf.textContent = cell.ch;
          cell.leafBack.textContent = next;
          cell.top.textContent = next;
          cell.c.removeAttribute('data-flip');
          void cell.c.offsetWidth;
          cell.c.setAttribute('data-flip', '');
          cell.timer = window.setTimeout(() => { cell.bot.textContent = next; cell.ch = next; steps--; if (steps > 0) tick(); else cell.c.removeAttribute('data-flip'); }, speed);
        };
        cell.timer = window.setTimeout(tick, delay);
      };
      const show = (v: string, first = false) => {
        const text = up(String(v ?? '')).slice(0, len).padEnd(len, ' ');
        live.textContent = String(v ?? '').trim();
        cells.forEach((cell, i) => (first ? setFace(cell, text[i]) : flipTo(cell, text[i], i * 40)));
        if (!first) this.emit('change', { value: String(v ?? '') });
      };
      this._show = (v) => show(v);
      cells.forEach((c) => setFace(c, ' '));
      let started = false;
      this.inView((vis) => {
        if (!vis || started) return;
        started = true;
        show(this.value || words[0] || '', this.reduced);
      });
      let wi = 0;
      let cycle = 0;
      const interval = Math.max(800, this.num('interval', 3000));
      if (words.length > 1 && !this.reduced) {
        cycle = window.setInterval(() => {
          if (!started || document.hidden) return;
          wi = (wi + 1) % words.length;
          show(words[wi]);
        }, interval);
      }
      this.onCleanup(() => {
        clearInterval(cycle);
        cells.forEach((c) => clearTimeout(c.timer));
        root.remove();
        this.append(...nodes);
        this._show = undefined;
      });
    }
  }, { id: 'motion-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
