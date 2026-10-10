import { f as defineElement } from '../chunks/base-CBMzOs1k.js';

var css = "usa-red-envelope{display:inline-block;--usa-re-w:150px;--usa-re-red:#dc2626;--usa-re-gold:#facc15}.usa-re{position:relative;display:block;width:var(--usa-re-w);height:calc(var(--usa-re-w)*1.35);padding:0;border:0;background:none;cursor:pointer;perspective:600px;font:600 14px/1.2 system-ui,sans-serif}.usa-re:focus-visible{outline:2px solid var(--usa-re-gold);outline-offset:4px;border-radius:12px}.usa-re-body{position:absolute;inset:0;border-radius:12px;background:linear-gradient(160deg,#ef4444,var(--usa-re-red) 60%,#b91c1c);box-shadow:0 12px 24px -12px rgba(127,29,29,.7);display:flex;align-items:flex-end;justify-content:center;padding-bottom:18%;z-index:2}.usa-re-msg{color:var(--usa-re-gold);font-size:calc(var(--usa-re-w)*.13);letter-spacing:.1em}.usa-re-flap{position:absolute;left:0;right:0;top:0;height:42%;border-radius:12px 12px 50% 50%/12px 12px 40% 40%;background:linear-gradient(#f87171,#dc2626);transform-origin:50% 0;z-index:3;display:grid;place-items:end center;box-shadow:0 4px 8px rgba(127,29,29,.35);transition:transform .45s ease-in-out}usa-red-envelope[data-open] .usa-re-flap{transform:rotateX(180deg);z-index:0;opacity:.85}.usa-re-seal{display:grid;place-items:center;width:30%;aspect-ratio:1;margin-bottom:-15%;border-radius:50%;background:var(--usa-re-gold);color:var(--usa-re-red);font-size:calc(var(--usa-re-w)*.14);font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.25)}usa-red-envelope[data-open] .usa-re-seal{visibility:hidden}.usa-re-card{position:absolute;left:8%;right:8%;top:6%;height:70%;border-radius:8px;background:#fff7ed;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;z-index:1;transition:transform .5s cubic-bezier(.3,1.4,.5,1)}usa-red-envelope[data-open] .usa-re-card{transform:translateY(-46%);z-index:3;box-shadow:0 6px 14px -6px rgba(127,29,29,.5)}.usa-re-amt{color:var(--usa-re-red);font-size:calc(var(--usa-re-w)*.16);font-weight:900;font-variant-numeric:tabular-nums}.usa-re-from{font-size:11px;color:#92400e}.usa-re-coins{position:absolute;left:50%;top:40%;z-index:4}.usa-re-coins i{position:absolute;left:0;top:0;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fef08a,var(--usa-re-gold) 60%,#ca8a04);box-shadow:0 1px 3px rgba(0,0,0,.3)}.usa-re-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}@media (prefers-reduced-motion:reduce){.usa-re-flap,.usa-re-card{transition:none}}";

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineRedEnvelope(tag = 'usa-red-envelope') {
    return defineElement(tag, (Base) => {
        class UsaRedEnvelope extends Base {
            static get observedAttributes() {
                return ['amount', 'currency', 'message', 'from', 'opened'];
            }
            get opened() {
                return this.hasAttribute('data-open');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const msg = this.str('message', '恭喜发财');
                this.insertAdjacentHTML('beforeend', `<button type="button" class="usa-re" aria-expanded="false" aria-label="${esc(`Open red envelope${this.str('from') ? ` from ${this.str('from')}` : ''}`)}" data-usa-part><span class="usa-re-card" aria-hidden="true"><span class="usa-re-amt"></span><span class="usa-re-from">${esc(this.str('from'))}</span></span><span class="usa-re-body"><span class="usa-re-msg">${esc(msg)}</span></span><span class="usa-re-flap"><span class="usa-re-seal">福</span></span><span class="usa-re-coins" aria-hidden="true"></span><span class="usa-re-live" aria-live="polite"></span></button>`);
                this.listen(this.querySelector('.usa-re'), 'click', () => (this.opened ? this.close() : this.open()));
                if (this.flag('opened'))
                    this.open(true);
            }
            open(quiet = false) {
                if (this.opened)
                    return;
                this.setAttribute('data-open', '');
                const btn = this.querySelector('.usa-re');
                btn.setAttribute('aria-expanded', 'true');
                const amount = this.num('amount', 8.88);
                const cur = this.str('currency', '¥');
                const amt = this.querySelector('.usa-re-amt');
                const fmt = (v) => `${cur}${v.toFixed(Number.isInteger(amount) ? 0 : 2)}`;
                amt.textContent = fmt(amount);
                this.querySelector('.usa-re-live').textContent = `${fmt(amount)}${this.str('from') ? ` from ${this.str('from')}` : ''}`;
                if (!quiet && !this.reduced) {
                    this.motion(this.querySelector('.usa-re-flap'), [{ transform: 'rotateX(0)' }, { transform: 'rotateX(180deg)' }], { duration: 450, easing: 'ease-in-out' });
                    this.motion(this.querySelector('.usa-re-card'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-46%)' }], { duration: 520, delay: 300, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
                    const t0 = performance.now();
                    const step = () => {
                        const k = Math.min(1, (performance.now() - t0 - 350) / 700);
                        amt.textContent = fmt(amount * Math.max(0, 1 - Math.pow(1 - Math.max(0, k), 3)));
                        if (k < 1 && this.isConnected)
                            requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                    const coins = this.querySelector('.usa-re-coins');
                    for (let i = 0; i < 7; i++) {
                        const c = document.createElement('i');
                        coins.appendChild(c);
                        const x = (i - 3) * 22;
                        const a = this.motion(c, [{ transform: 'translate(-50%,0) scale(.3)', opacity: 0 }, { transform: `translate(calc(-50% + ${x}px), -${70 + (i % 3) * 18}px) scale(1) rotateY(360deg)`, opacity: 1, offset: 0.5 }, { transform: `translate(calc(-50% + ${x * 1.3}px), 10px) scale(.8) rotateY(720deg)`, opacity: 0 }], { duration: 1100, delay: 450 + i * 40, easing: 'ease-out', fill: 'backwards' });
                        const rm = () => c.remove();
                        if (a)
                            a.finished.then(rm, rm);
                        else
                            rm();
                    }
                }
                this.emit('open', { amount });
            }
            close() {
                this.removeAttribute('data-open');
                this.querySelector('.usa-re')?.setAttribute('aria-expanded', 'false');
            }
        }
        return UsaRedEnvelope;
    }, { id: 'red-envelope', text: css });
}

export { defineRedEnvelope };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/widgets/red-envelope.js.map