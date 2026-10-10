'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var shared = require('../chunks/shared-BxK1D7EZ.cjs');

var css = "usa-music-player{--usa-mp-c:#7c5cff;--usa-mp-p:0;display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;width:var(--usa-mp-w,320px);max-width:100%;padding:14px;border-radius:20px;background:var(--usa-mp-bg,linear-gradient(160deg,#111827,#1e1b4b));color:#f8fafc;font:500 13px/1.3 system-ui,sans-serif;box-shadow:0 14px 34px -14px rgba(0,0,0,.55)}.usa-mp-cover{width:84px;height:84px}.usa-mp-disc{display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,#0f172a 9%,#e2e8f0 9.5%,#e2e8f0 12%,transparent 12.5%),repeating-radial-gradient(circle,#111 0 2px,#1f2937 2px 4px),#111;background-size:cover;box-shadow:0 6px 18px rgba(0,0,0,.5),inset 0 0 0 2px rgba(255,255,255,.06)}usa-music-player[data-animate] .usa-mp-disc{animation:usa-mp-spin 1.8s linear infinite}.usa-mp-body{display:flex;flex-direction:column;gap:6px;min-width:0}.usa-mp-meta{display:flex;flex-direction:column;min-width:0}.usa-mp-title{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-mp-artist{opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-mp-bars{display:flex;gap:3px;align-items:flex-end;height:14px}.usa-mp-bars i{width:3px;height:30%;border-radius:2px;background:var(--usa-mp-c);transition:height .3s}usa-music-player[data-animate] .usa-mp-bars i{animation:usa-mp-bar .9s ease-in-out infinite alternate}.usa-mp-bars i:nth-child(2){animation-delay:-.3s!important}.usa-mp-bars i:nth-child(3){animation-delay:-.6s!important}.usa-mp-bars i:nth-child(4){animation-delay:-.15s!important}.usa-mp-track{position:relative;height:6px;border-radius:6px;background:rgba(255,255,255,.18);cursor:pointer;touch-action:none;outline-offset:4px}.usa-mp-fill{position:absolute;inset:0;border-radius:inherit;background:var(--usa-mp-c);transform-origin:0 50%;transform:scaleX(var(--usa-mp-p))}.usa-mp-knob{position:absolute;top:50%;left:calc(var(--usa-mp-p) * 100%);width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4);transition:transform .2s}.usa-mp-track:hover .usa-mp-knob,.usa-mp-track:focus-visible .usa-mp-knob{transform:scale(1.3)}.usa-mp-times{display:flex;justify-content:space-between;font-size:11px;opacity:.65;font-variant-numeric:tabular-nums}.usa-mp-ctrls{display:flex;align-items:center;justify-content:center;gap:12px}.usa-mp-btn{border:0;background:none;color:inherit;font-size:16px;cursor:pointer;opacity:.85}.usa-mp-play{position:relative;width:40px;height:40px;border:0;border-radius:50%;background:#fff;cursor:pointer}.usa-mp-icon{position:absolute;left:50%;top:50%;width:14px;height:16px;margin:-8px 0 0 -6px;background:var(--usa-mp-c);clip-path:polygon(0 0,100% 50%,100% 50%,0 100%);transition:clip-path .3s cubic-bezier(.6,.05,.3,1)}usa-music-player[data-playing] .usa-mp-icon{margin-left:-7px;clip-path:polygon(0 0,35% 0,35% 100%,0 100%,0 0,65% 0,100% 0,100% 100%,65% 100%,65% 0)}.usa-mp-btn:focus-visible,.usa-mp-play:focus-visible,.usa-mp-track:focus-visible{outline:2px solid #fff}@keyframes usa-mp-spin{to{transform:rotate(360deg)}}@keyframes usa-mp-bar{from{height:20%}to{height:100%}}@media (prefers-reduced-motion:reduce){usa-music-player *{animation:none!important;transition:none!important}}";

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function defineMusicPlayer(tag = 'usa-music-player') {
    return base.defineElement(tag, (Base) => {
        class UsaMusicPlayer extends Base {
            constructor() {
                super(...arguments);
                this._audio = null;
                this._playing = false;
                this._t = 0;
                this._raf = 0;
                this._last = 0;
                this.tick = (now) => {
                    if (!this._playing)
                        return;
                    if (!this._audio) {
                        this._t += this._last ? (now - this._last) / 1000 : 0;
                        this._last = now;
                        if (this._t >= this.duration) {
                            this._t = this.duration;
                            this.sync();
                            return this.pause();
                        }
                        this.sync();
                    }
                    this._raf = requestAnimationFrame(this.tick);
                };
            }
            static get observedAttributes() {
                return ['title', 'artist', 'cover', 'src', 'duration'];
            }
            get playing() {
                return this._playing;
            }
            get duration() {
                const d = this._audio?.duration;
                return d && Number.isFinite(d) ? d : Math.max(1, this.num('duration', 180));
            }
            get currentTime() {
                return this._audio ? this._audio.currentTime : this._t;
            }
            set currentTime(v) {
                this.seek(v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._audio = this.querySelector(':scope > audio');
                if (!this._audio && this.str('src', '')) {
                    this._audio = document.createElement('audio');
                    this._audio.src = this.str('src', '');
                    this._audio.preload = 'metadata';
                    this._audio.setAttribute('data-usa-part', '');
                    this.appendChild(this._audio);
                }
                this.setAttribute('role', 'group');
                this.setAttribute('aria-roledescription', 'music player');
                const title = this.str('title', 'Untitled');
                const artist = this.str('artist', '');
                this.setAttribute('aria-label', artist ? `${title} — ${artist}` : title);
                const cover = this.str('cover', '');
                this.insertAdjacentHTML('afterbegin', `<div class="usa-mp-cover" data-usa-part aria-hidden="true"><span class="usa-mp-disc"${cover ? ` style="background-image:url('${cover.replace(/'/g, '%27')}')"` : ''}></span></div><div class="usa-mp-body" data-usa-part><div class="usa-mp-meta"><b class="usa-mp-title"></b><span class="usa-mp-artist"></span></div><div class="usa-mp-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="usa-mp-track" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0"><span class="usa-mp-fill"></span><span class="usa-mp-knob"></span></div><div class="usa-mp-times"><span class="usa-mp-cur">0:00</span><span class="usa-mp-dur"></span></div><div class="usa-mp-ctrls"><button type="button" class="usa-mp-btn" data-act="prev" aria-label="Previous">⏮</button><button type="button" class="usa-mp-play" data-act="play" aria-label="Play"><span class="usa-mp-icon"></span></button><button type="button" class="usa-mp-btn" data-act="next" aria-label="Next">⏭</button></div></div>`);
                this.querySelector('.usa-mp-title').textContent = title;
                this.querySelector('.usa-mp-artist').textContent = artist;
                this.listen(this, 'click', (e) => {
                    const act = e.target.closest?.('[data-act]');
                    if (!act)
                        return;
                    if (act.dataset.act === 'play')
                        this.toggle();
                    else
                        this.emit(act.dataset.act, {});
                });
                const track = this.querySelector('.usa-mp-track');
                this.listen(track, 'pointerdown', (e) => {
                    const at = (ev) => {
                        const r = track.getBoundingClientRect();
                        this.seek(shared.clampN((ev.clientX - r.left) / (r.width || 1), 0, 1) * this.duration);
                    };
                    at(e);
                    track.setPointerCapture?.(e.pointerId);
                    const up = () => (track.removeEventListener('pointermove', at), track.removeEventListener('pointerup', up));
                    track.addEventListener('pointermove', at);
                    track.addEventListener('pointerup', up);
                });
                this.listen(track, 'keydown', (e) => {
                    const d = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0;
                    if (!d)
                        return;
                    e.preventDefault();
                    this.seek(this.currentTime + d);
                });
                if (this._audio) {
                    this.listen(this._audio, 'timeupdate', () => this.sync());
                    this.listen(this._audio, 'loadedmetadata', () => this.sync());
                    this.listen(this._audio, 'ended', () => this.pause());
                }
                this.onCleanup(() => cancelAnimationFrame(this._raf));
                this.sync();
            }
            sync() {
                const d = this.duration;
                const t = this.currentTime;
                this.style.setProperty('--usa-mp-p', String(shared.clampN(t / d, 0, 1)));
                const cur = this.querySelector('.usa-mp-cur');
                if (cur)
                    cur.textContent = fmt(t);
                const dur = this.querySelector('.usa-mp-dur');
                if (dur)
                    dur.textContent = fmt(d);
                const tr = this.querySelector('.usa-mp-track');
                tr?.setAttribute('aria-valuemax', String(Math.round(d)));
                tr?.setAttribute('aria-valuenow', String(Math.round(t)));
                tr?.setAttribute('aria-valuetext', `${fmt(t)} of ${fmt(d)}`);
                this.toggleAttribute('data-playing', this._playing);
                this.toggleAttribute('data-animate', this._playing && !this.reduced);
                const b = this.querySelector('.usa-mp-play');
                b?.setAttribute('aria-label', this._playing ? 'Pause' : 'Play');
                b?.setAttribute('aria-pressed', String(this._playing));
            }
            play() {
                if (this._playing)
                    return;
                this._playing = true;
                if (this._audio)
                    void this._audio.play()?.catch?.(() => undefined);
                this._last = 0;
                if (typeof requestAnimationFrame === 'function')
                    this._raf = requestAnimationFrame(this.tick);
                this.sync();
                const icon = this.querySelector('.usa-mp-play');
                if (icon && !this.reduced)
                    this.motion(icon, [{ transform: 'scale(.85)' }, { transform: 'scale(1.08)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
                this.emit('play', {});
            }
            pause() {
                if (!this._playing)
                    return;
                this._playing = false;
                this._audio?.pause();
                cancelAnimationFrame(this._raf);
                this.sync();
                this.emit('pause', {});
            }
            toggle() {
                if (this._playing)
                    this.pause();
                else
                    this.play();
            }
            seek(s) {
                const t = shared.clampN(s, 0, this.duration);
                if (this._audio)
                    this._audio.currentTime = t;
                else
                    this._t = t;
                this.sync();
                this.emit('seek', { time: t });
            }
        }
        return UsaMusicPlayer;
    }, { id: 'music-player', text: css });
}

exports.defineMusicPlayer = defineMusicPlayer;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/widgets/music-player.cjs.map