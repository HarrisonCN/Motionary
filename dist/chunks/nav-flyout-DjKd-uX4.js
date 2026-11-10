import { f as defineElement } from './base-DRZOlKiI.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';

var css = ":is(usa-mega-menu,mo-mega-menu){position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:4px;--usa-np-surface:#fff;--usa-np-accent:#7c5cff;--usa-np-radius:16px}:is(usa-mega-menu,mo-mega-menu)>*>button,:is(usa-mega-menu,mo-mega-menu)>a{font:inherit;color:inherit;background:none;border:0;padding:10px 14px;border-radius:10px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px}:is(usa-mega-menu,mo-mega-menu)>*>button::after{content:\"\";width:6px;height:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;rotate:45deg;translate:0 -2px;transition:rotate .25s,translate .25s}:is(usa-mega-menu,mo-mega-menu)>[data-open]>button::after{rotate:225deg;translate:0 2px}:is(usa-mega-menu,mo-mega-menu)>*>button:hover,:is(usa-mega-menu,mo-mega-menu)>[data-open]>button,:is(usa-mega-menu,mo-mega-menu)>a:hover{background:rgba(127,127,127,.12)}:is(usa-mega-menu,mo-mega-menu) :focus-visible{outline:2px solid var(--usa-np-accent);outline-offset:2px}:is(usa-mega-menu,mo-mega-menu)>*>[data-panel]{position:absolute;left:0;right:0;top:calc(100% + 8px);z-index:2;box-sizing:border-box;padding:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px}:is(usa-mega-menu,mo-mega-menu)>*>[data-panel][hidden]{display:none}:is(usa-mega-menu,mo-mega-menu)>.usa-np-bg{position:absolute;left:0;top:0;z-index:1;pointer-events:none;opacity:0;background:var(--usa-np-surface);border-radius:var(--usa-np-radius);box-shadow:0 18px 50px -12px rgba(15,23,42,.28),0 0 0 1px rgba(127,127,127,.14)}:is(usa-mega-menu,mo-mega-menu)>.usa-np-bg[data-on]{opacity:1}:is(usa-nav-flyout,mo-nav-flyout){position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:2px;--usa-np-surface:#fff;--usa-np-accent:#7c5cff;--usa-np-radius:14px}:is(usa-nav-flyout,mo-nav-flyout)>*>button,:is(usa-nav-flyout,mo-nav-flyout)>a{font:inherit;color:inherit;background:none;border:0;padding:8px 12px;border-radius:999px;cursor:pointer;text-decoration:none}:is(usa-nav-flyout,mo-nav-flyout)>*>button:hover,:is(usa-nav-flyout,mo-nav-flyout)>[data-open]>button,:is(usa-nav-flyout,mo-nav-flyout)>a:hover{background:rgba(127,127,127,.12)}:is(usa-nav-flyout,mo-nav-flyout) :focus-visible{outline:2px solid var(--usa-np-accent);outline-offset:2px}:is(usa-nav-flyout,mo-nav-flyout)>*>[data-panel]{position:absolute;left:0;top:calc(100% + 10px);z-index:2;box-sizing:border-box;width:max-content;max-width:min(420px,100%);padding:14px;display:grid;gap:6px}:is(usa-nav-flyout,mo-nav-flyout)>*>[data-panel][hidden]{display:none}:is(usa-nav-flyout,mo-nav-flyout)>.usa-np-bg{position:absolute;left:0;top:0;z-index:1;pointer-events:none;opacity:0;background:var(--usa-np-surface);border-radius:var(--usa-np-radius);box-shadow:0 14px 40px -10px rgba(15,23,42,.3),0 0 0 1px rgba(127,127,127,.14)}:is(usa-nav-flyout,mo-nav-flyout)>.usa-np-bg[data-on]{opacity:1}@media (prefers-reduced-motion:reduce){:is(usa-mega-menu,mo-mega-menu,usa-nav-flyout,mo-nav-flyout)>*>button::after{transition:none}}";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let seq = 0;
/** Register `tag` for `mode` (`mega`: full-width panels; `flyout`: panels anchored under their trigger), plus its mo-* name. */
function navPanels(tag, mode) {
    const C = defineElement(tag, (Base) => {
        class UsaNavPanels extends Base {
            constructor() {
                super(...arguments);
                this._i = -1;
                this._t = 0;
                this._rect = null;
                this._bg = null;
            }
            static get observedAttributes() {
                return ['label', 'delay', 'close-delay'];
            }
            get openIndex() {
                return this._i;
            }
            get items() {
                const out = [];
                for (const el of Array.from(this.children)) {
                    if (el.hasAttribute('data-usa-part'))
                        continue;
                    const panel = el.querySelector(':scope > [data-panel]');
                    const trigger = panel ? el.querySelector(':scope > button, :scope > a') : el.matches('a,button') ? el : el.querySelector('a,button');
                    if (trigger)
                        out.push({ el, trigger, panel });
                }
                return out;
            }
            mount() {
                this.setAttribute('role', 'navigation');
                this.setAttribute('aria-label', this.str('label', 'Main'));
                let bg = this.querySelector(':scope > .usa-np-bg');
                if (!bg) {
                    bg = document.createElement('span');
                    bg.className = 'usa-np-bg';
                    bg.setAttribute('aria-hidden', 'true');
                    bg.setAttribute('data-usa-part', '');
                    this.append(bg);
                }
                this._bg = bg;
                const id = 'usa-np-' + ++seq;
                this.items.forEach((it, i) => {
                    var _a;
                    if (!it.panel)
                        return;
                    (_a = it.panel).id || (_a.id = `${id}-${i}`);
                    it.trigger.setAttribute('aria-controls', it.panel.id);
                    it.trigger.setAttribute('aria-expanded', String(i === this._i));
                    it.panel.hidden = i !== this._i;
                });
                const at = (t) => this.items.findIndex((it) => it.el.contains(t));
                this.listen(this, 'pointerover', (e) => {
                    if (e.pointerType === 'touch')
                        return;
                    const i = at(e.target);
                    if (i < 0)
                        return;
                    if (this.items[i].panel)
                        this.later(() => this.openItem(i), this._i >= 0 ? 0 : this.num('delay', 120));
                    else if (this._i >= 0)
                        this.later(() => this.close(), this.num('close-delay', 220));
                });
                this.listen(this, 'pointerleave', (e) => {
                    if (e.pointerType !== 'touch' && this._i >= 0)
                        this.later(() => this.close(), this.num('close-delay', 220));
                    else
                        this.later(() => undefined, 0);
                });
                this.listen(this, 'click', (e) => {
                    const i = this.items.findIndex((it) => it.panel && it.trigger.contains(e.target));
                    if (i < 0)
                        return;
                    this.later(() => undefined, 0);
                    if (this._i === i)
                        this.close();
                    else
                        this.openItem(i);
                });
                this.listen(this, 'keydown', (e) => this.key(e));
                this.listen(this, 'focusout', (e) => {
                    if (this._i < 0 || this.contains(e.relatedTarget))
                        return;
                    // Firefox may report a null relatedTarget on Tab-out: settle on the real active element.
                    setTimeout(() => {
                        if (this._i >= 0 && !this.contains(document.activeElement))
                            this.close();
                    }, 0);
                });
                this.listen(document, 'pointerdown', (e) => {
                    if (this._i >= 0 && !this.contains(e.target))
                        this.close();
                });
                this.onCleanup(() => this.later(() => undefined, 0));
            }
            unmount() {
                if (this._i >= 0)
                    this.close();
            }
            later(fn, ms) {
                if (this._t)
                    clearTimeout(this._t);
                this._t = 0;
                if (ms <= 0)
                    fn();
                else
                    this._t = setTimeout(() => ((this._t = 0), fn()), ms);
            }
            key(e) {
                const items = this.items;
                const ti = items.findIndex((it) => it.trigger === e.target);
                if (e.key === 'Escape' && this._i >= 0) {
                    e.preventDefault();
                    this.close(true);
                    return;
                }
                if (ti < 0)
                    return;
                const move = (d) => {
                    e.preventDefault();
                    const n = items.length;
                    const j = d === Infinity ? n - 1 : d === -Infinity ? 0 : (ti + d + n) % n;
                    items[j].trigger.focus();
                    if (this._i >= 0 && items[j].panel)
                        this.openItem(j);
                    else if (this._i >= 0)
                        this.close();
                };
                const rtl = getComputedStyle(this).direction === 'rtl';
                if (e.key === 'ArrowRight')
                    move(rtl ? -1 : 1);
                else if (e.key === 'ArrowLeft')
                    move(rtl ? 1 : -1);
                else if (e.key === 'Home')
                    move(-Infinity);
                else if (e.key === 'End')
                    move(Infinity);
                else if (e.key === 'ArrowDown' && items[ti].panel) {
                    e.preventDefault();
                    this.openItem(ti, true);
                }
            }
            rectOf(panel) {
                const h = this.getBoundingClientRect();
                const r = panel.getBoundingClientRect();
                return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
            }
            openItem(index, focus = false) {
                const items = this.items;
                const next = items[index];
                if (!next?.panel)
                    return;
                if (index !== this._i) {
                    const prev = items[this._i];
                    const dir = this._i < 0 ? 0 : Math.sign(index - this._i);
                    if (prev?.panel) {
                        prev.trigger.setAttribute('aria-expanded', 'false');
                        prev.panel.hidden = true;
                        prev.el.removeAttribute('data-open');
                    }
                    this._i = index;
                    next.trigger.setAttribute('aria-expanded', 'true');
                    next.panel.hidden = false;
                    next.el.setAttribute('data-open', '');
                    if (mode === 'flyout') {
                        const host = this.getBoundingClientRect();
                        const t = next.trigger.getBoundingClientRect();
                        const w = next.panel.offsetWidth;
                        next.panel.style.left = `${Math.round(Math.max(0, Math.min(host.width - w, t.left - host.left + t.width / 2 - w / 2)))}px`;
                    }
                    const to = this.rectOf(next.panel);
                    const from = this._rect;
                    this._rect = to;
                    const bg = this._bg;
                    const box = (r) => ({ transform: `translate(${r.x}px,${r.y}px)`, width: `${r.w}px`, height: `${r.h}px` });
                    Object.assign(bg.style, box(to));
                    bg.setAttribute('data-on', '');
                    if (!this.reduced) {
                        const ease = { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' };
                        if (from)
                            this.motion(bg, [box(from), box(to)], ease);
                        else
                            this.motion(bg, [{ ...box(to), opacity: 0, transform: `translate(${to.x}px,${to.y - 8}px)` }, { ...box(to), opacity: 1 }], ease);
                        this.motion(next.panel, [{ opacity: 0, transform: dir ? `translateX(${dir * 24}px)` : 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { ...ease, delay: from ? 40 : 0, fill: 'backwards' });
                    }
                    this.emit('open', { index });
                }
                if (focus)
                    next.panel.querySelector(FOCUSABLE)?.focus();
            }
            close(focusTrigger = false) {
                const it = this.items[this._i];
                const index = this._i;
                if (index < 0)
                    return;
                this._i = -1;
                this._rect = null;
                this.later(() => undefined, 0);
                if (it?.panel) {
                    it.trigger.setAttribute('aria-expanded', 'false');
                    it.panel.hidden = true;
                    it.el.removeAttribute('data-open');
                    if (focusTrigger)
                        it.trigger.focus();
                }
                const bg = this._bg;
                if (bg) {
                    bg.removeAttribute('data-on');
                    if (!this.reduced)
                        this.motion(bg, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-out' });
                }
                this.emit('close', { index });
            }
        }
        return UsaNavPanels;
    }, { id: 'nav-panels', text: css });
    defineMoName(tag, C);
    return C;
}
/**
 * `<mo-mega-menu>` (17.3; legacy name `<usa-mega-menu>`) — a navigation bar whose items open full-width mega panels
 * (columns, a featured card, anything) on one shared surface that morphs its height from panel to panel.
 * Children: plain links, or an item element holding a trigger `<button>` and a `[data-panel]` element:
 * `<div><button>Products</button><div data-panel>…</div></div>`. Hover intent (`delay`, default 120 ms; once a panel
 * is open, moving to another trigger switches at once), click / tap toggles, `close-delay` (default 220 ms) after the
 * pointer leaves. Keyboard: ←/→ / Home / End move between triggers, ↓ opens and focuses the panel, Esc closes and
 * returns focus, Tab out closes. Disclosure pattern (`aria-expanded`, `aria-controls`); the host is a
 * `navigation` landmark named by `label` (default "Main"). Events `usa:open` / `usa:close` (`{ index }`); methods
 * `openItem(i, focus?)`, `close(focusTrigger?)`. Reduced motion: panels switch without the morph.
 */
const defineMegaMenu = (tag = 'usa-mega-menu') => navPanels(tag, 'mega');
/**
 * `<mo-nav-flyout>` (17.3; legacy name `<usa-nav-flyout>`) — nav links with dropdown flyouts anchored under their
 * trigger. One shared background slides and resizes from flyout to flyout (position, width and height), so moving
 * along the bar feels like one surface. Same markup, keyboard, hover intent and events as `<mo-mega-menu>`:
 * `<div><button>Docs</button><div data-panel>…</div></div>` items or plain links; `label`, `delay`, `close-delay`;
 * `openItem(i, focus?)`, `close(focusTrigger?)`; `usa:open` / `usa:close` (`{ index }`). Flyouts stay inside the bar's
 * width. Reduced motion: the background jumps.
 */
const defineNavFlyout = (tag = 'usa-nav-flyout') => navPanels(tag, 'flyout');

export { defineMegaMenu as a, defineNavFlyout as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.3.0/dist/chunks/nav-flyout-DjKd-uX4.js.map