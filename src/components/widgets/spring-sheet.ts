import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick, uid } from './micro-kit-16';
import { dampedAt, parseSnaps, sheetRest } from './damped-kit-18';
import css from './damped-kit-18.css?raw';

/**
 * A bottom sheet inside its own frame, with snap points and a damped, physical feel: it rises on a spring with a
 * short settle, follows the finger, stretches like rubber past its top snap, and a release is carried by its speed
 * to the nearest snap, or closes it when flicked down. The backdrop dims with it. The grabber is a button: Enter
 * steps through the snaps, the arrow keys move up and down, Escape closes and focus returns to the trigger.
 *
 * Content: children with `data-sheet` go in the sheet; the rest stay on the page behind it, under a trigger button.
 * Attributes: `snaps` (fractions or percentages of the frame's height; 0.5, 0.92), `open` (present to open; a number
 * opens that snap), `label` (the sheet's accessible name; Sheet), `trigger` (the trigger's text; Open sheet),
 * `feel`, `haptics`.
 * Events: `usa:snap` ({ index }, -1 when closed).
 */
export interface UsaSpringSheetElement extends UsaElement {
  /** The snap the sheet rests at, -1 when closed. */
  readonly snap: number;
  show(index?: number): void;
  close(): void;
}

export function defineSpringSheet(tag = 'usa-spring-sheet'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringSheet extends Base {
    static get observedAttributes(): string[] {
      return ['snaps', 'open', 'label', 'trigger', 'feel', 'haptics'];
    }
    private _snap = -1;
    private _seen?: string | null;
    private _source: { sheet: Node[]; page: Node[] } | null = null;
    private _go: ((i: number, user: boolean, velocity?: number) => void) | null = null;
    get snap(): number {
      return this._snap;
    }
    show(index = 0): void {
      if (this._go) this._go(index, false);
      else this._snap = Math.max(0, index);
    }
    close(): void {
      if (this._go) this._go(-1, false);
      else this._snap = -1;
    }
    mount(): void {
      if (!this._source) {
        const nodes = [...this.childNodes];
        const isSheet = (n: Node) => n.nodeType === 1 && (n as Element).hasAttribute('data-sheet');
        this._source = { sheet: nodes.filter(isSheet), page: nodes.filter((n) => !isSheet(n)) };
        nodes.forEach((n) => n.parentNode === this && this.removeChild(n));
      }
      const snaps = parseSnaps(this.getAttribute('snaps'));
      const top = snaps[snaps.length - 1];
      const attr = this.getAttribute('open');
      if (attr !== this._seen) {
        this._seen = attr;
        const n = parseInt(attr ?? '', 10);
        this._snap = attr === null ? -1 : Number.isFinite(n) ? Math.min(snaps.length - 1, Math.max(0, n)) : 0;
      }
      this._snap = Math.min(this._snap, snaps.length - 1);

      const root = make('div', 'usa-dkit usa-dsheet');
      const page = make('div', 'usa-dsheet-page');
      page.append(...this._source.page.map((n) => n.cloneNode(true)));
      const trigger = make('button', 'usa-dsheet-trigger', this.str('trigger', 'Open sheet'));
      trigger.type = 'button';
      page.append(trigger);
      const backdrop = make('div', 'usa-dsheet-backdrop');
      const sheet = make('div', 'usa-dsheet-sheet');
      sheet.id = uid('usa-dsheet');
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-label', this.str('label', 'Sheet'));
      trigger.setAttribute('aria-controls', sheet.id);
      const grab = make('button', 'usa-dsheet-grab');
      grab.type = 'button';
      grab.setAttribute('aria-label', 'Resize sheet');
      grab.append(make('span', 'usa-dsheet-bar'));
      const body = make('div', 'usa-dsheet-body');
      body.append(...this._source.sheet.map((n) => n.cloneNode(true)));
      sheet.append(grab, body);
      root.append(page, backdrop, sheet);
      this.append(root);

      let h = 0;
      const measure = () => (h = root.getBoundingClientRect().height || h || 360);
      measure();
      sheet.style.height = `${Math.round(top * 1000) / 10}%`;
      const group = hostSprings(this, { y: 0 }, (v) => {
        const shown = v.y;
        // a little extra travel as it closes, so its shadow leaves the frame too
        const tuck = Math.max(0, 1 - shown / snaps[0]) * 32;
        sheet.style.transform = `translateY(${Math.round(((top - shown) * h + tuck) * 10) / 10}px)`;
        backdrop.style.opacity = String(Math.round(Math.min(1, Math.max(0, shown / snaps[0])) * 100) / 100);
        root.style.setProperty('--usa-dsheet-shown', String(Math.round(Math.max(0, shown) * 1000) / 1000));
      });
      const paint = () => {
        const open = this._snap >= 0;
        root.toggleAttribute('data-open', open);
        trigger.setAttribute('aria-expanded', String(open));
        sheet.toggleAttribute('inert', !open);
        sheet.setAttribute('aria-hidden', String(!open));
        page.toggleAttribute('inert', open);
      };
      const go = (i: number, user: boolean, velocity = 0) => {
        measure();
        const to = i < 0 ? -1 : Math.min(snaps.length - 1, Math.max(0, i));
        const was = this._snap;
        const inside = sheet.contains(document.activeElement);
        this._snap = to;
        paint();
        group.set({ y: to < 0 ? 0 : snaps[to] }, { spring: to < 0 ? 'smooth' : { duration: 560, bounce: 0.2 }, velocity: velocity ? { y: velocity } : undefined });
        if (to !== was) {
          if (user) tick(this, to < 0 ? 4 : 8);
          if (to >= 0 && was < 0) grab.focus({ preventScroll: true });
          if (to < 0 && inside) trigger.focus({ preventScroll: true });
          this.emit('snap', { index: to });
        }
      };
      this._go = go;
      paint();
      group.jump({ y: this._snap < 0 ? 0 : snaps[this._snap] });

      this.listen(trigger, 'click', () => go(0, true));
      this.listen(backdrop, 'click', () => go(-1, true));
      this.listen(grab, 'click', () => {
        if (drag?.live) return;
        go(this._snap + 1 >= snaps.length ? 0 : this._snap + 1, true);
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        if (this._snap < 0) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          go(-1, true);
        } else if (e.target === grab && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();
          go(e.key === 'ArrowUp' ? Math.min(snaps.length - 1, this._snap + 1) : this._snap - 1, true);
        }
      });

      let drag: { id: number; y0: number; x0: number; from: number; last: number; t: number; v: number; live: boolean } | null = null;
      this.listen(sheet, 'pointerdown', (e: PointerEvent) => {
        if (this._snap < 0 || (e.pointerType === 'mouse' && e.button !== 0)) return;
        const t = e.target as Element;
        if (!grab.contains(t) && (t.closest?.('a, input, textarea, select, button, [contenteditable]') || body.scrollTop > 0)) return;
        measure();
        drag = { id: e.pointerId, y0: e.clientY, x0: e.clientX, from: group.get('y'), last: e.clientY, t: e.timeStamp, v: 0, live: false };
      });
      this.listen(sheet, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dy = e.clientY - drag.y0;
        if (!drag.live) {
          if (Math.abs(dy) < 6 || Math.abs(dy) < Math.abs(e.clientX - drag.x0)) return;
          drag.live = true;
          sheet.setAttribute('data-dragging', '');
          try {
            sheet.setPointerCapture?.(e.pointerId);
          } catch {
            /* synthetic */
          }
        }
        const dt = Math.max(1, e.timeStamp - drag.t);
        drag.v = (-(e.clientY - drag.last) / dt) * 1000;
        drag.last = e.clientY;
        drag.t = e.timeStamp;
        const raw = drag.from - dy / h;
        group.jump({ y: Math.max(0, dampedAt(raw, 0, top, 0.6)) });
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        sheet.removeAttribute('data-dragging');
        if (!d.live) {
          drag = null;
          return;
        }
        const v = d.v / h;
        go(sheetRest(group.get('y'), v, snaps), true, v);
        // the click that follows a drag on the grabber is not a step
        setTimeout(() => (drag = null), 0);
      };
      this.listen(sheet, 'pointerup', end);
      this.listen(sheet, 'pointercancel', end);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          measure();
          if (!group.animating) group.jump({ y: this._snap < 0 ? 0 : snaps[this._snap] });
        });
        ro.observe(root);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._go = null;
      });
    }
  }, { id: 'damped-kit-18', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
