'use strict';

var base = require('./base-vu_KhBiv.cjs');

var css = "usa-leaderboard{display:block;width:var(--usa-lb-w,320px);max-width:100%;font:500 14px/1.2 system-ui,sans-serif}.usa-lb-list{margin:0;padding:0;list-style:none;display:grid;gap:4px}.usa-lb-row{display:grid;grid-template-columns:28px 30px 1fr auto auto;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:var(--usa-lb-bg,rgba(15,23,42,.04));position:relative}.usa-lb-row[data-me]{box-shadow:inset 0 0 0 2px var(--usa-lb-accent,#7c5cff)}.usa-lb-rank{text-align:center;font-weight:800;font-size:15px}.usa-lb-av{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#22d3ee) center/cover;color:#fff;font-weight:700;font-size:13px}.usa-lb-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-lb-delta{font:700 11px/1 system-ui,sans-serif;font-style:normal}.usa-lb-row[data-move=up] .usa-lb-delta{color:#16a34a}.usa-lb-row[data-move=down] .usa-lb-delta{color:#dc2626}.usa-lb-score{font-variant-numeric:tabular-nums;font-weight:800}.usa-lb-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}";

/** Sort rows by score desc, then name (7.5). */
const rankRows = (rows) => [...rows].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
const MEDAL = ['🥇', '🥈', '🥉'];
function defineLeaderboard(tag = 'usa-leaderboard') {
    return base.defineElement(tag, (Base) => {
        class UsaLeaderboard extends Base {
            constructor() {
                super(...arguments);
                this._rows = [];
            }
            static get observedAttributes() {
                return ['label', 'limit', 'me'];
            }
            get rows() {
                return rankRows(this._rows).map((r) => ({ ...r }));
            }
            set rows(v) {
                this._rows = (v || []).map((r) => ({ ...r, score: Number(r.score) || 0 }));
                if (this.isConnected)
                    this.render();
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const seed = Array.from(this.querySelectorAll(':scope > li'));
                if (seed.length)
                    this._rows = seed.map((li) => ({ name: (li.textContent || '').trim(), score: Number(li.dataset.score) || 0, avatar: li.dataset.avatar }));
                seed.forEach((li) => li.remove());
                this.insertAdjacentHTML('beforeend', '<ol class="usa-lb-list" data-usa-part></ol><span class="usa-lb-live" data-usa-part aria-live="polite"></span>');
                this.querySelector('.usa-lb-list').setAttribute('aria-label', this.str('label', 'Leaderboard'));
                this.render();
            }
            setScore(name, score) {
                const r = this._rows.find((x) => x.name === name);
                if (r)
                    r.score = score;
                else
                    this._rows.push({ name, score });
                this.render();
            }
            render() {
                const list = this.querySelector('.usa-lb-list');
                if (!list)
                    return;
                const ranked = rankRows(this._rows).slice(0, this.num('limit', 10));
                const old = new Map();
                Array.from(list.children).forEach((li) => {
                    const h = li;
                    old.set(h.dataset.name, { li: h, top: h.getBoundingClientRect().top, rank: Number(h.dataset.rank), score: Number(h.dataset.score) });
                });
                const me = this.str('me', '');
                const moves = [];
                ranked.forEach((r, i) => {
                    const prev = old.get(r.name);
                    old.delete(r.name);
                    const li = prev?.li || document.createElement('li');
                    if (!prev) {
                        li.className = 'usa-lb-row';
                        li.innerHTML = '<b class="usa-lb-rank" aria-hidden="true"></b><span class="usa-lb-av" aria-hidden="true"></span><span class="usa-lb-name"></span><i class="usa-lb-delta" aria-hidden="true"></i><span class="usa-lb-score"></span>';
                    }
                    li.dataset.name = r.name;
                    li.dataset.rank = String(i + 1);
                    li.dataset.score = String(r.score);
                    li.toggleAttribute('data-me', r.name === me);
                    li.querySelector('.usa-lb-rank').textContent = MEDAL[i] || String(i + 1);
                    const av = li.querySelector('.usa-lb-av');
                    av.textContent = r.avatar ? '' : Array.from(r.name)[0] || '?';
                    av.style.backgroundImage = r.avatar ? `url("${r.avatar}")` : '';
                    li.querySelector('.usa-lb-name').textContent = r.name;
                    li.setAttribute('aria-label', `${i + 1}. ${r.name}, ${r.score} points`);
                    const sc = li.querySelector('.usa-lb-score');
                    const delta = li.querySelector('.usa-lb-delta');
                    list.appendChild(li);
                    if (prev && prev.rank !== i + 1) {
                        const d = prev.rank - (i + 1);
                        delta.textContent = d > 0 ? `▲${d}` : `▼${-d}`;
                        li.dataset.move = d > 0 ? 'up' : 'down';
                        moves.push(`${r.name} ${d > 0 ? 'up' : 'down'} to ${i + 1}`);
                        this.emit('rank', { name: r.name, from: prev.rank, to: i + 1 });
                    }
                    else if (prev) {
                        delete li.dataset.move;
                        delta.textContent = '';
                    }
                    if (!this.reduced && prev) {
                        const dy = prev.top - li.getBoundingClientRect().top;
                        if (dy)
                            this.motion(li, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.9,.3,1)' });
                        if (li.dataset.move)
                            this.motion(li, [{ backgroundColor: li.dataset.move === 'up' ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.2)' }, { backgroundColor: 'transparent' }], { duration: 1200, composite: 'add' });
                    }
                    this.roll(sc, prev ? prev.score : r.score, r.score);
                });
                old.forEach(({ li }) => li.remove());
                if (moves.length)
                    this.querySelector('.usa-lb-live').textContent = moves.join('; ');
            }
            roll(el, from, to) {
                if (this.reduced || from === to || typeof requestAnimationFrame !== 'function')
                    return void (el.textContent = to.toLocaleString());
                const t0 = performance.now();
                const f = (now) => {
                    const k = Math.min(1, (now - t0) / 600);
                    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))).toLocaleString();
                    if (k < 1)
                        requestAnimationFrame(f);
                };
                requestAnimationFrame(f);
            }
        }
        return UsaLeaderboard;
    }, { id: 'leaderboard', text: css });
}

exports.defineLeaderboard = defineLeaderboard;
exports.rankRows = rankRows;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/chunks/leaderboard-wF-UnLbY.cjs.map