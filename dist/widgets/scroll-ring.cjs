'use strict';

var base = require('../chunks/base-vu_KhBiv.cjs');
var scrollDriven = require('../chunks/scroll-driven-CQbwzCdn.cjs');

var css = "usa-scroll-ring{display:inline-block;width:var(--usa-ring-size,56px);height:var(--usa-ring-size,56px);color:var(--usa-ring-color,#6366f1);vertical-align:middle}usa-scroll-ring .usa-ring{all:unset;position:relative;display:grid;place-items:center;width:100%;height:100%;border-radius:50%;cursor:default;box-sizing:border-box}usa-scroll-ring button.usa-ring{cursor:pointer;transition:transform .2s cubic-bezier(.22,1,.36,1)}usa-scroll-ring button.usa-ring:hover{transform:scale(1.06)}usa-scroll-ring button.usa-ring:focus-visible{outline:2px solid currentColor;outline-offset:3px}usa-scroll-ring svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}usa-scroll-ring .usa-ring-track{stroke:var(--usa-ring-track,rgba(99,102,241,.16))}usa-scroll-ring .usa-ring-bar{stroke:currentColor;stroke-linecap:round;transition:stroke .3s}usa-scroll-ring[data-complete] .usa-ring-bar{stroke:var(--usa-ring-done,#10b981)}usa-scroll-ring .usa-ring-label{position:relative;font:700 calc(var(--usa-ring-size,56px)*.24)/1 ui-sans-serif,system-ui,sans-serif;color:var(--usa-ring-text,#1e1b4b);font-variant-numeric:tabular-nums}@keyframes usa-ring-fill{from{stroke-dashoffset:var(--usa-ring-c)}to{stroke-dashoffset:0}}@supports (animation-timeline:scroll()){usa-scroll-ring .usa-ring-native{animation:usa-ring-fill linear both}}@media (prefers-reduced-motion:reduce){usa-scroll-ring button.usa-ring{transition:none}}";

const NS = 'http://www.w3.org/2000/svg';
function defineScrollRing(tag = 'usa-scroll-ring') {
    return base.defineElement(tag, (Base) => {
        class UsaScrollRing extends Base {
            constructor() {
                super(...arguments);
                this.p = 0;
                this.eng = 'js';
            }
            static get observedAttributes() {
                return ['for', 'engine', 'label', 'back-to-top', 'size', 'thickness', 'horizontal', 'preview'];
            }
            get progress() {
                return this.p;
            }
            get engine() {
                return this.eng;
            }
            target() {
                const sel = this.str('for', 'page');
                if (sel === 'page')
                    return document.scrollingElement || document.documentElement;
                return (this.parentElement && base.queryAttr(sel, this.parentElement)) || base.queryAttr(sel) || document.scrollingElement || document.documentElement;
            }
            mount() {
                const size = this.num('size', 56), th = this.num('thickness', 5), r = (size - th) / 2, C = 2 * Math.PI * r;
                this.style.setProperty('--usa-ring-size', size + 'px');
                this.style.setProperty('--usa-ring-c', String(C));
                const svg = document.createElementNS(NS, 'svg');
                svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
                svg.setAttribute('aria-hidden', 'true');
                svg.innerHTML = `<circle class="usa-ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${th}" fill="none"/><circle class="usa-ring-bar" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${th}" fill="none" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
                const bar = svg.lastElementChild;
                const label = document.createElement('span');
                label.className = 'usa-ring-label';
                label.setAttribute('aria-hidden', 'true');
                const host = this.flag('back-to-top') ? document.createElement('button') : document.createElement('span');
                host.className = 'usa-ring';
                if (host instanceof HTMLButtonElement) {
                    host.type = 'button';
                    host.setAttribute('aria-label', 'Back to top');
                }
                host.append(svg, ...(this.flag('label') ? [label] : []));
                this.replaceChildren(host);
                this.setAttribute('role', host instanceof HTMLButtonElement ? 'group' : 'progressbar');
                if (!(host instanceof HTMLButtonElement)) {
                    this.setAttribute('aria-valuemin', '0');
                    this.setAttribute('aria-valuemax', '100');
                    this.setAttribute('aria-label', this.getAttribute('aria-label') || 'Scroll progress');
                }
                const tgt = this.target();
                const isDoc = tgt === document.scrollingElement || tgt === document.documentElement;
                const horiz = this.flag('horizontal');
                const scrollEv = isDoc ? window : tgt;
                this.eng = scrollDriven.pickEngine(this.str('engine', 'auto'));
                this.dataset.engine = this.eng;
                if (this.eng === 'native') {
                    const axis = horiz ? 'inline' : 'block';
                    if (isDoc)
                        bar.style.animationTimeline = `scroll(root ${axis})`;
                    else {
                        const name = scrollDriven.timelineName('usa-ring');
                        tgt.style.setProperty('scroll-timeline', `${name} ${axis}`);
                        scrollDriven.commonAncestor(this, tgt).style.setProperty('timeline-scope', name);
                        bar.style.animationTimeline = name;
                        this.onCleanup(() => {
                            tgt.style.removeProperty('scroll-timeline');
                            scrollDriven.commonAncestor(this, tgt).style.removeProperty('timeline-scope');
                        });
                    }
                    bar.classList.add('usa-ring-native');
                }
                let raf = 0, lastPct = -1;
                const update = () => {
                    raf = 0;
                    this.p = scrollDriven.scrollProgress(tgt, horiz);
                    const pct = Math.round(this.p * 100);
                    if (this.eng === 'js')
                        bar.setAttribute('stroke-dashoffset', String(C * (1 - this.p)));
                    if (pct !== lastPct) {
                        lastPct = pct;
                        label.textContent = pct + '%';
                        if (!(host instanceof HTMLButtonElement))
                            this.setAttribute('aria-valuenow', String(pct));
                        this.toggleAttribute('data-complete', pct >= 100);
                        this.emit('progress', { progress: this.p, percent: pct });
                    }
                };
                const onScroll = () => {
                    if (!raf)
                        raf = requestAnimationFrame(update);
                };
                this.listen(scrollEv, 'scroll', onScroll, { passive: true });
                this.listen(window, 'resize', onScroll, { passive: true });
                this.onCleanup(() => raf && cancelAnimationFrame(raf));
                update();
                if (host instanceof HTMLButtonElement)
                    this.listen(host, 'click', () => {
                        const opts = { [horiz ? 'left' : 'top']: 0, behavior: this.reduced ? 'auto' : 'smooth' };
                        (isDoc ? window : tgt).scrollTo(opts);
                        this.emit('top');
                    });
                if (this.flag('preview') && !isDoc && !this.reduced) {
                    let dir = 1, timer = null, user = false;
                    const el = tgt;
                    const glide = () => {
                        if (user)
                            return;
                        const max = horiz ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
                        el.scrollTo({ [horiz ? 'left' : 'top']: dir > 0 ? max : 0, behavior: 'smooth' });
                        dir = -dir;
                        timer = setTimeout(glide, 2200);
                    };
                    this.inView((v) => {
                        if (timer)
                            clearTimeout(timer);
                        timer = v ? setTimeout(glide, 300) : null;
                    });
                    const stopDemo = () => (user = true);
                    this.listen(el, 'wheel', stopDemo, { passive: true });
                    this.listen(el, 'touchstart', stopDemo, { passive: true });
                    this.onCleanup(() => timer && clearTimeout(timer));
                }
            }
        }
        return UsaScrollRing;
    }, { id: 'scroll-ring', text: css });
}

exports.defineScrollRing = defineScrollRing;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.1.0/dist/widgets/scroll-ring.cjs.map