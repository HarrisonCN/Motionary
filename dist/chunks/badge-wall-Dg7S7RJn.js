import { f as defineElement } from './base-zSGb8ujt.js';

var css = "usa-badge-wall{display:block;width:var(--usa-bw-w,320px);max-width:100%;font:600 12px/1.2 system-ui,sans-serif}.usa-bw-count{margin:0 0 8px;font-size:13px;opacity:.75;font-variant-numeric:tabular-nums}.usa-bw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px;margin:0;padding:0;list-style:none}.usa-bw-badge{position:relative;display:grid;justify-items:center;gap:4px;padding:8px 4px;border-radius:12px;background:linear-gradient(160deg,#fde68a,#f59e0b);color:#422006;text-align:center;overflow:hidden}.usa-bw-icon{font-size:24px;line-height:1}.usa-bw-name{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-bw-badge[data-locked]{background:var(--usa-bw-locked,#e2e8f0);color:#64748b}.usa-bw-badge[data-locked] .usa-bw-icon{filter:grayscale(1);opacity:.45}.usa-bw-badge[data-locked]::after{content:\"🔒\";position:absolute;top:3px;right:4px;font-size:11px}.usa-bw-badge[data-shine]::before{content:\"\";position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.75) 50%,transparent 65%) 120% 0/250% 100%;animation:usa-bw-shine 1s ease-in-out .3s both;pointer-events:none}@keyframes usa-bw-shine{to{background-position:-20% 0}}.usa-bw-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}@media (prefers-reduced-motion:reduce){.usa-bw-badge[data-shine]::before{animation:none;display:none}}";

/** Unlocked / total counts for a badge list (7.5). */
const badgeProgress = (b) => ({ unlocked: b.filter((x) => !x.locked).length, total: b.length });
function defineBadgeWall(tag = 'usa-badge-wall') {
    return defineElement(tag, (Base) => {
        class UsaBadgeWall extends Base {
            constructor() {
                super(...arguments);
                this._b = [];
            }
            static get observedAttributes() {
                return ['label'];
            }
            get badges() {
                return this._b.map((b) => ({ ...b }));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const seed = Array.from(this.querySelectorAll(':scope > li'));
                if (seed.length)
                    this._b = seed.map((li) => ({ name: (li.textContent || '').trim(), icon: li.dataset.icon || '🏅', locked: li.hasAttribute('data-locked') }));
                seed.forEach((li) => li.remove());
                this.insertAdjacentHTML('beforeend', '<p class="usa-bw-count" data-usa-part></p><ul class="usa-bw-grid" data-usa-part></ul><span class="usa-bw-live" data-usa-part aria-live="polite"></span>');
                const grid = this.querySelector('.usa-bw-grid');
                grid.setAttribute('aria-label', this.str('label', 'Achievements'));
                for (const b of this._b) {
                    const li = document.createElement('li');
                    li.className = 'usa-bw-badge';
                    li.innerHTML = '<span class="usa-bw-icon" aria-hidden="true"></span><span class="usa-bw-name"></span>';
                    li.querySelector('.usa-bw-icon').textContent = b.icon;
                    li.querySelector('.usa-bw-name').textContent = b.name;
                    li.dataset.name = b.name;
                    grid.appendChild(li);
                    this.paintBadge(li, b);
                }
                this.count();
            }
            paintBadge(li, b) {
                li.toggleAttribute('data-locked', b.locked);
                li.setAttribute('aria-label', `${b.name}, ${b.locked ? 'locked' : 'unlocked'}`);
            }
            count() {
                const p = badgeProgress(this._b);
                this.querySelector('.usa-bw-count').textContent = `${p.unlocked} / ${p.total} unlocked`;
            }
            unlock(name) {
                const b = this._b.find((x) => x.name === name && x.locked);
                if (!b)
                    return false;
                b.locked = false;
                const li = Array.from(this.querySelectorAll('.usa-bw-badge')).find((x) => x.dataset.name === name);
                if (li) {
                    if (!this.reduced) {
                        this.motion(li, [{ transform: 'perspective(400px) rotateY(0)' }, { transform: 'perspective(400px) rotateY(90deg)', offset: 0.45 }, { transform: 'perspective(400px) rotateY(0) scale(1.12)', offset: 0.8 }, { transform: 'none' }], { duration: 700, easing: 'ease-out' });
                        setTimeout(() => this.paintBadge(li, b), 300);
                        li.dataset.shine = '';
                        setTimeout(() => delete li.dataset.shine, 1100);
                    }
                    else
                        this.paintBadge(li, b);
                    li.setAttribute('aria-label', `${b.name}, unlocked`);
                }
                this.count();
                this.querySelector('.usa-bw-live').textContent = `Unlocked: ${name}`;
                this.emit('unlock', { name });
                return true;
            }
        }
        return UsaBadgeWall;
    }, { id: 'badge-wall', text: css });
}

export { badgeProgress as b, defineBadgeWall as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.1.0/dist/chunks/badge-wall-Dg7S7RJn.js.map