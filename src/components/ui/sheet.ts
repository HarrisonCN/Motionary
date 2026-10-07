import { defineElement, clamp, type UsaElement } from '../base';
import { createSpring, projectInertia, snapTo, rubberBand, type SpringValue } from '../physics/spring';
import { adoptVariants } from './variants';
import css from './sheet.css?raw';

/** Shared machinery of `<usa-drawer>` and `<usa-bottom-sheet>`: backdrop, focus, Esc, drag-to-dismiss. */
function makePanel(Base: any, kind: 'drawer' | 'sheet') {
  return class UsaPanel extends Base {
    static get observedAttributes(): string[] {
      return ['open', 'side'];
    }

    _pos!: SpringValue;
    _backdrop: HTMLElement | null = null;
    _return: Element | null = null;
    _drag: { id: number; start: number; origin: number; t: number; last: number; lt: number } | null = null;

    get open(): boolean {
      return this.flag('open');
    }
    set open(v: boolean) {
      this.setFlag('open', v);
    }

    /** Main axis size of the panel (px). */
    size(): number {
      const r = this.getBoundingClientRect();
      return (kind === 'sheet' || this.vertical() ? r.height : r.width) || (kind === 'sheet' ? window.innerHeight * 0.9 : 320);
    }
    vertical(): boolean {
      return kind === 'sheet' || this.str('side') === 'top' || this.str('side') === 'bottom';
    }
    /** +1 when hiding moves the panel in the positive axis direction. */
    dir(): number {
      const side = kind === 'sheet' ? 'bottom' : this.str('side', 'left');
      return side === 'left' || side === 'top' ? -1 : 1;
    }
    /** Offsets (px from fully open) the panel may rest at; the largest closes it. */
    stops(): number[] {
      return [0];
    }
    render(v: number): void {
      const axis = this.vertical() ? 'Y' : 'X';
      this.style.transform = `translate${axis}(${(v * this.dir()).toFixed(1)}px)`;
      if (this._backdrop) this._backdrop.style.opacity = String(clamp(1 - v / (this.size() || 1), 0, 1));
    }

    mount(): void {
      this.setAttribute('role', 'dialog');
      if (this.str('label')) this.setAttribute('aria-label', this.str('label'));
      if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
      this.classList.add('usa-surface');
      this._pos = createSpring({ value: this.size() * 2, spring: 'stiff', onUpdate: (v) => this.render(v), onRest: (v) => v >= this.size() - 1 && !this.open && this.afterClose() });
      if (this.open) this.show(false);
      else {
        this.hidden = true;
        this._pos.jump(this.size() * 1.2);
      }
      this.listen(document, 'keydown', (e: KeyboardEvent) => e.key === 'Escape' && this.open && this.close());
      this.listen(this, 'click', (e: MouseEvent) => (e.target as Element).closest?.('[data-close]') && this.close());
      this.listen(this, 'pointerdown', (e: PointerEvent) => this.dragStart(e));
      this.listen(this, 'pointermove', (e: PointerEvent) => this.dragMove(e));
      this.listen(this, 'pointerup', (e: PointerEvent) => this.dragEnd(e));
      this.listen(this, 'pointercancel', (e: PointerEvent) => this.dragEnd(e));
    }

    unmount(): void {
      this._pos?.stop();
      this._backdrop?.remove();
      this._backdrop = null;
    }

    changed(name: string): void {
      if (name !== 'open') return super.changed(name);
      if (this.open && this.hidden) this.show(true);
      else if (!this.open && !this.hidden) this.hide();
    }

    show(animate = true): void {
      this._return = document.activeElement;
      this.hidden = false;
      this.setAttribute('aria-modal', 'true');
      if (!this._backdrop) {
        this._backdrop = document.createElement('div');
        this._backdrop.className = 'usa-panel-backdrop';
        this._backdrop.addEventListener('click', () => this.close());
        this.before(this._backdrop);
      }
      const target = this.stops()[this.initialStop()];
      if (!animate) this._pos.jump(target);
      else {
        this._pos.jump(this.size());
        this._pos.set(target);
      }
      this.setFlag('open', true);
      this.focus({ preventScroll: true });
      this.emit('open');
    }

    initialStop(): number {
      return 0;
    }

    hide(): void {
      this._pos.set(this.size() * 1.05);
      this.emit('close');
    }

    afterClose(): void {
      this.hidden = true;
      this._backdrop?.remove();
      this._backdrop = null;
      if (this._return instanceof HTMLElement) this._return.focus({ preventScroll: true });
    }

    close(): void {
      this.setFlag('open', false);
    }

    dragStart(e: PointerEvent): void {
      const handle = kind === 'sheet' ? (e.target as Element).closest?.('[data-handle], .usa-sheet-handle') || (this.scrollTop <= 0 ? this : null) : this;
      if (!handle || (e.target as Element).closest?.('input, textarea, select, button, a, [data-no-drag]')) return;
      const p = this.vertical() ? e.clientY : e.clientX;
      this._pos.stop();
      this._drag = { id: e.pointerId, start: p, origin: this._pos.value, t: e.timeStamp, last: p, lt: e.timeStamp };
    }
    dragMove(e: PointerEvent): void {
      const d = this._drag;
      if (!d || e.pointerId !== d.id) return;
      const p = this.vertical() ? e.clientY : e.clientX;
      let v = d.origin + (p - d.start) * this.dir();
      if (v < 0) v = rubberBand(v, 200);
      d.lt = d.t;
      d.t = e.timeStamp;
      d.last = p;
      this._pos.jump(v);
    }
    dragEnd(e: PointerEvent): void {
      const d = this._drag;
      if (!d || e.pointerId !== d.id) return;
      this._drag = null;
      const moved = this._pos.value - d.origin;
      const dt = Math.max(16, d.t - d.lt) / 1000;
      const vel = Math.abs(moved) > 4 ? (moved / Math.max(dt, (e.timeStamp - (d.lt || 0)) / 1000 || 0.1)) * 0.2 : 0;
      const projected = projectInertia(this._pos.value, clamp(vel, -3000, 3000));
      const stops = [...this.stops(), this.size()];
      const to = snapTo(projected, stops);
      if (to >= this.size() - 1) this.close();
      else this._pos.set(to);
      this.emit('snap', { offset: to });
    }
  };
}

