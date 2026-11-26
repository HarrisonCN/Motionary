'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var spring = require('../chunks/spring-DoapHVAk.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var motionSurfaces = require('../chunks/motion-surfaces-BSXtpQ2Z.cjs');

function defineHoverRevealList(tag = 'usa-hover-reveal-list') {
    const ctor = base.defineElement(tag, Base => class HoverRevealList extends Base {
        constructor() {
            super(...arguments);
            this._index = -1;
        }
        static get observedAttributes() { return ['size', 'tilt', 'label']; }
        get index() { return this._index; }
        mount() {
            const rows = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-hrl');
            root.setAttribute('role', 'list');
            root.setAttribute('aria-label', this.str('label', 'List'));
            const items = rows.map((r, i) => {
                const li = moments.make('div', 'usa-hrl-row');
                li.setAttribute('role', 'listitem');
                li.style.setProperty('--i', String(i));
                li.append(r);
                root.append(li);
                return { li, src: kit.safeImageUrl(r.dataset.image || '') };
            });
            const float = moments.make('div', 'usa-hrl-float');
            float.setAttribute('aria-hidden', 'true');
            const imgs = items.map(({ src }) => {
                const img = moments.make('img', 'usa-hrl-img');
                img.alt = '';
                img.decoding = 'async';
                if (src)
                    img.src = src;
                float.append(img);
                return img;
            });
            root.append(float);
            root.style.setProperty('--size', `${Math.min(480, Math.max(80, this.num('size', 240)))}px`);
            this.append(root);
            const tiltMax = Math.min(20, Math.max(0, this.num('tilt', 8)));
            let tx = 0, ty = 0;
            const place = () => {
                const lean = Math.max(-tiltMax, Math.min(tiltMax, sx.velocity / 120));
                float.style.transform = `translate(${sx.value}px, ${sy.value}px) translate(-50%, -50%) rotate(${lean.toFixed(2)}deg)`;
            };
            const sx = spring.createSpring({ value: 0, spring: { stiffness: 170, damping: 20 }, onUpdate: place });
            const sy = spring.createSpring({ value: 0, spring: { stiffness: 170, damping: 20 }, onUpdate: place });
            const show = (i) => {
                if (i === this._index)
                    return;
                this._index = i;
                const on = i >= 0 && !!items[i]?.src;
                root.toggleAttribute('data-showing', on);
                imgs.forEach((img, k) => img.toggleAttribute('data-on', k === i));
                items.forEach(({ li }, k) => li.toggleAttribute('data-active', k === i));
                this.emit('change', { index: i });
            };
            const moveTo = (x, y, jump) => {
                tx = x;
                ty = y;
                if (jump || this.reduced) {
                    sx.jump(tx);
                    sy.jump(ty);
                    place();
                }
                else {
                    sx.set(tx);
                    sy.set(ty);
                }
            };
            let inside = false;
            this.listen(root, 'pointermove', (e) => {
                if (e.pointerType === 'touch')
                    return;
                const r = root.getBoundingClientRect();
                const i = items.findIndex(({ li }) => li.contains(e.target));
                moveTo(e.clientX - r.left, e.clientY - r.top, !inside || this._index < 0);
                inside = true;
                show(i);
            });
            this.listen(root, 'pointerleave', () => { inside = false; show(-1); });
            this.listen(root, 'focusin', (e) => {
                const i = items.findIndex(({ li }) => li.contains(e.target));
                if (i < 0)
                    return;
                const r = root.getBoundingClientRect(), lr = items[i].li.getBoundingClientRect();
                moveTo(Math.min(r.width - 20, lr.width * 0.75), lr.top - r.top + lr.height / 2, this._index < 0);
                show(i);
            });
            this.listen(root, 'focusout', (e) => { if (!root.contains(e.relatedTarget))
                show(-1); });
            root.toggleAttribute('data-static', this.reduced);
            this.onCleanup(() => {
                sx.stop();
                sy.stop();
                this.append(...rows);
                root.remove();
                this._index = -1;
            });
        }
    }, { id: 'motion-surfaces', text: motionSurfaces.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineHoverRevealList = defineHoverRevealList;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/hover-reveal-list.cjs.map