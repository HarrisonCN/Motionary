import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { bound, make } from './moments';
import css from './moments.css?raw';

const SVG = 'http://www.w3.org/2000/svg';

/**
 * A copy-to-clipboard button whose two squares redraw into a tick and whose label rolls to "Copied", then back.
 * The text comes from the `text` attribute, or from the element named by `for` (its value or text content).
 * A native button handles pointer and keyboard; the outcome is announced through a polite live region.
 *
 * Attributes: `text`, `for` (an element id), `label` (Copy), `done-label` (Copied), `fail-label` (Press Ctrl+C),
 * `duration` (ms the confirmation stays, 400–10000, 1600), `disabled`. Method `copy()` → Promise<boolean>.
 * Event `usa:copy` ({ ok, length }): only the success and the length leave the element, never the copied text.
 */
export interface UsaCopyButtonElement extends UsaElement {
  copy(): Promise<boolean>;
}

export function defineCopyButton(tag = 'usa-copy-button'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class CopyButton extends Base {
    static get observedAttributes(): string[] { return ['text', 'for', 'label', 'done-label', 'fail-label', 'duration', 'disabled']; }
    private _sync?: () => void;
    private _show?: (state: '' | 'done' | 'fail') => void;
    private source(): string {
      const id = this.str('for');
      if (id) {
        const target = (this.getRootNode() as Document | ShadowRoot).getElementById?.(id) ?? document.getElementById(id);
        if (target) return 'value' in target && typeof (target as HTMLInputElement).value === 'string' ? (target as HTMLInputElement).value : target.textContent || '';
      }
      return this.str('text');
    }
    async copy(): Promise<boolean> {
      if (this.flag('disabled')) return false;
      const text = this.source();
      let ok = false;
      try {
        if (text && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); ok = true; }
      } catch { ok = false; }
      this._show?.(ok ? 'done' : 'fail');
      this.emit('copy', { ok, length: text.length });
      return ok;
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('button', 'usa-moment usa-copy');
      root.type = 'button';
      const icon = document.createElementNS(SVG, 'svg');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('aria-hidden', 'true');
      icon.classList.add('usa-copy-icon');
      const paths: [string, string][] = [
        ['usa-copy-back', 'M15 8V5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15H8'],
        ['usa-copy-front', 'M9.5 9h9a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 8 19.5v-9A1.5 1.5 0 0 1 9.5 9z'],
        ['usa-copy-tick', 'M5 12.5l4.5 4.5L19 7.5'],
      ];
      for (const [cls, d] of paths) {
        const p = document.createElementNS(SVG, 'path');
        p.setAttribute('d', d);
        p.setAttribute('pathLength', '1');
        p.classList.add(cls);
        icon.append(p);
      }
      const roll = make('span', 'usa-copy-roll');
      const idle = make('span', 'usa-copy-idle'), done = make('span', 'usa-copy-done');
      roll.append(idle, done);
      const status = make('span', 'usa-sr');
      status.setAttribute('role', 'status');
      root.append(icon, roll, status);
      this.append(root);
      let timer: ReturnType<typeof setTimeout> | undefined;
      const sync = () => {
        idle.textContent = this.str('label', 'Copy');
        done.textContent = root.dataset.state === 'fail' ? this.str('fail-label', 'Press Ctrl+C') : this.str('done-label', 'Copied');
        root.disabled = this.flag('disabled');
        root.toggleAttribute('data-static', this.reduced);
      };
      this._show = (state) => {
        clearTimeout(timer);
        if (state) root.dataset.state = state; else delete root.dataset.state;
        sync();
        status.textContent = state ? done.textContent || '' : '';
        if (state) timer = setTimeout(() => this._show?.(''), bound(this.num('duration', 1600), 400, 10000, 1600));
      };
      this._sync = sync;
      this.listen(root, 'click', () => { void this.copy(); });
      this.onCleanup(() => { clearTimeout(timer); root.remove(); this._sync = undefined; this._show = undefined; });
      sync();
    }
  }, { id: 'moments', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
