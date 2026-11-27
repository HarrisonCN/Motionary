'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var microKit16 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var spring = require('../chunks/spring-DoapHVAk.cjs');
var dampedKit18 = require('../chunks/damped-kit-18-CIpj0Cyz.cjs');

const IOS = () => typeof navigator !== 'undefined' && (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
function defineElasticScroll(tag = 'usa-elastic-scroll') {
    const ctor = base.defineElement(tag, (Base) => class ElasticScroll extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._scroller = null;
        }
        static get observedAttributes() {
            return ['height', 'label', 'feel', 'haptics'];
        }
        get scroller() {
            return this._scroller;
        }
        mount() {
            if (!this._source) {
                this._source = [...this.childNodes];
                this._source.forEach((n) => n.parentNode === this && this.removeChild(n));
            }
            const root = moments.make('div', 'usa-dkit usa-escroll');
            const box = moments.make('div', 'usa-escroll-box');
            box.tabIndex = 0;
            box.setAttribute('role', 'region');
            box.setAttribute('aria-label', this.str('label', 'Scrollable content'));
            const height = this.str('height');
            if (height)
                box.style.height = height;
            const content = moments.make('div', 'usa-escroll-content');
            content.append(...this._source.map((n) => n.cloneNode(true)));
            box.append(content);
            root.append(box);
            this.append(root);
            this._scroller = box;
            let h = 0;
            const measure = () => (h = box.clientHeight || h || 320);
            measure();
            let fired = false;
            const group = microKit16.hostSprings(this, { o: 0 }, (v) => {
                const shift = spring.rubberBand(v.o, h, 0.55);
                content.style.transform = Math.abs(shift) < 0.05 ? '' : `translateY(${Math.round(shift * 10) / 10}px)`;
                root.toggleAttribute('data-stretched', Math.abs(shift) >= 0.05);
            });
            const back = { duration: 560, bounce: 0 };
            const edgeOf = (o) => (o > 0 ? 'top' : 'bottom');
            const maybeFire = (o) => {
                if (fired || Math.abs(spring.rubberBand(o, h, 0.55)) < 56)
                    return;
                fired = true;
                microKit16.tick(this, 10);
                this.emit('edge', { edge: edgeOf(o) });
            };
            const atTop = () => box.scrollTop <= 0;
            const atBottom = () => box.scrollTop + box.clientHeight >= box.scrollHeight - 1;
            // wheel / trackpad: a push past an end becomes velocity that the spring absorbs and returns
            this.listen(box, 'wheel', (e) => {
                if (e.ctrlKey || e.deltaX * e.deltaX > e.deltaY * e.deltaY)
                    return;
                const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * h : e.deltaY;
                if (!((dy < 0 && atTop()) || (dy > 0 && atBottom())))
                    return;
                measure();
                if (!group.animating)
                    fired = false;
                const vel = Math.max(-2600, Math.min(2600, group.velocity('o') - dy * 9));
                group.set({ o: 0 }, { spring: back, velocity: { o: vel } });
                maybeFire(group.get('o') + vel * 0.12);
            }, { passive: true });
            // touch (not on iOS, which bounces natively): follow the finger past an end, then spring back
            let touch = null;
            this.listen(box, 'touchstart', (e) => {
                if (e.touches.length !== 1 || IOS())
                    return;
                measure();
                fired = false;
                touch = { y: e.touches[0].clientY, pull: 0, t: e.timeStamp, v: 0 };
            }, { passive: true });
            this.listen(box, 'touchmove', (e) => {
                if (!touch || e.touches.length !== 1)
                    return;
                const y = e.touches[0].clientY;
                const d = y - touch.y;
                const dt = Math.max(1, e.timeStamp - touch.t);
                touch.v = (d / dt) * 1000;
                touch.y = y;
                touch.t = e.timeStamp;
                if (touch.pull > 0 || (d > 0 && atTop()))
                    touch.pull = Math.max(0, touch.pull + d);
                else if (touch.pull < 0 || (d < 0 && atBottom()))
                    touch.pull = Math.min(0, touch.pull + d);
                else
                    return;
                group.jump({ o: touch.pull });
                maybeFire(touch.pull);
            }, { passive: true });
            const release = () => {
                if (!touch)
                    return;
                const t = touch;
                touch = null;
                if (t.pull)
                    group.set({ o: 0 }, { spring: back, velocity: { o: t.v } });
            };
            this.listen(box, 'touchend', release);
            this.listen(box, 'touchcancel', release);
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => measure());
                ro.observe(box);
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._scroller = null;
            });
        }
    }, { id: 'damped-kit-18', text: dampedKit18.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineElasticScroll = defineElasticScroll;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/elastic-scroll.cjs.map