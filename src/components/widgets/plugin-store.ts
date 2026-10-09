import { defineElement, type UsaElement } from '../base';
import { MARKETPLACE, installPlugin, installedPlugins, searchPlugins, type PluginListing } from '../marketplace/index';
import css from './plugin-store.css?raw';

/**
 * `<usa-plugin-store>` (9.0) — the plugin marketplace as a component: a
 * search box over the catalogue (first-party packs by default, or a
 * `plugins` list you set), result cards with their effects as chips, and
 * an Install button per plugin that imports and registers it (`loader`
 * property maps entries to imports for bundlers). Cards fly in staggered,
 * installs show a progress ring then a check. `usa:install` { name, effects }
 * / `usa:install-error` { name, message }. A labelled `search` region with
 * a live result count; reduced motion: no fly-in.
 */
export interface UsaPluginStoreElement extends UsaElement {
  plugins: PluginListing[];
  loader: ((entry: string) => Promise<any>) | null;
  search(q: string): PluginListing[];
  install(name: string): Promise<string[]>;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function definePluginStore(tag = 'usa-plugin-store'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaPluginStore extends Base {
        static get observedAttributes(): string[] {
          return ['query', 'label'];
        }
        private _list: PluginListing[] = MARKETPLACE;
        loader: ((entry: string) => Promise<any>) | null = null;
        get plugins(): PluginListing[] {
          return this._list.slice();
        }
        set plugins(v: PluginListing[]) {
          this._list = Array.isArray(v) ? v : MARKETPLACE;
          if (this.isConnected) this.changed('plugins');
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('role', 'search');
          this.setAttribute('aria-label', this.str('label', 'Plugin marketplace'));
          this.insertAdjacentHTML(
            'beforeend',
            `<input class="usa-ps-q" type="search" placeholder="Search plugins…" aria-label="Search plugins" value="${esc(this.str('query'))}" data-usa-part><p class="usa-ps-count" aria-live="polite" data-usa-part></p><ul class="usa-ps-list" data-usa-part></ul>`
          );
          const q = this.querySelector('.usa-ps-q') as HTMLInputElement;
          this.listen(q, 'input', () => this.search(q.value));
          this.listen(this, 'click', (e: Event) => {
            const b = (e.target as Element).closest?.('.usa-ps-install') as HTMLButtonElement | null;
            if (b && !b.disabled) void this.install(b.dataset.name as string);
          });
          this.search(q.value);
        }
        search(query: string): PluginListing[] {
          const res = searchPlugins(query, this._list);
          const ul = this.querySelector('.usa-ps-list');
          const have = installedPlugins();
          if (ul) {
            ul.innerHTML = res
              .map(
                (p) =>
                  `<li class="usa-ps-card"><div class="usa-ps-head"><b>${esc(p.title)}</b>${p.official ? '<span class="usa-ps-badge">official</span>' : ''}<small>${esc(p.since ? `since ${p.since}` : '')}</small></div><p>${esc(p.description)}</p><div class="usa-ps-fx">${p.effects.map((f) => `<code>${esc(f)}</code>`).join('')}</div><button type="button" class="usa-ps-install" data-name="${esc(p.name)}"${have[p.name] ? ' disabled data-done' : ''}>${have[p.name] ? 'Installed ✓' : 'Install'}</button></li>`
              )
              .join('');
            if (!this.reduced) ul.querySelectorAll('.usa-ps-card').forEach((c, i) => this.motion(c, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: Math.min(i, 8) * 50, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
          }
          const c = this.querySelector('.usa-ps-count');
          if (c) c.textContent = `${res.length} plugin${res.length === 1 ? '' : 's'}`;
          return res;
        }
        async install(name: string): Promise<string[]> {
          const p = this._list.find((x) => x.name === name);
          const b = this.querySelector<HTMLButtonElement>(`.usa-ps-install[data-name="${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(name) : name.replace(/["\\]/g, '\\$&')}"]`);
          if (!p) return [];
          if (b) {
            b.disabled = true;
            b.setAttribute('data-busy', '');
            b.textContent = 'Installing…';
          }
          try {
            const fx = await installPlugin(p, this.loader ? { load: this.loader } : {});
            if (b) {
              b.removeAttribute('data-busy');
              b.setAttribute('data-done', '');
              b.textContent = 'Installed ✓';
              if (!this.reduced) this.motion(b, [{ transform: 'scale(.9)' }, { transform: 'scale(1.08)', offset: 0.6 }, { transform: 'none' }], { duration: 360 });
            }
            this.emit('install', { name, effects: fx });
            return fx;
          } catch (e) {
            if (b) {
              b.disabled = false;
              b.removeAttribute('data-busy');
              b.textContent = 'Retry';
            }
            this.emit('install-error', { name, message: String((e as Error)?.message || e) });
            return [];
          }
        }
      }
      return UsaPluginStore as unknown as CustomElementConstructor;
    },
    { id: 'plugin-store', text: css }
  );
}
