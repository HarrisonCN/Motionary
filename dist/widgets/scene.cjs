'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var components_fxCinema = require('../components/fx-cinema.cjs');
require('../chunks/registry-BB1oO-lR.cjs');

var css = "usa-scene{position:relative;display:block;overflow:hidden;border-radius:14px;background:#000;color:#fff;isolation:isolate}usa-scene>.usa-scene-media{display:block;width:100%;height:100%;object-fit:cover;transform-origin:50% 50%;will-change:transform}usa-scene>[data-caption]{position:absolute;left:5%;right:5%;bottom:8%;margin:0;font:700 clamp(15px,2.4vw,24px)/1.25 system-ui,sans-serif;text-shadow:0 2px 12px rgba(0,0,0,.7);opacity:0;transform:translateY(10px);transition:opacity .6s,transform .6s}usa-scene>[data-caption][data-shown]{opacity:1;transform:none}@media (prefers-reduced-motion:reduce){usa-scene>[data-caption]{transition:none}}";

function defineScene(tag = 'usa-scene') {
    return base.defineElement(tag, (Base) => {
        class UsaScene extends Base {
            constructor() {
                super(...arguments);
                this._p = 0;
            }
            static get observedAttributes() {
                return ['camera', 'strength', 'autoplay'];
            }
            get progress() {
                return this._p;
            }
            media() {
                return this.querySelector(':scope > [data-shot], :scope > img, :scope > video, :scope > picture');
            }
            mount() {
                const move = components_fxCinema.CAMERA_MOVES.includes(this.str('camera')) ? this.str('camera') : 'dolly-in';
                this.setAttribute('data-camera', move);
                const m = this.media();
                m?.classList.add('usa-scene-media');
                const caps = Array.from(this.querySelectorAll(':scope > [data-caption]'));
                if (this.reduced) {
                    caps.forEach((c) => c.setAttribute('data-shown', ''));
                    return;
                }
                if (this.hasAttribute('autoplay')) {
                    caps.forEach((c) => c.setAttribute('data-shown', ''));
                    const st = this.num('strength', 1);
                    this.inView((v) => {
                        m?.getAnimations?.().forEach((a) => a.cancel());
                        if (v && m)
                            this.motion(m, [0, 0.25, 0.5, 0.75, 1].map((p) => ({ transform: components_fxCinema.cameraFrame(move, p, st) })), { duration: 7000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
                    });
                    return;
                }
                let stop = null;
                this.inView((v) => {
                    stop?.();
                    stop = null;
                    if (!v)
                        return;
                    let last = -1;
                    stop = base.onFrame(() => {
                        const r = this.getBoundingClientRect();
                        const vh = innerHeight || 1;
                        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
                        if (Math.abs(p - last) < 0.001)
                            return;
                        last = p;
                        this.setProgress(p, move);
                    });
                });
                this.onCleanup(() => stop?.());
            }
            /** Render the shot at progress `p` (0–1) — also used by tests / scroll timelines. */
            setProgress(p, move = this.getAttribute('data-camera') || 'dolly-in') {
                this._p = Math.min(1, Math.max(0, p));
                const m = this.media();
                if (m)
                    m.style.transform = components_fxCinema.cameraFrame(move, this._p, this.num('strength', 1));
                this.querySelectorAll(':scope > [data-caption]').forEach((c) => this.setFlagOn(c, this._p >= Number(c.dataset.at ?? 0.3)));
                this.emit('shot', { progress: this._p });
            }
            setFlagOn(el, on) {
                if (on)
                    el.setAttribute('data-shown', '');
                else
                    el.removeAttribute('data-shown');
            }
        }
        return UsaScene;
    }, { id: 'scene', text: css });
}

exports.defineScene = defineScene;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/widgets/scene.cjs.map