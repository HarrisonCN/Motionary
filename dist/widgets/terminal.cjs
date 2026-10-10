'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');

var css = "usa-terminal{display:block;width:var(--usa-term-w,100%);max-width:100%;--usa-term-bg:#0f172a;--usa-term-fg:#e2e8f0;--usa-term-accent:#22c55e}usa-terminal[data-theme=green]{--usa-term-bg:#03140a;--usa-term-fg:#4ade80;--usa-term-accent:#86efac}usa-terminal[data-theme=amber]{--usa-term-bg:#1a1003;--usa-term-fg:#fbbf24;--usa-term-accent:#fde68a}.usa-term{border-radius:10px;overflow:hidden;background:var(--usa-term-bg);color:var(--usa-term-fg);box-shadow:0 16px 36px -18px rgba(0,0,0,.6);font:500 12.5px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}usa-terminal[data-theme=green] .usa-term,usa-terminal[data-theme=amber] .usa-term{text-shadow:0 0 6px currentColor}.usa-term-bar{display:flex;align-items:center;gap:6px;padding:8px 10px;background:rgba(255,255,255,.06)}.usa-term-bar i{width:10px;height:10px;border-radius:50%;background:#ef4444}.usa-term-bar i:nth-child(2){background:#f59e0b}.usa-term-bar i:nth-child(3){background:#22c55e}.usa-term-bar span{flex:1;text-align:center;margin-right:40px;opacity:.6;font-size:11px}.usa-term-body{min-height:var(--usa-term-h,120px);padding:10px 12px 12px}.usa-term-body p{margin:0;white-space:pre-wrap;word-break:break-word}.usa-term-ps{color:var(--usa-term-accent)}.usa-term-out{opacity:.8}.usa-term-cursor{display:inline-block;width:.6em;height:1.15em;margin-left:1px;vertical-align:text-bottom;background:currentColor;animation:usa-term-blink 1s steps(1) infinite}@keyframes usa-term-blink{50%{opacity:0}}@media (prefers-reduced-motion:reduce){.usa-term-cursor{animation:none}}";

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineTerminal(tag = 'usa-terminal') {
    return base.defineElement(tag, (Base) => {
        class UsaTerminal extends Base {
            constructor() {
                super(...arguments);
                this._lines = [];
                this._timer = 0;
                this._run = 0;
            }
            static get observedAttributes() {
                return ['title', 'prompt', 'theme', 'speed', 'loop'];
            }
            mount() {
                const src = Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
                if (src.length)
                    this._lines = src.map((c) => ({ cmd: c.hasAttribute('data-cmd'), text: (c.textContent || '').replace(/\s+$/, '') }));
                src.forEach((c) => c.remove());
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('data-theme', ['green', 'amber'].includes(this.str('theme')) ? this.str('theme') : 'dark');
                this.insertAdjacentHTML('beforeend', `<div class="usa-term" data-usa-part><div class="usa-term-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(this.str('title', 'terminal'))}</span></div><div class="usa-term-body" role="log" aria-label="${esc(this.str('title', 'Terminal'))}"></div></div>`);
                let started = false;
                this.inView((v) => {
                    if (v && !started) {
                        started = true;
                        this.replay();
                    }
                }, { threshold: 0.3 });
                this.onCleanup(() => clearTimeout(this._timer));
            }
            line(l) {
                const body = this.querySelector('.usa-term-body');
                const p = document.createElement('p');
                p.className = l.cmd ? 'usa-term-cmd' : 'usa-term-out';
                if (l.cmd)
                    p.innerHTML = `<span class="usa-term-ps" aria-hidden="true">${esc(this.str('prompt', '$'))} </span><span class="usa-term-tx"></span>`;
                body.appendChild(p);
                return p;
            }
            /** Clear and type everything again. */
            replay() {
                clearTimeout(this._timer);
                const run = ++this._run;
                const body = this.querySelector('.usa-term-body');
                if (!body)
                    return;
                body.textContent = '';
                if (this.reduced)
                    return this.skip();
                const speed = Math.max(5, this.num('speed', 45));
                let i = 0;
                const next = () => {
                    if (run !== this._run || !this.isConnected)
                        return;
                    body.querySelectorAll('.usa-term-cursor').forEach((c) => c.remove());
                    const l = this._lines[i++];
                    if (!l) {
                        const last = this.line({ cmd: true, text: '' });
                        last.insertAdjacentHTML('beforeend', '<span class="usa-term-cursor" aria-hidden="true"></span>');
                        this.emit('done');
                        if (this.flag('loop'))
                            this._timer = setTimeout(() => this.replay(), 2500);
                        return;
                    }
                    const p = this.line(l);
                    if (!l.cmd) {
                        p.textContent = l.text;
                        this.motion(p, [{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
                        this._timer = setTimeout(next, 120);
                        return;
                    }
                    const tx = p.querySelector('.usa-term-tx');
                    const cur = document.createElement('span');
                    cur.className = 'usa-term-cursor';
                    cur.setAttribute('aria-hidden', 'true');
                    p.appendChild(cur);
                    let k = 0;
                    const type = () => {
                        if (run !== this._run)
                            return;
                        tx.textContent = l.text.slice(0, ++k);
                        if (k < l.text.length)
                            this._timer = setTimeout(type, speed * (0.6 + Math.random() * 0.8));
                        else
                            this._timer = setTimeout(next, 350);
                    };
                    this._timer = setTimeout(type, 250);
                };
                next();
            }
            /** Show every line at once. */
            skip() {
                clearTimeout(this._timer);
                this._run++;
                const body = this.querySelector('.usa-term-body');
                if (!body)
                    return;
                body.textContent = '';
                for (const l of this._lines) {
                    const p = this.line(l);
                    if (l.cmd)
                        p.querySelector('.usa-term-tx').textContent = l.text;
                    else
                        p.textContent = l.text;
                }
                this.emit('done');
            }
        }
        return UsaTerminal;
    }, { id: 'terminal', text: css });
}

exports.defineTerminal = defineTerminal;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.3.0/dist/widgets/terminal.cjs.map