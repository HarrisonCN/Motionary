import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { ownChildren } from './kit';
import css from './parts-kit.css?raw';

/** A window position kept inside a desktop `W` × `H` so at least its title bar (`grip` px) stays reachable. */
export function clampWindow(x: number, y: number, w: number, W: number, H: number, grip = 40): { x: number; y: number } {
  const maxX = Math.max(0, W - Math.min(w, W));
  const maxY = Math.max(0, H - grip);
  return { x: Math.round(Math.min(maxX, Math.max(0, x))), y: Math.round(Math.min(maxY, Math.max(0, y))) };
}

/**
 * A little desktop of overlapping windows. Each element child becomes a window titled by its `data-title` (and sized by
 * `data-width`); drag a window by its title bar, click it to bring it to the front, close it with its × button and open
 * it again from the dock at the bottom. Windows open with a short pop and close back toward their dock button. By
 * keyboard: the title bar is a focusable handle; arrow keys move the window (Shift for 40 px), Escape closes it; the dock
 * buttons are toggle buttons (`aria-pressed` = the window in front).
 *
 * Attributes: `height` (CSS height; 420px), `label` (Desktop), `close-label` (Close).
 * Events `usa:focus` ({ index }), `usa:close` ({ index }), `usa:open` ({ index }), `usa:move` ({ index, x, y }).
 */
export interface UsaDesktopWindowsElement extends UsaElement {
  readonly active: number;
  open(index: number): void;
  close(index: number): void;
}

