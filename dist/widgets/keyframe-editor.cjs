'use strict';

var base = require('../chunks/base-vu_KhBiv.cjs');
var player = require('../chunks/player-DIwSjUFR.cjs');
require('../chunks/registry-EziiQiWO.cjs');
require('../chunks/core-E18xla6s.cjs');
require('../components/tokens.cjs');

var css = "usa-keyframe-editor{--usa-ke-c:#7c5cff;--usa-ke-head:100%;display:flex;flex-direction:column;gap:8px;width:var(--usa-ke-w,100%);max-width:100%;padding:10px;border-radius:14px;background:var(--usa-ke-bg,#0f172a);color:#e2e8f0;font:500 12px/1.2 system-ui,sans-serif}.usa-ke-bar{display:flex;align-items:center;gap:8px}.usa-ke-play{width:30px;height:30px;border:0;border-radius:50%;background:var(--usa-ke-c);color:#fff;cursor:pointer}.usa-ke-scrub{flex:1;min-width:0;accent-color:var(--usa-ke-c)}.usa-ke-time{min-width:58px;text-align:right;font-variant-numeric:tabular-nums;opacity:.8}.usa-ke-tracks{position:relative;display:flex;flex-direction:column;gap:4px}.usa-ke-tracks::after{content:\"\";position:absolute;top:0;bottom:0;left:calc(64px + (100% - 64px) * var(--usa-ke-head) / 100%);width:2px;background:#f43f5e;pointer-events:none}.usa-ke-row{display:grid;grid-template-columns:64px 1fr;align-items:center}.usa-ke-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:6px;opacity:.85}.usa-ke-lane{position:relative;height:22px;border-radius:6px;background:rgba(148,163,184,.14)}.usa-ke-clip{position:absolute;top:2px;bottom:2px;border-radius:5px;background:linear-gradient(90deg,var(--usa-ke-c),#22d3ee);cursor:grab;touch-action:none;outline-offset:2px;transition:left .2s,width .2s}.usa-ke-clip[data-drag]{cursor:grabbing;transition:none;box-shadow:0 4px 12px rgba(0,0,0,.4)}.usa-ke-clip:focus-visible{outline:2px solid #fff}.usa-ke-grip{position:absolute;right:0;top:0;bottom:0;width:8px;border-radius:0 5px 5px 0;background:rgba(255,255,255,.35);cursor:ew-resize}@media (prefers-reduced-motion:reduce){.usa-ke-clip{transition:none}}";

