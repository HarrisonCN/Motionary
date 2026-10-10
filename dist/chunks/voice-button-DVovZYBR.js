import { f as defineElement, d as clamp } from './base-zSGb8ujt.js';

var css = "usa-voice-button{display:inline-block;--usa-vb-accent:#6366f1;--usa-vb-size:52px}.usa-vb{display:flex;align-items:center;gap:12px}.usa-vb-btn{position:relative;display:grid;place-items:center;width:var(--usa-vb-size);height:var(--usa-vb-size);border-radius:50%;border:0;background:var(--usa-vb-idle,#e2e8f0);color:#334155;cursor:pointer;transition:background .2s,color .2s}.usa-vb-btn:focus-visible{outline:2px solid var(--usa-vb-accent);outline-offset:3px}.usa-vb-btn svg{position:relative;width:46%;height:46%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.usa-vb-btn svg rect{fill:currentColor;stroke:none}.usa-vb-halo{position:absolute;inset:0;border-radius:50%;background:var(--usa-vb-accent);opacity:0;transition:transform .12s linear}usa-voice-button[listening] .usa-vb-btn{background:var(--usa-vb-accent);color:#fff}usa-voice-button[listening] .usa-vb-halo{opacity:.25;animation:usa-vb-breathe 1.6s ease-in-out infinite}usa-voice-button[data-live] .usa-vb-halo{animation:none}@keyframes usa-vb-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}.usa-vb-bars{display:flex;align-items:center;gap:3px;height:calc(var(--usa-vb-size)*.6);opacity:.25;transition:opacity .2s}.usa-vb-bars i{display:block;width:4px;height:100%;border-radius:2px;background:var(--usa-vb-accent);transform:scaleY(.15);transition:transform .1s linear}usa-voice-button[listening] .usa-vb-bars{opacity:1}usa-voice-button[listening]:not([data-live]) .usa-vb-bars i{animation:usa-vb-wave 1s ease-in-out infinite}.usa-vb-bars i:nth-child(2){animation-delay:-.15s!important}.usa-vb-bars i:nth-child(3){animation-delay:-.3s!important}.usa-vb-bars i:nth-child(4){animation-delay:-.45s!important}.usa-vb-bars i:nth-child(5){animation-delay:-.6s!important}.usa-vb-bars i:nth-child(6){animation-delay:-.75s!important}.usa-vb-bars i:nth-child(7){animation-delay:-.9s!important}@keyframes usa-vb-wave{0%,100%{transform:scaleY(.2)}50%{transform:scaleY(.9)}}@media (prefers-reduced-motion:reduce){usa-voice-button[listening] .usa-vb-halo,usa-voice-button[listening] .usa-vb-bars i{animation:none!important}.usa-vb-bars i{transition:none}}";

/** Bar heights (0–1) for a level and a phase, centre bars tallest (7.8). */
function waveBars(level, n = 5, phase = 0) {
    const l = clamp(level, 0, 1);
    return Array.from({ length: n }, (_, i) => {
        const mid = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2 || 1);
        const wob = 0.5 + 0.5 * Math.sin(phase + i * 1.3);
        return Math.round(clamp(0.15 + l * (0.45 + 0.4 * mid) * (0.6 + 0.4 * wob), 0.1, 1) * 100) / 100;
    });
}
function defineVoiceButton(tag = 'usa-voice-button') {
    return defineElement(tag, (Base) => {
        class UsaVoiceButton extends Base {
            constructor() {
                super(...arguments);
                this._level = -1;
            }
            static get observedAttributes() {
                return ['label', 'bars', 'listening'];
            }
            get listening() {
                return this.flag('listening');
            }
            set listening(on) {
                this.setFlag('listening', on);
            }
            get level() {
                return Math.max(0, this._level);
            }
            set level(v) {
                this._level = clamp(Number(v) || 0, 0, 1);
                this.paint();
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const n = Math.max(3, Math.min(9, Math.round(this.num('bars', 5))));
                this.insertAdjacentHTML('beforeend', `<div class="usa-vb" data-usa-part><button type="button" class="usa-vb-btn" aria-pressed="false" aria-label="${this.str('label', 'Voice input').replace(/"/g, '&quot;')}"><span class="usa-vb-halo" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg></button><span class="usa-vb-bars" aria-hidden="true">${'<i></i>'.repeat(n)}</span></div>`);
                this.listen(this.querySelector('.usa-vb-btn'), 'click', () => this.toggle());
                this.sync(true);
            }
            changed(name) {
                if (name === 'listening')
                    return this.sync(false);
                super.changed(name);
            }
            toggle(force) {
                this.listening = force ?? !this.listening;
            }
            sync(first) {
                const btn = this.querySelector('.usa-vb-btn');
                if (!btn)
                    return;
                btn.setAttribute('aria-pressed', String(this.listening));
                if (!first)
                    this.emit(this.listening ? 'start' : 'stop');
                if (!this.listening)
                    this._level = -1;
                this.paint();
            }
            paint() {
                const bars = Array.from(this.querySelectorAll('.usa-vb-bars i'));
                const live = this.listening && this._level >= 0;
                this.setFlag('data-live', live);
                const hs = waveBars(live ? this._level : 0, bars.length, (typeof performance !== 'undefined' ? performance.now() : 0) / 120);
                bars.forEach((b, i) => (b.style.transform = live ? `scaleY(${hs[i]})` : ''));
                const halo = this.querySelector('.usa-vb-halo');
                if (halo)
                    halo.style.transform = live ? `scale(${1 + this._level * 0.6})` : '';
            }
        }
        return UsaVoiceButton;
    }, { id: 'voice-button', text: css });
}

export { defineVoiceButton as d, waveBars as w };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/chunks/voice-button-DVovZYBR.js.map