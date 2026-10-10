'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var components_ai = require('../components/ai.cjs');

var css = "usa-motion-prompt{display:block;max-width:100%;font:14px/1.4 system-ui,sans-serif}usa-motion-prompt .usa-mp{display:grid;gap:10px;min-width:0}usa-motion-prompt .usa-mp-label{display:block;font-weight:600;margin-bottom:4px}usa-motion-prompt .usa-mp-row{display:flex;gap:6px;min-width:0}usa-motion-prompt .usa-mp-input{flex:1;min-width:0;padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;font:inherit;background:#fff;color:#0f172a}usa-motion-prompt .usa-mp-go,usa-motion-prompt .usa-mp-copy{padding:8px 12px;border:0;border-radius:8px;background:#4f46e5;color:#fff;font:600 13px/1 system-ui,sans-serif;cursor:pointer}usa-motion-prompt .usa-mp-out{position:relative;display:grid;gap:8px;min-width:0}usa-motion-prompt .usa-mp-stage{display:flex;gap:10px;justify-content:center;align-items:center;height:64px;border-radius:10px;background:#0f172a;overflow:hidden}usa-motion-prompt .usa-mp-dot{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#818cf8,#f472b6)}usa-motion-prompt .usa-mp-summary{margin:0;font-size:12px;color:#475569;overflow-wrap:anywhere}usa-motion-prompt .usa-mp-tabs{display:flex;gap:4px;flex-wrap:wrap}usa-motion-prompt .usa-mp-tabs button{padding:4px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;font:12px/1 system-ui,sans-serif;cursor:pointer}usa-motion-prompt .usa-mp-tabs button[aria-selected=true]{background:#e0e7ff;border-color:#818cf8;color:#3730a3}usa-motion-prompt .usa-mp-code{margin:0;max-height:140px;overflow:auto;padding:8px 10px;border-radius:8px;background:#f1f5f9;font:11px/1.45 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere}usa-motion-prompt .usa-mp-copy{justify-self:end;padding:5px 10px;font-size:12px}";

const FORMATS = ['waapi', 'css', 'component'];
function defineMotionPrompt(tag = 'usa-motion-prompt') {
    return base.defineElement(tag, (Base) => {
        class UsaMotionPrompt extends Base {
            constructor() {
                super(...arguments);
                this.cur = null;
                this.suggester = null;
                this.seq = 0;
                this.render = null;
            }
            static get observedAttributes() {
                return ['value', 'format', 'placeholder', 'label'];
            }
            get intent() {
                return this.cur;
            }
            suggest(text) {
                const i = components_ai.describeMotion(text);
                this.cur = i;
                this.render?.(i);
                this.emit('suggest', { intent: i, source: 'local', errors: [] });
                const n = ++this.seq;
                if (this.suggester)
                    void Promise.resolve()
                        .then(() => this.suggester(text))
                        .then((r) => {
                        if (n !== this.seq || !r?.intent)
                            return;
                        this.cur = r.intent;
                        this.render?.(r.intent);
                        this.emit('suggest', { intent: r.intent, source: r.source, errors: r.errors });
                    })
                        .catch(() => undefined);
                return i;
            }
            mount() {
                let fmt = FORMATS.includes(this.str('format')) ? this.str('format') : 'waapi';
                const root = document.createElement('div');
                root.className = 'usa-mp';
                const uid = Math.random().toString(36).slice(2, 8);
                root.innerHTML = `<form class="usa-mp-form"><label class="usa-mp-label" for="usa-mp-${uid}"></label><div class="usa-mp-row"><input id="usa-mp-${uid}" class="usa-mp-input" type="text" autocomplete="off" spellcheck="false"><button class="usa-mp-go" type="submit">Suggest</button></div></form><div class="usa-mp-out" aria-live="polite"><div class="usa-mp-stage"><div class="usa-mp-dot"></div><div class="usa-mp-dot"></div><div class="usa-mp-dot"></div></div><p class="usa-mp-summary"></p><div class="usa-mp-tabs" role="tablist"></div><pre class="usa-mp-code"><code></code></pre><button class="usa-mp-copy" type="button">Copy</button></div>`;
                this.querySelector(':scope > .usa-mp')?.remove();
                this.prepend(root);
                this.onCleanup(() => root.remove());
                const $ = (s) => root.querySelector(s);
                const input = $('.usa-mp-input');
                $('.usa-mp-label').textContent = this.str('label', 'Describe the motion');
                input.placeholder = this.str('placeholder', 'e.g. fade the cards up slowly, one after another');
                input.value = this.str('value', 'fade the cards up, one after another');
                const tabs = $('.usa-mp-tabs');
                const code = $('.usa-mp-code code');
                const summary = $('.usa-mp-summary');
                const dots = Array.from(root.querySelectorAll('.usa-mp-dot'));
                let anims = [];
                const showCode = () => {
                    if (!this.cur)
                        return;
                    code.textContent = components_ai.motionSnippet(this.cur, fmt);
                    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.fmt === fmt)));
                };
                for (const f of FORMATS) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.setAttribute('role', 'tab');
                    b.dataset.fmt = f;
                    b.textContent = f === 'waapi' ? 'WAAPI' : f === 'css' ? 'CSS' : 'Component';
                    this.listen(b, 'click', () => {
                        fmt = f;
                        showCode();
                    });
                    tabs.append(b);
                }
                this.render = (i) => {
                    const pct = Math.round(i.confidence * 100);
                    const bits = [i.effect, i.direction, `${i.duration} ms`, i.easingName || 'ease', `on ${i.trigger}`, i.stagger ? `stagger ${i.stagger} ms` : '', i.iterations === Infinity ? 'loops' : ''].filter(Boolean);
                    summary.textContent = `${bits.join(' · ')} — ${pct}% understood${i.components[0] ? ` · try <${i.components[0].tag}>` : ''}`;
                    showCode();
                    anims.forEach((a) => a.cancel());
                    anims = [];
                    if (this.reduced || typeof dots[0].animate !== 'function' || !i.keyframes.length)
                        return;
                    dots.forEach((d, k) => {
                        const o = { ...i.options, delay: (Number(i.options.delay) || 0) + k * (i.stagger || 0), iterations: i.iterations === Infinity ? Infinity : 1, fill: 'both' };
                        try {
                            anims.push(d.animate(i.keyframes, o));
                        }
                        catch {
                            /* a keyframe the browser rejects: leave the preview still */
                        }
                    });
                };
                this.listen($('.usa-mp-form'), 'submit', (e) => {
                    e.preventDefault();
                    this.suggest(input.value);
                });
                this.listen($('.usa-mp-copy'), 'click', () => {
                    const text = code.textContent || '';
                    navigator.clipboard?.writeText?.(text)?.catch?.(() => { });
                    this.emit('copy', { format: fmt, code: text });
                });
                this.onCleanup(() => anims.forEach((a) => a.cancel()));
                this.suggest(input.value);
            }
        }
        return UsaMotionPrompt;
    }, { id: 'motion-prompt', text: css });
}

exports.defineMotionPrompt = defineMotionPrompt;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.5.0/dist/widgets/motion-prompt.cjs.map