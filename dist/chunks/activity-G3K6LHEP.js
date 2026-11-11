const escapeActivity = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const activityNumber = (el, name, fallback, min = -Infinity, max = Infinity) => Math.min(max, Math.max(min, el.num(name, fallback)));
const activityTime = (seconds) => `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, '0')}`;
const activitySvg = (body, viewBox = '0 0 240 80', cls = '') => `<svg class="${cls}" viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;
function activityBars(values, color = 'currentColor', y = 56, width = 220) {
    const step = width / values.length;
    return values.map((v, i) => `<rect class="usa-ac-bar" style="--i:${i}" x="${10 + i * step}" y="${y - v}" width="${Math.max(2, step * .5)}" height="${Math.max(2, v)}" rx="2" fill="${color}"/>`).join('');
}
const activityButton = (action, label, icon, disabled = false) => `<button type="button" data-action="${action}" aria-label="${escapeActivity(label)}"${disabled ? ' disabled' : ''}>${icon}</button>`;
const activityIcon = (name) => {
    const path = name === 'plane' ? 'M3 13l7-2V4l2-2 2 2v7l7 2v2l-7-1v5l3 2v1l-5-1-5 1v-1l3-2v-5l-7 1z'
        : name === 'heart' ? 'M12 21C8 18 2 14 2 8a5 5 0 0 1 10-2A5 5 0 0 1 22 8c0 6-6 10-10 13z'
            : name === 'play' ? 'M7 3l15 9-15 9z' : name === 'pause' ? 'M5 3h5v18H5zM15 3h5v18h-5z'
                : name === 'stop' ? 'M5 5h14v14H5z' : name === 'close' ? 'M5 5l14 14M19 5L5 19'
                    : name === 'target' ? 'M12 1v5m0 12v5M1 12h5m12 0h5M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z'
                        : name === 'phone' ? 'M6 3l4 5-3 3c1 3 3 5 6 6l3-3 5 4-2 4C9 22 2 15 2 5z'
                            : name === 'message' ? 'M3 3h18v14H10l-6 5v-5H3z'
                                : name === 'home' ? 'M2 11L12 2l10 9v11h-7v-7H9v7H2z'
                                    : name === 'car' ? 'M3 10l3-6h12l3 6v10h-4v-3H7v3H3zM3 11h18M6 13v2m12-2v2'
                                        : name === 'package' ? 'M2 6l10-5 10 5v13l-10 4-10-4zM2 6l10 5 10-5M12 11v12M7 4l10 5'
                                            : name === 'bike' ? 'M9 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0M23 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0M5 17l5-9 5 9H5m14 0L14 5h-3M7 5h4'
                                                : name === 'train' ? 'M5 2h14v16H5zM8 21l2-3m6 3l-2-3M5 11h14M8 15h1m6 0h1'
                                                    : name === 'drop' ? 'M12 2C10 6 4 11 4 16a8 8 0 0 0 16 0c0-5-6-10-8-14z'
                                                        : 'M4 12h16m-6-6l6 6-6 6';
    return activitySvg(`<path d="${path}" fill="${['plane', 'heart', 'play', 'pause', 'stop', 'home', 'message'].includes(name) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`, '0 0 24 24', 'usa-ac-icon');
};
/** Update in place so clocks preserve native focus and running SVG/CSS animations. */
function patchActivity(parent, html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const patch = (target, source) => {
        if (target.nodeType === 3) {
            if (target.nodeValue !== source.nodeValue)
                target.nodeValue = source.nodeValue;
            return;
        }
        if (target instanceof Element && source instanceof Element) {
            for (const attr of Array.from(target.attributes))
                if (!source.hasAttribute(attr.name))
                    target.removeAttribute(attr.name);
            for (const attr of Array.from(source.attributes))
                if (target.getAttribute(attr.name) !== attr.value)
                    target.setAttribute(attr.name, attr.value);
        }
        const incoming = Array.from(source.childNodes);
        incoming.forEach((next, index) => {
            const current = target.childNodes[index];
            if (!current)
                target.appendChild(next.cloneNode(true));
            else if (current.nodeType !== next.nodeType || current.nodeName !== next.nodeName)
                target.replaceChild(next.cloneNode(true), current);
            else
                patch(current, next);
        });
        while (target.childNodes.length > incoming.length)
            target.removeChild(target.lastChild);
    };
    patch(parent, template.content);
}
/** Shared lifecycle; no simulation or network access. Clocks run only when explicitly enabled and visible. */
function activityClass(Base, kind, render, initial, clock) {
    const percentage = ['flight-status', 'transit-progress', 'delivery-tracker', 'orbit-pass', 'race-telemetry', 'ride-status'].includes(kind);
    return class Activity extends Base {
        get value() { return Math.min(percentage ? 100 : kind === 'coffee-timer' ? Math.max(1, this.num('duration', 30)) : Infinity, Math.max(0, this.num('value', initial))); }
        set value(value) { this.setAttribute('value', String(Number.isFinite(value) ? Math.max(0, value) : 0)); }
        update(data) {
            const allowed = this.constructor.observedAttributes;
            for (const [key, value] of Object.entries(data))
                if (allowed.includes(key)) {
                    if (value === null || value === false)
                        this.removeAttribute(key);
                    else
                        this.setAttribute(key, value === true ? '' : String(value));
                }
        }
        play() { if (!this.flag('disabled'))
            this.setFlag('running', true); }
        pause() { this.setFlag('running', false); }
        reset() { this.pause(); this.value = this._initial ?? initial; }
        notify(type, detail) { this.emit(type, detail); }
        changed() { this._paint?.(); }
        mount() {
            this._initial ?? (this._initial = this.value);
            this.classList.add('usa-activity');
            this.dataset.activity = kind;
            this.setAttribute('role', 'group');
            this.querySelectorAll(':scope > [data-usa-activity-part]').forEach(n => n.remove());
            const part = document.createElement('div');
            part.className = 'usa-ac-content';
            part.setAttribute('data-usa-activity-part', '');
            this.prepend(part);
            let visible = typeof IntersectionObserver === 'undefined', timer, last = 0;
            const stop = () => { if (timer !== undefined)
                clearInterval(timer); timer = undefined; };
            const sync = () => {
                this.setAttribute('aria-label', this.str('label', kind.replace(/-/g, ' ')));
                patchActivity(part, render(this));
                const active = visible && !document.hidden && !this.flag('disabled');
                this.toggleAttribute('data-activity-animate', active && this.flag('animated') && !this.reduced);
                this.toggleAttribute('data-activity-reduced', this.reduced);
                if (clock && active && this.flag('running')) {
                    if (timer === undefined) {
                        last = performance.now();
                        timer = setInterval(() => {
                            const elapsed = Math.floor((performance.now() - last) / 1000);
                            if (elapsed < 1)
                                return;
                            last += elapsed * 1000;
                            const max = kind === 'coffee-timer' ? Math.max(1, this.num('duration', 30)) : Infinity;
                            this.value = Math.min(max, Math.max(0, this.value + (clock === 'remaining' ? -elapsed : elapsed)));
                            this.notify('tick', { value: this.value });
                            if (clock === 'remaining' ? this.value === 0 : this.value >= max) {
                                this.pause();
                                this.notify('complete', { value: this.value });
                            }
                        }, 250);
                    }
                }
                else
                    stop();
            };
            this._paint = sync;
            this.listen(part, 'click', (event) => {
                const b = event.target.closest('button[data-action]');
                if (!b || !part.contains(b) || b.disabled || this.flag('disabled'))
                    return;
                const action = b.dataset.action;
                if (action === 'toggle')
                    this.flag('running') ? this.pause() : this.play();
                else if (action === 'reset')
                    this.reset();
                else if (action === 'stop')
                    this.pause();
                this.notify('action', { action, value: this.value, running: this.flag('running') });
                this.notify('change', { value: this.value, running: this.flag('running'), action });
            });
            this.inView(v => { visible = v; sync(); });
            this.listen(document, 'visibilitychange', sync);
            if (typeof matchMedia === 'function')
                this.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', sync);
            this.onCleanup(() => { stop(); this._paint = undefined; this.removeAttribute('data-activity-animate'); });
            sync();
        }
    };
}

