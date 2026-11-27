import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { c as css } from '../chunks/micro-kit-16-BwBnmnaq.js';

const SVG = 'http://www.w3.org/2000/svg';
function defineMicroCheckbox(tag = 'usa-micro-checkbox') {
    const ctor = defineElement(tag, (Base) => class MicroCheckbox extends Base {
        constructor() {
            super(...arguments);
            this._on = false;
            this._mixed = false;
            this._sync = null;
        }
        static get observedAttributes() {
            return ['checked', 'indeterminate', 'disabled', 'label', 'name', 'value', 'feel', 'haptics'];
        }
        get checked() {
            return this._on;
        }
        set checked(v) {
            this._on = !!v;
            this._mixed = false;
            this._sync?.(true);
        }
        get indeterminate() {
            return this._mixed;
        }
        set indeterminate(v) {
            this._mixed = !!v;
            this._sync?.(true);
        }
        mount() {
            const seen = `${this.getAttribute('checked')}|${this.getAttribute('indeterminate')}`;
            if (seen !== this._seen) {
                this._seen = seen;
                this._on = this.flag('checked');
                this._mixed = this.flag('indeterminate');
            }
            const btn = make('button', 'usa-mkit usa-mcheck');
            btn.type = 'button';
            btn.setAttribute('role', 'checkbox');
            btn.disabled = this.flag('disabled');
            const box = make('span', 'usa-mcheck-box');
            const fill = make('span', 'usa-mcheck-fill');
            const svg = document.createElementNS(SVG, 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('class', 'usa-mcheck-tick');
            const path = document.createElementNS(SVG, 'path');
            path.setAttribute('d', 'M5.5 12.5l4.2 4.2L18.5 7.5');
            path.setAttribute('pathLength', '1');
            svg.append(path);
            const bar = make('span', 'usa-mcheck-bar');
            box.append(fill, svg, bar);
            btn.append(box);
            const label = this.str('label');
            if (label)
                btn.append(make('span', 'usa-mcheck-label', label));
            else
                btn.setAttribute('aria-label', 'Check');
            const hidden = this.str('name') ? make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
                hidden.value = this.str('value', 'on');
            }
            this.append(btn);
            if (hidden)
                this.append(hidden);
            const want = () => (this._mixed ? { b: 1, d: 0, m: 1 } : this._on ? { b: 1, d: 1, m: 0 } : { b: 0, d: 0, m: 0 });
            let draw = false;
            const group = hostSprings(this, { ...want(), s: 0 }, (v) => {
                const b = Math.max(0, v.b);
                box.style.transform = `scale(${Math.round((1 - v.s * 0.14) * 1000) / 1000})`;
                fill.style.transform = `scale(${Math.round(b * 1000) / 1000})`;
                fill.style.opacity = String(Math.min(1, b * 1.6));
                path.style.strokeDashoffset = String(Math.round((1 - Math.min(1, Math.max(0, v.d))) * 1000) / 1000);
                bar.style.transform = `scaleX(${Math.round(Math.max(0, v.m) * 1000) / 1000})`;
                // the tick starts drawing once the fill has mostly arrived
                if (draw && v.b > 0.55) {
                    draw = false;
                    group.set({ d: 1 }, { spring: 'snappy' });
                }
            });
            const sync = (animate) => {
                btn.setAttribute('aria-checked', this._mixed ? 'mixed' : String(this._on));
                btn.toggleAttribute('data-on', this._on || this._mixed);
                if (hidden)
                    hidden.disabled = !this._on;
                const t = want();
                if (!animate) {
                    draw = false;
                    return group.jump(t);
                }
                if (t.d === 1 && group.get('d') < 1) {
                    draw = true;
                    group.set({ b: 1, m: 0 }, { spring: 'pop' });
                    if (group.get('b') > 0.55 || !group.animating) {
                        draw = false;
                        group.set({ d: 1 }, { spring: 'snappy' });
                    }
                }
                else {
                    draw = false;
                    group.set({ d: t.d }, { spring: 'instant' });
                    group.set({ b: t.b, m: t.m }, { spring: t.b ? 'pop' : 'smooth' });
                }
            };
            sync(false);
            this._sync = sync;
            this.listen(btn, 'pointerdown', (e) => {
                if (btn.disabled || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                group.set({ s: 1 }, { spring: 'press' });
            });
            for (const t of ['pointerup', 'pointercancel', 'pointerleave'])
                this.listen(btn, t, () => group.set({ s: 0 }, { spring: 'release' }));
            this.listen(btn, 'click', () => {
                this._on = this._mixed ? true : !this._on;
                this._mixed = false;
                sync(true);
                if (this._on)
                    group.impulse({ s: -4 }, 'pop');
                tick(this, 10);
                this.emit('change', { checked: this._on });
            });
            this.onCleanup(() => {
                group.stop();
                btn.remove();
                hidden?.remove();
                this._sync = null;
            });
        }
    }, { id: 'micro-kit-16', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineMicroCheckbox };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/micro-checkbox.js.map