'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var motionKit = require('./motion-kit-Bl78eN_4.cjs');

/**
 * Where item `i` of `n` sits in the tunnel at scroll `progress` (0–1): depth `z` (px, negative = far away), sideways
 * offsets (alternating left / right, up / down) and opacity (fades in from the far end, out as it passes the viewer).
 */
function tunnelPose(progress, i, n, depth = 1600) {
    const count = Math.max(1, n);
    const p = Math.min(1, Math.max(0, progress)) * count;
    const rel = p - i; // < 0: not reached yet; 0..1: coming at you; > 1: passed
    const z = Math.round((rel - 1) * depth);
    const side = i % 2 ? 1 : -1;
    const lift = i % 3 === 0 ? -1 : i % 3 === 1 ? 1 : 0;
    const far = Math.min(1, Math.max(0, (rel + 1.2) / 1.2));
    const near = rel > 0.85 ? Math.max(0, 1 - (rel - 0.85) / 0.25) : 1;
    return { x: side * 22, y: lift * 14, z, opacity: Math.round(far * near * 1000) / 1000 };
}
function defineImageTunnel(tag = 'usa-image-tunnel') {
    const ctor = base.defineElement(tag, Base => class ImageTunnel extends Base {
        constructor() {
            super(...arguments);
            this._index = 0;
        }
        static get observedAttributes() { return ['depth', 'length', 'size', 'min-width', 'label']; }
        get index() { return this._index; }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make('section', 'usa-kit usa-tunnel');
            root.setAttribute('aria-label', this.str('label', 'Gallery'));
            const pin = moments.make('div', 'usa-tunnel-pin');
            const stage = moments.make('div', 'usa-tunnel-stage');
            const items = kids.map((k) => { const it = moments.make('div', 'usa-tunnel-item'); it.append(k); stage.append(it); return it; });
            pin.append(stage);
            root.append(pin);
            const size = this.str('size');
            if (size)
                root.style.setProperty('--size', size);
            root.style.setProperty('--len', `${Math.max(100, items.length * Math.max(20, this.num('length', 70)) + 100)}vh`);
            this.append(root);
            const depth = Math.max(200, this.num('depth', 1600)), minW = Math.max(0, this.num('min-width', 640));
            let pinned = false, pending = 0;
            const update = () => {
                pending = 0;
                if (!pinned)
                    return;
                const r = root.getBoundingClientRect();
                const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
                let best = 0, bestZ = -Infinity;
                items.forEach((it, i) => {
                    const pose = tunnelPose(p, i, items.length, depth);
                    it.style.setProperty('--tx', `${pose.x}vw`);
                    it.style.setProperty('--ty', `${pose.y}vh`);
                    it.style.setProperty('--tz', `${pose.z}px`);
                    it.style.setProperty('--to', String(pose.opacity));
                    if (pose.z <= 0 && pose.z > bestZ) {
                        bestZ = pose.z;
                        best = i;
                    }
                });
                if (best !== this._index) {
                    this._index = best;
                    this.emit('change', { index: best });
                }
            };
            const layout = () => {
                const sticky = typeof CSS === 'undefined' || !CSS.supports || (CSS.supports('position', 'sticky') && CSS.supports('transform-style', 'preserve-3d'));
                pinned = !this.reduced && sticky && window.innerWidth >= minW && items.length > 0;
                root.toggleAttribute('data-pinned', pinned);
                if (!pinned)
                    items.forEach((it) => it.removeAttribute('style'));
                update();
            };
            const queue = () => { if (pinned && !pending)
                pending = base.raf(update, this); };
            this.listen(window, 'scroll', queue, { passive: true });
            this.listen(window, 'resize', layout, { passive: true });
            // keyboard: a focused link inside an image brings that image to the front
            this.listen(stage, 'focusin', (e) => {
                if (!pinned)
                    return;
                const i = items.findIndex((it) => it.contains(e.target));
                if (i < 0)
                    return;
                const total = Math.max(1, root.offsetHeight - window.innerHeight);
                window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY + ((i + 0.6) / items.length) * total, behavior: 'auto' });
            });
            this.onCleanup(() => {
                if (pending)
                    base.caf(pending);
                this.append(...kids);
                root.remove();
                this._index = 0;
            });
            layout();
        }
    }, { id: 'motion-kit', text: motionKit.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineImageTunnel = defineImageTunnel;
exports.tunnelPose = tunnelPose;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/image-tunnel-B24fEP_Y.cjs.map