'use strict';

/**
 * motionary - Animation Presets
 * Defines keyframes for all built-in animation presets
 */
const CORE = {
    'fade-in': {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
    'fade-in-up': {
        from: { opacity: 0, transform: 'translateY(40px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
    },
    'fade-in-down': {
        from: { opacity: 0, transform: 'translateY(-40px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
    },
    'fade-in-left': {
        from: { opacity: 0, transform: 'translateX(-40px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
    },
    'fade-in-right': {
        from: { opacity: 0, transform: 'translateX(40px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
    },
    'zoom-in': {
        from: { opacity: 0, transform: 'scale(0.8)' },
        to: { opacity: 1, transform: 'scale(1)' },
    },
    'zoom-out': {
        from: { opacity: 0, transform: 'scale(1.2)' },
        to: { opacity: 1, transform: 'scale(1)' },
    },
    'flip-x': {
        from: { opacity: 0, transform: 'rotateX(-90deg)' },
        to: { opacity: 1, transform: 'rotateX(0deg)' },
    },
    'flip-y': {
        from: { opacity: 0, transform: 'rotateY(-90deg)' },
        to: { opacity: 1, transform: 'rotateY(0deg)' },
    },
    'slide-up': {
        from: { transform: 'translateY(100%)' },
        to: { transform: 'translateY(0px)' },
    },
    'slide-down': {
        from: { transform: 'translateY(-100%)' },
        to: { transform: 'translateY(0px)' },
    },
    'slide-left': {
        from: { transform: 'translateX(-100%)' },
        to: { transform: 'translateX(0px)' },
    },
    'slide-right': {
        from: { transform: 'translateX(100%)' },
        to: { transform: 'translateX(0px)' },
    },
    'bounce': {
        from: { opacity: 0, transform: 'translateY(-60px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
    },
    'rotate-in': {
        from: { opacity: 0, transform: 'rotate(-180deg) scale(0.5)' },
        to: { opacity: 1, transform: 'rotate(0deg) scale(1)' },
    },
    'blur-in': {
        from: { opacity: 0, filter: 'blur(12px)' },
        to: { opacity: 1, filter: 'blur(0px)' },
    },
    'skew-in': {
        from: { opacity: 0, transform: 'skewX(20deg) translateX(30px)' },
        to: { opacity: 1, transform: 'skewX(0deg) translateX(0px)' },
    },
    'scale-x': {
        from: { transform: 'scaleX(0)' },
        to: { transform: 'scaleX(1)' },
    },
    'scale-y': {
        from: { transform: 'scaleY(0)' },
        to: { transform: 'scaleY(1)' },
    },
    'shimmer': {
        from: { opacity: 0.5, filter: 'brightness(1)' },
        to: { opacity: 1, filter: 'brightness(1.5)' },
    },
    'pulse': {
        from: { transform: 'scale(1)' },
        to: { transform: 'scale(1.05)' },
    },
    'swing': {
        from: { transform: 'rotate(-10deg)' },
        to: { transform: 'rotate(10deg)' },
    },
    'scale-up': {
        from: { opacity: 0, transform: 'scale(0.5)' },
        to: { opacity: 1, transform: 'scale(1)' },
    },
    'blur-in-up': {
        from: { opacity: 0, filter: 'blur(12px)', transform: 'translateY(40px)' },
        to: { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' },
    },
    'flip-up': {
        from: { opacity: 0, transform: 'perspective(800px) rotateX(60deg)' },
        to: { opacity: 1, transform: 'perspective(800px) rotateX(0deg)' },
    },
    'flip-down': {
        from: { opacity: 0, transform: 'perspective(800px) rotateX(-60deg)' },
        to: { opacity: 1, transform: 'perspective(800px) rotateX(0deg)' },
    },
    'rotate-left': {
        from: { opacity: 0, transform: 'rotate(-15deg) translateX(-40px)' },
        to: { opacity: 1, transform: 'rotate(0deg) translateX(0px)' },
    },
    'rotate-right': {
        from: { opacity: 0, transform: 'rotate(15deg) translateX(40px)' },
        to: { opacity: 1, transform: 'rotate(0deg) translateX(0px)' },
    },
    // clip-path reveals: content is uncovered without moving or fading
    'clip-up': {
        from: { clipPath: 'inset(100% 0% 0% 0%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
    },
    'clip-down': {
        from: { clipPath: 'inset(0% 0% 100% 0%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
    },
    'clip-left': {
        from: { clipPath: 'inset(0% 0% 0% 100%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
    },
    'clip-right': {
        from: { clipPath: 'inset(0% 100% 0% 0%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
    },
    'clip-circle': {
        from: { clipPath: 'circle(0% at 50% 50%)' },
        to: { clipPath: 'circle(75% at 50% 50%)' },
    },
};
/**
 * One preset table per page, shared through a global symbol so every copy of
 * the library (ESM entries, the UMD bundle, `presets/extended`) sees presets
 * registered by any other copy. `<usa-reveal>` / `<usa-stagger>` read it too.
 */
const share = (core) => {
    const g = globalThis;
    const key = Symbol.for('use-scroll-animate.presets');
    return (g[key] = Object.assign(g[key] || {}, core));
};
/**
 * Every registered preset: the 33 core presets, plus the 6.1 extended set once
 * `motionary/presets/extended` is loaded, plus your own.
 */
const PRESETS = /*#__PURE__*/ share(CORE);
/**
 * Add (or replace) presets by name: `registerPresets({ 'my-pop': { from, to, frames? } })`.
 * They work everywhere a preset name does (`animation`, `exit`, `data-sa-animation`,
 * `<scroll-animate>`, `<usa-reveal effect>`).
 */
function registerPresets(presets) {
    Object.assign(PRESETS, presets);
}
/** The same keyframes played backwards (exit animations). */
function reversePreset(p) {
    return { from: p.to, to: p.from, frames: p.frames && p.frames.map((f) => ({ ...f, offset: 1 - f.offset })).reverse() };
}
const lookup = (name) => PRESETS[name.trim()];
function resolvePreset(animation) {
    if (typeof animation === 'string') {
        return lookup(animation) ?? PRESETS['fade-in-up'];
    }
    if (Array.isArray(animation)) {
        const combined = { from: {}, to: {} };
        animation.forEach(name => {
            const preset = lookup(name);
            if (preset) {
                Object.entries(preset.from).forEach(([key, val]) => {
                    if (key === 'transform' && combined.from[key]) {
                        combined.from[key] = `${combined.from[key]} ${val}`;
                    }
                    else {
                        combined.from[key] = val;
                    }
                });
                Object.entries(preset.to).forEach(([key, val]) => {
                    if (key === 'transform' && combined.to[key]) {
                        combined.to[key] = `${combined.to[key]} ${val}`;
                    }
                    else {
                        combined.to[key] = val;
                    }
                });
            }
        });
        return combined;
    }
    return animation;
}
/** Easing to CSS cubic-bezier mapping */
const EASING_MAP = {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'soft-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    'heavy-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
function resolveEasing(easing) {
    if (typeof easing === 'string') {
        return EASING_MAP[easing] ?? easing;
    }
    if (Array.isArray(easing)) {
        return `cubic-bezier(${easing.join(', ')})`;
    }
    if (typeof easing === 'function') {
        // Functions cannot be expressed as a CSS easing string; the core samples
        // them into a `linear()` easing (or keyframes on older browsers).
        return 'linear';
    }
    return 'ease';
}

exports.EASING_MAP = EASING_MAP;
exports.PRESETS = PRESETS;
exports.registerPresets = registerPresets;
exports.resolveEasing = resolveEasing;
exports.resolvePreset = resolvePreset;
exports.reversePreset = reversePreset;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.6.0/dist/chunks/presets-CUHys3sK.cjs.map