import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { b as springExpand } from '../chunks/expand-D5rZXTHQ.js';
import { u as uid, h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { c as css } from '../chunks/damped-kit-18-C7vHGyLt.js';

const SVG = 'http://www.w3.org/2000/svg';
function defineSpringCollapse(tag = 'usa-spring-collapse') {
    const ctor = defineElement(tag, (Base) => class SpringCollapse extends Base {
        constructor() {
            super(...arguments);
            this._open = false;
            this._source = null;
            this._set = null;
        }
        static get observedAttributes() {
            return ['label', 'open', 'disabled', 'feel', 'haptics'];
        }
        get open() {
            return this._open;
        }
        set open(v) {
            this.toggle(!!v);
        }
        toggle(force) {
            const on = force === undefined ? !this._open : force;
            if (this._set)
                this._set(on, false);
            else
                this._open = on;
        }
        mount() {
            if (!this._source) {
                this._source = [...this.childNodes];
                this._source.forEach((n) => n.parentNode === this && this.removeChild(n));
            }
            const attr = this.getAttribute('open');
            if (attr !== this._seen) {
                this._seen = attr;
                this._open = this.flag('open');
            }
            const disabled = this.flag('disabled');
            const feel = this.str('feel') || undefined;
            const root = make('div', 'usa-dkit usa-dcol');
            const head = make('button', 'usa-dcol-head');
            head.type = 'button';
            head.disabled = disabled;
            head.append(make('span', 'usa-dcol-label', this.str('label', 'Details')));
            const chev = document.createElementNS(SVG, 'svg');
            chev.setAttribute('viewBox', '0 0 24 24');
            chev.setAttribute('class', 'usa-dcol-chev');
            chev.setAttribute('aria-hidden', 'true');
            const path = document.createElementNS(SVG, 'path');
            path.setAttribute('d', 'M6 9l6 6 6-6');
            chev.append(path);
            head.append(chev);
            const panel = make('div', 'usa-dcol-panel');
            panel.id = uid('usa-dcol-panel');
            head.setAttribute('aria-controls', panel.id);
            const body = make('div', 'usa-dcol-body');
            body.append(...this._source.map((n) => n.cloneNode(true)));
            panel.append(body);
            panel.hidden = !this._open;
            root.append(head, panel);
            root.toggleAttribute('data-open', this._open);
            head.setAttribute('aria-expanded', String(this._open));
            this.append(root);
            // the chevron flips on its own, bouncier spring while the panel's height settles
            const group = hostSprings(this, { c: this._open ? 1 : 0 }, (v) => {
                chev.style.transform = `rotate(${Math.round(v.c * 1800) / 10}deg)`;
            });
            group.jump({ c: this._open ? 1 : 0 });
            const set = (on, user) => {
                if (on === this._open)
                    return;
                this._open = on;
                head.setAttribute('aria-expanded', String(on));
                root.toggleAttribute('data-open', on);
                void springExpand(panel, on, { feel });
                group.set({ c: on ? 1 : 0 }, { spring: on ? 'bouncy' : 'snappy' });
                if (user)
                    tick(this, 6);
                this.emit('toggle', { open: on });
            };
            this._set = set;
            this.listen(head, 'click', () => {
                if (!disabled)
                    set(!this._open, true);
            });
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._set = null;
            });
        }
    }, { id: 'damped-kit-18', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSpringCollapse };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/spring-collapse.js.map