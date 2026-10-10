import { defineElement, type UsaElement } from '../base';
import { part } from './shared';
import { delegateTriggers } from './overlay';
import css from './toast.css?raw';

/**
 * `<usa-toast-stack>` (6.3) — notifications that pile up into a collapsed
 * stack (newest in front, older ones peeking behind), fan out on hover or
 * focus, auto-dismiss (paused while hovered), and can be swiped away.
 *
 * Attributes: `position` (`bottom-right` · `bottom-left` · `bottom-center` ·
 * `top-right` · `top-left` · `top-center`), `duration` (ms, `0` = sticky),
 * `max` (visible in the stack), `contained` (positioned inside its parent
 * instead of the viewport). API: `show(message | options)` → id,
 * `dismiss(id)`, `clear()`; module helper `stackToast()` uses the first stack on
 * the page (creating one). Any `[data-usa-toast="message"]` element shows a
 * toast on click (`data-usa-toast-type`, `data-usa-target`). Events:
 * `usa:show`, `usa:dismiss` (`{ id, reason }`). Toasts live in a polite live
 * region. Reduced motion: no slide or swipe animation.
 */
export interface StackToastOptions {
  message?: string;
  title?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  /** ms; 0 = stays until dismissed. Defaults to the stack's `duration`. */
  duration?: number;
  /** An action button. */
  action?: { label: string; onClick?: () => void };
}
export interface UsaToastStackElement extends UsaElement {
  show(input: string | StackToastOptions): string;
  dismiss(id: string, reason?: string): void;
  clear(): void;
  readonly count: number;
}

export const TOAST_POSITIONS = ['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left', 'top-center'] as const;
const ICONS: Record<string, string> = { info: 'ℹ', success: '✓', warning: '!', error: '✕' };
let tid = 0;

