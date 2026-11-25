import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick, overdrag, uid } from './micro-kit-16';
import { swipeOpen } from './spring-kit-17';
import css from './spring-kit-17.css?raw';

const SVG = 'http://www.w3.org/2000/svg';
const TONES = ['accent', 'danger', 'ok', 'neutral'];

/**
 * A list row that swipes open to reveal actions, on springs: the row follows the finger, stretches like rubber past
 * the actions, and is flung open or shut by the speed of the release. The ⋯ button opens and closes it for the
 * keyboard and screen readers, Escape closes it, and choosing an action closes it again.
 *
 * Content: the element's children are the row's content. Attributes: `actions` (pipe-separated labels, each may end
 * with `:danger`, `:ok` or `:neutral` for its colour; Archive|Delete:danger), `open`, `label` (accessible name of the
 * ⋯ button; More actions), `disabled`, `feel`, `haptics`.
 * Events: `usa:action` ({ index, label }), `usa:toggle` ({ open }).
 */
export interface UsaSpringSwipeElement extends UsaElement {
  open: boolean;
}

export function defineSpringSwipe(tag = 'usa-spring-swipe'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringSwipe extends Base {
    static get observedAttributes(): string[] {
      return ['actions', 'open', 'label', 'disabled', 'feel', 'haptics'];
    }
    private _open = false;
    private _seen?: string | null;
    private _source: Node[] | null = null;
    private _set: ((on: boolean, user: boolean) => void) | null = null;
    get open(): boolean {
      return this._open;
    }
    set open(v: boolean) {
      if (this._set) this._set(!!v, false);
      else this._open = !!v;
    }
    mount(): void {
      if (!this._source) {
        this._source = [...this.childNodes];
        this._source.forEach((n) => n.parentNode === this && this.removeChild(n));
      }
      const attr = this.getAttribute('open');
      if (attr !== this._seen) {
        this._seen = attr;
        this._open = this.flag('open');
      }
      const disabled = this.flag('disabled');
      const defs = (this.str('actions') || 'Archive|Delete:danger').split('|').map((s) => s.trim()).filter(Boolean).slice(0, 4).map((s) => {
        const m = /^(.*?):(\w+)$/.exec(s);
        const tone = m && TONES.includes(m[2]) ? m[2] : 'accent';
        return { label: (m && TONES.includes(m[2]) ? m[1] : s).trim(), tone };
      });
      const root = make('div', 'usa-skit usa-sswipe');
      root.toggleAttribute('data-disabled', disabled);
      const acts = make('div', 'usa-sswipe-actions');
      const buttons = defs.map((d, i) => {
        const b = make('button', 'usa-sswipe-act', d.label);
        b.type = 'button';
        b.dataset.tone = d.tone;
        b.dataset.index = String(i);
        acts.append(b);
        return b;
      });
      const row = make('div', 'usa-sswipe-row');
      const body = make('div', 'usa-sswipe-body');
      body.append(...this._source.map((n) => n.cloneNode(true)));
      const more = make('button', 'usa-sswipe-more');
      more.type = 'button';
      more.disabled = disabled;
      more.setAttribute('aria-label', this.str('label', 'More actions'));
      const svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      for (const x of [5, 12, 19]) {
        const c = document.createElementNS(SVG, 'circle');
        c.setAttribute('cx', String(x));
        c.setAttribute('cy', '12');
        c.setAttribute('r', '2');
        svg.append(c);
      }
      more.append(svg);
      row.append(body, more);
      root.append(acts, row);
      this.append(root);
      const id = uid('usa-sswipe');
      acts.id = id;
      more.setAttribute('aria-controls', id);

      const dir = typeof getComputedStyle === 'function' && getComputedStyle(this).direction === 'rtl' ? 1 : -1;
      let width = 0;
      const measure = () => (width = acts.getBoundingClientRect().width || width || defs.length * 80);
      const group = hostSprings(this, { x: 0 }, (v) => {
        row.style.transform = Math.abs(v.x) < 0.05 ? '' : `translateX(${Math.round(v.x * dir * 10) / 10}px)`;
        const w = width || 1;
        buttons.forEach((b, i) => {
          const share = Math.min(1, Math.max(0, v.x / w));
          b.style.transform = `scale(${Math.round((0.7 + share * 0.3) * 1000) / 1000})`;
          b.style.opacity = String(Math.round(Math.min(1, share * 1.4 - i * 0.1) * 100) / 100);
        });
      });
      const paint = () => {
        more.setAttribute('aria-expanded', String(this._open));
        acts.toggleAttribute('inert', !this._open);
        acts.setAttribute('aria-hidden', String(!this._open));
      };
      const set = (on: boolean, user: boolean, velocity = 0) => {
        measure();
        const changed = on !== this._open;
        this._open = on;
        paint();
        group.set({ x: on ? width : 0 }, { spring: on ? 'bouncy' : 'settle', velocity: velocity ? { x: velocity } : undefined });
        if (changed && user) {
          tick(this, 6);
          this.emit('toggle', { open: on });
        }
      };
      this._set = set;
      paint();
      group.jump({ x: this._open ? measure() : 0 });

      let drag: { id: number; x0: number; y0: number; from: number; last: number; t: number; v: number; live: boolean } | null = null;
      this.listen(row, 'pointerdown', (e: PointerEvent) => {
        if (disabled || (e.pointerType === 'mouse' && e.button !== 0) || (e.target as Element).closest?.('button')) return;
        measure();
        drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: group.get('x'), last: e.clientX, t: e.timeStamp, v: 0, live: false };
      });
      this.listen(row, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = (e.clientX - drag.x0) * dir;
        if (!drag.live) {
          if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y0)) return;
          drag.live = true;
          try {
            row.setPointerCapture?.(e.pointerId);
          } catch {
            /* synthetic */
          }
        }
        const dt = Math.max(1, e.timeStamp - drag.t);
        drag.v = (((e.clientX - drag.last) * dir) / dt) * 1000;
        drag.last = e.clientX;
        drag.t = e.timeStamp;
        const raw = drag.from + dx;
        const inside = Math.min(width, Math.max(0, raw));
        group.jump({ x: inside + overdrag(raw, 0, width, Math.max(60, width)) });
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        if (!d.live) return;
        set(swipeOpen(group.get('x'), width, d.v), true, d.v);
      };
      this.listen(row, 'pointerup', end);
      this.listen(row, 'pointercancel', end);
      this.listen(more, 'click', () => {
        if (disabled) return;
        set(!this._open, true);
        if (this._open) buttons[0]?.focus({ preventScroll: true });
      });
      this.listen(acts, 'click', (e: MouseEvent) => {
        const b = (e.target as Element).closest?.('.usa-sswipe-act') as HTMLElement | null;
        if (!b || !this._open) return;
        const i = Number(b.dataset.index);
        this.emit('action', { index: i, label: defs[i].label });
        set(false, true);
        more.focus({ preventScroll: true });
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this._open) {
          e.preventDefault();
          set(false, true);
          more.focus({ preventScroll: true });
        }
      });
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          measure();
          if (this._open) group.jump({ x: width });
        });
        ro.observe(acts);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._set = null;
      });
    }
  }, { id: 'spring-kit-17', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
