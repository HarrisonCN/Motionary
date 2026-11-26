import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from '../chunks/moments-Cg_NlOYG.js';
import { o as ownChildren } from '../chunks/kit-DugHPVcq.js';
import { e as radialSpots } from '../chunks/kit-15-gywnm88n.js';
import { c as css } from '../chunks/ui-kit-15--UZAZBHt.js';

function defineRadialMenu(tag = 'usa-radial-menu') {
    const ctor = defineElement(tag, Base => class RadialMenu extends Base {
        constructor() {
            super(...arguments);
            this._open = false;
        }
        static get observedAttributes() { return ['open', 'label', 'radius', 'start', 'spread', 'icon']; }
        get open() { return this._open; }
        toggle(force) { this._set?.(force ?? !this._open, false); }
        mount() {
            const items = ownChildren(this);
            const root = make('div', 'usa-kit usa-rmenu');
            root.toggleAttribute('data-static', this.reduced);
            const id = uniqueId('usa-rmenu');
            const toggle = make('button', 'usa-rmenu-toggle');
            toggle.type = 'button';
            toggle.setAttribute('aria-label', this.str('label', 'Menu'));
            toggle.setAttribute('aria-controls', id);
            const mark = make('span', 'usa-rmenu-icon', this.str('icon', '＋'));
            mark.setAttribute('aria-hidden', 'true');
            toggle.append(mark);
            const ring = make('div', 'usa-rmenu-ring');
            ring.id = id;
            ring.setAttribute('role', 'group');
            ring.setAttribute('aria-label', this.str('label', 'Menu'));
            const spots = radialSpots(items.length, Math.max(32, Math.min(400, this.num('radius', 84))), this.num('start', -90), this.num('spread', 360));
            const focusables = [];
            items.forEach((el, i) => {
                const slot = make('div', 'usa-rmenu-item');
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
    }, { id: 'ui-kit-15', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineRadialMenu };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/radial-menu.js.map