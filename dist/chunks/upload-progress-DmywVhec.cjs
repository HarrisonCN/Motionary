'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-upload-progress{display:block;width:var(--usa-up-w,300px);max-width:100%;font:500 13px/1.3 system-ui,sans-serif;--usa-up-accent:#6366f1}.usa-up{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:var(--usa-up-bg,rgba(148,163,184,.1));border:1px solid rgba(100,116,139,.18)}.usa-up-icon{flex:none;display:grid;place-items:center;width:34px;height:40px;border-radius:6px;background:var(--usa-up-accent);color:#fff;font:800 9px/1 system-ui,sans-serif;letter-spacing:.04em}.usa-up-main{flex:1;min-width:0}.usa-up-top,.usa-up-sub{display:flex;align-items:center;gap:8px}.usa-up-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:650}.usa-up-pct{font-variant-numeric:tabular-nums;font-weight:700;color:var(--usa-up-accent)}.usa-up-track{position:relative;height:6px;margin:6px 0 4px;border-radius:3px;background:rgba(100,116,139,.2);overflow:hidden}.usa-up-fill{position:absolute;inset:0;border-radius:inherit;background:var(--usa-up-accent);transform-origin:0 50%;transform:scaleX(0);overflow:hidden}usa-upload-progress[data-state=uploading] .usa-up-fill::after{content:\"\";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:translateX(-100%);animation:usa-up-shine 1.2s linear infinite}@keyframes usa-up-shine{to{transform:translateX(100%)}}.usa-up-sub{font-size:11.5px;color:var(--usa-up-muted,#64748b)}.usa-up-msg{flex:1;color:#e11d48}.usa-up-retry{display:none;border:0;background:none;padding:0;font:inherit;font-weight:700;color:var(--usa-up-accent);cursor:pointer}usa-upload-progress[data-state=error] .usa-up-retry{display:inline}usa-upload-progress[data-state=error] .usa-up-fill{background:#e11d48}usa-upload-progress[data-state=error] .usa-up-icon{background:#e11d48}usa-upload-progress[data-state=done] .usa-up-fill{background:#16a34a}.usa-up-ok{flex:none;width:0;height:24px;fill:none;stroke:#16a34a;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:width .25s}.usa-up-ok circle{opacity:.25}.usa-up-ok path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .4s .15s ease-out}usa-upload-progress[data-state=done] .usa-up-ok{width:24px}usa-upload-progress[data-state=done] .usa-up-ok path{stroke-dashoffset:0}@media (prefers-reduced-motion:reduce){.usa-up-fill::after{animation:none!important;display:none}.usa-up-ok,.usa-up-ok path{transition:none}}";

/** 1536 → "1.5 KB", 2_400_000 → "2.3 MB" (7.7). */
function formatBytes(n) {
    if (!Number.isFinite(n) || n < 0)
        return '';
    const u = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (n >= 1024 && i < u.length - 1) {
        n /= 1024;
        i++;
    }
    return `${i === 0 ? Math.round(n) : n < 10 ? n.toFixed(1) : Math.round(n)} ${u[i]}`;
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineUploadProgress(tag = 'usa-upload-progress') {
    return base.defineElement(tag, (Base) => {
        class UsaUploadProgress extends Base {
            constructor() {
                super(...arguments);
                this._shown = 0;
            }
            static get observedAttributes() {
                return ['name', 'size', 'value', 'status', 'message'];
            }
            get value() {
                return base.clamp(this.num('value', 0), 0, 100);
            }
            set value(v) {
                this.setAttribute('value', String(base.clamp(Number(v) || 0, 0, 100)));
            }
            get status() {
                const s = this.str('status');
                return s === 'error' ? 'error' : s === 'done' || this.value >= 100 ? 'done' : 'uploading';
            }
            set status(s) {
                this.setAttribute('status', s);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const name = this.str('name', 'file');
                const size = formatBytes(this.num('size', NaN));
                this.insertAdjacentHTML('beforeend', `<div class="usa-up" data-usa-part><span class="usa-up-icon" aria-hidden="true">${esc((name.split('.').pop() || '').slice(0, 4).toUpperCase())}</span><div class="usa-up-main"><div class="usa-up-top"><span class="usa-up-name">${esc(name)}</span><span class="usa-up-pct"></span></div><div class="usa-up-track" role="progressbar" aria-label="Uploading ${esc(name)}" aria-valuemin="0" aria-valuemax="100"><span class="usa-up-fill"></span></div><div class="usa-up-sub"><span class="usa-up-size">${esc(size)}</span><span class="usa-up-msg" aria-live="polite"></span><button type="button" class="usa-up-retry">Retry</button></div></div><svg class="usa-up-ok" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path pathLength="1" d="M7 12.5l3.2 3.2L17 9"/></svg></div>`);
                this.listen(this.querySelector('.usa-up-retry'), 'click', () => this.emit('retry', { name }));
                this._shown = 0;
                this.render(true);
            }
            changed(name) {
                if (name === 'name' || name === 'size')
                    return super.changed(name);
                this.render(false);
            }
            render(first) {
                const fill = this.querySelector('.usa-up-fill');
                if (!fill)
                    return;
                const v = this.value;
                const st = this.status;
                const prevState = this.getAttribute('data-state');
                this.setAttribute('data-state', st);
                const track = this.querySelector('.usa-up-track');
                track.setAttribute('aria-valuenow', String(Math.round(v)));
                track.setAttribute('aria-valuetext', st === 'done' ? 'Complete' : st === 'error' ? 'Failed' : `${Math.round(v)}%`);
                this.querySelector('.usa-up-pct').textContent = st === 'done' ? 'Done' : st === 'error' ? '' : `${Math.round(v)}%`;
                this.querySelector('.usa-up-msg').textContent = st === 'error' ? this.str('message', 'Upload failed') : '';
                const from = this._shown;
                const to = st === 'done' ? 100 : v;
                fill.style.transform = `scaleX(${to / 100})`;
                if (!first && !this.reduced && from !== to)
                    this.motion(fill, [{ transform: `scaleX(${from / 100})` }, { transform: `scaleX(${to / 100})` }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
                this._shown = to;
                if (prevState === st)
                    return;
                if (st === 'done' && !first)
                    this.emit('done', { name: this.str('name') });
                if (st === 'error' && !first) {
                    if (!this.reduced)
                        this.motion(this.querySelector('.usa-up'), [{ transform: 'none' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 380, easing: 'ease-out' });
                    this.emit('error', { name: this.str('name'), message: this.str('message', 'Upload failed') });
                }
            }
        }
        return UsaUploadProgress;
    }, { id: 'upload-progress', text: css });
}

exports.defineUploadProgress = defineUploadProgress;
exports.formatBytes = formatBytes;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.4.0/dist/chunks/upload-progress-DmywVhec.cjs.map