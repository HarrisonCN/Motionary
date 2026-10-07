import { d as defineElement, b as caf, r as raf } from '../chunks/base-CFtnmfli.js';
export { c as configureComponents, p as prefersReducedMotion } from '../chunks/base-CFtnmfli.js';

var css$4 = "usa-aurora{position:relative;display:block;isolation:isolate;overflow:hidden}usa-aurora .usa-aurora-layer{position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:var(--usa-aurora-opacity,0.7);overflow:hidden;contain:strict}usa-aurora .usa-aurora-layer i{position:absolute;display:block;width:70%;aspect-ratio:1;border-radius:50%;background:radial-gradient(closest-side,var(--c),transparent);will-change:transform;animation:usa-aurora-a var(--usa-aurora-speed,18s) ease-in-out infinite alternate}usa-aurora .usa-aurora-layer i:nth-child(1){left:-15%;top:-30%}usa-aurora .usa-aurora-layer i:nth-child(2){right:-20%;top:-10%;animation-name:usa-aurora-b;animation-duration:calc(var(--usa-aurora-speed,18s) * 1.3)}usa-aurora .usa-aurora-layer i:nth-child(3){left:10%;bottom:-45%;animation-name:usa-aurora-c;animation-duration:calc(var(--usa-aurora-speed,18s) * 0.9)}usa-aurora .usa-aurora-layer i:nth-child(4){right:0;bottom:-30%;width:50%;animation-name:usa-aurora-b;animation-direction:alternate-reverse}usa-aurora[paused] .usa-aurora-layer i,usa-aurora[data-offscreen] .usa-aurora-layer i{animation-play-state:paused}@keyframes usa-aurora-a{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(30%,20%,0) scale(1.25)}}@keyframes usa-aurora-b{from{transform:translate3d(0,0,0) scale(1.1)}to{transform:translate3d(-35%,25%,0) scale(0.85)}}@keyframes usa-aurora-c{from{transform:translate3d(0,0,0) rotate(0deg) scale(1)}to{transform:translate3d(25%,-30%,0) rotate(40deg) scale(1.2)}}@media (prefers-reduced-motion:reduce){usa-aurora .usa-aurora-layer i,usa-grain .usa-grain-layer,usa-acrylic::after{animation:none !important}}";

function defineAurora(tag = 'usa-aurora') {
    return defineElement(tag, (Base) => class UsaAurora extends Base {
        constructor() {
            super(...arguments);
            this._layer = null;
        }
        static get observedAttributes() {
            return ['colors', 'speed', 'intensity'];
        }
        mount() {
            if (!this._layer) {
                this._layer = document.createElement('div');
                this._layer.className = 'usa-aurora-layer';
                this._layer.setAttribute('aria-hidden', 'true');
                this._layer.innerHTML = '<i></i><i></i><i></i><i></i>';
                this.prepend(this._layer);
            }
            const colors = this.str('colors', '#7c5cff,#22d3ee,#f472b6,#34d399').split(',').map((c) => c.trim()).filter(Boolean);
            Array.from(this._layer.children).forEach((blob, i) => {
                blob.style.setProperty('--c', colors[i % colors.length]);
            });
            const speed = this.num('speed', 1);
            this.style.setProperty('--usa-aurora-speed', `${(18 / Math.max(0.05, speed)).toFixed(2)}s`);
            this.style.setProperty('--usa-aurora-opacity', String(this.num('intensity', 0.7)));
            this.inView((v) => this.toggleAttribute('data-offscreen', !v));
        }
    }, { id: 'aurora', text: css$4 });
}

var css$3 = "usa-particles{position:relative;display:block;min-height:120px;overflow:hidden}usa-particles>canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}";

