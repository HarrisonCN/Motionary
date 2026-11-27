'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var microKit16$1 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var microKit16 = require('../chunks/micro-kit-16-CPdfvyga.cjs');

const TRAVEL = { sm: 16, md: 20, lg: 26 };
function defineMicroSwitch(tag = 'usa-micro-switch') {
    const ctor = base.defineElement(tag, (Base) => class MicroSwitch extends Base {
        constructor() {
            super(...arguments);
            this._on = false;
            this._paint = null;
        }
        static get observedAttributes() {
            return ['checked', 'disabled', 'label', 'name', 'value', 'size', 'feel', 'haptics'];
        }
        get checked() {
            return this._on;
        }
        set checked(v) {
            this.toggle(!!v);
        }
        toggle(force) {
            const next = force ?? !this._on;
            if (next === this._on)
                return;
            this._on = next;
            this._paint?.();
        }
        mount() {
            const attr = this.getAttribute('checked');
            if (attr !== this._seen) {
                this._seen = attr;
                this._on = this.flag('checked');
            }
            const size = ['sm', 'lg'].includes(this.str('size')) ? this.str('size') : 'md';
            const travel = TRAVEL[size];
            const btn = moments.make('button', 'usa-mkit usa-mswitch');
            btn.type = 'button';
            btn.setAttribute('role', 'switch');
            btn.dataset.size = size;
            const track = moments.make('span', 'usa-mswitch-track');
            const knob = moments.make('span', 'usa-mswitch-knob');
            track.append(knob);
            btn.append(track);
            const label = this.str('label');
            if (label)
                btn.append(moments.make('span', 'usa-mswitch-label', label));
            else
                btn.setAttribute('aria-label', 'Toggle');
            btn.disabled = this.flag('disabled');
            const hidden = this.str('name') ? moments.make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
                hidden.value = this.str('value', 'on');
            }
            this.append(btn);
            if (hidden)
                this.append(hidden);
            const dir = typeof getComputedStyle === 'function' && getComputedStyle(this).direction === 'rtl' ? -1 : 1;
            const group = microKit16$1.hostSprings(this, { p: this._on ? 1 : 0, w: 0 }, (v) => {
                const p = v.p;
                const e = v.w * 6 + microKit16$1.stretch(group.velocity('p') * travel, 10, 60);
                const pos = Math.min(1, Math.max(0, p));
                knob.style.setProperty('--e', microKit16$1.px(e));
                knob.style.transform = `translateX(${microKit16$1.px(dir * (pos * (travel - e) + (p - pos) * travel))})`;
                btn.style.setProperty('--p', String(Math.round(pos * 1000) / 1000));
            });
            const sync = (animate, velocity) => {
                btn.setAttribute('aria-checked', String(this._on));
                btn.toggleAttribute('data-on', this._on);
                if (hidden)
                    hidden.disabled = !this._on;
                if (animate)
                    group.set({ p: this._on ? 1 : 0 }, { spring: 'toggle', velocity: velocity === undefined ? undefined : { p: velocity } });
                else
                    group.jump({ p: this._on ? 1 : 0 });
            };
            sync(false);
            this._paint = () => sync(true);
            const commit = (on, velocity) => {
                const changed = on !== this._on;
                this._on = on;
                sync(true, velocity);
                if (changed) {
                    microKit16$1.tick(this, 10);
                    this.emit('change', { checked: on });
                }
            };
            let drag = null;
            let swallow = false;
            this.listen(btn, 'pointerdown', (e) => {
                if (btn.disabled || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                drag = { x: e.clientX, p: group.get('p'), id: e.pointerId, moved: false, hist: [[e.clientX, performance.now()]] };
                group.set({ w: 1 }, { spring: 'press' });
                try {
                    btn.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
            });
            this.listen(btn, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const dx = e.clientX - drag.x;
                if (!drag.moved && Math.abs(dx) < 3)
                    return;
                drag.moved = true;
                drag.hist.push([e.clientX, performance.now()]);
                if (drag.hist.length > 6)
                    drag.hist.shift();
                const raw = drag.p + (dx * dir) / travel;
                group.jump({ p: Math.min(1, Math.max(0, raw)) + microKit16$1.overdrag(raw, 0, 1, 0.45) });
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const d = drag;
                drag = null;
                group.set({ w: 0 }, { spring: 'release' });
                if (!d.moved || e.type === 'pointercancel') {
                    if (e.type === 'pointercancel')
                        sync(true);
                    return;
                }
                swallow = true;
                setTimeout(() => (swallow = false), 0);
                const h = d.hist;
                const a = h[0];
                const b = h[h.length - 1];
                const v = h.length > 1 ? (dir * (b[0] - a[0])) / Math.max(0.008, (b[1] - a[1]) / 1000) / travel : 0;
                const p = group.get('p');
                commit(p + v * 0.12 >= 0.5, v);
            };
            this.listen(btn, 'pointerup', end);
            this.listen(btn, 'pointercancel', end);
            this.listen(btn, 'click', (e) => {
                if (swallow) {
                    e.preventDefault();
                    return;
                }
                commit(!this._on);
            });
            this.onCleanup(() => {
                group.stop();
                btn.remove();
                hidden?.remove();
                this._paint = null;
            });
        }
    }, { id: 'micro-kit-16', text: microKit16.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMicroSwitch = defineMicroSwitch;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/micro-switch.cjs.map