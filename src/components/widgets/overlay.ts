import { defineElement, type UsaElement } from '../base';
import { ownChildren, part } from './shared';
import css from './overlay.css?raw';

/**
 * `<usa-modal>` and `<usa-sheet>` (6.3) — modal overlays on the native
 * `<dialog>` (top layer, focus trap, Esc, inert page), with animated open
 * and close and a fading, blurred backdrop.
 *
 * - `<usa-modal effect="scale | slide-up | flip | origin">` — `origin`
 *   grows the dialog out of the button that opened it.
 * - `<usa-sheet side="right | left | bottom | top">` — a side sheet; a
 *   bottom sheet can be dragged down to dismiss (`<div data-handle>` or the
 *   built-in grab handle).
 *
 * Attributes: `open` (initial), `label`, `persistent` (backdrop click / Esc
 * don't close). Any element with `data-usa-open="<id>"` opens the overlay
 * with that id; `[data-usa-close]` inside closes it. API: `show(trigger?)`,
 * `close(value?)`, `toggle()`, `opened`. Events: `usa:open`, `usa:close`
 * (`{ value }`). Focus returns to the opener. Reduced motion: no movement,
 * a short fade.
 */
export interface UsaOverlayElement extends UsaElement {
  readonly opened: boolean;
  readonly returnValue: string;
  show(trigger?: Element | null): void;
  close(value?: string): Promise<void>;
  toggle(): void;
}
export type UsaModalElement = UsaOverlayElement;
export type UsaSheetElement = UsaOverlayElement;

export const MODAL_EFFECTS = ['scale', 'slide-up', 'flip', 'origin'] as const;
export const SHEET_SIDES = ['right', 'left', 'bottom', 'top'] as const;

const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';

// one delegated listener for [data-usa-open] / [data-usa-toast] triggers anywhere on the page
let delegated = false;
export function delegateTriggers(): void {
  if (delegated || typeof document === 'undefined') return;
  delegated = true;
  document.addEventListener('click', (e) => {
    const t = (e.target as Element | null)?.closest?.('[data-usa-open]');
    if (!t) return;
    const target = document.getElementById(t.getAttribute('data-usa-open') || '') as (HTMLElement & Partial<UsaOverlayElement>) | null;
    if (target && typeof target.show === 'function') {
      e.preventDefault();
      if (target.opened) void target.close?.();
      else target.show(t);
    }
  });
}

