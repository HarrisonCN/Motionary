import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { s as safeImageUrl } from '../chunks/kit-DugHPVcq.js';
import { c as css } from '../chunks/data-media-Dlw8-L0c.js';

function defineLightbox(tag = 'usa-lightbox') {
    const ctor = defineElement(tag, Base => class Lightbox extends Base {
        constructor() {
            super(...arguments);
            this._index = -1;
        }
        static get observedAttributes() { return ['label', 'loop']; }
        get index() { return this._index; }
        open(index = 0) { this._open?.(index); }
        close() { this._close?.(); }
        mount() {
            const shots = Array.from(this.querySelectorAll('img')).filter((img) => !img.closest('.usa-lb-dialog')).map((thumb) => {
                const a = thumb.closest('a');
                const linked = a && this.contains(a) ? a.getAttribute('href') || '' : '';
                const full = [thumb.dataset.full || '', linked, thumb.currentSrc || thumb.src].map(safeImageUrl).find(Boolean) || thumb.src;
                const fig = thumb.closest('figure');
                const caption = (fig && this.contains(fig) ? fig.querySelector('figcaption')?.textContent : '') || thumb.alt || '';
                const trigger = a && this.contains(a) ? a : thumb;
                if (trigger === thumb) {
                    thumb.tabIndex = 0;
                    thumb.setAttribute('role', 'button');
                }
                trigger.classList.add('usa-lb-thumb');
                trigger.setAttribute('aria-haspopup', 'dialog');
                return { thumb, trigger, full, alt: thumb.alt, caption: caption.trim() };
            });
            const dialog = make('dialog', 'usa-kit usa-lb-dialog');
            dialog.setAttribute('aria-label', this.str('label', 'Image viewer'));
            const stage = make('div', 'usa-lb-stage');
            const img = make('img', 'usa-lb-img');
            img.draggable = false;
            stage.append(img);
            const bar = make('div', 'usa-lb-bar');
            const count = make('span', 'usa-lb-count');
            count.setAttribute('aria-live', 'polite');
            const btn = (cls, label) => { const b = make('button', `usa-lb-btn ${cls}`); b.type = 'button'; b.setAttribute('aria-label', label); b.append(make('span', 'usa-lb-glyph')); return b; };
            const prev = btn('usa-lb-prev', 'Previous image');
            const next = btn('usa-lb-next', 'Next image');
            const zoom = btn('usa-lb-zoom', 'Zoom in');
            const close = btn('usa-lb-close', 'Close');
            const cap = make('p', 'usa-lb-caption');
            bar.append(count, zoom, close);
            dialog.append(stage, prev, next, bar, cap);
            this.append(dialog);
            const many = shots.length > 1;
            prev.hidden = next.hidden = !many;
            let scale = 1, px = 0, py = 0;
            const apply = () => {
                img.style.transform = `translate(${px}px, ${py}px) scale(${scale})`;
                dialog.toggleAttribute('data-zoomed', scale > 1);
                zoom.setAttribute('aria-label', scale > 1 ? 'Zoom out' : 'Zoom in');
                zoom.setAttribute('aria-pressed', String(scale > 1));
            };
            const setZoom = (z) => { scale = z; if (z === 1)
                px = py = 0; apply(); };
            const show = (i, dir = 0) => {
                const n = shots.length;
                if (!n)
                    return;
                const to = this.flag('loop') ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i));
                const s = shots[to];
                this._index = to;
                img.src = s.full;
                img.alt = s.alt;
                cap.textContent = s.caption;
                cap.hidden = !s.caption;
                count.textContent = many ? `${to + 1} / ${n}` : '';
                prev.disabled = !this.flag('loop') && to === 0;
                next.disabled = !this.flag('loop') && to === n - 1;
                setZoom(1);
                if (dir && !this.reduced)
                    this.motion(img, [{ transform: `translateX(${dir * 40}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
            };
            // the picture grows out of the thumbnail's box (FLIP from the thumbnail rect to the stage)
            const grow = (s, reverse = false) => {
                if (this.reduced)
                    return null;
                const from = s.thumb.getBoundingClientRect(), to = img.getBoundingClientRect();
                if (!from.width || !to.width)
                    return null;
                const t = `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${from.width / to.width})`;
                const frames = [{ transform: t, opacity: 0.6 }, { transform: 'none', opacity: 1 }];
                return this.motion(img, reverse ? frames.reverse() : frames, { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
            };
            this._open = (i) => {
                if (!shots.length)
                    return;
                show(i);
                if (!dialog.open) {
                    if (typeof dialog.showModal === 'function')
                        dialog.showModal();
                    else
                        dialog.setAttribute('open', '');
                    const s = shots[this._index];
                    if (img.complete)
                        grow(s);
                    else
                        img.addEventListener('load', () => grow(s), { once: true });
                    this.emit('open', { index: this._index });
                }
            };
            let closing = false;
            this._close = () => {
                if (!dialog.open || closing)
                    return;
                closing = true;
                const s = shots[this._index];
                const done = () => {
                    closing = false;
                    if (typeof dialog.close === 'function')
                        dialog.close();
                    else
                        dialog.removeAttribute('open');
                };
                setZoom(1);
                const a = s ? grow(s, true) : null;
                if (a)
                    a.finished.then(done, done);
                else
                    done();
            };
            this.listen(dialog, 'close', () => {
                const s = shots[this._index];
                s?.trigger.focus({ preventScroll: true });
                this.emit('close');
            });
            this.listen(dialog, 'cancel', (e) => { e.preventDefault(); this._close?.(); });
            const step = (d) => { const before = this._index; show(this._index + d, d); if (this._index !== before)
                this.emit('change', { index: this._index }); };
            this.listen(prev, 'click', () => step(-1));
            this.listen(next, 'click', () => step(1));
            this.listen(close, 'click', () => this._close?.());
            this.listen(zoom, 'click', () => setZoom(scale > 1 ? 1 : 2));
            this.listen(img, 'dblclick', () => setZoom(scale > 1 ? 1 : 2));
            this.listen(dialog, 'click', (e) => { if (e.target === dialog || e.target === stage)
                this._close?.(); });
            this.listen(dialog, 'keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    step(-1);
                    e.preventDefault();
                }
                else if (e.key === 'ArrowRight') {
                    step(1);
                    e.preventDefault();
                }
                else if (e.key === '+' || e.key === '=')
                    setZoom(2);
                else if (e.key === '-')
                    setZoom(1);
            });
            // drag pans when zoomed, swipes between images when not
            let drag = null;
            this.listen(img, 'pointerdown', (e) => {
                drag = { x: e.clientX, y: e.clientY, px, py, id: e.pointerId };
                img.setPointerCapture?.(e.pointerId);
            });
            this.listen(img, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id || scale === 1)
                    return;
                const r = img.getBoundingClientRect();
                const lx = (r.width / scale) / 2, ly = (r.height / scale) / 2;
                px = Math.max(-lx, Math.min(lx, drag.px + e.clientX - drag.x));
                py = Math.max(-ly, Math.min(ly, drag.py + e.clientY - drag.y));
                apply();
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const dx = e.clientX - drag.x;
                if (scale === 1 && Math.abs(dx) > 50 && many)
                    step(dx < 0 ? 1 : -1);
                drag = null;
            };
            this.listen(img, 'pointerup', end);
            this.listen(img, 'pointercancel', () => (drag = null));
            shots.forEach((s, i) => {
                this.listen(s.trigger, 'click', (e) => {
                    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey)
                        return;
                    e.preventDefault();
                    this._open?.(i);
                });
                if (s.trigger === s.thumb)
                    this.listen(s.thumb, 'keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this._open?.(i);
                        }
                    });
            });
            this.onCleanup(() => {
                if (dialog.open)
                    dialog.close?.();
                for (const s of shots) {
                    s.trigger.classList.remove('usa-lb-thumb');
                    s.trigger.removeAttribute('aria-haspopup');
                    if (s.trigger === s.thumb) {
                        s.thumb.removeAttribute('tabindex');
                        s.thumb.removeAttribute('role');
                    }
                }
                dialog.remove();
                this._open = this._close = undefined;
                this._index = -1;
            });
        }
    }, { id: 'data-media', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineLightbox };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/lightbox.js.map