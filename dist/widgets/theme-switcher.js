import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { SURFACE_THEMES, applySurfaceTheme } from '../components/fx-surface.js';
import '../chunks/registry-CYojuxi5.js';

var css = "usa-theme-switcher{position:relative;display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:rgba(15,23,42,.08);max-width:100%;overflow-x:auto;scrollbar-width:none}usa-theme-switcher .usa-ts-pill{position:absolute;top:4px;bottom:4px;left:0;border-radius:999px;background:#fff;box-shadow:0 2px 8px -2px rgba(15,23,42,.3);transition:transform .35s cubic-bezier(.3,1.3,.5,1),width .35s}usa-theme-switcher .usa-ts-opt{position:relative;z-index:1;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border:0;border-radius:999px;background:none;color:#334155;font:600 13px/1 system-ui,sans-serif;cursor:pointer;white-space:nowrap}usa-theme-switcher .usa-ts-opt[aria-checked=true]{color:#0f172a}usa-theme-switcher .usa-ts-opt:focus-visible{outline:2px solid #6366f1;outline-offset:1px}usa-theme-switcher .usa-ts-sw{width:12px;height:12px;border-radius:50%;background:#f8fafc;box-shadow:inset 0 0 0 1px rgba(15,23,42,.25)}usa-theme-switcher [data-sw=dark]{background:#0f172a}usa-theme-switcher [data-sw=neon]{background:#d946ef;box-shadow:0 0 6px #d946ef}usa-theme-switcher [data-sw=glass]{background:linear-gradient(135deg,rgba(255,255,255,.9),rgba(147,197,253,.6))}usa-theme-switcher [data-sw=neu]{background:#e0e5ec;box-shadow:2px 2px 3px #a3b1c6,-2px -2px 3px #fff}@media (prefers-reduced-motion:reduce){usa-theme-switcher .usa-ts-pill{transition:none}}";

const NAMES = { light: 'Light', dark: 'Dark', neon: 'Neon', glass: 'Glass', neu: 'Soft' };
function defineThemeSwitcher(tag = 'usa-theme-switcher') {
    return defineElement(tag, (Base) => {
        class UsaThemeSwitcher extends Base {
            constructor() {
                super(...arguments);
                this._v = '';
            }
            static get observedAttributes() {
                return ['themes', 'target', 'label', 'persist', 'value'];
            }
            list() {
                const l = this.str('themes').split(',').map((s) => s.trim()).filter((s) => SURFACE_THEMES.includes(s));
                return l.length ? l : [...SURFACE_THEMES];
            }
            tgt() {
                const s = this.str('target');
                return s ? document.querySelector(s) : document.documentElement;
            }
            get value() {
                return this._v;
            }
            set value(t) {
                this.select(t, false);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const l = this.list();
                this.setAttribute('role', 'radiogroup');
                this.setAttribute('aria-label', this.str('label', 'Theme'));
                let saved = '';
                try {
                    saved = this.hasAttribute('persist') ? localStorage.getItem(this.str('persist') || 'usa-theme') || '' : '';
                }
                catch {
                    /* storage blocked */
                }
                const start = l.includes(saved) ? saved : l.includes(this.str('value')) ? this.str('value') : l.includes(this.tgt()?.getAttribute('data-usa-surface') || '') ? this.tgt()?.getAttribute('data-usa-surface') : l[0];
                this.insertAdjacentHTML('beforeend', `<span class="usa-ts-pill" aria-hidden="true" data-usa-part></span>` + l.map((t) => `<button type="button" role="radio" class="usa-ts-opt" data-theme="${t}" data-usa-part><i class="usa-ts-sw" data-sw="${t}" aria-hidden="true"></i>${NAMES[t]}</button>`).join(''));
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('.usa-ts-opt');
                    if (b)
                        this.select(b.dataset.theme, true, e);
                });
                this.listen(this, 'keydown', (e) => {
                    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                    if (!d)
                        return;
                    e.preventDefault();
                    const ls = this.list();
                    const n = ls[(ls.indexOf(this._v) + d + ls.length) % ls.length];
                    this.select(n, true);
                    this.querySelector(`.usa-ts-opt[data-theme="${n}"]`)?.focus();
                });
                this._v = '';
                this.select(start, false);
            }
            select(t, user, ev) {
                if (!this.list().includes(t) || t === this._v)
                    return;
                const prev = this._v;
                this._v = t;
                this.querySelectorAll('.usa-ts-opt').forEach((b) => {
                    const on = b.dataset.theme === t;
                    b.setAttribute('aria-checked', String(on));
                    b.tabIndex = on ? 0 : -1;
                });
                const b = this.querySelector(`.usa-ts-opt[data-theme="${t}"]`);
                const pill = this.querySelector('.usa-ts-pill');
                if (b && pill) {
                    pill.style.width = `${b.offsetWidth}px`;
                    pill.style.transform = `translateX(${b.offsetLeft}px)`;
                }
                const apply = () => applySurfaceTheme(t, this.tgt());
                const doc = document;
                if (user && prev && !this.reduced && doc.startViewTransition && !this.str('target')) {
                    const x = ev?.clientX ?? innerWidth / 2;
                    const y = ev?.clientY ?? innerHeight / 2;
                    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
                    try {
                        doc.startViewTransition(apply).ready.then(() => document.documentElement.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }), () => undefined);
                    }
                    catch {
                        apply();
                    }
                }
                else
                    apply();
                if (this.hasAttribute('persist'))
                    try {
                        localStorage.setItem(this.str('persist') || 'usa-theme', t);
                    }
                    catch {
                        /* storage blocked */
                    }
                if (user)
                    this.emit('change', { theme: t });
            }
        }
        return UsaThemeSwitcher;
    }, { id: 'theme-switcher', text: css });
}

export { defineThemeSwitcher };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.5.0/dist/widgets/theme-switcher.js.map