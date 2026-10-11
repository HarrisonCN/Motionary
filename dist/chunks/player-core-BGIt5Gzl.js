import { b as caf, p as prefersReducedMotion, r as raf } from './base-ByyAdGqz.js';
import { playEffect } from './registry-RLD_spxR.js';
import { T as TIMELINE_PRESETS } from './core-BPPcJVGQ.js';

/**
 * 14.0: the `<usa-player>` runtime without the Scene Format v2 loader — animation JSON v1
 * normalisation and the WAAPI player. `./player` adds the scene v2 loader (`createPlayer`,
 * `<usa-player>`); widgets that only build animation JSON v1 (the keyframe editor) import this.
 */
const ANIMATION_FORMAT = 'use-scroll-animate/animation';
/** @internal 14.0: set by `installCompatV13()` (motionary/compat-v13) to read removed 13.x documents again. */
let legacy;
/** @internal used by motionary/compat-v13; returns an uninstall. */
function setLegacyAnimationLoader(fn) {
    legacy = fn;
    return () => {
        if (legacy === fn)
            legacy = undefined;
    };
}
/** @internal Parse + normalise any document `<usa-player>` reads (scene v2, timeline v1, animation JSON v1). */
function normalizePlayable(input, scene) {
    let d = typeof input === 'string' ? JSON.parse(input) : input;
    if (!d || typeof d !== 'object')
        throw new Error('[motionary] animation: expected an object');
    if (scene && (d.format === 'motionary-scene' || d.format === 'motionary-timeline'))
        d = scene(d);
    else {
        d = legacy?.(d) || d;
        if (d.format === 'use-scroll-animate/playground' || (d.format === undefined && d.version === undefined && Array.isArray(d.tracks)))
            throw new Error(`[motionary] animation: ${d.format ? 'playground documents' : 'animation JSON without "format" / "version"'} were removed in 14.0 — convert with \`npx motionary migrate\` (scene v2), or read them with installCompatV13() from motionary/compat-v13`);
        if (!Array.isArray(d.tracks))
            throw new Error('[motionary] animation: missing "tracks"');
        if (d.format !== ANIMATION_FORMAT)
            throw new Error(`[motionary] animation: unknown format "${d.format}"`);
        if (d.version > 1)
            throw new Error(`[motionary] animation: version ${d.version} needs a newer motionary`);
    }
    const out = d.tracks
        .filter((t) => t && (t.effect || t.preset || Array.isArray(t.keyframes)))
        .map((t) => ({ ...t, target: t.target || ':scope', start: Math.max(0, Number(t.start) || 0), duration: t.effect ? 0 : Math.max(1, Number(t.duration) || 600) }));
    const end = out.reduce((m, t) => Math.max(m, t.start + t.duration), 0);
    return { tracks: out, duration: Math.max(end, Number(d.duration) || 0), loop: !!d.loop, name: String(d.name || 'animation') };
}
const pick = (root, sel) => {
    if (sel === ':scope')
        return [root];
    try {
        return Array.from(root.querySelectorAll(sel));
    }
    catch {
        return [];
    }
};
/** @internal `createPlayer` without the scene v2 loader (animation JSON v1 only; used by `<usa-kf-editor>`). */
function createPlayerCore(root, animation, o = {}, scene) {
    const a = normalizePlayable(animation, scene);
    const loop = o.loop ?? a.loop;
    const anims = [];
    const effects = [];
    for (const t of a.tracks) {
        const els = pick(root, t.target);
        if (t.effect)
            effects.push({ els, t, fired: false });
        else {
            const kf = t.keyframes || TIMELINE_PRESETS[t.preset] || TIMELINE_PRESETS.fade;
            for (const el of els) {
                if (typeof el.animate !== 'function')
                    continue;
                const an = el.animate(kf, { duration: t.duration, delay: t.start, easing: t.easing || 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' });
                an.pause();
                an.currentTime = 0;
                anims.push(an);
            }
        }
    }
    let time = 0;
    let playing = false;
    let raf$1 = 0;
    let last = 0;
    let resolve;
    let finished = new Promise((r) => (resolve = r));
    const set = (ms) => {
        time = Math.min(a.duration, Math.max(0, ms));
        for (const an of anims)
            an.currentTime = time;
    };
    const fireDue = () => {
        if (prefersReducedMotion())
            return;
        for (const e of effects)
            if (!e.fired && time >= e.t.start) {
                e.fired = true;
                for (const el of e.els)
                    playEffect(el, e.t.effect, e.t.options || {}).catch(() => undefined);
            }
    };
    const done = () => {
        resolve();
        o.onFinish?.();
        finished = new Promise((r) => (resolve = r));
    };
    const frame = (now) => {
        raf$1 = 0;
        if (!playing)
            return;
        set(time + (now - last) * player.rate);
        last = now;
        fireDue();
        if (time >= a.duration) {
            if (loop) {
                effects.forEach((e) => (e.fired = false));
                set(0);
            }
            else {
                playing = false;
                done();
                return;
            }
        }
        raf$1 = raf(frame);
    };
    const player = {
        get duration() {
            return a.duration;
        },
        get currentTime() {
            return time;
        },
        get playing() {
            return playing;
        },
        rate: o.rate ?? 1,
        get finished() {
            return finished;
        },
        play() {
            if (prefersReducedMotion()) {
                set(a.duration);
                effects.forEach((e) => (e.fired = true));
                done();
                return;
            }
            if (playing)
                return;
            if (time >= a.duration) {
                effects.forEach((e) => (e.fired = false));
                set(0);
            }
            playing = true;
            last = performance.now();
            fireDue();
            raf$1 = raf(frame);
        },
        pause() {
            playing = false;
            caf(raf$1);
            raf$1 = 0;
        },
        seek(ms) {
            set(ms);
            effects.forEach((e) => (e.fired = e.t.start < time));
        },
        destroy() {
            player.pause();
            anims.forEach((an) => an.cancel());
        },
    };
    if (o.autoplay)
        player.play();
    return player;
}

export { ANIMATION_FORMAT as A, createPlayerCore as c, normalizePlayable as n, setLegacyAnimationLoader as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.2.0/dist/chunks/player-core-BGIt5Gzl.js.map