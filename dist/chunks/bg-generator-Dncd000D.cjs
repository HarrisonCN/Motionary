'use strict';

var base = require('./base-vu_KhBiv.cjs');
var components_fxGenart = require('../components/fx-genart.cjs');

var css = "usa-bg-generator{display:block;max-width:100%;font:13px/1.3 system-ui,sans-serif;color:#0f172a}usa-bg-generator .usa-bg-preview{height:120px;border-radius:12px;box-shadow:inset 0 0 0 1px rgba(15,23,42,.1)}usa-bg-generator .usa-bg-controls{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px}usa-bg-generator label{display:inline-flex;gap:4px;align-items:center;font-weight:600}usa-bg-generator select,usa-bg-generator button{padding:5px 8px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font:inherit;cursor:pointer}usa-bg-generator .usa-bg-copy{background:#4f46e5;border-color:#4f46e5;color:#fff}usa-bg-generator .usa-bg-code{display:block;margin-top:6px;padding:6px 8px;border-radius:7px;background:#0f172a;color:#e2e8f0;font:11px/1.4 ui-monospace,monospace;white-space:nowrap;overflow-x:auto}";

const STYLES = ['mesh', 'grain', 'stripes', 'dots'];
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E\")";
/** The CSS background for a generator state (9.3). */
function backgroundCss(style, seed, palette) {
    const pal = components_fxGenart.PALETTES[palette] || components_fxGenart.PALETTES.sunset;
    if (style === 'stripes')
        return `repeating-linear-gradient(${(seed * 37) % 180}deg, ${pal[0]} 0 14px, ${pal[1]} 14px 28px, ${pal[2]} 28px 42px)`;
    if (style === 'dots')
        return `radial-gradient(${pal[1]} 22%, transparent 24%) 0 0 / 22px 22px, radial-gradient(${pal[2]} 22%, transparent 24%) 11px 11px / 22px 22px, ${pal[0]}`;
    if (style === 'grain')
        return `${GRAIN}, ${components_fxGenart.meshGradient(seed, palette)}`;
    return components_fxGenart.meshGradient(seed, palette);
}
function defineBgGenerator(tag = 'usa-bg-generator') {
    return base.defineElement(tag, (Base) => {
        class UsaBgGenerator extends Base {
            constructor() {
                super(...arguments);
                this._st = { palette: 'sunset', style: 'mesh', seed: 1 };
            }
            static get observedAttributes() {
                return ['label', 'palette', 'style', 'seed'];
            }
            get css() {
                return `background: ${backgroundCss(this._st.style, this._st.seed, this._st.palette)};`;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._st = { palette: components_fxGenart.PALETTES[this.str('palette')] ? this.str('palette') : 'sunset', style: STYLES.includes(this.str('style')) ? this.str('style') : 'mesh', seed: this.num('seed', 1) };
                this.setAttribute('role', 'group');
                this.setAttribute('aria-label', this.str('label', 'Background generator'));
                const opt = (l, v) => l.map((x) => `<option${x === v ? ' selected' : ''}>${x}</option>`).join('');
                this.insertAdjacentHTML('beforeend', `<div class="usa-bg-preview" aria-hidden="true" data-usa-part></div><div class="usa-bg-controls" data-usa-part><label>Palette <select data-k="palette">${opt(Object.keys(components_fxGenart.PALETTES), this._st.palette)}</select></label><label>Style <select data-k="style">${opt(STYLES, this._st.style)}</select></label><button type="button" class="usa-bg-shuffle">Shuffle</button><button type="button" class="usa-bg-copy">Copy CSS</button></div><code class="usa-bg-code" data-usa-part></code>`);
                this.listen(this, 'change', (e) => {
                    const s = e.target;
                    if (s.dataset?.k === 'palette' || s.dataset?.k === 'style') {
                        this._st[s.dataset.k] = s.value;
                        this.render(true);
                    }
                });
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    if (t.closest?.('.usa-bg-shuffle'))
                        this.shuffle();
                    if (t.closest?.('.usa-bg-copy'))
                        void this.copy();
                });
                this.render(false);
            }
            render(user) {
                const p = this.querySelector('.usa-bg-preview');
                const bg = backgroundCss(this._st.style, this._st.seed, this._st.palette);
                if (p) {
                    p.style.background = bg;
                    if (user && !this.reduced)
                        this.motion(p, [{ opacity: 0.4, filter: 'blur(6px)' }, { opacity: 1, filter: 'none' }], { duration: 450, easing: 'ease-out' });
                }
                const c = this.querySelector('.usa-bg-code');
                if (c)
                    c.textContent = this.css;
                if (user)
                    this.emit('change', { css: this.css, seed: this._st.seed });
            }
            shuffle() {
                this._st.seed = 1 + Math.floor(Math.random() * 9999);
                this.render(true);
            }
            async copy() {
                let ok = false;
                try {
                    await navigator.clipboard.writeText(this.css);
                    ok = true;
                }
                catch {
                    ok = false;
                }
                const b = this.querySelector('.usa-bg-copy');
                if (b) {
                    b.textContent = ok ? 'Copied ✓' : 'Copy failed';
                    setTimeout(() => (b.textContent = 'Copy CSS'), 1500);
                }
                return ok;
            }
        }
        return UsaBgGenerator;
    }, { id: 'bg-generator', text: css });
}

exports.backgroundCss = backgroundCss;
exports.defineBgGenerator = defineBgGenerator;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.1.0/dist/chunks/bg-generator-Dncd000D.cjs.map