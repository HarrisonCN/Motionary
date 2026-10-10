'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var components_fxPaper = require('../components/fx-paper.cjs');
require('../chunks/registry-BB1oO-lR.cjs');

var css = "usa-sticky-wall{display:flex;flex-wrap:wrap;gap:14px;padding:14px;align-items:flex-start}usa-sticky-wall>.usa-sticky{position:relative;box-sizing:border-box;width:120px;min-height:96px;padding:18px 12px 12px;font:500 13px/1.35 'Comic Sans MS','Segoe Print','Bradley Hand',cursive,system-ui;color:#3f3a2e;background:#fef08a;transform:rotate(var(--tilt,0deg));box-shadow:0 10px 16px -10px rgba(0,0,0,.45),inset 0 -12px 18px -14px rgba(0,0,0,.25);cursor:pointer;outline:none;transition:box-shadow .2s}usa-sticky-wall>.usa-sticky::before{content:'';position:absolute;top:5px;left:50%;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fca5a5,#dc2626 70%);box-shadow:0 2px 2px rgba(0,0,0,.3)}usa-sticky-wall>[data-paper=pink]{background:#fbcfe8}usa-sticky-wall>[data-paper=blue]{background:#bae6fd}usa-sticky-wall>[data-paper=green]{background:#bbf7d0}usa-sticky-wall>.usa-sticky:focus-visible{box-shadow:0 0 0 3px #6366f1,0 10px 16px -10px rgba(0,0,0,.45)}usa-sticky-wall>[data-picked]{box-shadow:0 18px 26px -12px rgba(0,0,0,.5)}";

const COLORS = ['yellow', 'pink', 'blue', 'green'];
function defineStickyWall(tag = 'usa-sticky-wall') {
    return base.defineElement(tag, (Base) => {
        class UsaStickyWall extends Base {
            constructor() {
                super(...arguments);
                this._z = 1;
            }
            static get observedAttributes() {
                return ['seed', 'label'];
            }
            get notes() {
                return Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
            }
            mount() {
                this.setAttribute('role', 'list');
                if (this.hasAttribute('label'))
                    this.setAttribute('aria-label', this.str('label'));
                const r = components_fxPaper.paperRandom(this.num('seed', 3));
                const notes = this.notes;
                notes.forEach((n, i) => {
                    n.classList.add('usa-sticky');
                    n.setAttribute('role', 'listitem');
                    n.tabIndex = 0;
                    const c = COLORS.includes(n.dataset.color || '') ? n.dataset.color : COLORS[i % COLORS.length];
                    n.setAttribute('data-paper', c);
                    n.style.setProperty('--tilt', `${((r() - 0.5) * 8).toFixed(1)}deg`);
                });
                let shown = false;
                this.inView((v) => {
                    if (!v || shown || this.reduced)
                        return;
                    shown = true;
                    notes.forEach((n, i) => this.motion(n, [{ transform: 'translateY(-40px) rotate(calc(var(--tilt) * 3)) scale(1.1)', opacity: 0 }, { transform: 'translateY(4px) rotate(var(--tilt))', opacity: 1, offset: 0.75 }, { transform: 'rotate(var(--tilt))', opacity: 1 }], { duration: 520, delay: i * 110, easing: 'cubic-bezier(.3,1.2,.5,1)', fill: 'backwards' }));
                }, { threshold: 0.2 });
                this.listen(this, 'click', (e) => {
                    const n = e.target.closest?.('.usa-sticky');
                    if (n && n.parentElement === this)
                        this.pick(this.notes.indexOf(n));
                });
                this.listen(this, 'keydown', (e) => {
                    const n = e.target.closest?.('.usa-sticky');
                    if (n && n.parentElement === this && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        this.pick(this.notes.indexOf(n));
                    }
                });
            }
            /** Lift note `index` to the front with a little wiggle. */
            pick(index) {
                const n = this.notes[index];
                if (!n)
                    return;
                n.style.zIndex = String(++this._z);
                this.notes.forEach((x) => x.removeAttribute('data-picked'));
                n.setAttribute('data-picked', '');
                if (!this.reduced)
                    this.motion(n, [{ transform: 'rotate(var(--tilt)) scale(1)' }, { transform: 'rotate(0deg) scale(1.08)', offset: 0.4 }, { transform: 'rotate(var(--tilt)) scale(1.04)' }], { duration: 360, easing: 'ease-out' });
                this.emit('pick', { index });
            }
        }
        return UsaStickyWall;
    }, { id: 'sticky-wall', text: css });
}

exports.defineStickyWall = defineStickyWall;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.3.0/dist/widgets/sticky-wall.cjs.map