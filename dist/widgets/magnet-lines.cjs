'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var motionKit13 = require('../chunks/motion-kit-13-CQF_2Unb.cjs');

function defineMagnetLines(tag = 'usa-magnet-lines') {
    const ctor = base.defineElement(tag, Base => class MagnetLines extends Base {
        static get observedAttributes() { return ['rows', 'columns', 'color', 'angle', 'length']; }
        mount() {
            const kids = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
            const rows = Math.max(3, Math.min(30, Math.round(this.num('rows', 9))));
            const cols = Math.max(3, Math.min(40, Math.round(this.num('columns', 12))));
            const rest = this.num('angle', -30);
            const root = moments.make('div', 'usa-kit usa-mlines');
            root.style.setProperty('--rows', String(rows));
            root.style.setProperty('--cols', String(cols));
            root.style.setProperty('--len', `${Math.max(6, Math.min(60, this.num('length', 18)))}px`);
            root.style.setProperty('--rest', `${rest}deg`);
            const c = kit.cleanColor(this.str('color'));
            if (c)
                root.style.setProperty('--line', c);
            root.toggleAttribute('data-static', this.reduced);
            const field = moments.make('div', 'usa-mlines-field');
            field.setAttribute('aria-hidden', 'true');
            const lines = Array.from({ length: rows * cols }, () => {
                const l = moments.make('i');
                field.append(l);
                return l;
            });
            const body = moments.make('div', 'usa-mlines-body');
            body.append(...kids);
            root.append(field, body);
            this.append(root);
            let frame = 0;
            let target = null;
            const draw = () => {
                frame = 0;
                const r = field.getBoundingClientRect();
                const w = r.width / cols, h = r.height / rows;
                const reach = Math.max(r.width, r.height) * 0.5 || 1;
                lines.forEach((l, k) => {
                    if (!target) {
                        l.style.removeProperty('--a');
                        l.style.removeProperty('--s');
                        return;
                    }
                    const cx = (k % cols + 0.5) * w, cy = (Math.floor(k / cols) + 0.5) * h;
                    l.style.setProperty('--a', `${kit13.angleTo(cx, cy, target.x, target.y) + 90}deg`);
                    const near = Math.max(0, 1 - Math.hypot(target.x - cx, target.y - cy) / reach);
                    l.style.setProperty('--s', (1 + near * 0.6).toFixed(2));
                });
            };
            const later = () => { if (!frame)
                frame = base.raf(draw, this); };
            if (!this.reduced) {
                this.listen(root, 'pointermove', (e) => {
                    const r = field.getBoundingClientRect();
                    target = { x: e.clientX - r.left, y: e.clientY - r.top };
                    root.setAttribute('data-live', '');
                    later();
                });
                this.listen(root, 'pointerleave', () => { target = null; root.removeAttribute('data-live'); later(); });
                this.listen(root, 'pointerup', (e) => { if (e.pointerType === 'touch') {
                    target = null;
                    root.removeAttribute('data-live');
                    later();
                } });
            }
            this.onCleanup(() => {
                if (frame)
                    base.caf(frame);
                this.append(...kids);
                root.remove();
            });
        }
    }, { id: 'motion-kit-13', text: motionKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMagnetLines = defineMagnetLines;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/magnet-lines.cjs.map