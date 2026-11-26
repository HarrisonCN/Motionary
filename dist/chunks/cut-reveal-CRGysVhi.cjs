'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var motionSurfaces = require('./motion-surfaces-BSXtpQ2Z.cjs');

/** The clip-path polygons of `count` strips (horizontal for slice, vertical for shred), in percent. */
function stripClips(style, count) {
    const n = Math.max(1, Math.min(24, Math.round(count)));
    if (style === 'split')
        return ['inset(0 50% 0 0)', 'inset(0 0 0 50%)'];
    if (style === 'tear') {
        // a jagged vertical tear down the middle; both halves share the same zigzag edge
        const pts = [];
        for (let i = 0; i <= 10; i++)
            pts.push(`${50 + (i % 2 ? 3 : -3)}% ${i * 10}%`);
        return [`polygon(0 0, ${pts.join(', ')}, 0 100%)`, `polygon(100% 0, ${pts.join(', ')}, 100% 100%)`];
    }
    const out = [];
    for (let i = 0; i < n; i++) {
        const a = ((i / n) * 100).toFixed(3), b = (100 - ((i + 1) / n) * 100).toFixed(3);
        out.push(style === 'shred' ? `inset(0 ${b}% 0 ${a}%)` : `inset(${a}% 0 ${b}% 0)`);
    }
    return out;
}
function defineCutReveal(tag = 'usa-cut-reveal') {
    const ctor = base.defineElement(tag, Base => class CutReveal extends Base {
        static get observedAttributes() { return ['cut', 'pieces', 'duration', 'trigger']; }
        play(direction = 'in') { return this._play?.(direction === 'out' ? 'out' : 'in') ?? Promise.resolve(); }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-cut');
            const content = moments.make('div', 'usa-cut-content');
            content.append(...kids);
            const layer = moments.make('div', 'usa-cut-layer');
            layer.setAttribute('aria-hidden', 'true');
            root.append(content, layer);
            this.append(root);
            const styles = ['slice', 'shred', 'split', 'tear'];
            const cut = (styles.includes(this.str('cut')) ? this.str('cut') : 'slice');
            const pieces = Math.round(Math.min(24, Math.max(2, this.num('pieces', 6))));
            const duration = Math.max(200, this.num('duration', 900));
            const manual = this.str('trigger') === 'manual';
            // veiled (transparent, still in the accessibility tree) until the first cut-in has played
            if (!manual && !this.reduced)
                content.setAttribute('data-veil', '');
            let running = [];
            const clear = () => { for (const a of running)
                a.cancel(); running = []; layer.textContent = ''; };
            const copy = () => {
                const c = content.cloneNode(true);
                c.className = 'usa-cut-piece';
                c.inert = true;
                for (const el of [c, ...Array.from(c.querySelectorAll('[id]'))])
                    el.removeAttribute('id');
                c.removeAttribute('data-veil');
                c.style.visibility = '';
                return c;
            };
            this._play = (dir) => {
                clear();
                if (this.reduced) {
                    content.removeAttribute('data-veil');
                    content.style.visibility = dir === 'out' ? 'hidden' : '';
                    const a = this.motion(content, dir === 'out' ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
                    const done = () => { this.emit('done', { direction: dir }); };
                    return a ? a.finished.then(done, done) : (done(), Promise.resolve());
                }
                const clips = stripClips(cut, pieces);
                const vertical = cut === 'shred';
                content.style.visibility = '';
                content.setAttribute('data-veil', '');
                const anims = clips.map((clip, i) => {
                    const piece = copy();
                    piece.style.clipPath = clip;
                    layer.append(piece);
                    const side = i % 2 ? 1 : -1;
                    const far = cut === 'split' || cut === 'tear' ? 60 : 110;
                    const offset = vertical ? `translateY(${side * far}%)` : `translateX(${side * far}%)`;
                    const twist = cut === 'tear' ? ` rotate(${side * 4}deg)` : '';
                    const away = { transform: offset + twist, opacity: cut === 'split' || cut === 'tear' ? 0 : 1 };
                    const home = { transform: 'none', opacity: 1 };
                    const delay = cut === 'split' || cut === 'tear' ? 0 : (i * duration * 0.35) / clips.length;
                    return this.motion(piece, dir === 'out' ? [home, away] : [away, home], { duration: duration * 0.65, delay, easing: dir === 'out' ? 'cubic-bezier(.55,0,.75,.2)' : 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
                });
                running = anims.filter(Boolean);
                const finish = () => {
                    clear();
                    content.removeAttribute('data-veil');
                    content.style.visibility = dir === 'out' ? 'hidden' : '';
                    this.emit('done', { direction: dir });
                };
                return Promise.all(running.map((a) => a.finished)).then(finish, () => { });
            };
            if (!manual) {
                let seen = false;
                this.inView((v) => { if (v && !seen) {
                    seen = true;
                    void this._play?.('in');
                } }, { threshold: 0.25 });
            }
            this.onCleanup(() => {
                clear();
                content.style.visibility = '';
                content.removeAttribute('data-veil');
                this.append(...kids);
                root.remove();
                this._play = undefined;
            });
        }
    }, { id: 'motion-surfaces', text: motionSurfaces.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineCutReveal = defineCutReveal;
exports.stripClips = stripClips;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/cut-reveal-CRGysVhi.cjs.map