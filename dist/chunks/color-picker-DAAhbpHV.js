import { f as defineElement } from './base-CBMzOs1k.js';
import { c as clampN } from './shared-C8Pi6tuh.js';

var css = "usa-color-picker{display:inline-flex;flex-direction:column;gap:10px;width:var(--usa-cp-w,240px);max-width:100%;padding:12px;border-radius:16px;background:var(--usa-cp-bg,#fff);box-shadow:0 10px 30px -12px rgba(0,0,0,.3)}.usa-cp-sv{position:relative;height:140px;border-radius:10px;background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(var(--usa-cp-h) 100% 50%));cursor:crosshair;touch-action:none;outline-offset:2px}.usa-cp-thumb{position:absolute;left:var(--usa-cp-x);top:var(--usa-cp-y);width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:var(--usa-cp-color);box-shadow:0 0 0 3px #fff,0 2px 6px rgba(0,0,0,.4);pointer-events:none;transition:left .18s cubic-bezier(.3,1.4,.5,1),top .18s cubic-bezier(.3,1.4,.5,1),transform .2s}[data-drag]>.usa-cp-thumb{transition:none;transform:scale(1.2)}.usa-cp-row{display:flex;align-items:center;gap:10px}.usa-cp-chip{flex:none;width:30px;height:30px;border-radius:50%;background:var(--usa-cp-color);box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}.usa-cp-hue{position:relative;flex:1;height:14px;border-radius:7px;background:linear-gradient(90deg,red,#ff0,lime,cyan,blue,#f0f,red);cursor:pointer;touch-action:none;outline-offset:2px}.usa-cp-hue .usa-cp-thumb{left:var(--usa-cp-hx);top:50%;background:hsl(var(--usa-cp-h) 100% 50%)}.usa-cp-swatches{display:flex;flex-wrap:wrap;gap:6px}.usa-cp-sw{width:22px;height:22px;border:0;border-radius:50%;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}.usa-cp-sv:focus-visible,.usa-cp-hue:focus-visible,.usa-cp-sw:focus-visible{outline:2px solid #7c5cff}@media (prefers-reduced-motion:reduce){.usa-cp-thumb{transition:none}}";

