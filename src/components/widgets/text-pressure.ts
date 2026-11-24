import { defineElement, raf, caf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { pressureAt } from './kit-13';
import css from './motion-kit-13.css?raw';

/**
 * A headline whose letters swell as the pointer comes near: each letter gets heavier, taller and wider by how close
 * the pointer is, so a soft bulge follows it along the word. With a variable font the weight axis is used; otherwise
 * the letters scale. Away from the pointer they ease back. Screen readers get the text once, unsplit; nothing moves
 * under reduced motion.
 *
 * Attributes: `radius` (reach in px; 160), `min-weight` (300), `max-weight` (900), `stretch` (extra height at the
 * pointer, 0–1; 0.35).
 */
export interface UsaTextPressureElement extends UsaElement {}

export function defineTextPressure(tag = 'usa-text-pressure'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class TextPressure extends Base {
    static get observedAttributes(): string[] { return ['radius', 'min-weight', 'max-weight', 'stretch']; }
    mount(): void {
      const nodes = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
      const text = (this.textContent || '').replace(/\s+/g, ' ').trim();
      for (const n of nodes) n.remove();
      const minW = Math.max(100, Math.min(900, this.num('min-weight', 300)));
      const maxW = Math.max(minW, Math.min(1000, this.num('max-weight', 900)));
      const stretch = Math.max(0, Math.min(1, this.num('stretch', 0.35)));
      const radius = Math.max(20, Math.min(1000, this.num('radius', 160)));
      const root = make('span', 'usa-kit usa-press');
      root.style.setProperty('--wmin', String(minW));
      root.toggleAttribute('data-static', this.reduced);
      const sr = make('span', 'usa-kit-sr', text);
      const vis = make('span', 'usa-press-word');
      vis.setAttribute('aria-hidden', 'true');
      const letters = [...text].map((ch) => {
        const s = make('span', ch === ' ' ? 'usa-press-gap' : 'usa-press-ch', ch === ' ' ? ' ' : ch);
        vis.append(s);
        return s;
      });
      root.append(sr, vis);
      this.append(root);
      let frame = 0;
      let pointer: { x: number; y: number } | null = null;
      const draw = () => {
        frame = 0;
        for (const s of letters) {
          if (!pointer) { s.style.removeProperty('--p'); continue; }
          const r = s.getBoundingClientRect();
          const p = pressureAt(Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2)), radius);
          s.style.setProperty('--p', p.toFixed(3));
        }
      };
      root.style.setProperty('--wmax', String(maxW));
      root.style.setProperty('--stretch', String(stretch));
      if (!this.reduced) {
        let near = false;
        this.inView((v) => { near = v; if (!v) { pointer = null; draw(); } }, { rootMargin: '200px' });
        this.listen(window, 'pointermove', (e: PointerEvent) => {
          if (!near) return;
          pointer = { x: e.clientX, y: e.clientY };
          if (!frame) frame = raf(draw, this);
        }, { passive: true });
        this.listen(document, 'pointerleave', () => { pointer = null; if (!frame) frame = raf(draw, this); });
      }
      this.onCleanup(() => {
        if (frame) caf(frame);
        root.remove();
        this.append(...nodes);
      });
    }
  }, { id: 'motion-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
