import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { ownChildren, safeImageUrl } from './kit';
import css from './data-media.css?raw';

/**
 * A row of narrow panels where one is open wide: hovering, focusing or clicking another panel makes it grow while the
 * rest narrow, and its content slides in. Each element child is one panel; its `data-title` labels the panel's
 * toggle button (shown sideways while the panel is narrow) and `data-image` sets a cover picture. The toggle is a
 * native button with `aria-expanded`; closed panels' content is `hidden`. Under 640 px wide (`stack`) the panels
 * stack vertically.
 *
 * Attributes: `index` (open panel; 0), `trigger` (hover | click; hover), `stack` (px; 640), `label` (Panels).
 * Event `usa:change` ({ index }).
 */
export interface UsaExpandCardsElement extends UsaElement {
  index: number;
}

export function defineExpandCards(tag = 'usa-expand-cards'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ExpandCards extends Base {
    static get observedAttributes(): string[] { return ['index', 'trigger', 'stack', 'label']; }
    private _sync?: () => void;
    private _count = 0;
    get index(): number { return Math.max(0, Math.min(Math.max(0, this._count - 1), Math.round(this.num('index', 0)))); }
    set index(i: number) { this.setAttribute('index', String(Math.round(Number(i)) || 0)); }
    changed(name: string): void { if (name === 'index') this._sync?.(); else super.changed(name); }
    mount(): void {
      const kids = ownChildren(this);
      this._count = kids.length;
      const root = make('div', 'usa-kit usa-xc');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Panels'));
      const panels = kids.map((k, i) => {
        const p = make('div', 'usa-xc-panel');
        const img = safeImageUrl(k.dataset.image || '');
        if (img) p.style.setProperty('--img', `url("${img.replace(/["\\]/g, '\\$&')}")`);
        const head = make('button', 'usa-xc-head');
        head.type = 'button';
        const body = make('div', 'usa-xc-body');
        body.id = uniqueId('usa-xc');
        head.setAttribute('aria-controls', body.id);
        head.append(make('span', 'usa-xc-title', k.dataset.title || `Panel ${i + 1}`));
        body.append(k);
        p.append(head, body);
        root.append(p);
        return { p, head, body };
      });
      this.append(root);
      const stack = Math.max(0, this.num('stack', 640));
      const fit = () => root.toggleAttribute('data-stacked', root.clientWidth > 0 && root.clientWidth < stack);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(fit);
        ro.observe(root);
        this.onCleanup(() => ro.disconnect());
      }
      fit();
      const sync = () => {
        const at = this.index;
        root.toggleAttribute('data-static', this.reduced);
        panels.forEach(({ p, head, body }, i) => {
          const on = i === at;
          p.toggleAttribute('data-open', on);
          head.setAttribute('aria-expanded', String(on));
          body.hidden = !on;
        });
      };
      this._sync = sync;
      const pick = (i: number) => { if (i !== this.index) { this.index = i; this.emit('change', { index: i }); } };
      const hover = this.str('trigger') !== 'click';
      panels.forEach(({ p, head }, i) => {
        this.listen(head, 'click', () => pick(i));
        if (hover) this.listen(p, 'pointerenter', (e: PointerEvent) => { if (e.pointerType === 'mouse') pick(i); });
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        const i = panels.findIndex(({ head }) => head === e.target);
        if (i < 0) return;
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        panels[(i + d + panels.length) % panels.length].head.focus();
      });
      this.onCleanup(() => {
        this.append(...kids);
        root.remove();
        this._sync = undefined;
      });
      sync();
    }
  }, { id: 'data-media', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
