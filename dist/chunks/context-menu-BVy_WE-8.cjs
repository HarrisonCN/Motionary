'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var partsKit = require('./parts-kit-CZw4-JX_.cjs');

/** Where to put a menu `w` × `h` opened at (x, y) so it stays `pad` px inside a `vw` × `vh` viewport (flips at edges). */
function placeMenu(x, y, w, h, vw, vh, pad = 8) {
    let left = x, top = y, originX = 'left', originY = 'top';
    if (x + w + pad > vw && x - w >= pad) {
        left = x - w;
        originX = 'right';
    }
    if (y + h + pad > vh && y - h >= pad) {
        top = y - h;
        originY = 'bottom';
    }
    left = Math.max(pad, Math.min(left, vw - w - pad));
    top = Math.max(pad, Math.min(top, vh - h - pad));
    return { left, top, originX, originY };
}
function defineContextMenu(tag = 'usa-context-menu') {
    const ctor = base.defineElement(tag, Base => class ContextMenu extends Base {
        static get observedAttributes() { return ['label', 'long-press']; }
        get open() { return !!this._api?.isOpen(); }
        show(x, y) { this._api?.show(x, y); }
        close() { this._api?.close(true); }
        mount() {
            const menu = this.querySelector(':scope > menu, :scope > [data-menu]');
            if (!menu)
                return;
            const area = Array.from(this.children).filter((c) => c !== menu);
            const target = area[0] ?? this;
            const madeFocusable = !target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName);
            if (madeFocusable)
                target.tabIndex = 0;
            target.classList.add('usa-ctx-target');
            target.setAttribute('aria-haspopup', 'menu');
            const was = { hidden: menu.hidden, cls: menu.className, role: menu.getAttribute('role'), label: menu.getAttribute('aria-label'), id: menu.id };
            menu.classList.add('usa-kit', 'usa-ctx-menu');
            menu.setAttribute('role', 'menu');
            menu.setAttribute('aria-label', this.str('label', 'Actions'));
            if (!menu.id)
                menu.id = moments.uniqueId('usa-ctx');
            target.setAttribute('aria-controls', menu.id);
            menu.hidden = true;
            const kids = Array.from(menu.children);
            const roles = kids.map((k) => [k.getAttribute('role'), k.getAttribute('tabindex')]);
            kids.forEach((k) => {
                if (k.tagName === 'HR') {
                    k.setAttribute('role', 'separator');
                    return;
                }
                k.setAttribute('role', 'menuitem');
                k.tabIndex = -1;
            });
            const items = () => kids.filter((k) => k.getAttribute('role') === 'menuitem');
            const enabled = () => items().filter((k) => k.getAttribute('aria-disabled') !== 'true');
            let isOpen = false;
            const focusAt = (i) => { const list = enabled(); if (list.length)
                list[(i + list.length) % list.length].focus(); };
            const close = (focus = false) => {
                if (!isOpen)
                    return;
                isOpen = false;
                menu.hidden = true;
                menu.removeAttribute('data-open');
                target.setAttribute('aria-expanded', 'false');
                if (focus)
                    target.focus();
                this.emit('close');
            };
            const show = (x, y) => {
                const r = target.getBoundingClientRect();
                const px = Number.isFinite(x) ? Number(x) : r.left + 12;
                const py = Number.isFinite(y) ? Number(y) : r.top + 12;
                menu.hidden = false;
                menu.toggleAttribute('data-static', this.reduced);
                const m = menu.getBoundingClientRect();
                const at = placeMenu(px, py, m.width || 200, m.height || 160, window.innerWidth, window.innerHeight);
                menu.style.left = `${at.left}px`;
                menu.style.top = `${at.top}px`;
                menu.style.setProperty('--ox', at.originX);
                menu.style.setProperty('--oy', at.originY);
                menu.removeAttribute('data-open');
                void menu.offsetWidth;
                menu.setAttribute('data-open', '');
                target.setAttribute('aria-expanded', 'true');
                if (!isOpen) {
                    isOpen = true;
                    this.emit('open', { x: Math.round(px), y: Math.round(py) });
                }
                focusAt(0);
            };
            this._api = { show, close, isOpen: () => isOpen };
            target.setAttribute('aria-expanded', 'false');
            this.listen(target, 'contextmenu', (e) => {
                if (e.shiftKey)
                    return;
                e.preventDefault();
                show(e.clientX, e.clientY);
            });
            this.listen(target, 'keydown', (e) => {
                if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
                    e.preventDefault();
                    show();
                }
            });
            const hold = Math.max(0, this.num('long-press', 500));
            let timer = 0;
            const cancel = () => { clearTimeout(timer); timer = 0; };
            if (hold) {
                this.listen(target, 'pointerdown', (e) => {
                    if (e.pointerType !== 'touch')
                        return;
                    cancel();
                    timer = window.setTimeout(() => show(e.clientX, e.clientY), hold);
                });
                for (const t of ['pointerup', 'pointercancel', 'pointermove'])
                    this.listen(target, t, (e) => { if (t !== 'pointermove' || Math.abs(e.movementX) + Math.abs(e.movementY) > 6)
                        cancel(); });
            }
            this.listen(menu, 'keydown', (e) => {
                const list = enabled();
                const i = list.indexOf(document.activeElement);
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    focusAt(i + 1);
                }
                else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    focusAt(i - 1);
                }
                else if (e.key === 'Home') {
                    e.preventDefault();
                    focusAt(0);
                }
                else if (e.key === 'End') {
                    e.preventDefault();
                    focusAt(-1);
                }
                else if (e.key === 'Escape') {
                    e.preventDefault();
                    close(true);
                }
                else if (e.key === 'Tab')
                    close(false);
                else if (e.key === 'Enter' || e.key === ' ') {
                    if (i >= 0) {
                        e.preventDefault();
                        list[i].click();
                    }
                }
                else if (e.key.length === 1) {
                    const k = e.key.toLowerCase();
                    const j = list.findIndex((it, n) => n > i && (it.textContent || '').trim().toLowerCase().startsWith(k));
                    const any = j >= 0 ? j : list.findIndex((it) => (it.textContent || '').trim().toLowerCase().startsWith(k));
                    if (any >= 0)
                        list[any].focus();
                }
            });
            this.listen(menu, 'click', (e) => {
                const it = e.target.closest('[role="menuitem"]');
                if (!it || !menu.contains(it))
                    return;
                if (it.getAttribute('aria-disabled') === 'true') {
                    e.preventDefault();
                    return;
                }
                this.emit('select', { index: items().indexOf(it), label: (it.textContent || '').trim() });
                close(true);
            });
            this.listen(document, 'pointerdown', (e) => { if (isOpen && !menu.contains(e.target))
                close(false); }, { capture: true });
            this.listen(window, 'resize', () => close(false));
            this.listen(window, 'scroll', () => close(false), { passive: true, capture: true });
            this.onCleanup(() => {
                cancel();
                isOpen = false;
                menu.hidden = was.hidden;
                menu.className = was.cls;
                if (was.role === null)
                    menu.removeAttribute('role');
                else
                    menu.setAttribute('role', was.role);
                if (was.label === null)
                    menu.removeAttribute('aria-label');
                else
                    menu.setAttribute('aria-label', was.label);
                if (!was.id)
                    menu.removeAttribute('id');
                menu.removeAttribute('data-open');
                menu.removeAttribute('data-static');
                menu.style.cssText = '';
                kids.forEach((k, n) => {
                    const [role, tab] = roles[n];
                    if (role === null)
                        k.removeAttribute('role');
                    else
                        k.setAttribute('role', role);
                    if (tab === null)
                        k.removeAttribute('tabindex');
                    else
                        k.setAttribute('tabindex', tab);
                });
                target.classList.remove('usa-ctx-target');
                if (!target.className)
                    target.removeAttribute('class');
                for (const a of ['aria-haspopup', 'aria-controls', 'aria-expanded'])
                    target.removeAttribute(a);
                if (madeFocusable)
                    target.removeAttribute('tabindex');
                this._api = undefined;
            });
        }
    }, { id: 'parts-kit', text: partsKit.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineContextMenu = defineContextMenu;
exports.placeMenu = placeMenu;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/context-menu-BVy_WE-8.cjs.map