function defineParticles(tag = 'usa-particles') {
    return defineElement(tag, (Base) => class UsaParticles extends Base {
        constructor() {
            super(...arguments);
            this._canvas = null;
            this._ctx = null;
            this._ps = [];
            this._frame = 0;
            this._w = 0;
            this._h = 0;
            this._visible = false;
            this._mx = -1e4;
            this._color = '#888';
            this._my = -1e4;
        }
        static get observedAttributes() {
            return ['count', 'color', 'size', 'speed', 'links', 'interactive', 'paused'];
        }
        mount() {
            if (!this._canvas) {
                this._canvas = document.createElement('canvas');
                this._canvas.setAttribute('aria-hidden', 'true');
                this.prepend(this._canvas);
            }
            this._ctx = this._canvas.getContext?.('2d') ?? null;
            if (!this._ctx)
                return;
            this.resize();
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => {
                    this.resize();
                    if (!this._frame)
                        this.draw();
                });
                ro.observe(this);
                this.onCleanup(() => ro.disconnect());
            }
            this.inView((v) => {
                this._visible = v;
                this.loop();
            });
            this.listen(document, 'visibilitychange', () => this.loop());
            if (this.flag('interactive')) {
                this.listen(window, 'pointermove', (e) => {
                    const r = this.getBoundingClientRect();
                    this._mx = e.clientX - r.left;
                    this._my = e.clientY - r.top;
                }, { passive: true });
            }
            this.draw();
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
        reset() {
            this._ps = [];
            this.resize();
            this.draw();
        }
        resize() {
            const c = this._canvas;
            if (!c || !this._ctx)
                return;
            const w = this.clientWidth || 300;
            const h = this.clientHeight || 150;
            const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
            c.width = Math.round(w * dpr);
            c.height = Math.round(h * dpr);
            this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this._w = w;
            this._h = h;
            this._color = this.getAttribute('color') || (typeof getComputedStyle === 'function' ? getComputedStyle(this).color : '') || '#888';
            const want = Math.round(Math.min(1, (w * h) / (900 * 500)) * Math.max(1, this.num('count', 60))) || 1;
            const speed = this.num('speed', 0.35);
            const size = this.num('size', 2.2);
            while (this._ps.length < want) {
                const a = Math.random() * Math.PI * 2;
                const s = speed * (0.3 + Math.random() * 0.7);
                this._ps.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 0.6 + Math.random() * (size - 0.6) });
            }
            this._ps.length = want;
        }
        loop() {
            const run = this._visible && !this.reduced && !this.flag('paused') && !(typeof document !== 'undefined' && document.hidden);
            if (run && !this._frame) {
                const tick = () => {
                    this.step();
                    this.draw();
                    this._frame = raf(tick);
                };
                this._frame = raf(tick);
            }
            else if (!run && this._frame) {
                caf(this._frame);
                this._frame = 0;
            }
        }
        step() {
            const { _w: w, _h: h } = this;
            for (const p of this._ps) {
                const dx = p.x - this._mx;
                const dy = p.y - this._my;
                const d2 = dx * dx + dy * dy;
                if (d2 < 8100 && d2 > 0.01) {
                    const f = (1 - Math.sqrt(d2) / 90) * 0.6;
                    p.x += (dx / Math.sqrt(d2)) * f;
                    p.y += (dy / Math.sqrt(d2)) * f;
                }
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -5)
                    p.x = w + 5;
                else if (p.x > w + 5)
                    p.x = -5;
                if (p.y < -5)
                    p.y = h + 5;
                else if (p.y > h + 5)
                    p.y = -5;
            }
        }
        draw() {
            const ctx = this._ctx;
            if (!ctx)
                return;
            const color = this._color;
            ctx.clearRect(0, 0, this._w, this._h);
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            const ps = this._ps;
            const link = this.num('links', 110);
            if (link > 0) {
                const l2 = link * link;
                ctx.lineWidth = 0.6;
                for (let i = 0; i < ps.length; i++) {
                    for (let j = i + 1; j < ps.length; j++) {
                        const dx = ps[i].x - ps[j].x;
                        const dy = ps[i].y - ps[j].y;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < l2) {
                            ctx.globalAlpha = (1 - d2 / l2) * 0.35;
                            ctx.beginPath();
                            ctx.moveTo(ps[i].x, ps[i].y);
                            ctx.lineTo(ps[j].x, ps[j].y);
                            ctx.stroke();
                        }
                    }
                }
            }
            ctx.globalAlpha = 0.85;
            for (const p of ps) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }, { id: 'particles', text: css$3 });
}

var css$2 = "usa-grain{position:relative;display:block;isolation:isolate;overflow:hidden}usa-grain .usa-grain-layer{position:absolute;inset:-100%;z-index:1;pointer-events:none}usa-grain[animated] .usa-grain-layer{animation:usa-grain 0.8s steps(10) infinite}@keyframes usa-grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-8%)}20%{transform:translate(-12%,4%)}30%{transform:translate(6%,-16%)}40%{transform:translate(-4%,18%)}50%{transform:translate(-12%,8%)}60%{transform:translate(14%,0)}70%{transform:translate(0,12%)}80%{transform:translate(3%,25%)}90%{transform:translate(-8%,8%)}}";

