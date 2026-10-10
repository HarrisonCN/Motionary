import { f as defineElement } from './base-CBMzOs1k.js';
import { p as part, c as clampN } from './shared-C8Pi6tuh.js';

var css = "usa-progress-ring{position:relative;display:inline-block;vertical-align:middle;width:var(--usa-pr-size,120px);aspect-ratio:1;--usa-pr-color:#7c5cff;--usa-pr-track:rgba(127,127,127,.18);--usa-pr-width:9;font:700 calc(var(--usa-pr-size,120px)*.2)/1 system-ui,sans-serif;font-variant-numeric:tabular-nums}usa-progress-ring[data-variant=\"semi\"]{aspect-ratio:100/56}.usa-pr-label{position:absolute;inset:0;display:grid;place-items:center}usa-progress-ring[data-variant=\"semi\"] .usa-pr-label{place-items:end center}usa-progress-ring[data-variant=\"bar\"]{display:inline-flex;width:var(--usa-pr-size,100%);aspect-ratio:auto;gap:10px;align-items:center;font-size:14px}usa-progress-ring[data-variant=\"bar\"]>.usa-pr-track{flex:1 1 auto;min-width:40px}usa-progress-ring[data-variant=\"bar\"] .usa-pr-label{position:static;display:inline}usa-progress-ring .usa-pr-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.usa-pr-svg path{fill:none;stroke-width:var(--usa-pr-width);stroke-linecap:round}.usa-pr-svg .usa-pr-track{stroke:var(--usa-pr-track)}.usa-pr-svg .usa-pr-arc{stroke:var(--usa-pr-color)}usa-progress-ring[data-variant=\"semi\"] .usa-pr-label{padding-bottom:2%}.usa-pr-track:is(div){height:10px;border-radius:999px;background:var(--usa-pr-track);overflow:hidden}.usa-pr-fill{height:100%;border-radius:inherit;background:var(--usa-pr-color);transform-origin:0 50%;transform:scaleX(0)}usa-progress-ring[data-indeterminate] .usa-pr-svg{animation:usa-pr-spin 1.1s linear infinite}usa-progress-ring[data-indeterminate] .usa-pr-fill{width:35%;transform:none!important;animation:usa-pr-slide 1.3s ease-in-out infinite}@keyframes usa-pr-spin{to{transform:rotate(360deg)}}@keyframes usa-pr-slide{from{margin-left:-35%}to{margin-left:100%}}usa-odometer{display:inline-flex;align-items:flex-end;font-variant-numeric:tabular-nums;line-height:1.15}.usa-odo-row{display:inline-flex;align-items:flex-end}.usa-odo-col{display:inline-block;height:1.15em;overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 18%,#000 82%,transparent);mask-image:linear-gradient(transparent,#000 18%,#000 82%,transparent)}.usa-odo-strip{display:block;white-space:pre;line-height:1.15em;text-align:center}.usa-odo-sym{display:inline-block;height:1.15em}@media (prefers-reduced-motion:reduce){usa-progress-ring[data-indeterminate] .usa-pr-svg,usa-progress-ring[data-indeterminate] .usa-pr-fill{animation-duration:4s}}";

