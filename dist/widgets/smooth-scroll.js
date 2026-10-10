import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { r as runtimeModule } from '../chunks/runtime-link-CvJOTQYQ.js';
import '../chunks/registry-D3VGJOuX.js';

var css = "usa-smooth-scroll{display:contents}usa-smooth-scroll[data-wrapper]{display:block;overflow:auto;overscroll-behavior:contain;max-height:100%;-webkit-overflow-scrolling:touch}usa-smooth-scroll[data-wrapper].usa-smooth{scroll-behavior:auto}html.usa-smooth{scroll-behavior:auto}usa-smooth-scroll .usa-rt-missing{margin:0 0 8px;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}";

function defineSmoothScroll(tag = 'usa-smooth-scroll') {
    return defineElement(tag, (Base) => {
        class UsaSmoothScroll extends Base {
            constructor() {
                super(...arguments);
                this.s = null;
            }
            static get observedAttributes() {
                return ['lerp', 'duration', 'ease', 'wheel-multiplier', 'horizontal', 'touch', 'anchors', 'offset', 'wrapper', 'preview'];
            }
            get instance() {
                return this.s;
            }
            mount() {
                const api = runtimeModule(this, 'smooth');
                if (!api)
                    return;
                const wrapper = this.flag('wrapper');
                this.toggleAttribute('data-wrapper', wrapper);
                const anchors = this.getAttribute('anchors') === 'false' ? false : { offset: -this.num('offset', 0) }; // offset="64" stops 64 px above the target (sticky headers)
                const s = api.smoothScroll({
                    wrapper: wrapper ? this : undefined,
                    lerp: this.num('lerp', 0.1),
                    duration: this.num('duration', 0) || undefined,
                    ease: this.str('ease') || undefined,
                    wheelMultiplier: this.num('wheel-multiplier', 1),
                    orientation: this.flag('horizontal') ? 'horizontal' : 'vertical',
                    touch: this.flag('touch'),
                    anchors,
                    onScroll: (x) => {
                        this.style.setProperty('--usa-smooth-progress', x.progress.toFixed(4));
                        this.emit('scroll', { progress: x.progress, velocity: x.velocity });
                    },
                });
                this.s = s;
                this.dataset.active = String(s.active);
                this.onCleanup(() => {
                    s.destroy();
                    this.s = null;
                });
                this.emit('ready', { active: s.active });
                if (wrapper && this.flag('preview') && s.active) {
                    let dir = 1, user = false, timer = null;
                    const glide = () => {
                        if (user)
                            return;
                        s.scrollTo(dir > 0 ? s.limit : 0, { duration: 1600 });
                        dir = -dir;
                        timer = setTimeout(glide, 2400);
                    };
                    this.inView((v) => {
                        if (timer)
                            clearTimeout(timer);
                        timer = v ? setTimeout(glide, 300) : null;
                    });
                    this.listen(this, 'wheel', () => (user = true), { passive: true });
                    // contract-exempt: keyboard-click-only — pointer drag on top of native scrolling; keyboard scrolling stays native
                    this.listen(this, 'pointerdown', () => (user = true), { passive: true });
                    this.onCleanup(() => timer && clearTimeout(timer));
                }
            }
            glideTo(target, opts = {}) {
                this.s?.scrollTo(target, opts);
            }
            stop() {
                this.s?.stop();
            }
            resume() {
                this.s?.resume();
            }
        }
        return UsaSmoothScroll;
    }, { id: 'smooth-scroll', text: css });
}

export { defineSmoothScroll };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.0.0/dist/widgets/smooth-scroll.js.map