export function defineToastStack(tag = 'usa-toast-stack'): CustomElementConstructor | undefined {
  installToastTriggers();
  return defineElement(
    tag,
    (Base) => {
      class UsaToastStack extends Base {
        static get observedAttributes(): string[] {
          return ['position', 'duration', 'max'];
        }
        private _list: HTMLOListElement | null = null;
        private _timers = new Map<string, { left: number; start: number; h: ReturnType<typeof setTimeout> | 0 }>();
        private _hover = false;

        get count(): number {
          return this._list ? this._list.querySelectorAll(':scope > .usa-tstack:not([data-leaving])').length : 0;
        }

        mount(): void {
          const pos = this.str('position', 'bottom-right');
          this.dataset.position = (TOAST_POSITIONS as readonly string[]).includes(pos) ? pos : 'bottom-right';
          this.setAttribute('role', 'region');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Notifications');
          this._list = this.querySelector(':scope > .usa-tstack-list') || part('ol', 'usa-tstack-list', { 'aria-live': 'polite', 'aria-relevant': 'additions' });
          if (!this._list.isConnected) this.append(this._list);
          const expand = (on: boolean) => {
            this._hover = on;
            this.toggleAttribute('data-expanded', on);
            this.layout();
            for (const [id, t] of this._timers) on ? this.pause(id, t) : this.resume(id);
          };
          this.listen(this, 'pointerenter', () => expand(true));
          this.listen(this, 'pointerleave', () => expand(false));
          this.listen(this, 'focusin', () => expand(true));
          this.listen(this, 'focusout', (e: FocusEvent) => !this.contains(e.relatedTarget as Node) && expand(false));
          this.onCleanup(() => this._timers.forEach((t) => t.h && clearTimeout(t.h)));
        }

        private pause(_id: string, t: { left: number; start: number; h: ReturnType<typeof setTimeout> | 0 }): void {
          if (!t.h) return;
          clearTimeout(t.h);
          t.h = 0;
          t.left -= Date.now() - t.start;
        }
        private resume(id: string): void {
          const t = this._timers.get(id);
          if (!t || t.h) return;
          t.start = Date.now();
          t.h = setTimeout(() => this.dismiss(id, 'timeout'), Math.max(400, t.left));
        }

        show(input: string | StackToastOptions): string {
          const o: StackToastOptions = typeof input === 'string' ? { message: input } : input || {};
          const id = `usa-tstack-${++tid}`;
          const type = o.type && ICONS[o.type] ? o.type : 'info';
          const li = part('li', `usa-tstack usa-tstack-${type}`, { id, role: type === 'error' ? 'alert' : 'status' });
          li.append(part('span', 'usa-tstack-icon', { 'aria-hidden': 'true' }, ICONS[type]));
          const txt = part('div', 'usa-tstack-text');
          if (o.title) txt.append(Object.assign(document.createElement('strong'), { textContent: o.title }));
          if (o.message) txt.append(Object.assign(document.createElement('span'), { textContent: o.message }));
          li.append(txt);
          if (o.action) {
            const b = part('button', 'usa-tstack-action', { type: 'button' });
            b.textContent = o.action.label;
            b.addEventListener('click', () => {
              o.action?.onClick?.();
              this.dismiss(id, 'action');
            });
            li.append(b);
          }
          const x = part('button', 'usa-tstack-close', { type: 'button', 'aria-label': 'Dismiss' }, '×');
          x.addEventListener('click', () => this.dismiss(id, 'close'));
          li.append(x);
          this.swipe(li, id);
          this._list?.prepend(li);
          const top = this.dataset.position?.startsWith('top');
          this.motion(li, this.reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: `0 ${top ? -110 : 110}%`, scale: '0.9' }, { opacity: 1, translate: '0 0', scale: '1' }], { duration: this.reduced ? 150 : 420, easing: 'cubic-bezier(.22,1,.36,1)' });
          this.layout();
          const dur = o.duration ?? this.num('duration', 4000);
          if (dur > 0) {
            this._timers.set(id, { left: dur, start: Date.now(), h: 0 });
            if (!this._hover) this.resume(id);
          }
          this.emit('show', { id, ...o });
          return id;
        }

        dismiss(id: string, reason = 'api'): void {
          const li = this._list?.querySelector<HTMLElement>(`#${id}`);
          const t = this._timers.get(id);
          if (t?.h) clearTimeout(t.h);
          this._timers.delete(id);
          if (!li || li.hasAttribute('data-leaving')) return;
          li.setAttribute('data-leaving', '');
          const dx = Number(li.dataset.dx || 0);
          const a = this.motion(li, this.reduced ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 1, transform: `translateX(${dx}px)` }, { opacity: 0, transform: `translateX(${dx >= 0 ? 120 : -120}%)` }], { duration: this.reduced ? 120 : 260, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
          const rm = () => {
            li.remove();
            this.layout();
          };
          if (a) a.finished.then(rm, rm);
          else rm();
          this.emit('dismiss', { id, reason });
        }

        clear(): void {
          this._list?.querySelectorAll<HTMLElement>(':scope > .usa-tstack').forEach((li) => this.dismiss(li.id, 'clear'));
        }

        /** Collapsed: newest in front, older ones scaled down peeking behind. Expanded: a list. */
        private layout(): void {
          if (!this._list) return;
          const items = Array.from(this._list.querySelectorAll<HTMLElement>(':scope > .usa-tstack:not([data-leaving])'));
          const max = Math.max(1, this.num('max', 3));
          const dir = this.dataset.position?.startsWith('top') ? 1 : -1;
          let y = 0;
          items.forEach((li, k) => {
            const h = li.offsetHeight || 56;
            const tf = this._hover ? `translateY(${dir * y}px)` : `translateY(${dir * k * 10}px) scale(${(1 - k * 0.05).toFixed(3)})`;
            li.style.transform = tf;
            li.style.zIndex = String(100 - k);
            li.style.opacity = !this._hover && k >= max ? '0' : '';
            li.toggleAttribute('inert', !this._hover && k > 0);
            y += h + 10;
          });
          this._list.style.height = this._hover && items.length ? `${y}px` : '';
        }

        private swipe(li: HTMLElement, id: string): void {
          let x0 = NaN;
          li.addEventListener('pointerdown', (e) => {
            if ((e.target as Element).closest('button')) return;
            x0 = e.clientX;
            li.setPointerCapture?.(e.pointerId);
          });
          li.addEventListener('pointermove', (e) => {
            if (Number.isNaN(x0)) return;
            const dx = e.clientX - x0;
            li.dataset.dx = String(dx);
            li.style.translate = `${dx}px 0`;
            li.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / 240));
          });
          const up = () => {
            if (Number.isNaN(x0)) return;
            x0 = NaN;
            const dx = Number(li.dataset.dx || 0);
            li.style.translate = '';
            li.style.opacity = '';
            if (Math.abs(dx) > 80) this.dismiss(id, 'swipe');
            else li.dataset.dx = '0';
          };
          li.addEventListener('pointerup', up);
          li.addEventListener('pointercancel', up);
        }
      }
      return UsaToastStack as unknown as CustomElementConstructor;
    },
    { id: 'toast', text: css }
  );
}

/** Show a toast on the first `<usa-toast-stack>` of the page (one is created when missing). */
export function stackToast(input: string | StackToastOptions, stack?: UsaToastStackElement | null): string {
  defineToastStack();
  let s = stack || document.querySelector<UsaToastStackElement>('usa-toast-stack');
  if (!s) {
    s = document.createElement('usa-toast-stack') as UsaToastStackElement;
    document.body.append(s);
  }
  return s.show(input);
}

let trig = false;
function installToastTriggers(): void {
  delegateTriggers();
  if (trig || typeof document === 'undefined') return;
  trig = true;
  // contract-exempt: lifecycle-global-listener — one delegated listener for [data-usa-toast] triggers, installed once per page, never per element
  document.addEventListener('click', (e) => {
    const t = (e.target as Element | null)?.closest?.('[data-usa-toast]');
    if (!t) return;
    const target = t.getAttribute('data-usa-target');
    const s = target ? (document.getElementById(target) as UsaToastStackElement | null) : null;
    stackToast({ message: t.getAttribute('data-usa-toast') || '', title: t.getAttribute('data-usa-toast-title') || undefined, type: (t.getAttribute('data-usa-toast-type') as StackToastOptions['type']) || 'info' }, s);
  });
}
