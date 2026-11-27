'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var motionSurfaces = require('../chunks/motion-surfaces-BSXtpQ2Z.cjs');

function defineImageTrail(tag = 'usa-image-trail') {
    const ctor = base.defineElement(tag, Base => class ImageTrail extends Base {
        static get observedAttributes() { return ['distance', 'life', 'max', 'size']; }
        mount() {
            const kids = kit.ownChildren(this);
            const pool = kids.filter((k) => k.matches('img'));
            const content = kids.filter((k) => !pool.includes(k));
            const sources = pool.map((img) => kit.safeImageUrl(img.currentSrc || img.src)).filter(Boolean);
            const root = moments.make('div', 'usa-kit usa-trail');
            const layer = moments.make('div', 'usa-trail-layer');
            layer.setAttribute('aria-hidden', 'true');
            const body = moments.make('div', 'usa-trail-content');
            body.append(...content);
            root.append(layer, body);
            for (const img of pool)
                img.remove();
            this.append(root);
            const distance = Math.min(400, Math.max(20, this.num('distance', 90)));
            const life = Math.min(3000, Math.max(200, this.num('life', 900)));
            const max = Math.round(Math.min(30, Math.max(1, this.num('max', 10))));
            root.style.setProperty('--size', `${Math.min(480, Math.max(40, this.num('size', 160)))}px`);
            let last = null, n = 0, z = 1, lastT = 0;
            const live = [];
            const spawn = (x, y, dx, dy) => {
                if (!sources.length)
                    return;
                const img = moments.make('img', 'usa-trail-img');
                img.alt = '';
                img.decoding = 'async';
                img.draggable = false;
                img.src = sources[n++ % sources.length];
                img.style.left = `${x}px`;
                img.style.top = `${y}px`;
                img.style.zIndex = String(z++);
                const tilt = Math.max(-14, Math.min(14, dx * 0.15)) + (Math.random() * 6 - 3);
                layer.append(img);
                live.push(img);
                while (live.length > max)
                    live.shift().remove();
                const a = this.motion(img, [
                    { transform: `translate(-50%, -50%) translate(${-dx * 0.4}px, ${-dy * 0.4}px) rotate(${tilt}deg) scale(.4)`, opacity: 0 },
                    { transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`, opacity: 1, offset: 0.18 },
                    { transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`, opacity: 1, offset: 0.6 },
                    { transform: `translate(-50%, -50%) translateY(14px) rotate(${tilt}deg) scale(.6)`, opacity: 0 },
                ], { duration: life, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
                const drop = () => { img.remove(); const i = live.indexOf(img); if (i >= 0)
                    live.splice(i, 1); };
                if (a)
                    a.finished.then(drop, drop);
                else
                    drop();
            };
            this.listen(root, 'pointermove', (e) => {
                if (this.reduced || e.pointerType === 'touch')
                    return;
                const r = root.getBoundingClientRect();
                const x = e.clientX - r.left, y = e.clientY - r.top;
                if (!last) {
                    last = { x, y };
                    return;
                }
                const dx = x - last.x, dy = y - last.y;
                const t = base.now();
                if (Math.hypot(dx, dy) < distance || t - lastT < 30)
                    return;
                lastT = t;
                spawn(x, y, dx, dy);
                last = { x, y };
            }, { passive: true });
            this.listen(root, 'pointerleave', () => (last = null));
            this.onCleanup(() => {
                for (const img of live)
                    img.remove();
                this.append(...content, ...pool);
                root.remove();
            });
        }
    }, { id: 'motion-surfaces', text: motionSurfaces.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineImageTrail = defineImageTrail;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/image-trail.cjs.map