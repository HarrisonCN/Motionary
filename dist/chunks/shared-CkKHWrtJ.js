let layer = null;
/** A fixed, pointer-transparent, aria-hidden layer for transient particles. */
function fxLayer() {
    if (layer?.isConnected)
        return layer;
    layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('data-usa-fx-layer', '');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2147483000;contain:strict';
    document.body.appendChild(layer);
    return layer;
}
/** Client point of the triggering pointer event, or the element's center. */
function origin(el, ctx) {
    const e = ctx.event;
    const r = el.getBoundingClientRect();
    return e && typeof e.clientX === 'number' && (e.clientX || e.clientY) ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
/** Spawn an absolutely positioned node in the fx layer at (x, y); removed when its animation ends. */
function spawn(x, y, css, ctx, frames, opts, text = '') {
    const n = document.createElement('span');
    n.style.cssText = `position:absolute;left:${x}px;top:${y}px;${css}`;
    if (text)
        n.textContent = text;
    fxLayer().appendChild(n);
    const a = ctx.animate(n, frames, { fill: 'forwards', ...opts });
    const rm = () => n.remove();
    if (a)
        a.finished.then(rm, rm);
    else
        rm();
    return a;
}
/** An overlay child covering `el` (makes `el` a positioning context). Returns it and a remover. */
function overlay(el, css) {
    const o = document.createElement('span');
    o.setAttribute('aria-hidden', 'true');
    o.style.cssText = `position:absolute;inset:0;pointer-events:none;border-radius:inherit;${css}`;
    if (getComputedStyle(el).position === 'static')
        el.style.position = 'relative';
    el.appendChild(o);
    return [o, () => o.remove()];
}
const PALETTE = ['#7c5cff', '#ff5c8a', '#22d3ee', '#facc15', '#34d399'];
const rand = (a, b) => a + Math.random() * (b - a);
/** Wait for all animations (ignoring nulls). */
const all = (anims) => Promise.all(anims.filter(Boolean).map((a) => a.finished.catch(() => undefined)));

export { PALETTE as P, all as a, origin as b, fxLayer as f, overlay as o, rand as r, spawn as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/chunks/shared-CkKHWrtJ.js.map