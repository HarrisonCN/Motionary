import { defineElement, type UsaElement } from '../base';
import { createSpring } from '../physics/spring';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import css from './moments-ui.css?raw';

/**
 * A single disclosure card whose body opens on a spring: it overshoots its height a little and settles, and the
 * chevron turns with it. The element's own children become the body. A native button with `aria-expanded` /
 * `aria-controls` toggles it; the closed body is `hidden`, so its content leaves the tab order.
 *
 * Attributes: `heading` (Details), `open`, `disabled`. Method `toggle(force?)`. Event `usa:toggle` ({ open }).
 */
export interface UsaElasticAccordionElement extends UsaElement {
  open: boolean;
  toggle(force?: boolean): boolean;
}

export function defineElasticAccordion(tag = 'usa-elastic-accordion'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ElasticAccordion extends Base {
    static get observedAttributes(): string[] { return ['heading', 'open', 'disabled']; }
    private _sync?: () => void;
    get open(): boolean { return this.flag('open'); }
    set open(on: boolean) { this.setFlag('open', !!on); }
    toggle(force?: boolean): boolean {
      if (this.flag('disabled')) return this.open;
      this.open = force === undefined ? !this.open : !!force;
      return this.open;
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const kids = Array.from(this.childNodes);
      const root = make('div', 'usa-moment usa-accord');
      const id = uniqueId('usa-accord');
      const head = make('button', 'usa-accord-head');
      head.type = 'button';
      head.setAttribute('aria-controls', id);
      const title = make('span', 'usa-accord-title');
      const chevron = make('span', 'usa-accord-chevron');
      chevron.setAttribute('aria-hidden', 'true');
      head.append(title, chevron);
      const body = make('div', 'usa-accord-body');
      body.id = id;
      const inner = make('div', 'usa-accord-inner');
      inner.append(...kids);
      body.append(inner);
      root.append(head, body);
      this.append(root);
      // 0 = closed, 1 = open; the spring may overshoot past 1 before it settles
      const grow = createSpring({ value: this.open ? 1 : 0, spring: { stiffness: 300, damping: 16 }, onUpdate: (p) => {
        root.style.setProperty('--open', p.toFixed(4));
        body.style.height = `${Math.max(0, p) * inner.offsetHeight}px`;
      }, onRest: (p) => {
        body.style.height = p > 0.5 ? 'auto' : '0px';
        body.hidden = p <= 0.5;
      } });
      body.style.height = this.open ? 'auto' : '0px';
      body.hidden = !this.open;
      let was = this.open;
      const sync = () => {
        const open = this.open;
        title.textContent = this.str('heading', 'Details');
        head.setAttribute('aria-expanded', String(open));
        head.disabled = this.flag('disabled');
        root.toggleAttribute('data-open', open);
        if (open === was) return;
        was = open;
        if (open) body.hidden = false;
        if (this.reduced) { grow.jump(open ? 1 : 0); body.style.height = open ? 'auto' : '0px'; body.hidden = !open; return; }
        grow.set(open ? 1 : 0);
      };
      this._sync = sync;
      this.listen(head, 'click', () => {
        if (this.flag('disabled')) return;
        this.emit('toggle', { open: this.toggle() });
      });
      this.onCleanup(() => {
        grow.stop();
        this.append(...Array.from(inner.childNodes));
        root.remove();
        this._sync = undefined;
      });
      head.setAttribute('aria-expanded', String(this.open));
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
