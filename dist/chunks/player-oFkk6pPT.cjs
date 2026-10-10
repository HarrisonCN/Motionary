'use strict';

var registry = require('./registry-BB1oO-lR.cjs');
var base = require('./base-B3me2y0o.cjs');
var core = require('./core-KIvPGg0c.cjs');

/**
 * 5.4 — `<usa-story template="…">` scroll-storytelling templates.
 *
 * - `pin` — a sticky `[data-stage]` while `[data-step]` sections scroll past; the
 *   step in view gets `data-active`, the stage gets `data-active-step="<index>"`.
 * - `gallery` — a horizontal `[data-track]` slides sideways as you scroll down.
 * - `zoom` — the `[data-stage]` zooms toward the viewer (`zoom="6"`) and fades.
 * - `compare` — before / after (`[data-before]`, `[data-after]`) wipe driven by
 *   scroll, plus a draggable, keyboard-accessible handle (`role="slider"`).
 * - `counter` — `[data-count="1234"]` numbers count up when they enter view.
 * - `highlight` — paragraphs dim except the one crossing the viewport center.
 *
 * Every template sets `--usa-story-progress` (0–1) on the host and dispatches
 * `usa-story-step` (`detail: { index }`). Reduced motion: no sliding / zooming
 * (the gallery stacks vertically), counters show final values, the rest is
 * class changes only.
 */
