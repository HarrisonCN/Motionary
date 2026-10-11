'use strict';

var base = require('./base-BvH4nAcv.cjs');
var components_offscreen = require('../components/offscreen.cjs');
var play = require('./play-DCeKlDqE.cjs');
var playerCore = require('./player-core-BTFa6_IO.cjs');

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
 * `usa:step` (`detail: { index }`; 12.0, was `usa-story-step`). Reduced motion: no sliding / zooming
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
                    components_offscreen.raf(tick);
            };
            components_offscreen.raf(tick);
        }
        mount() {
            this.toggleAttribute('data-static', this.reduced);
            if (this.template === 'compare')
                this.mountCompare();
            const kick = () => {
                if (!this.frame)
                    this.frame = components_offscreen.raf(() => this.update(), this);
            };
            this.listen(window, 'scroll', kick, { passive: true });
            this.listen(window, 'resize', kick);
            this.onCleanup(() => base.caf(this.frame));
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
 * registered effect at `start`.
 *
 * 14.0: Scene Format v2 (`motionary-scene` v2) is read natively, and
 * `motionary-timeline` v1 through auto-migration. The playground format and
 * animation JSON without `format` / `version` were removed (convert with
 * `npx motionary migrate`, or `installCompatV13()` from `motionary/compat-v13`).
 *
 * Keyframe tracks are WAAPI animations driven by one clock, so the player can
 * play, pause, seek, change rate and be scrubbed by scroll
 * (`trigger="scroll"`). Reduced motion: jumps to the end state, effects skipped.
 */
/** @internal Parse + normalise any document `<usa-player>` reads (scene v2, timeline v1, animation JSON v1). */
function normalizePlayable(input) {
    return playerCore.normalizePlayable(input, play.sceneToAnimation);
}
/** Bind an animation to `root` and return its controller (paused at 0 unless `autoplay`). */
function createPlayer(root, animation, o = {}) {
    return playerCore.createPlayerCore(root, animation, o, play.sceneToAnimation);
}
/**
 * `<usa-player src="hero.json" | <script type="application/json"> child
 * trigger="load | view | scroll | click | manual" loop rate controls>`.
 * Emits `usa:ready` and `usa:finish` (12.0: legacy `usa-player-*` names gone); sets `data-error` when the
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
                    onFinish: () => this.emit('finish'),
                });
                this.removeAttribute('data-error');
            }
            catch (err) {
                this.setAttribute('data-error', String(err.message || err));
                return;
            }
            const p = this.player;
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
                const kick = () => void (f || (f = base.raf(upd)));
                this.listen(window, 'scroll', kick, { passive: true });
                this.listen(window, 'resize', kick);
                this.onCleanup(() => base.caf(f));
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

exports.STORY_TEMPLATES = STORY_TEMPLATES;
exports.createPlayer = createPlayer;
exports.definePlayer = definePlayer;
exports.defineStory = defineStory;
exports.formatCount = formatCount;
exports.normalizePlayable = normalizePlayable;
exports.storyProgress = storyProgress;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.0.0/dist/chunks/player-BJPVdtzo.cjs.map