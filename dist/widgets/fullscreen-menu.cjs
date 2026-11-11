'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');

var css = ":is(usa-fullscreen-menu,mo-fullscreen-menu){display:inline-block;--usa-fm-bg:#0f0f14;--usa-fm-fg:#fff;--usa-fm-accent:#7c5cff}:is(usa-fullscreen-menu,mo-fullscreen-menu)>.usa-fm-toggle{position:relative;z-index:1001;width:44px;height:44px;border-radius:50%;border:0;background:var(--usa-fm-accent);color:#fff;cursor:pointer;display:grid;place-items:center}:is(usa-fullscreen-menu,mo-fullscreen-menu)>.usa-fm-toggle:focus-visible{outline:2px solid var(--usa-fm-fg);outline-offset:3px}.usa-fm-bars{display:grid;gap:5px;width:18px}.usa-fm-bars>i{display:block;height:2px;background:currentColor;border-radius:2px;transition:transform .35s cubic-bezier(.2,.8,.2,1)}:is(usa-fullscreen-menu,mo-fullscreen-menu)[data-open] .usa-fm-bars>i:first-child{transform:translateY(3.5px) rotate(45deg)}:is(usa-fullscreen-menu,mo-fullscreen-menu)[data-open] .usa-fm-bars>i:last-child{transform:translateY(-3.5px) rotate(-45deg)}:is(usa-fullscreen-menu,mo-fullscreen-menu)>.usa-fm-layer{position:fixed;inset:0;z-index:1000;background:var(--usa-fm-bg);color:var(--usa-fm-fg);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr);align-items:center;gap:4vw;padding:12vh 8vw;box-sizing:border-box;overflow:auto}:is(usa-fullscreen-menu,mo-fullscreen-menu)>.usa-fm-layer[hidden]{display:none}.usa-fm-nav{display:grid;gap:.2em;font-size:clamp(32px,6vw,72px);font-weight:700;line-height:1.1}.usa-fm-nav>*{color:inherit;text-decoration:none;width:max-content;max-width:100%}.usa-fm-nav>a:hover,.usa-fm-nav>a:focus-visible{color:var(--usa-fm-accent);outline:none}.usa-fm-nav>a:focus-visible{text-decoration:underline;text-underline-offset:.15em}.usa-fm-preview{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:18px}@media (max-width:700px){:is(usa-fullscreen-menu,mo-fullscreen-menu)>.usa-fm-layer{grid-template-columns:1fr}.usa-fm-preview{display:none}}@media (prefers-reduced-motion:reduce){.usa-fm-bars>i{transition:none}}";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';
let seq = 0;
function defineFullscreenMenu(tag = 'usa-fullscreen-menu') {
    const C = base.defineElement(tag, (Base) => {
        class UsaFullscreenMenu extends Base {
            constructor() {
                super(...arguments);
                this._open = false;
                this._btn = null;
                this._layer = null;
                this._nav = null;
                this._img = null;
                this._overflow = '';
            }
            static get observedAttributes() {
                return ['label', 'variant'];
            }
            get open() {
                return this._open;
            }
            set open(v) {
                this.toggle(v);
            }
            mount() {
                const label = this.str('label', 'Menu');
                let btn = this.querySelector(':scope > .usa-fm-toggle');
                let layer = this.querySelector(':scope > .usa-fm-layer');
                if (!btn || !layer) {
                    const id = 'usa-fm-' + ++seq;
                    btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'usa-fm-toggle';
                    btn.setAttribute('data-usa-part', '');
                    btn.innerHTML = '<span class="usa-fm-bars" aria-hidden="true"><i></i><i></i></span>';
                    layer = document.createElement('div');
                    layer.className = 'usa-fm-layer';
                    layer.id = id;
                    layer.hidden = true;
                    layer.setAttribute('data-usa-part', '');
                    layer.setAttribute('role', 'dialog');
                    layer.setAttribute('aria-modal', 'true');
                    const nav = document.createElement('nav');
                    nav.className = 'usa-fm-nav';
                    const img = document.createElement('img');
                    img.className = 'usa-fm-preview';
                    img.alt = '';
                    img.hidden = true;
                    const links = Array.from(this.childNodes);
                    nav.append(...links);
                    layer.append(nav, img);
                    this.append(btn, layer);
                    btn.setAttribute('aria-controls', id);
                }
                this._btn = btn;
                this._layer = layer;
                this._nav = layer.querySelector('.usa-fm-nav');
                this._img = layer.querySelector('.usa-fm-preview');
                btn.setAttribute('aria-expanded', String(this._open));
                btn.setAttribute('aria-label', label);
                layer.setAttribute('aria-label', label);
                this.dataset.variant = this.str('variant') === 'curtain' ? 'curtain' : 'circle';
                this.listen(btn, 'click', () => this.toggle());
                this.listen(layer, 'click', (e) => {
                    if (e.target.closest('a[href]'))
                        this.hide(false);
                });
                this.listen(layer, 'keydown', (e) => this.key(e));
                this.listen(btn, 'keydown', (e) => {
                    if (!this._open || (e.key !== 'Tab' && e.key !== 'Escape'))
                        return;
                    e.preventDefault();
                    if (e.key === 'Escape')
                        return this.hide();
                    const f = Array.from(layer.querySelectorAll(FOCUSABLE));
                    (e.shiftKey ? f[f.length - 1] : f[0])?.focus();
                });
                const preview = (e) => {
                    const src = e.target.closest?.('[data-preview]')?.getAttribute('data-preview');
                    const img = this._img;
                    if (!src)
                        return;
                    if (img.getAttribute('src') !== src)
                        img.setAttribute('src', src);
                    img.hidden = false;
                    if (!this.reduced)
                        this.motion(img, [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
                };
                this.listen(layer, 'pointerover', preview);
                this.listen(layer, 'focusin', preview);
            }
            unmount() {
                if (this._open)
                    this.hide(false);
            }
            key(e) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.hide();
                    return;
                }
                if (e.key !== 'Tab')
                    return;
                const f = Array.from(this._layer.querySelectorAll(FOCUSABLE));
                const first = this._btn;
                const last = f[f.length - 1] || first;
                // the toggle button sits above the overlay and closes it, so it is part of the focus loop
                if (e.shiftKey && document.activeElement === (f[0] || first)) {
                    e.preventDefault();
                    first.focus();
                }
                else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
            show() {
                this.toggle(true);
            }
            hide(restoreFocus = true) {
                this.toggle(false, restoreFocus);
            }
            toggle(force, restoreFocus = true) {
                const open = force ?? !this._open;
                const layer = this._layer;
                const btn = this._btn;
                if (open === this._open || !layer || !btn)
                    return;
                this._open = open;
                btn.setAttribute('aria-expanded', String(open));
                this.toggleAttribute('data-open', open);
                const root = document.documentElement;
                const b = btn.getBoundingClientRect();
                const at = `${Math.round(b.left + b.width / 2)}px ${Math.round(b.top + b.height / 2)}px`;
                const clip = this.dataset.variant === 'curtain' ? ['inset(0 0 100% 0)', 'inset(0 0 0 0)'] : [`circle(0px at ${at})`, `circle(150vmax at ${at})`];
                if (open) {
                    this._overflow = root.style.overflow;
                    root.style.overflow = 'hidden';
                    layer.hidden = false;
                    if (!this.reduced) {
                        this.motion(layer, [{ clipPath: clip[0] }, { clipPath: clip[1] }], { duration: 560, easing: 'cubic-bezier(.7,0,.2,1)' });
                        Array.from(this._nav.children).forEach((c, i) => this.motion(c, [{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 220 + i * 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
                    }
                    (layer.querySelector(FOCUSABLE) || btn).focus();
                    this.emit('open');
                }
                else {
                    root.style.overflow = this._overflow;
                    const done = () => {
                        if (!this._open)
                            layer.hidden = true;
                    };
                    const a = this.reduced ? null : this.motion(layer, [{ clipPath: clip[1] }, { clipPath: clip[0] }], { duration: 420, easing: 'cubic-bezier(.7,0,.2,1)' });
                    if (a)
                        a.finished.then(done, done);
                    else
                        done();
                    if (restoreFocus)
                        btn.focus();
                    this.emit('close');
                }
            }
        }
        return UsaFullscreenMenu;
    }, { id: 'fullscreen-menu', text: css });
    moName.defineMoName(tag, C);
    return C;
}

exports.defineFullscreenMenu = defineFullscreenMenu;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.3.1/dist/widgets/fullscreen-menu.cjs.map