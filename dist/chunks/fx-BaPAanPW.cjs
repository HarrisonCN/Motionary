'use strict';

var base = require('./base-B3me2y0o.cjs');

/**
 * Click-effect helpers (v2.5): `burst()`, `confetti()`, `shake()`, `haptic()`.
 * Particles live in one fixed, pointer-transparent layer and are removed when
 * their animation ends. Under reduced motion particles are skipped and
 * `shake()` only flashes an outline.
 */
let layer = null;
function fxLayer() {
    if (layer && layer.isConnected)
        return layer;
    layer = document.createElement('div');
    layer.className = 'usa-fx-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden;contain:strict';
    document.body.appendChild(layer);
    return layer;
}
const PALETTE = ['#7c5cff', '#22d3ee', '#f472b6', '#facc15', '#34d399', '#fb923c'];
const GLYPH = { star: '★', heart: '♥' };
function particle(x, y, size, color, shape) {
    const p = document.createElement('span');
    const glyph = GLYPH[shape] || (shape !== 'circle' && shape !== 'square' ? shape : '');
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;will-change:transform,opacity;` +
        (glyph ? `font-size:${size * 2}px;line-height:${size}px;text-align:center;color:${color}` : `background:${color};border-radius:${shape === 'square' ? '2px' : '50%'}`);
    if (glyph)
        p.textContent = glyph;
    fxLayer().appendChild(p);
    return p;
}
const done = (a, el) => {
    if (a)
        a.onfinish = () => el.remove();
    else
        el.remove();
};
/** Particles radiating from client point (x, y). Returns the number spawned. */
function burst(x, y, options = {}) {
    if (typeof document === 'undefined' || base.prefersReducedMotion())
        return 0;
    const { count = 12, colors = PALETTE, distance = 48, size = 6, shape = 'circle', duration = 600 } = options;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const d = distance * (0.7 + Math.random() * 0.5);
        const p = particle(x, y, size, colors[i % colors.length], shape);
        const a = typeof p.animate === 'function'
            ? p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * d}px, ${Math.sin(angle) * d}px) scale(0.2)`, opacity: 0 },
            ], { duration: duration * (0.8 + Math.random() * 0.4), easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' })
            : null;
        done(a, p);
    }
    return count;
}
/** A confetti cannon (paper pieces with gravity, drift and spin). */
function confetti(options = {}) {
    if (typeof document === 'undefined' || base.prefersReducedMotion())
        return 0;
    const W = window.innerWidth || 800;
    const H = window.innerHeight || 600;
    const { x = W / 2, y = H * 0.66, count = 80, spread = 70, velocity = 1, colors = PALETTE, duration = 1600 } = options;
    for (let i = 0; i < count; i++) {
        const angle = ((-90 + (Math.random() - 0.5) * spread) * Math.PI) / 180;
        const speed = (260 + Math.random() * 320) * velocity;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const p = particle(x, y, 6 + Math.random() * 5, colors[i % colors.length], Math.random() > 0.5 ? 'square' : 'circle');
        p.style.height = `${4 + Math.random() * 3}px`;
        const frames = [];
        const steps = 8;
        const T = duration / 1000;
        const spin = (Math.random() - 0.5) * 1440;
        for (let s = 0; s <= steps; s++) {
            const t = (s / steps) * T;
            const g = 900;
            frames.push({
                transform: `translate(${(vx * t * 0.8).toFixed(1)}px, ${(vy * t + 0.5 * g * t * t).toFixed(1)}px) rotate(${((spin * s) / steps).toFixed(0)}deg) rotateX(${s * 120}deg)`,
                opacity: s === steps ? 0 : 1,
            });
        }
        const a = typeof p.animate === 'function' ? p.animate(frames, { duration: duration * (0.85 + Math.random() * 0.3), easing: 'linear', fill: 'forwards' }) : null;
        done(a, p);
    }
    return count;
}
/** Horizontal error shake (`intensity` px, default 8). Reduced motion: a red outline flash. */
function shake(el, intensity = 8, duration = 480) {
    const t = el;
    if (typeof t.animate !== 'function')
        return null;
    if (base.prefersReducedMotion())
        return t.animate([{ outline: '2px solid #e5484d' }, { outline: '2px solid transparent' }], { duration: 600 });
    const k = intensity;
    return t.animate([0, -k, k, -k * 0.75, k * 0.75, -k * 0.4, k * 0.4, 0].map((v) => ({ transform: `translateX(${v}px)` })), { duration, easing: 'ease-in-out' });
}
/** `navigator.vibrate()` where supported (Android Chrome, some WebViews). Returns whether it ran. */
function haptic(pattern = 10) {
    try {
        return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' ? navigator.vibrate(pattern) : false;
    }
    catch {
        return false;
    }
}

exports.burst = burst;
exports.confetti = confetti;
exports.haptic = haptic;
exports.shake = shake;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.9.0/dist/chunks/fx-BaPAanPW.cjs.map