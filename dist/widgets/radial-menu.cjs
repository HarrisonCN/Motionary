'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit15 = require('../chunks/kit-15-D1Ovwhys.cjs');
var uiKit15 = require('../chunks/ui-kit-15-D2S59TJU.cjs');

function defineRadialMenu(tag = 'usa-radial-menu') {
    const ctor = base.defineElement(tag, Base => class RadialMenu extends Base {
        constructor() {
            super(...arguments);
            this._open = false;
        }
        static get observedAttributes() { return ['open', 'label', 'radius', 'start', 'spread', 'icon']; }
        get open() { return this._open; }
        toggle(force) { this._set?.(force ?? !this._open, false); }
        mount() {
            const items = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-rmenu');
            root.toggleAttribute('data-static', this.reduced);
            const id = moments.uniqueId('usa-rmenu');
            const toggle = moments.make('button', 'usa-rmenu-toggle');
            toggle.type = 'button';
            toggle.setAttribute('aria-label', this.str('label', 'Menu'));
            toggle.setAttribute('aria-controls', id);
            const mark = moments.make('span', 'usa-rmenu-icon', this.str('icon', '＋'));
            mark.setAttribute('aria-hidden', 'true');
            toggle.append(mark);
            const ring = moments.make('div', 'usa-rmenu-ring');
            ring.id = id;
            ring.setAttribute('role', 'group');
            ring.setAttribute('aria-label', this.str('label', 'Menu'));
            const spots = kit15.radialSpots(items.length, Math.max(32, Math.min(400, this.num('radius', 84))), this.num('start', -90), this.num('spread', 360));
            const focusables = [];
            items.forEach((el, i) => {
                const slot = moments.make('div', 'usa-rmenu-item');
                slot.style.setProperty('--x', `${spots[i].x}px`);
                slot.style.setProperty('--y', `${spots[i].y}px`);
                slot.style.setProperty('--i', String(i));
                slot.append(el);
                ring.append(slot);
                const f = (el.matches('button, a[href], [tabindex]') ? el : el.querySelector('button, a[href], [tabindex]'));
                focusables.push(f || el);
            });
            root.append(ring, toggle);
            this.append(root);
            const set = (open, focus = true) => {
                if (open === this._open && root.hasAttribute('data-ready'))
                    return;
                this._open = open;
                root.toggleAttribute('data-open', open);
                toggle.setAttribute('aria-expanded', String(open));
                ring.inert = !open;
                if (!root.hasAttribute('data-ready')) {
                    root.setAttribute('data-ready', '');
                    if (!open)
                        return;
                }
                if (open && focus)
                    focusables[0]?.focus();
                if (!open && focus)
                    toggle.focus();
                this.emit('toggle', { open });
            };
            this._set = set;
            set(this.flag('open'), false);
            this.listen(toggle, 'click', () => set(!this._open, false));
            this.listen(ring, 'click', (e) => {
                const i = focusables.findIndex((f, k) => f.contains(e.target) || items[k].contains(e.target));
                if (i < 0)
                    return;
                // close first, so a listener that reacts to the pick sees the menu already shut
                set(false);
                this.emit('select', { index: i, label: (items[i].getAttribute('aria-label') || items[i].textContent || '').trim() });
            });
            this.listen(root, 'keydown', (e) => {
                if (e.key === 'Escape' && this._open) {
                    e.preventDefault();
                    set(false);
                    return;
                }
                const i = focusables.indexOf(document.activeElement);
                if (i < 0) {
                    if (e.target === toggle && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && items.length) {
                        e.preventDefault();
                        set(true);
                    }
                    return;
                }
                const n = focusables.length;
                const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % n
                    : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i - 1 + n) % n
                        : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
                if (next < 0)
                    return;
                e.preventDefault();
                focusables[next].focus();
            });
            this.onCleanup(() => {
                this._set = undefined;
                this._open = false;
                root.remove();
                this.append(...items);
            });
        }
    }, { id: 'ui-kit-15', text: uiKit15.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineRadialMenu = defineRadialMenu;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/radial-menu.cjs.map