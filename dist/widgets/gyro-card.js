import { f as defineElement } from '../chunks/base-BTev8qxg.js';
import { orientationToTilt } from '../components/fx-gesture.js';
import '../chunks/registry-BKzyg1JV.js';

var css = "usa-gyro-card{position:relative;display:block;box-sizing:border-box;padding:22px;border-radius:18px;color:#fff;background:linear-gradient(135deg,#6366f1,#ec4899);box-shadow:0 18px 40px -20px rgba(79,70,229,.8);transform:perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transform-style:preserve-3d;transition:transform .25s ease-out;will-change:transform;overflow:hidden}usa-gyro-card [data-depth]{display:block;transform:translateZ(calc(var(--depth-k,14px) * var(--d,1)))}usa-gyro-card [data-depth=\"2\"]{--d:2}usa-gyro-card [data-depth=\"3\"]{--d:3}usa-gyro-card .usa-gy-glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at var(--gx,50%) var(--gy,30%),rgba(255,255,255,.4),transparent 55%);opacity:.5;transition:opacity .3s}usa-gyro-card[data-tilted] .usa-gy-glare{opacity:1}@media (prefers-reduced-motion:reduce){usa-gyro-card{transform:none;transition:none}}";

function defineGyroCard(tag = 'usa-gyro-card') {
    return defineElement(tag, (Base) => {
        class UsaGyroCard extends Base {
            constructor() {
                super(...arguments);
                this._src = 'none';
            }
            static get observedAttributes() {
                return ['max', 'glare'];
            }
            get source() {
                return this._src;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                if (this.str('glare') !== 'false')
                    this.insertAdjacentHTML('beforeend', '<span class="usa-gy-glare" aria-hidden="true" data-usa-part></span>');
                if (this.reduced)
                    return;
                const max = Math.max(1, Math.min(40, this.num('max', 15)));
                this.listen(this, 'pointermove', (e) => {
                    if (this._src === 'gyro' || e.pointerType === 'touch')
                        return;
                    const r = this.getBoundingClientRect();
                    if (!r.width || !r.height)
                        return;
                    const px = (e.clientX - r.left) / r.width - 0.5;
                    const py = (e.clientY - r.top) / r.height - 0.5;
                    this.tilt(-py * 2 * max, px * 2 * max, 'pointer');
                });
                this.listen(this, 'pointerleave', () => {
                    if (this._src === 'pointer')
                        this.tilt(0, 0, 'pointer');
                });
                if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
                    let active = false;
                    const on = () => {
                        if (active)
                            return;
                        active = true;
                        this.inView((v) => {
                            if (v)
                                this.listen(window, 'deviceorientation', (e) => {
                                    if (e.beta == null || e.gamma == null)
                                        return;
                                    const t = orientationToTilt(e.beta, e.gamma, max);
                                    this.tilt(t.rx, t.ry, 'gyro');
                                });
                        });
                    };
                    const DOE = window.DeviceOrientationEvent;
                    if (typeof DOE.requestPermission === 'function') {
                        this.listen(this, 'click', () => {
                            if (!active)
                                DOE.requestPermission().then((s) => s === 'granted' && on(), () => undefined);
                        });
                    }
                    else
                        on();
                }
            }
            wobble() {
                if (this.reduced)
                    return null;
                const m = Math.max(1, Math.min(40, this.num('max', 15)));
                const f = (x, y) => ({ transform: `perspective(800px) rotateX(${x}deg) rotateY(${y}deg)` });
                return this.motion(this, [f(0, 0), f(-m, m), f(m * 0.6, -m * 0.8), f(-m * 0.3, m * 0.4), f(0, 0)], { duration: 1100, easing: 'ease-in-out' });
            }
            tilt(rx, ry, source = 'none') {
                this._src = (['gyro', 'pointer'].includes(source) ? source : 'none');
                this.style.setProperty('--rx', `${rx.toFixed(1)}deg`);
                this.style.setProperty('--ry', `${ry.toFixed(1)}deg`);
                this.style.setProperty('--gx', `${50 + ry * 2}%`);
                this.style.setProperty('--gy', `${50 - rx * 2}%`);
                this.setFlag('data-tilted', Math.abs(rx) + Math.abs(ry) > 0.5);
                this.emit('tilt', { rx, ry, source: this._src });
            }
        }
        return UsaGyroCard;
    }, { id: 'gyro-card', text: css });
}

export { defineGyroCard };
//# sourceMappingURL=gyro-card.js.map
