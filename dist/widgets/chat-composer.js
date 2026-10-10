import { f as defineElement } from '../chunks/base-zSGb8ujt.js';

var css = "usa-chat-composer{display:block;width:var(--usa-cc-w,100%);max-width:100%;font:500 14px/1.45 system-ui,sans-serif;--usa-cc-accent:#6366f1}.usa-cc{position:relative;display:flex;align-items:flex-end;gap:8px;padding:8px 8px 8px 14px;border-radius:22px;background:var(--usa-cc-bg,#fff);color:var(--usa-cc-fg,#0f172a);border:1px solid rgba(100,116,139,.28);box-shadow:0 6px 20px -12px rgba(15,23,42,.4)}.usa-cc-glow{position:absolute;inset:-2px;border-radius:24px;padding:2px;background:conic-gradient(from var(--usa-cc-a,0deg),#6366f1,#ec4899,#f59e0b,#22d3ee,#6366f1);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .3s;pointer-events:none}@property --usa-cc-a{syntax:\"<angle>\";inherits:false;initial-value:0deg}usa-chat-composer[data-busy] .usa-cc-glow{opacity:1;animation:usa-cc-spin 2.4s linear infinite}@keyframes usa-cc-spin{to{--usa-cc-a:360deg}}.usa-cc-input{flex:1;min-width:0;resize:none;border:0;outline:none;background:transparent;color:inherit;font:inherit;padding:6px 0;max-height:12em;overflow-y:auto}.usa-cc-send{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:0;background:rgba(100,116,139,.25);color:#fff;cursor:pointer;transition:background .2s}usa-chat-composer[data-ready] .usa-cc-send{background:var(--usa-cc-accent)}.usa-cc-send:focus-visible{outline:2px solid var(--usa-cc-accent);outline-offset:2px}.usa-cc-send svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.usa-cc-arrow{transition:transform .25s,opacity .2s;transform-origin:center}.usa-cc-stop{fill:currentColor;stroke:none;opacity:0;transform:scale(.4);transform-origin:12px 12px;transition:transform .25s,opacity .2s}usa-chat-composer[data-busy] .usa-cc-arrow{opacity:0;transform:scale(.4)}usa-chat-composer[data-busy] .usa-cc-stop{opacity:1;transform:none}@media (prefers-reduced-motion:reduce){usa-chat-composer[data-busy] .usa-cc-glow{animation:none}.usa-cc-arrow,.usa-cc-stop,.usa-cc-glow{transition:none}}";

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineChatComposer(tag = 'usa-chat-composer') {
    return defineElement(tag, (Base) => {
        class UsaChatComposer extends Base {
            static get observedAttributes() {
                return ['placeholder', 'label', 'rows', 'busy', 'value'];
            }
            get area() {
                return this.querySelector('.usa-cc-input');
            }
            get value() {
                return this.area?.value ?? '';
            }
            set value(v) {
                const a = this.area;
                if (!a)
                    return;
                a.value = v;
                this.sync();
            }
            get busy() {
                return this.flag('busy');
            }
            set busy(on) {
                this.setFlag('busy', on);
            }
            mount() {
                const keep = this.area?.value ?? this.str('value');
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const label = this.str('label', 'Message');
                this.insertAdjacentHTML('beforeend', `<div class="usa-cc" data-usa-part><span class="usa-cc-glow" aria-hidden="true"></span><textarea class="usa-cc-input" rows="1" aria-label="${esc(label)}" placeholder="${esc(this.str('placeholder', 'Ask anything…'))}"></textarea><button type="button" class="usa-cc-send" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="usa-cc-arrow" d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/><rect class="usa-cc-stop" x="7" y="7" width="10" height="10" rx="2"/></svg></button></div>`);
                const a = this.area;
                a.value = keep;
                this.listen(a, 'input', () => this.sync());
                this.listen(a, 'keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                        e.preventDefault();
                        if (!this.busy)
                            this.send();
                    }
                });
                this.listen(this.querySelector('.usa-cc-send'), 'click', () => {
                    if (this.busy) {
                        this.emit('stop');
                        this.busy = false;
                    }
                    else
                        this.send();
                });
                this.sync(true);
                this.state();
            }
            changed(name) {
                if (name === 'busy')
                    return this.state();
                super.changed(name);
            }
            state() {
                const b = this.querySelector('.usa-cc-send');
                if (!b)
                    return;
                b.setAttribute('aria-label', this.busy ? 'Stop generating' : 'Send');
                this.setFlag('data-busy', this.busy);
                this.sync(true);
            }
            sync(quiet = false) {
                const a = this.area;
                if (!a)
                    return;
                const max = Math.max(1, Math.round(this.num('rows', 6)));
                a.style.height = 'auto';
                const lh = parseFloat(getComputedStyle(a).lineHeight) || 20;
                const h = a.scrollHeight;
                if (h > 0)
                    a.style.height = `${Math.min(h, lh * max + 16)}px`;
                const had = this.hasAttribute('data-ready');
                const ready = !!a.value.trim() || this.busy;
                this.setFlag('data-ready', ready);
                if (ready && !had && !quiet && !this.reduced)
                    this.motion(this.querySelector('.usa-cc-send'), [{ transform: 'scale(.6)' }, { transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 260, easing: 'ease-out' });
            }
            /** Emits `usa:send` with the trimmed text and clears it (unless prevented). */
            send() {
                const text = this.value.trim();
                if (!text)
                    return false;
                if (!this.emit('send', { text }))
                    return false;
                this.clear();
                return true;
            }
            clear() {
                this.value = '';
            }
        }
        return UsaChatComposer;
    }, { id: 'chat-composer', text: css });
}

export { defineChatComposer };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.1.0/dist/widgets/chat-composer.js.map