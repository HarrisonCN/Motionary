import { f as defineElement } from '../chunks/base-CBMzOs1k.js';
import { SURFACE_THEMES } from '../components/fx-surface.js';
import '../chunks/registry-4UDF3Dpk.js';

var css = "usa-theme-surface{position:relative;display:block;box-sizing:border-box;padding:18px 20px;border-radius:16px;background:#fff;color:#0f172a;border:1px solid rgba(15,23,42,.08);box-shadow:0 10px 30px -18px rgba(15,23,42,.45);transition:background .4s,color .4s,box-shadow .4s,border-color .4s}usa-theme-surface[data-look=dark]{background:#0f172a;color:#e2e8f0;border-color:#1e293b}usa-theme-surface[data-look=neon]{background:#0b0614;color:#f5d0fe;border-color:#d946ef;box-shadow:0 0 6px #d946ef,0 0 18px rgba(217,70,239,.55),inset 0 0 12px rgba(217,70,239,.25);animation:usa-sf-neon 2.4s ease-in-out infinite}usa-theme-surface[data-look=glass]{background:linear-gradient(135deg,rgba(255,255,255,.55),rgba(255,255,255,.18));color:#0f172a;border-color:rgba(255,255,255,.7);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);box-shadow:0 12px 32px -14px rgba(30,64,175,.45);overflow:hidden}usa-theme-surface[data-look=glass]::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.45) 50%,transparent 65%);background-size:250% 100%;animation:usa-sf-sheen 5s ease-in-out infinite}usa-theme-surface[data-look=neu]{background:#e0e5ec;color:#334155;border-color:transparent;box-shadow:8px 8px 16px #a3b1c6,-8px -8px 16px #fff}@keyframes usa-sf-neon{50%{box-shadow:0 0 10px #d946ef,0 0 30px rgba(217,70,239,.7),inset 0 0 16px rgba(217,70,239,.35)}}@keyframes usa-sf-sheen{0%,60%{background-position:130% 0}100%{background-position:-60% 0}}@media (prefers-reduced-motion:reduce){usa-theme-surface,usa-theme-surface::after{animation:none!important;transition:none}}";

function defineThemeSurface(tag = 'usa-theme-surface') {
    return defineElement(tag, (Base) => {
        class UsaThemeSurface extends Base {
            constructor() {
                super(...arguments);
                this._t = '';
                this._mo = null;
            }
            static get observedAttributes() {
                return ['theme'];
            }
            get theme() {
                return this._t;
            }
            resolve() {
                const own = this.str('theme');
                const near = own || this.parentElement?.closest('[data-usa-surface]')?.getAttribute('data-usa-surface') || document.documentElement.getAttribute('data-usa-surface') || 'light';
                return SURFACE_THEMES.includes(near) ? near : 'light';
            }
            sync() {
                const t = this.resolve();
                if (t === this._t)
                    return;
                const first = !this._t;
                this._t = t;
                this.setAttribute('data-look', t);
                if (first)
                    return;
                if (!this.reduced)
                    this.motion(this, [{ opacity: 0.4, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
                this.emit('theme', { theme: t });
            }
            mount() {
                this.sync();
                if (typeof MutationObserver !== 'undefined') {
                    this._mo?.disconnect();
                    this._mo = new MutationObserver(() => this.sync());
                    for (let n = this.parentElement; n; n = n.parentElement)
                        this._mo.observe(n, { attributes: true, attributeFilter: ['data-usa-surface'] });
                    this.onCleanup(() => this._mo?.disconnect());
                }
                // contract-exempt: keyboard-click-only — pointer-driven surface decoration, no action
                this.listen(this, 'pointerdown', () => {
                    if (this._t === 'neu' && !this.reduced)
                        this.motion(this, [{ transform: 'scale(1)' }, { transform: 'scale(.98)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 300 });
                });
            }
            changed() {
                this.sync();
            }
        }
        return UsaThemeSurface;
    }, { id: 'theme-surface', text: css });
}

export { defineThemeSurface };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.2/dist/widgets/theme-surface.js.map