/** HSV (h 0–360, s / v 0–1) → `#rrggbb`. */
function hsvToHex(h, s, v) {
    const f = (n) => {
        const k = (n + h / 60) % 6;
        return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
    };
    return '#' + [f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
/** `#rrggbb` → HSV (or null). */
function hexToHsv(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
    if (!m)
        return null;
    const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16) / 255);
    const mx = Math.max(r, g, b);
    const d = mx - Math.min(r, g, b);
    let h = 0;
    if (d)
        h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx];
}
function defineColorPicker(tag = 'usa-color-picker') {
    // contract-exempt: attr-unobserved(value) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
    return defineElement(tag, (Base) => {
        class UsaColorPicker extends Base {
            constructor() {
                super(...arguments);
                this._h = 260;
                this._s = 0.64;
                this._v = 1;
            }
            static get observedAttributes() {
                return ['swatches'];
            }
            get value() {
                return hsvToHex(this._h, this._s, this._v);
            }
            set value(v) {
                const hsv = hexToHsv(v);
                if (!hsv)
                    return;
                [this._h, this._s, this._v] = hsv;
                this.paint(true);
            }
            mount() {
                const hsv = hexToHsv(this.str('value', '#7c5cff'));
                if (hsv)
                    [this._h, this._s, this._v] = hsv;
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const sw = this.str('swatches', '').split(',').map((s) => s.trim()).filter((s) => hexToHsv(s));
                this.insertAdjacentHTML('afterbegin', `<div class="usa-cp-sv" data-usa-part role="slider" tabindex="0" aria-label="Saturation and brightness"><span class="usa-cp-thumb"></span></div><div class="usa-cp-row" data-usa-part><span class="usa-cp-chip" aria-hidden="true"></span><div class="usa-cp-hue" role="slider" tabindex="0" aria-label="Hue" aria-valuemin="0" aria-valuemax="360"><span class="usa-cp-thumb"></span></div></div>${sw.length ? `<div class="usa-cp-swatches" data-usa-part>${sw.map((c) => `<button type="button" class="usa-cp-sw" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join('')}</div>` : ''}`);
                const sv = this.querySelector('.usa-cp-sv');
                const hue = this.querySelector('.usa-cp-hue');
                this.drag(sv, (x, y) => ((this._s = x), (this._v = 1 - y)));
                this.drag(hue, (x) => (this._h = x * 360));
                this.listen(sv, 'keydown', (e) => this.keys(e, (d, ax) => (ax ? (this._v = clampN(this._v - d, 0, 1)) : (this._s = clampN(this._s + d, 0, 1)))));
                this.listen(hue, 'keydown', (e) => this.keys(e, (d) => (this._h = (this._h + d * 360 + 360) % 360)));
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('.usa-cp-sw');
                    if (!b)
                        return;
                    this.value = b.dataset.c;
                    if (!this.reduced)
                        this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.3,1.5,.5,1)' });
                    this.emit('change', { value: this.value });
                });
                this.paint(false);
            }
            keys(e, fn) {
                const k = e.shiftKey ? 0.1 : 0.01;
                const map = { ArrowLeft: [-k, false], ArrowRight: [k, false], ArrowUp: [-k, true], ArrowDown: [k, true] };
                const m = map[e.key];
                if (!m)
                    return;
                e.preventDefault();
                fn(m[0], m[1]);
                this.paint(false);
                this.emit('change', { value: this.value });
            }
            drag(area, fn) {
                const at = (e) => {
                    const r = area.getBoundingClientRect();
                    fn(clampN((e.clientX - r.left) / (r.width || 1), 0, 1), clampN((e.clientY - r.top) / (r.height || 1), 0, 1));
                    this.paint(false);
                    this.emit('input', { value: this.value });
                };
                this.listen(area, 'pointerdown', (e) => {
                    area.setPointerCapture?.(e.pointerId);
                    area.toggleAttribute('data-drag', true);
                    at(e);
                    const move = (ev) => at(ev);
                    const up = () => {
                        area.removeAttribute('data-drag');
                        area.removeEventListener('pointermove', move);
                        area.removeEventListener('pointerup', up);
                        this.emit('change', { value: this.value });
                    };
                    area.addEventListener('pointermove', move);
                    area.addEventListener('pointerup', up);
                });
            }
            paint(morph) {
                const c = this.value;
                this.style.setProperty('--usa-cp-h', String(Math.round(this._h)));
                this.style.setProperty('--usa-cp-color', c);
                this.style.setProperty('--usa-cp-x', (this._s * 100).toFixed(2) + '%');
                this.style.setProperty('--usa-cp-y', ((1 - this._v) * 100).toFixed(2) + '%');
                this.style.setProperty('--usa-cp-hx', ((this._h / 360) * 100).toFixed(2) + '%');
                const sv = this.querySelector('.usa-cp-sv');
                sv?.setAttribute('aria-valuetext', `saturation ${Math.round(this._s * 100)}%, brightness ${Math.round(this._v * 100)}%`);
                const hue = this.querySelector('.usa-cp-hue');
                hue?.setAttribute('aria-valuenow', String(Math.round(this._h)));
                this.setAttribute('value', c);
                const chip = this.querySelector('.usa-cp-chip');
                if (morph && chip && !this.reduced)
                    this.motion(chip, [{ borderRadius: '50%', transform: 'scale(.7) rotate(-20deg)' }, { borderRadius: '30%', transform: 'scale(1.1)', offset: 0.6 }, { borderRadius: '50%', transform: 'none' }], { duration: 420, easing: 'ease-out' });
            }
        }
        return UsaColorPicker;
    }, { id: 'color-picker', text: css });
}

export { hsvToHex as a, defineColorPicker as d, hexToHsv as h };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.2/dist/chunks/color-picker-DAAhbpHV.js.map