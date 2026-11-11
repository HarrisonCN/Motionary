import type { UsaBase } from '../base';
import { escapeActivity as e, activityNumber as n, activityTime as time, activitySvg as svg, activityBars as bars, activityButton as button, activityIcon as icon } from './activity-common';

const ids = /*#__PURE__*/ new WeakMap<Element, number>();
let serial = 0;
const uid = (el: Element, suffix: string) => { if (!ids.has(el)) ids.set(el, ++serial); return `usa-activity-${ids.get(el)}-${suffix}`; };
const text = (el: UsaBase, key: string, fallback: string) => e(el.str(key, fallback));
const chart = (el: UsaBase, defaults: number[]): number[] => {
  const values = el.str('values').split(',').map(v => v.trim()).filter(Boolean).map(Number).filter(Number.isFinite);
  return values.length ? values : defaults;
};

export function flightView(el: UsaBase): string {
  const progress = n(el, 'value', 68, 0, 100);
  return `<div class="usa-ac-row usa-ac-small"><span>${text(el, 'origin', 'San Francisco')}</span><span>${text(el, 'destination', 'Edmonton')}</span></div>
  <div class="usa-ac-flight"><strong>${text(el, 'from', 'SFO')}</strong><div class="usa-ac-route"><i style="width:${progress}%"></i><span style="left:${progress}%">${icon('plane')}</span></div><strong>${text(el, 'to', 'YEG')}</strong></div>
  <div class="usa-ac-row usa-ac-small"><span>${text(el, 'departure', '9:59 PM')}</span><em>${text(el, 'status', 'Arrives in 20m')}</em><span>${text(el, 'arrival', '12:59 AM')}</span></div>`;
}

export function transitView(el: UsaBase): string {
  const names = el.str('stations', 'Harajuku,Shibuya,Ebisu').split(',').map(s => s.trim()).filter(Boolean);
  const p = n(el, 'value', 50, 0, 100);
  return `<div class="usa-ac-transit"><div class="usa-ac-transit-fill" style="width:${p}%"></div><i style="left:${p}%"></i></div><div class="usa-ac-row usa-ac-stations">${names.map((s, i) => `<span${i === Math.round((names.length - 1) * p / 100) ? ' aria-current="step"' : ''}>${e(s)}</span>`).join('')}</div>`;
}

export function sunView(el: UsaBase): string {
  return `<div class="usa-ac-row usa-ac-sun-labels"><span>${text(el, 'now-label', 'Now')}</span><span>${text(el, 'sunset-label', 'Sunset')}</span><span>${text(el, 'dusk-label', 'Dusk')}</span></div><div class="usa-ac-sun-strip"><div class="usa-ac-day"><i></i></div><div class="usa-ac-sunset"></div><div class="usa-ac-dusk"><b>·</b><b>·</b><b>·</b><b>·</b></div></div><div class="usa-ac-row usa-ac-sun-labels"><span>${text(el, 'now', '5:50 PM')}</span><span>${text(el, 'sunset', 'in 57m')}</span><span>${text(el, 'dusk', '8:12')}</span></div>`;
}

export function deliveryView(el: UsaBase): string {
  if (el.str('stage') === 'out') {
    return `<div class="usa-ac-delivery-out"><div><span class="usa-ac-kicker">${text(el, 'status-label', 'STATUS')}</span><strong>${text(el, 'status', 'Out for delivery')}</strong><small>${text(el, 'eta-label', 'ETA')}</small><p>${text(el, 'eta', '15–30 min')}</p></div><div class="usa-ac-map" aria-hidden="true"><svg viewBox="0 0 80 80"><path d="M25 12v20q0 10 10 10h6"/><rect x="20" y="10" width="10" height="13" rx="2"/><circle cx="39" cy="42" r="4"/></svg></div></div>`;
  }
  const p = n(el, 'value', 34, 0, 100), disabled = el.flag('disabled');
  return `<div class="usa-ac-row usa-ac-small"><span>${text(el, 'status', 'Picking up order')}</span><span>${text(el, 'eta', 'ETA 5:50')}</span></div><div class="usa-ac-delivery-track"><i style="width:${p}%"></i><span>${icon('package')}</span><span>${icon('car')}</span><span>${icon('home')}</span></div><div class="usa-ac-row usa-ac-driver"><span class="usa-ac-avatar" aria-hidden="true">D</span><span>${text(el, 'driver', 'Dave')}</span><div class="usa-ac-actions">${button('call', el.str('call-label', 'Call driver'), icon('phone'), disabled)}${button('message', el.str('message-label', 'Message driver'), icon('message'), disabled)}</div></div>`;
}

