'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');

var css = "usa-clock-control{display:inline-block;font:600 12.5px/1 system-ui,sans-serif;--usa-clk-accent:#6366f1}.usa-clk{display:inline-flex;align-items:center;gap:8px;padding:5px;border-radius:999px;background:var(--usa-clk-bg,rgba(148,163,184,.14));border:1px solid rgba(100,116,139,.2)}.usa-clk-play{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:0;background:var(--usa-clk-accent);color:#fff;cursor:pointer}.usa-clk-play:focus-visible,.usa-clk-speed:focus-visible{outline:2px solid var(--usa-clk-accent);outline-offset:2px}.usa-clk-play svg{width:15px;height:15px;fill:currentColor}.usa-clk-tri{opacity:0;transform-origin:center;transition:opacity .15s}usa-clock-control[data-paused] .usa-clk-tri{opacity:1}usa-clock-control[data-paused] .usa-clk-bar{opacity:0}.usa-clk-speeds{position:relative;display:flex}.usa-clk-ink{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:var(--usa-clk-ink,#fff);box-shadow:0 1px 4px rgba(15,23,42,.18);transition:transform .25s cubic-bezier(.2,.8,.2,1),width .25s;opacity:0}.usa-clk-speed{position:relative;padding:8px 10px;border:0;background:none;color:inherit;font:inherit;cursor:pointer;border-radius:999px;font-variant-numeric:tabular-nums}.usa-clk-speed[aria-checked=true]{color:var(--usa-clk-accent)}@media (prefers-reduced-motion:reduce){.usa-clk-ink{transition:none}}";

function defineClockControl(tag = 'usa-clock-control') {
    return base.defineElement(tag, (Base) => {
        class UsaClockControl extends Base {
            static get observedAttributes() {
                return ['speeds', 'label'];
            }
            get rate() {
                return base.getClock().rate;
            }
            get paused() {
                return base.getClock().paused;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const speeds = this.str('speeds', '0.25,0.5,1,2')
                    .split(',')
                    .map(Number)
                    .filter((n) => Number.isFinite(n) && n > 0)
                    .slice(0, 6);
                const label = this.str('label', 'Motion clock').replace(/"/g, '&quot;');
                this.insertAdjacentHTML('beforeend', `<div class="usa-clk" role="group" aria-label="${label}" data-usa-part><button type="button" class="usa-clk-play" aria-pressed="false" aria-label="Pause animations"><svg viewBox="0 0 24 24" aria-hidden="true"><rect class="usa-clk-bar" x="6" y="5" width="4" height="14" rx="1"/><rect class="usa-clk-bar" x="14" y="5" width="4" height="14" rx="1"/><path class="usa-clk-tri" d="M7 5l12 7-12 7z"/></svg></button><div class="usa-clk-speeds" role="radiogroup" aria-label="Speed"><span class="usa-clk-ink" aria-hidden="true"></span>${speeds.map((s) => `<button type="button" role="radio" class="usa-clk-speed" data-rate="${s}" aria-checked="false">${s}×</button>`).join('')}</div></div>`);
                this.listen(this.querySelector('.usa-clk-play'), 'click', () => {
                    base.setClock({ paused: !base.getClock().paused });
                });
                this.querySelectorAll('.usa-clk-speed').forEach((b) => this.listen(b, 'click', () => base.setClock({ rate: Number(b.dataset.rate) })));
                this.onCleanup(base.onClockChange(() => this.sync(true)));
                this.sync(false);
            }
            sync(user) {
                const { rate, paused } = base.getClock();
                const play = this.querySelector('.usa-clk-play');
                if (!play)
                    return;
                play.setAttribute('aria-pressed', String(paused));
                play.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
                this.setFlag('data-paused', paused);
                let on = null;
                this.querySelectorAll('.usa-clk-speed').forEach((b) => {
                    const hit = Math.abs(Number(b.dataset.rate) - rate) < 1e-6;
                    b.setAttribute('aria-checked', String(hit));
                    if (hit)
                        on = b;
                });
                const ink = this.querySelector('.usa-clk-ink');
                const target = on;
                if (target) {
                    ink.style.opacity = '1';
                    ink.style.width = `${target.offsetWidth}px`;
                    ink.style.transform = `translateX(${target.offsetLeft}px)`;
                }
                else
                    ink.style.opacity = '0';
                if (user)
                    this.emit('change', { rate, paused });
            }
        }
        return UsaClockControl;
    }, { id: 'clock-control', text: css });
}

exports.defineClockControl = defineClockControl;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.3.0/dist/widgets/clock-control.cjs.map