/**
 * `<usa-drawer>` — a side panel that slides in with a spring and can be
 * dragged / swiped closed. Modal: backdrop, Esc, focus returns on close.
 * Attributes: `open`, `side` (`left` default, `right`, `top`, `bottom`),
 * `label`, `variant`. Events: `usa:open`, `usa:close`. `[data-close]` closes.
 * Reduced motion: opens and closes instantly.
 */
export interface UsaDrawerElement extends UsaElement {
  open: boolean;
  show(): void;
  close(): void;
}

/**
 * `<usa-bottom-sheet>` — a draggable bottom sheet with snap points
 * (`snap="0.3,0.6,0.92"`, fractions of the viewport height; default
 * `0.5,0.92`; `start` = index of the snap it opens at, default 0), inertia and drag-down-to-dismiss. `[data-handle]` (or the
 * built-in grabber) drags it. Attributes: `open`, `snap`, `start` (initial
 * snap index), `label`, `variant`. Events: `usa:open`, `usa:close`, `usa:snap`.
 */
export interface UsaBottomSheetElement extends UsaDrawerElement {}

export function defineDrawer(tag = 'usa-drawer'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(tag, (Base) => makePanel(Base, 'drawer') as unknown as CustomElementConstructor, { id: 'sheet', text: css });
}

export function defineBottomSheet(tag = 'usa-bottom-sheet'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) => {
      const Panel = makePanel(Base, 'sheet');
      return class UsaBottomSheet extends Panel {
        static get observedAttributes(): string[] {
          return ['open', 'snap'];
        }
        mount(): void {
          if (!this.querySelector(':scope > .usa-sheet-handle')) {
            const h = document.createElement('div');
            h.className = 'usa-sheet-handle';
            h.setAttribute('aria-hidden', 'true');
            this.prepend(h);
          }
          super.mount();
        }
        size(): number {
          return (window.innerHeight || 800) * Math.max(...this.fractions());
        }
        fractions(): number[] {
          const f = this.str('snap', '0.5,0.92').split(',').map(Number).filter((n: number) => n > 0 && n <= 1);
          return f.length ? f : [0.5, 0.92];
        }
        stops(): number[] {
          const full = this.size();
          const H = window.innerHeight || 800;
          return this.fractions().map((f: number) => Math.max(0, full - f * H)).sort((a: number, b: number) => a - b);
        }
        initialStop(): number {
          const f = this.fractions();
          const pick = f[clamp(this.num('start', 0), 0, f.length - 1)];
          const target = Math.max(0, this.size() - pick * (window.innerHeight || 800));
          const s = this.stops();
          return Math.max(0, s.indexOf(target));
        }
        render(v: number): void {
          this.style.height = `${this.size()}px`;
          super.render(v);
        }
      } as unknown as CustomElementConstructor;
    },
    { id: 'sheet', text: css }
  );
}
