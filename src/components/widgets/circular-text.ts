import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { cleanColor } from './kit';
import css from './motion-kit-13.css?raw';

/** An SVG path for a full circle of radius `r` centred at (cx, cy), starting at the top and going clockwise. */
export function circlePath(r: number, cx = 50, cy = 50): string {
  return `M${cx},${cy - r}a${r},${r} 0 1,1 0,${2 * r}a${r},${r} 0 1,1 0,${-2 * r}`;
}

/**
 * Text set around a circle that turns slowly, like a badge or a "scroll down" seal. The text comes from `text` (it is
 * repeated with a separator to fill the ring); the children sit in the middle, so a link or icon can live there.
 * Hovering slows it down, speeds it up or reverses it (`hover`). It stops off screen and under reduced motion. The ring
 * is decorative; the text is also given once as plain text for screen readers.
 *
 * Attributes: `text`, `separator` (" • "), `duration` (seconds per turn; 16), `direction` (cw, ccw; cw), `hover` (slow,
 * fast, reverse, pause, none; slow), `size` (px; 140), `color`.
 */
export interface UsaCircularTextElement extends UsaElement {}

export function defineCircularText(tag = 'usa-circular-text'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class CircularText extends Base {
    static get observedAttributes(): string[] { return ['text', 'separator', 'duration', 'direction', 'hover', 'size', 'color']; }
    mount(): void {
      const kids = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
      const text = this.str('text', 'Motionary').trim() || 'Motionary';
      const sep = this.str('separator', ' • ');
      const size = Math.max(60, Math.min(480, this.num('size', 140)));
      const root = make('div', 'usa-kit usa-ctext');
      root.style.setProperty('--size', `${size}px`);
      root.style.setProperty('--dur', `${Math.max(2, Math.min(120, this.num('duration', 16)))}s`);
      root.dataset.dir = this.str('direction') === 'ccw' ? 'ccw' : 'cw';
      const hover = this.str('hover', 'slow');
      root.dataset.hover = ['slow', 'fast', 'reverse', 'pause', 'none'].includes(hover) ? hover : 'slow';
      const c = cleanColor(this.str('color'));
      if (c) root.style.setProperty('--ctext', c);
      root.toggleAttribute('data-static', this.reduced);
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('class', 'usa-ctext-ring');
      const id = uniqueId('usa-ctext');
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('id', id);
      path.setAttribute('d', circlePath(40));
      path.setAttribute('fill', 'none');
      const t = document.createElementNS(ns, 'text');
      const tp = document.createElementNS(ns, 'textPath');
      tp.setAttribute('href', `#${id}`);
      tp.setAttribute('textLength', String(Math.round(2 * Math.PI * 40 - 1)));
      tp.setAttribute('lengthAdjust', 'spacing');
      // repeat the phrase until it is long enough to go round without huge gaps
      const unit = text + sep;
      const reps = Math.max(1, Math.min(8, Math.round(40 / Math.max(4, unit.length))));
      tp.textContent = unit.repeat(reps);
      t.append(tp);
      svg.append(path, t);
      const sr = make('span', 'usa-kit-sr', text);
      const mid = make('div', 'usa-ctext-mid');
      mid.append(...kids);
      root.append(svg, mid, sr);
      this.append(root);
      this.inView((v) => root.toggleAttribute('data-paused', !v));
      this.onCleanup(() => { this.append(...kids); root.remove(); });
    }
  }, { id: 'motion-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
