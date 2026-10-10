import { f as defineElement } from './base-zSGb8ujt.js';

var css = "usa-globe{display:inline-block;width:var(--usa-gl-size,200px);max-width:100%;aspect-ratio:1;touch-action:pan-y;cursor:grab;user-select:none}usa-globe:active{cursor:grabbing}.usa-gl-svg{display:block;width:100%;height:100%;overflow:visible}.usa-gl-sea{fill:var(--usa-gl-sea,#1e3a8a)}.usa-gl-grid{fill:none;stroke:var(--usa-gl-grid,rgba(255,255,255,.35));stroke-width:.7}.usa-gl-dot{fill:var(--usa-gl-accent,#f59e0b);stroke:#fff;stroke-width:1}.usa-gl-ring{fill:none;stroke:var(--usa-gl-accent,#f59e0b);stroke-width:1.5;transform-box:fill-box;transform-origin:center;opacity:0}.usa-gl-mark[data-hidden]{display:none}.usa-gl-mark[data-active] .usa-gl-dot{fill:#ef4444}@media (prefers-reduced-motion:no-preference){.usa-gl-ring{animation:usa-gl-pulse 1.8s ease-out infinite}}@keyframes usa-gl-pulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(3.2);opacity:0}}";

const RAD = Math.PI / 180;
/** Orthographic projection on a unit sphere seen from longitude `lon0`, tilted by `tilt` degrees (7.6). */
function project(lat, lon, lon0 = 0, tilt = 0) {
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
function parseMarkers(s) {
    return String(s || '')
        .split(';')
        .map((part) => {
        const m = /^\s*([^:]+):\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*$/.exec(part);
        return m ? { name: m[1].trim(), lat: Math.max(-90, Math.min(90, +m[2])), lon: +m[3] } : null;
    })
        .filter((m) => !!m);
}
const R = 90;
const C = 100;
const line = (pts) => {
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
function defineGlobe(tag = 'usa-globe') {
    return defineElement(tag, (Base) => {
        class UsaGlobe extends Base {
            constructor() {
                super(...arguments);
                this._lon = 0;
                this._raf = 0;
                this._visible = false;
                this._drag = null;
            }
            static get observedAttributes() {
                return ['markers', 'speed', 'tilt', 'lon'];
            }
            get markers() {
                return parseMarkers(this.str('markers'));
            }
            get lon() {
                return this._lon;
            }
            set lon(v) {
                this._lon = ((Number(v) % 360) + 360) % 360;
                this.draw();
            }
            mount() {
                this._lon = this.num('lon', this._lon);
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const ms = this.markers;
                this.insertAdjacentHTML('beforeend', `<svg class="usa-gl-svg" data-usa-part viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="usa-gl-shade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs><circle class="usa-gl-sea" cx="100" cy="100" r="${R}"/><path class="usa-gl-grid"/><g class="usa-gl-marks">${ms.map((m) => `<g class="usa-gl-mark" data-name="${m.name.replace(/"/g, '&quot;')}"><circle class="usa-gl-ring" r="4"/><circle class="usa-gl-dot" r="3.2"/></g>`).join('')}</g><circle cx="100" cy="100" r="${R}" fill="url(#usa-gl-shade)" pointer-events="none"/></svg>`);
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', ms.length ? `Globe: ${ms.map((m) => m.name).join(', ')}` : 'Globe');
                this.draw();
                this.inView((v) => {
                    this._visible = v;
                    if (v)
                        this.spin();
                    else
                        cancelAnimationFrame(this._raf);
                });
                // contract-exempt: keyboard-click-only — drag-to-rotate decoration; the globe auto-rotates and carries no action
                this.listen(this, 'pointerdown', (e) => {
                    this._drag = { x: e.clientX, lon: this._lon };
                    this.setPointerCapture?.(e.pointerId);
                });
                this.listen(this, 'pointermove', (e) => {
                    if (this._drag)
                        this.lon = this._drag.lon - (e.clientX - this._drag.x) * 0.6;
                });
                const up = () => (this._drag = null);
                this.listen(this, 'pointerup', up);
                this.listen(this, 'pointercancel', up);
                this.onCleanup(() => cancelAnimationFrame(this._raf));
            }
            spin() {
                cancelAnimationFrame(this._raf);
                const speed = this.num('speed', 12);
                if (this.reduced || !speed)
                    return;
                let last = 0;
                const step = (t) => {
                    if (!this._visible || !this.isConnected)
                        return;
                    const dt = last ? Math.min(64, t - last) : 0;
                    last = t;
                    if (!this._drag)
                        this.lon = this._lon + (speed * dt) / 1000;
                    this._raf = requestAnimationFrame(step);
                };
                this._raf = requestAnimationFrame(step);
            }
            draw() {
                const grid = this.querySelector('.usa-gl-grid');
                if (!grid)
                    return;
                const tilt = this.num('tilt', 18);
                let d = '';
                for (let lon = 0; lon < 360; lon += 30)
                    d += line(Array.from({ length: 37 }, (_, i) => project(-90 + i * 5, lon, this._lon, tilt)));
                for (let lat = -60; lat <= 60; lat += 30)
                    d += line(Array.from({ length: 73 }, (_, i) => project(lat, i * 5, this._lon, tilt)));
                grid.setAttribute('d', d);
                const ms = this.markers;
                this.querySelectorAll('.usa-gl-mark').forEach((g, i) => {
                    const m = ms[i];
                    if (!m)
                        return;
                    const p = project(m.lat, m.lon, this._lon, tilt);
                    g.setAttribute('transform', `translate(${(C + p.x * R).toFixed(1)} ${(C + p.y * R).toFixed(1)})`);
                    g.toggleAttribute('data-hidden', !p.visible);
                });
            }
            async flyTo(name) {
                const m = this.markers.find((x) => x.name === name);
                if (!m)
                    return;
                const from = this._lon;
                const delta = (((m.lon - from) % 360) + 540) % 360 - 180;
                if (this.reduced)
                    this.lon = from + delta;
                else
                    await new Promise((done) => {
                        const t0 = performance.now();
                        const dur = 900;
                        const tick = (t) => {
                            const k = Math.min(1, (t - t0) / dur);
                            const e = 1 - Math.pow(1 - k, 3);
                            this.lon = from + delta * e;
                            if (k < 1 && this.isConnected)
                                requestAnimationFrame(tick);
                            else
                                done();
                        };
                        requestAnimationFrame(tick);
                    });
                this.querySelectorAll('.usa-gl-mark').forEach((g) => g.toggleAttribute('data-active', g.getAttribute('data-name') === name));
                this.emit('focus', { name, lat: m.lat, lon: m.lon });
            }
        }
        return UsaGlobe;
    }, { id: 'globe', text: css });
}

export { project as a, defineGlobe as d, parseMarkers as p };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/chunks/globe-6qzMhWwL.js.map