const DEFAULT = {
    format: player.ANIMATION_FORMAT,
    version: 1,
    name: 'Untitled',
    tracks: [
        { target: ':scope > :nth-child(1)', start: 0, duration: 600, preset: 'fade-up', label: 'Title' },
        { target: ':scope > :nth-child(2)', start: 300, duration: 600, preset: 'scale', label: 'Card' },
        { target: ':scope > :nth-child(3)', start: 700, duration: 500, preset: 'fade-up', label: 'Button' },
    ],
};
function defineKeyframeEditor(tag = 'usa-keyframe-editor') {
    return base.defineElement(tag, (Base) => {
        class UsaKeyframeEditor extends Base {
            constructor() {
                super(...arguments);
                this._anim = JSON.parse(JSON.stringify(DEFAULT));
                this._player = null;
            }
            static get observedAttributes() {
                return ['for'];
            }
            get animation() {
                return this.toJSON();
            }
            set animation(v) {
                try {
                    const a = typeof v === 'string' ? JSON.parse(v) : v;
                    if (a && Array.isArray(a.tracks))
                        this._anim = { format: player.ANIMATION_FORMAT, version: 1, ...JSON.parse(JSON.stringify(a)) };
                }
                catch {
                    return;
                }
                if (this.isConnected)
                    this.render();
            }
            toJSON() {
                return JSON.parse(JSON.stringify({ ...this._anim, duration: this.total() }));
            }
            total() {
                return Math.max(500, ...this._anim.tracks.map((t) => (t.start || 0) + (t.duration || 0)));
            }
            mount() {
                const src = this.querySelector(':scope > script[type="application/json"]');
                if (src?.textContent)
                    this.animation = src.textContent;
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<div class="usa-ke-bar" data-usa-part><button type="button" class="usa-ke-play" aria-label="Play">▶</button><input class="usa-ke-scrub" type="range" min="0" max="1000" value="1000" aria-label="Playhead"><output class="usa-ke-time">0 ms</output></div><div class="usa-ke-tracks" data-usa-part role="list"></div>');
                this.listen(this.querySelector('.usa-ke-play'), 'click', () => this.play());
                this.listen(this.querySelector('.usa-ke-scrub'), 'input', (e) => this.seek((Number(e.target.value) / 1000) * this.total()));
                this.render();
            }
            target() {
                const id = this.str('for', '');
                return id ? document.getElementById(id) : null;
            }
            rebuild() {
                this._player?.destroy?.();
                this._player = null;
                const t = this.target();
                if (t)
                    this._player = player.createPlayer(t, this.toJSON(), { autoplay: false });
            }
            render() {
                const box = this.querySelector('.usa-ke-tracks');
                if (!box)
                    return;
                const total = this.total();
                box.innerHTML = '';
                this._anim.tracks.forEach((t, i) => {
                    const row = document.createElement('div');
                    row.className = 'usa-ke-row';
                    row.setAttribute('role', 'listitem');
                    row.innerHTML = `<span class="usa-ke-label"></span><span class="usa-ke-lane"><span class="usa-ke-clip" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="${total}"><span class="usa-ke-grip" aria-hidden="true"></span></span></span>`;
                    row.querySelector('.usa-ke-label').textContent = t.label || t.preset || t.effect || `Track ${i + 1}`;
                    const clip = row.querySelector('.usa-ke-clip');
                    clip.style.left = `${((t.start || 0) / total) * 100}%`;
                    clip.style.width = `${Math.max(2, ((t.duration || 300) / total) * 100)}%`;
                    clip.setAttribute('aria-valuenow', String(t.start || 0));
                    clip.setAttribute('aria-label', `${row.querySelector('.usa-ke-label').textContent}: start ${t.start || 0} ms, ${t.duration || 0} ms`);
                    clip.dataset.i = String(i);
                    this.wire(clip, i);
                    box.appendChild(row);
                });
                this.rebuild();
            }
            update(i, start, duration) {
                const t = this._anim.tracks[i];
                t.start = Math.max(0, Math.round(start / 10) * 10);
                t.duration = Math.max(50, Math.round(duration / 10) * 10);
                this.render();
                this.querySelector(`.usa-ke-clip[data-i="${i}"]`)?.focus();
                this.emit('change', { animation: this.toJSON() });
            }
            wire(clip, i) {
                clip.addEventListener('keydown', (e) => {
                    const t = this._anim.tracks[i];
                    const d = e.key === 'ArrowRight' ? 50 : e.key === 'ArrowLeft' ? -50 : 0;
                    if (!d)
                        return;
                    e.preventDefault();
                    if (e.shiftKey)
                        this.update(i, t.start || 0, (t.duration || 300) + d);
                    else
                        this.update(i, (t.start || 0) + d, t.duration || 300);
                });
                clip.addEventListener('pointerdown', (e) => {
                    const lane = clip.parentElement;
                    const w = lane.getBoundingClientRect().width || 1;
                    const total = this.total();
                    const t = this._anim.tracks[i];
                    const s0 = t.start || 0;
                    const d0 = t.duration || 300;
                    const resize = e.target.classList.contains('usa-ke-grip');
                    const x0 = e.clientX;
                    clip.setPointerCapture?.(e.pointerId);
                    clip.toggleAttribute('data-drag', true);
                    const move = (ev) => {
                        const dms = ((ev.clientX - x0) / w) * total;
                        if (resize)
                            clip.style.width = `${(Math.max(50, d0 + dms) / total) * 100}%`;
                        else
                            clip.style.left = `${(Math.max(0, s0 + dms) / total) * 100}%`;
                    };
                    const up = (ev) => {
                        clip.removeEventListener('pointermove', move);
                        clip.removeEventListener('pointerup', up);
                        clip.removeAttribute('data-drag');
                        const dms = ((ev.clientX - x0) / w) * total;
                        if (Math.abs(ev.clientX - x0) < 2)
                            return;
                        if (resize)
                            this.update(i, s0, d0 + dms);
                        else
                            this.update(i, s0 + dms, d0);
                    };
                    clip.addEventListener('pointermove', move);
                    clip.addEventListener('pointerup', up);
                });
            }
            seek(ms) {
                const total = this.total();
                const v = Math.max(0, Math.min(total, ms));
                this._player?.seek?.(v);
                const out = this.querySelector('.usa-ke-time');
                if (out)
                    out.textContent = `${Math.round(v)} ms`;
                this.style.setProperty('--usa-ke-head', `${(v / total) * 100}%`);
            }
            play() {
                if (!this._player)
                    this.rebuild();
                if (this.reduced)
                    return this.seek(this.total());
                this._player?.seek?.(0);
                this._player?.play?.();
                const t0 = performance.now();
                const total = this.total();
                const scrub = this.querySelector('.usa-ke-scrub');
                const f = () => {
                    const ms = Math.min(total, performance.now() - t0);
                    if (scrub)
                        scrub.value = String(Math.round((ms / total) * 1000));
                    this.style.setProperty('--usa-ke-head', `${(ms / total) * 100}%`);
                    const out = this.querySelector('.usa-ke-time');
                    if (out)
                        out.textContent = `${Math.round(ms)} ms`;
                    if (ms < total && this.isConnected)
                        requestAnimationFrame(f);
                };
                if (typeof requestAnimationFrame === 'function')
                    requestAnimationFrame(f);
            }
        }
        return UsaKeyframeEditor;
    }, { id: 'keyframe-editor', text: css });
}

exports.defineKeyframeEditor = defineKeyframeEditor;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.1.0/dist/widgets/keyframe-editor.cjs.map