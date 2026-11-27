'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var uiKit13 = require('../chunks/ui-kit-13-CrE_IdG4.cjs');

function defineMentionInput(tag = 'usa-mention-input') {
    const ctor = base.defineElement(tag, Base => class MentionInput extends Base {
        constructor() {
            super(...arguments);
            this._people = null;
            this._field = null;
        }
        static get observedAttributes() { return ['people', 'trigger', 'max', 'label', 'empty-label']; }
        get people() { return this._people ?? kit.list(this.str('people'), 500); }
        set people(v) { this._people = Array.isArray(v) ? v.map(String).filter(Boolean).slice(0, 500) : null; this.changed('people'); }
        get mentions() {
            const text = this._field?.value ?? '';
            const t = this.str('trigger', '@') || '@';
            return this.people.filter((p) => text.includes(t + p));
        }
        mount() {
            let field = this.querySelector(':scope textarea, :scope input');
            const created = !field;
            if (!field) {
                field = moments.make('textarea');
                field.rows = 3;
                field.setAttribute('aria-label', this.str('label', 'Message'));
                this.append(field);
            }
            this._field = field;
            const f = field;
            const trigger = this.str('trigger', '@') || '@';
            const max = Math.max(1, Math.min(20, Math.round(this.num('max', 6))));
            const root = moments.make('div', 'usa-kit usa-mention');
            const box = moments.make('ul', 'usa-mention-list');
            const id = moments.uniqueId('usa-mention');
            box.id = id;
            box.setAttribute('role', 'listbox');
            box.setAttribute('aria-label', this.str('label', 'Message'));
            box.hidden = true;
            const status = moments.make('span', 'usa-kit-sr');
            status.setAttribute('role', 'status');
            root.append(box, status);
            root.toggleAttribute('data-static', this.reduced);
            f.after(root);
            const was = { role: f.getAttribute('role'), auto: f.getAttribute('aria-autocomplete'), controls: f.getAttribute('aria-controls'), exp: f.getAttribute('aria-expanded') };
            f.setAttribute('role', 'combobox');
            f.setAttribute('aria-autocomplete', 'list');
            f.setAttribute('aria-controls', id);
            f.setAttribute('aria-expanded', 'false');
            let matches = [];
            let active = 0;
            let q = null;
            const close = () => {
                box.hidden = true;
                box.replaceChildren();
                f.setAttribute('aria-expanded', 'false');
                f.removeAttribute('aria-activedescendant');
                matches = [];
                q = null;
            };
            const paint = () => {
                const opts = Array.from(box.children);
                opts.forEach((o, i) => o.setAttribute('aria-selected', String(i === active)));
                const on = opts[active];
                if (on) {
                    f.setAttribute('aria-activedescendant', on.id);
                    on.scrollIntoView?.({ block: 'nearest' });
                }
            };
            const open = () => {
                q = kit13.mentionQuery(f.value, f.selectionStart ?? f.value.length, trigger);
                if (!q) {
                    close();
                    return;
                }
                matches = kit13.matchNames(this.people, q.query, max);
                active = 0;
                box.replaceChildren(...(matches.length ? matches : [null]).map((name, i) => {
                    const li = moments.make('li', name ? 'usa-mention-opt' : 'usa-mention-empty', name ?? this.str('empty-label', 'No matches'));
                    li.style.setProperty('--i', String(i));
                    if (name) {
                        li.id = `${id}-${i}`;
                        li.setAttribute('role', 'option');
                        const initial = moments.make('span', 'usa-mention-av', name.slice(0, 1).toUpperCase());
                        initial.setAttribute('aria-hidden', 'true');
                        li.prepend(initial);
                    }
                    else
                        li.setAttribute('aria-disabled', 'true');
                    return li;
                }));
                box.hidden = false;
                f.setAttribute('aria-expanded', 'true');
                status.textContent = matches.length ? `${matches.length}` : this.str('empty-label', 'No matches');
                paint();
            };
            const pick = (name) => {
                if (!q)
                    return;
                const caret = f.selectionStart ?? f.value.length;
                const insert = `${trigger}${name} `;
                f.value = f.value.slice(0, q.start) + insert + f.value.slice(caret);
                const pos = q.start + insert.length;
                f.setSelectionRange?.(pos, pos);
                close();
                f.dispatchEvent(new Event('input', { bubbles: true }));
                this.emit('mention', { name });
                root.removeAttribute('data-picked');
                void root.offsetWidth;
                root.setAttribute('data-picked', '');
            };
            this.listen(f, 'input', open);
            this.listen(f, 'click', open);
            this.listen(f, 'keydown', (e) => {
                if (box.hidden)
                    return;
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    if (!matches.length)
                        return;
                    e.preventDefault();
                    active = (active + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
                    paint();
                }
                else if ((e.key === 'Enter' || e.key === 'Tab') && matches.length) {
                    e.preventDefault();
                    pick(matches[active]);
                }
                else if (e.key === 'Escape') {
                    e.preventDefault();
                    close();
                }
            });
            this.listen(f, 'blur', () => setTimeout(() => { if (document.activeElement !== f)
                close(); }, 120));
            this.listen(box, 'mousedown', (e) => e.preventDefault());
            this.listen(box, 'click', (e) => {
                const li = e.target.closest?.('.usa-mention-opt');
                if (li)
                    pick(matches[Array.from(box.children).indexOf(li)]);
            });
            this.listen(root, 'animationend', () => root.removeAttribute('data-picked'));
            this.onCleanup(() => {
                root.remove();
                for (const [k, v] of [['role', was.role], ['aria-autocomplete', was.auto], ['aria-controls', was.controls], ['aria-expanded', was.exp]])
                    v === null ? f.removeAttribute(k) : f.setAttribute(k, v);
                f.removeAttribute('aria-activedescendant');
                if (created)
                    f.remove();
                this._field = null;
            });
        }
    }, { id: 'ui-kit-13', text: uiKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMentionInput = defineMentionInput;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/mention-input.cjs.map