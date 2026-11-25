'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var micro = require('../chunks/micro-3qfNbgwt.cjs');
var microKit16 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var springKit17$1 = require('../chunks/spring-kit-17-Y1urAq72.cjs');
var springKit17 = require('../chunks/spring-kit-17-BzIkfNWk.cjs');

const SVG = 'http://www.w3.org/2000/svg';
const HEART = 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z';
function defineSpringLike(tag = 'usa-spring-like') {
    const ctor = base.defineElement(tag, (Base) => class SpringLike extends Base {
        constructor() {
            super(...arguments);
            this._liked = false;
            this._count = NaN;
            this._go = null;
        }
        static get observedAttributes() {
            return ['liked', 'count', 'compact', 'label', 'dots', 'fx', 'disabled', 'feel', 'haptics'];
        }
        get liked() {
            return this._liked;
        }
        set liked(v) {
            this.toggle(!!v);
        }
        get count() {
            return this._count;
        }
        toggle(force) {
            const on = force === undefined ? !this._liked : !!force;
            if (this._go)
                this._go(on);
            else
                this._liked = on;
        }
        mount() {
            const key = `${this.getAttribute('liked')}|${this.getAttribute('count')}`;
            if (key !== this._seen) {
                this._seen = key;
                this._liked = this.flag('liked');
                this._count = this.hasAttribute('count') ? Math.max(0, Math.floor(this.num('count', 0))) : NaN;
            }
            const btn = moments.make('button', 'usa-skit usa-slike');
            btn.type = 'button';
            btn.disabled = this.flag('disabled');
            btn.setAttribute('aria-label', this.str('label', 'Like'));
            const heart = moments.make('span', 'usa-slike-heart');
            const svg = document.createElementNS(SVG, 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('aria-hidden', 'true');
            const path = document.createElementNS(SVG, 'path');
            path.setAttribute('d', HEART);
            svg.append(path);
            const ring = moments.make('span', 'usa-slike-ring');
            const pts = springKit17$1.burstPoints(this.num('dots', 8), 24);
            const dots = pts.map(() => moments.make('span', 'usa-slike-dot'));
            heart.append(svg, ring, ...dots);
            const shows = Number.isFinite(this._count);
            const count = moments.make('span', 'usa-slike-count');
            const reel = moments.make('span', 'usa-slike-reel');
            count.append(reel);
            count.setAttribute('aria-hidden', 'true');
            btn.append(heart);
            if (shows)
                btn.append(count);
            const live = moments.make('span', 'usa-skit-sr');
            live.setAttribute('aria-live', 'polite');
            this.append(btn, live);
            const handle = micro.micro(btn, this.str('fx', 'press hover focus'), { feel: this.str('feel') || undefined, haptics: this.flag('haptics') });
            const fmt = (n) => (this.flag('compact') ? springKit17$1.compactCount(n) : String(n));
            const group = microKit16.hostSprings(this, { s: 1, r: 0, b: 0, c: 0 }, (v) => {
                svg.style.transform = `scale(${Math.round(Math.max(0, v.s) * 1000) / 1000})`;
                const r = Math.min(1, Math.max(0, v.r));
                ring.style.transform = `scale(${Math.round((0.4 + r * 0.9) * 1000) / 1000})`;
                ring.style.opacity = String(r > 0 && r < 1 ? Math.round((1 - r) * 100) / 100 : 0);
                const b = Math.max(0, v.b);
                dots.forEach((d, i) => {
                    const p = pts[i];
                    d.style.transform = `translate(${Math.round(p.x * b * 10) / 10}px, ${Math.round(p.y * b * 10) / 10}px) scale(${Math.round(Math.max(0, 1 - b * 0.7) * 100) / 100})`;
                    d.style.opacity = String(b > 0.02 && b < 1 ? Math.round(Math.min(1, (1 - b) * 2.2) * 100) / 100 : 0);
                });
                reel.style.transform = `translateY(${Math.round(v.c * 10) / 10}%)`;
            });
            const paint = () => {
                btn.setAttribute('aria-pressed', String(this._liked));
                if (shows)
                    reel.textContent = fmt(this._count);
            };
            paint();
            this._go = (on) => {
                if (on === this._liked)
                    return;
                this._liked = on;
                if (shows)
                    this._count = Math.max(0, this._count + (on ? 1 : -1));
                paint();
                if (on) {
                    group.jump({ s: 0.55, r: 0, b: 0 });
                    group.set({ s: 1 }, { spring: 'pop' });
                    group.set({ r: 1, b: 1 }, { spring: 'smooth' });
                    microKit16.tick(this, 12);
                }
                else {
                    group.jump({ s: 0.85 });
                    group.set({ s: 1 }, { spring: 'gentle' });
                    group.jump({ r: 0, b: 0 });
                }
                if (shows) {
                    group.jump({ c: on ? 60 : -60 });
                    group.set({ c: 0 }, { spring: 'bouncy' });
                }
                live.textContent = shows ? `${on ? 'Liked' : 'Not liked'}, ${this._count}` : on ? 'Liked' : 'Not liked';
                this.emit('change', { liked: this._liked, count: shows ? this._count : null });
            };
            this.listen(btn, 'click', () => {
                if (btn.disabled)
                    return;
                this._go?.(!this._liked);
            });
            this.onCleanup(() => {
                group.stop();
                handle.destroy();
                btn.remove();
                live.remove();
                this._go = null;
            });
        }
    }, { id: 'spring-kit-17', text: springKit17.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSpringLike = defineSpringLike;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/spring-like.cjs.map