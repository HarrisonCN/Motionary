import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren } from './kit';
import { copyText, rovingIndex } from './kit-12';
import css from './ui-kit-12.css?raw';

/** Every code-tabs element on the page that shares a `group`, so choosing "pnpm" in one switches them all. */
const groups = new Map<string, Set<(label: string) => void>>();

/**
 * Code blocks behind tabs (npm / pnpm / yarn, JS / TS, …) with a sliding underline and a copy button. Each child is a
 * block (usually a `pre`); its `data-tab` names the tab. Elements with the same `group` switch together. The copy
 * button copies the visible block's text and turns into a drawn tick for a moment; the events never carry the code.
 *
 * Attributes: `index` (0), `group` (none), `label` (Code), `copy-label` (Copy), `copied-label` (Copied).
 * Events `usa:change` ({ index, label }), `usa:copy` ({ index }).
 */
export interface UsaCodeTabsElement extends UsaElement {
  index: number;
  copy(): Promise<boolean>;
}

export function defineCodeTabs(tag = 'usa-code-tabs'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class CodeTabs extends Base {
    static get observedAttributes(): string[] { return ['index', 'group', 'label', 'copy-label', 'copied-label']; }
    private _n = 0;
    private _sync?: () => void;
    private _copy?: () => Promise<boolean>;
    get index(): number { return Math.max(0, Math.min(Math.max(0, this._n - 1), Math.round(this.num('index', 0)))); }
    set index(i: number) { this.setAttribute('index', String(Math.round(Number(i)) || 0)); }
    copy(): Promise<boolean> { return this._copy ? this._copy() : Promise.resolve(false); }
    changed(name: string): void { if (name === 'index') this._sync?.(); else super.changed(name); }
    mount(): void {
      const kids = ownChildren(this);
      this._n = kids.length;
      const uid = `usa-ctabs-${Math.random().toString(36).slice(2, 8)}`;
      const root = make('div', 'usa-kit usa-ctabs');
      const head = make('div', 'usa-ctabs-head');
      const list = make('div', 'usa-ctabs-list');
      list.setAttribute('role', 'tablist');
      list.setAttribute('aria-label', this.str('label', 'Code'));
      const ink = make('span', 'usa-ctabs-ink');
      ink.setAttribute('aria-hidden', 'true');
      const copyBtn = make('button', 'usa-ctabs-copy');
      copyBtn.type = 'button';
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect class="usa-ctabs-sq" x="8" y="8" width="12" height="12" rx="2"/><path class="usa-ctabs-sq" d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/><path class="usa-ctabs-tick" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
      const copyText_ = make('span', 'usa-kit-sr', this.str('copy-label', 'Copy'));
      copyBtn.append(copyText_);
      const live = make('span', 'usa-kit-sr');
      live.setAttribute('role', 'status');
      list.append(ink);
      head.append(list, copyBtn);
      const body = make('div', 'usa-ctabs-body');
      const items = kids.map((k, i) => {
        const name = k.dataset.tab || String(i + 1);
        const tab = make('button', 'usa-ctabs-tab', name);
        tab.type = 'button';
        tab.id = `${uid}-t${i}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', `${uid}-p${i}`);
        list.append(tab);
        const panel = make('div', 'usa-ctabs-panel');
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
        if (!t) return;
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
      const choose = (i: number, broadcast = true) => {
        if (i === this.index && this.hasAttribute('index')) return;
        this.index = i;
        this.emit('change', { index: i, label: items[i].name });
        const g = this.str('group');
        if (broadcast && g) for (const fn of groups.get(g) || []) if (fn !== follow) fn(items[i].name);
      };
      const follow = (label: string) => {
        const i = items.findIndex((x) => x.name === label);
        if (i >= 0) choose(i, false);
      };
      const g = this.str('group');
      if (g) {
        if (!groups.has(g)) groups.set(g, new Set());
        groups.get(g)!.add(follow);
        this.onCleanup(() => { groups.get(g)?.delete(follow); if (!groups.get(g)?.size) groups.delete(g); });
      }
      items.forEach(({ tab }, i) => this.listen(tab, 'click', () => choose(i)));
      this.listen(list, 'keydown', (e: KeyboardEvent) => {
        const at = items.findIndex((x) => x.tab === e.target);
        if (at < 0) return;
        const to = rovingIndex(e.key, at, items.length);
        if (to < 0) return;
        e.preventDefault();
        choose(to);
        items[to].tab.focus();
      });
      let back = 0;
      const doCopy = async () => {
        const text = (items[this.index]?.panel.textContent || '').trim();
        const ok = !!text && (await copyText(text));
        if (!ok) return false;
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
  }, { id: 'ui-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
