import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, numberValue, formShell, formReset, formMotion } from './form-craft';
import { choiceId } from './form-options';
import css from './form-craft.css?raw';

export interface SearchResult { value: string; label: string; description?: string; }
export type SearchProvider = (query: string, context: { signal: AbortSignal }) => Promise<SearchResult[]> | SearchResult[];
export interface UsaSearchFieldElement extends UsaElement {
  value: string;
  provider: SearchProvider | undefined;
  readonly input: HTMLInputElement | null;
  readonly results: SearchResult[];
  search(query?: string): void;
  clear(): void;
  cancel(): void;
  reset(): void;
}
/** Debounced native search with an application-supplied provider, abortable requests and stale-result protection. */
export function defineSearchField(tag = 'usa-search-field'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SearchField extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'value', 'name', 'placeholder', 'delay', 'min-length', 'disabled', 'loading-text', 'empty-text', 'error-text']; }
    private _provider?: SearchProvider;
    private _results: SearchResult[] = [];
    private _sync?: () => void;
    private _run?: (query: string) => void;
    private _cancel?: () => void;
    private _initial?: string;
    get input(): HTMLInputElement | null { return this.querySelector('input'); }
    get value(): string { return this.str('value'); }
    set value(value: string) { this.cancel(); this.setAttribute('value', String(value)); this._sync?.(); }
    get provider(): SearchProvider | undefined { return this._provider; }
    set provider(value: SearchProvider | undefined) { this.cancel(); this._provider = typeof value === 'function' ? value : undefined; }
    get results(): SearchResult[] { return this._results.map(row => ({ ...row })); }
    search(query = this.value): void { this.value = query; this._run?.(query); }
    clear(): void { this.cancel(); this.value = ''; this.input?.focus(); this.emit('input', { value: '' }); }
    cancel(): void { this._cancel?.(); }
    reset(): void { this.cancel(); this.value = this._initial ?? ''; }
    changed(name: string): void { if (name === 'disabled' || name === 'value') this.cancel(); this._sync?.(); }
    mount(): void {
      this._initial ??= this.value;
      const { root, title, hint } = formShell(this, 'Search'), row = node('div', 'usa-form-row'), input = node('input'), clear = node('button', '', '×'), status = node('div', 'usa-form-search-status'), list = node('ul', 'usa-form-search-results');
      input.type = 'search'; input.autocomplete = 'off'; clear.type = 'button'; clear.setAttribute('aria-label', 'Clear search'); list.id = choiceId(); list.setAttribute('aria-label', 'Search results'); status.setAttribute('role', 'status'); status.id = choiceId(); input.setAttribute('aria-describedby', status.id); input.setAttribute('aria-controls', list.id); row.append(input, clear); root.append(row, status, list, hint);
      let timer: ReturnType<typeof setTimeout> | undefined, request: AbortController | undefined, serial = 0, alive = true, composing = false;
      const animate = formMotion(this);
      const cancel = () => { clearTimeout(timer); request?.abort(); request = undefined; serial++; this._results = []; list.replaceChildren(); list.hidden = true; root.removeAttribute('aria-busy'); status.textContent = ''; };
      this._cancel = cancel;
      const sync = () => { title.textContent = this.str('label', 'Search'); hint.textContent = this.str('hint'); input.setAttribute('aria-label', title.textContent); input.name = this.str('name'); input.placeholder = this.str('placeholder', 'Search collections'); input.disabled = this.flag('disabled'); clear.disabled = input.disabled || !this.value; if (input.value !== this.value) input.value = this.value; };
      this._sync = sync;
      const run = (query: string) => {
        cancel(); if (this.flag('disabled') || query.trim().length < numberValue(this.num('min-length', 1), 1, 0, 1000)) return;
        const id = serial, controller = new AbortController(); request = controller;
        this.emit('query', { query, signal: controller.signal });
        if (!alive || id !== serial || controller.signal.aborted || this.flag('disabled') || !this._provider) return;
        root.setAttribute('aria-busy', 'true'); status.textContent = this.str('loading-text', 'Searching…');
        Promise.resolve().then(() => { if (controller.signal.aborted) return []; return this._provider?.(query, { signal: controller.signal }) ?? []; }).then(rows => {
          if (!alive || id !== serial || controller.signal.aborted) return;
          this._results = Array.isArray(rows) ? rows.slice(0, 50).filter(r => r && typeof r.value === 'string' && typeof r.label === 'string').map(r => ({ value: r.value, label: r.label, ...(typeof r.description === 'string' ? { description: r.description } : {}) })) : [];
          root.removeAttribute('aria-busy'); list.replaceChildren();
          for (const result of this._results) { const item = node('li'), button = node('button'); button.type = 'button'; button.dataset.value = result.value; button.append(node('span', '', result.label)); if (result.description) button.append(node('small', '', result.description)); item.append(button); list.append(item); }
          list.hidden = !this._results.length; status.textContent = this._results.length ? this._results.length + ' results' : this.str('empty-text', 'No results'); if (this._results.length) animate(list); this.emit('results', { query, count: this._results.length });
        }, () => { if (!alive || id !== serial || controller.signal.aborted) return; root.removeAttribute('aria-busy'); status.textContent = this.str('error-text', 'Search unavailable. Try again.'); this.emit('error', { query }); });
      };
      this._run = run;
      const schedule = () => { const query = input.value; this.value = query; this.emit('input', { value: query }); if (!composing) timer = setTimeout(() => run(query), numberValue(this.num('delay', 200), 200, 0, 3000)); };
      this.listen(input, 'compositionstart', () => { composing = true; cancel(); }); this.listen(input, 'compositionend', () => { composing = false; schedule(); });
      this.listen(input, 'input', schedule); this.listen(clear, 'click', () => this.clear());
      this.listen(input, 'keydown', (event: KeyboardEvent) => { if (event.isComposing) return; if (event.key === 'Enter') { event.preventDefault(); this.search(); } else if (event.key === 'Escape') { event.preventDefault(); this.cancel(); } else if (event.key === 'ArrowDown' && !list.hidden) { event.preventDefault(); list.querySelector('button')?.focus(); } });
      this.listen(list, 'click', (event: Event) => { const button = (event.target as Element).closest<HTMLButtonElement>('button[data-value]'); if (!button || !list.contains(button)) return; const result = this._results.find(r => r.value === button.dataset.value); if (result) { this.value = result.label; input.focus(); this.emit('select', { ...result }); } });
      this.listen(list, 'keydown', (event: KeyboardEvent) => { const buttons = Array.from(list.querySelectorAll('button')), current = buttons.indexOf(event.target as HTMLButtonElement); if (event.key === 'Escape') { event.preventDefault(); this.cancel(); input.focus(); } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : current + (event.key === 'ArrowDown' ? 1 : -1); if (index < 0) input.focus(); else buttons[Math.min(index, buttons.length - 1)]?.focus(); } });
      formReset(this, () => this.reset()); this.onCleanup(() => { alive = false; cancel(); this._sync = this._run = this._cancel = undefined; }); sync(); cancel();
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
