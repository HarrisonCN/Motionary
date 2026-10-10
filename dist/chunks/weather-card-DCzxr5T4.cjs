'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-weather-card{--usa-wc-sky:linear-gradient(160deg,#38bdf8,#0ea5e9);position:relative;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:14px;width:var(--usa-wc-w,260px);max-width:100%;padding:16px 18px;border-radius:20px;background:var(--usa-wc-sky);color:#fff;overflow:hidden;font:500 13px/1.3 system-ui,sans-serif;box-shadow:0 12px 30px -12px rgba(2,6,23,.5);transition:background .6s}usa-weather-card[data-condition=\"cloudy\"]{--usa-wc-sky:linear-gradient(160deg,#94a3b8,#64748b)}usa-weather-card[data-condition=\"rain\"]{--usa-wc-sky:linear-gradient(160deg,#475569,#1e3a8a)}usa-weather-card[data-condition=\"snow\"]{--usa-wc-sky:linear-gradient(160deg,#cbd5e1,#60a5fa);color:#0f172a}usa-weather-card[data-condition=\"storm\"]{--usa-wc-sky:linear-gradient(160deg,#1e293b,#312e81)}usa-weather-card[data-condition=\"fog\"]{--usa-wc-sky:linear-gradient(160deg,#9ca3af,#d1d5db);color:#1f2937}usa-weather-card[data-condition=\"night\"]{--usa-wc-sky:linear-gradient(160deg,#0f172a,#1e1b4b)}.usa-wc-scene{position:relative;width:76px;height:64px}.usa-wc-icon{position:absolute;inset:0}.usa-wc-icon *{position:absolute;display:block}.usa-wc-text{display:flex;flex-direction:column;gap:2px;min-width:0}.usa-wc-temp{font:800 34px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums}.usa-wc-place{opacity:.8;font-size:12px}.usa-wc-sun{left:14px;top:8px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle,#fde047 55%,transparent 56%);animation:usa-wc-spin 14s linear infinite}.usa-wc-sun::before{content:\"\";position:absolute;inset:-8px;border-radius:50%;background:repeating-conic-gradient(#fde047 0 8deg,transparent 8deg 30deg);-webkit-mask:radial-gradient(circle,transparent 58%,#000 60%,#000 70%,transparent 72%);mask:radial-gradient(circle,transparent 58%,#000 60%,#000 70%,transparent 72%)}.usa-wc-moon{left:18px;top:6px;width:40px;height:40px;border-radius:50%;box-shadow:-10px 6px 0 2px #f1f5f9;transform:rotate(-20deg)}.usa-wc-star{width:3px;height:3px;border-radius:50%;background:#fff;left:calc(8px + var(--i) * 14px);top:calc(40px + (var(--i) * 7px) % 20px);animation:usa-wc-tw 1.8s calc(var(--i) * .35s) ease-in-out infinite alternate}.usa-wc-cloud{left:8px;top:14px;width:56px;height:22px;border-radius:12px;background:#f1f5f9;animation:usa-wc-drift 4s ease-in-out infinite alternate}.usa-wc-cloud::before{content:\"\";position:absolute;left:12px;top:-12px;width:26px;height:26px;border-radius:50%;background:inherit}.usa-wc-c2{left:22px;top:6px;transform:scale(.7);opacity:.75;animation-delay:-2s}.usa-wc-dark{background:#94a3b8}.usa-wc-drop{left:calc(16px + var(--i) * 8px);top:38px;width:2px;height:9px;border-radius:2px;background:#bfdbfe;animation:usa-wc-fall .9s calc(var(--i) * .17s) linear infinite}.usa-wc-flake{left:calc(14px + var(--i) * 9px);top:38px;width:6px;height:6px;border-radius:50%;background:#fff;animation:usa-wc-snow 2.4s calc(var(--i) * .4s) linear infinite}.usa-wc-bolt{left:30px;top:30px;width:14px;height:26px;background:#fde047;clip-path:polygon(40% 0,100% 0,60% 45%,100% 45%,20% 100%,40% 55%,0 55%);animation:usa-wc-bolt 4s ease-in-out infinite}.usa-wc-fogband{left:4px;top:calc(14px + var(--i) * 14px);width:66px;height:6px;border-radius:6px;background:rgba(255,255,255,.85);animation:usa-wc-drift calc(3s + var(--i) * .8s) ease-in-out infinite alternate}@keyframes usa-wc-spin{to{transform:rotate(360deg)}}@keyframes usa-wc-tw{from{opacity:.2}to{opacity:1}}@keyframes usa-wc-drift{from{translate:-4px 0}to{translate:6px 0}}@keyframes usa-wc-fall{from{translate:0 0;opacity:1}to{translate:-3px 22px;opacity:0}}@keyframes usa-wc-snow{from{translate:0 0;opacity:1}50%{translate:4px 12px}to{translate:-2px 24px;opacity:0}}@keyframes usa-wc-bolt{0%,86%,100%{opacity:.35}90%{opacity:1}}@media (prefers-reduced-motion:reduce){usa-weather-card *{animation:none!important}}";

