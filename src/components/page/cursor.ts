import { defineElement, raf, caf, type UsaElement } from '../base';
import css from './cursor.css?raw';

export const CURSOR_MODES = ['dot', 'magnetic', 'glow'] as const;
export type CursorMode = (typeof CURSOR_MODES)[number];

/**
 * `<usa-cursor mode="dot | magnetic | glow">` — a custom cursor for
 * the page (place it once, e.g. at the end of `<body>`).
 * - `dot` — a ring that follows with spring lag around the real pointer;
 * (6.0: `mode="trail"` was removed — use the registered `comet-trail` effect;
 * unknown modes render as `dot`.)
 * - `magnetic` — the ring snaps onto and wraps hovered targets (`a`,
 *   `button`, `[data-cursor]`);
 * - `glow` — a large soft light following the pointer (great on dark UIs).
 * Attributes: `mode`, `color`, `size` (px, 28), `hide-native` (hide the
 * system cursor), `targets` (selector, magnetic). Only for fine pointers
 * (mouse / pen); never on touch. Reduced motion: not rendered.
 */
export interface UsaCursorElement extends UsaElement {
  readonly active: boolean;
}

export function defineCursor(tag = 'usa-cursor'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaCursor extends Base {
        static get observedAttributes(): string[] {
          return ['mode', 'size', 'color', 'hide-native'];
        }
        private _frame = 0;
        get active(): boolean {
          return this.hasAttribute('data-active');
        }

        mount(): void {
          this.setAttribute('aria-hidden', 'true');
          const fine = typeof matchMedia !== 'function' || matchMedia('(pointer: fine)').matches || matchMedia('(hover: hover)').matches;
          if (this.reduced || !fine) {
            // Decorative only: never leave (focusable) content inside aria-hidden (4.4 audit).
            this.replaceChildren();
            return;
          }
          const m = this.str('mode', 'dot') as CursorMode;
          const mode: CursorMode = CURSOR_MODES.includes(m) ? m : 'dot';
          const n = 1;
          this.innerHTML = Array.from({ length: n }, (_, i) => `<span class="usa-cursor-${mode === 'glow' ? 'glow' : 'ring'}" style="--i:${i}"></span>`).join('') + (mode === 'glow' ? '' : '<span class="usa-cursor-dot"></span>');
          if (this.str('color')) this.style.setProperty('--usa-cursor-color', this.str('color'));
          this.style.setProperty('--usa-cursor-size', `${this.num('size', 28)}px`);
          if (this.flag('hide-native')) document.documentElement.classList.add('usa-cursor-none');
          this.onCleanup(() => document.documentElement.classList.remove('usa-cursor-none'));
          const parts = Array.from(this.querySelectorAll<HTMLElement>('.usa-cursor-ring, .usa-cursor-glow'));
          const dot = this.querySelector<HTMLElement>('.usa-cursor-dot');
          const pts = parts.map(() => ({ x: -100, y: -100 }));
          let mx = -100;
          let my = -100;
          let snap: DOMRect | null = null;
          const sel = this.str('targets', 'a, button, [role="button"], [data-cursor], input, select, textarea, label');
          const loop = () => {
            this._frame = 0;
            let tx = mx;
            let ty = my;
            pts.forEach((p, i) => {
              const k = mode === 'glow' ? 0.12 : 0.22;
              const goalX = snap && i === 0 ? snap.left + snap.width / 2 : tx;
              const goalY = snap && i === 0 ? snap.top + snap.height / 2 : ty;
              p.x += (goalX - p.x) * k;
              p.y += (goalY - p.y) * k;
              parts[i].style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
              tx = p.x;
              ty = p.y;
            });
            if (snap && parts[0]) {
              parts[0].style.width = `${snap.width + 12}px`;
              parts[0].style.height = `${snap.height + 12}px`;
            } else if (parts[0]) {
              parts[0].style.width = parts[0].style.height = '';
            }
            if (dot) dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
            const moving = pts.some((p, i) => Math.abs(p.x - (i === 0 && snap ? snap.left + snap.width / 2 : mx)) > 0.3);
            if (moving) this._frame = raf(loop);
          };
          const kick = () => {
            if (!this._frame) this._frame = raf(loop);
          };
          this.listen(document, 'pointermove', (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            mx = e.clientX;
            my = e.clientY;
            this.setAttribute('data-active', '');
            if (mode === 'magnetic') {
              const t = (e.target as Element)?.closest?.(sel);
              snap = t ? t.getBoundingClientRect() : null;
              this.toggleAttribute('data-snapped', !!t);
            } else {
              this.toggleAttribute('data-hover', !!(e.target as Element)?.closest?.(sel));
            }
            kick();
          }, { passive: true });
          this.listen(document, 'pointerdown', () => this.setAttribute('data-down', ''));
          this.listen(document, 'pointerup', () => this.removeAttribute('data-down'));
          this.listen(document.documentElement, 'pointerleave', () => this.removeAttribute('data-active'));
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
          this.removeAttribute('data-active');
        }
      },
    { id: 'cursor', text: css }
  );
}
