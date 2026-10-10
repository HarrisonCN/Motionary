'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-product-gallery{display:grid;gap:10px;width:var(--usa-pg2-w,320px);max-width:100%}.usa-pg2-stage{position:relative;aspect-ratio:var(--usa-pg2-ratio,1);border-radius:14px;overflow:hidden;background:#f1f5f9;cursor:zoom-in;outline:none}.usa-pg2-stage:focus-visible{box-shadow:0 0 0 3px #a78bfa}.usa-pg2-main{width:100%;height:100%;object-fit:cover;display:block;transition:transform .2s ease-out}.usa-pg2-thumbs{position:relative;display:flex;gap:8px;overflow-x:auto;padding:3px}.usa-pg2-thumb{flex:0 0 auto;width:var(--usa-pg2-t,56px);height:var(--usa-pg2-t,56px);padding:0;border:0;border-radius:10px;overflow:hidden;background:#e2e8f0;cursor:pointer;opacity:.65;transition:opacity .2s}.usa-pg2-thumb[aria-selected=true]{opacity:1}.usa-pg2-thumb img{width:100%;height:100%;object-fit:cover;display:block}.usa-pg2-thumb:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}.usa-pg2-ring{position:absolute;left:0;top:3px;height:var(--usa-pg2-t,56px);border-radius:10px;box-shadow:0 0 0 2px var(--usa-pg2-accent,#7c5cff);pointer-events:none;transition:transform .35s cubic-bezier(.3,1.3,.5,1),width .35s}@media (prefers-reduced-motion:reduce){.usa-pg2-ring,.usa-pg2-main{transition:none}}";

/** Wrap an index into 0..n-1 (7.3). */
const wrapIndex = (i, n) => (n ? ((i % n) + n) % n : 0);
function defineProductGallery(tag = 'usa-product-gallery') {
    return base.defineElement(tag, (Base) => {
        class UsaProductGallery extends Base {
            constructor() {
                super(...arguments);
                this._i = 0;
                this._imgs = [];
            }
            static get observedAttributes() {
                return ['index', 'nozoom', 'zoom'];
            }
            get count() {
                return this._imgs.length;
            }
            get index() {
                return this._i;
            }
            set index(v) {
                this.go(v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._imgs = Array.from(this.querySelectorAll(':scope > img'));
                this._imgs.forEach((im) => (im.hidden = true));
                this.insertAdjacentHTML('beforeend', '<div class="usa-pg2-stage" data-usa-part role="group" tabindex="0"><img class="usa-pg2-main" alt=""></div><div class="usa-pg2-thumbs" data-usa-part role="tablist" aria-label="Product images"></div>');
                const thumbs = this.querySelector('.usa-pg2-thumbs');
                this._imgs.forEach((im, i) => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'usa-pg2-thumb';
                    b.setAttribute('role', 'tab');
                    b.setAttribute('aria-label', im.alt || `Image ${i + 1}`);
                    b.innerHTML = `<img alt="" src="${im.getAttribute('src') || ''}">`;
                    this.listen(b, 'click', () => this.go(i));
                    thumbs.appendChild(b);
                });
                thumbs.insertAdjacentHTML('beforeend', '<i class="usa-pg2-ring" aria-hidden="true"></i>');
                const stage = this.querySelector('.usa-pg2-stage');
                const main = this.querySelector('.usa-pg2-main');
                this.listen(stage, 'keydown', (e) => {
                    if (e.key === 'ArrowRight')
                        (this.next(), e.preventDefault());
                    if (e.key === 'ArrowLeft')
                        (this.prev(), e.preventDefault());
                });
                this.listen(thumbs, 'keydown', (e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        e.key === 'ArrowRight' ? this.next() : this.prev();
                        thumbs.children[this._i]?.focus();
                        e.preventDefault();
                    }
                });
                let sx = 0;
                this.listen(stage, 'pointerdown', (e) => (sx = e.clientX));
                this.listen(stage, 'pointerup', (e) => {
                    const dx = e.clientX - sx;
                    if (e.pointerType !== 'mouse' && Math.abs(dx) > 40)
                        dx < 0 ? this.next() : this.prev();
                });
                this.listen(stage, 'pointermove', (e) => {
                    if (e.pointerType !== 'mouse' || this.reduced || this.flag('nozoom'))
                        return;
                    const r = stage.getBoundingClientRect();
                    main.style.transformOrigin = `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}% ${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`;
                    main.style.transform = `scale(${this.num('zoom', 2)})`;
                });
                this.listen(stage, 'pointerleave', () => (main.style.transform = ''));
                this._i = wrapIndex(this.num('index', 0), this.count);
                this.paint(0);
            }
            changed() {
                if (this.isConnected && this._imgs.length)
                    this.go(this.num('index', 0));
            }
            go(i) {
                const n = wrapIndex(Math.round(i), this.count);
                if (n === this._i)
                    return;
                const dir = n > this._i ? 1 : -1;
                this._i = n;
                this.paint(dir);
                this.emit('change', { index: n });
            }
            next() {
                this.go(wrapIndex(this._i + 1, this.count));
            }
            prev() {
                this.go(wrapIndex(this._i - 1, this.count));
            }
            paint(dir) {
                const im = this._imgs[this._i];
                const main = this.querySelector('.usa-pg2-main');
                if (!im || !main)
                    return;
                main.src = im.getAttribute('src') || '';
                main.alt = im.alt;
                this.querySelector('.usa-pg2-stage').setAttribute('aria-label', `Image ${this._i + 1} of ${this.count}${im.alt ? `: ${im.alt}` : ''}`);
                const thumbs = Array.from(this.querySelectorAll('.usa-pg2-thumb'));
                thumbs.forEach((t, k) => (t.setAttribute('aria-selected', String(k === this._i)), (t.tabIndex = k === this._i ? 0 : -1)));
                const t = thumbs[this._i];
                const ring = this.querySelector('.usa-pg2-ring');
                if (t && ring) {
                    ring.style.transform = `translateX(${t.offsetLeft}px)`;
                    ring.style.width = `${t.offsetWidth || 56}px`;
                }
                if (dir && !this.reduced)
                    this.motion(main, [{ transform: `translateX(${dir * 18}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
            }
        }
        return UsaProductGallery;
    }, { id: 'product-gallery', text: css });
}

exports.defineProductGallery = defineProductGallery;
exports.wrapIndex = wrapIndex;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.5.0/dist/chunks/product-gallery-mML9zLXE.cjs.map