const STORY_TEMPLATES = ['pin', 'gallery', 'zoom', 'compare', 'counter', 'highlight'];
const CSS = `usa-story{display:block;position:relative}
usa-story[template=pin] [data-stage],usa-story[template=gallery] [data-sticky],usa-story[template=zoom] [data-stage],usa-story[template=compare] [data-sticky]{position:sticky;top:0}
usa-story[template=pin] [data-stage]{align-self:start}
usa-story[template=pin] [data-step]{min-height:80vh;opacity:.35;transition:opacity .3s}
usa-story[template=pin] [data-step][data-active]{opacity:1}
usa-story[template=gallery] [data-sticky]{height:100vh;overflow:hidden;display:flex;align-items:center}
usa-story[template=gallery] [data-track]{display:flex;gap:24px;will-change:transform}
usa-story[template=gallery][data-static] [data-sticky]{position:static;height:auto;overflow:visible}
usa-story[template=gallery][data-static] [data-track]{flex-direction:column;transform:none!important}
usa-story[template=zoom] [data-stage]{height:100vh;overflow:hidden;display:grid;place-items:center}
usa-story[template=compare] [data-sticky]{height:var(--usa-story-h,70vh);overflow:hidden}
usa-story[template=compare] [data-before],usa-story[template=compare] [data-after]{position:absolute;inset:0}
usa-story[template=compare] [data-after]{clip-path:inset(0 0 0 var(--usa-split,50%))}
usa-story [data-handle]{position:absolute;top:0;bottom:0;left:var(--usa-split,50%);width:4px;margin-left:-2px;background:#fff;box-shadow:0 0 0 1px #0003;cursor:ew-resize;touch-action:none}
usa-story [data-handle]:focus-visible{outline:3px solid #7c5cff;outline-offset:2px}
usa-story[template=highlight] p,usa-story[template=highlight] [data-step]{opacity:.3;transition:opacity .25s}
usa-story[template=highlight] [data-active]{opacity:1}`;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Progress of `el` through the viewport: 0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom. */
function storyProgress(el, vh = typeof innerHeight === 'number' ? innerHeight : 800) {
    const r = el.getBoundingClientRect();
    const span = r.height - vh;
    return span > 0 ? clamp(-r.top / span) : clamp((vh - r.top) / (vh + r.height));
}
/** Format a counted value like the target (`1,234`, `12.5`, prefix / suffix kept). */
function formatCount(target, t) {
    const m = target.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
    if (!m)
        return target;
    const [, pre, num, post] = m;
    const n = parseFloat(num.replace(/,/g, ''));
    const dec = (num.split('.')[1] || '').length;
    let s = (n * t).toFixed(dec);
    if (num.includes(','))
        s = Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return pre + s + post;
}
function defineStory(tag = 'usa-story') {
    return base.defineElement(tag, (Base) => class UsaStory extends Base {
        constructor() {
            super(...arguments);
            this.progress = 0;
            this.step = -1;
            this.frame = 0;
        }
        static get observedAttributes() {
            return ['template', 'zoom', 'label'];
        }
        get template() {
            const t = this.str('template', 'pin');
            return STORY_TEMPLATES.includes(t) ? t : 'pin';
        }
        steps() {
            const own = Array.from(this.querySelectorAll('[data-step]:not([data-stage])'));
            return own.length || this.template !== 'highlight' ? own : Array.from(this.querySelectorAll('p'));
        }
        setStep(i) {
            if (i === this.step)
                return;
            this.step = i;
            this.steps().forEach((s, k) => s.toggleAttribute('data-active', k === i));
            const stage = this.querySelector('[data-stage]');
            if (stage)
                stage.dataset.activeStep = String(i);
            // contract-exempt: event-prefix — legacy usa-story-step kept next to usa:step until 12.0
            this.dispatchEvent(new CustomEvent('usa-story-step', { detail: { index: i }, bubbles: true }));
            this.emit('step', { index: i });
        }
        /** Recompute from the current scroll position (called on scroll / resize). */
        update() {
            this.frame = 0;
            const p = (this.progress = storyProgress(this));
            this.style.setProperty('--usa-story-progress', p.toFixed(4));
            const t = this.template;
            const vh = innerHeight || 800;
            if (t === 'pin' || t === 'highlight') {
                const mid = vh / 2;
                let best = -1;
                let bestD = Infinity;
                this.steps().forEach((s, i) => {
                    const r = s.getBoundingClientRect();
                    const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
                    if (d < bestD)
                        (bestD = d), (best = i);
                });
                this.setStep(best);
            }
            else if (t === 'gallery' && !this.reduced) {
                const track = this.querySelector('[data-track]');
                const box = this.querySelector('[data-sticky]');
                if (track && box)
                    track.style.transform = `translateX(${(-p * Math.max(0, track.scrollWidth - box.clientWidth)).toFixed(1)}px)`;
            }
            else if (t === 'zoom' && !this.reduced) {
                const inner = this.querySelector('[data-stage] > *');
                if (inner) {
                    inner.style.transform = `scale(${(1 + p * (this.num('zoom', 6) - 1)).toFixed(3)})`;
                    inner.style.opacity = String(clamp(1.4 - p * 1.4).toFixed(3));
                }
            }
            else if (t === 'compare' && !this.hasAttribute('data-dragged')) {
                this.setSplit(p * 100);
            }
            else if (t === 'counter') {
                this.querySelectorAll('[data-count]:not([data-counted])').forEach((el) => {
                    const r = el.getBoundingClientRect();
                    if (r.top < vh * 0.9 && r.bottom > 0)
                        this.count(el);
                });
            }
        }
        setSplit(pct) {
            const v = clamp(pct, 0, 100);
            this.style.setProperty('--usa-split', `${v.toFixed(2)}%`);
            const h = this.querySelector('[data-handle]');
            if (h)
                h.setAttribute('aria-valuenow', String(Math.round(v)));
        }
        count(el) {
            el.dataset.counted = '';
            const target = el.dataset.count || el.textContent || '0';
            el.setAttribute('aria-label', target);
            if (this.reduced) {
                el.textContent = target;
                return;
            }
            const dur = Number(el.dataset.duration) || 1600;
            const t0 = performance.now();
            const tick = (now) => {
                const k = clamp((now - t0) / dur);
                el.textContent = formatCount(target, 1 - (1 - k) ** 3);
                if (k < 1)
                    requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }
        mount() {
            this.toggleAttribute('data-static', this.reduced);
            if (this.template === 'compare')
                this.mountCompare();
            const kick = () => {
                if (!this.frame)
                    this.frame = requestAnimationFrame(() => this.update());
            };
            this.listen(window, 'scroll', kick, { passive: true });
            this.listen(window, 'resize', kick);
            this.onCleanup(() => cancelAnimationFrame(this.frame));
            this.update();
        }
        mountCompare() {
            const box = this.querySelector('[data-sticky]') || this;
            let h = this.querySelector('[data-handle]');
            if (!h) {
                h = document.createElement('div');
                h.setAttribute('data-handle', '');
                box.appendChild(h);
                this.onCleanup(() => h.remove());
            }
            h.tabIndex = 0;
            h.setAttribute('role', 'slider');
            h.setAttribute('aria-label', this.str('label', 'Before / after'));
            h.setAttribute('aria-valuemin', '0');
            h.setAttribute('aria-valuemax', '100');
            const at = (e) => {
                const r = box.getBoundingClientRect();
                this.dataset.dragged = '';
                this.setSplit(((e.clientX - r.left) / (r.width || 1)) * 100);
            };
            let drag = false;
            this.listen(h, 'pointerdown', (e) => {
                drag = true;
                h.setPointerCapture?.(e.pointerId);
            });
            this.listen(h, 'pointermove', (e) => drag && at(e));
            this.listen(h, 'pointerup', () => (drag = false));
            this.listen(h, 'keydown', (e) => {
                const cur = parseFloat(h.getAttribute('aria-valuenow') || '50');
                const step = e.shiftKey ? 10 : 2;
                const next = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? cur - step : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? cur + step : e.key === 'Home' ? 0 : e.key === 'End' ? 100 : null;
                if (next == null)
                    return;
                e.preventDefault();
                this.dataset.dragged = '';
                this.setSplit(next);
            });
            this.setSplit(50);
        }
        unmount() {
            this.step = -1;
            delete this.dataset.dragged;
        }
    }, { id: 'usa-story', text: CSS });
}

/**
 * 5.9 — `<usa-player>`: plays JSON animations.
 *
 * Format `use-scroll-animate/animation` v1:
 *
 * ```json
 * { "format": "use-scroll-animate/animation", "version": 1, "name": "Hero",
 *   "loop": false,
 *   "tracks": [
 *     { "target": "h1", "start": 0, "duration": 600, "preset": "fade-up" },
 *     { "target": ".cta", "start": 500, "duration": 500, "keyframes": [{ "opacity": 0 }, { "opacity": 1 }], "easing": "ease-out" },
 *     { "target": ".cta", "start": 1100, "effect": "jelly", "options": {} }
 *   ] }
 * ```
 *
 * A track animates `target` (a selector inside the player; `:scope` for the
 * player itself) with a timeline preset, its own keyframes, or fires any
 * registered effect at `start`. Playground presets (format
 * `use-scroll-animate/playground`) are accepted too — their tracks map to the
 * player's children in order.
 *
 * Keyframe tracks are WAAPI animations driven by one clock, so the player can
 * play, pause, seek, change rate and be scrubbed by scroll
 * (`trigger="scroll"`). Reduced motion: jumps to the end state, effects skipped.
 */
const ANIMATION_FORMAT = 'use-scroll-animate/animation';
function decodePlayground(state) {
    try {
        const b64 = state.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(escape(atob(b64)));
        const t = (JSON.parse(json).t || []);
        return t.map(([preset, start, duration, label], i) => ({ target: `:scope > :nth-child(${i + 1})`, preset, start, duration, label }));
    }
    catch {
        return [];
    }
}
/** Validate / normalise an animation (object or JSON text). Throws on anything unusable. */
function normalizeAnimation(input) {
    const d = typeof input === 'string' ? JSON.parse(input) : input;
    if (!d || typeof d !== 'object')
        throw new Error('[motionary] animation: expected an object');
    let tracks;
    if (d.format === 'use-scroll-animate/playground')
        tracks = decodePlayground(String(d.state || ''));
    else if (Array.isArray(d.tracks))
        tracks = d.tracks;
    else
        throw new Error('[motionary] animation: missing "tracks"');
    if (d.format && d.format !== ANIMATION_FORMAT && d.format !== 'use-scroll-animate/playground')
        throw new Error(`[motionary] animation: unknown format "${d.format}"`);
    if (d.version && d.version > 1 && d.format === ANIMATION_FORMAT)
        throw new Error(`[motionary] animation: version ${d.version} needs a newer motionary`);
    const out = tracks
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
/** Bind an animation to `root` and return its controller (paused at 0 unless `autoplay`). */
function createPlayer(root, animation, o = {}) {
    const a = normalizeAnimation(animation);
    const loop = o.loop ?? a.loop;
    const anims = [];
    const effects = [];
    for (const t of a.tracks) {
        const els = pick(root, t.target);
        if (t.effect)
            effects.push({ els, t, fired: false });
        else {
            const kf = t.keyframes || core.TIMELINE_PRESETS[t.preset] || core.TIMELINE_PRESETS.fade;
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
    let raf = 0;
    let last = 0;
    let resolve;
    let finished = new Promise((r) => (resolve = r));
    const set = (ms) => {
        time = Math.min(a.duration, Math.max(0, ms));
        for (const an of anims)
            an.currentTime = time;
    };
    const fireDue = () => {
        if (base.prefersReducedMotion())
            return;
        for (const e of effects)
            if (!e.fired && time >= e.t.start) {
                e.fired = true;
                for (const el of e.els)
                    registry.playEffect(el, e.t.effect, e.t.options || {}).catch(() => undefined);
            }
    };
    const done = () => {
        resolve();
        o.onFinish?.();
        finished = new Promise((r) => (resolve = r));
    };
    const frame = (now) => {
        raf = 0;
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
        raf = requestAnimationFrame(frame);
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
            if (base.prefersReducedMotion()) {
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
            raf = requestAnimationFrame(frame);
        },
        pause() {
            playing = false;
            cancelAnimationFrame(raf);
            raf = 0;
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
/**
 * `<usa-player src="hero.json" | <script type="application/json"> child
 * trigger="load | view | scroll | click | manual" loop rate controls>`.
 * Emits `usa-player-ready` and `usa-player-finish`; sets `data-error` when the
 * animation cannot be loaded.
 */
function definePlayer(tag = 'usa-player') {
    return base.defineElement(tag, (Base) => class UsaPlayer extends Base {
        constructor() {
            super(...arguments);
            this.player = null;
            this.json = null;
        }
        static get observedAttributes() {
            return ['src', 'trigger', 'loop', 'rate', 'controls'];
        }
        load(animation) {
            this.json = animation;
            this.start();
        }
        play() {
            this.player?.play();
        }
        pause() {
            this.player?.pause();
        }
        seek(ms) {
            this.player?.seek(ms);
        }
        start() {
            this.player?.destroy();
            this.player = null;
            if (!this.json)
                return;
            try {
                this.player = createPlayer(this, this.json, {
                    loop: this.hasAttribute('loop') ? true : undefined,
                    rate: this.num('rate', 1),
                    // contract-exempt: event-prefix — legacy usa-player-ready / usa-player-finish kept next to usa:ready / usa:finish until 12.0
                    onFinish: () => (this.dispatchEvent(new CustomEvent('usa-player-finish', { bubbles: true })), this.emit('finish')),
                });
                this.removeAttribute('data-error');
            }
            catch (err) {
                this.setAttribute('data-error', String(err.message || err));
                return;
            }
            const p = this.player;
            this.dispatchEvent(new CustomEvent('usa-player-ready', { detail: { duration: p.duration }, bubbles: true }));
            this.emit('ready', { duration: p.duration });
            const trig = this.str('trigger', 'view');
            if (this.reduced && (trig === 'load' || trig === 'view'))
                p.seek(p.duration); // reduced motion: show the end state
            else if (trig === 'load')
                p.play();
            else if (trig === 'view')
                this.inView((v) => v && p.play(), { threshold: 0.25 });
            else if (trig === 'click')
                this.listen(this, 'click', () => (p.playing ? p.pause() : p.play()));
            else if (trig === 'scroll') {
                let f = 0;
                const upd = () => {
                    f = 0;
                    p.seek(storyProgress(this) * p.duration);
                };
                const kick = () => void (f || (f = requestAnimationFrame(upd)));
                this.listen(window, 'scroll', kick, { passive: true });
                this.listen(window, 'resize', kick);
                this.onCleanup(() => cancelAnimationFrame(f));
                upd();
            }
            if (this.flag('controls'))
                this.mountControls(p);
        }
        mountControls(p) {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('data-player-toggle', '');
            b.textContent = '▶︎ / ❚❚';
            b.setAttribute('aria-label', 'Play / pause animation');
            this.listen(b, 'click', (e) => {
                e.stopPropagation();
                if (p.playing)
                    p.pause();
                else
                    p.play();
                b.setAttribute('aria-pressed', String(p.playing));
            });
            this.append(b);
            this.onCleanup(() => b.remove());
        }
        changed(name) {
            if (name === 'src')
                this.json = null;
            super.changed(name);
        }
        mount() {
            this.onCleanup(() => {
                this.player?.destroy();
                this.player = null;
            });
            const inline = this.querySelector('script[type="application/json"]');
            const src = this.str('src');
            if (inline && !this.json)
                this.json = inline.textContent || '';
            if (src && !this.json) {
                fetch(src)
                    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
                    .then((t) => this.isConnected && this.load(t))
                    .catch((err) => this.setAttribute('data-error', String(err.message || err)));
                return;
            }
            this.start();
        }
    }, { id: 'usa-player', text: 'usa-player{display:block;position:relative}usa-player>script{display:none}usa-player [data-player-toggle]{position:absolute;right:8px;bottom:8px}' });
}

exports.ANIMATION_FORMAT = ANIMATION_FORMAT;
exports.STORY_TEMPLATES = STORY_TEMPLATES;
exports.createPlayer = createPlayer;
exports.definePlayer = definePlayer;
exports.defineStory = defineStory;
exports.formatCount = formatCount;
exports.normalizeAnimation = normalizeAnimation;
exports.storyProgress = storyProgress;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/chunks/player-oFkk6pPT.cjs.map