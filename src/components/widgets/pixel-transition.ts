import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor } from './kit';
import { shuffleOrder } from './kit-13';
import css from './motion-kit-13.css?raw';

/**
 * Two faces that swap through a grid of pixels. The first child is the front, the second the back. On hover, focus
 * inside or a tap, square pixels blink in at random until they cover the card, the faces swap underneath, and the
 * pixels blink out again. Under reduced motion the faces cross-fade. The hidden face is `inert` and hidden from
 * assistive technology, so only what is shown can be read or reached.
 *
 * Attributes: `grid` (pixels per row, 4–30; 12), `color` (pixel colour; the accent), `duration` (ms for each half;
 * 320), `trigger` (hover, click; hover), `flipped`.
 * Event `usa:change` ({ flipped }).
 */
export interface UsaPixelTransitionElement extends UsaElement {
  flipped: boolean;
  toggle(force?: boolean): void;
}

export function definePixelTransition(tag = 'usa-pixel-transition'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class PixelTransition extends Base {
    static get observedAttributes(): string[] { return ['grid', 'color', 'duration', 'trigger', 'flipped']; }
    private _set?: (on: boolean) => void;
    get flipped(): boolean { return this.flag('flipped'); }
    set flipped(v: boolean) { this.toggleAttribute('flipped', !!v); }
    toggle(force?: boolean): void { this.flipped = force ?? !this.flipped; }
    changed(name: string): void { if (name === 'flipped' && this._set) this._set(this.flipped); else super.changed(name); }
    mount(): void {
      const faces = Array.from(this.children).filter((c) => !c.classList.contains('usa-kit')).slice(0, 2) as HTMLElement[];
      if (faces.length < 2) return;
      const root = make('div', 'usa-kit usa-pixel');
      root.toggleAttribute('data-static', this.reduced);
      const front = make('div', 'usa-pixel-face');
      const back = make('div', 'usa-pixel-face');
      front.append(faces[0]);
      back.append(faces[1]);
      const n = Math.max(4, Math.min(30, Math.round(this.num('grid', 12))));
      const ms = Math.max(80, Math.min(2000, this.num('duration', 320)));
      root.style.setProperty('--n', String(n));
      root.style.setProperty('--px-ms', `${ms}ms`);
      const c = cleanColor(this.str('color'));
      if (c) root.style.setProperty('--px', c);
      const grid = make('div', 'usa-pixel-grid');
      grid.setAttribute('aria-hidden', 'true');
      const order = shuffleOrder(n * n, n);
      for (let k = 0; k < n * n; k++) {
        const p = make('i');
        p.style.setProperty('--d', (order[k] / (n * n)).toFixed(3));
        grid.append(p);
      }
      root.append(front, back, grid);
      this.append(root);
      let shown = this.flipped;
      let timer = 0;
      const paintFaces = () => {
        front.toggleAttribute('inert', shown);
        back.toggleAttribute('inert', !shown);
        front.setAttribute('aria-hidden', String(shown));
        back.setAttribute('aria-hidden', String(!shown));
        root.toggleAttribute('data-back', shown);
      };
      paintFaces();
      const set = (on: boolean) => {
        if (on === shown && !timer) return;
        clearTimeout(timer);
        if (this.reduced) { shown = on; timer = 0; paintFaces(); this.emit('change', { flipped: on }); return; }
        root.setAttribute('data-cover', '');
        timer = window.setTimeout(() => {
          shown = on;
          paintFaces();
          root.removeAttribute('data-cover');
          timer = 0;
          this.emit('change', { flipped: on });
        }, ms * 1.4);
      };
      this._set = set;
      const hover = this.str('trigger', 'hover') !== 'click';
      const want = (on: boolean) => { if (this.flipped !== on) this.flipped = on; };
      if (hover) {
        this.listen(root, 'pointerenter', (e: PointerEvent) => { if (e.pointerType !== 'touch') want(true); });
        this.listen(root, 'pointerleave', (e: PointerEvent) => { if (e.pointerType !== 'touch') want(false); });
        this.listen(root, 'focusin', () => want(true));
        this.listen(root, 'focusout', (e: FocusEvent) => { if (!root.contains(e.relatedTarget as Node)) want(false); });
      }
      this.listen(root, 'click', (e: MouseEvent) => {
        if ((e.target as Element).closest('a,button,input,select,textarea,label')) return;
        if (hover && (e as PointerEvent).pointerType && (e as PointerEvent).pointerType !== 'touch') return;
        want(!this.flipped);
      });
      this.onCleanup(() => {
        clearTimeout(timer);
        for (const f of faces) this.append(f);
        root.remove();
        this._set = undefined;
      });
    }
  }, { id: 'motion-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
