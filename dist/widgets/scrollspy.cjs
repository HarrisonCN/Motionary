'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var uiBlocks = require('../chunks/ui-blocks-DKqRP2UQ.cjs');

function defineScrollspy(tag = 'usa-scrollspy') {
    const ctor = base.defineElement(tag, Base => class Scrollspy extends Base {
        constructor() {
            super(...arguments);
            this._current = '';
        }
        static get observedAttributes() { return ['target', 'selector', 'label', 'offset']; }
        get current() { return this._current; }
        refresh() { this.changed('refresh'); }
        mount() {
            const own = Array.from(this.querySelectorAll(':scope > a[href^="#"], :scope > ul a[href^="#"], :scope > ol a[href^="#"]'));
            const original = Array.from(this.childNodes);
            const homes = own.map((a) => [a, a.parentNode, a.nextSibling]);
            const root = moments.make('nav', 'usa-kit usa-spy');
            root.setAttribute('aria-label', this.str('label', 'On this page'));
            const title = moments.make('p', 'usa-spy-title', this.str('label', 'On this page'));
            title.setAttribute('aria-hidden', 'true');
            const list = moments.make('ol', 'usa-spy-list');
            const marker = moments.make('span', 'usa-spy-marker');
            marker.setAttribute('aria-hidden', 'true');
            let scope = document;
            try {
                scope = (this.str('target') && document.querySelector(this.str('target'))) || document;
            }
            catch { /* invalid selector → the document */ }
            let links;
            if (own.length) {
                links = own;
                for (const a of own) {
                    const li = moments.make('li', 'usa-spy-item');
                    li.append(a);
                    list.append(li);
                }
                for (const n of original)
                    if (n.parentNode === this)
                        n.parentNode.removeChild(n);
            }
            else {
                let headings = [];
                try {
                    headings = Array.from(scope.querySelectorAll(this.str('selector', 'h2[id], h3[id]')));
                }
                catch { /* invalid selector → empty */ }
                links = headings.filter((h) => h.id && !this.contains(h)).slice(0, 80).map((h) => {
                    const li = moments.make('li', 'usa-spy-item');
                    li.dataset.level = h.tagName.length === 2 ? h.tagName.charAt(1) : '2';
                    const a = moments.make('a', 'usa-spy-link', (h.textContent || '').trim());
                    a.href = `#${encodeURIComponent(h.id)}`;
                    li.append(a);
                    list.append(li);
                    return a;
                });
            }
            for (const a of links)
                a.classList.add('usa-spy-link');
            list.append(marker);
            root.append(title, list);
            this.append(root);
            const idOf = (a) => { try {
                return decodeURIComponent(a.getAttribute('href').slice(1));
            }
            catch {
                return a.getAttribute('href').slice(1);
            } };
            const sections = links.map((a) => document.getElementById(idOf(a)));
            const offset = Math.max(0, this.num('offset', 80));
            const setCurrent = (index) => {
                const a = links[index];
                const id = a ? idOf(a) : '';
                links.forEach((l, i) => (i === index ? l.setAttribute('aria-current', 'location') : l.removeAttribute('aria-current')));
                if (a) {
                    marker.hidden = false;
                    marker.style.setProperty('--y', `${a.offsetTop}px`);
                    marker.style.setProperty('--h', `${a.offsetHeight}px`);
                }
                else
                    marker.hidden = true;
                root.toggleAttribute('data-static', this.reduced);
                if (id !== this._current) {
                    this._current = id;
                    if (id)
                        this.emit('change', { id, index });
                }
            };
            // the current section is the last one whose top has passed the offset line
            let pending = 0;
            const update = () => {
                pending = 0;
                let index = -1;
                sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top - offset <= 1)
                    index = i; });
                if (index < 0 && sections.some(Boolean))
                    index = sections.findIndex(Boolean);
                // at the very bottom, the last section counts even if its heading never reached the line
                const end = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
                if (end)
                    for (let i = sections.length - 1; i >= 0; i--)
                        if (sections[i]) {
                            index = i;
                            break;
                        }
                setCurrent(index);
            };
            const queue = () => { if (!pending)
                pending = base.raf(update); };
            this.listen(window, 'scroll', queue, { passive: true });
            this.listen(window, 'resize', queue, { passive: true });
            this.onCleanup(() => pending && base.caf(pending));
            this.listen(list, 'click', (e) => {
                const a = e.target.closest?.('a');
                const index = a ? links.indexOf(a) : -1;
                const section = sections[index];
                if (!a || !section || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
                    return;
                e.preventDefault();
                const y = section.getBoundingClientRect().top + window.scrollY - offset + 1;
                window.scrollTo({ top: y, behavior: this.reduced ? 'auto' : 'smooth' });
                if (!section.hasAttribute('tabindex'))
                    section.setAttribute('tabindex', '-1');
                section.focus({ preventScroll: true });
                try {
                    history.replaceState(history.state, '', a.getAttribute('href'));
                }
                catch { /* sandboxed */ }
                setCurrent(index);
            });
            this.onCleanup(() => {
                root.remove();
                for (const a of own)
                    a.classList.remove('usa-spy-link'), a.removeAttribute('aria-current');
                if (own.length) {
                    this.append(...original);
                    for (const [a, parent, next] of [...homes].reverse())
                        parent.insertBefore(a, next && next.parentNode === parent ? next : null);
                }
            });
            update();
        }
    }, { id: 'ui-blocks', text: uiBlocks.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineScrollspy = defineScrollspy;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/scrollspy.cjs.map