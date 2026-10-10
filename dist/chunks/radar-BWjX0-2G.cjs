'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-radar{display:block;width:var(--usa-rd-size,200px);max-width:100%;aspect-ratio:1;--usa-rd-c:#22d3ee}.usa-rd{position:relative;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,#082f49 0,#020617 75%);box-shadow:0 0 0 2px color-mix(in srgb,var(--usa-rd-c) 45%,transparent),0 0 24px -4px var(--usa-rd-c);overflow:hidden}.usa-rd-ring{position:absolute;left:50%;top:50%;width:var(--r);height:var(--r);border:1px solid color-mix(in srgb,var(--usa-rd-c) 30%,transparent);border-radius:50%;transform:translate(-50%,-50%)}.usa-rd-cross{position:absolute;inset:0;background:linear-gradient(color-mix(in srgb,var(--usa-rd-c) 25%,transparent),color-mix(in srgb,var(--usa-rd-c) 25%,transparent)) 50% 0/1px 100% no-repeat,linear-gradient(color-mix(in srgb,var(--usa-rd-c) 25%,transparent),color-mix(in srgb,var(--usa-rd-c) 25%,transparent)) 0 50%/100% 1px no-repeat}.usa-rd-sweep{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 300deg,color-mix(in srgb,var(--usa-rd-c) 15%,transparent) 330deg,color-mix(in srgb,var(--usa-rd-c) 70%,transparent) 360deg);animation:usa-rd-turn var(--usa-rd-period,4s) linear infinite;animation-play-state:paused}usa-radar[data-live] .usa-rd-sweep{animation-play-state:running}@keyframes usa-rd-turn{to{transform:rotate(360deg)}}.usa-rd-dot{position:absolute;width:8px;height:8px;border-radius:50%;background:var(--usa-rd-c);box-shadow:0 0 8px 2px var(--usa-rd-c);transform:translate(-50%,-50%);opacity:.15}.usa-rd-dot[data-lit]{opacity:1}.usa-rd-dot em{position:absolute;left:10px;top:-5px;font:600 9px/1 ui-monospace,Menlo,monospace;font-style:normal;color:var(--usa-rd-c);white-space:nowrap}@media (prefers-reduced-motion:reduce){.usa-rd-sweep{animation:none;transform:rotate(45deg)}}";

/** "A:40,0.6; B:200,0.3" → targets (bearing normalised to 0–360, distance clamped 0–1) (8.4). */
function parseTargets(s) {
    return s
        .split(';')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
        const m = p.match(/^(.*?):\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)$/);
        if (!m)
            return null;
        return { name: m[1].trim(), bearing: ((Number(m[2]) % 360) + 360) % 360, distance: Math.min(1, Math.max(0, Number(m[3]))) };
    })
        .filter(Boolean);
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineRadar(tag = 'usa-radar') {
    return base.defineElement(tag, (Base) => {
        class UsaRadar extends Base {
            constructor() {
                super(...arguments);
                this._t = null;
                this._timers = [];
            }
            static get observedAttributes() {
                return ['targets', 'rings', 'speed', 'label'];
            }
            get targets() {
                return (this._t || parseTargets(this.str('targets'))).map((t) => ({ ...t }));
            }
            set targets(v) {
                this.setTargets(v);
            }
            setTargets(list) {
                this._t = list.map((t) => ({ name: String(t.name), bearing: ((Number(t.bearing) % 360) + 360) % 360, distance: Math.min(1, Math.max(0, Number(t.distance))) }));
                if (this.isConnected)
                    this.changed('targets');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const ts = this.targets;
                const rings = Math.max(1, Math.min(8, Math.round(this.num('rings', 4))));
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', `${this.str('label', 'Radar')}: ${ts.length ? ts.map((t) => `${t.name} at ${Math.round(t.bearing)}°`).join(', ') : 'no targets'}`);
                const ringHtml = Array.from({ length: rings }, (_, i) => `<i class="usa-rd-ring" style="--r:${((i + 1) / rings) * 100}%"></i>`).join('');
                const dots = ts
                    .map((t, i) => {
                    const a = ((t.bearing - 90) * Math.PI) / 180;
                    const x = 50 + Math.cos(a) * t.distance * 48;
                    const y = 50 + Math.sin(a) * t.distance * 48;
                    return `<span class="usa-rd-dot" data-i="${i}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%"><em>${esc(t.name)}</em></span>`;
                })
                    .join('');
                this.insertAdjacentHTML('beforeend', `<div class="usa-rd" aria-hidden="true" data-usa-part>${ringHtml}<i class="usa-rd-cross"></i><i class="usa-rd-sweep"></i>${dots}</div>`);
                const period = Math.max(1, this.num('speed', 4)) * 1000;
                this.querySelector('.usa-rd').style.setProperty('--usa-rd-period', `${period}ms`);
                if (this.reduced) {
                    this.querySelectorAll('.usa-rd-dot').forEach((d) => d.setAttribute('data-lit', ''));
                    return;
                }
                this.inView((v) => {
                    this.setFlag('data-live', v);
                    this._timers.forEach(clearTimeout);
                    this._timers = [];
                    if (!v)
                        return;
                    const start = performance.now();
                    const ping = (t, i) => {
                        const d = this.querySelector(`.usa-rd-dot[data-i="${i}"]`);
                        if (!d || !this.isConnected)
                            return;
                        this.motion(d, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1.5)' }, { opacity: 0.15, transform: 'translate(-50%,-50%) scale(1)' }], { duration: period * 0.85, easing: 'ease-out', fill: 'forwards' });
                        this.emit('ping', { name: t.name });
                        this._timers.push(setTimeout(() => ping(t, i), period));
                    };
                    ts.forEach((t, i) => {
                        const elapsed = (performance.now() - start) % period;
                        const at = ((t.bearing / 360) * period - elapsed + period) % period;
                        this._timers.push(setTimeout(() => ping(t, i), at));
                    });
                });
                this.onCleanup(() => this._timers.forEach(clearTimeout));
            }
        }
        return UsaRadar;
    }, { id: 'radar', text: css });
}

exports.defineRadar = defineRadar;
exports.parseTargets = parseTargets;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.7.0/dist/chunks/radar-BWjX0-2G.cjs.map