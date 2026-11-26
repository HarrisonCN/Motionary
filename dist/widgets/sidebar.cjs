'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var uiBlocks = require('../chunks/ui-blocks-DKqRP2UQ.cjs');

function defineSidebar(tag = 'usa-sidebar') {
    const ctor = base.defineElement(tag, Base => class Sidebar extends Base {
        static get observedAttributes() { return ['label', 'collapsed', 'expand-label', 'collapse-label']; }
        get collapsed() { return this.flag('collapsed'); }
        set collapsed(on) { this.setFlag('collapsed', !!on); }
        toggle(force) {
            this.collapsed = force === undefined ? !this.collapsed : !!force;
            return this.collapsed;
        }
        changed() { this._sync?.(); }
        mount() {
            const original = kit.ownChildren(this);
            const items = original.filter((el) => el.matches('a,button'));
            const others = original.filter((el) => !items.includes(el));
            const root = moments.make('nav', 'usa-kit usa-side');
            const list = moments.make('ul', 'usa-side-list');
            list.id = moments.uniqueId('usa-side');
            const pill = moments.make('span', 'usa-side-pill');
            pill.setAttribute('aria-hidden', 'true');
            const toggle = moments.make('button', 'usa-side-toggle');
            toggle.type = 'button';
            toggle.setAttribute('aria-controls', list.id);
            toggle.append(moments.make('span', 'usa-side-chevron'), moments.make('span', 'usa-sr'));
            const wraps = items.map((item) => {
                const li = moments.make('li', 'usa-side-item');
                const icon = moments.make('span', 'usa-side-icon', item.dataset.icon || (item.textContent || '').trim().charAt(0) || '•');
                icon.setAttribute('aria-hidden', 'true');
                const text = moments.make('span', 'usa-side-text');
                text.append(...Array.from(item.childNodes));
                item.append(icon, text);
                item.classList.add('usa-side-link');
                li.append(item);
                list.append(li);
                return { item, text };
            });
            list.append(pill);
            root.append(toggle, list);
            if (others.length) {
                const foot = moments.make('div', 'usa-side-foot');
                foot.append(...others);
                root.append(foot);
            }
            this.append(root);
            let current = Math.max(0, items.findIndex((i) => i.getAttribute('aria-current') === 'page' || i.getAttribute('aria-current') === 'true'));
            const place = () => {
                const it = items[current];
                if (!it) {
                    pill.hidden = true;
                    return;
                }
                pill.hidden = false;
                pill.style.setProperty('--y', `${it.offsetTop}px`);
                pill.style.setProperty('--h', `${it.offsetHeight}px`);
            };
            const sync = () => {
                const collapsed = this.collapsed;
                root.setAttribute('aria-label', this.str('label', 'Sidebar'));
                root.toggleAttribute('data-collapsed', collapsed);
                root.toggleAttribute('data-static', this.reduced);
                toggle.setAttribute('aria-expanded', String(!collapsed));
                toggle.lastElementChild.textContent = collapsed ? this.str('expand-label', 'Expand sidebar') : this.str('collapse-label', 'Collapse sidebar');
                items.forEach((it, i) => {
                    if (i === current)
                        it.setAttribute('aria-current', it.getAttribute('aria-current') || 'page');
                    else
                        it.removeAttribute('aria-current');
                    // a collapsed item's label is visually hidden, so a tooltip shows it on hover
                    if (collapsed)
                        it.title = (wraps[i].text.textContent || '').trim();
                    else
                        it.removeAttribute('title');
                });
                place();
            };
            this._sync = sync;
            this.listen(toggle, 'click', () => this.emit('toggle', { collapsed: this.toggle() }));
            this.listen(list, 'click', (e) => {
                const index = items.findIndex((it) => it.contains(e.target));
                if (index < 0)
                    return;
                current = index;
                sync();
                this.emit('select', { index, item: items[index] });
            });
            // the rail's width animates, so the pill follows the item once the layout settles
            this.listen(root, 'transitionend', place);
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(place);
                ro.observe(list);
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                for (const { item, text } of wraps) {
                    item.classList.remove('usa-side-link');
                    item.removeAttribute('title');
                    item.textContent = '';
                    item.append(...Array.from(text.childNodes));
                }
                this.append(...original);
                root.remove();
                this._sync = undefined;
            });
            sync();
        }
    }, { id: 'ui-blocks', text: uiBlocks.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSidebar = defineSidebar;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/sidebar.cjs.map