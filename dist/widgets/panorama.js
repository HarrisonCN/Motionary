import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { xrSupport, yawToOffset } from '../components/fx-spatial.js';
import '../chunks/registry-CYojuxi5.js';

var css = "usa-panorama{position:relative;display:block;height:220px;border-radius:14px;overflow:hidden;background:#0f172a;cursor:grab;touch-action:pan-y;outline:none;-webkit-user-select:none;user-select:none}usa-panorama[data-dragging]{cursor:grabbing}usa-panorama:focus-visible{box-shadow:0 0 0 3px #6366f1}usa-panorama .usa-pano-view{position:absolute;inset:0;background-repeat:repeat-x;background-size:auto 100%;background-position:0 50%}usa-panorama .usa-pano-procedural{background-size:400% 100%;background-repeat:repeat-x;background-image:radial-gradient(circle at 12% 30%,#fde68a 0 3%,transparent 3.5%),linear-gradient(170deg,transparent 58%,#166534 58.5% 64%,transparent 64.5%),linear-gradient(10deg,transparent 52%,#15803d 52.5% 60%,transparent 60.5%),linear-gradient(160deg,transparent 46%,#475569 46.5% 70%,transparent 70.5%),linear-gradient(20deg,transparent 48%,#64748b 48.5% 70%,transparent 70.5%),linear-gradient(#38bdf8,#bae6fd 55%,#86efac 55.5%,#22c55e)}usa-panorama .usa-pano-compass{position:absolute;right:10px;top:10px;width:34px;height:34px;border-radius:50%;background:rgba(15,23,42,.55);box-shadow:inset 0 0 0 2px rgba(255,255,255,.6)}usa-panorama .usa-pano-compass i{position:absolute;inset:4px;border-radius:50%;transition:transform .25s linear;background:conic-gradient(#ef4444 0 6deg,transparent 6deg 354deg,#ef4444 354deg)}usa-panorama .usa-pano-xr{position:absolute;left:10px;bottom:10px;padding:6px 10px;border:0;border-radius:999px;background:rgba(15,23,42,.7);color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}";

function definePanorama(tag = 'usa-panorama') {
    return defineElement(tag, (Base) => {
        class UsaPanorama extends Base {
            constructor() {
                super(...arguments);
                this._yaw = 0;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['src', 'autorotate', 'label'];
            }
            get yaw() {
                return this._yaw;
            }
            set yaw(v) {
                this.lookAt(v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', this.str('label', '360° panorama'));
                this.setAttribute('aria-roledescription', 'panorama');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                const src = this.str('src');
                this.insertAdjacentHTML('beforeend', `<div class="usa-pano-view${src ? '' : ' usa-pano-procedural'}" data-usa-part></div><span class="usa-pano-compass" aria-hidden="true" data-usa-part><i></i></span><button type="button" class="usa-pano-xr" hidden data-usa-part>View in XR</button>`);
                const view = this.querySelector('.usa-pano-view');
                if (src)
                    view.style.backgroundImage = `url("${src.replace(/"/g, '%22')}")`;
                let vel = 0;
                let drag = null;
                this.listen(this, 'pointerdown', (e) => {
                    if (e.target.closest?.('.usa-pano-xr'))
                        return;
                    drag = { x: e.clientX, yaw: this._yaw, t: performance.now(), lx: e.clientX };
                    vel = 0;
                    this.setFlag('data-dragging', true);
                    try {
                        this.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                });
                this.listen(this, 'pointermove', (e) => {
                    if (!drag)
                        return;
                    const w = this.clientWidth || 300;
                    const now = performance.now();
                    vel = ((drag.lx - e.clientX) / w) * 90 / Math.max(1, now - drag.t) * 16;
                    drag.t = now;
                    drag.lx = e.clientX;
                    this.lookAt(drag.yaw + ((drag.x - e.clientX) / w) * 90);
                });
                const up = () => {
                    if (!drag)
                        return;
                    drag = null;
                    this.setFlag('data-dragging', false);
                };
                this.listen(this, 'pointerup', up);
                this.listen(this, 'pointercancel', up);
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'ArrowLeft')
                        this.lookAt(this._yaw - 15);
                    else if (e.key === 'ArrowRight')
                        this.lookAt(this._yaw + 15);
                    else
                        return;
                    e.preventDefault();
                });
                const xr = this.querySelector('.usa-pano-xr');
                xrSupport().then((m) => {
                    if (m === 'none' || m === 'inline' || !this.isConnected)
                        return;
                    xr.hidden = false;
                    this.emit('xr', { mode: m });
                });
                this.listen(xr, 'click', () => this.emit('xr-request', { yaw: this._yaw }));
                this.lookAt(this._yaw);
                if (this.reduced)
                    return;
                const rate = this.num('autorotate', 6);
                this.inView((v) => {
                    cancelAnimationFrame(this._raf);
                    if (!v)
                        return;
                    let last = performance.now();
                    const tick = (t) => {
                        const dt = Math.min(64, t - last);
                        last = t;
                        if (!drag) {
                            if (Math.abs(vel) > 0.02) {
                                this.lookAt(this._yaw + vel * (dt / 16));
                                vel *= 0.94;
                            }
                            else if (rate && !this.matches(':focus-within, :hover'))
                                this.lookAt(this._yaw + (rate * dt) / 1000, true);
                        }
                        this._raf = requestAnimationFrame(tick);
                    };
                    this._raf = requestAnimationFrame(tick);
                });
                this.onCleanup(() => cancelAnimationFrame(this._raf));
            }
            lookAt(deg, quiet = false) {
                this._yaw = ((deg % 360) + 360) % 360;
                const view = this.querySelector('.usa-pano-view');
                if (view) {
                    const tile = view.clientHeight ? view.clientHeight * 4 : 1200;
                    view.style.backgroundPositionX = `${yawToOffset(this._yaw, tile)}px`;
                }
                const c = this.querySelector('.usa-pano-compass i');
                if (c)
                    c.style.transform = `rotate(${-this._yaw}deg)`;
                if (!quiet)
                    this.emit('look', { yaw: Math.round(this._yaw) });
            }
        }
        return UsaPanorama;
    }, { id: 'panorama', text: css });
}

export { definePanorama };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.0/dist/widgets/panorama.js.map