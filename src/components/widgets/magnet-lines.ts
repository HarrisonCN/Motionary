import { defineElement, raf, caf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor } from './kit';
import { angleTo } from './kit-13';
import css from './motion-kit-13.css?raw';

/**
 * A field of short lines that turn to point at the pointer, like iron filings around a magnet; lines near the pointer
 * also grow a little. Without a pointer (or on touch after the finger lifts) they settle back to a resting angle.
 * The children sit on top. One frame is drawn per pointer move at most, and nothing moves under reduced motion.
 *
 * Attributes: `rows` (3–30; 9), `columns` (3–40; 12), `color` (the ink, faded), `angle` (resting angle in degrees; -30),
 * `length` (line length in px; 18).
 */
export interface UsaMagnetLinesElement extends UsaElement {}

export function defineMagnetLines(tag = 'usa-magnet-lines'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class MagnetLines extends Base {
    static get observedAttributes(): string[] { return ['rows', 'columns', 'color', 'angle', 'length']; }
    mount(): void {
      const kids = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
      const rows = Math.max(3, Math.min(30, Math.round(this.num('rows', 9))));
      const cols = Math.max(3, Math.min(40, Math.round(this.num('columns', 12))));
      const rest = this.num('angle', -30);
      const root = make('div', 'usa-kit usa-mlines');
      root.style.setProperty('--rows', String(rows));
      root.style.setProperty('--cols', String(cols));
      root.style.setProperty('--len', `${Math.max(6, Math.min(60, this.num('length', 18)))}px`);
      root.style.setProperty('--rest', `${rest}deg`);
      const c = cleanColor(this.str('color'));
      if (c) root.style.setProperty('--line', c);
      root.toggleAttribute('data-static', this.reduced);
      const field = make('div', 'usa-mlines-field');
      field.setAttribute('aria-hidden', 'true');
      const lines = Array.from({ length: rows * cols }, () => {
        const l = make('i');
        field.append(l);
        return l;
      });
      const body = make('div', 'usa-mlines-body');
      body.append(...kids);
      root.append(field, body);
      this.append(root);
      let frame = 0;
      let target: { x: number; y: number } | null = null;
      const draw = () => {
        frame = 0;
        const r = field.getBoundingClientRect();
        const w = r.width / cols, h = r.height / rows;
        const reach = Math.max(r.width, r.height) * 0.5 || 1;
        lines.forEach((l, k) => {
          if (!target) { l.style.removeProperty('--a'); l.style.removeProperty('--s'); return; }
          const cx = (k % cols + 0.5) * w, cy = (Math.floor(k / cols) + 0.5) * h;
          l.style.setProperty('--a', `${angleTo(cx, cy, target.x, target.y) + 90}deg`);
          const near = Math.max(0, 1 - Math.hypot(target.x - cx, target.y - cy) / reach);
          l.style.setProperty('--s', (1 + near * 0.6).toFixed(2));
        });
      };
      const later = () => { if (!frame) frame = raf(draw, this); };
      if (!this.reduced) {
        this.listen(root, 'pointermove', (e: PointerEvent) => {
          const r = field.getBoundingClientRect();
          target = { x: e.clientX - r.left, y: e.clientY - r.top };
          root.setAttribute('data-live', '');
          later();
        });
        this.listen(root, 'pointerleave', () => { target = null; root.removeAttribute('data-live'); later(); });
        this.listen(root, 'pointerup', (e: PointerEvent) => { if (e.pointerType === 'touch') { target = null; root.removeAttribute('data-live'); later(); } });
      }
      this.onCleanup(() => {
        if (frame) caf(frame);
        this.append(...kids);
        root.remove();
      });
    }
  }, { id: 'motion-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