const ids = /*#__PURE__*/ new WeakMap();
let serial = 0;
const uid = (el, suffix) => { if (!ids.has(el))
    ids.set(el, ++serial); return `usa-activity-${ids.get(el)}-${suffix}`; };
const text = (el, key, fallback) => escapeActivity(el.str(key, fallback));
const chart = (el, defaults) => {
    const values = el.str('values').split(',').map(v => v.trim()).filter(Boolean).map(Number).filter(Number.isFinite);
    return values.length ? values : defaults;
};
function flightView(el) {
    const progress = activityNumber(el, 'value', 68, 0, 100);
    return `<div class="usa-ac-row usa-ac-small"><span>${text(el, 'origin', 'San Francisco')}</span><span>${text(el, 'destination', 'Edmonton')}</span></div>
  <div class="usa-ac-flight"><strong>${text(el, 'from', 'SFO')}</strong><div class="usa-ac-route"><i style="width:${progress}%"></i><span style="left:${progress}%">${activityIcon('plane')}</span></div><strong>${text(el, 'to', 'YEG')}</strong></div>
  <div class="usa-ac-row usa-ac-small"><span>${text(el, 'departure', '9:59 PM')}</span><em>${text(el, 'status', 'Arrives in 20m')}</em><span>${text(el, 'arrival', '12:59 AM')}</span></div>`;
}
function transitView(el) {
    const names = el.str('stations', 'Harajuku,Shibuya,Ebisu').split(',').map(s => s.trim()).filter(Boolean);
    const p = activityNumber(el, 'value', 50, 0, 100);
    return `<div class="usa-ac-transit"><div class="usa-ac-transit-fill" style="width:${p}%"></div><i style="left:${p}%"></i></div><div class="usa-ac-row usa-ac-stations">${names.map((s, i) => `<span${i === Math.round((names.length - 1) * p / 100) ? ' aria-current="step"' : ''}>${escapeActivity(s)}</span>`).join('')}</div>`;
}
function sunView(el) {
    return `<div class="usa-ac-row usa-ac-sun-labels"><span>${text(el, 'now-label', 'Now')}</span><span>${text(el, 'sunset-label', 'Sunset')}</span><span>${text(el, 'dusk-label', 'Dusk')}</span></div><div class="usa-ac-sun-strip"><div class="usa-ac-day"><i></i></div><div class="usa-ac-sunset"></div><div class="usa-ac-dusk"><b>·</b><b>·</b><b>·</b><b>·</b></div></div><div class="usa-ac-row usa-ac-sun-labels"><span>${text(el, 'now', '5:50 PM')}</span><span>${text(el, 'sunset', 'in 57m')}</span><span>${text(el, 'dusk', '8:12')}</span></div>`;
}
function deliveryView(el) {
    if (el.str('stage') === 'out') {
        return `<div class="usa-ac-delivery-out"><div><span class="usa-ac-kicker">${text(el, 'status-label', 'STATUS')}</span><strong>${text(el, 'status', 'Out for delivery')}</strong><small>${text(el, 'eta-label', 'ETA')}</small><p>${text(el, 'eta', '15–30 min')}</p></div><div class="usa-ac-map" aria-hidden="true"><svg viewBox="0 0 80 80"><path d="M25 12v20q0 10 10 10h6"/><rect x="20" y="10" width="10" height="13" rx="2"/><circle cx="39" cy="42" r="4"/></svg></div></div>`;
    }
    const p = activityNumber(el, 'value', 34, 0, 100), disabled = el.flag('disabled');
    return `<div class="usa-ac-row usa-ac-small"><span>${text(el, 'status', 'Picking up order')}</span><span>${text(el, 'eta', 'ETA 5:50')}</span></div><div class="usa-ac-delivery-track"><i style="width:${p}%"></i><span>${activityIcon('package')}</span><span>${activityIcon('car')}</span><span>${activityIcon('home')}</span></div><div class="usa-ac-row usa-ac-driver"><span class="usa-ac-avatar" aria-hidden="true">D</span><span>${text(el, 'driver', 'Dave')}</span><div class="usa-ac-actions">${activityButton('call', el.str('call-label', 'Call driver'), activityIcon('phone'), disabled)}${activityButton('message', el.str('message-label', 'Message driver'), activityIcon('message'), disabled)}</div></div>`;
}
function glucoseView(el) {
    const values = chart(el, [8, 12, 10, 18, 12, 18, 12, 14, 11, 14, 32, 28, 22, 47, 36, 54, 34, 20, 14, 8, 8, 16, 10, 18]);
    const max = values.reduce((m, v) => Math.max(m, Math.abs(v)), 1), gradient = uid(el, 'glucose');
    return `<div class="usa-ac-row"><span><strong>${activityNumber(el, 'value', 7.2).toFixed(1)}</strong> <small>${text(el, 'unit', 'mmol/L')}</small></span><span class="usa-ac-muted">↓ ${text(el, 'trend', '2.2')}</span></div>${activitySvg(`<defs><linearGradient id="${gradient}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="240" y2="0"><stop stop-color="#8373ff"/><stop offset=".28" stop-color="#a490ff"/><stop offset=".39" stop-color="#caffdd"/><stop offset=".49" stop-color="#c495f4"/><stop offset=".61" stop-color="#ff60d7"/><stop offset=".78" stop-color="#9e76ff"/><stop offset="1" stop-color="#8277ff"/></linearGradient></defs><path d="M64 16v61m80-61v61" stroke="#181821"/>${values.map((v, i) => `<rect class="usa-ac-bar" style="--i:${i}" x="${8 + i * 224 / values.length}" y="${66 - Math.abs(v) / max * 52}" width="4" height="${Math.max(7, Math.abs(v) / max * 60)}" rx="2" fill="url(#${gradient})"/>`).join('')}`, '0 0 240 82', 'usa-ac-glucose-chart')}<div class="usa-ac-axis"><span>${text(el, 'start', '1PM')}</span><span>${text(el, 'middle', '2PM')}</span><span>${text(el, 'end', 'NOW')}</span></div>`;
}
function coffeeView(el) {
    const duration = Math.max(1, activityNumber(el, 'duration', 30)), value = activityNumber(el, 'value', 18, 0, duration), running = el.flag('running');
    return `<div class="usa-ac-coffee-scale"><span>0</span><span>${Math.round(duration / 3)}</span><span>${Math.round(duration * 2 / 3)}</span></div><div class="usa-ac-coffee-bars">${Array.from({ length: 27 }, (_, i) => `<i style="--i:${i};opacity:${i / 26 <= value / duration ? 1 : .28}"></i>`).join('')}</div><div class="usa-ac-row usa-ac-coffee-bottom"><span>${text(el, 'drink', 'Espresso')}</span>${activityButton(running ? 'stop' : 'toggle', running ? 'Stop timer' : 'Start timer', activityIcon(running ? 'stop' : 'play'), el.flag('disabled'))}<strong>${Math.floor(value)}<small>s</small></strong></div>`;
}
function heartbeatView(el) {
    const values = chart(el, [6, 9, 7, 14, 20, 34, 38, 18, 11, 30, 35, 25, 39, 37, 19, 14, 8, 10, 7, 14]);
    const max = values.reduce((m, v) => Math.max(m, Math.abs(v)), 1);
    return `<div class="usa-ac-row"><span><strong>${activityNumber(el, 'value', 82, 0)}</strong> <small>${text(el, 'unit', 'mmhg')}</small></span><span class="usa-ac-small">${text(el, 'period', '5 min')}</span></div>${activitySvg(values.map((v, i) => { const h = Math.abs(v) / max * 44, x = 10 + i * 220 / (values.length - 1 || 1); return `<g class="usa-ac-dot-column" style="--i:${i};--amp:${h * .175}px"><path d="M${x} ${27 - h / 2}v${h}" stroke="currentColor" opacity=".3"/><circle cx="${x}" cy="${27 - h / 2}" r="3.7" fill="currentColor"/><circle cx="${x}" cy="${27 + h / 2}" r="3.7" fill="currentColor"/></g>`; }).join(''), '0 0 240 55', 'usa-ac-heart-chart')}`;
}
function orbitView(el) {
    const p = activityNumber(el, 'value', 76, 0, 100), x = 18 + p * 2.04, y = 89 - 182 * (p / 100) * (1 - p / 100), gradient = uid(el, 'orbit');
    return `<div class="usa-ac-row usa-ac-small"><span>${text(el, 'title', 'ISS Flyover')}</span><em>${text(el, 'eta', 'in 15 min')}</em></div>${activitySvg(`<defs><linearGradient id="${gradient}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#82cfff" stop-opacity=".9"/><stop offset="1" stop-color="#5479ef" stop-opacity="0"/></linearGradient></defs><path d="M18 89Q120-2 222 89" fill="none" stroke="#5976ba" stroke-width="10" stroke-linecap="round"/><path d="M80 47Q120 24 160 47L120 99z" fill="url(#${gradient})"/><path d="M84 47Q120 31 156 47" fill="none" stroke="#89d5f7" stroke-width="14" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="4.5" fill="white"/><g transform="translate(35 32) rotate(-30)" stroke="white" stroke-width="3"><path d="M-8 0H8m-3-7v14m-10-14v14M-12-5v10m24-10v10"/></g>`, '0 0 240 98', 'usa-ac-orbit-chart')}`;
}
function meterView(el) {
    const value = activityNumber(el, 'value', 81, 0), max = Math.max(1, activityNumber(el, 'max', 120)), progress = Math.min(1, value / max);
    return `<div class="usa-ac-meter">${activitySvg(`<circle cx="16" cy="16" r="12" fill="none" stroke="#143031" stroke-width="2.5"/><circle cx="16" cy="16" r="12" fill="none" stroke="#78ded5" stroke-width="2.5" stroke-dasharray="${progress * 75.4} 75.4" transform="rotate(-90 16 16)" stroke-linecap="round"/>`, '0 0 32 32')}<span>${text(el, 'title', 'Meter Remaining')}</span><strong>${activityTime(value)}</strong></div>`;
}
function raceView(el) {
    const path = 'M28 68C8 50 12 15 36 20S70 46 91 50 123 66 121 91 96 109 77 91 43 80 28 68Z';
    const laps = el.str('laps', '1:16:36,1:17:24,1:18:15').split(',').map(s => s.trim()).filter(Boolean);
    const p = activityNumber(el, 'value', 72, 0, 100), lap = Math.floor(activityNumber(el, 'lap', 5, 1));
    return `<div class="usa-ac-race"><div class="usa-ac-track">${activitySvg(`<path d="${path}" fill="none" stroke="#461720" stroke-width="8"/><path d="${path}" fill="none" stroke="#fc667a" stroke-width="3" pathLength="100" stroke-dasharray="${p} 100"/><circle cx="28" cy="68" r="4" fill="#ffe178"/><circle class="usa-ac-racer" style="offset-path:path('${path}');offset-distance:${p}%" r="4" fill="#fff"/>`, '0 0 140 115')}<span>${text(el, 'sector', 'Sector 2')}</span></div><div class="usa-ac-laps"><div>${text(el, 'lap-label', 'Lap')} ${lap}</div>${laps.map((s, i) => `<p><span>${text(el, 'lap-label', 'Lap')} ${Math.max(1, lap - i - 1)}</span><span>${escapeActivity(s)}</span></p>`).join('')}</div></div>`;
}
function workoutView(el) {
    const values = chart(el, [10, 14, 18, 15, 23, 29, 19, 38, 32, 25, 47, 39, 33, 26, 41, 30, 22, 14, 18, 15, 9, 7, 6, 5, 6, 4]);
    const max = values.reduce((m, v) => Math.max(m, Math.abs(v)), 1), running = el.flag('running'), disabled = el.flag('disabled');
    return `<div class="usa-ac-row"><span>${activityTime(activityNumber(el, 'value', 1515, 0))}</span><span>${text(el, 'distance', '2.0')}<small>${text(el, 'unit', 'ᴹᴵ')}</small></span></div>${activitySvg(activityBars(values.map(v => Math.abs(v) / max * 47)), '0 0 240 61', 'usa-ac-workout-chart')}<div class="usa-ac-player">${activityButton('reset', el.str('reset-label', 'Reset workout'), activityIcon('close'), disabled)}${activityButton('toggle', running ? 'Pause workout' : 'Resume workout', activityIcon(running ? 'pause' : 'play'), disabled)}${activityButton('target', el.str('target-label', 'Workout target'), activityIcon('target'), disabled)}</div>`;
}
function pillView(el) {
    const tones = ['mint', 'pink', 'blue', 'purple', 'lime', 'red'], tone = tones.includes(el.str('tone')) ? el.str('tone') : 'mint';
    return `<div class="usa-ac-pill" data-tone="${tone}" data-icon="${escapeActivity(el.str('icon', 'train'))}">${activityIcon(el.str('icon', 'train'))}<span>${text(el, 'value', '5')}</span><small>${text(el, 'unit', 'MT')}</small><span class="usa-ac-pill-end">${text(el, 'status', '')}</span></div>`;
}
function rideView(el) {
    const p = activityNumber(el, 'value', 48, 0, 100), disabled = el.flag('disabled');
    return `<div class="usa-ac-small usa-ac-muted">${text(el, 'status', 'Drop off in 1 min')}</div><div class="usa-ac-ride-line"><i style="width:${p}%"></i>${activityButton('toggle', el.flag('running') ? 'Pause ride display' : 'Resume ride display', activityIcon(el.flag('running') ? 'pause' : 'play'), disabled)}</div><div class="usa-ac-row usa-ac-driver"><span class="usa-ac-avatar" aria-hidden="true">M</span><span>${text(el, 'driver', 'Michael')}</span>${activityButton('call', 'Call driver', activityIcon('phone'), disabled)}</div>`;
}
function routeView(el) {
    const raw = chart(el, [48, 50, 46, 38, 23, 20, 15, 9, 5]), scale = raw.reduce((m, v) => Math.max(m, Math.abs(v)), 1);
    const values = raw.map(v => v / scale), lo = values.reduce((m, v) => Math.min(m, v), Infinity), hi = values.reduce((m, v) => Math.max(m, v), -Infinity), span = hi - lo || 1;
    const points = values.map((v, i) => `${8 + i * 224 / (values.length - 1 || 1)},${58 - (v - lo) / span * 42}`).join(' ');
    return `<div class="usa-ac-row usa-ac-small"><span>${text(el, 'title', 'On the way')}</span><span>${text(el, 'status', '45m left')}</span></div>${activitySvg(`<polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`, '0 0 240 70', 'usa-ac-route-chart')}<div class="usa-ac-row"><strong>${text(el, 'value', '6.5')} <small>${text(el, 'unit', 'MT')}</small></strong>${activityButton('details', 'Journey details', activityIcon('car'), el.flag('disabled'))}</div>`;
}

