import { f as defineElement } from './base-zSGb8ujt.js';

var css = "usa-suggestion-chips{display:block;max-width:100%;font:500 13px/1.2 system-ui,sans-serif;--usa-sc-accent:#6366f1}.usa-sc{display:flex;flex-wrap:wrap;gap:8px}.usa-sc>span{display:contents}.usa-sc-chip{padding:8px 13px;border-radius:999px;border:1px solid color-mix(in srgb,var(--usa-sc-accent) 35%,transparent);background:color-mix(in srgb,var(--usa-sc-accent) 8%,var(--usa-sc-bg,#fff));color:inherit;font:inherit;cursor:pointer;transition:background .2s,border-color .2s,opacity .3s,transform .3s}.usa-sc-chip:hover,.usa-sc-chip:focus-visible{background:color-mix(in srgb,var(--usa-sc-accent) 16%,var(--usa-sc-bg,#fff));outline:none;border-color:var(--usa-sc-accent)}.usa-sc-chip[data-picked]{background:var(--usa-sc-accent);border-color:var(--usa-sc-accent);color:#fff}.usa-sc-chip[data-gone]{opacity:0;transform:scale(.85);pointer-events:none}@media (prefers-reduced-motion:reduce){.usa-sc-chip{transition:none}}";

/** "a | b|c" → ["a", "b", "c"] (7.8). */
function parseChips(s) {
    return s
        .split(/\||\n/)
        .map((t) => t.trim())
        .filter(Boolean);
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineSuggestionChips(tag = 'usa-suggestion-chips') {
    return defineElement(tag, (Base) => {
        class UsaSuggestionChips extends Base {
            constructor() {
                super(...arguments);
                this._items = null;
                this._entered = false;
            }
            static get observedAttributes() {
                return ['items', 'label', 'dismiss'];
            }
            get items() {
                if (this._items)
                    return this._items.slice();
                const attr = this.str('items');
                if (attr)
                    return parseChips(attr);
                const kids = Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
                return kids.length ? kids.map((c) => (c.textContent || '').trim()).filter(Boolean) : parseChips(this.getAttribute('data-text') || '');
            }
            set items(v) {
                this.setItems(v);
            }
            setItems(items) {
                this._items = items.map(String).filter((t) => t.trim());
                this.mount();
            }
            mount() {
                const items = this.items;
                if (!this._items && !this.str('items')) {
                    // keep authored content as the source of truth, hidden
                    Array.from(this.children).forEach((c) => !c.hasAttribute('data-usa-part') && c.setAttribute('hidden', ''));
                }
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('beforeend', `<div class="usa-sc" role="list" aria-label="${esc(this.str('label', 'Suggestions'))}" data-usa-part>${items.map((t, i) => `<span role="listitem"><button type="button" class="usa-sc-chip" data-i="${i}">${esc(t)}</button></span>`).join('')}</div>`);
                const chips = Array.from(this.querySelectorAll('.usa-sc-chip'));
                chips.forEach((c, i) => {
                    this.listen(c, 'click', () => this.pick(i));
                    this.listen(c, 'keydown', (e) => {
                        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                        if (!d)
                            return;
                        e.preventDefault();
                        chips[(i + d + chips.length) % chips.length].focus();
                    });
                });
                this.inView((v) => v && this.enter(), { threshold: 0.2 });
            }
            enter() {
                if (this._entered && !this._items)
                    return;
                this._entered = true;
                if (this.reduced)
                    return;
                this.querySelectorAll('.usa-sc-chip').forEach((c, i) => this.motion(c, [{ opacity: 0, transform: 'translateY(10px) scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: i * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
            }
            pick(i) {
                const chips = Array.from(this.querySelectorAll('.usa-sc-chip'));
                const c = chips[i];
                if (!c)
                    return;
                chips.forEach((x) => x.toggleAttribute('data-picked', x === c));
                if (!this.reduced)
                    this.motion(c, [{ transform: 'none' }, { transform: 'scale(1.1)' }, { transform: 'none' }], { duration: 280, easing: 'ease-out' });
                if (this.flag('dismiss'))
                    chips.forEach((x) => {
                        if (x === c)
                            return;
                        x.setAttribute('data-gone', '');
                        x.disabled = true;
                    });
                this.emit('pick', { text: c.textContent, index: i });
            }
        }
        return UsaSuggestionChips;
    }, { id: 'suggestion-chips', text: css });
}

export { defineSuggestionChips as d, parseChips as p };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.3.0/dist/chunks/suggestion-chips-CtgmWPtH.js.map