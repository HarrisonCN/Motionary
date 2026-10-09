import { defineElement, type UsaElement } from '../base';
import css from './prop-panel.css?raw';

/**
 * `<usa-prop-panel for="#el" props="value:number:0:100, theme:select:leaf|ocean, readonly:boolean">`
 * (8.9) — a low-code property editor for a live component: each prop gets a
 * field (`text`, `number` with optional min:max, `range`, `color`,
 * `boolean` switch, `select` with options) bound to the element's
 * attribute (`for` is a selector, or `previous` for the element just
 * before the panel), so editing it re-renders the component on the spot. Without
 * `props` it lists the element's `observedAttributes` as text fields. A
 * labelled `form`; `usa:prop` { name, value }; `reset()` restores the
 * starting attributes. Pairs with `<usa-code-export>`.
 */
export interface PropSpec {
  name: string;
  type: 'text' | 'number' | 'range' | 'color' | 'boolean' | 'select';
  options: string[];
}
export interface UsaPropPanelElement extends UsaElement {
  readonly props: PropSpec[];
  reset(): void;
}

/** "value:number:0:100, theme:select:leaf|ocean, on:boolean" → prop specs (8.9). */
export function parseProps(s: string): PropSpec[] {
  const T = ['text', 'number', 'range', 'color', 'boolean', 'select'];
  return s
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [name, type = 'text', ...rest] = p.split(':').map((x) => x.trim());
      const t = (T.includes(type) ? type : 'text') as PropSpec['type'];
      return { name, type: t, options: t === 'select' ? (rest[0] || '').split('|').filter(Boolean) : rest };
    })
    .filter((p) => /^[a-z][\w-]*$/i.test(p.name));
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function definePropPanel(tag = 'usa-prop-panel'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaPropPanel extends Base {
        static get observedAttributes(): string[] {
          return ['for', 'props', 'label'];
        }
        private _start: Record<string, string | null> = {};
        private target(): Element | null {
          const f = this.str('for');
          if (f === 'previous') return this.previousElementSibling;
          return f ? document.querySelector(f) : null;
        }
        get props(): PropSpec[] {
          const s = this.str('props');
          if (s) return parseProps(s);
          const t = this.target();
          const obs = ((t?.constructor as any)?.observedAttributes as string[] | undefined) || [];
          return obs.map((name) => ({ name, type: 'text' as const, options: [] }));
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const t = this.target();
          const ps = this.props;
          this._start = {};
          ps.forEach((p) => (this._start[p.name] = t?.getAttribute(p.name) ?? null));
          const field = (p: PropSpec, i: number) => {
            const id = `usa-pp-${i}-${p.name}`;
            const v = t?.getAttribute(p.name);
            let input = '';
            if (p.type === 'boolean') input = `<input id="${id}" type="checkbox" role="switch" data-p="${p.name}"${v != null ? ' checked' : ''}>`;
            else if (p.type === 'select') input = `<select id="${id}" data-p="${p.name}">${p.options.map((o) => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
            else {
              const [mn, mx] = p.options;
              const range = p.type === 'range' || (p.type === 'number' && mn != null && mx != null);
              input = `<input id="${id}" type="${p.type === 'color' ? 'color' : range ? 'range' : p.type === 'number' ? 'number' : 'text'}" data-p="${p.name}" value="${esc(v ?? '')}"${mn != null ? ` min="${esc(mn)}"` : ''}${mx != null ? ` max="${esc(mx)}"` : ''}${range ? ' step="any"' : ''}><output for="${id}">${esc(v ?? '')}</output>`;
            }
            return `<div class="usa-pp-row"><label for="${id}">${esc(p.name)}</label>${input}</div>`;
          };
          this.insertAdjacentHTML('beforeend', `<form class="usa-pp" aria-label="${esc(this.str('label', 'Properties'))}" data-usa-part>${ps.map(field).join('') || '<p class="usa-pp-empty">No properties</p>'}<button type="button" class="usa-pp-reset">Reset</button></form>`);
          const form = this.querySelector('form') as HTMLFormElement;
          this.listen(form, 'submit', (e: Event) => e.preventDefault());
          this.listen(this.querySelector('.usa-pp-reset') as Element, 'click', () => this.reset());
          this.listen(form, 'input', (e: Event) => this.apply(e.target as HTMLInputElement));
          this.listen(form, 'change', (e: Event) => this.apply(e.target as HTMLInputElement));
        }
        private apply(inp: HTMLInputElement | HTMLSelectElement): void {
          const name = inp.dataset?.p;
          const t = this.target();
          if (!name || !t) return;
          let value: string | null;
          if (inp instanceof HTMLInputElement && inp.type === 'checkbox') value = inp.checked ? '' : null;
          else value = inp.value;
          if (value == null) t.removeAttribute(name);
          else t.setAttribute(name, value);
          const out = inp.nextElementSibling;
          if (out?.tagName === 'OUTPUT') out.textContent = value ?? '';
          this.emit('prop', { name, value });
        }
        reset(): void {
          const t = this.target();
          if (!t) return;
          for (const [k, v] of Object.entries(this._start)) {
            if (v == null) t.removeAttribute(k);
            else t.setAttribute(k, v);
          }
          this.changed('props');
          if (!this.reduced) this.querySelectorAll('.usa-pp-row').forEach((r, i) => this.motion(r, [{ backgroundColor: 'rgba(99,102,241,.18)' }, { backgroundColor: 'transparent' }], { duration: 600, delay: i * 40 }));
        }
      }
      return UsaPropPanel as unknown as CustomElementConstructor;
    },
    { id: 'prop-panel', text: css }
  );
}
