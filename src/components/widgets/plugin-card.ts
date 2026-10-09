import { defineElement, type UsaElement } from '../base';
import { checkCompat, verifyPlugin, type CompatResult } from '../marketplace/sign';
import { RUNTIME_VERSION } from '../../runtime/registry';
import { runtimeModule } from './runtime-link';
import type { CoreApi } from '../../runtime/index';
import css from './plugin-card.css?raw';

/**
 * `<usa-plugin-card name="retro" title="Retro" version="1.2.0" author="Motionary" engine="^10.0.0" downloads="12400">`
 * (10.1) — a plugin detail card: version + Motionary compatibility badge
 * (`engine` semver range vs the running version), signature badge
 * (`integrity` checked against the code at `src` with Web Crypto), a
 * download counter and an expandable details panel, both animated with
 * **`motionary/runtime`** (requires the runtime core: `use()` first).
 * Children become the details. `toggle(open?)`, `verify()`, `compat()`;
 * `usa:toggle`, `usa:verified`, `usa:runtime-missing`.
 */
export interface UsaPluginCardElement extends UsaElement {
  toggle(open?: boolean): void;
  verify(): Promise<boolean | null>;
  compat(): CompatResult;
}

const fmt = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(Math.round(n)));

export function definePluginCard(tag = 'usa-plugin-card'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaPluginCard extends Base {
        static get observedAttributes(): string[] {
          return ['name', 'title', 'version', 'author', 'engine', 'downloads', 'integrity', 'src'];
        }
        private rt: CoreApi | null = null;
        compat(): CompatResult {
          return checkCompat({ name: this.str('title', this.str('name')), engines: { motionary: this.str('engine', '*') } }, RUNTIME_VERSION);
        }
        mount(): void {
          this.rt = runtimeModule<CoreApi>(this, 'core');
          if (!this.querySelector(':scope > .usa-pc-head')) {
            const kids = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-rt-missing')));
            const name = this.str('title', this.str('name', 'plugin'));
            this.insertAdjacentHTML(
              'beforeend',
              `<div class="usa-pc-head"><span class="usa-pc-logo" aria-hidden="true"></span><div class="usa-pc-meta"><strong class="usa-pc-name"></strong><span class="usa-pc-sub"></span></div><span class="usa-pc-dl" aria-label="downloads"><b>0</b> ↓</span></div><div class="usa-pc-badges"><span class="usa-pc-badge usa-pc-compat"></span><span class="usa-pc-badge usa-pc-sig"></span></div><button type="button" class="usa-pc-more" aria-expanded="false">Details</button><div class="usa-pc-details" hidden></div>`
            );
            (this.querySelector('.usa-pc-logo') as HTMLElement).textContent = name.slice(0, 1).toUpperCase();
            (this.querySelector('.usa-pc-name') as HTMLElement).textContent = name;
            const det = this.querySelector('.usa-pc-details') as HTMLElement;
            kids.forEach((k) => det.appendChild(k));
          }
          (this.querySelector('.usa-pc-sub') as HTMLElement).textContent = `v${this.str('version', '1.0.0')}${this.str('author') ? ' · ' + this.str('author') : ''}`;
          const c = this.compat();
          const cb = this.querySelector('.usa-pc-compat') as HTMLElement;
          cb.textContent = c.ok ? `✓ Motionary ${c.range}` : `✕ needs ${c.range}`;
          cb.dataset.ok = String(c.ok);
          cb.title = c.message;
          const sig = this.querySelector('.usa-pc-sig') as HTMLElement;
          sig.textContent = this.str('integrity') ? 'Signed' : 'Unsigned';
          sig.dataset.state = this.str('integrity') ? 'pending' : 'none';
          if (this.str('integrity') && this.str('src')) this.verify();
          this.listen(this.querySelector('.usa-pc-more') as HTMLElement, 'click', () => this.toggle());
          this.countUp();
        }
        private countUp(): void {
          const b = this.querySelector('.usa-pc-dl b') as HTMLElement;
          const total = this.num('downloads', 0);
          if (!this.rt || this.reduced) {
            b.textContent = fmt(total);
            return;
          }
          const o = { n: 0 };
          let seen = false;
          this.inView((v) => {
            if (!v || seen || !this.rt) return;
            seen = true;
            const tw = this.rt.tween(o, { to: { n: total }, duration: 1200, ease: 'expo-out', onUpdate: () => (b.textContent = fmt(o.n)) });
            this.onCleanup(() => tw.kill());
          });
        }
        toggle(open?: boolean): void {
          const det = this.querySelector('.usa-pc-details') as HTMLElement | null;
          const btn = this.querySelector('.usa-pc-more') as HTMLElement | null;
          if (!det || !btn) return;
          const next = open ?? det.hidden;
          btn.setAttribute('aria-expanded', String(next));
          if (next) det.hidden = false;
          if (this.rt && !this.reduced) {
            const h = det.scrollHeight;
            det.style.overflow = 'hidden';
            const tw = this.rt.tween(det, { from: { height: next ? '0px' : h + 'px', opacity: next ? 0 : 1 }, to: { height: next ? h + 'px' : '0px', opacity: next ? 1 : 0 }, duration: 320, ease: 'cubic-out', onComplete: () => { det.style.height = ''; det.style.overflow = ''; if (!next) det.hidden = true; } });
            this.onCleanup(() => tw.kill());
          } else if (!next) det.hidden = true;
          this.emit('toggle', { open: next });
        }
        async verify(): Promise<boolean | null> {
          const sig = this.querySelector('.usa-pc-sig') as HTMLElement | null;
          const integrity = this.str('integrity'), src = this.str('src');
          if (!integrity || !src || typeof fetch !== 'function') return null;
          let ok = false;
          try {
            const code = await (await fetch(src)).text();
            ok = await verifyPlugin(code, integrity);
          } catch {
            ok = false;
          }
          if (sig) {
            sig.textContent = ok ? '✓ Verified' : '✕ Signature mismatch';
            sig.dataset.state = ok ? 'ok' : 'bad';
          }
          this.emit('verified', { ok });
          return ok;
        }
      }
      return UsaPluginCard as unknown as CustomElementConstructor;
    },
    { id: 'plugin-card', text: css }
  );
}