function defineOverlay(tag: string, kind: 'modal' | 'sheet'): CustomElementConstructor | undefined {
  delegateTriggers();
  return defineElement(
    tag,
    (Base) => {
      class UsaOverlay extends Base {
        static get observedAttributes(): string[] {
          return kind === 'modal' ? ['effect'] : ['side'];
        }
        private _dlg: HTMLDialogElement | null = null;
        private _panel: HTMLElement | null = null;
        private _open = false;
        private _ret: Element | null = null;
        private _origin: DOMRect | null = null;
        private _value = '';
        private _closing: Promise<void> | null = null;

        get opened(): boolean {
          return this._open;
        }
        get returnValue(): string {
          return this._value;
        }

        mount(): void {
          let d = this.querySelector<HTMLDialogElement>(':scope > dialog.usa-ov');
          if (!d) {
            d = part('dialog', `usa-ov usa-${kind}-panel`);
            const body = part('div', 'usa-ov-body');
            body.append(...ownChildren(this));
            d.append(body);
            this.append(d);
          }
          this._dlg = d;
          this._panel = d.querySelector('.usa-ov-body');
          if (kind === 'modal') {
            const ef = this.str('effect', 'scale');
            this.dataset.effect = (MODAL_EFFECTS as readonly string[]).includes(ef) ? ef : 'scale';
          } else {
            const side = this.str('side', 'right');
            this.dataset.side = (SHEET_SIDES as readonly string[]).includes(side) ? side : 'right';
            if (this.dataset.side === 'bottom' && this._panel && !this._panel.querySelector('[data-handle]')) this._panel.prepend(part('div', 'usa-ov-grab', { 'data-handle': '', 'aria-hidden': 'true' }));
            this.drag();
          }
          if (!d.hasAttribute('aria-labelledby')) d.setAttribute('aria-label', this.str('label', kind === 'modal' ? 'Dialog' : 'Panel'));
          this.listen(d, 'cancel', (e: Event) => {
            e.preventDefault();
            if (!this.flag('persistent')) void this.close();
          });
          this.listen(d, 'click', (e: MouseEvent) => {
            const t = e.target as Element;
            const c = t.closest?.('[data-usa-close]');
            if (c) return void this.close(c.getAttribute('data-usa-close') || '');
            if (t === d && !this.flag('persistent')) void this.close(); // the ::backdrop
          });
          if (this.flag('open') && !this._open) this.show();
        }

        unmount(): void {
          if (this._open && this._dlg?.open) this._dlg.close?.();
          this._open = false;
        }

        private frames(opening: boolean): Keyframe[] {
          const fade: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
          if (this.reduced) return opening ? fade : [...fade].reverse();
          let f: Keyframe[];
          if (kind === 'sheet') {
            const s = this.dataset.side;
            const off = s === 'left' ? 'translateX(-100%)' : s === 'bottom' ? 'translateY(100%)' : s === 'top' ? 'translateY(-100%)' : 'translateX(100%)';
            f = [{ transform: off }, { transform: 'none' }];
          } else {
            const e = this.dataset.effect;
            const o = this._origin;
            const r = this._dlg?.getBoundingClientRect();
            if (e === 'origin' && o && r && r.width) {
              const dx = o.left + o.width / 2 - (r.left + r.width / 2);
              const dy = o.top + o.height / 2 - (r.top + r.height / 2);
              f = [{ transform: `translate(${dx}px,${dy}px) scale(${Math.max(0.05, o.width / r.width).toFixed(3)},${Math.max(0.05, o.height / r.height).toFixed(3)})`, opacity: 0, borderRadius: '40px' }, { transform: 'none', opacity: 1 }];
            } else if (e === 'slide-up') f = [{ transform: 'translateY(48px)', opacity: 0 }, { transform: 'none', opacity: 1 }];
            else if (e === 'flip') f = [{ transform: 'perspective(900px) rotateX(-28deg) translateY(30px)', opacity: 0 }, { transform: 'none', opacity: 1 }];
            else f = [{ transform: 'scale(.88)', opacity: 0 }, { transform: 'scale(1.015)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }];
          }
          return opening ? f : [f[0], f[f.length - 1]].reverse();
        }

        private backdrop(opening: boolean): void {
          if (!this._dlg) return;
          const k: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
          try {
            this._dlg.animate?.(opening ? k : k.reverse(), { duration: opening ? 280 : 200, pseudoElement: '::backdrop', fill: 'forwards' } as KeyframeAnimationOptions);
          } catch {
            /* no ::backdrop animation support */
          }
        }

        show(trigger?: Element | null): void {
          const d = this._dlg;
          if (!d || this._open) return;
          this._open = true;
          this._ret = trigger || (document.activeElement as Element | null);
          this._origin = trigger ? trigger.getBoundingClientRect() : null;
          if (typeof d.showModal === 'function') {
            try {
              d.showModal();
            } catch {
              d.setAttribute('open', '');
            }
          } else d.setAttribute('open', '');
          this.setAttribute('data-open', '');
          this.backdrop(true);
          this.motion(d, this.frames(true), { duration: this.reduced ? 150 : kind === 'sheet' ? 420 : 460, easing: EASE_OUT });
          const f = d.querySelector<HTMLElement>('[autofocus]') || d.querySelector<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
          f?.focus?.();
          this.emit('open', { trigger: trigger || null });
        }

        close(value = ''): Promise<void> {
          const d = this._dlg;
          if (!d || !this._open) return Promise.resolve();
          if (this._closing) return this._closing;
          this._value = value;
          this.backdrop(false);
          const a = this.motion(d, this.frames(false), { duration: this.reduced ? 120 : 260, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
          const done = () => {
            this._closing = null;
            this._open = false;
            this.removeAttribute('data-open');
            if (d.open && typeof d.close === 'function') d.close(value);
            else d.removeAttribute('open');
            a?.cancel?.();
            d.style.transform = '';
            (this._ret as HTMLElement | null)?.focus?.();
            this.emit('close', { value });
          };
          this._closing = a ? a.finished.then(done, done) : Promise.resolve().then(done);
          return this._closing;
        }

        toggle(): void {
          if (this._open) void this.close();
          else this.show();
        }

        // bottom sheet: drag down to dismiss, springs back otherwise
        private drag(): void {
          const p = this._panel;
          const d = this._dlg;
          if (!p || !d || this.dataset.side !== 'bottom') return;
          let y0 = -1;
          let dy = 0;
          let t0 = 0;
          this.listen(p, 'pointerdown', (e: PointerEvent) => {
            if (!(e.target as Element).closest('[data-handle]')) return;
            y0 = e.clientY;
            dy = 0;
            t0 = performance.now();
            (e.target as Element).setPointerCapture?.(e.pointerId);
          });
          this.listen(p, 'pointermove', (e: PointerEvent) => {
            if (y0 < 0) return;
            dy = Math.max(0, e.clientY - y0);
            d.style.transform = `translateY(${dy}px)`;
          });
          const up = () => {
            if (y0 < 0) return;
            y0 = -1;
            const v = dy / Math.max(1, performance.now() - t0);
            if (dy > d.offsetHeight * 0.3 || v > 0.6) void this.close();
            else {
              this.motion(d, [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(-6px)', offset: 0.6 }, { transform: 'none' }], { duration: 380, easing: EASE_OUT });
              d.style.transform = '';
            }
          };
          this.listen(p, 'pointerup', up);
          this.listen(p, 'pointercancel', up);
        }
      }
      return UsaOverlay as unknown as CustomElementConstructor;
    },
    { id: 'overlay', text: css }
  );
}

export const defineModal = (tag = 'usa-modal'): CustomElementConstructor | undefined => defineOverlay(tag, 'modal');
export const defineSheet = (tag = 'usa-sheet'): CustomElementConstructor | undefined => defineOverlay(tag, 'sheet');
