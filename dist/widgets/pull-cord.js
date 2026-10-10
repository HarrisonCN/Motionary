import { f as defineElement } from '../chunks/base-nzeN_ux7.js';

var css = "usa-pull-cord{--usa-pc-color:#cbd5e1;--usa-pc-light:#fde68a;position:relative;display:inline-flex;flex-direction:column;align-items:center;width:90px;height:190px;cursor:pointer;touch-action:none;user-select:none;outline-offset:4px;border-radius:12px}.usa-pc-lamp{position:relative;width:76px;height:38px;border-radius:38px 38px 6px 6px;background:linear-gradient(#475569,#334155);box-shadow:0 0 0 rgba(253,230,138,0);transition:box-shadow .35s,background .35s}.usa-pc-lamp::after{content:\"\";position:absolute;left:50%;bottom:-10px;width:22px;height:12px;margin-left:-11px;border-radius:0 0 12px 12px;background:#64748b;transition:background .35s,box-shadow .35s}usa-pull-cord[data-on] .usa-pc-lamp{background:linear-gradient(#f59e0b,#d97706);box-shadow:0 30px 60px 10px rgba(253,230,138,.55)}usa-pull-cord[data-on] .usa-pc-lamp::after{background:var(--usa-pc-light);box-shadow:0 0 22px 8px var(--usa-pc-light)}.usa-pc-svg{width:80px;height:150px;margin-top:-2px;overflow:visible}.usa-pc-cord{fill:none;stroke:var(--usa-pc-color);stroke-width:2.2;stroke-linecap:round}.usa-pc-knob{fill:#e2e8f0;stroke:#94a3b8;stroke-width:1.5}usa-pull-cord[data-on] .usa-pc-knob{fill:var(--usa-pc-light)}@media (prefers-reduced-motion:reduce){.usa-pc-lamp,.usa-pc-lamp::after{transition:none}}";

function definePullCord(tag = 'usa-pull-cord') {
    // contract-exempt: attr-unobserved(on) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
    return defineElement(tag, (Base) => {
        class UsaPullCord extends Base {
            constructor() {
                super(...arguments);
                this._on = false;
                this._raf = 0;
                this._x = 0;
                this._y = 0;
                this._vx = 0;
                this._vy = 0;
            }
            static get observedAttributes() {
                return ['label', 'threshold'];
            }
            get on() {
                return this._on;
            }
            set on(v) {
                this.toggle(!!v, false);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<span class="usa-pc-lamp" data-usa-part aria-hidden="true"></span><svg class="usa-pc-svg" data-usa-part aria-hidden="true" viewBox="-40 0 80 150"><path class="usa-pc-cord" d="M0 0 L0 90"/><circle class="usa-pc-knob" cx="0" cy="96" r="7"/></svg>');
                this.setAttribute('role', 'switch');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Light'));
                this._on = this.flag('on');
                this.sync();
                this.draw();
                this.listen(this, 'keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        this.pull();
                    }
                });
                this.listen(this, 'pointerdown', (e) => this.drag(e));
                this.onCleanup(() => this._raf && cancelAnimationFrame(this._raf));
            }
            sync() {
                this.setAttribute('aria-checked', String(this._on));
                this.toggleAttribute('data-on', this._on);
            }
            draw() {
                const cord = this.querySelector('.usa-pc-cord');
                const knob = this.querySelector('.usa-pc-knob');
                const ex = this._x;
                const ey = 90 + this._y;
                cord?.setAttribute('d', `M0 0 Q${(ex * 0.5).toFixed(1)} ${(ey * 0.55).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
                knob?.setAttribute('cx', ex.toFixed(1));
                knob?.setAttribute('cy', (ey + 6).toFixed(1));
            }
            /** Damped spring back to rest. */
            release() {
                if (this.reduced || typeof requestAnimationFrame !== 'function') {
                    this._x = this._y = 0;
                    this.draw();
                    return;
                }
                let last = 0;
                const f = (now) => {
                    const dt = last ? Math.min(0.033, (now - last) / 1000) : 1 / 60;
                    last = now;
                    this._vx += (-120 * this._x - 3 * this._vx) * dt;
                    this._vy += (-260 * this._y - 9 * this._vy) * dt;
                    this._x += this._vx * dt;
                    this._y += this._vy * dt;
                    this.draw();
                    if (Math.abs(this._x) + Math.abs(this._y) + Math.abs(this._vx) + Math.abs(this._vy) > 0.05)
                        this._raf = requestAnimationFrame(f);
                    else
                        ((this._raf = 0), (this._x = this._y = this._vx = this._vy = 0), this.draw());
                };
                if (!this._raf)
                    this._raf = requestAnimationFrame(f);
            }
            /** Pull once (keyboard / click): tug the cord and toggle. */
            pull() {
                this._y = 26;
                this._vx = (Math.random() - 0.5) * 60;
                this.draw();
                this.toggle(undefined, true);
                this.release();
            }
            drag(e) {
                if (e.button > 0)
                    return;
                const y0 = e.clientY;
                const x0 = e.clientX;
                let moved = false;
                if (this._raf)
                    (cancelAnimationFrame(this._raf), (this._raf = 0));
                const move = (ev) => {
                    moved = moved || Math.abs(ev.clientY - y0) > 4;
                    this._y = Math.max(0, Math.min(50, ev.clientY - y0));
                    this._x = Math.max(-30, Math.min(30, (ev.clientX - x0) * 0.6));
                    this.draw();
                };
                const up = () => {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    window.removeEventListener('pointercancel', up);
                    if (!moved)
                        return this.pull();
                    if (this._y >= this.num('threshold', 24))
                        this.toggle(undefined, true);
                    this._vy = -this._y * 2;
                    this.release();
                };
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
                window.addEventListener('pointercancel', up);
            }
            toggle(force, user = false) {
                const next = typeof force === 'boolean' ? force : !this._on;
                if (next === this._on)
                    return;
                this._on = next;
                this.toggleAttribute('on', next);
                this.sync();
                const lamp = this.querySelector('.usa-pc-lamp');
                if (user && lamp && !this.reduced)
                    this.motion(lamp, [{ transform: 'translateY(0)' }, { transform: 'translateY(3px)', offset: 0.3 }, { transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' });
                if (user)
                    this.emit('change', { on: next });
            }
        }
        return UsaPullCord;
    }, { id: 'pull-cord', text: css });
}

export { definePullCord };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/widgets/pull-cord.js.map