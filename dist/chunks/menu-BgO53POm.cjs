'use strict';

var base = require('./base-B3me2y0o.cjs');
var shared = require('./shared-BxK1D7EZ.cjs');

var css = "usa-menu{position:relative;display:inline-block}.usa-menu-list{position:absolute;z-index:50;min-width:180px;max-width:min(280px,90vw);box-sizing:border-box;padding:6px;border-radius:12px;background:var(--usa-menu-bg,#fff);color:var(--usa-menu-fg,#111827);box-shadow:0 18px 44px -12px rgba(0,0,0,.35),0 0 0 1px rgba(127,127,127,.15);display:flex;flex-direction:column;gap:2px;text-align:left}.usa-menu-list[hidden]{display:none}usa-menu[data-placement^=\"bottom\"] .usa-menu-list{top:calc(100% + 6px)}usa-menu[data-placement^=\"top\"] .usa-menu-list{bottom:calc(100% + 6px)}usa-menu[data-placement$=\"start\"] .usa-menu-list{left:0;transform-origin:0 0}usa-menu[data-placement$=\"end\"] .usa-menu-list{right:0;transform-origin:100% 0}usa-menu[data-placement=\"top-start\"] .usa-menu-list{transform-origin:0 100%}usa-menu[data-placement=\"top-end\"] .usa-menu-list{transform-origin:100% 100%}.usa-menu-list>[role=\"menuitem\"]{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;border:0;background:none;color:inherit;font:500 14px/1.3 system-ui,sans-serif;text-align:left;text-decoration:none;padding:8px 10px;border-radius:8px;cursor:pointer}.usa-menu-list>[role=\"menuitem\"]:hover,.usa-menu-list>[role=\"menuitem\"]:focus-visible{background:var(--usa-menu-hover,rgba(124,92,255,.14));outline:none}.usa-menu-list>hr{border:0;border-top:1px solid rgba(127,127,127,.2);margin:4px 2px}@media (prefers-color-scheme:dark){.usa-menu-list{background:var(--usa-menu-bg,#1d2130);color:var(--usa-menu-fg,#e5e7eb)}}";

const MENU_EFFECTS = ['scale', 'fold', 'slide'];
function defineMenu(tag = 'usa-menu') {
    return base.defineElement(tag, (Base) => {
        class UsaMenu extends Base {
            constructor() {
                super(...arguments);
                this._btn = null;
                this._list = null;
                this._items = [];
                this._open = false;
            }
            static get observedAttributes() {
                return ['placement', 'effect'];
            }
            get opened() {
                return this._open;
            }
            mount() {
                const kids = shared.ownChildren(this);
                this._btn = kids.find((k) => k.hasAttribute('data-trigger')) || kids[0] || null;
                let list = this.querySelector(':scope > .usa-menu-list');
                if (!list) {
                    list = shared.part('div', 'usa-menu-list', { role: 'menu' });
                    for (const k of kids)
                        if (k !== this._btn)
                            list.append(k);
                    this.append(list);
                }
                this._list = list;
                list.id || (list.id = shared.nextId('usa-menu'));
                list.hidden = !this._open;
                const pl = this.str('placement', 'bottom-start');
                this.dataset.placement = /^(bottom|top)-(start|end)$/.test(pl) ? pl : 'bottom-start';
                const ef = this.str('effect', 'scale');
                this.dataset.effect = MENU_EFFECTS.includes(ef) ? ef : 'scale';
                this._items = Array.from(list.children).filter((c) => c instanceof HTMLElement && !c.matches('hr,[role="separator"]'));
                list.querySelectorAll('hr').forEach((h) => h.setAttribute('role', 'separator'));
                this._items.forEach((it, i) => {
                    it.setAttribute('role', 'menuitem');
                    it.tabIndex = -1;
                    if (it.localName === 'button' && !it.hasAttribute('type'))
                        it.setAttribute('type', 'button');
                    this.listen(it, 'click', () => {
                        this.emit('select', { index: i, value: it.dataset.value || (it.textContent || '').trim(), item: it });
                        this.close(true);
                    });
                });
                const b = this._btn;
                if (b) {
                    b.setAttribute('aria-haspopup', 'menu');
                    b.setAttribute('aria-expanded', String(this._open));
                    b.setAttribute('aria-controls', list.id);
                    if (b.localName === 'button' && !b.hasAttribute('type'))
                        b.setAttribute('type', 'button');
                    this.listen(b, 'click', () => this.toggle());
                    this.listen(b, 'keydown', (e) => {
                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            this.open(e.key === 'ArrowUp' ? 'last' : 'first');
                        }
                    });
                }
                this.listen(list, 'keydown', (e) => {
                    const n = this._items.length;
                    const i = this._items.indexOf(document.activeElement);
                    let j = -1;
                    if (e.key === 'ArrowDown')
                        j = (i + 1) % n;
                    else if (e.key === 'ArrowUp')
                        j = (i - 1 + n) % n;
                    else if (e.key === 'Home')
                        j = 0;
                    else if (e.key === 'End')
                        j = n - 1;
                    else if (e.key === 'Escape') {
                        e.preventDefault();
                        return this.close(true);
                    }
                    else if (e.key === 'Tab')
                        return this.close(false);
                    if (j >= 0) {
                        e.preventDefault();
                        this._items[j]?.focus();
                    }
                });
                this.listen(document, 'pointerdown', (e) => {
                    if (this._open && !this.contains(e.target))
                        this.close(false);
                });
            }
            open(focus = 'first') {
                const l = this._list;
                if (!l || this._open)
                    return;
                this._open = true;
                l.hidden = false;
                this._btn?.setAttribute('aria-expanded', 'true');
                this.setAttribute('data-open', '');
                const ef = this.dataset.effect;
                if (this.reduced)
                    this.motion(l, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
                else {
                    const f = ef === 'fold' ? [{ transform: 'perspective(600px) rotateX(-70deg)', opacity: 0 }, { transform: 'none', opacity: 1 }] : ef === 'slide' ? [{ transform: 'translateY(-10px)', opacity: 0, clipPath: 'inset(0 0 100% 0 round 12px)' }, { transform: 'none', opacity: 1, clipPath: 'inset(0 0 0 0 round 12px)' }] : [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }];
                    this.motion(l, f, { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' });
                    this._items.forEach((it, i) => this.motion(it, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: 40 + i * 35, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
                }
                (focus === 'last' ? this._items[this._items.length - 1] : this._items[0])?.focus();
                this.emit('open');
            }
            close(focusTrigger = false) {
                const l = this._list;
                if (!l || !this._open)
                    return;
                this._open = false;
                this._btn?.setAttribute('aria-expanded', 'false');
                this.removeAttribute('data-open');
                const a = this.motion(l, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: this.reduced ? 'none' : 'scale(.96)' }], { duration: this.reduced ? 80 : 150, easing: 'ease-in' });
                const hide = () => {
                    if (!this._open)
                        l.hidden = true;
                };
                if (a)
                    a.finished.then(hide, hide);
                else
                    hide();
                if (focusTrigger)
                    this._btn?.focus();
                this.emit('close');
            }
            toggle() {
                if (this._open)
                    this.close(true);
                else
                    this.open();
            }
        }
        return UsaMenu;
    }, { id: 'menu', text: css });
}

exports.MENU_EFFECTS = MENU_EFFECTS;
exports.defineMenu = defineMenu;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.0/dist/chunks/menu-BgO53POm.cjs.map