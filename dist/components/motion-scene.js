import { a as animate, c as control, g as group } from '../chunks/index-Pkno706C.js';
import { s as sceneToAnimation } from '../chunks/play-DZ_ho9zJ.js';

/**
 * `motionary/motion/scene` (= `motionary/components/motion-scene`, 14.0) — `playScene()`: play a
 * Scene Format v2 document with Motion Engine v2 as one standard controller. Its own entry so that
 * `motionary/motion` stays small: this one adds the scene loader `<usa-player>` uses
 * (`src/components/scene/play.ts`: token references, mute / solo, seeded `random()`).
 */
/**
 * Play a Scene Format v2 document (or `motionary-timeline` v1 / animation JSON v1) inside `root` with
 * Motion Engine v2: one standard controller for the whole scene. Token references, mute / solo and
 * seeded `random()` are resolved like `<usa-player>` does (same loader).
 */
function playScene(root, doc, options = {}) {
    const d = typeof doc === 'string' ? JSON.parse(doc) : doc;
    // animation JSON v1 plays its tracks as they are; anything else goes through the scene loader (which throws on what it cannot read)
    const a = d?.format === 'use-scroll-animate/animation' ? { tracks: d.tracks || [], loop: d.loop, duration: d.duration } : sceneToAnimation(d || {});
    const pick = (sel) => (!sel || sel === ':scope' ? [root] : Array.from(root.querySelectorAll(sel)));
    const items = [];
    for (const t of a.tracks) {
        const list = pick(t.target);
        if (!list.length)
            continue;
        const at = Math.max(0, Number(t.start) || 0);
        let fired = false;
        const c = t.effect
            ? animate((p) => { if (p >= 1 && !fired) {
                fired = true;
                list.forEach((el) => options.onEffect?.(el, t.effect, t.options || {}));
            } }, { duration: 1, autoplay: false })
            : animate(list, t.keyframes || t.preset || 'fade', { duration: Math.max(1, Number(t.duration) || 600), easing: t.easing || 'cubic-bezier(0.22, 1, 0.36, 1)', autoplay: false });
        items.push([c, at]);
    }
    if (a.duration)
        items.push([control({ d: a.duration, r() { } }, { autoplay: false }), 0]);
    return group(items, { ...options, repeat: a.loop ? Infinity : 0 });
}

export { playScene };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v16.0.0-rc.1/dist/components/motion-scene.js.map