export function glucoseView(el: UsaBase): string {
  const values = chart(el, [8, 12, 10, 18, 12, 18, 12, 14, 11, 14, 32, 28, 22, 47, 36, 54, 34, 20, 14, 8, 8, 16, 10, 18]);
  const max = values.reduce((m, v) => Math.max(m, Math.abs(v)), 1), gradient = uid(el, 'glucose');
  return `<div class="usa-ac-row"><span><strong>${n(el, 'value', 7.2).toFixed(1)}</strong> <small>${text(el, 'unit', 'mmol/L')}</small></span><span class="usa-ac-muted">↓ ${text(el, 'trend', '2.2')}</span></div>${svg(`<defs><linearGradient id="${gradient}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="240" y2="0"><stop stop-color="#8373ff"/><stop offset=".28" stop-color="#a490ff"/><stop offset=".39" stop-color="#caffdd"/><stop offset=".49" stop-color="#c495f4"/><stop offset=".61" stop-color="#ff60d7"/><stop offset=".78" stop-color="#9e76ff"/><stop offset="1" stop-color="#8277ff"/></linearGradient></defs><path d="M64 16v61m80-61v61" stroke="#181821"/>${values.map((v, i) => `<rect class="usa-ac-bar" style="--i:${i}" x="${8 + i * 224 / values.length}" y="${66 - Math.abs(v) / max * 52}" width="4" height="${Math.max(7, Math.abs(v) / max * 60)}" rx="2" fill="url(#${gradient})"/>`).join('')}`, '0 0 240 82', 'usa-ac-glucose-chart')}<div class="usa-ac-axis"><span>${text(el, 'start', '1PM')}</span><span>${text(el, 'middle', '2PM')}</span><span>${text(el, 'end', 'NOW')}</span></div>`;
}

export function coffeeView(el: UsaBase): string {
  const duration = Math.max(1, n(el, 'duration', 30)), value = n(el, 'value', 18, 0, duration), running = el.flag('running');
  return `<div class="usa-ac-coffee-scale"><span>0</span><span>${Math.round(duration / 3)}</span><span>${Math.round(duration * 2 / 3)}</span></div><div class="usa-ac-coffee-bars">${Array.from({ length: 27 }, (_, i) => `<i style="--i:${i};opacity:${i / 26 <= value / duration ? 1 : .28}"></i>`).join('')}</div><div class="usa-ac-row usa-ac-coffee-bottom"><span>${text(el, 'drink', 'Espresso')}</span>${button(running ? 'stop' : 'toggle', running ? 'Stop timer' : 'Start timer', icon(running ? 'stop' : 'play'), el.flag('disabled'))}<strong>${Math.floor(value)}<small>s</small></strong></div>`;
}

export function heartbeatView(el: UsaBase): string {
  const values = chart(el, [6, 9, 7, 14, 20, 34, 38, 18, 11, 30, 35, 25, 39, 37, 19, 14, 8, 10, 7, 14]);
  const max = values.reduce((m, v) => Math.max(m, Math.abs(v)), 1);
  return `<div class="usa-ac-row"><span><strong>${n(el, 'value', 82, 0)}</strong> <small>${text(el, 'unit', 'mmhg')}</small></span><span class="usa-ac-small">${text(el, 'period', '5 min')}</span></div>${svg(values.map((v, i) => { const h = Math.abs(v) / max * 44, x = 10 + i * 220 / (values.length - 1 || 1); return `<g class="usa-ac-dot-column" style="--i:${i};--amp:${h * .175}px"><path d="M${x} ${27 - h / 2}v${h}" stroke="currentColor" opacity=".3"/><circle cx="${x}" cy="${27 - h / 2}" r="3.7" fill="currentColor"/><circle cx="${x}" cy="${27 + h / 2}" r="3.7" fill="currentColor"/></g>`; }).join(''), '0 0 240 55', 'usa-ac-heart-chart')}`;
}

export function orbitView(el: UsaBase): string {
  const p = n(el, 'value', 76, 0, 100), x = 18 + p * 2.04, y = 89 - 182 * (p / 100) * (1 - p / 100), gradient = uid(el, 'orbit');
  return `<div class="usa-ac-row usa-ac-small"><span>${text(el, 'title', 'ISS Flyover')}</span><em>${text(el, 'eta', 'in 15 min')}</em></div>${svg(`<defs><linearGradient id="${gradient}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#82cfff" stop-opacity=".9"/><stop offset="1" stop-color="#5479ef" stop-opacity="0"/></linearGradient></defs><path d="M18 89Q120-2 222 89" fill="none" stroke="#5976ba" stroke-width="10" stroke-linecap="round"/><path d="M80 47Q120 24 160 47L120 99z" fill="url(#${gradient})"/><path d="M84 47Q120 31 156 47" fill="none" stroke="#89d5f7" stroke-width="14" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="4.5" fill="white"/><g transform="translate(35 32) rotate(-30)" stroke="white" stroke-width="3"><path d="M-8 0H8m-3-7v14m-10-14v14M-12-5v10m24-10v10"/></g>`, '0 0 240 98', 'usa-ac-orbit-chart')}`;
}

export function meterView(el: UsaBase): string {
  const value = n(el, 'value', 81, 0), max = Math.max(1, n(el, 'max', 120)), progress = Math.min(1, value / max);
  return `<div class="usa-ac-meter">${svg(`<circle cx="16" cy="16" r="12" fill="none" stroke="#143031" stroke-width="2.5"/><circle cx="16" cy="16" r="12" fill="none" stroke="#78ded5" stroke-width="2.5" stroke-dasharray="${progress * 75.4} 75.4" transform="rotate(-90 16 16)" stroke-linecap="round"/>`, '0 0 32 32')}<span>${text(el, 'title', 'Meter Remaining')}</span><strong>${time(value)}</strong></div>`;
}

