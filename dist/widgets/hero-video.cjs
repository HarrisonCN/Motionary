'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var components_fxVideo = require('../components/fx-video.cjs');
require('../chunks/registry-BB1oO-lR.cjs');

var css = "usa-hero-video{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:260px;padding:24px;overflow:hidden;border-radius:16px;color:#fff;isolation:isolate}usa-hero-video>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;opacity:0;transition:opacity .8s}usa-hero-video[data-ready]:not([data-poster-only])>video{opacity:1}usa-hero-video .usa-hv-poster{position:absolute;inset:-4%;z-index:-3;background:linear-gradient(135deg,#1e1b4b,#7c3aed 45%,#f472b6) center/cover no-repeat}usa-hero-video>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-3}usa-hero-video[data-poster-only] .usa-hv-poster{animation:usa-hv-kb 18s ease-in-out infinite alternate}usa-hero-video .usa-hv-scrim{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.6))}usa-hero-video .usa-hv-toggle{position:absolute;right:12px;top:12px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(0,0,0,.45) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M7 5h4v14H7zM13 5h4v14h-4z'/%3E%3C/svg%3E\") center/16px no-repeat;cursor:pointer}usa-hero-video[data-paused] .usa-hv-toggle{background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M8 5l11 7-11 7z'/%3E%3C/svg%3E\")}usa-hero-video .usa-hv-toggle:focus-visible{outline:2px solid #fff;outline-offset:2px}@keyframes usa-hv-kb{from{transform:scale(1)}to{transform:scale(1.08) translate(-2%,-1%)}}@media (prefers-reduced-motion:reduce){usa-hero-video .usa-hv-poster{animation:none!important}usa-hero-video>video{transition:none}}";

function defineHeroVideo(tag = 'usa-hero-video') {
    return base.defineElement(tag, (Base) => {
        class UsaHeroVideo extends Base {
            constructor() {
                super(...arguments);
                this._paused = false;
            }
            static get observedAttributes() {
                return ['label', 'scrub', 'poster'];
            }
            get paused() {
                return this._paused;
            }
            video() {
                return this.querySelector(':scope > video');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'region');
                this.setAttribute('aria-label', this.str('label', 'Hero'));
                const v = this.video();
                const poster = this.str('poster');
                this.insertAdjacentHTML('afterbegin', `<div class="usa-hv-poster" aria-hidden="true" data-usa-part${poster ? ` style="background-image:url('${poster.replace(/['")\\]/g, '')}')"` : ''}></div><div class="usa-hv-scrim" aria-hidden="true" data-usa-part></div>`);
                const scrub = this.hasAttribute('scrub');
                if (!scrub)
                    this.insertAdjacentHTML('beforeend', '<button type="button" class="usa-hv-toggle" aria-label="Pause background video" data-usa-part></button>');
                if (!v || this.reduced) {
                    this.setAttribute('data-poster-only', '');
                    this._paused = true;
                    v?.removeAttribute('autoplay');
                    v?.pause?.();
                    this.querySelector('.usa-hv-toggle')?.setAttribute('hidden', '');
                    return;
                }
                v.muted = true;
                v.playsInline = true;
                v.setAttribute('aria-hidden', 'true');
                this.listen(v, 'canplay', () => this.setAttribute('data-ready', ''));
                this.listen(v, 'error', () => this.setAttribute('data-poster-only', ''));
                if (scrub) {
                    v.loop = false;
                    this.onCleanup(components_fxVideo.scrubVideo(v, this));
                }
                else {
                    v.loop = true;
                    this.listen(this.querySelector('.usa-hv-toggle'), 'click', () => this.toggle());
                    this.inView((vis) => {
                        if (this._paused)
                            return;
                        if (vis)
                            v.play?.()?.catch?.(() => this.setAttribute('data-poster-only', ''));
                        else
                            v.pause?.();
                    });
                }
            }
            toggle() {
                const v = this.video();
                const b = this.querySelector('.usa-hv-toggle');
                this._paused = !this._paused;
                if (this._paused)
                    v?.pause?.();
                else
                    v?.play?.()?.catch?.(() => undefined);
                b?.setAttribute('aria-label', this._paused ? 'Play background video' : 'Pause background video');
                this.setFlag('data-paused', this._paused);
                this.emit(this._paused ? 'pause' : 'play');
            }
        }
        return UsaHeroVideo;
    }, { id: 'hero-video', text: css });
}

exports.defineHeroVideo = defineHeroVideo;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.0.0/dist/widgets/hero-video.cjs.map