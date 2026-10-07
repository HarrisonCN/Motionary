import { defineElement, EASE_OUT, FLUENT_DECELERATE, type UsaElement } from '../base';
import css from './toast.css?raw';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  /** ms before it hides itself; `0` keeps it until closed (default 4000). */
  duration?: number;
  type?: ToastType;
  /** Optional action button. */
  action?: { label: string; onClick: () => void };
  /** Show a close button (default `true`). */
  dismissible?: boolean;
  /** The toaster to use (default: the first `<usa-toaster>`, created if missing). */
  toaster?: UsaToasterElement | string;
}

export interface ToastHandle {
  element: HTMLElement;
  close(): Promise<void>;
}

/**
 * `<usa-toaster>` — the region toasts slide into (`role="region"`, each
 * toast `role="status"`, errors `role="alert"`). Toasts pause their timer
 * while hovered or focused, and the stack re-flows with a FLIP animation.
 *
 * Attributes: `position` (`bottom-right` default, `bottom-left`,
 * `bottom-center`, `top-right`, `top-left`, `top-center`), `max` (visible
 * toasts, 4), `label` (region name, "Notifications").
 * Reduced motion: toasts fade instead of sliding.
 */
export interface UsaToasterElement extends UsaElement {
  show(message: string, options?: ToastOptions): ToastHandle;
  clear(): void;
}

const ICONS: Record<ToastType, string> = {
  info: '<path d="M12 8h.01M11 12h1v5h1"/>',
  success: '<path d="m8 12.5 3 3 5-6"/>',
  warning: '<path d="M12 8v5M12 16.5h.01"/>',
  error: '<path d="m9 9 6 6M15 9l-6 6"/>',
};

export function defineToaster(tag = 'usa-toaster'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaToaster extends Base {
        static get observedAttributes(): string[] {
          return ['label'];
        }

        mount(): void {
          this.setAttribute('role', 'region');
          this.setAttribute('aria-label', this.str('label', 'Notifications'));
        }

        private flip(mutate: () => void): void {
          const kids = Array.from(this.children) as HTMLElement[];
          const before = new Map(kids.map((k) => [k, k.getBoundingClientRect().top]));
          mutate();
          if (this.reduced) return;
          for (const k of Array.from(this.children) as HTMLElement[]) {
            const top = before.get(k);
            if (top === undefined || k.hasAttribute('data-leaving')) continue;
            const dy = top - k.getBoundingClientRect().top;
            if (Math.abs(dy) > 0.5) this.motion(k, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 320, easing: EASE_OUT, composite: 'add' } as KeyframeAnimationOptions);
          }
        }

        private enterFrames(): Keyframe[] {
          if (this.reduced) return [{ opacity: 0 }, { opacity: 1 }];
          const pos = this.str('position', 'bottom-right');
          const x = pos.endsWith('right') ? '110%' : pos.endsWith('left') ? '-110%' : '0';
          const y = pos.endsWith('center') ? (pos.startsWith('top') ? '-120%' : '120%') : '0';
          return [{ opacity: 0, transform: `translate(${x}, ${y}) scale(0.96)` }, { opacity: 1, transform: 'none' }];
        }

        show(message: string, options: ToastOptions = {}): ToastHandle {
          const type = options.type || 'info';
          const el = document.createElement('div');
          el.className = 'usa-toast';
          el.setAttribute('data-type', type);
          el.setAttribute('role', type === 'error' ? 'alert' : 'status');
          el.innerHTML = `<svg class="usa-toast-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/>${ICONS[type] || ICONS.info}</svg><div class="usa-toast-msg"></div>`;
          (el.querySelector('.usa-toast-msg') as HTMLElement).textContent = message;
          let closed: Promise<void> | null = null;
          let timer: ReturnType<typeof setTimeout> | 0 = 0;
          const close = (): Promise<void> => {
            if (closed) return closed;
            clearTimeout(timer as ReturnType<typeof setTimeout>);
            el.setAttribute('data-leaving', '');
            const frames = this.enterFrames().reverse();
            const a = el.isConnected ? this.motion(el, frames, { duration: 220, easing: 'cubic-bezier(0.7, 0, 0.84, 0)', fill: 'forwards' }) : null;
            closed = new Promise<void>((resolve) => {
              const done = () => {
                this.flip(() => el.remove());
                resolve();
              };
              if (a) a.onfinish = done;
              else done();
            });
            return closed;
          };
          if (options.action) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'usa-toast-action';
            btn.textContent = options.action.label;
            btn.addEventListener('click', () => {
              options.action!.onClick();
              close();
            });
            el.append(btn);
          }
          if (options.dismissible !== false) {
            const x = document.createElement('button');
            x.type = 'button';
            x.className = 'usa-toast-close';
            x.setAttribute('aria-label', 'Close');
            x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>';
            x.addEventListener('click', () => close());
            el.append(x);
          }
          const duration = options.duration ?? 4000;
          const arm = () => {
            clearTimeout(timer as ReturnType<typeof setTimeout>);
            if (duration > 0) timer = setTimeout(close, duration);
          };
          const hold = () => clearTimeout(timer as ReturnType<typeof setTimeout>);
          el.addEventListener('pointerenter', hold);
          el.addEventListener('pointerleave', arm);
          el.addEventListener('focusin', hold);
          el.addEventListener('focusout', arm);
          const top = this.str('position', 'bottom-right').startsWith('top');
          this.flip(() => (top ? this.prepend(el) : this.append(el)));
          this.motion(el, this.enterFrames(), { duration: 420, easing: FLUENT_DECELERATE });
          arm();
          const live = Array.from(this.querySelectorAll<HTMLElement>('.usa-toast:not([data-leaving])'));
          const max = Math.max(1, this.num('max', 4));
          const extra = live.length - max;
          if (extra > 0) (top ? live.slice(-extra) : live.slice(0, extra)).forEach((t) => (t as any)._close?.());
          (el as any)._close = close;
          this.emit('toast', { element: el, message, type });
          return { element: el, close };
        }

        clear(): void {
          this.querySelectorAll<HTMLElement>('.usa-toast').forEach((t) => (t as any)._close?.());
        }
      },
    { id: 'toast', text: css }
  );
}

/**
 * Show a toast. Defines `<usa-toaster>` and adds one to `<body>` if the
 * page has none. Returns a handle with `close()`. No-op on the server.
 *
 * ```js
 * toast('Saved', { type: 'success' });
 * ```
 */
export function toast(message: string, options: ToastOptions = {}): ToastHandle | null {
  if (typeof document === 'undefined' || !defineToaster()) return null;
  let host: UsaToasterElement | null =
    typeof options.toaster === 'string' ? document.querySelector(options.toaster) : options.toaster || document.querySelector('usa-toaster');
  if (!host) {
    host = document.createElement('usa-toaster') as UsaToasterElement;
    document.body.append(host);
  }
  return host.show(message, options);
}
