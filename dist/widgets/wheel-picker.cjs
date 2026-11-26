'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var uiKit13 = require('../chunks/ui-kit-13-CrE_IdG4.cjs');

function defineWheelPicker(tag = 'usa-wheel-picker') {
    const ctor = base.defineElement(tag, Base => class WheelPicker extends Base {
        constructor() {
            super(...arguments);
            this._selects = [];
        }
        static get observedAttributes() { return ['label', 'rows']; }
        get values() { return this._selects.map((s) => s.value); }
        mount() {
            const selects = (this._selects = Array.from(this.querySelectorAll(':scope select')));
            const root = moments.make('div', 'usa-kit usa-wheel');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', this.str('label', 'Picker'));
            const rows = Math.max(3, Math.min(9, Math.round(this.num('rows', 5)) | 1));
            root.style.setProperty('--rows', String(rows));
            root.toggleAttribute('data-static', this.reduced);
            const hiddenWas = selects.map((s) => s.hidden);
            const tabWas = selects.map((s) => s.getAttribute('tabindex'));
            const frames = [];
            const wheels = selects.map((sel, w) => {
                sel.hidden = true;
                sel.tabIndex = -1;
                const opts = Array.from(sel.options);
                const col = moments.make('div', 'usa-wheel-col');
                const view = moments.make('div', 'usa-wheel-view');
                view.setAttribute('role', 'spinbutton');
                view.tabIndex = 0;
                const lab = sel.getAttribute('aria-label') || (sel.labels?.[0]?.textContent ?? '').trim() || sel.name || `${w + 1}`;
                view.setAttribute('aria-label', lab);
                view.setAttribute('aria-valuemin', '0');
                view.setAttribute('aria-valuemax', String(Math.max(0, opts.length - 1)));
                view.id = moments.uniqueId('usa-wheel');
                const list = moments.make('div', 'usa-wheel-list');
                list.setAttribute('aria-hidden', 'true');
                const items = opts.map((o, i) => {
                    const it = moments.make('div', 'usa-wheel-item', o.textContent || o.value);
                    it.dataset.i = String(i);
                    if (o.disabled)
                        it.setAttribute('data-disabled', '');
                    list.append(it);
                    return it;
                });
                view.append(list);
                col.append(view);
                return { sel, opts, view, list, items, current: Math.max(0, sel.selectedIndex) };
            });
            const band = moments.make('div', 'usa-wheel-band');
            band.setAttribute('aria-hidden', 'true');
            root.append(...wheels.map((w) => w.view.parentElement), band);
            this.append(root);
            const rowH = (w) => w.items[0]?.offsetHeight || 36;
            const paint = (w) => {
                const h = rowH(w);
                const pos = w.view.scrollTop / h;
                w.items.forEach((it, i) => {
                    const off = i - pos;
                    it.style.transform = this.reduced ? '' : `rotateX(${-kit13.wheelTilt(off)}deg)`;
                    it.style.opacity = String(Math.max(0.15, 1 - Math.abs(off) * 0.28));
                    it.toggleAttribute('data-on', i === w.current);
                });
            };
            const set = (wi, i, scroll = true, fire = true) => {
                const w = wheels[wi];
                let k = Math.max(0, Math.min(w.opts.length - 1, i));
                // skip disabled options in the direction of travel
                const dir = k >= w.current ? 1 : -1;
                while (w.opts[k]?.disabled && k + dir >= 0 && k + dir < w.opts.length)
                    k += dir;
                if (w.opts[k]?.disabled)
                    return;
                const changed = k !== w.current || w.sel.selectedIndex !== k;
                w.current = k;
                w.view.setAttribute('aria-valuenow', String(k));
                w.view.setAttribute('aria-valuetext', w.opts[k]?.textContent || w.opts[k]?.value || '');
                if (scroll)
                    w.view.scrollTo?.({ top: k * rowH(w), behavior: this.reduced ? 'auto' : 'smooth' });
                if (scroll && !w.view.scrollTo)
                    w.view.scrollTop = k * rowH(w);
                paint(w);
                if (changed && fire) {
                    w.sel.selectedIndex = k;
                    w.sel.dispatchEvent(new Event('input', { bubbles: true }));
                    w.sel.dispatchEvent(new Event('change', { bubbles: true }));
                    this.emit('change', { index: wi, values: this.values });
                }
            };
            wheels.forEach((w, wi) => {
                let settle = 0;
                // only a scroll the person started picks a value; a scroll the browser makes on its own (re-snapping after
                // layout, restoring a position) is put back on the current row instead
                let byUser = false;
                const touched = () => (byUser = true);
                for (const t of ['wheel', 'pointerdown', 'touchstart'])
                    this.listen(w.view, t, touched, { passive: true });
                this.listen(w.view, 'scroll', () => {
                    if (frames[wi])
                        base.caf(frames[wi]);
                    frames[wi] = base.raf(() => { frames[wi] = 0; paint(w); }, this);
                    clearTimeout(settle);
                    settle = window.setTimeout(() => {
                        const h = rowH(w);
                        if (!byUser) {
                            if (Math.abs(w.view.scrollTop - w.current * h) > 1)
                                w.view.scrollTop = w.current * h;
                            return;
                        }
                        byUser = false;
                        const k = kit13.wheelIndex(w.view.scrollTop, h, w.opts.length);
                        if (k !== w.current)
                            set(wi, k, Math.abs(w.view.scrollTop - k * h) > 1);
                    }, 90);
                }, { passive: true });
                this.onCleanup(() => clearTimeout(settle));
                this.listen(w.list, 'click', (e) => {
                    const it = e.target.closest?.('.usa-wheel-item');
                    if (it) {
                        set(wi, Number(it.dataset.i));
                        w.view.focus({ preventScroll: true });
                    }
                });
                this.listen(w.view, 'keydown', (e) => {
                    const page = Math.max(1, Math.floor(rows / 2));
                    const map = { ArrowDown: w.current + 1, ArrowUp: w.current - 1, PageDown: w.current + page, PageUp: w.current - page, Home: 0, End: w.opts.length - 1 };
                    if (!(e.key in map))
                        return;
                    e.preventDefault();
                    set(wi, map[e.key]);
                });
                this.listen(w.sel, 'change', () => { if (w.sel.selectedIndex !== w.current)
                    set(wi, w.sel.selectedIndex, true, false); });
                set(wi, w.current, false, false);
                w.view.scrollTop = w.current * rowH(w);
                paint(w);
            });
            this.onCleanup(() => {
                frames.forEach((f) => f && base.caf(f));
                root.remove();
                selects.forEach((s, i) => {
                    s.hidden = hiddenWas[i];
                    if (tabWas[i] === null)
                        s.removeAttribute('tabindex');
                    else
                        s.setAttribute('tabindex', tabWas[i]);
                });
            });
        }
    }, { id: 'ui-kit-13', text: uiKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineWheelPicker = defineWheelPicker;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/wheel-picker.cjs.map