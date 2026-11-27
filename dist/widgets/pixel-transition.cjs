'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var motionKit13 = require('../chunks/motion-kit-13-CQF_2Unb.cjs');

function definePixelTransition(tag = 'usa-pixel-transition') {
    const ctor = base.defineElement(tag, Base => class PixelTransition extends Base {
        static get observedAttributes() { return ['grid', 'color', 'duration', 'trigger', 'flipped']; }
        get flipped() { return this.flag('flipped'); }
        set flipped(v) { this.toggleAttribute('flipped', !!v); }
        toggle(force) { this.flipped = force ?? !this.flipped; }
        changed(name) { if (name === 'flipped' && this._set)
            this._set(this.flipped);
        else
            super.changed(name); }
        mount() {
            const faces = Array.from(this.children).filter((c) => !c.classList.contains('usa-kit')).slice(0, 2);
            if (faces.length < 2)
                return;
            const root = moments.make('div', 'usa-kit usa-pixel');
            root.toggleAttribute('data-static', this.reduced);
            const front = moments.make('div', 'usa-pixel-face');
            const back = moments.make('div', 'usa-pixel-face');
            front.append(faces[0]);
            back.append(faces[1]);
            const n = Math.max(4, Math.min(30, Math.round(this.num('grid', 12))));
            const ms = Math.max(80, Math.min(2000, this.num('duration', 320)));
            root.style.setProperty('--n', String(n));
            root.style.setProperty('--px-ms', `${ms}ms`);
            const c = kit.cleanColor(this.str('color'));
            if (c)
                root.style.setProperty('--px', c);
            const grid = moments.make('div', 'usa-pixel-grid');
            grid.setAttribute('aria-hidden', 'true');
            const order = kit13.shuffleOrder(n * n, n);
            for (let k = 0; k < n * n; k++) {
                const p = moments.make('i');
                p.style.setProperty('--d', (order[k] / (n * n)).toFixed(3));
                grid.append(p);
            }
            root.append(front, back, grid);
            this.append(root);
            let shown = this.flipped;
            let timer = 0;
            const paintFaces = () => {
                front.toggleAttribute('inert', shown);
                back.toggleAttribute('inert', !shown);
                front.setAttribute('aria-hidden', String(shown));
                back.setAttribute('aria-hidden', String(!shown));
                root.toggleAttribute('data-back', shown);
            };
            paintFaces();
            const set = (on) => {
                if (on === shown && !timer)
                    return;
                clearTimeout(timer);
                if (this.reduced) {
                    shown = on;
                    timer = 0;
                    paintFaces();
                    this.emit('change', { flipped: on });
                    return;
                }
                root.setAttribute('data-cover', '');
                timer = window.setTimeout(() => {
                    shown = on;
                    paintFaces();
                    root.removeAttribute('data-cover');
                    timer = 0;
                    this.emit('change', { flipped: on });
                }, ms * 1.4);
            };
            this._set = set;
            const hover = this.str('trigger', 'hover') !== 'click';
            const want = (on) => { if (this.flipped !== on)
                this.flipped = on; };
            if (hover) {
                this.listen(root, 'pointerenter', (e) => { if (e.pointerType !== 'touch')
                    want(true); });
                this.listen(root, 'pointerleave', (e) => { if (e.pointerType !== 'touch')
                    want(false); });
                this.listen(root, 'focusin', () => want(true));
                this.listen(root, 'focusout', (e) => { if (!root.contains(e.relatedTarget))
                    want(false); });
            }
            this.listen(root, 'click', (e) => {
                if (e.target.closest('a,button,input,select,textarea,label'))
                    return;
                if (hover && e.pointerType && e.pointerType !== 'touch')
                    return;
                want(!this.flipped);
            });
            this.onCleanup(() => {
                clearTimeout(timer);
                for (const f of faces)
                    this.append(f);
                root.remove();
                this._set = undefined;
            });
        }
    }, { id: 'motion-kit-13', text: motionKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.definePixelTransition = definePixelTransition;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/pixel-transition.cjs.map