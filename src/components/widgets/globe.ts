import { defineElement, type UsaElement } from '../base';
import css from './globe.css?raw';

/**
 * `<usa-globe>` (7.6) — a spinning SVG globe (orthographic projection, no
 * WebGL, no map tiles): graticule, an optional `markers` list
 * ("Shanghai:31.2,121.5; London:51.5,-0.1") with pulsing dots, `speed`
 * (degrees per second, default 12; 0 = still), `tilt` (default 18°) and `lon`
 * (start longitude). Spins only while on screen; drag to turn it. `flyTo(name)`
 * rotates a marker to the front (`usa:focus`). The globe is `role="img"`
 * labelled with the marker names; reduced motion: no spin, flyTo jumps.
 */
export interface GlobeMarker {
  name: string;
  lat: number;
  lon: number;
}
export interface UsaGlobeElement extends UsaElement {
  readonly markers: GlobeMarker[];
  lon: number;
  flyTo(name: string): Promise<void>;
}

const RAD = Math.PI / 180;

/** Orthographic projection on a unit sphere seen from longitude `lon0`, tilted by `tilt` degrees (7.6). */
export function project(lat: number, lon: number, lon0 = 0, tilt = 0): { x: number; y: number; visible: boolean } {
  const p = lat * RAD;
  const l = (lon - lon0) * RAD;
  const t = tilt * RAD;
  const x = Math.cos(p) * Math.sin(l);
  const y0 = Math.sin(p);
  const z0 = Math.cos(p) * Math.cos(l);
  const y = y0 * Math.cos(t) - z0 * Math.sin(t);
  const z = y0 * Math.sin(t) + z0 * Math.cos(t);
  return { x: Math.round(x * 1e4) / 1e4, y: Math.round(-y * 1e4) / 1e4, visible: z >= 0 };
}

/** Parse "Name:lat,lon; Name2:lat,lon" (7.6). */
export function parseMarkers(s: string): GlobeMarker[] {
  return String(s || '')
    .split(';')
    .map((part) => {
      const m = /^\s*([^:]+):\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*$/.exec(part);
      return m ? { name: m[1].trim(), lat: Math.max(-90, Math.min(90, +m[2])), lon: +m[3] } : null;
    })
    .filter((m): m is GlobeMarker => !!m);
}

const R = 90;
const C = 100;
const line = (pts: { x: number; y: number; visible: boolean }[]): string => {
  let d = '';
  let pen = false;
  for (const p of pts) {
    if (!p.visible) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${(C + p.x * R).toFixed(1)} ${(C + p.y * R).toFixed(1)}`;
    pen = true;
  }
  return d;
};

export function defineGlobe(tag = 'usa-globe'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaGlobe extends Base {
        static get observedAttributes(): string[] {
          return ['markers', 'speed', 'tilt'];
        }
        private _lon = 0;
        private _raf = 0;
        private _visible = false;
        private _drag: { x: number; lon: number } | null = null;
        get markers(): GlobeMarker[] {
          return parseMarkers(this.str('markers'));
        }
        get lon(): number {
          return this._lon;
        }
        set lon(v: number) {
          this._lon = ((Number(v) % 360) + 360) % 360;
          this.draw();
        }
        mount(): void {
          this._lon = this.num('lon', this._lon);
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const ms = this.markers;
          this.insertAdjacentHTML(
            'beforeend',
            `<svg class="usa-gl-svg" data-usa-part viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="usa-gl-shade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs><circle class="usa-gl-sea" cx="100" cy="100" r="${R}"/><path class="usa-gl-grid"/><g class="usa-gl-marks">${ms.map((m) => `<g class="usa-gl-mark" data-name="${m.name.replace(/"/g, '&quot;')}"><circle class="usa-gl-ring" r="4"/><circle class="usa-gl-dot" r="3.2"/></g>`).join('')}</g><circle cx="100" cy="100" r="${R}" fill="url(#usa-gl-shade)" pointer-events="none"/></svg>`
          );
          this.setAttribute('role', 'img');
          this.setAttribute('aria-label', ms.length ? `Globe: ${ms.map((m) => m.name).join(', ')}` : 'Globe');
          this.draw();
          this.inView((v) => {
            this._visible = v;
            if (v) this.spin();
            else cancelAnimationFrame(this._raf);
          });
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            this._drag = { x: e.clientX, lon: this._lon };
            this.setPointerCapture?.(e.pointerId);
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (this._drag) this.lon = this._drag.lon - (e.clientX - this._drag.x) * 0.6;
          });
          const up = () => (this._drag = null);
          this.listen(this, 'pointerup', up);
          this.listen(this, 'pointercancel', up);
          this.onCleanup(() => cancelAnimationFrame(this._raf));
        }
        private spin(): void {
          cancelAnimationFrame(this._raf);
          const speed = this.num('speed', 12);
          if (this.reduced || !speed) return;
          let last = 0;
          const step = (t: number) => {
            if (!this._visible || !this.isConnected) return;
            const dt = last ? Math.min(64, t - last) : 0;
            last = t;
            if (!this._drag) this.lon = this._lon + (speed * dt) / 1000;
            this._raf = requestAnimationFrame(step);
          };
          this._raf = requestAnimationFrame(step);
        }
        draw(): void {
          const grid = this.querySelector('.usa-gl-grid');
          if (!grid) return;
          const tilt = this.num('tilt', 18);
          let d = '';
          for (let lon = 0; lon < 360; lon += 30) d += line(Array.from({ length: 37 }, (_, i) => project(-90 + i * 5, lon, this._lon, tilt)));
          for (let lat = -60; lat <= 60; lat += 30) d += line(Array.from({ length: 73 }, (_, i) => project(lat, i * 5, this._lon, tilt)));
          grid.setAttribute('d', d);
          const ms = this.markers;
          this.querySelectorAll<SVGGElement>('.usa-gl-mark').forEach((g, i) => {
            const m = ms[i];
            if (!m) return;
            const p = project(m.lat, m.lon, this._lon, tilt);
            g.setAttribute('transform', `translate(${(C + p.x * R).toFixed(1)} ${(C + p.y * R).toFixed(1)})`);
            g.toggleAttribute('data-hidden', !p.visible);
          });
        }
        async flyTo(name: string): Promise<void> {
          const m = this.markers.find((x) => x.name === name);
          if (!m) return;
          const from = this._lon;
          const delta = (((m.lon - from) % 360) + 540) % 360 - 180;
          if (this.reduced) this.lon = from + delta;
          else
            await new Promise<void>((done) => {
              const t0 = performance.now();
              const dur = 900;
              const tick = (t: number) => {
                const k = Math.min(1, (t - t0) / dur);
                const e = 1 - Math.pow(1 - k, 3);
                this.lon = from + delta * e;
                if (k < 1 && this.isConnected) requestAnimationFrame(tick);
                else done();
              };
              requestAnimationFrame(tick);
            });
          this.querySelectorAll('.usa-gl-mark').forEach((g) => g.toggleAttribute('data-active', g.getAttribute('data-name') === name));
          this.emit('focus', { name, lat: m.lat, lon: m.lon });
        }
      }
      return UsaGlobe as unknown as CustomElementConstructor;
    },
    { id: 'globe', text: css }
  );
}
