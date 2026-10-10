'use strict';

var base = require('../chunks/base-BG_mxssu.cjs');
var shared = require('../chunks/shared-BxK1D7EZ.cjs');

var css = "usa-kanban{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(140px,1fr);gap:12px;max-width:100%;overflow-x:auto;padding:4px;font:500 13px/1.35 system-ui,sans-serif}.usa-kb-col{display:flex;flex-direction:column;gap:8px;min-height:80px;padding:10px;border-radius:14px;background:rgba(127,127,127,.12);margin:0;list-style:none}.usa-kb-col>h1,.usa-kb-col>h2,.usa-kb-col>h3,.usa-kb-col>h4{margin:0 0 2px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;opacity:.7}.usa-kb-card{padding:10px 12px;border-radius:10px;background:var(--usa-kb-card,#fff);color:#111;box-shadow:0 1px 3px rgba(0,0,0,.14);cursor:grab;touch-action:none;user-select:none;outline-offset:2px}.usa-kb-card:focus-visible{outline:2px solid #7c5cff}.usa-kb-lifted{cursor:grabbing;box-shadow:0 18px 30px -8px rgba(0,0,0,.35);transition:transform .12s}.usa-kb-held{outline:2px dashed #7c5cff;transform:scale(1.03)}.usa-kb-ph{border-radius:10px;border:2px dashed rgba(124,92,255,.5);background:rgba(124,92,255,.08)}.usa-kb-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}@media (prefers-reduced-motion:reduce){.usa-kb-lifted,.usa-kb-held{transition:none;transform:none!important}}";

