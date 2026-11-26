'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var expand = require('../chunks/expand-3nhPCACv.cjs');
var microKit16 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var dampedKit18 = require('../chunks/damped-kit-18-CIpj0Cyz.cjs');

const SVG = 'http://www.w3.org/2000/svg';
function defineSpringCollapse(tag = 'usa-spring-collapse') {
    const ctor = base.defineElement(tag, (Base) => class SpringCollapse extends Base {
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
            const root = moments.make('div', 'usa-dkit usa-dcol');
            const head = moments.make('button', 'usa-dcol-head');
            head.type = 'button';
            head.disabled = disabled;
            head.append(moments.make('span', 'usa-dcol-label', this.str('label', 'Details')));
            const chev = document.createElementNS(SVG, 'svg');
            chev.setAttribute('viewBox', '0 0 24 24');
            chev.setAttribute('class', 'usa-dcol-chev');
            chev.setAttribute('aria-hidden', 'true');
            const path = document.createElementNS(SVG, 'path');
            path.setAttribute('d', 'M6 9l6 6 6-6');
            chev.append(path);
            head.append(chev);
            const panel = moments.make('div', 'usa-dcol-panel');
            panel.id = microKit16.uid('usa-dcol-panel');
            head.setAttribute('aria-controls', panel.id);
            const body = moments.make('div', 'usa-dcol-body');
            body.append(...this._source.map((n) => n.cloneNode(true)));
            panel.append(body);
            panel.hidden = !this._open;
            root.append(head, panel);
            root.toggleAttribute('data-open', this._open);
            head.setAttribute('aria-expanded', String(this._open));
            this.append(root);
            // the chevron flips on its own, bouncier spring while the panel's height settles
            const group = microKit16.hostSprings(this, { c: this._open ? 1 : 0 }, (v) => {
                chev.style.transform = `rotate(${Math.round(v.c * 1800) / 10}deg)`;
            });
            group.jump({ c: this._open ? 1 : 0 });
            const set = (on, user) => {
                if (on === this._open)
                    return;
                this._open = on;
                head.setAttribute('aria-expanded', String(on));
                root.toggleAttribute('data-open', on);
                void expand.springExpand(panel, on, { feel });
                group.set({ c: on ? 1 : 0 }, { spring: on ? 'bouncy' : 'snappy' });
                if (user)
                    microKit16.tick(this, 6);
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
    }, { id: 'damped-kit-18', text: dampedKit18.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSpringCollapse = defineSpringCollapse;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/spring-collapse.cjs.map