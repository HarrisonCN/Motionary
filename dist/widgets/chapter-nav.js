import { f as defineElement } from '../chunks/base-zSGb8ujt.js';

var css = "usa-chapter-nav{display:block;max-width:100%;font:13px/1.3 system-ui,sans-serif;color:#0f172a}usa-chapter-nav .usa-cn-list{display:flex;gap:6px;margin:0;padding:0;list-style:none;overflow-x:auto;scrollbar-width:none}usa-chapter-nav[data-orientation=vertical] .usa-cn-list{flex-direction:column;overflow:visible}usa-chapter-nav li{flex:1 1 0;min-width:84px}usa-chapter-nav .usa-cn-item{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;align-items:center;gap:4px 8px;width:100%;padding:8px 10px;border:0;border-radius:10px;background:rgba(15,23,42,.05);color:inherit;font:inherit;text-align:left;cursor:pointer}usa-chapter-nav .usa-cn-item[aria-current]{background:#eef2ff;color:#3730a3}usa-chapter-nav .usa-cn-item:focus-visible{outline:2px solid #6366f1;outline-offset:1px}usa-chapter-nav .usa-cn-num{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#e2e8f0;font-weight:700;font-size:11px}usa-chapter-nav [aria-current] .usa-cn-num{background:#4f46e5;color:#fff}usa-chapter-nav .usa-cn-title{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-weight:600}usa-chapter-nav .usa-cn-bar{grid-column:1/-1;height:3px;border-radius:2px;background:rgba(15,23,42,.1);overflow:hidden}usa-chapter-nav .usa-cn-bar i{display:block;height:100%;background:#4f46e5;transform:scaleX(var(--p,0));transform-origin:0 50%;transition:transform .15s linear}@media (prefers-reduced-motion:reduce){usa-chapter-nav .usa-cn-bar i{transition:none}}";

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineChapterNav(tag = 'usa-chapter-nav') {
    return defineElement(tag, (Base) => {
        class UsaChapterNav extends Base {
            constructor() {
                super(...arguments);
                this._cur = -1;
                this._secs = [];
            }
            static get observedAttributes() {
                return ['for', 'orientation', 'label'];
            }
            get current() {
                return this._cur;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const root = (this.str('for') && document.querySelector(this.str('for'))) || document;
                this._secs = Array.from(root.querySelectorAll('[data-chapter]'));
                this.setAttribute('role', 'navigation');
                this.setAttribute('aria-label', this.str('label', 'Chapters'));
                this.setAttribute('data-orientation', this.str('orientation') === 'vertical' ? 'vertical' : 'horizontal');
                const title = (s, i) => s.dataset.chapter || s.querySelector('h1,h2,h3,h4')?.textContent?.trim() || `Chapter ${i + 1}`;
                this.insertAdjacentHTML('beforeend', `<ol class="usa-cn-list" data-usa-part>${this._secs.map((s, i) => `<li><button type="button" class="usa-cn-item" data-i="${i}"><span class="usa-cn-num">${i + 1}</span><span class="usa-cn-title">${esc(title(s, i))}</span><span class="usa-cn-bar" aria-hidden="true"><i></i></span></button></li>`).join('')}</ol>`);
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('.usa-cn-item');
                    if (b)
                        this.goTo(Number(b.dataset.i));
                });
                const update = () => {
                    const vh = innerHeight || 1;
                    let cur = 0;
                    this._secs.forEach((s, i) => {
                        const r = s.getBoundingClientRect();
                        const p = r.height ? Math.min(1, Math.max(0, (vh * 0.35 - r.top) / r.height)) : 0;
                        this.querySelector(`.usa-cn-item[data-i="${i}"] .usa-cn-bar i`)?.style.setProperty('--p', String(Math.round(p * 1000) / 1000));
                        if (r.top <= vh * 0.35)
                            cur = i;
                    });
                    this.setCurrent(cur);
                };
                this.listen(window, 'scroll', update, { passive: true });
                this.listen(window, 'resize', update);
                update();
            }
            setCurrent(i) {
                if (i === this._cur || !this._secs.length)
                    return;
                this._cur = i;
                this.querySelectorAll('.usa-cn-item').forEach((b, k) => {
                    if (k === i)
                        b.setAttribute('aria-current', 'step');
                    else
                        b.removeAttribute('aria-current');
                });
                const s = this._secs[i];
                this.emit('chapter', { index: i, title: this.querySelector(`.usa-cn-item[data-i="${i}"] .usa-cn-title`)?.textContent || '' });
                if (s && !this.reduced) {
                    const b = this.querySelector(`.usa-cn-item[data-i="${i}"] .usa-cn-num`);
                    if (b)
                        this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.3,1.4,.5,1)' });
                }
            }
            goTo(i) {
                const s = this._secs[i];
                if (!s)
                    return;
                s.scrollIntoView?.({ behavior: this.reduced ? 'auto' : 'smooth', block: 'start' });
                this.setCurrent(i);
            }
        }
        return UsaChapterNav;
    }, { id: 'chapter-nav', text: css });
}

export { defineChapterNav };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/widgets/chapter-nav.js.map