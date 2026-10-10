'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-location-card{display:block;width:var(--usa-lc-w,280px);max-width:100%;font:500 13px/1.35 system-ui,sans-serif}.usa-lc{border-radius:16px;overflow:hidden;background:var(--usa-lc-bg,#fff);color:var(--usa-lc-fg,#0f172a);box-shadow:0 10px 28px -14px rgba(15,23,42,.45);border:1px solid rgba(15,23,42,.08)}.usa-lc-map{position:relative;height:var(--usa-lc-map-h,110px);background:var(--usa-lc-land,#e8efe4);overflow:hidden}.usa-lc-map svg{display:block;width:100%;height:100%}.usa-lc-street{fill:none;stroke:#fff;stroke-width:7;stroke-linecap:round}.usa-lc-route{fill:none;stroke:var(--usa-lc-accent,#2563eb);stroke-width:4;stroke-linecap:round;stroke-dasharray:100}.usa-lc-from{fill:#fff;stroke:var(--usa-lc-accent,#2563eb);stroke-width:3}.usa-lc-pin{position:absolute;left:70%;top:calc(48% - 8px);width:22px;height:22px;transform:translate(-50%,-100%);border-radius:50%;background:var(--usa-lc-pin,#ef4444);box-shadow:0 4px 8px rgba(0,0,0,.25)}.usa-lc-pin::after{content:\"\";position:absolute;inset:6px;border-radius:50%;background:#fff}.usa-lc-pin::before{content:\"\";position:absolute;left:50%;bottom:-8px;width:0;height:0;border:6px solid transparent;border-top:9px solid var(--usa-lc-pin,#ef4444);border-bottom:0;transform:translateX(-50%)}.usa-lc-ring{position:absolute;left:70%;top:48%;width:18px;height:18px;border-radius:50%;border:2px solid var(--usa-lc-pin,#ef4444);transform:translate(-50%,-50%);opacity:0;pointer-events:none}.usa-lc-body{padding:10px 14px 12px}.usa-lc-name{margin:0;font-size:15px;font-weight:750}.usa-lc-addr{margin:2px 0 0;opacity:.7}.usa-lc-meta{display:flex;align-items:center;gap:10px;margin:8px 0 0}.usa-lc-meta:empty{display:none}.usa-lc-dist{font-weight:700;font-variant-numeric:tabular-nums}.usa-lc-go{margin-left:auto;color:var(--usa-lc-accent,#2563eb);font-weight:700;text-decoration:none}.usa-lc-go:hover,.usa-lc-go:focus-visible{text-decoration:underline}";

/** Great-circle distance in km between two lat/lon points (7.6). */
function haversine(lat1, lon1, lat2, lon2) {
    const r = Math.PI / 180;
    const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}
/** "850 m", "4.2 km", "12 km" — or miles with `unit = 'mi'` (7.6). */
function formatDistance(km, unit = 'km') {
    if (unit === 'mi') {
        const mi = km * 0.621371;
        return mi < 0.1 ? `${Math.round(mi * 5280)} ft` : `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`;
    }
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineLocationCard(tag = 'usa-location-card') {
    return base.defineElement(tag, (Base) => {
        class UsaLocationCard extends Base {
            constructor() {
                super(...arguments);
                this._played = false;
            }
            static get observedAttributes() {
                return ['name', 'address', 'lat', 'lon', 'from-lat', 'from-lon', 'distance', 'href', 'unit'];
            }
            get km() {
                const lat = this.num('lat', NaN);
                const lon = this.num('lon', NaN);
                const fl = this.num('from-lat', NaN);
                const fo = this.num('from-lon', NaN);
                return [lat, lon, fl, fo].every(Number.isFinite) ? haversine(fl, fo, lat, lon) : null;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const name = this.str('name', 'Location');
                const km = this.km;
                const dist = this.str('distance') || (km === null ? '' : formatDistance(km, this.str('unit') === 'mi' ? 'mi' : 'km'));
                const href = this.str('href');
                const origin = km !== null;
                this.insertAdjacentHTML('beforeend', `<article class="usa-lc" data-usa-part aria-label="${esc(name)}"><div class="usa-lc-map" aria-hidden="true"><svg viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice"><path class="usa-lc-street" d="M0 30H240M0 78H240M40 0V120M120 0V120M196 0V120M0 112L240 8"/>${origin ? '<path class="usa-lc-route" pathLength="100" d="M28 100C60 100 64 78 96 78S120 40 160 40 168 58 168 58"/><circle class="usa-lc-from" cx="28" cy="100" r="4"/>' : ''}</svg><span class="usa-lc-ring"></span><span class="usa-lc-pin"></span></div><div class="usa-lc-body"><h3 class="usa-lc-name">${esc(name)}</h3>${this.str('address') ? `<p class="usa-lc-addr">${esc(this.str('address'))}</p>` : ''}<p class="usa-lc-meta">${dist ? `<span class="usa-lc-dist">${esc(dist)}</span>` : ''}${href ? `<a class="usa-lc-go" href="${esc(href)}" target="_blank" rel="noopener">Directions</a>` : ''}</p></div></article>`);
                if (origin)
                    this.setAttribute('data-route', '');
                else
                    this.removeAttribute('data-route');
                this._played = false;
                this.inView((v) => v && !this._played && this.replay(), { threshold: 0.4 });
            }
            replay() {
                this._played = true;
                const pin = this.querySelector('.usa-lc-pin');
                const ring = this.querySelector('.usa-lc-ring');
                const route = this.querySelector('.usa-lc-route');
                if (!pin)
                    return;
                if (this.reduced) {
                    this.emit('arrive', { name: this.str('name') });
                    return;
                }
                if (route)
                    this.motion(route, [{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }], { duration: 900, easing: 'ease-in-out' });
                const delay = route ? 700 : 0;
                const a = this.motion(pin, [{ transform: 'translate(-50%,-100%) translateY(-60px)', opacity: 0 }, { transform: 'translate(-50%,-100%)', opacity: 1, offset: 0.55 }, { transform: 'translate(-50%,-100%) translateY(-10px) scaleY(1.04)', offset: 0.75 }, { transform: 'translate(-50%,-100%)' }], { duration: 650, delay, easing: 'ease-out', fill: 'backwards' });
                if (ring)
                    this.motion(ring, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0 }], { duration: 900, delay: delay + 450, easing: 'ease-out', iterations: 2 });
                const done = () => this.isConnected && this.emit('arrive', { name: this.str('name') });
                if (a)
                    a.finished.then(done, () => undefined);
                else
                    done();
            }
        }
        return UsaLocationCard;
    }, { id: 'location-card', text: css });
}

exports.defineLocationCard = defineLocationCard;
exports.formatDistance = formatDistance;
exports.haversine = haversine;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.6.0/dist/chunks/location-card-CLR05EP-.cjs.map