var css = ".usa-activity{display:block;box-sizing:border-box;position:relative;isolation:isolate;width:var(--usa-activity-width,232px);max-width:100%;border-radius:26px;background:#030303;color:#eee;font:400 12px/1.25 -apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;font-variant-numeric:tabular-nums;letter-spacing:.01em;box-shadow:0 10px 18px #0002,inset 0 1px 0 #ffffff05;--ac:#7fe2ca;overflow:hidden}.usa-activity *{box-sizing:border-box}.usa-activity .usa-ac-content{padding:16px 18px}.usa-activity svg{display:block;width:100%;overflow:visible}.usa-activity strong{font-size:17px;font-weight:450;letter-spacing:-.03em}.usa-activity small,.usa-ac-small{font-size:10px;font-weight:400}.usa-activity em{font-style:normal;color:var(--ac)}.usa-ac-muted{color:#8b8b96}.usa-ac-row{display:flex;align-items:center;justify-content:space-between;gap:5px}.usa-ac-row>span{min-width:0}.usa-ac-icon{display:inline-block!important;width:16px!important;height:16px;vertical-align:middle;flex:none}.usa-activity button{appearance:none;border:0;display:inline-flex;align-items:center;justify-content:center;flex:none;min-width:32px;min-height:26px;padding:4px 12px;border-radius:20px;background:#393939;color:inherit;font:inherit;cursor:pointer;touch-action:manipulation}.usa-activity button:hover{filter:brightness(1.25)}.usa-activity button:active{transform:scale(.94)}.usa-activity button:focus-visible{outline:2px solid var(--ac);outline-offset:3px}.usa-activity button:disabled{cursor:default;opacity:.4}.usa-activity button .usa-ac-icon{width:13px!important;height:13px}.usa-ac-actions{display:flex;gap:8px;margin-inline-start:auto}.usa-ac-actions button{min-width:42px}.usa-ac-flight{display:flex;align-items:center;gap:7px;margin:2px 0}.usa-ac-flight strong{font-size:20px;line-height:1.1}.usa-ac-route{height:7px;background:#143630;border-radius:20px;position:relative;flex:1;box-shadow:inset 0 1px 2px #fff5}.usa-ac-route i{height:100%;display:block;background:linear-gradient(90deg,#6fffe7,#afffe8);border-radius:inherit;box-shadow:0 0 5px #4bdcb68c}.usa-ac-route span{position:absolute;top:-6px;transform:translateX(-50%);color:#fff}.usa-ac-route .usa-ac-icon{transform:rotate(90deg);width:19px!important;height:19px}.usa-activity[data-activity=flight-status] .usa-ac-content{padding:13px 18px}.usa-ac-transit{height:9px;background:#163d26;border-radius:12px;position:relative;overflow:hidden;box-shadow:inset 0 1px 2px #fff4}.usa-ac-transit-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,#e1fa83,#d9ff88,#a0ef85);box-shadow:0 0 8px #d9ff88}.usa-ac-transit i{position:absolute;top:1px;width:7px;height:7px;border-radius:50%;background:#07180e;box-shadow:0 0 3px #dfff95;transform:translateX(-50%)}.usa-ac-stations{margin-top:7px;color:#a7c788;font-size:10px}.usa-ac-stations [aria-current]{color:#e4efc7}.usa-activity[data-activity=transit-progress] .usa-ac-content{padding:18px 20px 14px}.usa-ac-sun-labels{font-size:9px;display:grid;grid-template-columns:1.3fr .6fr 1fr;text-align:center;color:#939398}.usa-ac-sun-labels span:first-child{text-align:left;color:#fff}.usa-ac-sun-labels span:last-child{text-align:right}.usa-ac-sun-strip{display:grid;grid-template-columns:1.3fr .6fr 1fr;gap:5px;height:29px;margin:6px 0 7px}.usa-ac-sun-strip>div{border-radius:30px;position:relative;overflow:hidden;box-shadow:inset 0 1px 5px #fff4}.usa-ac-day{background:linear-gradient(90deg,#58acff,#bad6f2,#e9d3bf)}.usa-ac-day i{position:absolute;left:14px;top:8px;width:13px;height:13px;border-radius:50%;background:#fcfff1;box-shadow:0 0 10px #fffff9}.usa-ac-sunset{background:linear-gradient(90deg,#ffcc8c,#ffa6a0)}.usa-ac-dusk{background:linear-gradient(90deg,#f18aa0,#7858bc,#2c2e61)}.usa-ac-dusk b{position:absolute;color:#fff;font-size:12px;font-weight:400;right:12px;top:2px}.usa-ac-dusk b:nth-child(2){top:14px;right:19px}.usa-ac-dusk b:nth-child(3){top:4px;right:25px}.usa-ac-dusk b:nth-child(4){top:15px;right:8px}.usa-activity[data-activity=sun-timeline] .usa-ac-content{padding:17px 17px 16px}.usa-activity[data-activity=delivery-tracker]{--ac:#c9a1ff}.usa-activity[data-activity=delivery-tracker] .usa-ac-small{color:var(--ac)}.usa-ac-delivery-track{height:19px;margin:10px 0 9px;background:#502479;border-radius:12px;position:relative;display:flex;justify-content:space-between;align-items:center;padding:0 6px;color:#d8c1f6}.usa-ac-delivery-track i{height:100%;position:absolute;inset:0;background:linear-gradient(90deg,#bb7bed,#a760dd);border-radius:inherit}.usa-ac-delivery-track span{z-index:1;display:flex}.usa-ac-delivery-track .usa-ac-icon{width:13px!important;height:13px}.usa-ac-avatar{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;width:22px;height:22px;background:radial-gradient(circle at 50% 35%,#d8c2ab 0 24%,#746053 25% 30%,#c8ceca 31% 54%,#7d817b 55%);font-size:0;box-shadow:inset 0 0 0 2px #333}.usa-ac-driver>span:nth-child(2){margin-inline-end:auto}.usa-ac-delivery-out{display:flex;justify-content:space-between;gap:15px;color:#93e3c2}.usa-ac-delivery-out strong{display:block;font-size:15px;margin-top:3px}.usa-ac-kicker{font-size:8px;letter-spacing:.08em}.usa-ac-delivery-out small{display:block;font-size:8px;color:#8e9b96;margin-top:6px}.usa-ac-delivery-out p{color:#f2f7f3;font-size:17px;margin:3px 0 0}.usa-ac-map{width:73px;height:73px;flex:none;border-radius:15px;background:linear-gradient(90deg,transparent 45%,#8ce7bc18 45% 58%,transparent 58%),linear-gradient(0deg,transparent 44%,#8ce7bc15 44% 57%,transparent 57%),#153c2c;background-size:24px 24px;box-shadow:inset 0 0 15px #001b1599;overflow:hidden}.usa-ac-map svg{height:100%;color:#dcfff0}.usa-ac-map path{fill:none;stroke:currentColor;stroke-width:2}.usa-ac-map rect,.usa-ac-map circle{fill:currentColor}.usa-activity[data-activity=delivery-tracker]:has(.usa-ac-delivery-out) .usa-ac-content{padding:11px 12px 11px 18px}.usa-activity[data-activity=glucose-sparkline]{--ac:#a095f0;color:#bfb0fb}.usa-ac-glucose-chart{position:absolute;top:10px;left:10px;width:calc(100% - 20px)!important;height:82px;margin-top:0;pointer-events:none}.usa-ac-axis{position:absolute;bottom:16px;left:17px;right:17px;display:flex;justify-content:space-between;padding-left:48px;color:#686870;font-size:8px}.usa-activity[data-activity=glucose-sparkline] .usa-ac-content{position:relative;height:125px;padding:15px 17px 18px}.usa-activity[data-activity=coffee-timer]{color:#f09558;--ac:#ff9a59}.usa-ac-coffee-scale{display:flex;justify-content:space-between;padding-right:34px;font-size:9px;color:#8f8178;height:11px}.usa-ac-coffee-scale span:nth-child(2){color:#d18c61}.usa-ac-coffee-bars{height:24px;display:flex;gap:4px;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 12%,#000 91%,transparent)}.usa-ac-coffee-bars i{display:block;flex:1;min-width:3px;border-radius:2px;background:linear-gradient(0deg,#f28348,#ffbf93);box-shadow:0 0 3px #ff822e66}.usa-ac-coffee-bars i:nth-child(n+19){background:linear-gradient(0deg,#8d8d89,#eeede5)}.usa-ac-coffee-bottom{margin-top:12px;font-size:13px}.usa-ac-coffee-bottom strong{font-size:26px;line-height:1}.usa-ac-coffee-bottom strong small{font-size:22px}.usa-ac-coffee-bottom button{background:#713418;color:#ff7128;min-width:32px;min-height:32px;padding:5px;box-shadow:0 0 0 6px #26150c55}.usa-ac-coffee-bottom button .usa-ac-icon{width:17px!important;height:17px}.usa-activity[data-activity=vital-wave]{color:#ed6eae;--ac:#ed6eae}.usa-activity[data-activity=vital-wave] .usa-ac-row>span:last-child{color:#ddd}.usa-ac-heart-chart{height:43px;margin-top:7px}.usa-ac-orbit-chart{height:80px;margin-top:2px}.usa-activity[data-activity=orbit-pass]{--ac:#bde9f4}.usa-activity[data-activity=orbit-pass] .usa-ac-content{padding:12px 18px 6px}.usa-ac-meter{display:flex;align-items:center;color:#71c4c6;gap:8px}.usa-ac-meter>svg{width:28px;height:28px;flex:none;margin-right:auto}.usa-ac-meter span{font-size:10px}.usa-ac-meter strong{font-size:24px;font-weight:300}.usa-activity[data-activity=meter-countdown] .usa-ac-content{padding:14px 16px}.usa-ac-race{display:flex;align-items:center;gap:8px;color:#ea4c69}.usa-ac-track{width:100px;height:78px;flex:none;position:relative}.usa-ac-track svg{height:82px}.usa-ac-track>span{position:absolute;bottom:-2px;left:0;font-size:10px;display:block}.usa-ac-laps{flex:1;font-size:10px;text-align:right;min-width:0}.usa-ac-laps>div{margin-bottom:9px}.usa-ac-laps p{display:flex;gap:6px;justify-content:space-between;margin:0;padding:3px 0;border-top:1px solid #51202b}.usa-ac-racer{offset-rotate:0deg;transform-box:fill-box}.usa-activity[data-activity=race-telemetry] .usa-ac-content{padding:12px 17px 10px}.usa-activity[data-activity=workout-player]{color:#eddf74;--ac:#f9e474}.usa-ac-workout-chart{height:53px;margin:-8px 0 5px}.usa-ac-player{display:flex;justify-content:space-between;align-items:center}.usa-ac-player button{color:#f1e676;background:#5a501d;padding:4px 20px}.usa-ac-player button:nth-child(2){background:transparent;min-height:26px;padding:2px 10px}.usa-ac-player button:nth-child(2) .usa-ac-icon{width:20px!important;height:20px}.usa-activity[data-activity=workout-player] .usa-ac-content{padding:16px 18px 13px}.usa-ac-pill{display:flex;align-items:center;gap:5px;font-size:23px;line-height:1;color:#80d9c5}.usa-ac-pill small{font-size:11px}.usa-ac-pill .usa-ac-pill-end{margin-inline-start:auto;font-size:11px}.usa-ac-pill[data-tone=pink]{color:#ff558d}.usa-ac-pill[data-tone=blue]{color:#99bff3}.usa-ac-pill[data-tone=purple]{color:#bf81ee}.usa-ac-pill[data-tone=lime]{color:#d9ee70}.usa-ac-pill[data-tone=red]{color:#fb5278}.usa-activity[data-activity=status-pill] .usa-ac-content{padding:9px 12px}.usa-activity[data-activity=status-pill]{border-radius:24px;box-shadow:0 4px 10px #0002}.usa-ac-ride-line{height:9px;position:relative;background:#18303a;border-radius:20px;margin:12px 0 15px}.usa-ac-ride-line i{height:100%;display:block;background:linear-gradient(90deg,#91c7ff,#72a5e8);border-radius:inherit}.usa-ac-ride-line button{position:absolute;left:38%;top:-4px;background:#fff;color:#090909;min-width:18px;min-height:17px;padding:2px}.usa-ac-ride-line .usa-ac-icon{height:12px!important;width:12px!important}.usa-activity[data-activity=ride-status] .usa-ac-driver>button{padding:4px 10px}.usa-activity[data-activity=route-sparkline]{color:#6dddbe;--ac:#6dddbe}.usa-ac-route-chart{height:53px}.usa-activity[data-activity=route-sparkline] .usa-ac-content{padding:14px}.usa-activity[data-activity=route-sparkline] button{min-height:23px;padding:3px 14px}.usa-ac-bar,.usa-ac-dot-column{transform-box:fill-box;transform-origin:center}.usa-activity[data-activity-animate] .usa-ac-bar,.usa-activity[data-activity-animate] .usa-ac-dot-column>path{animation:usa-activity-pulse 2.4s ease-in-out infinite alternate;animation-delay:calc(var(--i)*-93ms)}.usa-activity[data-activity-animate] .usa-ac-racer{animation:usa-activity-lap 14s linear infinite}.usa-activity[data-activity-reduced] *,.usa-activity[data-activity-reduced] *:before,.usa-activity[data-activity-reduced] *:after,[data-usa-sensitivity=minimal] .usa-activity *,[data-usa-sensitivity=static] .usa-activity *{animation:none!important;transition:none!important}.usa-activity[data-activity-reduced] button:active{transform:none}@keyframes usa-activity-pulse{0%{transform:scaleY(.65)}100%{transform:scaleY(1)}}@keyframes usa-activity-lap{to{offset-distance:172%}}@media(prefers-reduced-motion:reduce){.usa-activity *,.usa-activity *:before,.usa-activity *:after{animation:none!important;transition:none!important}.usa-activity button:active{transform:none}}.usa-ac-pill>span:empty,.usa-ac-pill>small:empty{display:none}.usa-ac-pill[data-icon=plane]>.usa-ac-icon{transform:rotate(90deg)}.usa-ac-pill[data-tone=purple]>.usa-ac-icon{background:#9d6cdb;color:#fff;padding:4px;border-radius:7px;width:24px!important;height:24px}.usa-ac-dot-column>path,.usa-ac-dot-column>circle{transform-box:fill-box;transform-origin:center}.usa-activity[data-activity-animate] .usa-ac-dot-column>circle{animation:usa-activity-dot-top 2.4s ease-in-out infinite alternate;animation-delay:calc(var(--i)*-93ms)}.usa-activity[data-activity-animate] .usa-ac-dot-column>circle:last-of-type{animation-name:usa-activity-dot-bottom}@keyframes usa-activity-dot-top{from{transform:translateY(var(--amp))}to{transform:translateY(0)}}@keyframes usa-activity-dot-bottom{from{transform:translateY(calc(var(--amp)*-1))}to{transform:translateY(0)}}";

export { activityClass as a, coffeeView as b, css as c, deliveryView as d, rideView as e, flightView as f, glucoseView as g, routeView as h, heartbeatView as i, meterView as m, orbitView as o, pillView as p, raceView as r, sunView as s, transitView as t, workoutView as w };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/chunks/activity-G3K6LHEP.js.map