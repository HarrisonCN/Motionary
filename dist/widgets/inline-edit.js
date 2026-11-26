import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/ui-kit-12-D3RTFFIw.js';

function defineInlineEdit(tag = 'usa-inline-edit') {
    const ctor = defineElement(tag, Base => class InlineEdit extends Base {
        constructor() {
            super(...arguments);
            this._text = '';
        }
        static get observedAttributes() { return ['value', 'label', 'placeholder', 'maxlength', 'allow-empty']; }
        get value() { return this.getAttribute('value') ?? this._text; }
        set value(v) { this.setAttribute('value', String(v ?? '')); }
        edit() { this._edit?.(); }
        changed(name) { if (name === 'value')
            this._paint?.();
        else
            super.changed(name); }
        mount() {
            const nodes = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
            this._text = (this.textContent || '').trim();
            for (const n of nodes)
                n.remove();
            const root = make('span', 'usa-kit usa-iedit');
            const show = make('button', 'usa-iedit-show');
            show.type = 'button';
            const text = make('span', 'usa-iedit-text');
            const pen = make('span', 'usa-iedit-pen');
            pen.setAttribute('aria-hidden', 'true');
            pen.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/></svg>';
            show.append(text, pen);
            const field = make('input', 'usa-iedit-field');
            field.type = 'text';
            field.hidden = true;
            field.maxLength = Math.max(1, Math.round(this.num('maxlength', 200)));
            field.placeholder = this.str('placeholder');
            field.setAttribute('aria-label', this.str('label', 'Edit'));
            root.append(show, field);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            const paint = () => {
                text.textContent = this.value || this.str('placeholder');
                root.toggleAttribute('data-empty', !this.value);
                show.setAttribute('aria-label', `${this.str('label', 'Edit')}: ${this.value}`);
            };
            this._paint = paint;
            let editing = false;
            const open = () => {
                if (editing)
                    return;
                editing = true;
                field.value = this.value;
                field.style.setProperty('--w', `${Math.max(80, show.offsetWidth)}px`);
                show.hidden = true;
                field.hidden = false;
                root.setAttribute('data-editing', '');
                field.focus();
                field.select();
                this.emit('edit');
            };
            this._edit = open;
            const close = (save) => {
                if (!editing)
                    return;
                editing = false;
                const previous = this.value;
                const next = field.value.trim();
                const ok = save && next !== previous && (next || this.flag('allow-empty'));
                field.hidden = true;
                show.hidden = false;
                root.removeAttribute('data-editing');
                if (ok) {
                    this.value = next;
                    paint();
                    root.removeAttribute('data-saved');
                    void root.offsetWidth;
                    root.setAttribute('data-saved', '');
                    this.emit('change', { value: next, previous });
                }
                else if (!save)
                    this.emit('cancel');
                show.focus();
            };
            this.listen(show, 'click', open);
            this.listen(show, 'keydown', (e) => { if (e.key === 'F2') {
                e.preventDefault();
                open();
            } });
            this.listen(field, 'keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    close(true);
                }
                else if (e.key === 'Escape') {
                    e.preventDefault();
                    close(false);
                }
            });
            this.listen(field, 'blur', () => close(true));
            this.listen(root, 'animationend', () => root.removeAttribute('data-saved'));
            this.onCleanup(() => {
                root.remove();
                this.append(...nodes);
                this._edit = undefined;
                this._paint = undefined;
            });
            paint();
        }
    }, { id: 'ui-kit-12', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineInlineEdit };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/inline-edit.js.map