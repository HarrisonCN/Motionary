'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var shared = require('../chunks/shared-BxK1D7EZ.cjs');

var css = "usa-swipe-deck{position:relative;display:grid;width:var(--usa-sd-w,240px);max-width:100%;height:var(--usa-sd-h,300px);touch-action:pan-y;outline-offset:6px;border-radius:18px}.usa-sd-card{grid-area:1/1;position:relative;display:grid;place-items:center;border-radius:18px;background:var(--usa-sd-bg,linear-gradient(160deg,#7c5cff,#22d3ee));color:#fff;font:800 22px/1.2 system-ui,sans-serif;box-shadow:0 12px 28px -10px rgba(0,0,0,.4);transition:transform .3s cubic-bezier(.3,1.3,.5,1),opacity .3s;user-select:none;cursor:grab;overflow:hidden;touch-action:none}.usa-sd-card.usa-sd-dragging{transition:none;cursor:grabbing}.usa-sd-stamp{position:absolute;top:18px;padding:4px 10px;border:3px solid currentColor;border-radius:8px;font:900 20px/1 system-ui,sans-serif;letter-spacing:.1em;opacity:0;pointer-events:none}.usa-sd-like{left:16px;color:#4ade80;transform:rotate(-14deg)}.usa-sd-nope{right:16px;color:#f87171;transform:rotate(14deg)}@media (prefers-reduced-motion:reduce){.usa-sd-card{transition:none}}";

function defineSwipeDeck(tag = 'usa-swipe-deck') {
    return base.defineElement(tag, (Base) => {
        class UsaSwipeDeck extends Base {
            constructor() {
                super(...arguments);
                this._cards = [];
                this._gone = [];
            }
            static get observedAttributes() {
                return ['label', 'threshold'];
            }
            get cards() {
                return this._cards.filter((c) => !this._gone.includes(c));
            }
            get top() {
                return this.cards[0] || null;
            }
            mount() {
                this._cards = shared.ownChildren(this);
                this._gone = [];
                this.setAttribute('role', 'region');
                this.setAttribute('aria-roledescription', 'card deck');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Cards'));
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this._cards.forEach((c) => {
                    c.classList.add('usa-sd-card');
                    if (!c.querySelector(':scope > .usa-sd-stamp')) {
                        c.insertAdjacentHTML('beforeend', '<span class="usa-sd-stamp usa-sd-like" data-usa-part aria-hidden="true">LIKE</span><span class="usa-sd-stamp usa-sd-nope" data-usa-part aria-hidden="true">NOPE</span>');
                    }
                });
                this.layout();
                this.listen(this, 'pointerdown', (e) => this.drag(e));
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'ArrowRight')
                        this.like();
                    else if (e.key === 'ArrowLeft')
                        this.nope();
                    else if (e.key === 'Backspace' || (e.key === 'z' && (e.ctrlKey || e.metaKey)))
                        this.undo();
                    else
                        return;
                    e.preventDefault();
                });
            }
            layout() {
                this.cards.forEach((c, i) => {
                    c.style.zIndex = String(100 - i);
                    c.style.transform = i ? `translateY(${Math.min(i, 2) * 10}px) scale(${1 - Math.min(i, 2) * 0.05})` : '';
                    c.style.opacity = i > 2 ? '0' : '1';
                    c.toggleAttribute('data-top', i === 0);
                    c.setAttribute('aria-hidden', String(i !== 0));
                });
                this._cards.filter((c) => this._gone.includes(c)).forEach((c) => (c.style.visibility = 'hidden'));
            }
            stamp(c, dx) {
                const k = Math.min(1, Math.abs(dx) / Math.max(40, this.num('threshold', 110)));
                c.querySelector('.usa-sd-like')?.style.setProperty('opacity', dx > 0 ? k.toFixed(2) : '0');
                c.querySelector('.usa-sd-nope')?.style.setProperty('opacity', dx < 0 ? k.toFixed(2) : '0');
            }
            fly(dir, dx = 0, dy = 0) {
                const c = this.top;
                if (!c)
                    return;
                const index = this._cards.indexOf(c);
                this._gone.push(c);
                const sign = dir === 'right' ? 1 : -1;
                const w = this.getBoundingClientRect().width || 300;
                const done = () => {
                    c.style.visibility = 'hidden';
                    this.stamp(c, 0);
                };
                const a = this.reduced
                    ? this.motion(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' })
                    : this.motion(c, [{ transform: `translate(${dx}px,${dy}px) rotate(${dx * 0.06}deg)` }, { transform: `translate(${sign * w * 1.5}px,${dy + 60}px) rotate(${sign * 30}deg)`, opacity: 0.6 }], { duration: 420, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
                if (a)
                    a.finished.then(done, done);
                else
                    done();
                this.layout();
                const next = this.top;
                if (next && !this.reduced)
                    this.motion(next, [{ transform: 'translateY(10px) scale(.95)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.3,1.3,.5,1)' });
                this.emit('swipe', { card: c, dir, index });
                if (!this.top)
                    this.emit('empty', {});
            }
            like() {
                this.fly('right');
            }
            nope() {
                this.fly('left');
            }
            undo() {
                const c = this._gone.pop();
                if (!c)
                    return;
                c.getAnimations?.().forEach((a) => a.cancel());
                c.style.visibility = '';
                this.layout();
                if (!this.reduced)
                    this.motion(c, [{ transform: 'translate(-120%,40px) rotate(-25deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
            }
            drag(e) {
                const c = this.top;
                if (!c || !c.contains(e.target) || e.button > 0)
                    return;
                const x0 = e.clientX;
                const y0 = e.clientY;
                const t0 = performance.now();
                let dx = 0;
                let dy = 0;
                c.setPointerCapture?.(e.pointerId);
                c.classList.add('usa-sd-dragging');
                const move = (ev) => {
                    dx = ev.clientX - x0;
                    dy = ev.clientY - y0;
                    c.style.transform = `translate(${dx}px,${dy}px) rotate(${this.reduced ? 0 : dx * 0.06}deg)`;
                    this.stamp(c, dx);
                };
                const up = () => {
                    c.removeEventListener('pointermove', move);
                    c.removeEventListener('pointerup', up);
                    c.removeEventListener('pointercancel', up);
                    c.classList.remove('usa-sd-dragging');
                    const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
                    if (Math.abs(dx) > this.num('threshold', 110) || (v > 0.6 && Math.abs(dx) > 30))
                        this.fly(dx > 0 ? 'right' : 'left', dx, dy);
                    else {
                        const from = c.style.transform;
                        c.style.transform = '';
                        this.stamp(c, 0);
                        if (!this.reduced && from)
                            this.motion(c, [{ transform: from }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.3,1.5,.5,1)' });
                    }
                };
                c.addEventListener('pointermove', move);
                c.addEventListener('pointerup', up);
                c.addEventListener('pointercancel', up);
            }
        }
        return UsaSwipeDeck;
    }, { id: 'swipe-deck', text: css });
}

exports.defineSwipeDeck = defineSwipeDeck;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.0.0/dist/widgets/swipe-deck.cjs.map