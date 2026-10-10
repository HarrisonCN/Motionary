import { defineElement, type UsaElement } from '../base';
import { clampN, ownChildren, part } from './shared';
import css from './compare.css?raw';

/**
 * `<usa-compare>` (6.5) — before / after image compare slider. The first
 * child is "before", the second "after" (images, videos or any element).
 * Drag the handle (or anywhere with `hover`), click to jump, or use the
 * keyboard (it is a `role="slider"`: arrows, Page Up / Down, Home / End).
 * `position` (0–100, default 50), `orientation="horizontal | vertical"`,
 * `intro` plays a short sweep when it scrolls into view, `labels="Before,
 * After"`. Event `usa:change` (`{ position }`). Reduced motion: no intro
 * sweep or eased jumps.
 */
export interface UsaCompareElement extends UsaElement {
  position: number;
}

export function defineCompare(tag = 'usa-compare'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaCompare extends Base {
        static get observedAttributes(): string[] {
          return ['orientation', 'labels', 'label', 'position', 'hover', 'intro'];
        }
        private _p = 50;
        private _after: HTMLElement | null = null;
        private _handle: HTMLElement | null = null;

        get position(): number {
          return this._p;
        }
        set position(v: number) {
          this.set(v, false);
        }

        private get vertical(): boolean {
          return this.str('orientation', 'horizontal') === 'vertical';
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const [before, after] = ownChildren(this);
          this.dataset.orientation = this.vertical ? 'vertical' : 'horizontal';
          before?.classList.add('usa-cmp-before');
          after?.classList.add('usa-cmp-after');
          this._after = after || null;
          const [lb, la] = this.str('labels', '').split(',').map((s) => s.trim());
          if (lb) this.append(Object.assign(part('span', 'usa-cmp-label usa-cmp-label-b', { 'aria-hidden': 'true' }), { textContent: lb }));
          if (la) this.append(Object.assign(part('span', 'usa-cmp-label usa-cmp-label-a', { 'aria-hidden': 'true' }), { textContent: la }));
          const h = part('span', 'usa-cmp-handle', { 'aria-hidden': 'true' }, '<span class="usa-cmp-knob"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>');
          this.append(h);
          this._handle = h;
          this.setAttribute('role', 'slider');
          this.tabIndex = 0;
          this.setAttribute('aria-valuemin', '0');
          this.setAttribute('aria-valuemax', '100');
          this.setAttribute('aria-orientation', this.vertical ? 'vertical' : 'horizontal');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Compare before and after'));
          this.set(this.num('position', 50), false);
          let drag = false;
          const at = (e: PointerEvent) => {
            const r = this.getBoundingClientRect();
            return this.vertical ? ((e.clientY - r.top) / (r.height || 1)) * 100 : ((e.clientX - r.left) / (r.width || 1)) * 100;
          };
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            drag = true;
            this.setPointerCapture?.(e.pointerId);
            this.set(at(e), true, !(e.target as Element).closest('.usa-cmp-handle'));
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (drag || this.flag('hover')) this.set(at(e), true);
          });
          const up = () => (drag = false);
          this.listen(this, 'pointerup', up);
          this.listen(this, 'pointercancel', up);
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const map: Record<string, number> = { ArrowLeft: -2, ArrowDown: -2, ArrowRight: 2, ArrowUp: 2, PageDown: -10, PageUp: 10 };
            if (this.vertical) Object.assign(map, { ArrowDown: 2, ArrowUp: -2 });
            if (e.key === 'Home') this.set(0, true);
            else if (e.key === 'End') this.set(100, true);
            else if (e.key in map) this.set(this._p + map[e.key], true);
            else return;
            e.preventDefault();
          });
          if (this.flag('intro') && !this.reduced) {
            let played = false;
            this.inView((v) => {
              if (!v || played) return;
              played = true;
              const end = this._p;
              const t0 = performance.now();
              // 13.1.0: the intro loop stops on disconnect / re-mount (it kept painting a detached element)
              let id = 0;
              const step = (now: number) => {
                const k = Math.min(1, (now - t0) / 1400);
                this.paint(end + Math.sin(k * Math.PI * 2) * 22 * (1 - k));
                if (k < 1) id = requestAnimationFrame(step);
                else this.paint(end);
              };
              if (typeof requestAnimationFrame === 'function') {
                id = requestAnimationFrame(step);
                this.onCleanup(() => cancelAnimationFrame(id));
              }
            }, { threshold: 0.5 });
          }
        }

        private paint(p: number): void {
          const v = clampN(p, 0, 100);
          if (this._after) this._after.style.clipPath = this.vertical ? `inset(${v}% 0 0 0)` : `inset(0 0 0 ${v}%)`;
          if (this._handle) this._handle.style[this.vertical ? 'top' : 'left'] = `${v}%`;
          this.style.setProperty('--usa-cmp', `${v}%`);
        }

        private set(p: number, user: boolean, ease = false): void {
          const v = Math.round(clampN(p, 0, 100) * 10) / 10;
          const from = this._p;
          this._p = v;
          this.setAttribute('aria-valuenow', String(Math.round(v)));
          this.setAttribute('aria-valuetext', `${Math.round(v)}%`);
          if (ease && !this.reduced && this._after && this._handle) {
            const prop = this.vertical ? 'top' : 'left';
            const clip = (x: number) => (this.vertical ? `inset(${x}% 0 0 0)` : `inset(0 0 0 ${x}%)`);
            this.motion(this._after, [{ clipPath: clip(from) }, { clipPath: clip(v) }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
            this.motion(this._handle, [{ [prop]: `${from}%` }, { [prop]: `${v}%` }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
          }
          this.paint(v);
          if (user && from !== v) this.emit('change', { position: v });
        }
      }
      return UsaCompare as unknown as CustomElementConstructor;
    },
    { id: 'compare', text: css }
  );
}
