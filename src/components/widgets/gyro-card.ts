import { defineElement, type UsaElement } from '../base';
import { keyClick } from '../key-click';
import { orientationToTilt } from '../fx2/gesture3';
import css from './gyro-card.css?raw';

/**
 * `<usa-gyro-card>` (8.7) — a 3D card that tilts with the phone's gyroscope
 * (`deviceorientation`) and with the pointer on desktop, with a moving glare
 * and `[data-depth]` children that float at different depths. On iOS the
 * motion permission is requested on the first tap. `max` (degrees, default
 * 15), `glare` (default on); `tilt(rx, ry)` sets it by hand; `usa:tilt`
 * { rx, ry, source }. Reduced motion: flat, no tilt.
 */
export interface UsaGyroCardElement extends UsaElement {
  readonly source: 'gyro' | 'pointer' | 'none';
  tilt(rx: number, ry: number, source?: string): void;
  /** Play a short tilt wobble (a demo / attention cue); `null` under reduced motion. */
  wobble(): Animation | null;
}

export function defineGyroCard(tag = 'usa-gyro-card'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaGyroCard extends Base {
        static get observedAttributes(): string[] {
          return ['max', 'glare'];
        }
        private _src: 'gyro' | 'pointer' | 'none' = 'none';
        get source(): 'gyro' | 'pointer' | 'none' {
          return this._src;
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          if (this.str('glare') !== 'false') this.insertAdjacentHTML('beforeend', '<span class="usa-gy-glare" aria-hidden="true" data-usa-part></span>');
          if (this.reduced) return;
          const max = Math.max(1, Math.min(40, this.num('max', 15)));
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (this._src === 'gyro' || e.pointerType === 'touch') return;
            const r = this.getBoundingClientRect();
            if (!r.width || !r.height) return;
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            this.tilt(-py * 2 * max, px * 2 * max, 'pointer');
          });
          this.listen(this, 'pointerleave', () => {
            if (this._src === 'pointer') this.tilt(0, 0, 'pointer');
          });
          if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
            let active = false;
            const on = () => {
              if (active) return;
              active = true;
              this.inView((v) => {
                if (v) this.listen(window, 'deviceorientation', (e: DeviceOrientationEvent) => {
                  if (e.beta == null || e.gamma == null) return;
                  const t = orientationToTilt(e.beta, e.gamma, max);
                  this.tilt(t.rx, t.ry, 'gyro');
                });
              });
            };
            const DOE = (window as any).DeviceOrientationEvent;
            if (typeof DOE.requestPermission === 'function') {
              keyClick(this as any);
              this.listen(this, 'click', () => {
                if (!active) DOE.requestPermission().then((s: string) => s === 'granted' && on(), () => undefined);
              });
            } else on();
          }
        }
        wobble(): Animation | null {
          if (this.reduced) return null;
          const m = Math.max(1, Math.min(40, this.num('max', 15)));
          const f = (x: number, y: number) => ({ transform: `perspective(800px) rotateX(${x}deg) rotateY(${y}deg)` });
          return this.motion(this, [f(0, 0), f(-m, m), f(m * 0.6, -m * 0.8), f(-m * 0.3, m * 0.4), f(0, 0)], { duration: 1100, easing: 'ease-in-out' });
        }
        tilt(rx: number, ry: number, source = 'none'): void {
          this._src = (['gyro', 'pointer'].includes(source) ? source : 'none') as 'gyro' | 'pointer' | 'none';
          this.style.setProperty('--rx', `${rx.toFixed(1)}deg`);
          this.style.setProperty('--ry', `${ry.toFixed(1)}deg`);
          this.style.setProperty('--gx', `${50 + ry * 2}%`);
          this.style.setProperty('--gy', `${50 - rx * 2}%`);
          this.setFlag('data-tilted', Math.abs(rx) + Math.abs(ry) > 0.5);
          this.emit('tilt', { rx, ry, source: this._src });
        }
      }
      return UsaGyroCard as unknown as CustomElementConstructor;
    },
    { id: 'gyro-card', text: css }
  );
}
