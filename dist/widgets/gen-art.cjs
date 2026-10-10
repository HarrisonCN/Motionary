'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var components_fxGenart = require('../components/fx-genart.cjs');
require('../chunks/registry-BB1oO-lR.cjs');

var css = "usa-gen-art{position:relative;display:block;min-height:120px;border-radius:12px;overflow:hidden;cursor:pointer;outline:none}usa-gen-art>canvas{display:block;width:100%;height:100%;position:absolute;inset:0}usa-gen-art:focus-visible{box-shadow:0 0 0 3px #6366f1}";

const ARTS = ['flow', 'circles', 'truchet', 'waves'];
function defineGenArt(tag = 'usa-gen-art') {
    return base.defineElement(tag, (Base) => {
        class UsaGenArt extends Base {
            constructor() {
                super(...arguments);
                this._seed = 1;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['art', 'seed', 'palette', 'label'];
            }
            get seed() {
                return this._seed;
            }
            canvas() {
                return this.querySelector(':scope > canvas');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._seed = this.num('seed', 1);
                const art = ARTS.includes(this.str('art')) ? this.str('art') : 'flow';
                this.setAttribute('data-art', art);
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', this.str('label', `Generative ${art} artwork, seed ${this._seed}`));
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this.insertAdjacentHTML('afterbegin', '<canvas data-usa-part></canvas>');
                this.listen(this, 'click', () => this.generate());
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.generate();
                    }
                });
                let drawn = false;
                this.inView((v) => {
                    if (v && !drawn) {
                        drawn = true;
                        this.draw();
                    }
                });
                this.onCleanup(() => cancelAnimationFrame(this._raf));
            }
            generate(seed = Math.floor(Math.random() * 1e6)) {
                this._seed = seed;
                this.setAttribute('aria-label', this.str('label', `Generative ${this.getAttribute('data-art')} artwork, seed ${seed}`));
                this.draw();
                this.emit('generate', { seed });
            }
            toDataURL(type = 'image/png') {
                return this.canvas()?.toDataURL(type) || '';
            }
            draw() {
                const c = this.canvas();
                const ctx = c?.getContext?.('2d');
                if (!c || !ctx)
                    return;
                cancelAnimationFrame(this._raf);
                const w = Math.max(60, Math.round(this.clientWidth || 300));
                const h = Math.max(60, Math.round(this.clientHeight || 180));
                const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
                c.width = w * dpr;
                c.height = h * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                const pal = components_fxGenart.PALETTES[this.str('palette')] || components_fxGenart.PALETTES.sunset;
                const r = components_fxGenart.seededRandom(this._seed);
                ctx.fillStyle = pal[pal.length - 1];
                ctx.fillRect(0, 0, w, h);
                const art = this.getAttribute('data-art');
                const steps = [];
                if (art === 'circles') {
                    const cs = [];
                    for (let i = 0; i < 900 && cs.length < 140; i++) {
                        const x = r() * w;
                        const y = r() * h;
                        let rad = 2 + r() * Math.min(w, h) * 0.14;
                        for (const [cx, cy, cr] of cs)
                            rad = Math.min(rad, Math.hypot(x - cx, y - cy) - cr - 1.5);
                        if (rad < 2)
                            continue;
                        cs.push([x, y, rad]);
                        const col = pal[Math.floor(r() * (pal.length - 1))];
                        steps.push(() => {
                            ctx.beginPath();
                            ctx.arc(x, y, rad, 0, Math.PI * 2);
                            ctx.fillStyle = col;
                            ctx.fill();
                        });
                    }
                }
                else if (art === 'truchet') {
                    const s = Math.max(16, Math.round(Math.min(w, h) / 8));
                    ctx.lineWidth = s / 5;
                    ctx.lineCap = 'round';
                    for (let y = 0; y < h; y += s)
                        for (let x = 0; x < w; x += s) {
                            const flip = r() > 0.5;
                            const col = pal[Math.floor(r() * (pal.length - 1))];
                            steps.push(() => {
                                ctx.strokeStyle = col;
                                ctx.beginPath();
                                if (flip) {
                                    ctx.arc(x, y, s / 2, 0, Math.PI / 2);
                                    ctx.moveTo(x + s, y + s / 2);
                                    ctx.arc(x + s, y + s, s / 2, -Math.PI / 2, Math.PI, true);
                                }
                                else {
                                    ctx.arc(x + s, y, s / 2, Math.PI / 2, Math.PI);
                                    ctx.moveTo(x + s / 2, y + s);
                                    ctx.arc(x, y + s, s / 2, 0, -Math.PI / 2, true);
                                }
                                ctx.stroke();
                            });
                        }
                }
                else if (art === 'waves') {
                    const n = 7;
                    for (let i = 0; i < n; i++) {
                        const base = (h / (n + 1)) * (i + 1);
                        const amp = 6 + r() * h * 0.08;
                        const f = 1 + r() * 3;
                        const ph = r() * Math.PI * 2;
                        const col = pal[i % (pal.length - 1)];
                        steps.push(() => {
                            ctx.beginPath();
                            ctx.moveTo(0, h);
                            for (let x = 0; x <= w; x += 4)
                                ctx.lineTo(x, base + Math.sin((x / w) * Math.PI * 2 * f + ph) * amp);
                            ctx.lineTo(w, h);
                            ctx.closePath();
                            ctx.fillStyle = col;
                            ctx.globalAlpha = 0.85;
                            ctx.fill();
                            ctx.globalAlpha = 1;
                        });
                    }
                }
                else {
                    const z = 0.004 + r() * 0.006;
                    const ph = r() * 10;
                    for (let i = 0; i < 160; i++) {
                        let x = r() * w;
                        let y = r() * h;
                        const col = pal[Math.floor(r() * (pal.length - 1))];
                        steps.push(() => {
                            ctx.strokeStyle = col;
                            ctx.lineWidth = 1.4;
                            ctx.globalAlpha = 0.8;
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            for (let k = 0; k < 40; k++) {
                                const a = (Math.sin(x * z + ph) + Math.cos(y * z - ph)) * Math.PI;
                                x += Math.cos(a) * 3;
                                y += Math.sin(a) * 3;
                                ctx.lineTo(x, y);
                            }
                            ctx.stroke();
                            ctx.globalAlpha = 1;
                        });
                    }
                }
                if (this.reduced || typeof requestAnimationFrame === 'undefined') {
                    steps.forEach((f) => f());
                    return;
                }
                const per = Math.max(1, Math.ceil(steps.length / 40));
                let i = 0;
                const tick = () => {
                    for (let k = 0; k < per && i < steps.length; k++)
                        steps[i++]();
                    if (i < steps.length)
                        this._raf = requestAnimationFrame(tick);
                };
                tick();
            }
        }
        return UsaGenArt;
    }, { id: 'gen-art', text: css });
}

exports.defineGenArt = defineGenArt;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/widgets/gen-art.cjs.map