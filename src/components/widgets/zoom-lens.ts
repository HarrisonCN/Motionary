import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { safeImageUrl } from './kit';
import css from './parts-kit-12.css?raw';

/**
 * The background position (px) that shows the point (`x`, `y`) of a `w` × `h` image, magnified `zoom` times, in the
 * middle of a round lens `size` px wide.
 */
export function lensOffset(x: number, y: number, w: number, h: number, zoom: number, size: number): { x: number; y: number } {
  const cx = Math.min(w, Math.max(0, x)), cy = Math.min(h, Math.max(0, y));
  return { x: Math.round(size / 2 - cx * zoom), y: Math.round(size / 2 - cy * zoom) };
}

/**
 * A magnifying lens for a product photo. Move the pointer over the image (or press and drag on a touch screen) and a
 * round lens follows it, showing that spot enlarged. By keyboard: focus the image, then the arrow keys move the lens
 * (Shift for bigger steps), + and − change the zoom, Escape hides it. The lens uses the image's own `currentSrc`, so a
 * responsive image is magnified at the size the browser chose. It scales in on a spring, or just appears under reduced
 * motion.
 *
 * Attributes: `zoom` (1.5–6; 2.5), `size` (lens diameter px; 80–400; 170), `label` (Zoom).
 * Events `usa:zoom` ({ zoom }).
 */
export interface UsaZoomLensElement extends UsaElement {
  zoom: number;
}

export function defineZoomLens(tag = 'usa-zoom-lens'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ZoomLens extends Base {
    static get observedAttributes(): string[] { return ['zoom', 'size', 'label']; }
    private _z = 0;
    get zoom(): number { return this._z || Math.min(6, Math.max(1.5, this.num('zoom', 2.5))); }
    set zoom(v: number) { this.setAttribute('zoom', String(v)); }
    mount(): void {
      const img = this.querySelector('img');
      if (!img) return;
      this._z = 0;
      const size = Math.min(400, Math.max(80, this.num('size', 170)));
      const root = make('div', 'usa-kit usa-lens');
      root.tabIndex = 0;
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', `${this.str('label', 'Zoom')}: ${img.alt || ''}`.trim());
      root.setAttribute('aria-roledescription', 'zoom');
      root.style.setProperty('--size', `${size}px`);
      const lens = make('div', 'usa-lens-glass');
      lens.setAttribute('aria-hidden', 'true');
      const parent = img.parentNode!;
      const next = img.nextSibling;
      root.append(img, lens);
      this.append(root);
      root.toggleAttribute('data-static', this.reduced);
      let px = 0, py = 0, on = false;
      const draw = () => {
        const w = img.clientWidth, h = img.clientHeight;
        if (!w || !h) return;
        const src = safeImageUrl(img.currentSrc || img.src);
        if (!src) return;
        const z = this.zoom;
        const o = lensOffset(px, py, w, h, z, size);
        lens.style.backgroundImage = `url("${src.replace(/"/g, '%22')}")`;
        lens.style.backgroundSize = `${w * z}px ${h * z}px`;
        lens.style.backgroundPosition = `${o.x}px ${o.y}px`;
        lens.style.transform = `translate(${Math.min(w, Math.max(0, px)) - size / 2}px, ${Math.min(h, Math.max(0, py)) - size / 2}px)`;
      };
      const show = (v: boolean) => { on = v; root.toggleAttribute('data-on', v); if (v) draw(); };
      const at = (e: PointerEvent) => { const r = img.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; };
      this.listen(root, 'pointerenter', (e: PointerEvent) => { if (e.pointerType === 'mouse') { at(e); show(true); } });
      this.listen(root, 'pointerdown', (e: PointerEvent) => { if (e.pointerType !== 'mouse') { root.setPointerCapture?.(e.pointerId); at(e); show(true); } });
      this.listen(root, 'pointermove', (e: PointerEvent) => { if (!on) return; at(e); draw(); });
      this.listen(root, 'pointerleave', (e: PointerEvent) => { if (e.pointerType === 'mouse') show(false); });
      this.listen(root, 'pointerup', (e: PointerEvent) => { if (e.pointerType !== 'mouse') show(false); });
      this.listen(root, 'pointercancel', () => show(false));
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        const step = e.shiftKey ? 40 : 10;
        const w = img.clientWidth, h = img.clientHeight;
        if (!on && /^Arrow/.test(e.key)) { px = w / 2; py = h / 2; show(true); e.preventDefault(); return; }
        if (e.key === 'ArrowLeft') px = Math.max(0, px - step);
        else if (e.key === 'ArrowRight') px = Math.min(w, px + step);
        else if (e.key === 'ArrowUp') py = Math.max(0, py - step);
        else if (e.key === 'ArrowDown') py = Math.min(h, py + step);
        else if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_') {
          this._z = Math.min(6, Math.max(1.5, Math.round((this.zoom + (e.key === '+' || e.key === '=' ? 0.5 : -0.5)) * 10) / 10));
          this.emit('zoom', { zoom: this._z });
        } else if (e.key === 'Escape' && on) { show(false); e.preventDefault(); return; }
        else return;
        e.preventDefault();
        if (!on) show(true); else draw();
      });
      this.listen(root, 'blur', () => show(false));
      this.onCleanup(() => {
        parent.insertBefore(img, next && next.parentNode === parent ? next : null);
        root.remove();
      });
    }
  }, { id: 'parts-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
