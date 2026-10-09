import { defineElement, type UsaElement } from '../base';
import css from './location-card.css?raw';

/**
 * `<usa-location-card>` (7.6) — a place card with a stylised mini map (SVG
 * streets, no tiles, no network): `name`, `address`, `lat`/`lon`, an optional
 * origin `from-lat`/`from-lon` (the distance is computed with the haversine
 * formula, or set it with `distance`), `href` for a “Directions” link and
 * `unit` (`km` | `mi`). When it scrolls into view the pin drops in with a
 * bounce and a ring pulses under it; with an origin, the route from it draws
 * itself. `usa:arrive` fires when the pin lands. An `<article>` with a heading;
 * reduced motion: pin and route are shown at once.
 */
export interface UsaLocationCardElement extends UsaElement {
  readonly km: number | null;
  replay(): void;
}

/** Great-circle distance in km between two lat/lon points (7.6). */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** "850 m", "4.2 km", "12 km" — or miles with `unit = 'mi'` (7.6). */
export function formatDistance(km: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    const mi = km * 0.621371;
    return mi < 0.1 ? `${Math.round(mi * 5280)} ft` : `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`;
  }
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineLocationCard(tag = 'usa-location-card'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaLocationCard extends Base {
        static get observedAttributes(): string[] {
          return ['name', 'address', 'lat', 'lon', 'from-lat', 'from-lon', 'distance', 'href', 'unit'];
        }
        private _played = false;
        get km(): number | null {
          const lat = this.num('lat', NaN);
          const lon = this.num('lon', NaN);
          const fl = this.num('from-lat', NaN);
          const fo = this.num('from-lon', NaN);
          return [lat, lon, fl, fo].every(Number.isFinite) ? haversine(fl, fo, lat, lon) : null;
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const name = this.str('name', 'Location');
          const km = this.km;
          const dist = this.str('distance') || (km === null ? '' : formatDistance(km, this.str('unit') === 'mi' ? 'mi' : 'km'));
          const href = this.str('href');
          const origin = km !== null;
          this.insertAdjacentHTML(
            'beforeend',
            `<article class="usa-lc" data-usa-part aria-label="${esc(name)}"><div class="usa-lc-map" aria-hidden="true"><svg viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice"><path class="usa-lc-street" d="M0 30H240M0 78H240M40 0V120M120 0V120M196 0V120M0 112L240 8"/>${origin ? '<path class="usa-lc-route" pathLength="100" d="M28 100C60 100 64 78 96 78S120 40 160 40 168 58 168 58"/><circle class="usa-lc-from" cx="28" cy="100" r="4"/>' : ''}</svg><span class="usa-lc-ring"></span><span class="usa-lc-pin"></span></div><div class="usa-lc-body"><h3 class="usa-lc-name">${esc(name)}</h3>${this.str('address') ? `<p class="usa-lc-addr">${esc(this.str('address'))}</p>` : ''}<p class="usa-lc-meta">${dist ? `<span class="usa-lc-dist">${esc(dist)}</span>` : ''}${href ? `<a class="usa-lc-go" href="${esc(href)}" target="_blank" rel="noopener">Directions</a>` : ''}</p></div></article>`
          );
          if (origin) this.setAttribute('data-route', '');
          else this.removeAttribute('data-route');
          this._played = false;
          this.inView((v) => v && !this._played && this.replay(), { threshold: 0.4 });
        }
        replay(): void {
          this._played = true;
          const pin = this.querySelector('.usa-lc-pin') as HTMLElement | null;
          const ring = this.querySelector('.usa-lc-ring') as HTMLElement | null;
          const route = this.querySelector('.usa-lc-route') as SVGPathElement | null;
          if (!pin) return;
          if (this.reduced) {
            this.emit('arrive', { name: this.str('name') });
            return;
          }
          if (route) this.motion(route, [{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }], { duration: 900, easing: 'ease-in-out' });
          const delay = route ? 700 : 0;
          const a = this.motion(pin, [{ transform: 'translate(-50%,-100%) translateY(-60px)', opacity: 0 }, { transform: 'translate(-50%,-100%)', opacity: 1, offset: 0.55 }, { transform: 'translate(-50%,-100%) translateY(-10px) scaleY(1.04)', offset: 0.75 }, { transform: 'translate(-50%,-100%)' }], { duration: 650, delay, easing: 'ease-out', fill: 'backwards' });
          if (ring) this.motion(ring, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0 }], { duration: 900, delay: delay + 450, easing: 'ease-out', iterations: 2 });
          const done = () => this.isConnected && this.emit('arrive', { name: this.str('name') });
          if (a) a.finished.then(done, () => undefined);
          else done();
        }
      }
      return UsaLocationCard as unknown as CustomElementConstructor;
    },
    { id: 'location-card', text: css }
  );
}
