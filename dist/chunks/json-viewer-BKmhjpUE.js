import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { c as css } from './data-media-Dlw8-L0c.js';

/** A JSON path segment list as text: `$.items[2].name`. */
function jsonPath(parts) {
    return '$' + parts.map((p) => (typeof p === 'number' ? `[${p}]` : /^[A-Za-z_$][\w$]*$/.test(p) ? `.${p}` : `[${JSON.stringify(p)}]`)).join('');
}
function defineJsonViewer(tag = 'usa-json-viewer') {
    const ctor = defineElement(tag, Base => class JsonViewer extends Base {
        constructor() {
            super(...arguments);
            this._data = undefined;
        }
        static get observedAttributes() { return ['json', 'expand-depth', 'max-nodes', 'label']; }
        get data() { return this._data; }
        set data(v) { this._data = v; this.changed('data'); }
        expandAll() { this._all?.(true); }
        collapseAll() { this._all?.(false); }
        mount() {
            let value = this._data;
            let error = '';
            if (value === undefined) {
                const script = this.querySelector('script[type="application/json"]');
                const text = this.getAttribute('json') ?? script?.textContent ?? '';
                if (text.trim()) {
                    try {
                        value = JSON.parse(text);
                    }
                    catch (e) {
                        error = e.message;
                    }
                }
            }
            const root = make('div', 'usa-kit usa-json');
            if (error) {
                root.append(make('p', 'usa-json-error', `Invalid JSON: ${error}`));
                this.append(root);
                this.onCleanup(() => root.remove());
                return;
            }
            const tree = make('ul', 'usa-json-tree');
            tree.setAttribute('role', 'tree');
            tree.setAttribute('aria-label', this.str('label', 'JSON'));
            root.append(tree);
            const depth = Math.max(0, Math.round(this.num('expand-depth', 1)));
            const budget = Math.max(10, Math.min(20000, this.num('max-nodes', 2000)));
            let nodes = 0;
            const branches = [];
            const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
            const build = (key, v, parts, level, parent) => {
                if (++nodes > budget) {
                    if (nodes === budget + 1)
                        parent.append(make('li', 'usa-json-more', '…'));
                    return;
                }
                const li = make('li', 'usa-json-node');
                li.setAttribute('role', 'treeitem');
                li.setAttribute('aria-level', String(level + 1));
                li.tabIndex = -1;
                const row = make('div', 'usa-json-row');
                if (key !== null)
                    row.append(make('span', 'usa-json-key', typeof key === 'number' ? String(key) : JSON.stringify(key)), make('span', 'usa-json-colon', ': '));
                const t = typeOf(v);
                li.dataset.type = t;
                if (t === 'object' || t === 'array') {
                    const entries = t === 'array' ? v.map((x, i) => [i, x]) : Object.entries(v);
                    const twisty = make('span', 'usa-json-twisty');
                    twisty.setAttribute('aria-hidden', 'true');
                    row.prepend(twisty);
                    row.append(make('span', 'usa-json-brace', t === 'array' ? '[' : '{'), make('span', 'usa-json-size', t === 'array' ? `${entries.length} items` : `${entries.length} keys`), make('span', 'usa-json-brace usa-json-close', t === 'array' ? ']' : '}'));
                    li.append(row);
                    const group = make('ul', 'usa-json-group');
                    group.setAttribute('role', 'group');
                    li.append(group);
                    for (const [k, x] of entries)
                        build(k, x, [...parts, k], level + 1, group);
                    const open = level < depth;
                    li.setAttribute('aria-expanded', String(open));
                    group.hidden = !open;
                    if (!entries.length) {
                        li.removeAttribute('aria-expanded');
                        li.dataset.empty = '';
                    }
                    else
                        branches.push({ li, group, path: jsonPath(parts) });
                }
                else {
                    row.append(make('span', `usa-json-val usa-json-${t}`, t === 'string' ? JSON.stringify(v) : String(v)));
                    li.append(row);
                }
                parent.append(li);
            };
            build(null, value === undefined ? null : value, [], 0, tree);
            this.append(root);
            root.toggleAttribute('data-static', this.reduced);
            const items = () => Array.from(tree.querySelectorAll('[role="treeitem"]')).filter((li) => !li.closest('[hidden]'));
            let active = tree.querySelector('[role="treeitem"]');
            if (active)
                active.tabIndex = 0;
            const focus = (li) => {
                if (!li)
                    return;
                if (active)
                    active.tabIndex = -1;
                active = li;
                li.tabIndex = 0;
                li.focus();
            };
            const setOpen = (li, open, announce = true) => {
                const b = branches.find((x) => x.li === li);
                if (!b || (li.getAttribute('aria-expanded') === 'true') === open)
                    return;
                li.setAttribute('aria-expanded', String(open));
                const g = b.group;
                if (open) {
                    g.hidden = false;
                    this.motion(g, [{ opacity: 0, transform: 'translateY(-4px)', clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
                }
                else {
                    const a = this.motion(g, [{ opacity: 1, clipPath: 'inset(0 0 0 0)' }, { opacity: 0, clipPath: 'inset(0 0 100% 0)' }], { duration: 160, easing: 'ease-in' });
                    if (a)
                        a.finished.then(() => { if (li.getAttribute('aria-expanded') === 'false')
                            g.hidden = true; }, () => { });
                    else
                        g.hidden = true;
                }
                if (announce)
                    this.emit('toggle', { path: b.path, open });
            };
            this._all = (open) => { for (const b of branches)
                setOpen(b.li, open, false); };
            this.listen(tree, 'click', (e) => {
                const row = e.target.closest?.('.usa-json-row');
                const li = row?.parentElement;
                if (!li)
                    return;
                focus(li);
                if (li.hasAttribute('aria-expanded'))
                    setOpen(li, li.getAttribute('aria-expanded') !== 'true');
            });
            this.listen(tree, 'keydown', (e) => {
                const li = e.target.closest?.('[role="treeitem"]');
                if (!li)
                    return;
                const list = items(), i = list.indexOf(li), open = li.getAttribute('aria-expanded');
                let handled = true;
                if (e.key === 'ArrowDown')
                    focus(list[i + 1]);
                else if (e.key === 'ArrowUp')
                    focus(list[i - 1]);
                else if (e.key === 'Home')
                    focus(list[0]);
                else if (e.key === 'End')
                    focus(list[list.length - 1]);
                else if (e.key === 'ArrowRight') {
                    if (open === 'false')
                        setOpen(li, true);
                    else if (open === 'true')
                        focus(list[i + 1]);
                }
                else if (e.key === 'ArrowLeft') {
                    if (open === 'true')
                        setOpen(li, false);
                    else
                        focus(li.parentElement?.closest('[role="treeitem"]'));
                }
                else if (e.key === 'Enter' || e.key === ' ') {
                    if (open)
                        setOpen(li, open !== 'true');
                }
                else
                    handled = false;
                if (handled)
                    e.preventDefault();
            });
            this.onCleanup(() => { root.remove(); this._all = undefined; });
        }
    }, { id: 'data-media', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineJsonViewer as d, jsonPath as j };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/json-viewer-BKmhjpUE.js.map