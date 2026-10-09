'use strict';

var base = require('../chunks/base-DBheNxJu.cjs');
var components_fxLottie = require('../components/fx-lottie.cjs');
require('../chunks/registry-xQZnSqqV.cjs');

var css = "usa-lottie{display:inline-block;line-height:0;max-width:100%}usa-lottie .usa-lt-svg{max-width:100%;height:auto;overflow:visible}usa-lottie [data-layer]{transform-box:view-box;transform-origin:0 0}";

function defineLottie(tag = 'usa-lottie') {
    return base.defineElement(tag, (Base) => {
        class UsaLottie extends Base {
            constructor() {
                super(...arguments);
                this._json = null;
                this._m = null;
                this._anims = [];
            }
            static get observedAttributes() {
                return ['src', 'loop', 'speed', 'label'];
            }
            get json() {
                return this._json;
            }
            set json(v) {
                this._json = typeof v === 'string' ? JSON.parse(v) : v;
                if (this.isConnected)
                    this.changed('json');
            }
            get parsed() {
                return this._m;
            }
            mount() {
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', this.str('label', 'Animation'));
                const src = this.str('src');
                if (this._json)
                    this.render(this._json);
                else if (src && typeof fetch !== 'undefined')
                    fetch(src)
                        .then((r) => r.json())
                        .then((j) => this.isConnected && this.str('src') === src && ((this._json = j), this.render(j)))
                        .catch(() => this.emit('error', { src }));
                this.onCleanup(() => this.stop());
            }
            render(j) {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._m = components_fxLottie.lottieToKeyframes(j);
                this.insertAdjacentHTML('beforeend', components_fxLottie.lottieToSvg(j).replace('<svg ', '<svg data-usa-part class="usa-lt-svg" '));
                this.emit('load', { duration: this._m.duration, layers: this._m.layers.length });
                this.frame(0);
                if (this.hasAttribute('autoplay') && !this.reduced)
                    this.inView((v) => {
                        if (v)
                            this.play();
                        else
                            this.pause();
                    });
            }
            frame(i) {
                this._m?.layers.forEach((l) => {
                    const g = this.querySelector(`[data-layer="${l.index}"]`);
                    const k = l.keyframes[i] || l.keyframes[0];
                    if (g && k) {
                        g.style.transform = String(k.transform || '');
                        if (k.opacity != null)
                            g.style.opacity = String(k.opacity);
                    }
                });
            }
            play() {
                if (!this._m || this.reduced)
                    return;
                if (this._anims.length) {
                    this._anims.forEach((a) => a.play());
                    return;
                }
                const iterations = this.hasAttribute('loop') ? Infinity : 1;
                const rate = Math.max(0.1, this.num('speed', 1));
                this._anims = this._m.layers
                    .map((l) => {
                    const g = this.querySelector(`[data-layer="${l.index}"]`);
                    const a = g ? this.motion(g, l.keyframes, { duration: this._m.duration / rate, iterations, fill: 'both' }) : null;
                    return a;
                })
                    .filter(Boolean);
                const first = this._anims[0];
                if (first && iterations === 1)
                    first.finished.then(() => this.emit('complete'), () => undefined);
            }
            pause() {
                this._anims.forEach((a) => a.pause());
            }
            stop() {
                this._anims.splice(0).forEach((a) => a.cancel());
                this.frame(0);
            }
        }
        return UsaLottie;
    }, { id: 'lottie', text: css });
}

exports.defineLottie = defineLottie;
//# sourceMappingURL=lottie.cjs.map
