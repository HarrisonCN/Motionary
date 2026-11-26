'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var microKit16 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var dampedKit18$1 = require('../chunks/damped-kit-18-CM0mPVmn.cjs');
var dampedKit18 = require('../chunks/damped-kit-18-CIpj0Cyz.cjs');

function defineSpringStack(tag = 'usa-spring-stack') {
    const ctor = base.defineElement(tag, (Base) => class SpringStack extends Base {
        constructor() {
            super(...arguments);
            this._open = false;
            this._source = null;
            this._set = null;
        }
        static get observedAttributes() {
            return ['open', 'more', 'less', 'peek', 'gap', 'feel', 'haptics'];
        }
        get open() {
            return this._open;
        }
        set open(v) {
            if (this._set)
                this._set(!!v, false);
            else
                this._open = !!v;
        }
        mount() {
            if (!this._source) {
                const kids = [...this.children];
                this._source = kids.map((k) => k.cloneNode(true));
                kids.forEach((k) => k.remove());
            }
            const attr = this.getAttribute('open');
            if (attr !== this._seen) {
                this._seen = attr;
                this._open = this.flag('open');
            }
            const peek = Math.max(0, this.num('peek', 10));
            const gap = Math.max(0, this.num('gap', 10));
            const more = this.str('more', 'Show all');
            const less = this.str('less', 'Show less');
            const root = moments.make('div', 'usa-dkit usa-dstack');
            const list = moments.make('div', 'usa-dstack-list');
            list.id = microKit16.uid('usa-dstack');
            list.setAttribute('role', 'list');
            const cards = this._source.map((node, i) => {
                const c = moments.make('div', 'usa-dstack-card');
                c.setAttribute('role', 'listitem');
                c.style.zIndex = String(this._source.length - i);
                c.append(node.cloneNode(true));
                list.append(c);
                return c;
            });
            const btn = moments.make('button', 'usa-dstack-toggle');
            btn.type = 'button';
            btn.setAttribute('aria-controls', list.id);
            btn.hidden = cards.length < 2;
            root.append(list, btn);
            this.append(root);
            let heights = cards.map(() => 0);
            const measure = () => (heights = cards.map((c, i) => c.offsetHeight || heights[i] || 64));
            const init = { t: this._open ? 1 : 0 };
            cards.forEach((_, i) => (init[`c${i}`] = this._open ? 1 : 0));
            const group = microKit16.hostSprings(this, init, (v) => {
                cards.forEach((c, i) => {
                    const pose = dampedKit18$1.pilePose(i, heights, v[`c${i}`], peek, gap);
                    c.style.transform = `translateY(${pose.y}px) scale(${pose.scale})`;
                    c.style.opacity = String(Math.max(0, Math.min(1, pose.opacity)));
                });
                const shut = (heights[0] || 0) + Math.min(cards.length - 1, 3) * peek;
                const full = heights.reduce((s, x) => s + x, 0) + gap * Math.max(0, cards.length - 1);
                list.style.height = `${Math.round((shut + (full - shut) * Math.max(0, v.t)) * 10) / 10}px`;
            });
            const paint = () => {
                btn.textContent = this._open ? less : `${more} (${cards.length})`;
                btn.setAttribute('aria-expanded', String(this._open));
                root.toggleAttribute('data-open', this._open);
                cards.forEach((c, i) => {
                    const hide = !this._open && i > 0;
                    c.toggleAttribute('inert', hide);
                    c.setAttribute('aria-hidden', String(hide));
                });
            };
            const set = (on, user) => {
                if (on === this._open)
                    return;
                measure();
                this._open = on;
                paint();
                group.set({ t: on ? 1 : 0 }, { spring: on ? { duration: 560, bounce: 0.14 } : { duration: 420, bounce: 0 } });
                cards.forEach((_, i) => {
                    // a later card rides a slightly slower spring on the way out and a slightly quicker one on the way back
                    const k = on ? i : cards.length - 1 - i;
                    group.set({ [`c${i}`]: on ? 1 : 0 }, { spring: { duration: 460 + Math.min(k, 6) * 55, bounce: on ? 0.22 : 0.06 } });
                });
                if (user)
                    microKit16.tick(this, 6);
                this.emit('toggle', { open: on });
            };
            this._set = set;
            paint();
            measure();
            group.jump(init);
            this.listen(btn, 'click', () => set(!this._open, true));
            this.listen(list, 'click', (e) => {
                if (this._open || e.target.closest?.('a, button, input, textarea, select'))
                    return;
                set(true, true);
            });
            this.listen(root, 'keydown', (e) => {
                if (e.key !== 'Escape' || !this._open)
                    return;
                e.preventDefault();
                set(false, true);
                btn.focus({ preventScroll: true });
            });
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => {
                    measure();
                    if (!group.animating)
                        group.jump({ ...group.values });
                });
                cards.forEach((c) => ro.observe(c));
                this.onCleanup(() => ro.disconnect());
            }
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

exports.defineSpringStack = defineSpringStack;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/spring-stack.cjs.map