const WEATHER_CONDITIONS = ['clear', 'cloudy', 'rain', 'snow', 'storm', 'fog', 'night'];
const LABEL = { clear: 'Clear', cloudy: 'Cloudy', rain: 'Rain', snow: 'Snow', storm: 'Thunderstorm', fog: 'Fog', night: 'Clear night' };
const icon = (c) => {
    const drops = (cls, n) => Array.from({ length: n }, (_, i) => `<i class="${cls}" style="--i:${i}"></i>`).join('');
    switch (c) {
        case 'clear':
            return '<span class="usa-wc-sun"></span>';
        case 'night':
            return `<span class="usa-wc-moon"></span>${drops('usa-wc-star', 5)}`;
        case 'cloudy':
            return '<span class="usa-wc-cloud usa-wc-c2"></span><span class="usa-wc-cloud"></span>';
        case 'rain':
            return `<span class="usa-wc-cloud"></span>${drops('usa-wc-drop', 6)}`;
        case 'snow':
            return `<span class="usa-wc-cloud"></span>${drops('usa-wc-flake', 6)}`;
        case 'storm':
            return `<span class="usa-wc-cloud usa-wc-dark"></span><span class="usa-wc-bolt"></span>${drops('usa-wc-drop', 4)}`;
        default:
            return `${drops('usa-wc-fogband', 3)}`;
    }
};
function defineWeatherCard(tag = 'usa-weather-card') {
    return base.defineElement(tag, (Base) => {
        class UsaWeatherCard extends Base {
            static get observedAttributes() {
                return ['condition', 'temp', 'place', 'unit', 'label'];
            }
            get condition() {
                return this.dataset.condition || 'clear';
            }
            set condition(v) {
                this.setAttribute('condition', v);
            }
            mount() {
                const c = this.str('condition', 'clear');
                const cond = WEATHER_CONDITIONS.includes(c) ? c : 'clear';
                const changed = this.dataset.condition && this.dataset.condition !== cond;
                this.dataset.condition = cond;
                const temp = this.num('temp', NaN);
                const unit = this.str('unit', '°');
                const label = this.str('label', LABEL[cond]);
                const place = this.str('place', '');
                this.setAttribute('role', 'group');
                this.setAttribute('aria-label', [label, Number.isFinite(temp) ? `${Math.round(temp)}${unit}` : '', place].filter(Boolean).join(', '));
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const scene = document.createElement('div');
                scene.className = 'usa-wc-scene';
                scene.setAttribute('aria-hidden', 'true');
                scene.setAttribute('data-usa-part', '');
                scene.innerHTML = `<span class="usa-wc-icon">${icon(cond)}</span>`;
                const text = document.createElement('div');
                text.className = 'usa-wc-text';
                text.setAttribute('data-usa-part', '');
                text.setAttribute('aria-hidden', 'true');
                text.innerHTML = `<b class="usa-wc-temp">${Number.isFinite(temp) ? Math.round(temp) + unit : ''}</b><span class="usa-wc-label"></span><span class="usa-wc-place"></span>`;
                text.querySelector('.usa-wc-label').textContent = label;
                text.querySelector('.usa-wc-place').textContent = place;
                this.prepend(scene, text);
                if (this.reduced)
                    return;
                if (changed)
                    this.motion(scene, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'ease-out' });
                if (Number.isFinite(temp) && typeof requestAnimationFrame === 'function') {
                    const el = text.querySelector('.usa-wc-temp');
                    const t0 = performance.now();
                    const from = Math.round(temp) - Math.min(12, Math.abs(Math.round(temp)) + 6);
                    let raf = 0;
                    const f = (now) => {
                        const k = Math.min(1, (now - t0) / 900);
                        el.textContent = Math.round(from + (Math.round(temp) - from) * (1 - Math.pow(1 - k, 3))) + unit;
                        if (k < 1)
                            raf = requestAnimationFrame(f);
                    };
                    raf = requestAnimationFrame(f);
                    this.onCleanup(() => cancelAnimationFrame(raf));
                }
            }
        }
        return UsaWeatherCard;
    }, { id: 'weather-card', text: css });
}

exports.WEATHER_CONDITIONS = WEATHER_CONDITIONS;
exports.defineWeatherCard = defineWeatherCard;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.8.0/dist/chunks/weather-card-DCzxr5T4.cjs.map