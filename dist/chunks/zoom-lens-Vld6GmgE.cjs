'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var partsKit12 = require('./parts-kit-12-CKE_UdA5.cjs');

/**
 * The background position (px) that shows the point (`x`, `y`) of a `w` × `h` image, magnified `zoom` times, in the
 * middle of a round lens `size` px wide.
 */
function lensOffset(x, y, w, h, zoom, size) {
    const cx = Math.min(w, Math.max(0, x)), cy = Math.min(h, Math.max(0, y));
    return { x: Math.round(size / 2 - cx * zoom), y: Math.round(size / 2 - cy * zoom) };
}
function defineZoomLens(tag = 'usa-zoom-lens') {
    const ctor = base.defineElement(tag, Base => class ZoomLens extends Base {
        constructor() {
            super(...arguments);
            this._z = 0;
        }
        static get observedAttributes() { return ['zoom', 'size', 'label']; }
        get zoom() { return this._z || Math.min(6, Math.max(1.5, this.num('zoom', 2.5))); }
        set zoom(v) { this.setAttribute('zoom', String(v)); }
        mount() {
            const img = this.querySelector('img');
            if (!img)
                return;
            this._z = 0;
            const size = Math.min(400, Math.max(80, this.num('size', 170)));
            const root = moments.make('div', 'usa-kit usa-lens');
            root.tabIndex = 0;
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', `${this.str('label', 'Zoom')}: ${img.alt || ''}`.trim());
            root.setAttribute('aria-roledescription', 'zoom');
            root.style.setProperty('--size', `${size}px`);
            const lens = moments.make('div', 'usa-lens-glass');
            lens.setAttribute('aria-hidden', 'true');
            const parent = img.parentNode;
            const next = img.nextSibling;
            root.append(img, lens);
            this.append(root);
            root.toggleAttribute('data-static', this.reduced);
            let px = 0, py = 0, on = false;
            const draw = () => {
                const w = img.clientWidth, h = img.clientHeight;
                if (!w || !h)
                    return;
                const src = kit.safeImageUrl(img.currentSrc || img.src);
                if (!src)
                    return;
                const z = this.zoom;
                const o = lensOffset(px, py, w, h, z, size);
                lens.style.backgroundImage = `url("${src.replace(/"/g, '%22')}")`;
                lens.style.backgroundSize = `${w * z}px ${h * z}px`;
                lens.style.backgroundPosition = `${o.x}px ${o.y}px`;
                lens.style.transform = `translate(${Math.min(w, Math.max(0, px)) - size / 2}px, ${Math.min(h, Math.max(0, py)) - size / 2}px)`;
            };
            const show = (v) => { on = v; root.toggleAttribute('data-on', v); if (v)
                draw(); };
            const at = (e) => { const r = img.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; };
            this.listen(root, 'pointerenter', (e) => { if (e.pointerType === 'mouse') {
                at(e);
                show(true);
            } });
            this.listen(root, 'pointerdown', (e) => { if (e.pointerType !== 'mouse') {
                root.setPointerCapture?.(e.pointerId);
                at(e);
                show(true);
            } });
            this.listen(root, 'pointermove', (e) => { if (!on)
                return; at(e); draw(); });
            this.listen(root, 'pointerleave', (e) => { if (e.pointerType === 'mouse')
                show(false); });
            this.listen(root, 'pointerup', (e) => { if (e.pointerType !== 'mouse')
                show(false); });
            this.listen(root, 'pointercancel', () => show(false));
            this.listen(root, 'keydown', (e) => {
                const step = e.shiftKey ? 40 : 10;
                const w = img.clientWidth, h = img.clientHeight;
                if (!on && /^Arrow/.test(e.key)) {
                    px = w / 2;
                    py = h / 2;
                    show(true);
                    e.preventDefault();
                    return;
                }
                if (e.key === 'ArrowLeft')
                    px = Math.max(0, px - step);
                else if (e.key === 'ArrowRight')
                    px = Math.min(w, px + step);
                else if (e.key === 'ArrowUp')
                    py = Math.max(0, py - step);
                else if (e.key === 'ArrowDown')
                    py = Math.min(h, py + step);
                else if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_') {
                    this._z = Math.min(6, Math.max(1.5, Math.round((this.zoom + (e.key === '+' || e.key === '=' ? 0.5 : -0.5)) * 10) / 10));
                    this.emit('zoom', { zoom: this._z });
                }
                else if (e.key === 'Escape' && on) {
                    show(false);
                    e.preventDefault();
                    return;
                }
                else
                    return;
                e.preventDefault();
                if (!on)
                    show(true);
                else
                    draw();
            });
            this.listen(root, 'blur', () => show(false));
            this.onCleanup(() => {
                parent.insertBefore(img, next && next.parentNode === parent ? next : null);
                root.remove();
            });
        }
    }, { id: 'parts-kit-12', text: partsKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineZoomLens = defineZoomLens;
exports.lensOffset = lensOffset;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/zoom-lens-Vld6GmgE.cjs.map