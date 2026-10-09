import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { h as hasModule, r as requireModule } from '../chunks/registry-DZMe2rVp.js';

var css = "usa-motion-inspector{display:block;max-width:100%;box-sizing:border-box;padding:10px;border-radius:14px;background:#0f172a;color:#e2e8f0;font:12px/1.4 system-ui,sans-serif}usa-motion-inspector .usa-mi-bar{display:flex;justify-content:space-between;gap:8px;align-items:baseline;flex-wrap:wrap}usa-motion-inspector .usa-mi-rt{color:#94a3b8;font:11px/1.2 ui-monospace,monospace}usa-motion-inspector .usa-mi-tools{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0}usa-motion-inspector button{padding:4px 8px;border:1px solid #334155;border-radius:7px;background:#1e293b;color:#e2e8f0;font:600 11px/1 system-ui,sans-serif;cursor:pointer}usa-motion-inspector button[aria-pressed=true]{background:#6366f1;border-color:#6366f1}usa-motion-inspector .usa-mi-list{margin:0;padding:0;list-style:none;display:grid;gap:4px;max-height:180px;overflow:auto}usa-motion-inspector .usa-mi-list li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;padding:5px 6px;border-radius:7px;background:#1e293b}usa-motion-inspector .usa-mi-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11px/1.3 ui-monospace,monospace}usa-motion-inspector .usa-mi-state{color:#a5b4fc;font-size:10.5px}usa-motion-inspector li[data-state=paused] .usa-mi-state{color:#fbbf24}usa-motion-inspector input[type=range]{grid-column:1/-1;width:100%;margin:0;accent-color:#818cf8}usa-motion-inspector .usa-mi-empty{display:block!important;color:#94a3b8}";

const label = (a) => {
    const t = a.effect?.target;
    const name = a.animationName || a.transitionProperty || a.id || 'animate()';
    if (!t)
        return name;
    const cls = typeof t.className === 'string' && t.className.trim() ? '.' + t.className.trim().split(/\s+/)[0] : '';
    return `${t.localName}${t.id ? '#' + t.id : cls} · ${name}`;
};
function defineMotionInspector(tag = 'usa-motion-inspector') {
    return defineElement(tag, (Base) => {
        class UsaMotionInspector extends Base {
            constructor() {
                super(...arguments);
                this.rate = 1;
            }
            static get observedAttributes() {
                return ['scope', 'interval'];
            }
            animations() {
                const scope = this.str('scope') ? document.querySelector(this.str('scope')) : document;
                if (!scope)
                    return [];
                const list = typeof scope.getAnimations === 'function' ? scope.getAnimations(scope === document ? undefined : { subtree: true }) : [];
                return list.filter((a) => !this.contains(a.effect?.target || null));
            }
            pauseAll() {
                this.animations().forEach((a) => a.pause());
                this.refresh();
            }
            playAll() {
                this.animations().forEach((a) => a.play());
                this.refresh();
            }
            setRate(rate) {
                this.rate = rate > 0 ? rate : 1;
                this.animations().forEach((a) => (a.playbackRate = this.rate));
                if (hasModule('core'))
                    requireModule('core').getTicker().timeScale = this.rate;
                this.querySelectorAll('[data-rate]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.rate) === this.rate)));
                this.emit('change', { rate: this.rate });
            }
            mount() {
                this.innerHTML = '<div class="usa-mi-bar"><strong>Motion inspector</strong><span class="usa-mi-rt" aria-live="polite"></span></div><div class="usa-mi-tools" role="toolbar" aria-label="Animation controls"><button type="button" data-act="pause">Pause all</button><button type="button" data-act="play">Play all</button><button type="button" data-rate="1" aria-pressed="true">1×</button><button type="button" data-rate="0.25" aria-pressed="false">0.25×</button></div><ol class="usa-mi-list" aria-label="Running animations"></ol>';
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('button');
                    if (!b)
                        return;
                    if (b.dataset.act === 'pause')
                        this.pauseAll();
                    if (b.dataset.act === 'play')
                        this.playAll();
                    if (b.dataset.rate)
                        this.setRate(Number(b.dataset.rate));
                });
                this.listen(this, 'input', (e) => {
                    const r = e.target;
                    const a = this.animations()[Number(r.dataset.i)];
                    const d = Number(a?.effect?.getComputedTiming().duration) || 0;
                    if (a && d) {
                        a.pause();
                        a.currentTime = (Number(r.value) / 100) * d;
                    }
                });
                this.refresh();
                let id = null;
                this.inView((v) => {
                    if (v && !id)
                        id = setInterval(() => this.refresh(), Math.max(100, this.num('interval', 500)));
                    if (!v && id) {
                        clearInterval(id);
                        id = null;
                    }
                });
                this.onCleanup(() => id && clearInterval(id));
            }
            refresh() {
                const list = this.querySelector('.usa-mi-list');
                if (!list)
                    return;
                const anims = this.animations();
                const rt = this.querySelector('.usa-mi-rt');
                if (hasModule('core')) {
                    const t = requireModule('core').getTicker();
                    rt.textContent = `runtime ${t.fps} fps · ${t.size} listener${t.size === 1 ? '' : 's'}`;
                }
                else
                    rt.textContent = `${anims.length} running`;
                list.textContent = '';
                anims.slice(0, 12).forEach((a, i) => {
                    const timing = a.effect?.getComputedTiming();
                    const p = Math.round((timing?.progress ?? 0) * 100);
                    const li = document.createElement('li');
                    li.dataset.state = a.playState;
                    li.innerHTML = '<span class="usa-mi-name"></span><span class="usa-mi-state"></span><input type="range" min="0" max="100" aria-label="Scrub">';
                    li.firstChild.textContent = label(a);
                    li.children[1].textContent = a.playState;
                    const r = li.querySelector('input');
                    r.value = String(p);
                    r.dataset.i = String(i);
                    list.appendChild(li);
                });
                if (!anims.length)
                    list.innerHTML = '<li class="usa-mi-empty">No running animations</li>';
                this.emit('change', { count: anims.length });
            }
        }
        return UsaMotionInspector;
    }, { id: 'motion-inspector', text: css });
}

export { defineMotionInspector };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/widgets/motion-inspector.js.map