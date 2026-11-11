'use strict';

var base = require('./base-DzZEJhQB.cjs');

const NS = 'http://www.w3.org/2000/svg';
const flights = /*#__PURE__*/ new WeakMap();
/** Fixed-size point clouds: no canvas, network assets, timers or idle render loop. */
function points(name) {
    const out = [];
    for (let y = -22; y <= 22; y += 3)
        for (let x = -22; x <= 22; x += 3) {
            const r = Math.hypot(x, y), a = Math.atan2(y, x);
            const inside = name === 'moon' ? r < 21 && Math.hypot(x - 9, y + 8) > 19
                : name === 'check' ? Math.min(Math.hypot(x + 12 - (y + 2), 0), 99) < 4 && x < -2 && y > -3 && y < 14 || Math.abs(y + x - 4) < 4 && x > -5 && x < 22
                    : name === 'heart' ? ((x / 22) ** 2 + (-y / 22) ** 2 - .7) ** 3 - (x / 22) ** 2 * (-y / 22) ** 3 < 0
                        : name === 'play' ? x > -12 && x < 20 && Math.abs(y) < (20 - x) * .65
                            : name === 'pause' ? Math.abs(y) < 20 && Math.abs(x) > 5 && Math.abs(x) < 15
                                : name === 'spark' ? Math.abs(x) + Math.abs(y) * .7 < 19 && (Math.abs(x) < 6 || Math.abs(y) < 6)
                                    : name === 'power' ? r > 14 && r < 21 && y > -13 || Math.abs(x) < 4 && y < 4 && y > -23
                                        : r < 11 || r > 16 && r < 23 && Math.cos(a * 8) > .55;
            if (inside)
                out.push([x + 32, y + 32]);
        }
    return Array.from({ length: 64 }, (_, i) => out[Math.floor(i * out.length / 64)] || [32, 32]);
}
function glyph(owner) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('usa-lu-glyph');
    for (let i = 0; i < 64; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('r', String(.85 + (i % 3) * .18));
        svg.append(c);
    }
    if (typeof matchMedia === 'function')
        owner.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', () => { if (owner.reduced)
            stopGlyph(svg); });
    owner.onCleanup(() => stopGlyph(svg));
    return svg;
}
function stopGlyph(svg) {
    flights.get(svg)?.forEach(a => a.cancel());
    flights.delete(svg);
}
function morphGlyph(svg, name, animate, owner) {
    const old = Array.from(svg.children, c => getComputedStyle(c).transform);
    stopGlyph(svg);
    const target = points(name);
    const active = [];
    Array.from(svg.children).forEach((c, i) => {
        const [x, y] = target[i];
        const end = `translate(${x}px, ${y}px)`;
        c.style.transform = end;
        if (!animate || owner.reduced)
            return;
        const a = base.animateWithMotion(c, [
            { transform: old[i] === 'none' ? end : old[i], opacity: 1 },
            { transform: `translate(${32 + Math.cos(i * 2.4) * (16 + i % 15)}px, ${32 + Math.sin(i * 2.4) * (16 + i % 15)}px)`, opacity: .3, offset: .4 },
            { transform: end, opacity: 1 },
        ], { duration: 620, delay: (i % 8) * 9, easing: 'cubic-bezier(.22,.8,.2,1)' });
        if (a)
            active.push(a);
    });
    flights.set(svg, active);
}
function luminousTheme(el) {
    el.classList.add('usa-luminous');
    el.dataset.luTheme = el.str('theme') === 'light' ? 'light' : 'dark';
}

var shared = ".usa-luminous{--lu-accent:var(--mo-luminous-accent,#a6a0ff);--lu-bg:#111216;--lu-fg:#f5f4ff;--lu-edge:#ffffff20;--lu-inset:#0009;--lu-glass:linear-gradient(145deg,#ffffff2b,#ffffff06);display:inline-block;color:var(--lu-fg);font:inherit;color-scheme:dark}.usa-luminous[data-lu-theme=light]{--lu-accent:var(--mo-luminous-accent,#eeae45);--lu-bg:#e8e6e2;--lu-fg:#292b31;--lu-edge:#ffffffb8;--lu-inset:#6664;--lu-glass:linear-gradient(145deg,#fffffff0,#ffffff40);color-scheme:light}.usa-luminous button,.usa-luminous input{font:inherit}.usa-lu-surface{box-sizing:border-box;border:1px solid var(--lu-edge);background:var(--lu-bg);box-shadow:inset 0 3px 8px var(--lu-inset),0 2px 6px #0002;color:inherit}.usa-lu-glass{border:1px solid var(--lu-edge);background:var(--lu-glass);box-shadow:inset 0 1px 1px #fff5,0 6px 12px #0005,0 0 18px color-mix(in srgb,var(--lu-accent) 35%,transparent)}.usa-luminous button:focus-visible,.usa-luminous input:focus-visible{outline:3px solid var(--lu-accent);outline-offset:5px}.usa-luminous button:disabled,.usa-luminous input:disabled{cursor:not-allowed;opacity:.45}.usa-lu-glyph{display:block;width:100%;height:100%;overflow:visible;fill:currentColor;pointer-events:none}.usa-luminous[data-lu-reduced] *,.usa-luminous[data-lu-reduced] *:before,.usa-luminous[data-lu-reduced] *:after{transition:none!important;animation:none!important}:root:is([data-usa-sensitivity=minimal],[data-usa-sensitivity=static]) .usa-luminous *,:root:is([data-usa-sensitivity=minimal],[data-usa-sensitivity=static]) .usa-luminous *:before,:root:is([data-usa-sensitivity=minimal],[data-usa-sensitivity=static]) .usa-luminous *:after{transition:none!important;animation:none!important}:root[data-usa-sensitivity=gentle] .usa-ls-thumb:after{transition:none}@media(prefers-reduced-motion:reduce){.usa-luminous *,.usa-luminous *:before,.usa-luminous *:after{transition:none!important;animation:none!important}}@media(forced-colors:active){.usa-luminous{--lu-fg:ButtonText;--lu-bg:Canvas;--lu-accent:Highlight;--lu-edge:ButtonText}.usa-lu-glass,.usa-lu-surface{border:1px solid ButtonText;box-shadow:none}.usa-lu-glyph{fill:ButtonText}}";

exports.glyph = glyph;
exports.luminousTheme = luminousTheme;
exports.morphGlyph = morphGlyph;
exports.shared = shared;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/chunks/luminous-B_-9G2GO.cjs.map