import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { p as pickEngine, t as timelineName, v as viewProgress } from '../chunks/scroll-driven-LghshrWq.js';

var css = "usa-parallax-layers{position:relative;display:block;overflow:hidden;isolation:isolate}usa-parallax-layers [data-depth]{will-change:translate,transform;transition:transform .35s cubic-bezier(.22,1,.36,1)}@keyframes usa-plx-y{from{translate:0 calc(var(--usa-depth,0)*var(--usa-plx-range,120)*1px)}to{translate:0 calc(var(--usa-depth,0)*var(--usa-plx-range,120)*-1px)}}@keyframes usa-plx-x{from{translate:calc(var(--usa-depth,0)*var(--usa-plx-range,120)*1px) 0}to{translate:calc(var(--usa-depth,0)*var(--usa-plx-range,120)*-1px) 0}}@supports (animation-timeline:view()){usa-parallax-layers .usa-plx-native{animation:usa-plx-y linear both;animation-range:cover}usa-parallax-layers[data-horizontal] .usa-plx-native{animation-name:usa-plx-x}}@media (prefers-reduced-motion:reduce){usa-parallax-layers [data-depth]{transition:none;animation:none!important;translate:none!important}}";

function defineParallaxLayers(tag = 'usa-parallax-layers') {
    return defineElement(tag, (Base) => {
        class UsaParallaxLayers extends Base {
            constructor() {
                super(...arguments);
                this.p = 0;
            }
            static get observedAttributes() {
                return ['range', 'engine', 'horizontal', 'pointer', 'strength', 'preview'];
            }
            get progress() {
                return this.p;
            }
            layers() {
                return Array.from(this.querySelectorAll(':scope > [data-depth], :scope > * > [data-depth]'));
            }
            mount() {
                const layers = this.layers();
                const range = this.num('range', 120);
                const horiz = this.flag('horizontal');
                this.style.setProperty('--usa-plx-range', String(range));
                layers.forEach((l) => l.style.setProperty('--usa-depth', String(Number(l.dataset.depth) || 0)));
                this.toggleAttribute('data-horizontal', horiz);
                if (this.reduced) {
                    this.dataset.engine = 'static';
                    return;
                }
                const canScroll = document.documentElement.scrollHeight > innerHeight + 2;
                if (this.flag('preview') && !canScroll) {
                    this.dataset.engine = 'preview';
                    const anims = layers.map((l) => {
                        const d = (Number(l.dataset.depth) || 0) * range;
                        const t = (v) => (horiz ? `${v}px 0` : `0 ${v}px`);
                        return this.motion(l, [{ translate: t(d) }, { translate: t(-d) }], { duration: 3200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
                    });
                    this.onCleanup(() => anims.forEach((a) => a?.cancel()));
                }
                else {
                    const eng = pickEngine(this.str('engine', 'auto'), 'view');
                    this.dataset.engine = eng;
                    if (eng === 'native') {
                        const name = timelineName('usa-plx');
                        this.style.setProperty('view-timeline', `${name} block`);
                        layers.forEach((l) => {
                            l.classList.add('usa-plx-native');
                            l.style.animationTimeline = name;
                        });
                        this.onCleanup(() => layers.forEach((l) => l.classList.remove('usa-plx-native')));
                    }
                    let raf = 0;
                    const update = () => {
                        raf = 0;
                        this.p = viewProgress(this);
                        if (eng === 'js')
                            layers.forEach((l) => {
                                const v = (Number(l.dataset.depth) || 0) * range * (1 - 2 * this.p);
                                l.style.translate = horiz ? `${v.toFixed(2)}px 0` : `0 ${v.toFixed(2)}px`;
                            });
                        this.emit('progress', { progress: this.p });
                    };
                    const onScroll = () => {
                        if (!raf)
                            raf = requestAnimationFrame(update);
                    };
                    let visible = false;
                    this.inView((v) => {
                        visible = v;
                        if (v)
                            onScroll();
                    }, { rootMargin: '20% 0px' });
                    this.listen(window, 'scroll', () => visible && onScroll(), { passive: true });
                    this.listen(window, 'resize', onScroll, { passive: true });
                    this.onCleanup(() => raf && cancelAnimationFrame(raf));
                    update();
                }
                if (this.flag('pointer')) {
                    const s = this.num('strength', 14);
                    this.listen(this, 'pointermove', (e) => {
                        const r = this.getBoundingClientRect();
                        const dx = (e.clientX - r.left) / (r.width || 1) - 0.5, dy = (e.clientY - r.top) / (r.height || 1) - 0.5;
                        layers.forEach((l) => {
                            const d = Number(l.dataset.depth) || 0;
                            l.style.transform = `translate(${(-dx * s * d * 2).toFixed(2)}px, ${(-dy * s * d * 2).toFixed(2)}px)`;
                        });
                    });
                    this.listen(this, 'pointerleave', () => layers.forEach((l) => (l.style.transform = '')));
                }
                this.onCleanup(() => layers.forEach((l) => {
                    l.style.translate = '';
                    l.style.transform = '';
                    l.style.animationTimeline = '';
                }));
            }
        }
        return UsaParallaxLayers;
    }, { id: 'parallax-layers', text: css });
}

export { defineParallaxLayers };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.9.0/dist/widgets/parallax-layers.js.map