const noise = (freq) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.6 -0.3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
function defineGrain(tag = 'usa-grain') {
    return defineElement(tag, (Base) => class UsaGrain extends Base {
        constructor() {
            super(...arguments);
            this._layer = null;
        }
        static get observedAttributes() {
            return ['opacity', 'blend', 'scale'];
        }
        mount() {
            if (!this._layer) {
                this._layer = document.createElement('div');
                this._layer.className = 'usa-grain-layer';
                this._layer.setAttribute('aria-hidden', 'true');
                this.append(this._layer);
            }
            const s = this._layer.style;
            s.backgroundImage = noise(0.8);
            s.backgroundSize = `${this.num('scale', 180)}px`;
            s.opacity = String(this.num('opacity', 0.12));
            s.mixBlendMode = this.str('blend', 'overlay');
        }
    }, { id: 'grain', text: css$2 });
}

var css$1 = "usa-marquee{--usa-marquee-gap:32px;display:block;overflow:hidden;contain:content}usa-marquee[fade]{-webkit-mask:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)}usa-marquee[fade][data-vertical]{-webkit-mask:linear-gradient(180deg,transparent,#000 12%,#000 88%,transparent);mask:linear-gradient(180deg,transparent,#000 12%,#000 88%,transparent)}usa-marquee .usa-marquee-track{display:flex;width:max-content;gap:var(--usa-marquee-gap);will-change:transform}usa-marquee .usa-marquee-group{display:flex;flex:none;align-items:center;gap:var(--usa-marquee-gap)}usa-marquee[data-vertical] .usa-marquee-track,usa-marquee[data-vertical] .usa-marquee-group{flex-direction:column;width:auto}usa-marquee[data-vertical]{height:var(--usa-marquee-height,240px)}usa-marquee[data-static]{overflow:auto;scrollbar-width:thin}";

function defineMarquee(tag = 'usa-marquee') {
    return defineElement(tag, (Base) => class UsaMarquee extends Base {
        constructor() {
            super(...arguments);
            this._track = null;
            this._anim = null;
            this._hover = false;
            this._visible = true;
            this._size = 0;
        }
        static get observedAttributes() {
            return ['speed', 'direction', 'gap', 'paused'];
        }
        get vertical() {
            const d = this.str('direction', 'left');
            return d === 'up' || d === 'down';
        }
        mount() {
            if (!this._track) {
                const track = document.createElement('div');
                track.className = 'usa-marquee-track';
                const group = document.createElement('div');
                group.className = 'usa-marquee-group';
                group.append(...Array.from(this.childNodes));
                track.append(group);
                this.append(track);
                this._track = track;
            }
            this.toggleAttribute('data-vertical', this.vertical);
            this.style.setProperty('--usa-marquee-gap', `${this.num('gap', 32)}px`);
            if (this.reduced) {
                this.setAttribute('data-static', '');
                this.syncClones(1);
                return;
            }
            this.removeAttribute('data-static');
            this.build();
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => this.build());
                ro.observe(this._track.firstElementChild);
                this.onCleanup(() => ro.disconnect());
            }
            this.inView((v) => {
                this._visible = v;
                this.sync();
            });
            this.listen(this, 'pointerenter', () => ((this._hover = true), this.sync()));
            this.listen(this, 'pointerleave', () => ((this._hover = false), this.sync()));
            this.listen(this, 'focusin', () => ((this._hover = true), this.sync()));
            this.listen(this, 'focusout', () => ((this._hover = false), this.sync()));
        }
        unmount() {
            this._anim?.cancel();
            this._anim = null;
            this._size = 0;
        }
        syncClones(n) {
            const track = this._track;
            const group = track.firstElementChild;
            while (track.children.length > n)
                track.lastElementChild.remove();
            while (track.children.length < n) {
                const clone = group.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.setAttribute('inert', '');
                track.append(clone);
            }
        }
        build() {
            const track = this._track;
            const group = track.firstElementChild;
            const vertical = this.vertical;
            const gap = this.num('gap', 32);
            const measured = vertical ? group.offsetHeight : group.offsetWidth;
            if (!measured)
                return; // not laid out yet: the ResizeObserver calls back
            const size = measured + gap;
            if (this._anim && this._size === size)
                return;
            this._size = size;
            const box = (vertical ? this.clientHeight : this.clientWidth) || size;
            // Enough copies to cover the box twice
            this.syncClones(Math.min(50, Math.max(2, Math.ceil(box / size) + 1)));
            const progress = this._anim?.effect?.getComputedTiming().progress ?? 0;
            this._anim?.cancel();
            const axis = vertical ? 'Y' : 'X';
            const reverse = ['right', 'down'].includes(this.str('direction', 'left'));
            const frames = [{ transform: `translate${axis}(0)` }, { transform: `translate${axis}(${-size}px)` }];
            this._anim = this.motion(track, reverse ? frames.reverse() : frames, {
                duration: (Math.max(1, size) / Math.max(1, this.num('speed', 50))) * 1000,
                iterations: Infinity,
            });
            if (this._anim && progress)
                this._anim.currentTime = progress * Number(this._anim.effect?.getTiming().duration || 0);
            this.sync();
        }
        sync() {
            const a = this._anim;
            if (!a)
                return;
            const stop = this.flag('paused') || !this._visible || (this._hover && this.flag('pause-on-hover'));
            if (stop && a.playState === 'running')
                a.pause();
            else if (!stop && a.playState === 'paused')
                a.play();
        }
        pause() {
            this.setAttribute('paused', '');
        }
        resume() {
            this.removeAttribute('paused');
        }
        changed(name) {
            if (name === 'paused')
                this.sync();
            else
                super.changed(name);
        }
    }, { id: 'marquee', text: css$1 });
}

