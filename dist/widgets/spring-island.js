import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { u as uid, h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { h as frameOnce, i as islandShape } from '../chunks/fling-kit-19-Q_8uCj02.js';
import { c as css } from '../chunks/fling-kit-19-5HLYwuL1.js';

function defineSpringIsland(tag = 'usa-spring-island') {
    const ctor = defineElement(tag, (Base) => class SpringIsland extends Base {
        constructor() {
            super(...arguments);
            this._open = false;
            this._source = null;
            this._set = null;
            this._pulse = null;
        }
        static get observedAttributes() {
            return ['expanded', 'label', 'close', 'feel', 'haptics'];
        }
        get expanded() {
            return this._open;
        }
        set expanded(v) {
            if (this._set)
                this._set(!!v, false);
            else
                this._open = !!v;
        }
        expand() {
            this.expanded = true;
        }
        collapse() {
            this.expanded = false;
        }
        toggle() {
            this.expanded = !this._open;
        }
        pulse() {
            this._pulse?.();
        }
        mount() {
            if (!this._source) {
                const nodes = [...this.childNodes];
                const isCompact = (n) => n.nodeType === 1 && n.hasAttribute('data-compact');
                this._source = { compact: nodes.filter(isCompact), card: nodes.filter((n) => !isCompact(n)) };
                nodes.forEach((n) => n.parentNode === this && this.removeChild(n));
            }
            const attr = this.hasAttribute('expanded');
            if (attr !== this._seen) {
                this._seen = attr;
                this._open = attr;
            }
            const root = make('div', 'usa-fkit usa-island');
            const pill = make('div', 'usa-island-pill');
            const face = make('button', 'usa-island-compact');
            face.type = 'button';
            face.append(...this._source.compact.map((n) => n.cloneNode(true)));
            if (!face.textContent?.trim())
                face.setAttribute('aria-label', this.str('label', 'Show more'));
            const panel = make('div', 'usa-island-panel');
            panel.id = uid('usa-island');
            panel.setAttribute('role', 'group');
            panel.setAttribute('aria-label', this.str('label', '') || face.textContent?.trim() || 'Details');
            face.setAttribute('aria-controls', panel.id);
            const shut = make('button', 'usa-island-close', '×');
            shut.type = 'button';
            shut.setAttribute('aria-label', this.str('close', 'Collapse'));
            panel.append(...this._source.card.map((n) => n.cloneNode(true)), shut);
            pill.append(face, panel);
            root.append(pill);
            this.append(root);
            let small = { w: 0, h: 0 };
            let big = { w: 0, h: 0 };
            const measure = () => {
                small = { w: face.offsetWidth || 120, h: face.offsetHeight || 36 };
                const room = root.clientWidth || 360;
                panel.style.maxWidth = `${room}px`;
                big = { w: Math.min(room, panel.offsetWidth || 300), h: panel.offsetHeight || 160 };
            };
            measure();
            const group = hostSprings(this, { t: this._open ? 1 : 0, sx: 1, sy: 1 }, (v) => {
                const s = islandShape(v.t, small, big);
                pill.style.width = `${s.width}px`;
                pill.style.height = `${s.height}px`;
                pill.style.borderRadius = `${s.radius}px`;
                pill.style.transform = v.sx === 1 && v.sy === 1 ? '' : `scale(${Math.round(v.sx * 1000) / 1000}, ${Math.round(v.sy * 1000) / 1000})`;
                const t = Math.min(1, Math.max(0, v.t));
                face.style.opacity = String(Math.round(Math.max(0, 1 - t * 2.4) * 1000) / 1000);
                const p = Math.max(0, (t - 0.3) / 0.7);
                panel.style.opacity = String(Math.round(p * 1000) / 1000);
                panel.style.transform = `scale(${Math.round((0.94 + 0.06 * p) * 1000) / 1000})`;
            });
            const paint = () => {
                face.setAttribute('aria-expanded', String(this._open));
                face.toggleAttribute('inert', this._open);
                panel.toggleAttribute('inert', !this._open);
                panel.setAttribute('aria-hidden', String(!this._open));
                root.toggleAttribute('data-expanded', this._open);
            };
            const set = (open, user) => {
                if (open === this._open)
                    return;
                const hadFocus = this.contains(document.activeElement);
                this._open = open;
                measure();
                paint();
                group.set({ t: open ? 1 : 0 }, { spring: open ? { duration: 620, bounce: 0.24 } : { duration: 440, bounce: 0.12 } });
                if (user)
                    tick(this, 6);
                if (open && user)
                    shut.focus({ preventScroll: true });
                else if (!open && hadFocus)
                    face.focus({ preventScroll: true });
                this.emit('toggle', { expanded: open });
            };
            this._set = set;
            this._pulse = () => {
                if (this._open)
                    return;
                group.impulse({ sx: 2.2, sy: -1.6 }, { duration: 520, bounce: 0.5 });
                tick(this, [6, 40, 6]);
            };
            paint();
            group.jump({ t: this._open ? 1 : 0 });
            this.listen(face, 'click', () => set(true, true));
            this.listen(shut, 'click', () => set(false, true));
            this.listen(root, 'keydown', (e) => {
                if (e.key === 'Escape' && this._open) {
                    e.preventDefault();
                    set(false, true);
                }
            });
            this.listen(document, 'pointerdown', (e) => {
                if (this._open && !this.contains(e.target))
                    set(false, false);
            });
            if (typeof ResizeObserver !== 'undefined') {
                const later = frameOnce(() => {
                    measure();
                    if (!group.animating)
                        group.jump({ t: this._open ? 1 : 0 });
                }, this);
                const ro = new ResizeObserver(() => later.ask());
                ro.observe(root);
                ro.observe(panel);
                this.onCleanup(() => {
                    ro.disconnect();
                    later.cancel();
                });
            }
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._set = null;
                this._pulse = null;
            });
        }
    }, { id: 'fling-kit-19', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSpringIsland };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/spring-island.js.map