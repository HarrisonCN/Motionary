'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var motionKit = require('./motion-kit-Drqx5vzb.cjs');

/** The item facing the viewer when the ring is turned `rotation` degrees (items `360 / n` apart, item 0 at 0°). */
function frontIndex(rotation, n) {
    if (n <= 0)
        return 0;
    const step = 360 / n;
    return ((Math.round(-rotation / step) % n) + n) % n;
}
/** The ring radius (px) that keeps `n` items of width `w` with a `gap` between them around the circle. */
function ringRadius(n, w, gap = 24) {
    if (n < 2)
        return 0;
    return Math.round((n * (w + gap)) / (2 * Math.PI));
}
function defineOrbitGallery(tag = 'usa-orbit-gallery') {
    const ctor = base.defineElement(tag, Base => class OrbitGallery extends Base {
        constructor() {
            super(...arguments);
            this._index = 0;
        }
        static get observedAttributes() { return ['speed', 'tilt', 'item-width', 'height', 'label', 'pause-label', 'play-label']; }
        get index() { return this._index; }
        set index(i) { this._go?.(Math.round(Number(i)) || 0); }
        mount() {
            const kids = kit.ownChildren(this);
            const n = kids.length;
            if (!n)
                return;
            const w = Math.max(60, this.num('item-width', 180));
            const root = moments.make('div', 'usa-kit usa-orbit');
            root.setAttribute('role', 'region');
            root.setAttribute('aria-roledescription', 'carousel');
            root.setAttribute('aria-label', this.str('label', 'Gallery'));
            root.style.setProperty('--h', this.str('height', '420px'));
            root.style.setProperty('--w', `${w}px`);
            root.style.setProperty('--r', `${Math.max(w, ringRadius(n, w))}px`);
            root.style.setProperty('--tilt', `${this.num('tilt', -8)}deg`);
            const ring = moments.make('div', 'usa-orbit-ring');
            const step = 360 / n;
            const items = kids.map((k, i) => {
                const b = moments.make('button', 'usa-orbit-item');
                b.type = 'button';
                b.style.setProperty('--a', `${i * step}deg`);
                b.setAttribute('aria-label', k.getAttribute('alt') || k.getAttribute('aria-label') || (k.textContent || '').trim() || `${i + 1} / ${n}`);
                b.append(k);
                ring.append(b);
                return b;
            });
            const pause = moments.make('button', 'usa-kit-pause');
            pause.type = 'button';
            root.append(ring, pause);
            this.append(root);
            let rot = -this._index * step, vel = 0, target = rot, hold = false, visible = true, stopped = false;
            const speed = this.num('speed', 6);
            const drawPause = () => {
                pause.hidden = this.reduced || !speed;
                pause.textContent = stopped ? '▶' : '❚❚';
                pause.setAttribute('aria-label', stopped ? this.str('play-label', 'Play') : this.str('pause-label', 'Pause'));
                pause.setAttribute('aria-pressed', String(stopped));
            };
            const paint = () => {
                ring.style.setProperty('--rot', `${rot.toFixed(2)}deg`);
                const f = frontIndex(rot, n);
                items.forEach((b, i) => { b.toggleAttribute('data-front', i === f); b.tabIndex = i === f ? 0 : -1; b.setAttribute('aria-hidden', String(i !== f)); });
                if (f !== this._index) {
                    this._index = f;
                    this.emit('change', { index: f });
                }
            };
            const go = (i) => {
                const cur = frontIndex(rot, n);
                let d = (((i - cur) % n) + n) % n;
                if (d > n / 2)
                    d -= n;
                target = rot - d * step;
                vel = 0;
                if (this.reduced) {
                    rot = target;
                    target = null;
                    paint();
                }
            };
            this._go = go;
            let stop;
            const loop = () => {
                stop?.();
                stop = undefined;
                if (this.reduced || !visible)
                    return;
                stop = base.onFrame((_t, dt) => {
                    const s = Math.min(0.05, (dt || 16) / 1000);
                    if (target !== null) {
                        rot += (target - rot) * Math.min(1, s * 9);
                        if (Math.abs(target - rot) < 0.05) {
                            rot = target;
                            target = null;
                        }
                    }
                    else if (!hold) {
                        if (Math.abs(vel) > 2) {
                            rot += vel * s;
                            vel *= Math.pow(0.04, s);
                        }
                        else if (vel) {
                            vel = 0;
                            target = -Math.round(-rot / step) * step;
                        }
                        else if (!stopped && speed)
                            rot -= speed * s;
                    }
                    paint();
                }, this);
            };
            this.inView((v) => { visible = v; loop(); });
            this.listen(root, 'pointerenter', () => { if (!drag)
                hold = true; });
            this.listen(root, 'pointerleave', () => { if (!drag)
                hold = false; });
            this.listen(root, 'focusin', () => (hold = true));
            this.listen(root, 'focusout', (e) => { if (!root.contains(e.relatedTarget))
                hold = false; });
            let drag = null;
            this.listen(root, 'pointerdown', (e) => {
                if (e.button !== 0 || e.target === pause)
                    return;
                drag = { id: e.pointerId, x: e.clientX, t: e.timeStamp, moved: 0 };
                hold = true;
                target = null;
                vel = 0;
                root.setAttribute('data-drag', '');
            });
            this.listen(root, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const dx = e.clientX - drag.x, dt = Math.max(1, e.timeStamp - drag.t);
                if (Math.abs(dx) + drag.moved > 4 && !root.hasPointerCapture?.(e.pointerId))
                    root.setPointerCapture?.(e.pointerId);
                drag.moved += Math.abs(dx);
                rot += dx * 0.35;
                vel = (dx * 0.35 * 1000) / dt;
                drag.x = e.clientX;
                drag.t = e.timeStamp;
                if (this.reduced)
                    paint();
            });
            const drop = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const moved = drag.moved;
                drag = null;
                root.removeAttribute('data-drag');
                hold = root.matches(':hover') || root.contains(document.activeElement);
                if (this.reduced) {
                    target = null;
                    rot = -Math.round(-rot / step) * step;
                    paint();
                }
                if (moved > 6)
                    root.addEventListener('click', (c) => { c.stopPropagation(); c.preventDefault(); }, { capture: true, once: true });
            };
            this.listen(root, 'pointerup', drop);
            this.listen(root, 'pointercancel', drop);
            this.listen(root, 'keydown', (e) => {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')
                    return;
                e.preventDefault();
                const next = (frontIndex(target ?? rot, n) + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
                go(next);
                items[next].focus({ preventScroll: true });
            });
            items.forEach((b, i) => this.listen(b, 'click', () => { if (i === frontIndex(rot, n))
                this.emit('select', { index: i });
            else
                go(i); }));
            this.listen(pause, 'click', () => { stopped = !stopped; drawPause(); });
            this.onCleanup(() => {
                stop?.();
                this.append(...kids);
                root.remove();
                this._go = undefined;
            });
            root.toggleAttribute('data-static', this.reduced);
            drawPause();
            target = null;
            paint();
        }
    }, { id: 'motion-kit', text: motionKit.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineOrbitGallery = defineOrbitGallery;
exports.frontIndex = frontIndex;
exports.ringRadius = ringRadius;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/orbit-gallery-DWXGgnJI.cjs.map