var css = "usa-acrylic{--usa-acrylic-tint:#f3f3f3;--usa-acrylic-opacity:55%;--usa-acrylic-blur:30px;position:relative;display:block;isolation:isolate;overflow:hidden;background-color:color-mix(in srgb,var(--usa-acrylic-tint) var(--usa-acrylic-opacity),transparent);-webkit-backdrop-filter:blur(var(--usa-acrylic-blur)) saturate(1.6);backdrop-filter:blur(var(--usa-acrylic-blur)) saturate(1.6);border:1px solid color-mix(in srgb,#fff 22%,transparent)}@media (prefers-color-scheme:dark){usa-acrylic{--usa-acrylic-tint:#2c2c2c}}usa-acrylic::before{content:\"\";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:0.035;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")}usa-acrylic::after{content:\"\";position:absolute;inset:0;z-index:1;pointer-events:none;transform:translateX(-120%);background:linear-gradient(105deg,transparent 30%,rgb(255 255 255 / 0.28) 50%,transparent 70%)}usa-acrylic[shimmer=\"hover\"]:hover::after,usa-acrylic[data-shine]::after{animation:usa-acrylic-shine 1.1s cubic-bezier(0.22,1,0.36,1) both}@keyframes usa-acrylic-shine{from{transform:translateX(-120%)}to{transform:translateX(120%)}}usa-acrylic[variant=\"mica\"]{--usa-acrylic-opacity:80%;-webkit-backdrop-filter:none;backdrop-filter:none;background:linear-gradient(color-mix(in srgb,var(--usa-acrylic-tint) var(--usa-acrylic-opacity),transparent),color-mix(in srgb,var(--usa-acrylic-tint) var(--usa-acrylic-opacity),transparent)),var(--usa-mica-source,linear-gradient(135deg,#b8c6ff,#ffd6e8));border-color:transparent}@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){usa-acrylic{background-color:var(--usa-acrylic-tint)}}@media (prefers-reduced-transparency:reduce){usa-acrylic{background:var(--usa-acrylic-tint);-webkit-backdrop-filter:none;backdrop-filter:none}}@media (forced-colors:active){usa-acrylic{background:Canvas;-webkit-backdrop-filter:none;backdrop-filter:none;border-color:CanvasText}usa-acrylic::before,usa-acrylic::after{display:none}}";

function defineAcrylic(tag = 'usa-acrylic') {
    return defineElement(tag, (Base) => class UsaAcrylic extends Base {
        static get observedAttributes() {
            return ['tint', 'tint-opacity', 'blur', 'shimmer'];
        }
        mount() {
            const tint = this.getAttribute('tint');
            if (tint)
                this.style.setProperty('--usa-acrylic-tint', tint);
            else
                this.style.removeProperty('--usa-acrylic-tint');
            this.style.setProperty('--usa-acrylic-opacity', `${Math.round(this.num('tint-opacity', 0.55) * 100)}%`);
            this.style.setProperty('--usa-acrylic-blur', `${this.num('blur', 30)}px`);
            if (this.str('shimmer') === 'load' && !this.reduced) {
                this.removeAttribute('data-shine');
                void this.offsetWidth;
                this.setAttribute('data-shine', '');
            }
        }
    }, { id: 'acrylic', text: css });
}

/**
 * use-scroll-animate/components/background — backgrounds & decoration.
 * `<usa-aurora>`, `<usa-particles>`, `<usa-grain>`, `<usa-marquee>`,
 * `<usa-acrylic>`.
 */
/** Register every component of this category under its default tag. */
function defineBackgroundComponents() {
    defineAurora();
    defineParticles();
    defineGrain();
    defineMarquee();
    defineAcrylic();
}

export { defineAcrylic, defineAurora, defineBackgroundComponents, defineGrain, defineMarquee, defineParticles };
//# sourceMappingURL=background.js.map
