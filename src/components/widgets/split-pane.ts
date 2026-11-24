import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { ownChildren } from './kit';
import css from './parts-kit.css?raw';

/** A split position (percent) kept between `min` and `max` (themselves kept within 0–100), rounded to 0.1. */
export function clampSplit(pct: number, min = 10, max = 90): number {
  const lo = Math.max(0, Math.min(100, min)), hi = Math.max(lo, Math.min(100, max));
  const v = Number.isFinite(pct) ? pct : 50;
  return Math.round(Math.min(hi, Math.max(lo, v)) * 10) / 10;
}

/**
 * Two panes with a handle between them. Drag the handle (mouse, pen or touch) or focus it and use the arrow keys
 * (Shift for bigger steps), Home / End for the limits and Enter to fold the first pane to its minimum and back. Double
 * click springs back to where it started. The handle is a `role="separator"` with `aria-valuenow`, labelled and tied to
 * the first pane. The first two element children are the panes.
 *
 * Attributes: `orientation` (horizontal | vertical; horizontal = side by side), `position` (percent of the first pane;
 * 50), `min` (10), `max` (90), `step` (5), `height` (CSS height; 320px), `label` (Resize panes).
 * Event `usa:change` ({ position }) when a drag or key press ends.
 */
export interface UsaSplitPaneElement extends UsaElement {
  position: number;
}

export function defineSplitPane(tag = 'usa-split-pane'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SplitPane extends Base {
    static get observedAttributes(): string[] { return ['orientation', 'position', 'min', 'max', 'step', 'height', 'label']; }
    private _pos = NaN;
    private _apply?: (p: number, snap?: boolean) => void;
    get position(): number { return Number.isFinite(this._pos) ? this._pos : clampSplit(this.num('position', 50), this.num('min', 10), this.num('max', 90)); }
    set position(v: number) { this._apply?.(Number(v)); }
    changed(name: string): void {
      if (name === 'position') { this._pos = NaN; this._apply?.(this.num('position', 50), true); }
      else super.changed(name);
    }
    mount(): void {
      const kids = ownChildren(this).slice(0, 2);
      if (kids.length < 2) return;
      const vertical = this.str('orientation') === 'vertical';
      const min = this.num('min', 10), max = this.num('max', 90), step = Math.max(0.5, this.num('step', 5));
      const start = clampSplit(this.num('position', 50), min, max);
      const root = make('div', 'usa-kit usa-split');
      root.dataset.orientation = vertical ? 'vertical' : 'horizontal';
      root.style.setProperty('--h', this.str('height', '320px'));
      const a = make('div', 'usa-split-pane');
      const b = make('div', 'usa-split-pane');
      a.id = uniqueId('usa-split');
      a.append(kids[0]);
      b.append(kids[1]);
      const bar = make('div', 'usa-split-bar');
      bar.tabIndex = 0;
      bar.setAttribute('role', 'separator');
      bar.setAttribute('aria-orientation', vertical ? 'horizontal' : 'vertical');
      bar.setAttribute('aria-label', this.str('label', 'Resize panes'));
      bar.setAttribute('aria-controls', a.id);
      bar.setAttribute('aria-valuemin', String(clampSplit(min, min, max)));
      bar.setAttribute('aria-valuemax', String(clampSplit(max, min, max)));
      root.append(a, bar, b);
      this.append(root);
      let folded: number | null = null;
      const apply = (p: number, snap = false) => {
        const v = clampSplit(p, min, max);
        this._pos = v;
        root.toggleAttribute('data-snap', snap && !this.reduced);
        root.style.setProperty('--pos', `${v}%`);
        bar.setAttribute('aria-valuenow', String(v));
      };
      this._apply = apply;
      const tell = () => this.emit('change', { position: this.position });
      let dragging = false;
      this.listen(bar, 'pointerdown', (e: PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        dragging = true;
        bar.setPointerCapture?.(e.pointerId);
        bar.setAttribute('data-drag', '');
        bar.focus();
      });
      this.listen(bar, 'pointermove', (e: PointerEvent) => {
        if (!dragging) return;
        const r = root.getBoundingClientRect();
        const p = vertical ? ((e.clientY - r.top) / Math.max(1, r.height)) * 100 : ((e.clientX - r.left) / Math.max(1, r.width)) * 100;
        apply(p);
      });
      const end = () => { if (!dragging) return; dragging = false; bar.removeAttribute('data-drag'); folded = null; tell(); };
      this.listen(bar, 'pointerup', end);
      this.listen(bar, 'pointercancel', end);
      this.listen(bar, 'dblclick', () => { apply(start, true); tell(); });
      this.listen(bar, 'keydown', (e: KeyboardEvent) => {
        const s = e.shiftKey ? step * 3 : step;
        const back = vertical ? 'ArrowUp' : 'ArrowLeft', fwd = vertical ? 'ArrowDown' : 'ArrowRight';
        let next: number | null = null;
        if (e.key === back) next = this.position - s;
        else if (e.key === fwd) next = this.position + s;
        else if (e.key === 'Home') next = min;
        else if (e.key === 'End') next = max;
        else if (e.key === 'Enter') { if (folded === null) { folded = this.position; next = min; } else { next = folded; folded = null; } }
        if (next === null) return;
        e.preventDefault();
        apply(next, e.key === 'Enter' || e.key === 'Home' || e.key === 'End');
        tell();
      });
      this.onCleanup(() => {
        this.append(...kids);
        root.remove();
        this._apply = undefined;
      });
      apply(Number.isFinite(this._pos) ? this._pos : start);
    }
  }, { id: 'parts-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