function defineKanban(tag = 'usa-kanban') {
    return base.defineElement(tag, (Base) => {
        class UsaKanban extends Base {
            constructor() {
                super(...arguments);
                this._cols = [];
                this._live = null;
                this._held = null;
            }
            static get observedAttributes() {
                return ['label'];
            }
            get columns() {
                return this._cols;
            }
            cardsOf(col) {
                return Array.from(col.children).filter((c) => c instanceof HTMLElement && (c.hasAttribute('data-card') || c.localName === 'li'));
            }
            mount() {
                this._cols = shared.ownChildren(this);
                this.setAttribute('role', 'group');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Board'));
                if (!this.querySelector(':scope > .usa-kb-live')) {
                    const l = document.createElement('span');
                    l.className = 'usa-kb-live';
                    l.setAttribute('data-usa-part', '');
                    l.setAttribute('aria-live', 'polite');
                    this.appendChild(l);
                }
                this._live = this.querySelector('.usa-kb-live');
                this._cols.forEach((col) => {
                    col.classList.add('usa-kb-col');
                    col.setAttribute('role', 'list');
                    const title = col.dataset.title || col.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || '';
                    if (title)
                        col.setAttribute('aria-label', title);
                    this.cardsOf(col).forEach((c) => this.prepCard(c));
                });
                this.listen(this, 'pointerdown', (e) => this.drag(e));
                this.listen(this, 'keydown', (e) => this.key(e));
            }
            prepCard(c) {
                c.classList.add('usa-kb-card');
                c.setAttribute('role', 'listitem');
                if (!c.hasAttribute('tabindex'))
                    c.tabIndex = 0;
                c.setAttribute('aria-roledescription', 'draggable card');
            }
            say(msg) {
                if (this._live)
                    this._live.textContent = msg;
            }
            colName(col) {
                return col.getAttribute('aria-label') || `column ${this._cols.indexOf(col) + 1}`;
            }
            /** FLIP: run `change`, then glide every card from its old box. */
            flip(change) {
                const cards = this._cols.flatMap((c) => this.cardsOf(c));
                const before = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
                change();
                if (this.reduced)
                    return;
                for (const c of cards) {
                    const a = before.get(c);
                    const b = c.getBoundingClientRect();
                    const dx = a.left - b.left;
                    const dy = a.top - b.top;
                    if ((dx || dy) && c !== this._held)
                        this.motion(c, [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
                }
            }
            move(card, to, index) {
                const from = card.parentElement;
                const list = this.cardsOf(to).filter((c) => c !== card);
                const i = Math.max(0, Math.min(list.length, index));
                this.flip(() => {
                    const ref = list[i] || null;
                    if (ref)
                        to.insertBefore(card, ref);
                    else
                        to.appendChild(card);
                });
                this.emit('move', { card, from, to, index: i });
            }
            drag(e) {
                const card = e.target.closest?.('.usa-kb-card');
                if (!card || !this.contains(card) || e.button > 0)
                    return;
                const r = card.getBoundingClientRect();
                const ox = e.clientX - r.left;
                const oy = e.clientY - r.top;
                let started = false;
                let lastX = e.clientX;
                const ghost = card;
                const ph = document.createElement('div');
                ph.className = 'usa-kb-ph';
                ph.setAttribute('data-usa-part', '');
                const onMove = (ev) => {
                    if (!started) {
                        if (Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 6)
                            return;
                        started = true;
                        ph.style.height = r.height + 'px';
                        card.parentElement.insertBefore(ph, card);
                        ghost.classList.add('usa-kb-lifted');
                        ghost.style.width = r.width + 'px';
                        ghost.style.position = 'fixed';
                        ghost.style.zIndex = '1000';
                        ghost.style.pointerEvents = 'none';
                    }
                    ev.preventDefault();
                    const tilt = this.reduced ? 0 : Math.max(-8, Math.min(8, (ev.clientX - lastX) * 0.8));
                    lastX = ev.clientX;
                    ghost.style.left = ev.clientX - ox + 'px';
                    ghost.style.top = ev.clientY - oy + 'px';
                    ghost.style.transform = `rotate(${tilt}deg) scale(${this.reduced ? 1 : 1.04})`;
                    const col = this._cols.find((c) => {
                        const b = c.getBoundingClientRect();
                        return ev.clientX >= b.left && ev.clientX <= b.right;
                    });
                    if (!col)
                        return;
                    const cards = this.cardsOf(col).filter((c) => c !== card);
                    const at = cards.find((c) => {
                        const b = c.getBoundingClientRect();
                        return ev.clientY < b.top + b.height / 2;
                    });
                    if (ph.parentElement !== col || ph.nextElementSibling !== (at || null))
                        this.flip(() => (at ? col.insertBefore(ph, at) : col.appendChild(ph)));
                };
                const onUp = () => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                    window.removeEventListener('pointercancel', onUp);
                    if (!started)
                        return;
                    const to = ph.parentElement;
                    const index = this.cardsOf(to).filter((c) => c !== card).indexOf(ph.nextElementSibling);
                    const from = card.parentElement;
                    const g = ghost.getBoundingClientRect();
                    to.insertBefore(card, ph);
                    ph.remove();
                    ghost.classList.remove('usa-kb-lifted');
                    ghost.style.cssText = '';
                    const b = card.getBoundingClientRect();
                    if (!this.reduced)
                        this.motion(card, [{ transform: `translate(${g.left - b.left}px,${g.top - b.top}px) rotate(3deg)` }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
                    const list = this.cardsOf(to);
                    this.emit('move', { card, from, to, index: index < 0 ? list.indexOf(card) : list.indexOf(card) });
                    this.say(`Moved to ${this.colName(to)}, position ${list.indexOf(card) + 1}`);
                };
                window.addEventListener('pointermove', onMove, { passive: false });
                window.addEventListener('pointerup', onUp);
                window.addEventListener('pointercancel', onUp);
            }
            key(e) {
                const card = e.target.closest?.('.usa-kb-card');
                if (!card)
                    return;
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (this._held === card) {
                        card.removeAttribute('aria-grabbed');
                        card.classList.remove('usa-kb-held');
                        this._held = null;
                        this.say(`Dropped in ${this.colName(card.parentElement)}`);
                    }
                    else {
                        this._held = card;
                        card.setAttribute('aria-grabbed', 'true');
                        card.classList.add('usa-kb-held');
                        this.say('Picked up. Use arrow keys to move, Space to drop.');
                    }
                    return;
                }
                if (e.key === 'Escape' && this._held) {
                    this._held.classList.remove('usa-kb-held');
                    this._held.removeAttribute('aria-grabbed');
                    this._held = null;
                    return;
                }
                if (this._held !== card)
                    return;
                const col = card.parentElement;
                const ci = this._cols.indexOf(col);
                const idx = this.cardsOf(col).indexOf(card);
                let to = col;
                let i = idx;
                if (e.key === 'ArrowLeft' && ci > 0)
                    (to = this._cols[ci - 1]), (i = Math.min(idx, this.cardsOf(to).length));
                else if (e.key === 'ArrowRight' && ci < this._cols.length - 1)
                    (to = this._cols[ci + 1]), (i = Math.min(idx, this.cardsOf(to).length));
                else if (e.key === 'ArrowUp')
                    i = Math.max(0, idx - 1);
                else if (e.key === 'ArrowDown')
                    i = idx + 1;
                else
                    return;
                e.preventDefault();
                this.move(card, to, i);
                card.focus();
                this.say(`${this.colName(to)}, position ${this.cardsOf(to).indexOf(card) + 1}`);
            }
        }
        return UsaKanban;
    }, { id: 'kanban', text: css });
}

exports.defineKanban = defineKanban;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/widgets/kanban.cjs.map