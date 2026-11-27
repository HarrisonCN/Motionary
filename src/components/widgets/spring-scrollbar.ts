import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings } from './micro-kit-16';
import { scrollForThumb, labelAt, thumbMetrics, frameOnce } from './fling-kit-19';
import css from './fling-kit-19.css?raw';

/**
 * A scroll area with its own slim scrollbar on a spring: the thumb trails the scroll a moment and settles, squashes
 * when a wheel or swipe pushes past an end, and fades out when the area is idle. Drag the thumb to scroll fast; a
 * bubble beside it names the section under it (children with `data-label`, or the h2 / h3 headings). A press on the
 * track pages toward it. Scrolling itself stays native, so the wheel, touch, keyboard and find-in-page work as usual;
 * the custom bar is decoration for pointers and is hidden from screen readers.
 *
 * Content: anything; it scrolls. Attributes: `height` (the area's height; 320px), `label` (the region's accessible
 * name; Scrollable content), `feel`.
 * Events: `usa:section` ({ index, label }) when the labelled section at the top changes.
 */
export interface UsaSpringScrollbarElement extends UsaElement {
  readonly scroller: HTMLElement | null;
  /** The labelled section at the top, -1 before the first. */
  readonly section: number;
}

export function defineSpringScrollbar(tag = 'usa-spring-scrollbar'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringScrollbar extends Base {
    static get observedAttributes(): string[] {
      return ['height', 'label', 'feel'];
    }
    private _box: HTMLElement | null = null;
    private _section = -1;
    private _source: Node[] | null = null;
    get scroller(): HTMLElement | null {
      return this._box;
    }
    get section(): number {
      return this._section;
    }
    mount(): void {
      if (!this._source) {
        this._source = [...this.childNodes];
        this._source.forEach((n) => n.parentNode === this && this.removeChild(n));
      }
      const root = make('div', 'usa-fkit usa-sbar');
      const box = make('div', 'usa-sbar-box');
      box.tabIndex = 0;
      box.setAttribute('role', 'region');
      box.setAttribute('aria-label', this.str('label', 'Scrollable content'));
      const h = this.str('height', '');
      if (h) box.style.height = /^\d+(\.\d+)?$/.test(h) ? `${h}px` : h;
      const content = make('div', 'usa-sbar-content');
      content.append(...this._source.map((n) => n.cloneNode(true)));
      box.append(content);
      const track = make('div', 'usa-sbar-track');
      track.setAttribute('aria-hidden', 'true');
      const thumb = make('div', 'usa-sbar-thumb');
      const bubble = make('div', 'usa-sbar-bubble');
      track.append(thumb, bubble);
      root.append(box, track);
      this.append(root);
      this._box = box;

      const labelled = (): HTMLElement[] => {
        const own = [...box.querySelectorAll<HTMLElement>('[data-label]')];
        return own.length ? own : [...box.querySelectorAll<HTMLElement>('h2, h3')];
      };
      let marks: HTMLElement[] = labelled();
      let tops: number[] = [];
      const label = (i: number) => (i < 0 ? '' : marks[i]?.getAttribute('data-label') || marks[i]?.textContent?.trim() || '');
      const readTops = () => {
        // measured from the top of the content, so the first section is current at the top
        const base = content.getBoundingClientRect().top;
        tops = marks.map((m) => m.getBoundingClientRect().top - base);
      };
      readTops();

      let trackH = 0;
      const group = hostSprings(this, { y: 0, h: 28, q: 1 }, (v) => {
        thumb.style.height = `${Math.round(v.h * 10) / 10}px`;
        thumb.style.transform = `translateY(${Math.round(v.y * 10) / 10}px) scaleY(${Math.round(Math.max(0.3, v.q) * 1000) / 1000})`;
        bubble.style.transform = `translateY(${Math.round((v.y + v.h / 2 - 13) * 10) / 10}px)`;
      });
      const metrics = () => {
        trackH = track.clientHeight || Math.max(0, box.clientHeight - 12);
        return thumbMetrics(box.scrollTop, box.scrollHeight, box.clientHeight, trackH);
      };
      let dragging = false;
      const follow = (jump = false) => {
        const m = metrics();
        root.toggleAttribute('data-scrollable', box.scrollHeight > box.clientHeight + 1);
        if (jump || dragging) group.jump({ y: m.offset, h: m.size });
        else group.set({ y: m.offset, h: m.size }, { spring: { duration: 380, bounce: 0.12 } });
        // at the very end the last section is current, however short it is
        const end = marks.length > 0 && box.scrollHeight > box.clientHeight + 1 && box.scrollTop >= box.scrollHeight - box.clientHeight - 1;
        const i = end ? marks.length - 1 : labelAt(tops, box.scrollTop);
        if (i !== this._section) {
          this._section = i;
          bubble.textContent = label(i);
          if (i >= 0) this.emit('section', { index: i, label: label(i) });
        }
      };
      let idle = 0;
      const wake = () => {
        root.setAttribute('data-active', '');
        if (idle) clearTimeout(idle);
        idle = window.setTimeout(() => {
          idle = 0;
          if (!dragging) root.removeAttribute('data-active');
        }, 900);
      };
      follow(true);
      this.listen(box, 'scroll', () => {
        follow();
        wake();
      }, { passive: true });
      this.listen(box, 'wheel', (e: WheelEvent) => {
        const max = box.scrollHeight - box.clientHeight;
        const down = e.deltaY > 0;
        if (max > 0 && ((down && box.scrollTop >= max - 1) || (!down && e.deltaY < 0 && box.scrollTop <= 0))) {
          thumb.style.transformOrigin = down ? '50% 100%' : '50% 0';
          group.impulse({ q: -Math.min(4, Math.abs(e.deltaY) / 40) }, { duration: 460, bounce: 0.45 });
          wake();
        }
      }, { passive: true });

      // the thumb: drag to scroll, the bubble names the section under it
      let grab: { id: number; dy: number } | null = null;
      this.listen(thumb, 'pointerdown', (e: PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        readTops();
        const r = track.getBoundingClientRect();
        grab = { id: e.pointerId, dy: e.clientY - r.top - group.get('y') };
        dragging = true;
        root.setAttribute('data-dragging', '');
        wake();
        try {
          thumb.setPointerCapture?.(e.pointerId);
        } catch {
          /* synthetic */
        }
      });
      this.listen(thumb, 'pointermove', (e: PointerEvent) => {
        if (!grab || e.pointerId !== grab.id) return;
        const r = track.getBoundingClientRect();
        const m = metrics();
        box.scrollTop = scrollForThumb(e.clientY - r.top - grab.dy, m.size, trackH, box.scrollHeight, box.clientHeight);
        follow(true);
      });
      const drop = (e: PointerEvent) => {
        if (!grab || e.pointerId !== grab.id) return;
        grab = null;
        dragging = false;
        root.removeAttribute('data-dragging');
        wake();
      };
      this.listen(thumb, 'pointerup', drop);
      this.listen(thumb, 'pointercancel', drop);
      this.listen(track, 'pointerdown', (e: PointerEvent) => {
        if (e.target === thumb || (e.pointerType === 'mouse' && e.button !== 0)) return;
        const r = track.getBoundingClientRect();
        const below = e.clientY - r.top > group.get('y');
        box.scrollBy({ top: (below ? 1 : -1) * box.clientHeight * 0.9, behavior: this.reduced ? 'auto' : 'smooth' });
      });
      if (typeof ResizeObserver !== 'undefined') {
        const later = frameOnce(() => {
          marks = labelled();
          readTops();
          follow(true);
        }, this);
        const ro = new ResizeObserver(() => later.ask());
        ro.observe(box);
        ro.observe(content);
        this.onCleanup(() => {
          ro.disconnect();
          later.cancel();
        });
      }
      this.onCleanup(() => {
        if (idle) clearTimeout(idle);
        group.stop();
        root.remove();
        this._box = null;
        this._section = -1;
      });
    }
  }, { id: 'fling-kit-19', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
