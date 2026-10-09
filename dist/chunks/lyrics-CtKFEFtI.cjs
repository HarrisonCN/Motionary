'use strict';

var base = require('./base-B3me2y0o.cjs');
var shared = require('./shared-BxK1D7EZ.cjs');

var css = "usa-lyrics{--usa-ly-c:#f472b6;display:block;width:var(--usa-ly-w,320px);max-width:100%;font:700 18px/1.35 system-ui,sans-serif}.usa-ly-list{height:var(--usa-ly-h,180px);margin:0;padding:70px 0;overflow-y:auto;list-style:none;scrollbar-width:none;-webkit-mask:linear-gradient(transparent,#000 25%,#000 75%,transparent);mask:linear-gradient(transparent,#000 25%,#000 75%,transparent)}.usa-ly-list::-webkit-scrollbar{display:none}.usa-ly-line{--usa-ly-k:0;padding:5px 4px;opacity:.38;cursor:pointer;transform-origin:0 50%;transition:opacity .35s,transform .35s cubic-bezier(.3,1.3,.5,1),filter .35s;filter:blur(.4px)}.usa-ly-line[data-past]{opacity:.22}.usa-ly-line[data-active]{opacity:1;filter:none;transform:scale(1.06);color:transparent;background:linear-gradient(90deg,var(--usa-ly-c) calc(var(--usa-ly-k) * 100%),var(--usa-ly-base,#94a3b8) calc(var(--usa-ly-k) * 100%));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 18px rgba(244,114,182,.25)}@media (prefers-reduced-motion:reduce){.usa-ly-line{transition:none;transform:none!important}}";

/** Parse LRC text into sorted `{ t, text }` lines. */
function parseLRC(src) {
    const out = [];
    for (const raw of src.split(/\r?\n/)) {
        const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
        const text = raw.replace(/\[[^\]]*\]/g, '').trim();
        for (const m of stamps)
            out.push({ t: Number(m[1]) * 60 + Number(m[2]), text });
    }
    return out.sort((a, b) => a.t - b.t);
}
function defineLyrics(tag = 'usa-lyrics') {
    return base.defineElement(tag, (Base) => {
        class UsaLyrics extends Base {
            constructor() {
                super(...arguments);
                this._lines = [];
                this._time = 0;
                this._active = -1;
                this._raf = 0;
            }
            get lines() {
                return this._lines.slice();
            }
            get time() {
                return this._time;
            }
            set time(v) {
                this._time = Math.max(0, Number(v) || 0);
                this.update();
            }
            mount() {
                const lrc = this.querySelector(':scope > script[type="text/plain"]');
                if (lrc?.textContent)
                    this._lines = parseLRC(lrc.textContent);
                else
                    this._lines = shared.ownChildren(this).filter((c) => c.hasAttribute('data-t')).map((c) => ({ t: Number(c.dataset.t) || 0, text: c.textContent?.trim() || '' }));
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                shared.ownChildren(this).forEach((c) => c.localName !== 'script' && (c.hidden = true));
                const list = document.createElement('ol');
                list.className = 'usa-ly-list';
                list.setAttribute('data-usa-part', '');
                this._lines.forEach((l, i) => {
                    const li = document.createElement('li');
                    li.className = 'usa-ly-line';
                    li.dataset.i = String(i);
                    li.textContent = l.text || '♪';
                    list.appendChild(li);
                });
                this.appendChild(list);
                this.setAttribute('role', 'region');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Lyrics'));
                this.listen(list, 'click', (e) => {
                    const li = e.target.closest?.('.usa-ly-line');
                    if (li)
                        this.emit('seek', { time: this._lines[Number(li.dataset.i)].t });
                });
                this._active = -1;
                const src = this.str('for', '') ? document.getElementById(this.str('for', '')) : null;
                if (src && typeof requestAnimationFrame === 'function') {
                    const f = () => {
                        const t = src.currentTime;
                        if (typeof t === 'number' && Math.abs(t - this._time) > 0.01)
                            this.time = t;
                        this._raf = requestAnimationFrame(f);
                    };
                    this._raf = requestAnimationFrame(f);
                    this.onCleanup(() => cancelAnimationFrame(this._raf));
                }
                this.update();
            }
            /** Index of the line playing at `t`. */
            lineAt(t) {
                let i = -1;
                for (let k = 0; k < this._lines.length && this._lines[k].t <= t; k++)
                    i = k;
                return i;
            }
            update() {
                const i = this.lineAt(this._time);
                const items = this.querySelectorAll('.usa-ly-line');
                const cur = this._lines[i];
                const next = this._lines[i + 1];
                const k = cur ? Math.min(1, (this._time - cur.t) / Math.max(0.3, (next ? next.t : cur.t + 4) - cur.t)) : 0;
                if (items[i])
                    items[i].style.setProperty('--usa-ly-k', this.reduced ? '1' : k.toFixed(3));
                if (i === this._active)
                    return;
                this._active = i;
                items.forEach((li, j) => {
                    li.toggleAttribute('data-active', j === i);
                    li.toggleAttribute('data-past', j < i);
                    if (j === i)
                        li.setAttribute('aria-current', 'true');
                    else
                        li.removeAttribute('aria-current');
                });
                const list = this.querySelector('.usa-ly-list');
                const li = items[i];
                if (list && li) {
                    const top = li.offsetTop - list.clientHeight / 2 + li.offsetHeight / 2;
                    if (typeof list.scrollTo === 'function')
                        list.scrollTo({ top, behavior: this.reduced ? 'auto' : 'smooth' });
                    else
                        list.scrollTop = top;
                }
            }
        }
        return UsaLyrics;
    }, { id: 'lyrics', text: css });
}

exports.defineLyrics = defineLyrics;
exports.parseLRC = parseLRC;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/chunks/lyrics-CtKFEFtI.cjs.map