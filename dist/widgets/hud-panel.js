import { f as defineElement } from '../chunks/base-BTev8qxg.js';

var css = "usa-hud-panel{position:relative;display:block;padding:12px 16px 14px;color:#cffafe;background:linear-gradient(160deg,rgba(8,47,73,.92),rgba(2,6,23,.95));clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 12px,100% calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,0 calc(100% - 12px),0 12px);font:500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;--usa-hud-c:#22d3ee}.usa-hud-frame{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}.usa-hud-frame path{fill:none;stroke:var(--usa-hud-c);stroke-width:1.5;stroke-dasharray:100;filter:drop-shadow(0 0 3px var(--usa-hud-c))}.usa-hud-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid color-mix(in srgb,var(--usa-hud-c) 35%,transparent);letter-spacing:.12em}.usa-hud-dot{width:7px;height:7px;border-radius:50%;background:var(--usa-hud-c);box-shadow:0 0 8px var(--usa-hud-c);animation:usa-hud-blink 1.4s steps(1) infinite}@keyframes usa-hud-blink{50%{opacity:.25}}.usa-hud-title{flex:1;font-weight:800;color:var(--usa-hud-c)}.usa-hud-status{font-size:10px;opacity:.75}.usa-hud-row{display:grid;grid-template-columns:5.5em 1fr 3em;align-items:center;gap:8px;margin:5px 0 0}.usa-hud-bar{height:6px;background:color-mix(in srgb,var(--usa-hud-c) 15%,transparent);overflow:hidden}.usa-hud-bar i{display:block;width:var(--v);height:100%;background:var(--usa-hud-c);box-shadow:0 0 8px var(--usa-hud-c);transform-origin:0 50%}.usa-hud-num{text-align:right;color:var(--usa-hud-c);font-variant-numeric:tabular-nums}@media (prefers-reduced-motion:reduce){.usa-hud-dot{animation:none}}";

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineHudPanel(tag = 'usa-hud-panel') {
    return defineElement(tag, (Base) => {
        class UsaHudPanel extends Base {
            static get observedAttributes() {
                return ['title', 'status', 'color'];
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'region');
                this.setAttribute('aria-label', this.str('title', 'Panel'));
                if (this.hasAttribute('color'))
                    this.style.setProperty('--usa-hud-c', this.str('color'));
                this.insertAdjacentHTML('afterbegin', `<svg class="usa-hud-frame" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100" data-usa-part><path pathLength="100" vector-effect="non-scaling-stroke" d="M6 1H94L99 6V94L94 99H6L1 94V6Z"/></svg><header class="usa-hud-head" data-usa-part><span class="usa-hud-dot" aria-hidden="true"></span><span class="usa-hud-title">${esc(this.str('title', 'SYSTEM'))}</span><span class="usa-hud-status">${esc(this.str('status', 'ONLINE'))}</span></header>`);
                this.querySelectorAll(':scope > [data-value]').forEach((r) => {
                    if (r.querySelector('.usa-hud-bar'))
                        return;
                    const v = Math.min(100, Math.max(0, Number(r.dataset.value) || 0));
                    r.classList.add('usa-hud-row');
                    r.insertAdjacentHTML('beforeend', `<span class="usa-hud-bar" aria-hidden="true"><i style="--v:${v}%"></i></span><span class="usa-hud-num">${v}%</span>`);
                });
                let booted = false;
                this.inView((v) => {
                    if (v && !booted) {
                        booted = true;
                        this.boot();
                    }
                }, { threshold: 0.3 });
            }
            boot() {
                this.setAttribute('data-booted', '');
                if (this.reduced)
                    return void this.emit('boot');
                const frame = this.querySelector('.usa-hud-frame path');
                if (frame)
                    this.motion(frame, [{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }], { duration: 900, easing: 'ease-in-out', fill: 'backwards' });
                this.motion(this.querySelector('.usa-hud-head'), [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: 300, easing: 'steps(4, end)', fill: 'backwards' });
                const rows = Array.from(this.querySelectorAll('.usa-hud-bar i'));
                rows.forEach((b, i) => this.motion(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, delay: 500 + i * 120, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
                const last = this.motion(this, [{ filter: 'brightness(1.6)' }, { filter: 'none' }], { duration: 500, delay: 500 + rows.length * 120 });
                if (last)
                    last.finished.then(() => this.emit('boot'), () => undefined);
                else
                    this.emit('boot');
            }
        }
        return UsaHudPanel;
    }, { id: 'hud-panel', text: css });
}

export { defineHudPanel };
//# sourceMappingURL=hud-panel.js.map
