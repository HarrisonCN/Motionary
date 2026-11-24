'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit12 = require('../chunks/kit-12-B4H_NaC_.cjs');
var uiKit12 = require('../chunks/ui-kit-12-CLbcSb3N.cjs');

/** Every code-tabs element on the page that shares a `group`, so choosing "pnpm" in one switches them all. */
const groups = new Map();
function defineCodeTabs(tag = 'usa-code-tabs') {
    const ctor = base.defineElement(tag, Base => class CodeTabs extends Base {
        constructor() {
            super(...arguments);
            this._n = 0;
        }
        static get observedAttributes() { return ['index', 'group', 'label', 'copy-label', 'copied-label']; }
        get index() { return Math.max(0, Math.min(Math.max(0, this._n - 1), Math.round(this.num('index', 0)))); }
        set index(i) { this.setAttribute('index', String(Math.round(Number(i)) || 0)); }
        copy() { return this._copy ? this._copy() : Promise.resolve(false); }
        changed(name) { if (name === 'index')
            this._sync?.();
        else
            super.changed(name); }
        mount() {
            const kids = kit.ownChildren(this);
            this._n = kids.length;
            const uid = `usa-ctabs-${Math.random().toString(36).slice(2, 8)}`;
            const root = moments.make('div', 'usa-kit usa-ctabs');
            const head = moments.make('div', 'usa-ctabs-head');
            const list = moments.make('div', 'usa-ctabs-list');
            list.setAttribute('role', 'tablist');
            list.setAttribute('aria-label', this.str('label', 'Code'));
            const ink = moments.make('span', 'usa-ctabs-ink');
            ink.setAttribute('aria-hidden', 'true');
            const copyBtn = moments.make('button', 'usa-ctabs-copy');
            copyBtn.type = 'button';
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect class="usa-ctabs-sq" x="8" y="8" width="12" height="12" rx="2"/><path class="usa-ctabs-sq" d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/><path class="usa-ctabs-tick" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
            const copyText_ = moments.make('span', 'usa-kit-sr', this.str('copy-label', 'Copy'));
            copyBtn.append(copyText_);
            const live = moments.make('span', 'usa-kit-sr');
            live.setAttribute('role', 'status');
            list.append(ink);
            head.append(list, copyBtn);
            const body = moments.make('div', 'usa-ctabs-body');
            const items = kids.map((k, i) => {
                const name = k.dataset.tab || String(i + 1);
                const tab = moments.make('button', 'usa-ctabs-tab', name);
                tab.type = 'button';
                tab.id = `${uid}-t${i}`;
                tab.setAttribute('role', 'tab');
                tab.setAttribute('aria-controls', `${uid}-p${i}`);
                list.append(tab);
                const panel = moments.make('div', 'usa-ctabs-panel');
                panel.id = `${uid}-p${i}`;
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', tab.id);
                panel.tabIndex = 0;
                panel.append(k);
                body.append(panel);
                return { tab, panel, name };
            });
            root.append(head, body, live);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            const place = () => {
                const t = items[this.index]?.tab;
                if (!t)
                    return;
                ink.style.setProperty('--x', `${t.offsetLeft}px`);
                ink.style.setProperty('--w', `${t.offsetWidth}px`);
            };
            const sync = () => {
                const at = this.index;
                items.forEach(({ tab, panel }, i) => {
                    tab.setAttribute('aria-selected', String(i === at));
                    tab.tabIndex = i === at ? 0 : -1;
                    panel.hidden = i !== at;
                });
                place();
            };
            this._sync = sync;
            const choose = (i, broadcast = true) => {
                if (i === this.index && this.hasAttribute('index'))
                    return;
                this.index = i;
                this.emit('change', { index: i, label: items[i].name });
                const g = this.str('group');
                if (broadcast && g)
                    for (const fn of groups.get(g) || [])
                        if (fn !== follow)
                            fn(items[i].name);
            };
            const follow = (label) => {
                const i = items.findIndex((x) => x.name === label);
                if (i >= 0)
                    choose(i, false);
            };
            const g = this.str('group');
            if (g) {
                if (!groups.has(g))
                    groups.set(g, new Set());
                groups.get(g).add(follow);
                this.onCleanup(() => { groups.get(g)?.delete(follow); if (!groups.get(g)?.size)
                    groups.delete(g); });
            }
            items.forEach(({ tab }, i) => this.listen(tab, 'click', () => choose(i)));
            this.listen(list, 'keydown', (e) => {
                const at = items.findIndex((x) => x.tab === e.target);
                if (at < 0)
                    return;
                const to = kit12.rovingIndex(e.key, at, items.length);
                if (to < 0)
                    return;
                e.preventDefault();
                choose(to);
                items[to].tab.focus();
            });
            let back = 0;
            const doCopy = async () => {
                const text = (items[this.index]?.panel.textContent || '').trim();
                const ok = !!text && (await kit12.copyText(text));
                if (!ok)
                    return false;
                copyBtn.setAttribute('data-done', '');
                copyText_.textContent = this.str('copied-label', 'Copied');
                live.textContent = this.str('copied-label', 'Copied');
                this.emit('copy', { index: this.index });
                clearTimeout(back);
                back = window.setTimeout(() => {
                    copyBtn.removeAttribute('data-done');
                    copyText_.textContent = this.str('copy-label', 'Copy');
                    live.textContent = '';
                }, 1600);
                return true;
            };
            this._copy = doCopy;
            this.listen(copyBtn, 'click', () => void doCopy());
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(place);
                ro.observe(list);
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                clearTimeout(back);
                this.append(...kids);
                root.remove();
                this._sync = undefined;
                this._copy = undefined;
            });
            sync();
        }
    }, { id: 'ui-kit-12', text: uiKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineCodeTabs = defineCodeTabs;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/code-tabs.cjs.map