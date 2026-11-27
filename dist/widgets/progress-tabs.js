import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { o as ownChildren } from '../chunks/kit-DugHPVcq.js';
import { r as rovingIndex } from '../chunks/kit-12-C5AMRg3h.js';
import { c as css } from '../chunks/ui-kit-12-D3RTFFIw.js';

function defineProgressTabs(tag = 'usa-progress-tabs') {
    const ctor = defineElement(tag, Base => class ProgressTabs extends Base {
        constructor() {
            super(...arguments);
            this._n = 0;
            this._playing = false;
        }
        static get observedAttributes() { return ['index', 'interval', 'label', 'pause-label', 'play-label']; }
        get playing() { return this._playing; }
        get index() { return Math.max(0, Math.min(Math.max(0, this._n - 1), Math.round(this.num('index', 0)))); }
        set index(i) { this.setAttribute('index', String(Math.round(Number(i)) || 0)); }
        select(i) {
            if (!this._n)
                return;
            const next = ((Math.round(i) % this._n) + this._n) % this._n;
            if (next === this.index && this.hasAttribute('index')) {
                this._sync?.();
                return;
            }
            this.index = next;
            this.emit('change', { index: next });
        }
        changed(name) { if (name === 'index')
            this._sync?.();
        else
            super.changed(name); }
        mount() {
            const kids = ownChildren(this);
            this._n = kids.length;
            const uid = `usa-ptabs-${Math.random().toString(36).slice(2, 8)}`;
            const root = make('div', 'usa-kit usa-ptabs');
            const list = make('div', 'usa-ptabs-list');
            list.setAttribute('role', 'tablist');
            list.setAttribute('aria-label', this.str('label', 'Features'));
            const panels = make('div', 'usa-ptabs-panels');
            const tabs = kids.map((k, i) => {
                const name = k.dataset.tab || k.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || String(i + 1);
                const tab = make('button', 'usa-ptabs-tab');
                tab.type = 'button';
                tab.id = `${uid}-t${i}`;
                tab.setAttribute('role', 'tab');
                tab.setAttribute('aria-controls', `${uid}-p${i}`);
                tab.append(make('span', 'usa-ptabs-name', name));
                const bar = make('span', 'usa-ptabs-bar');
                bar.setAttribute('aria-hidden', 'true');
                bar.append(make('i'));
                tab.append(bar);
                list.append(tab);
                const panel = make('div', 'usa-ptabs-panel');
                panel.id = `${uid}-p${i}`;
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', tab.id);
                panel.tabIndex = 0;
                panel.append(k);
                panels.append(panel);
                return { tab, bar: bar.firstElementChild, panel };
            });
            const ms = Math.max(0, this.num('interval', 5000));
            const auto = ms > 0 && this._n > 1 && !this.reduced;
            const toggle = make('button', 'usa-ptabs-toggle');
            toggle.type = 'button';
            root.append(list, panels);
            if (auto)
                root.append(toggle);
            root.style.setProperty('--ptabs-ms', `${Math.max(800, ms)}ms`);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            let stopped = false, inside = false, visible = true;
            const hold = () => {
                this._playing = auto && !stopped && !inside && visible;
                root.toggleAttribute('data-playing', this._playing);
                root.toggleAttribute('data-auto', auto);
                toggle.textContent = stopped ? '▶' : '❚❚';
                toggle.setAttribute('aria-label', stopped ? this.str('play-label', 'Play') : this.str('pause-label', 'Pause'));
                toggle.setAttribute('aria-pressed', String(stopped));
            };
            const sync = () => {
                const at = this.index;
                tabs.forEach(({ tab, bar, panel }, i) => {
                    const on = i === at;
                    tab.setAttribute('aria-selected', String(on));
                    tab.tabIndex = on ? 0 : -1;
                    panel.hidden = !on;
                    // restart the fill: drop the animation, force style, put it back
                    bar.style.animation = 'none';
                    void bar.offsetWidth;
                    bar.style.animation = '';
                    tab.toggleAttribute('data-done', i < at);
                });
            };
            this._sync = sync;
            tabs.forEach(({ tab, bar }, i) => {
                this.listen(tab, 'click', () => this.select(i));
                this.listen(bar, 'animationend', () => { if (this._playing && i === this.index)
                    this.select(i + 1); });
            });
            this.listen(list, 'keydown', (e) => {
                const at = tabs.findIndex((t) => t.tab === e.target);
                if (at < 0)
                    return;
                const to = rovingIndex(e.key, at, tabs.length, getComputedStyle(this).direction === 'rtl');
                if (to < 0)
                    return;
                e.preventDefault();
                this.select(to);
                tabs[to].tab.focus();
            });
            this.listen(toggle, 'click', () => { stopped = !stopped; hold(); });
            this.listen(root, 'pointerenter', () => { inside = true; hold(); });
            this.listen(root, 'pointerleave', () => { inside = false; hold(); });
            this.listen(root, 'focusin', (e) => { if (e.target !== toggle) {
                inside = true;
                hold();
            } });
            this.listen(root, 'focusout', (e) => { if (!root.contains(e.relatedTarget)) {
                inside = false;
                hold();
            } });
            this.inView((v) => { visible = v; hold(); });
            this.onCleanup(() => {
                this.append(...kids);
                root.remove();
                this._sync = undefined;
                this._playing = false;
            });
            hold();
            sync();
        }
    }, { id: 'ui-kit-12', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineProgressTabs };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/progress-tabs.js.map