import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { list } from './kit';
import css from './page-kit.css?raw';

/** The suggestions that contain `query` (case-insensitive), the ones that start with it first, at most `max`. */
export function matchSuggestions(items: string[], query: string, max = 8): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits = items.filter((s) => s.toLowerCase().includes(q));
  return hits.sort((a, b) => Number(!a.toLowerCase().startsWith(q)) - Number(!b.toLowerCase().startsWith(q))).slice(0, Math.max(0, max));
}

const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';

/**
 * A search button that widens into a search field. The field is a native `input type="search"` inside a form with
 * `role="search"`; pressing the shortcut key (`/` by default) anywhere outside another field opens and focuses it, and
 * Escape empties and then closes it. Suggestions come from `suggestions` (comma list) or child `<option>` elements and
 * follow the ARIA combobox pattern (arrow keys, Enter, Escape). Submitting emits `usa:search`.
 *
 * Attributes: `label` (Search), `placeholder`, `suggestions`, `shortcut` (/; "none" turns it off), `expanded`,
 * `width` (CSS width when open; 320px), `name` (q).
 * Events `usa:search` ({ query }), `usa:toggle` ({ expanded }).
 */
export interface UsaSearchBarElement extends UsaElement {
  expanded: boolean;
  readonly value: string;
}

export function defineSearchBar(tag = 'usa-search-bar'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SearchBar extends Base {
    static get observedAttributes(): string[] { return ['label', 'placeholder', 'suggestions', 'shortcut', 'expanded', 'width', 'name']; }
    private _input?: HTMLInputElement;
    private _sync?: () => void;
    get expanded(): boolean { return this.flag('expanded'); }
    set expanded(v: boolean) { this.toggleAttribute('expanded', !!v); }
    get value(): string { return this._input?.value ?? ''; }
    changed(name: string): void { if (name === 'expanded') this._sync?.(); else super.changed(name); }
    mount(): void {
      const options = Array.from(this.querySelectorAll(':scope > option')) as HTMLOptionElement[];
      const items = [...list(this.str('suggestions'), 200), ...options.map((o) => (o.value || o.textContent || '').trim()).filter(Boolean)];
      options.forEach((o) => (o.hidden = true));
      const label = this.str('label', 'Search');
      const form = make('form', 'usa-kit usa-sbar');
      form.setAttribute('role', 'search');
      form.noValidate = true;
      const w = this.str('width');
      if (w) form.style.setProperty('--width', w);
      const toggle = make('button', 'usa-sbar-toggle');
      toggle.type = 'button';
      toggle.innerHTML = ICON;
      const input = make('input', 'usa-sbar-input');
      input.type = 'search';
      input.name = this.str('name', 'q');
      input.placeholder = this.str('placeholder');
      input.autocomplete = 'off';
      input.setAttribute('aria-label', label);
      const box = make('ul', 'usa-sbar-list');
      box.id = uniqueId('usa-sbar');
      box.setAttribute('role', 'listbox');
      box.setAttribute('aria-label', label);
      box.hidden = true;
      if (items.length) {
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-controls', box.id);
        input.setAttribute('aria-expanded', 'false');
      }
      const key = this.str('shortcut', '/');
      const hint = key && key !== 'none' ? make('kbd', 'usa-sbar-key', key) : null;
      if (hint) hint.setAttribute('aria-hidden', 'true');
      form.append(toggle, input);
      if (hint) form.append(hint);
      form.append(box);
      this.append(form);
      this._input = input;

      let shown: string[] = [];
      let active = -1;
      const paint = () => {
        box.replaceChildren(...shown.map((s, i) => {
          const li = make('li', 'usa-sbar-opt');
          li.id = `${box.id}-${i}`;
          li.setAttribute('role', 'option');
          li.setAttribute('aria-selected', String(i === active));
          const q = input.value.trim();
          const at = s.toLowerCase().indexOf(q.toLowerCase());
          if (q && at >= 0) li.append(s.slice(0, at), make('mark', '', s.slice(at, at + q.length)), s.slice(at + q.length));
          else li.textContent = s;
          return li;
        }));
        box.hidden = !shown.length;
        if (items.length) input.setAttribute('aria-expanded', String(!box.hidden));
        if (active >= 0) input.setAttribute('aria-activedescendant', `${box.id}-${active}`);
        else input.removeAttribute('aria-activedescendant');
      };
      const close = () => { shown = []; active = -1; paint(); };
      const sync = () => {
        const open = this.expanded;
        form.toggleAttribute('data-open', open);
        form.toggleAttribute('data-static', this.reduced);
        toggle.setAttribute('aria-label', open ? `Close ${label.toLowerCase()}` : label);
        toggle.setAttribute('aria-expanded', String(open));
        input.tabIndex = open ? 0 : -1;
        if (!open) close();
      };
      this._sync = sync;
      const setOpen = (open: boolean, focus = true) => {
        if (open === this.expanded) { if (open && focus) input.focus(); return; }
        this.expanded = open;
        this.emit('toggle', { expanded: open });
        if (open && focus) input.focus();
        if (!open && focus) toggle.focus();
      };
      const submit = (query: string) => {
        input.value = query;
        close();
        if (query.trim()) this.emit('search', { query: query.trim() });
      };
      this.listen(toggle, 'click', () => {
        if (this.expanded && input.value.trim()) submit(input.value);
        else setOpen(!this.expanded);
      });
      this.listen(form, 'submit', (e: Event) => { e.preventDefault(); submit(input.value); });
      this.listen(input, 'input', () => { shown = matchSuggestions(items, input.value); active = -1; paint(); });
      this.listen(input, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          if (!shown.length) return;
          e.preventDefault();
          active = (active + (e.key === 'ArrowDown' ? 1 : -1) + shown.length + 1) % (shown.length + 1);
          if (active === shown.length) active = -1;
          paint();
        } else if (e.key === 'Enter' && active >= 0) {
          e.preventDefault();
          submit(shown[active]);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          if (shown.length) close();
          else if (input.value) input.value = '';
          else setOpen(false);
        }
      });
      this.listen(box, 'pointerdown', (e: PointerEvent) => {
        const li = (e.target as Element).closest('.usa-sbar-opt');
        if (!li) return;
        e.preventDefault();
        submit(shown[Array.from(box.children).indexOf(li)] ?? '');
      });
      this.listen(input, 'blur', () => close());
      if (hint) {
        this.listen(document, 'keydown', (e: KeyboardEvent) => {
          if (e.key !== key || e.ctrlKey || e.metaKey || e.altKey) return;
          const t = e.target as HTMLElement | null;
          if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
          e.preventDefault();
          setOpen(true);
        });
      }
      this.onCleanup(() => {
        form.remove();
        options.forEach((o) => (o.hidden = false));
        this._input = undefined;
        this._sync = undefined;
      });
      sync();
    }
  }, { id: 'page-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
