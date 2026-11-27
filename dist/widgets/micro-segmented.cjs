'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit12 = require('../chunks/kit-12-B4H_NaC_.cjs');
var micro = require('../chunks/micro-3qfNbgwt.cjs');
var microKit16$1 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var microKit16 = require('../chunks/micro-kit-16-CPdfvyga.cjs');

function defineMicroSegmented(tag = 'usa-micro-segmented') {
    const ctor = base.defineElement(tag, (Base) => class MicroSegmented extends Base {
        constructor() {
            super(...arguments);
            this._value = '';
            this._pick = null;
            this._vals = [];
        }
        static get observedAttributes() {
            return ['options', 'values', 'value', 'label', 'name', 'disabled', 'feel', 'haptics'];
        }
        get value() {
            return this._value;
        }
        set value(v) {
            const i = this._vals.indexOf(String(v));
            if (i >= 0 && this._pick)
                this._pick(i);
            else
                this._value = String(v);
        }
        mount() {
            const labels = kit.list(this.str('options'), 12);
            const given = kit.list(this.str('values'), 12);
            const vals = (this._vals = labels.map((l, i) => given[i] || l));
            const attr = this.getAttribute('value');
            if (attr !== this._seen) {
                this._seen = attr;
                this._value = attr ?? '';
            }
            if (!vals.includes(this._value))
                this._value = vals[0] ?? '';
            const disabled = this.flag('disabled');
            const root = moments.make('div', 'usa-mkit usa-mseg');
            root.setAttribute('role', 'radiogroup');
            root.setAttribute('aria-label', this.str('label', 'Options'));
            if (disabled)
                root.setAttribute('aria-disabled', 'true');
            const pill = moments.make('span', 'usa-mseg-pill');
            pill.setAttribute('aria-hidden', 'true');
            root.append(pill);
            const buttons = labels.map((l, i) => {
                const b = moments.make('button', 'usa-mseg-opt', l);
                b.type = 'button';
                b.setAttribute('role', 'radio');
                b.dataset.value = vals[i];
                b.disabled = disabled;
                root.append(b);
                return b;
            });
            const hidden = this.str('name') ? moments.make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
                root.append(hidden);
            }
            this.append(root);
            const presses = buttons.map((b) => micro.micro(b, 'press', { pressScale: 0.94, feel: this.str('feel') || undefined }));
            const group = microKit16$1.hostSprings(this, { a: 0, b: 0 }, (v) => {
                const a = Math.min(v.a, v.b);
                const w = Math.max(0, Math.abs(v.b - v.a));
                pill.style.transform = `translateX(${microKit16$1.px(a)})`;
                pill.style.width = microKit16$1.px(w);
            });
            let index = Math.max(0, vals.indexOf(this._value));
            const edges = (i) => {
                const b = buttons[i];
                if (!b)
                    return [0, 0];
                const rr = root.getBoundingClientRect();
                const br = b.getBoundingClientRect();
                const left = br.left - rr.left - root.clientLeft;
                return [left, left + br.width];
            };
            const paint = () => {
                buttons.forEach((b, i) => {
                    b.setAttribute('aria-checked', String(i === index));
                    b.tabIndex = i === index ? 0 : -1;
                });
                if (hidden)
                    hidden.value = this._value;
            };
            const place = (animate) => {
                const [l, r] = edges(index);
                if (!animate)
                    return group.jump({ a: l, b: r });
                const s = microKit16$1.edgeSprings(group.get('a'), l);
                group.set({ a: l }, { spring: s.left });
                group.set({ b: r }, { spring: s.right });
            };
            paint();
            place(false);
            root.toggleAttribute('data-ready', true);
            const pick = (i, focus = false) => {
                if (i < 0 || i >= buttons.length)
                    return;
                const changed = i !== index;
                index = i;
                this._value = vals[i];
                paint();
                place(true);
                if (focus)
                    buttons[i].focus();
                if (changed) {
                    microKit16$1.tick(this, 6);
                    this.emit('change', { value: this._value, index: i });
                }
            };
            this._pick = (i) => pick(i);
            this.listen(root, 'click', (e) => {
                const i = buttons.indexOf(e.target.closest('.usa-mseg-opt'));
                if (i >= 0 && !disabled)
                    pick(i);
            });
            this.listen(root, 'keydown', (e) => {
                const i = buttons.indexOf(e.target);
                if (i < 0 || disabled)
                    return;
                const next = kit12.rovingIndex(e.key, i, buttons.length, getComputedStyle(root).direction === 'rtl');
                if (next < 0)
                    return;
                e.preventDefault();
                pick(next, true);
            });
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => !group.animating && place(false));
                ro.observe(root);
                this.onCleanup(() => ro.disconnect());
            }
            // fonts can change the widths after the first paint
            document.fonts?.ready?.then(() => this.isConnected && !group.animating && place(false));
            this.onCleanup(() => {
                group.stop();
                presses.forEach((h) => h.destroy());
                root.remove();
                this._pick = null;
            });
        }
    }, { id: 'micro-kit-16', text: microKit16.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMicroSegmented = defineMicroSegmented;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/micro-segmented.cjs.map