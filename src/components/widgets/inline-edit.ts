import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './ui-kit-12.css?raw';

/**
 * Text that edits in place. The text is shown inside a button with a small pencil; pressing it (or Enter / F2 on it)
 * swaps in a text field of the same width, already selected. Enter or leaving the field saves and the saved text flashes
 * once; Escape puts the old text back. Empty text is refused unless `allow-empty` is set.
 *
 * Attributes: `value` (the child text), `label` (Edit), `placeholder`, `maxlength` (200), `allow-empty`.
 * Events `usa:edit`, `usa:change` ({ value, previous }), `usa:cancel`.
 */
export interface UsaInlineEditElement extends UsaElement {
  value: string;
  edit(): void;
}

export function defineInlineEdit(tag = 'usa-inline-edit'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class InlineEdit extends Base {
    static get observedAttributes(): string[] { return ['value', 'label', 'placeholder', 'maxlength', 'allow-empty']; }
    private _edit?: () => void;
    private _paint?: () => void;
    private _text = '';
    get value(): string { return this.getAttribute('value') ?? this._text; }
    set value(v: string) { this.setAttribute('value', String(v ?? '')); }
    edit(): void { this._edit?.(); }
    changed(name: string): void { if (name === 'value') this._paint?.(); else super.changed(name); }
    mount(): void {
      const nodes = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
      this._text = (this.textContent || '').trim();
      for (const n of nodes) n.remove();
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
        if (editing) return;
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
      const close = (save: boolean) => {
        if (!editing) return;
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
        } else if (!save) this.emit('cancel');
        show.focus();
      };
      this.listen(show, 'click', open);
      this.listen(show, 'keydown', (e: KeyboardEvent) => { if (e.key === 'F2') { e.preventDefault(); open(); } });
      this.listen(field, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') { e.preventDefault(); close(true); }
        else if (e.key === 'Escape') { e.preventDefault(); close(false); }
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
