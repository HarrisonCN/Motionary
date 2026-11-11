import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';

var css = ":is(usa-breadcrumbs,mo-breadcrumbs){display:block;--usa-bc-sep:\"/\";--usa-bc-accent:#7c5cff;font-size:.95em}.usa-bc-list{display:flex;flex-wrap:wrap;align-items:center;gap:.35em;list-style:none;margin:0;padding:0}.usa-bc-list>li{display:inline-flex;align-items:center;gap:.35em}.usa-bc-list>li[hidden]{display:none}.usa-bc-list>li+li::before{content:var(--usa-bc-sep);content:var(--usa-bc-sep) / \"\";opacity:.45}.usa-bc-list a{color:inherit;text-decoration:none;opacity:.75;border-radius:4px}.usa-bc-list a:hover{opacity:1;text-decoration:underline;text-underline-offset:.2em}.usa-bc-list [aria-current=\"page\"]{opacity:1;font-weight:600}.usa-bc-list :focus-visible{outline:2px solid var(--usa-bc-accent);outline-offset:2px}.usa-bc-more>button{font:inherit;color:inherit;border:0;background:rgba(127,127,127,.14);border-radius:6px;padding:0 .45em;cursor:pointer;line-height:1.4}.usa-bc-out{pointer-events:none}";

function defineBreadcrumbs(tag = 'usa-breadcrumbs') {
    const C = defineElement(tag, (Base) => {
        class UsaBreadcrumbs extends Base {
            constructor() {
                super(...arguments);
                this._ol = null;
                this._expanded = false;
            }
            static get observedAttributes() {
                return ['label', 'max'];
            }
            get items() {
                return this.crumbs().map((li) => {
                    const a = li.firstElementChild;
                    const href = a?.getAttribute('href');
                    return href != null ? { label: a.textContent || '', href } : { label: a?.textContent || '' };
                });
            }
            crumbs() {
                return this._ol ? Array.from(this._ol.children).filter((c) => c.localName === 'li' && !c.matches('.usa-bc-more,.usa-bc-out')) : [];
            }
            mount() {
                this.setAttribute('role', 'navigation');
                this.setAttribute('aria-label', this.str('label', 'Breadcrumb'));
                let ol = this.querySelector(':scope > ol.usa-bc-list');
                if (!ol) {
                    ol = document.createElement('ol');
                    ol.className = 'usa-bc-list';
                    ol.setAttribute('data-usa-part', '');
                    for (const node of Array.from(this.childNodes)) {
                        if (node.nodeType === 1) {
                            const li = document.createElement('li');
                            li.append(node);
                            ol.append(li);
                        }
                        else
                            node.remove();
                    }
                    this.append(ol);
                }
                this._ol = ol;
                this.layout();
                this.listen(ol, 'click', (e) => {
                    if (e.target.closest('.usa-bc-more'))
                        this.expand();
                });
            }
            /** aria-current on the last crumb; collapse the middle when longer than `max`. */
            layout() {
                const ol = this._ol;
                ol.querySelector(':scope > .usa-bc-more')?.remove();
                const list = this.crumbs();
                list.forEach((li, i) => {
                    li.hidden = false;
                    const el = li.firstElementChild;
                    if (i === list.length - 1)
                        el?.setAttribute('aria-current', 'page');
                    else
                        el?.removeAttribute('aria-current');
                });
                const max = Math.max(2, this.num('max', 4));
                if (this._expanded || list.length <= max)
                    return;
                const hidden = list.slice(1, list.length - (max - 1));
                hidden.forEach((li) => (li.hidden = true));
                const more = document.createElement('li');
                more.className = 'usa-bc-more';
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = '…';
                b.setAttribute('aria-label', `Show ${hidden.length} more`);
                b.setAttribute('aria-expanded', 'false');
                more.append(b);
                list[0].after(more);
            }
            expand() {
                const more = this._ol?.querySelector(':scope > .usa-bc-more');
                if (!more)
                    return;
                const hidden = this.crumbs().filter((li) => li.hidden);
                const focus = more.contains(document.activeElement);
                this._expanded = true;
                more.remove();
                hidden.forEach((li, i) => {
                    li.hidden = false;
                    if (!this.reduced)
                        this.motion(li, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: i * 50, easing: 'ease-out', fill: 'backwards' });
                });
                if (focus)
                    hidden[0]?.firstElementChild?.focus();
                this.emit('expand', { hidden: hidden.length });
            }
            set(items) {
                const ol = this._ol;
                if (!ol)
                    return;
                const old = this.crumbs();
                const prev = this.items;
                let keep = 0;
                while (keep < old.length && keep < items.length && prev[keep].label === items[keep].label && (prev[keep].href ?? null) === (items[keep].href ?? null))
                    keep++;
                this._expanded = false;
                for (const li of old.slice(keep)) {
                    const a = this.reduced ? null : this.motion(li, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(12px)' }], { duration: 180, easing: 'ease-in' });
                    li.classList.add('usa-bc-out');
                    li.setAttribute('aria-hidden', 'true');
                    li.querySelector('[aria-current]')?.removeAttribute('aria-current');
                    const rm = () => li.remove();
                    if (a)
                        a.finished.then(rm, rm);
                    else
                        rm();
                }
                const added = [];
                for (const it of items.slice(keep)) {
                    const li = document.createElement('li');
                    const el = document.createElement(it.href != null ? 'a' : 'span');
                    if (it.href != null)
                        el.setAttribute('href', it.href);
                    el.textContent = it.label;
                    li.append(el);
                    const out = ol.querySelector(':scope > .usa-bc-out');
                    ol.insertBefore(li, out);
                    added.push(li);
                }
                this.layout();
                if (!this.reduced)
                    added.forEach((li, i) => !li.hidden && this.motion(li, [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: 80 + i * 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
            }
        }
        return UsaBreadcrumbs;
    }, { id: 'breadcrumbs', text: css });
    defineMoName(tag, C);
    return C;
}

export { defineBreadcrumbs };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.4.0/dist/widgets/breadcrumbs.js.map