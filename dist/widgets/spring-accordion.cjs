'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var micro = require('../chunks/micro-3qfNbgwt.cjs');
var microKit16 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var springKit17$1 = require('../chunks/spring-kit-17-Y1urAq72.cjs');
var springKit17 = require('../chunks/spring-kit-17-BzIkfNWk.cjs');

const SVG = 'http://www.w3.org/2000/svg';
function defineSpringAccordion(tag = 'usa-spring-accordion') {
    const ctor = base.defineElement(tag, (Base) => class SpringAccordion extends Base {
        constructor() {
            super(...arguments);
            this._open = [];
            this._source = null;
            this._toggle = null;
        }
        static get observedAttributes() {
            return ['open', 'multiple', 'feel', 'haptics'];
        }
        get openIndexes() {
            return this._open.slice();
        }
        toggle(index, force) {
            this._toggle?.(index, force, false);
        }
        mount() {
            if (!this._source) {
                const kids = [...this.children];
                this._source = kids.map((k, i) => {
                    const head = k.getAttribute('data-title') ? null : k.querySelector('h1, h2, h3, h4, h5, h6');
                    const title = k.getAttribute('data-title') || head?.textContent?.trim() || `Section ${i + 1}`;
                    head?.remove();
                    return { title, nodes: [...k.childNodes] };
                });
                kids.forEach((k) => k.remove());
            }
            const sections = this._source;
            const multiple = this.flag('multiple');
            const attr = this.getAttribute('open');
            if (attr !== this._seen) {
                this._seen = attr;
                this._open = springKit17$1.openSet(attr ?? '', sections.length, multiple);
            }
            this._open = multiple ? this._open.filter((i) => i < sections.length) : this._open.slice(0, 1);
            const root = moments.make('div', 'usa-skit usa-sacc');
            const handles = [];
            const parts = sections.map((s, i) => {
                const item = moments.make('div', 'usa-sacc-item');
                const head = moments.make('button', 'usa-sacc-head');
                head.type = 'button';
                const pid = microKit16.uid('usa-sacc-panel');
                const hid = microKit16.uid('usa-sacc-head');
                head.id = hid;
                head.setAttribute('aria-controls', pid);
                head.append(moments.make('span', 'usa-sacc-title', s.title));
                const chev = document.createElementNS(SVG, 'svg');
                chev.setAttribute('viewBox', '0 0 24 24');
                chev.setAttribute('class', 'usa-sacc-chev');
                chev.setAttribute('aria-hidden', 'true');
                const p = document.createElementNS(SVG, 'path');
                p.setAttribute('d', 'M6 9l6 6 6-6');
                chev.append(p);
                head.append(chev);
                const panel = moments.make('div', 'usa-sacc-panel');
                panel.id = pid;
                panel.setAttribute('role', 'region');
                panel.setAttribute('aria-labelledby', hid);
                const body = moments.make('div', 'usa-sacc-body');
                body.append(...s.nodes.map((n) => n.cloneNode(true)));
                panel.append(body);
                item.append(head, panel);
                root.append(item);
                handles.push(micro.micro(head, 'press', { feel: this.str('feel') || undefined }));
                return { head, panel, body, chev };
            });
            this.append(root);
            const init = {};
            parts.forEach((_, i) => {
                const on = this._open.includes(i) ? 1 : 0;
                init[`h${i}`] = on;
                init[`c${i}`] = on;
            });
            const heights = parts.map(() => 0);
            const group = microKit16.hostSprings(this, init, (v) => {
                parts.forEach((pt, i) => {
                    const h = Math.max(0, v[`h${i}`]);
                    const open = this._open.includes(i);
                    const rest = open && Math.abs(h - 1) < 0.002 && Math.abs(group.velocity(`h${i}`)) < 0.01;
                    pt.panel.toggleAttribute('data-rest', rest);
                    pt.panel.style.height = rest ? '' : `${Math.round(h * heights[i] * 10) / 10}px`;
                    pt.body.style.opacity = String(Math.round(Math.min(1, Math.max(0, h * 1.6 - 0.4)) * 100) / 100);
                    pt.body.style.transform = `translateY(${Math.round((1 - Math.min(1, h)) * -10 * 10) / 10}px)`;
                    pt.chev.style.transform = `rotate(${Math.round(v[`c${i}`] * 1800) / 10}deg)`;
                });
            });
            const paint = () => {
                parts.forEach((pt, i) => {
                    const open = this._open.includes(i);
                    pt.head.setAttribute('aria-expanded', String(open));
                    pt.panel.toggleAttribute('data-open', open);
                    pt.panel.toggleAttribute('inert', !open);
                });
            };
            paint();
            const measure = (i) => (heights[i] = parts[i].body.scrollHeight || parts[i].body.getBoundingClientRect().height || heights[i]);
            parts.forEach((_, i) => measure(i));
            group.jump(init);
            const toggle = (i, force, user) => {
                if (!parts[i])
                    return;
                const on = force === undefined ? !this._open.includes(i) : force;
                if (on === this._open.includes(i))
                    return;
                const closing = on && !multiple ? this._open.filter((x) => x !== i) : [];
                this._open = on ? (multiple ? [...this._open, i] : [i]) : this._open.filter((x) => x !== i);
                paint();
                for (const j of [i, ...closing]) {
                    measure(j);
                    const target = this._open.includes(j) ? 1 : 0;
                    group.set({ [`h${j}`]: target }, { spring: target ? 'smooth' : 'snappy' });
                    group.set({ [`c${j}`]: target }, { spring: 'bouncy' });
                }
                if (user)
                    microKit16.tick(this, 5);
                for (const j of closing)
                    this.emit('toggle', { index: j, open: false });
                this.emit('toggle', { index: i, open: on });
            };
            this._toggle = toggle;
            this.listen(root, 'click', (e) => {
                const h = e.target.closest?.('.usa-sacc-head');
                const i = parts.findIndex((p) => p.head === h);
                if (i >= 0)
                    toggle(i, undefined, true);
            });
            this.listen(root, 'keydown', (e) => {
                const i = parts.findIndex((p) => p.head === e.target);
                if (i < 0)
                    return;
                const n = parts.length;
                const to = { ArrowDown: (i + 1) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 };
                if (!(e.key in to))
                    return;
                e.preventDefault();
                parts[to[e.key]].head.focus();
            });
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => parts.forEach((_, i) => measure(i)));
                parts.forEach((p) => ro.observe(p.body));
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                group.stop();
                handles.forEach((h) => h.destroy());
                root.remove();
                this._toggle = null;
            });
        }
    }, { id: 'spring-kit-17', text: springKit17.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSpringAccordion = defineSpringAccordion;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/spring-accordion.cjs.map