export function raceView(el: UsaBase): string {
  const path = 'M28 68C8 50 12 15 36 20S70 46 91 50 123 66 121 91 96 109 77 91 43 80 28 68Z';
  const laps = el.str('laps', '1:16:36,1:17:24,1:18:15').split(',').map(s => s.trim()).filter(Boolean);
  const p = n(el, 'value', 72, 0, 100), lap = Math.floor(n(el, 'lap', 5, 1));
  return `<div class="usa-ac-race"><div class="usa-ac-track">${svg(`<path d="${path}" fill="none" stroke="#461720" stroke-width="8"/><path d="${path}" fill="none" stroke="#fc667a" stroke-width="3" pathLength="100" stroke-dasharray="${p} 100"/><circle cx="28" cy="68" r="4" fill="#ffe178"/><circle class="usa-ac-racer" style="offset-path:path('${path}');offset-distance:${p}%" r="4" fill="#fff"/>`, '0 0 140 115')}<span>${text(el, 'sector', 'Sector 2')}</span></div><div class="usa-ac-laps"><div>${text(el, 'lap-label', 'Lap')} ${lap}</div>${laps.map((s, i) => `<p><span>${text(el, 'lap-label', 'Lap')} ${Math.max(1, lap - i - 1)}</span><span>${e(s)}</span></p>`).join('')}</div></div>`;
}

export function workoutView(el: UsaBase): string {
  const values = chart(el, [10, 14, 18, 15, 23, 29, 19, 38, 32, 25, 47, 39, 33, 26, 41, 30, 22, 14, 18, 15, 9, 7, 6, 5, 6, 4]);
  const max = values.reduce((m, v) => Math.max(m, Math.abs(v)), 1), running = el.flag('running'), disabled = el.flag('disabled');
  return `<div class="usa-ac-row"><span>${time(n(el, 'value', 1515, 0))}</span><span>${text(el, 'distance', '2.0')}<small>${text(el, 'unit', 'ᴹᴵ')}</small></span></div>${svg(bars(values.map(v => Math.abs(v) / max * 47)), '0 0 240 61', 'usa-ac-workout-chart')}<div class="usa-ac-player">${button('reset', el.str('reset-label', 'Reset workout'), icon('close'), disabled)}${button('toggle', running ? 'Pause workout' : 'Resume workout', icon(running ? 'pause' : 'play'), disabled)}${button('target', el.str('target-label', 'Workout target'), icon('target'), disabled)}</div>`;
}

export function pillView(el: UsaBase): string {
  const tones = ['mint', 'pink', 'blue', 'purple', 'lime', 'red'], tone = tones.includes(el.str('tone')) ? el.str('tone') : 'mint';
  return `<div class="usa-ac-pill" data-tone="${tone}" data-icon="${e(el.str('icon', 'train'))}">${icon(el.str('icon', 'train'))}<span>${text(el, 'value', '5')}</span><small>${text(el, 'unit', 'MT')}</small><span class="usa-ac-pill-end">${text(el, 'status', '')}</span></div>`;
}

export function rideView(el: UsaBase): string {
  const p = n(el, 'value', 48, 0, 100), disabled = el.flag('disabled');
  return `<div class="usa-ac-small usa-ac-muted">${text(el, 'status', 'Drop off in 1 min')}</div><div class="usa-ac-ride-line"><i style="width:${p}%"></i>${button('toggle', el.flag('running') ? 'Pause ride display' : 'Resume ride display', icon(el.flag('running') ? 'pause' : 'play'), disabled)}</div><div class="usa-ac-row usa-ac-driver"><span class="usa-ac-avatar" aria-hidden="true">M</span><span>${text(el, 'driver', 'Michael')}</span>${button('call', 'Call driver', icon('phone'), disabled)}</div>`;
}

export function routeView(el: UsaBase): string {
  const raw = chart(el, [48, 50, 46, 38, 23, 20, 15, 9, 5]), scale = raw.reduce((m, v) => Math.max(m, Math.abs(v)), 1);
  const values = raw.map(v => v / scale), lo = values.reduce((m, v) => Math.min(m, v), Infinity), hi = values.reduce((m, v) => Math.max(m, v), -Infinity), span = hi - lo || 1;
  const points = values.map((v, i) => `${8 + i * 224 / (values.length - 1 || 1)},${58 - (v - lo) / span * 42}`).join(' ');
  return `<div class="usa-ac-row usa-ac-small"><span>${text(el, 'title', 'On the way')}</span><span>${text(el, 'status', '45m left')}</span></div>${svg(`<polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`, '0 0 240 70', 'usa-ac-route-chart')}<div class="usa-ac-row"><strong>${text(el, 'value', '6.5')} <small>${text(el, 'unit', 'MT')}</small></strong>${button('details', 'Journey details', icon('car'), el.flag('disabled'))}</div>`;
}
