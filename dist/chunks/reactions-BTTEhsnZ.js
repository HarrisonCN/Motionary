import { f as defineElement } from './base-zSGb8ujt.js';

var css = "usa-reactions{position:relative;display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px;font:600 13px/1 system-ui,sans-serif}.usa-rx-row{display:inline-flex;flex-wrap:wrap;gap:6px}.usa-rx-pill,.usa-rx-add{position:relative;display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border:1px solid rgba(15,23,42,.12);border-radius:999px;background:var(--usa-rx-bg,#fff);color:inherit;font:inherit;cursor:pointer}.usa-rx-pill[hidden]{display:none}.usa-rx-pill[aria-pressed=true]{border-color:var(--usa-rx-accent,#7c5cff);background:color-mix(in srgb,var(--usa-rx-accent,#7c5cff) 14%,#fff)}.usa-rx-emo{display:inline-block;font-size:15px}.usa-rx-n{display:inline-block;min-width:1ch;font-variant-numeric:tabular-nums}.usa-rx-float{position:absolute;left:50%;top:0;font-size:16px;pointer-events:none}.usa-rx-picker{position:absolute;bottom:calc(100% + 6px);left:0;display:flex;gap:2px;padding:4px;border-radius:999px;background:#fff;box-shadow:0 10px 30px -10px rgba(15,23,42,.45);transform-origin:20% 100%;z-index:5}.usa-rx-picker[hidden]{display:none}.usa-rx-picker button{border:0;background:none;font-size:20px;width:32px;height:32px;border-radius:50%;cursor:pointer}.usa-rx-picker button:hover,.usa-rx-picker button:focus-visible{background:#f1f5f9}.usa-rx-pill:focus-visible,.usa-rx-add:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}";

/** Parse "👍,❤️" + "3,1" into ordered [emoji, count] pairs (7.4). */
function parseReactions(emojis, counts = '') {
    const c = counts.split(',').map((n) => Math.max(0, parseInt(n, 10) || 0));
    return emojis.split(',').map((e) => e.trim()).filter(Boolean).map((e, i) => [e, c[i] || 0]);
}
function defineReactions(tag = 'usa-reactions') {
    return defineElement(tag, (Base) => {
        class UsaReactions extends Base {
            constructor() {
                super(...arguments);
                this._c = new Map();
                this._mine = new Set();
            }
            static get observedAttributes() {
                return ['emojis', 'counts', 'picker'];
            }
            get counts() {
                return Object.fromEntries(this._c);
            }
            get mine() {
                return Array.from(this._mine);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'group');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', 'Reactions');
                this._c = new Map(parseReactions(this.str('emojis', '👍,❤️,😂,🎉'), this.str('counts', '')));
                this.insertAdjacentHTML('beforeend', '<span class="usa-rx-row" data-usa-part></span><button type="button" class="usa-rx-add" data-usa-part aria-label="Add reaction" aria-expanded="false">＋</button><span class="usa-rx-picker" data-usa-part hidden></span>');
                const picker = this.querySelector('.usa-rx-picker');
                for (const e of this.str('picker', '👍,❤️,😂,🎉,😮,😢,🔥,👀').split(',').map((s) => s.trim()).filter(Boolean)) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.textContent = e;
                    b.setAttribute('aria-label', `React ${e}`);
                    this.listen(b, 'click', () => (this.toggle(e, true), this.pick(false)));
                    picker.appendChild(b);
                }
                this.listen(this.querySelector('.usa-rx-add'), 'click', () => this.pick(picker.hidden === true));
                this.listen(this, 'keydown', (e) => e.key === 'Escape' && this.pick(false));
                this.render(null);
            }
            pick(open) {
                const p = this.querySelector('.usa-rx-picker');
                p.hidden = !open;
                this.querySelector('.usa-rx-add').setAttribute('aria-expanded', String(open));
                if (open && !this.reduced)
                    this.motion(p, [{ transform: 'scale(.4) translateY(8px)', opacity: 0 }, { transform: 'scale(1.05)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' });
            }
            toggle(emoji, on) {
                const has = this._mine.has(emoji);
                const want = on ?? !has;
                if (want === has)
                    return;
                const n = Math.max(0, (this._c.get(emoji) || 0) + (want ? 1 : -1));
                this._c.set(emoji, n);
                want ? this._mine.add(emoji) : this._mine.delete(emoji);
                this.render(emoji, want);
                this.emit('react', { emoji, on: want, count: n });
            }
            render(changed, up = true) {
                const row = this.querySelector('.usa-rx-row');
                for (const [e, n] of this._c) {
                    let b = Array.from(row.children).find((x) => x.dataset.e === e);
                    if (!b) {
                        b = document.createElement('button');
                        b.setAttribute('type', 'button');
                        b.className = 'usa-rx-pill';
                        b.dataset.e = e;
                        b.innerHTML = '<span class="usa-rx-emo" aria-hidden="true"></span><span class="usa-rx-n" aria-hidden="true"></span>';
                        b.querySelector('.usa-rx-emo').textContent = e;
                        this.listen(b, 'click', () => this.toggle(e));
                        row.appendChild(b);
                    }
                    b.hidden = n === 0 && !this._mine.has(e);
                    b.setAttribute('aria-pressed', String(this._mine.has(e)));
                    b.setAttribute('aria-label', `${e} ${n} reaction${n === 1 ? '' : 's'}`);
                    const num = b.querySelector('.usa-rx-n');
                    num.textContent = String(n);
                    if (changed === e && !this.reduced) {
                        this.motion(b.querySelector('.usa-rx-emo'), [{ transform: 'scale(1)' }, { transform: 'scale(1.6) rotate(-12deg)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
                        this.motion(num, [{ transform: `translateY(${up ? 10 : -10}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'ease-out' });
                        if (up)
                            this.float(b, e);
                    }
                }
            }
            float(b, e) {
                for (let i = 0; i < 3; i++) {
                    const s = document.createElement('span');
                    s.className = 'usa-rx-float';
                    s.setAttribute('aria-hidden', 'true');
                    s.textContent = e;
                    b.appendChild(s);
                    const a = this.motion(s, [{ transform: 'translate(-50%,0) scale(.5)', opacity: 1 }, { transform: `translate(${ -50 + (i - 1) * 60}%,-42px) scale(1)`, opacity: 0 }], { duration: 700, delay: i * 70, easing: 'ease-out' });
                    if (a)
                        a.finished.then(() => s.remove(), () => s.remove());
                    else
                        s.remove();
                }
            }
        }
        return UsaReactions;
    }, { id: 'reactions', text: css });
}

export { defineReactions as d, parseReactions as p };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.0.0/dist/chunks/reactions-BTTEhsnZ.js.map