'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');

var css = "usa-file-drop{--usa-fd-c:#7c5cff;display:flex;flex-direction:column;gap:10px;width:var(--usa-fd-w,300px);max-width:100%;font:500 13px/1.3 system-ui,sans-serif}.usa-fd-zone{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:120px;padding:16px;border-radius:16px;background:rgba(124,92,255,.06);cursor:pointer;text-align:center;outline-offset:3px;transition:background .25s,transform .25s}.usa-fd-ants{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}.usa-fd-ants rect{fill:none;stroke:rgba(124,92,255,.55);stroke-width:2;stroke-dasharray:8 6}usa-file-drop[data-over] .usa-fd-zone{background:rgba(124,92,255,.14);transform:scale(1.02)}usa-file-drop[data-over] .usa-fd-ants rect{stroke:var(--usa-fd-c);animation:usa-fd-march .6s linear infinite}.usa-fd-icon{font-size:30px;color:var(--usa-fd-c);transition:transform .3s cubic-bezier(.3,1.5,.5,1)}usa-file-drop[data-over] .usa-fd-icon{transform:translateY(-8px) scale(1.15)}.usa-fd-zone:focus-visible{outline:2px solid var(--usa-fd-c)}.usa-fd-list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}.usa-fd-item{--usa-fd-p:0;position:relative;display:grid;grid-template-columns:1fr auto 18px;align-items:center;gap:4px 8px;padding:8px 10px;border-radius:10px;background:rgba(127,127,127,.1)}.usa-fd-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.usa-fd-size{opacity:.6;font-size:12px}.usa-fd-bar{grid-column:1/3;height:4px;border-radius:4px;background:rgba(127,127,127,.25);overflow:hidden}.usa-fd-fill{display:block;height:100%;background:var(--usa-fd-c);transform-origin:0 50%;transform:scaleX(var(--usa-fd-p));transition:transform .2s}.usa-fd-check{grid-row:1/3;grid-column:3;width:18px;height:18px;fill:none;stroke:#22c55e;stroke-width:2.4;stroke-linecap:round;stroke-dasharray:20;stroke-dashoffset:20;transition:stroke-dashoffset .4s}.usa-fd-item[data-done] .usa-fd-check{stroke-dashoffset:0}@keyframes usa-fd-march{to{stroke-dashoffset:-14}}@media (prefers-reduced-motion:reduce){usa-file-drop *{animation:none!important;transition:none!important}usa-file-drop[data-over] .usa-fd-zone,usa-file-drop[data-over] .usa-fd-icon{transform:none}}";

const size = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);
function defineFileDrop(tag = 'usa-file-drop') {
    return base.defineElement(tag, (Base) => {
        class UsaFileDrop extends Base {
            constructor() {
                super(...arguments);
                this._files = [];
                this._depth = 0;
            }
            static get observedAttributes() {
                return ['label', 'accept', 'multiple', 'simulate'];
            }
            get files() {
                return this._files.slice();
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const label = this.str('label', 'Drop files here or browse');
                this.insertAdjacentHTML('afterbegin', `<div class="usa-fd-zone" data-usa-part role="button" tabindex="0"><svg class="usa-fd-ants" aria-hidden="true"><rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="14"/></svg><span class="usa-fd-icon" aria-hidden="true">⇪</span><span class="usa-fd-label"></span><input type="file" hidden></div><ul class="usa-fd-list" data-usa-part aria-live="polite"></ul>`);
                const zone = this.querySelector('.usa-fd-zone');
                zone.querySelector('.usa-fd-label').textContent = label;
                zone.setAttribute('aria-label', label);
                const input = zone.querySelector('input');
                if (this.str('accept', ''))
                    input.accept = this.str('accept', '');
                input.multiple = this.flag('multiple');
                this.listen(zone, 'click', (e) => e.target !== input && input.click());
                this.listen(zone, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        input.click();
                    }
                });
                this.listen(input, 'change', () => input.files && this.addFiles(input.files));
                this.listen(zone, 'dragenter', (e) => {
                    e.preventDefault();
                    this._depth++;
                    this.toggleAttribute('data-over', true);
                });
                this.listen(zone, 'dragover', (e) => e.preventDefault());
                this.listen(zone, 'dragleave', () => {
                    this._depth = Math.max(0, this._depth - 1);
                    if (!this._depth)
                        this.removeAttribute('data-over');
                });
                this.listen(zone, 'drop', (e) => {
                    e.preventDefault();
                    this._depth = 0;
                    this.removeAttribute('data-over');
                    if (e.dataTransfer?.files?.length)
                        this.addFiles(e.dataTransfer.files);
                });
            }
            addFiles(list) {
                const ul = this.querySelector('.usa-fd-list');
                const files = Array.from(list).slice(0, this.flag('multiple') ? undefined : 1);
                if (!this.flag('multiple'))
                    this.clear();
                const start = this._files.length;
                files.forEach((f, i) => {
                    this._files.push(f);
                    const li = document.createElement('li');
                    li.className = 'usa-fd-item';
                    li.innerHTML = '<span class="usa-fd-name"></span><span class="usa-fd-size"></span><span class="usa-fd-bar"><span class="usa-fd-fill"></span></span><svg class="usa-fd-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.8"/></svg>';
                    li.querySelector('.usa-fd-name').textContent = f.name;
                    li.querySelector('.usa-fd-size').textContent = size(f.size);
                    li.setAttribute('aria-label', `${f.name}, ${size(f.size)}`);
                    ul.appendChild(li);
                    if (!this.reduced)
                        this.motion(li, [{ transform: 'translateY(-28px) scale(.85)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, delay: i * 70, easing: 'cubic-bezier(.2,.9,.3,1.2)', fill: 'backwards' });
                });
                this.emit('files', { files });
                if (this.flag('simulate'))
                    files.forEach((_, i) => this.simulate(start + i));
            }
            simulate(i) {
                let p = 0;
                const tick = () => {
                    if (!this.isConnected)
                        return;
                    p = Math.min(1, p + 0.12 + Math.random() * 0.15);
                    this.setProgress(i, p);
                    if (p < 1)
                        setTimeout(tick, 160);
                };
                setTimeout(tick, 200);
            }
            setProgress(index, value) {
                const li = this.querySelectorAll('.usa-fd-item')[index];
                if (!li)
                    return;
                const v = Math.max(0, Math.min(1, value));
                li.style.setProperty('--usa-fd-p', String(v));
                li.toggleAttribute('data-done', v >= 1);
                li.setAttribute('aria-label', `${this._files[index]?.name || ''}, ${Math.round(v * 100)}%`);
            }
            clear() {
                this._files = [];
                this.querySelector('.usa-fd-list')?.replaceChildren();
            }
        }
        return UsaFileDrop;
    }, { id: 'file-drop', text: css });
}

exports.defineFileDrop = defineFileDrop;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.9.0/dist/widgets/file-drop.cjs.map