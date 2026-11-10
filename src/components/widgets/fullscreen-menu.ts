import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import css from './fullscreen-menu.css?raw';

/**
 * `<mo-fullscreen-menu>` (17.3; legacy name `<usa-fullscreen-menu>`) — a menu button that opens a full-screen overlay:
 * the overlay grows out of the button as a circle (`variant="circle"`, default) or drops as a curtain
 * (`variant="curtain"`), then the big links rise one after another. A link with `data-preview="image.jpg"` shows that
 * picture beside the list while it is hovered or focused. Children: the links (any elements); they move into the
 * overlay's `<nav>`. The overlay is a modal dialog (`role="dialog"`, `aria-modal`, named by `label`, default "Menu"):
 * focus moves to the first link and stays inside, Esc / the button / a link click closes it and focus returns to the
 * button, page scrolling is locked while open. Methods `show()`, `hide()`, `toggle(force?)`, property `open`; events
 * `usa:open` / `usa:close`. Reduced motion: the overlay and links appear without the reveal.
 */
export interface UsaFullscreenMenuElement extends UsaElement {
  open: boolean;
  show(): void;
  hide(): void;
  toggle(force?: boolean): void;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';
let seq = 0;

export function defineFullscreenMenu(tag = 'usa-fullscreen-menu'): CustomElementConstructor | undefined {
  const C = defineElement(
    tag,
    (Base) => {
      class UsaFullscreenMenu extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'variant'];
        }
        private _open = false;
        private _btn: HTMLButtonElement | null = null;
        private _layer: HTMLElement | null = null;
        private _nav: HTMLElement | null = null;
        private _img: HTMLImageElement | null = null;
        private _overflow = '';

        get open(): boolean {
          return this._open;
        }
        set open(v: boolean) {
          this.toggle(v);
        }

        mount(): void {
          const label = this.str('label', 'Menu');
          let btn = this.querySelector<HTMLButtonElement>(':scope > .usa-fm-toggle');
          let layer = this.querySelector<HTMLElement>(':scope > .usa-fm-layer');
          if (!btn || !layer) {
            const id = 'usa-fm-' + ++seq;
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'usa-fm-toggle';
            btn.setAttribute('data-usa-part', '');
            btn.innerHTML = '<span class="usa-fm-bars" aria-hidden="true"><i></i><i></i></span>';
            layer = document.createElement('div');
            layer.className = 'usa-fm-layer';
            layer.id = id;
            layer.hidden = true;
            layer.setAttribute('data-usa-part', '');
            layer.setAttribute('role', 'dialog');
            layer.setAttribute('aria-modal', 'true');
            const nav = document.createElement('nav');
            nav.className = 'usa-fm-nav';
            const img = document.createElement('img');
            img.className = 'usa-fm-preview';
            img.alt = '';
            img.hidden = true;
            const links = Array.from(this.childNodes);
            nav.append(...links);
            layer.append(nav, img);
            this.append(btn, layer);
            btn.setAttribute('aria-controls', id);
          }
          this._btn = btn;
          this._layer = layer;
          this._nav = layer.querySelector('.usa-fm-nav');
          this._img = layer.querySelector('.usa-fm-preview');
          btn.setAttribute('aria-expanded', String(this._open));
          btn.setAttribute('aria-label', label);
          layer.setAttribute('aria-label', label);
          this.dataset.variant = this.str('variant') === 'curtain' ? 'curtain' : 'circle';
          this.listen(btn, 'click', () => this.toggle());
          this.listen(layer, 'click', (e: MouseEvent) => {
            if ((e.target as Element).closest('a[href]')) this.hide(false);
          });
          this.listen(layer, 'keydown', (e: KeyboardEvent) => this.key(e));
          this.listen(btn, 'keydown', (e: KeyboardEvent) => {
            if (!this._open || (e.key !== 'Tab' && e.key !== 'Escape')) return;
            e.preventDefault();
            if (e.key === 'Escape') return this.hide();
            const f = Array.from(layer!.querySelectorAll<HTMLElement>(FOCUSABLE));
            (e.shiftKey ? f[f.length - 1] : f[0])?.focus();
          });
          const preview = (e: Event) => {
            const src = (e.target as Element).closest?.('[data-preview]')?.getAttribute('data-preview');
            const img = this._img!;
            if (!src) return;
            if (img.getAttribute('src') !== src) img.setAttribute('src', src);
            img.hidden = false;
            if (!this.reduced) this.motion(img, [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
          };
          this.listen(layer, 'pointerover', preview);
          this.listen(layer, 'focusin', preview);
        }

        unmount(): void {
          if (this._open) this.hide(false);
        }

        private key(e: KeyboardEvent): void {
          if (e.key === 'Escape') {
            e.preventDefault();
            this.hide();
            return;
          }
          if (e.key !== 'Tab') return;
          const f = Array.from(this._layer!.querySelectorAll<HTMLElement>(FOCUSABLE));
          const first = this._btn!;
          const last = f[f.length - 1] || first;
          // the toggle button sits above the overlay and closes it, so it is part of the focus loop
          if (e.shiftKey && document.activeElement === (f[0] || first)) {
            e.preventDefault();
            first.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }

        show(): void {
          this.toggle(true);
        }
        hide(restoreFocus = true): void {
          this.toggle(false, restoreFocus);
        }

        toggle(force?: boolean, restoreFocus = true): void {
          const open = force ?? !this._open;
          const layer = this._layer;
          const btn = this._btn;
          if (open === this._open || !layer || !btn) return;
          this._open = open;
          btn.setAttribute('aria-expanded', String(open));
          this.toggleAttribute('data-open', open);
          const root = document.documentElement;
          const b = btn.getBoundingClientRect();
          const at = `${Math.round(b.left + b.width / 2)}px ${Math.round(b.top + b.height / 2)}px`;
          const clip = this.dataset.variant === 'curtain' ? ['inset(0 0 100% 0)', 'inset(0 0 0 0)'] : [`circle(0px at ${at})`, `circle(150vmax at ${at})`];
          if (open) {
            this._overflow = root.style.overflow;
            root.style.overflow = 'hidden';
            layer.hidden = false;
            if (!this.reduced) {
              this.motion(layer, [{ clipPath: clip[0] }, { clipPath: clip[1] }], { duration: 560, easing: 'cubic-bezier(.7,0,.2,1)' });
              Array.from(this._nav!.children).forEach((c, i) =>
                this.motion(c, [{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 220 + i * 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })
              );
            }
            (layer.querySelector<HTMLElement>(FOCUSABLE) || btn).focus();
            this.emit('open');
          } else {
            root.style.overflow = this._overflow;
            const done = () => {
              if (!this._open) layer.hidden = true;
            };
            const a = this.reduced ? null : this.motion(layer, [{ clipPath: clip[1] }, { clipPath: clip[0] }], { duration: 420, easing: 'cubic-bezier(.7,0,.2,1)' });
            if (a) a.finished.then(done, done);
            else done();
            if (restoreFocus) btn.focus();
            this.emit('close');
          }
        }
      }
      return UsaFullscreenMenu as unknown as CustomElementConstructor;
    },
    { id: 'fullscreen-menu', text: css }
  );
  defineMoName(tag, C);
  return C;
}
