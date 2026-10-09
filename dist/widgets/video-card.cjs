'use strict';

var base = require('../chunks/base-DBheNxJu.cjs');

var css = "usa-video-card{position:relative;display:block;overflow:hidden;border-radius:14px;background:#0f172a;color:#fff;aspect-ratio:16/9;cursor:pointer;outline:none;isolation:isolate}usa-video-card>img,usa-video-card>video,usa-video-card>[data-poster]{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 6s ease-out}usa-video-card>video{opacity:0;transition:opacity .35s}usa-video-card[data-previewing]:not([data-noplay])>video{opacity:1}usa-video-card[data-previewing][data-noplay]>img,usa-video-card[data-previewing][data-noplay]>[data-poster]{transform:scale(1.12) translate(-2%,-1%)}usa-video-card>:not([data-usa-part]):not(img):not(video):not([data-poster]){position:absolute;left:0;right:0;bottom:0;margin:0;padding:28px 12px 12px;background:linear-gradient(transparent,rgba(0,0,0,.7));font:700 14px/1.2 system-ui,sans-serif}usa-video-card .usa-vc-play{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.9) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 7l9 5-9 5z' fill='%230f172a'/%3E%3C/svg%3E\") center/22px no-repeat;box-shadow:0 6px 18px rgba(0,0,0,.35);transition:transform .3s,opacity .3s;z-index:1}usa-video-card[data-previewing] .usa-vc-play{transform:scale(.7);opacity:0}usa-video-card .usa-vc-time:not(:empty){position:absolute;right:8px;top:8px;padding:2px 6px;border-radius:5px;background:rgba(0,0,0,.65);font:600 11px/1.4 system-ui,sans-serif;z-index:1}usa-video-card .usa-vc-bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.2);z-index:1}usa-video-card .usa-vc-bar i{display:block;height:100%;background:#ef4444;transform:scaleX(var(--p,0));transform-origin:0 50%}usa-video-card:focus-visible{box-shadow:0 0 0 3px #6366f1}@media (prefers-reduced-motion:reduce){usa-video-card *{transition:none!important}}";

const fmt = (s) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '');
function defineVideoCard(tag = 'usa-video-card') {
    return base.defineElement(tag, (Base) => {
        class UsaVideoCard extends Base {
            constructor() {
                super(...arguments);
                this._on = false;
            }
            static get observedAttributes() {
                return ['label', 'duration'];
            }
            get previewing() {
                return this._on;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'button');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                const title = this.querySelector('[data-title], h3, h4, figcaption')?.textContent?.trim();
                this.setAttribute('aria-label', this.str('label', title ? `Play ${title}` : 'Play video'));
                const v = this.querySelector(':scope video, :scope > .usa-vc-media video');
                if (v) {
                    v.muted = true;
                    v.playsInline = true;
                    v.loop = true;
                    v.preload = v.preload || 'metadata';
                    v.setAttribute('aria-hidden', 'true');
                    v.tabIndex = -1;
                }
                const dur = this.str('duration');
                this.insertAdjacentHTML('beforeend', `<span class="usa-vc-play" aria-hidden="true" data-usa-part></span><span class="usa-vc-time" data-usa-part>${dur}</span><span class="usa-vc-bar" aria-hidden="true" data-usa-part><i></i></span>`);
                const time = this.querySelector('.usa-vc-time');
                const bar = this.querySelector('.usa-vc-bar i');
                if (v && !dur)
                    this.listen(v, 'loadedmetadata', () => (time.textContent = fmt(v.duration)));
                if (v)
                    this.listen(v, 'timeupdate', () => v.duration && bar.style.setProperty('--p', String(v.currentTime / v.duration)));
                const start = () => {
                    if (this._on || this.reduced)
                        return;
                    this._on = true;
                    this.setAttribute('data-previewing', '');
                    const p = v?.play?.();
                    if (p && typeof p.catch === 'function')
                        p.catch(() => this.setAttribute('data-noplay', ''));
                    if (!v)
                        this.setAttribute('data-noplay', '');
                };
                const stop = () => {
                    if (!this._on)
                        return;
                    this._on = false;
                    this.removeAttribute('data-previewing');
                    if (v) {
                        v.pause?.();
                        try {
                            v.currentTime = 0;
                        }
                        catch {
                            /* not loaded */
                        }
                    }
                    bar.style.setProperty('--p', '0');
                };
                this.listen(this, 'pointerenter', start);
                this.listen(this, 'pointerleave', stop);
                this.listen(this, 'focusin', start);
                this.listen(this, 'focusout', stop);
                this.listen(this, 'click', () => this.emit('open', { src: v?.currentSrc || v?.getAttribute('src') || '' }));
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.emit('open', { src: v?.currentSrc || v?.getAttribute('src') || '' });
                    }
                });
                this.onCleanup(stop);
            }
        }
        return UsaVideoCard;
    }, { id: 'video-card', text: css });
}

exports.defineVideoCard = defineVideoCard;
//# sourceMappingURL=video-card.cjs.map