export function defineDesktopWindows(tag = 'usa-desktop-windows'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class DesktopWindows extends Base {
    static get observedAttributes(): string[] { return ['height', 'label', 'close-label']; }
    private _active = 0;
    private _api?: { open(i: number): void; close(i: number): void };
    get active(): number { return this._active; }
    open(index: number): void { this._api?.open(index); }
    close(index: number): void { this._api?.close(index); }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('div', 'usa-kit usa-desk');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Desktop'));
      root.style.setProperty('--h', this.str('height', '420px'));
      root.toggleAttribute('data-static', this.reduced);
      const dock = make('div', 'usa-desk-bar');
      dock.setAttribute('role', 'toolbar');
      dock.setAttribute('aria-label', this.str('label', 'Desktop'));
      let z = 1;
      const wins = kids.map((k, i) => {
        const title = k.dataset.title || `Window ${i + 1}`;
        const win = make('section', 'usa-win');
        win.id = uniqueId('usa-win');
        const w = Number(k.dataset.width);
        if (w > 0) win.style.setProperty('--w', `${Math.min(900, w)}px`);
        const bar = make('div', 'usa-win-bar');
        bar.tabIndex = 0;
        bar.setAttribute('aria-label', `${title}: move with arrow keys`);
        const name = make('h3', 'usa-win-title', title);
        name.id = `${win.id}-t`;
        name.style.margin = '0';
        win.setAttribute('aria-labelledby', name.id);
        const x = make('button', 'usa-win-btn', '×');
        x.type = 'button';
        x.setAttribute('aria-label', `${this.str('close-label', 'Close')} ${title}`);
        bar.append(name, x);
        const body = make('div', 'usa-win-body');
        body.append(k);
        win.append(bar, body);
        const task = make('button', 'usa-desk-task', title);
        task.type = 'button';
        task.setAttribute('aria-controls', win.id);
        dock.append(task);
        root.append(win);
        return { win, bar, x, task, px: 0, py: 0, open: true };
      });
      root.append(dock);
      this.append(root);
      const place = (i: number, x: number, y: number) => {
        const s = wins[i];
        const at = clampWindow(x, y, s.win.offsetWidth || 280, root.clientWidth || 600, (root.clientHeight || 420) - 56);
        s.px = at.x; s.py = at.y;
        s.win.style.setProperty('--x', `${at.x}px`);
        s.win.style.setProperty('--y', `${at.y}px`);
      };
      const front = (i: number, tell = true) => {
        const s = wins[i];
        if (!s?.open) return;
        s.win.style.zIndex = String(++z);
        const changed = this._active !== i;
        this._active = i;
        wins.forEach((o, n) => { o.win.toggleAttribute('data-focused', n === i); o.task.setAttribute('aria-pressed', String(n === i && o.open)); });
        if (tell && changed) this.emit('focus', { index: i });
      };
      const pop = (s: (typeof wins)[number], opening: boolean): Animation | null => {
        if (this.reduced) return null;
        const t = s.task.getBoundingClientRect(), r = s.win.getBoundingClientRect();
        const dx = t.left + t.width / 2 - (r.left + r.width / 2), dy = t.top - r.top;
        const away = { transform: `translate3d(${s.px + dx}px, ${s.py + dy}px, 0) scale(.2)`, opacity: 0 };
        const here = { transform: `translate3d(${s.px}px, ${s.py}px, 0) scale(1)`, opacity: 1 };
        return this.motion(s.win, opening ? [away, here] : [here, away], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
      };
      const open = (i: number) => {
        const s = wins[i];
        if (!s) return;
        if (!s.open) {
          s.open = true;
          s.win.hidden = false;
          s.task.removeAttribute('data-closed');
          pop(s, true);
          this.emit('open', { index: i });
        }
        front(i);
        s.bar.focus();
      };
      const close = (i: number) => {
        const s = wins[i];
        if (!s?.open) return;
        s.open = false;
        s.task.setAttribute('data-closed', '');
        const a = pop(s, false);
        const hide = () => { if (!s.open) s.win.hidden = true; };
        if (a) a.finished.then(hide, hide); else hide();
        s.task.setAttribute('aria-pressed', 'false');
        this.emit('close', { index: i });
        const next = wins.map((o, n) => ({ o, n })).filter(({ o }) => o.open).sort((p, q) => Number(q.o.win.style.zIndex) - Number(p.o.win.style.zIndex))[0];
        if (next) front(next.n);
        s.task.focus();
      };
      this._api = { open, close };
      wins.forEach((s, i) => {
        place(i, 24 + i * 36, 18 + i * 30);
        this.listen(s.win, 'pointerdown', () => front(i));
        this.listen(s.win, 'focusin', () => front(i));
        this.listen(s.x, 'click', () => close(i));
        this.listen(s.task, 'click', () => (s.open && this._active === i ? close(i) : open(i)));
        let drag: { id: number; ox: number; oy: number } | null = null;
        this.listen(s.bar, 'pointerdown', (e: PointerEvent) => {
          if (e.button !== 0 || (e.target as Element).closest('button')) return;
          drag = { id: e.pointerId, ox: e.clientX - s.px, oy: e.clientY - s.py };
          s.bar.setPointerCapture?.(e.pointerId);
          s.bar.setAttribute('data-drag', '');
        });
        this.listen(s.bar, 'pointermove', (e: PointerEvent) => { if (drag && e.pointerId === drag.id) place(i, e.clientX - drag.ox, e.clientY - drag.oy); });
        const drop = () => { if (!drag) return; drag = null; s.bar.removeAttribute('data-drag'); this.emit('move', { index: i, x: s.px, y: s.py }); };
        this.listen(s.bar, 'pointerup', drop);
        this.listen(s.bar, 'pointercancel', drop);
        this.listen(s.bar, 'keydown', (e: KeyboardEvent) => {
          const d = e.shiftKey ? 40 : 10;
          const by: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] };
          if (e.key === 'Escape') { e.preventDefault(); close(i); return; }
          if (!(e.key in by)) return;
          e.preventDefault();
          place(i, s.px + by[e.key][0], s.py + by[e.key][1]);
          this.emit('move', { index: i, x: s.px, y: s.py });
        });
      });
      this.onCleanup(() => {
        this.append(...kids);
        root.remove();
        this._api = undefined;
      });
      if (wins.length) front(Math.min(this._active, wins.length - 1), false);
    }
  }, { id: 'parts-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
