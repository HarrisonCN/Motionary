'use strict';

var base = require('./base-B3me2y0o.cjs');
var runtimeLink = require('./runtime-link-CyExCzuU.cjs');

var css = "usa-lottie-player{display:inline-block;width:240px;max-width:100%;vertical-align:middle}usa-lottie-player>canvas{display:block;width:100%;height:auto}usa-lottie-player .usa-rt-missing{margin:0 0 8px;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}";

function defineLottiePlayer(tag = 'usa-lottie-player') {
    return base.defineElement(tag, (Base) => {
        class UsaLottiePlayer extends Base {
            constructor() {
                super(...arguments);
                this.p = null;
                this.data = null;
                this.skipped = [];
            }
            static get observedAttributes() {
                return ['src', 'animation', 'autoplay', 'loop', 'speed', 'mode', 'segment', 'hover', 'scrub', 'fit', 'background', 'label'];
            }
            get player() {
                return this.p;
            }
            get animationData() {
                return this.data;
            }
            get unsupported() {
                return this.skipped.slice();
            }
            play() {
                this.p?.play();
            }
            pause() {
                this.p?.pause();
            }
            stop() {
                this.p?.pause();
                this.p?.seek(0);
            }
            seek(frame) {
                if (!this.p || !this.data)
                    return;
                this.p.pause();
                this.p.seek((frame / this.data.fr) * 1000);
            }
            mount() {
                const V = runtimeLink.runtimeModule(this, 'vector');
                if (!V)
                    return;
                const canvas = document.createElement('canvas');
                canvas.setAttribute('role', 'img');
                canvas.setAttribute('aria-label', this.str('label', 'Animation'));
                this.querySelector(':scope > canvas')?.remove();
                this.prepend(canvas);
                this.onCleanup(() => canvas.remove());
                const src = this.str('src');
                if (!src)
                    return;
                let alive = true;
                this.onCleanup(() => {
                    alive = false;
                    this.p?.kill();
                    this.p = null;
                });
                V.loadLottie(new URL(src, location.href).href, { animation: this.str('animation') || undefined })
                    .then(({ animation: source, images, dotLottie }) => {
                    if (!alive)
                        return;
                    const animationId = this.str('animation') || dotLottie?.manifest?.activeAnimationId || dotLottie?.manifest?.animations?.[0]?.id;
                    // 10.9: subclasses (<usa-dotlottie>) may theme the animation before it plays
                    const animation = this.prepareAnimation ? this.prepareAnimation(source, dotLottie, animationId) : source;
                    this.data = animation;
                    this.skipped = V.inspectLottie(animation).unsupported;
                    const dpr = Math.min(2, devicePixelRatio || 1);
                    const w = Math.max(1, Math.round((canvas.clientWidth || animation.w) * dpr));
                    canvas.width = w;
                    canvas.height = Math.round((w * animation.h) / animation.w);
                    const seg = this.str('segment');
                    const loopAttr = this.getAttribute('loop');
                    const opts = {
                        images,
                        autoplay: false,
                        loop: loopAttr === null ? false : loopAttr === '' || loopAttr === 'true' ? true : Math.max(0, Number(loopAttr) - 1) || true,
                        bounce: this.str('mode') === 'bounce',
                        speed: this.num('speed', 1),
                        fit: this.str('fit', 'contain') || 'contain',
                        background: this.str('background') || undefined,
                        segment: seg ? (/^\d/.test(seg) ? seg.split(/[\s,]+/).map(Number) : seg) : undefined,
                    };
                    const build = (a) => {
                        this.p?.kill();
                        const np = V.lottiePlayer(canvas, a, opts);
                        np.onComplete = () => {
                            this.emit('complete');
                            this.completed?.();
                        };
                        this.p = np;
                        this.data = a;
                        return np;
                    };
                    const p = build(animation);
                    this.emit('load', { frames: animation.op - animation.ip, fr: animation.fr, w: animation.w, h: animation.h, unsupported: this.skipped });
                    if (this.playerReady?.({ player: p, animation, dotLottie, canvas, rebuild: build, source, animationId }))
                        return;
                    if (this.reduced)
                        return;
                    if (this.flag('scrub')) {
                        const upd = () => {
                            const r = this.getBoundingClientRect();
                            p.progress = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
                        };
                        this.listen(window, 'scroll', upd, { passive: true });
                        upd();
                    }
                    else if (this.flag('hover')) {
                        this.listen(this, 'pointerenter', () => p.play());
                        this.listen(this, 'pointerleave', () => p.pause());
                    }
                    else if (this.flag('autoplay'))
                        this.inView((v) => (v ? p.play() : p.pause()));
                })
                    .catch((e) => alive && this.emit('error', { error: String(e?.message || e) }));
            }
        }
        return UsaLottiePlayer;
    }, { id: 'lottie-player', text: css });
}

exports.css = css;
exports.defineLottiePlayer = defineLottiePlayer;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/chunks/lottie-player-DGUpDJeC.cjs.map