const PROGRESS_VARIANTS = ['ring', 'bar', 'semi'];
const NS = 'http://www.w3.org/2000/svg';
function defineProgressRing(tag = 'usa-progress-ring') {
    return defineElement(tag, (Base) => {
        class UsaProgressRing extends Base {
            constructor() {
                super(...arguments);
                this._shown = 0;
                this._arc = null;
                this._label = null;
                this._len = 1;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['variant', 'value', 'max', 'gradient', 'no-label', 'duration'];
            }
            get value() {
                return this.hasAttribute('value') ? this.num('value', 0) : null;
            }
            set value(v) {
                if (v === null)
                    this.removeAttribute('value');
                else
                    this.setAttribute('value', String(v));
            }
            get max() {
                return Math.max(1e-9, this.num('max', 100));
            }
            set max(v) {
                this.setAttribute('max', String(v));
            }
            changed(name) {
                if (name === 'value' && this._arc)
                    return this.update();
                super.changed(name);
            }
            mount() {
                const v = this.str('variant', 'ring');
                const variant = PROGRESS_VARIANTS.includes(v) ? v : 'ring';
                this.dataset.variant = variant;
                this.setAttribute('role', 'progressbar');
                this.setAttribute('aria-valuemin', '0');
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const stops = this.str('gradient', '').split(',').map((s) => s.trim()).filter(Boolean);
                const gid = `usa-pr-${Math.random().toString(36).slice(2, 8)}`;
                if (variant === 'bar') {
                    const track = part('div', 'usa-pr-track');
                    const fill = part('div', 'usa-pr-fill');
                    if (stops.length)
                        fill.style.background = `linear-gradient(90deg,${stops.join(',')})`;
                    track.append(fill);
                    this.append(track);
                    this._arc = fill;
                }
                else {
                    const svg = document.createElementNS(NS, 'svg');
                    svg.setAttribute('data-usa-part', '');
                    svg.setAttribute('aria-hidden', 'true');
                    svg.setAttribute('class', 'usa-pr-svg');
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                    const semi = variant === 'semi';
                    svg.setAttribute('viewBox', semi ? '0 0 100 56' : '0 0 100 100');
                    const d = semi ? 'M 8 50 A 42 42 0 0 1 92 50' : 'M 50 8 A 42 42 0 1 1 49.99 8';
                    const grad = stops.length ? `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">${stops.map((c, i) => `<stop offset="${stops.length > 1 ? i / (stops.length - 1) : 0}" stop-color="${c}"/>`).join('')}</linearGradient></defs>` : '';
                    svg.innerHTML = `${grad}<path class="usa-pr-track" d="${d}"/><path class="usa-pr-arc" d="${d}"${stops.length ? ` stroke="url(#${gid})"` : ''}/>`;
                    this.append(svg);
                    this._arc = svg.querySelector('.usa-pr-arc');
                    this._len = semi ? Math.PI * 42 : Math.PI * 2 * 42;
                    this._arc.style.strokeDasharray = `${this._len}`;
                    this._arc.style.strokeDashoffset = `${this._len}`;
                }
                this._label = part('span', 'usa-pr-label', { 'aria-hidden': 'true' });
                if (this.flag('no-label'))
                    this._label.hidden = true;
                this.append(this._label);
                this._shown = 0;
                this.onCleanup(() => {
                    if (this._raf && typeof cancelAnimationFrame === 'function')
                        cancelAnimationFrame(this._raf);
                });
                this.update();
            }
            paint(frac) {
                const f = clampN(frac, 0, 1.08);
                if (this._arc instanceof HTMLElement)
                    this._arc.style.transform = `scaleX(${Math.min(1, f)})`;
                else if (this._arc)
                    this._arc.style.strokeDashoffset = `${(this._len * (1 - Math.min(1, f))).toFixed(2)}`;
            }
            update() {
                const v = this.value;
                const max = this.max;
                this.setAttribute('aria-valuemax', String(max));
                this.toggleAttribute('data-indeterminate', v === null);
                if (v === null) {
                    this.removeAttribute('aria-valuenow');
                    if (this._label)
                        this._label.textContent = '';
                    this.paint(0.28);
                    return;
                }
                const target = clampN(v, 0, max) / max;
                this.setAttribute('aria-valuenow', String(clampN(v, 0, max)));
                const from = this._shown;
                this._shown = target;
                const label = (f) => {
                    if (this._label)
                        this._label.textContent = `${Math.round(f * 100)}%`;
                };
                if (this._raf && typeof cancelAnimationFrame === 'function')
                    cancelAnimationFrame(this._raf);
                if (this.reduced || typeof requestAnimationFrame !== 'function') {
                    this.paint(target);
                    label(target);
                }
                else {
                    const t0 = performance.now();
                    const dur = this.num('duration', 900);
                    const step = (now) => {
                        const k = Math.min(1, (now - t0) / dur);
                        // ease-out-back: a little overshoot, then settle
                        const c = 1.4;
                        const e = 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
                        const f = from + (target - from) * e;
                        this.paint(f);
                        label(from + (target - from) * Math.min(1, k * 1.15));
                        this._raf = k < 1 ? requestAnimationFrame(step) : 0;
                        if (k >= 1)
                            this.paint(target);
                    };
                    this._raf = requestAnimationFrame(step);
                }
                if (target >= 1 && from < 1)
                    this.emit('complete', { value: v });
            }
        }
        return UsaProgressRing;
    }, { id: 'meters', text: css });
}
function defineOdometer(tag = 'usa-odometer') {
    return defineElement(tag, (Base) => {
        class UsaOdometer extends Base {
            constructor() {
                super(...arguments);
                this._row = null;
                this._text = '';
            }
            static get observedAttributes() {
                return ['value', 'locale', 'decimals', 'prefix', 'suffix', 'duration'];
            }
            get value() {
                return this.num('value', 0);
            }
            set value(v) {
                this.setAttribute('value', String(v));
            }
            get text() {
                return this._text;
            }
            changed(name) {
                if (name === 'value' && this._row)
                    return this.render(true);
                super.changed(name);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._row = part('span', 'usa-odo-row', { 'aria-hidden': 'true' });
                this.append(this._row);
                this.setAttribute('role', 'img');
                this._text = '';
                this.render(false);
            }
            format() {
                const d = Math.max(0, Math.min(6, Math.round(this.num('decimals', 0))));
                let s;
                try {
                    s = new Intl.NumberFormat(this.str('locale', '') || undefined, { minimumFractionDigits: d, maximumFractionDigits: d }).format(this.value);
                }
                catch {
                    s = this.value.toFixed(d);
                }
                return `${this.str('prefix', '')}${s}${this.str('suffix', '')}`;
            }
            column(ch) {
                const isDigit = /\d/.test(ch);
                const col = part('span', isDigit ? 'usa-odo-col' : 'usa-odo-sym');
                if (isDigit) {
                    const strip = document.createElement('span');
                    strip.className = 'usa-odo-strip';
                    strip.textContent = '01234567890123456789'.split('').join('\n');
                    col.append(strip);
                    col.dataset.d = ch;
                    strip.style.transform = `translateY(${-Number(ch) * 5}%)`;
                }
                else
                    col.textContent = ch;
                return col;
            }
            render(animate) {
                const row = this._row;
                if (!row)
                    return;
                const next = this.format();
                this._text = next;
                this.setAttribute('aria-label', next);
                const anim = animate && !this.reduced;
                const dur = this.num('duration', 1100);
                const chars = next.split('');
                const old = Array.from(row.children);
                const off = chars.length - old.length; // right-aligned: digits keep their place value
                const fresh = new Set();
                const cols = chars.map((ch, i) => {
                    const o = old[i - off];
                    const digit = /\d/.test(ch);
                    if (o && digit && o.dataset.d !== undefined)
                        return o;
                    if (o && !digit && o.dataset.d === undefined) {
                        o.textContent = ch;
                        return o;
                    }
                    const c = this.column(ch);
                    fresh.add(c);
                    return c;
                });
                row.replaceChildren(...cols);
                cols.forEach((c, i) => {
                    if (fresh.has(c)) {
                        if (anim)
                            this.motion(c, [{ opacity: 0, transform: 'translateY(-60%)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
                        return;
                    }
                    if (c.dataset.d === undefined)
                        return;
                    const to = Number(chars[i]);
                    const from = Number(c.dataset.d);
                    c.dataset.d = String(to);
                    const strip = c.firstElementChild;
                    strip.style.transform = `translateY(${-to * 5}%)`;
                    if (!anim || from === to)
                        return;
                    const end = to >= from ? -to * 5 : -(to + 10) * 5; // always roll forward
                    const place = cols.length - i;
                    this.motion(strip, [{ transform: `translateY(${-from * 5}%)` }, { transform: `translateY(${end}%)` }], { duration: Math.max(400, dur - place * 60), easing: 'cubic-bezier(.2,.9,.25,1.04)' });
                });
            }
        }
        return UsaOdometer;
    }, { id: 'meters', text: css });
}

export { PROGRESS_VARIANTS as P, defineProgressRing as a, defineOdometer as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/chunks/progress-ring-Q1yoAUrU.js.map