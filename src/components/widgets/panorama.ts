import { defineElement, type UsaElement } from '../base';
import { xrSupport, yawToOffset } from '../fx2/spatial';
import css from './panorama.css?raw';

/**
 * `<usa-panorama src="pano.jpg">` (8.8) — a 360° panorama viewer: drag
 * (or swipe) to look around, inertia after release, a slow auto-rotate
 * (`autorotate`, degrees per second, default 6, `0` off) and arrow keys.
 * Without `src` it shows a built-in procedural landscape. A compass shows
 * the heading. When the browser offers WebXR, a "View in XR" badge appears
 * (`usa:xr` { mode }). `yaw` property, `lookAt(deg)`; `usa:look` { yaw }.
 * A focusable `img` with `label`; reduced motion: no auto-rotate or inertia.
 */
export interface UsaPanoramaElement extends UsaElement {
  yaw: number;
  lookAt(deg: number): void;
}

export function definePanorama(tag = 'usa-panorama'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaPanorama extends Base {
        static get observedAttributes(): string[] {
          return ['src', 'autorotate', 'label'];
        }
        private _yaw = 0;
        private _raf = 0;
        get yaw(): number {
          return this._yaw;
        }
        set yaw(v: number) {
          this.lookAt(v);
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('role', 'img');
          this.setAttribute('aria-label', this.str('label', '360° panorama'));
          this.setAttribute('aria-roledescription', 'panorama');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          const src = this.str('src');
          this.insertAdjacentHTML('beforeend', `<div class="usa-pano-view${src ? '' : ' usa-pano-procedural'}" data-usa-part></div><span class="usa-pano-compass" aria-hidden="true" data-usa-part><i></i></span><button type="button" class="usa-pano-xr" hidden data-usa-part>View in XR</button>`);
          const view = this.querySelector('.usa-pano-view') as HTMLElement;
          if (src) view.style.backgroundImage = `url("${src.replace(/"/g, '%22')}")`;
          let vel = 0;
          let drag: { x: number; yaw: number; t: number; lx: number } | null = null;
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            if ((e.target as Element).closest?.('.usa-pano-xr')) return;
            drag = { x: e.clientX, yaw: this._yaw, t: performance.now(), lx: e.clientX };
            vel = 0;
            this.setFlag('data-dragging', true);
            try {
              this.setPointerCapture?.(e.pointerId);
            } catch {
              /* synthetic */
            }
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (!drag) return;
            const w = this.clientWidth || 300;
            const now = performance.now();
            vel = ((drag.lx - e.clientX) / w) * 90 / Math.max(1, now - drag.t) * 16;
            drag.t = now;
            drag.lx = e.clientX;
            this.lookAt(drag.yaw + ((drag.x - e.clientX) / w) * 90);
          });
          const up = () => {
            if (!drag) return;
            drag = null;
            this.setFlag('data-dragging', false);
          };
          this.listen(this, 'pointerup', up);
          this.listen(this, 'pointercancel', up);
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') this.lookAt(this._yaw - 15);
            else if (e.key === 'ArrowRight') this.lookAt(this._yaw + 15);
            else return;
            e.preventDefault();
          });
          const xr = this.querySelector('.usa-pano-xr') as HTMLButtonElement;
          xrSupport().then((m) => {
            if (m === 'none' || m === 'inline' || !this.isConnected) return;
            xr.hidden = false;
            this.emit('xr', { mode: m });
          });
          this.listen(xr, 'click', () => this.emit('xr-request', { yaw: this._yaw }));
          this.lookAt(this._yaw);
          if (this.reduced) return;
          const rate = this.num('autorotate', 6);
          this.inView((v) => {
            cancelAnimationFrame(this._raf);
            if (!v) return;
            let last = performance.now();
            const tick = (t: number) => {
              const dt = Math.min(64, t - last);
              last = t;
              if (!drag) {
                if (Math.abs(vel) > 0.02) {
                  this.lookAt(this._yaw + vel * (dt / 16));
                  vel *= 0.94;
                } else if (rate && !this.matches(':focus-within, :hover')) this.lookAt(this._yaw + (rate * dt) / 1000, true);
              }
              this._raf = requestAnimationFrame(tick);
            };
            this._raf = requestAnimationFrame(tick);
          });
          this.onCleanup(() => cancelAnimationFrame(this._raf));
        }
        lookAt(deg: number, quiet = false): void {
          this._yaw = ((deg % 360) + 360) % 360;
          const view = this.querySelector<HTMLElement>('.usa-pano-view');
          if (view) {
            const tile = view.clientHeight ? view.clientHeight * 4 : 1200;
            view.style.backgroundPositionX = `${yawToOffset(this._yaw, tile)}px`;
          }
          const c = this.querySelector<HTMLElement>('.usa-pano-compass i');
          if (c) c.style.transform = `rotate(${-this._yaw}deg)`;
          if (!quiet) this.emit('look', { yaw: Math.round(this._yaw) });
        }
      }
      return UsaPanorama as unknown as CustomElementConstructor;
    },
    { id: 'panorama', text: css }
  );
}
