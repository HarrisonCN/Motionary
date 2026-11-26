import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { springExpand } from '../interaction/expand';
import { hostSprings, tick, uid } from './micro-kit-16';
import css from './damped-kit-18.css?raw';

const SVG = 'http://www.w3.org/2000/svg';

/**
 * One collapsible panel with a damped open: the height follows a spring with a short overshoot, the content drifts
 * in child by child, the chevron flips with a little bounce, and a second click mid-way reverses from where the
 * panel is. The header is a real button with `aria-expanded` and `aria-controls`.
 *
 * Content: the element's children are the panel. Attributes: `label` (header text; Details), `open`, `disabled`,
 * `feel`, `haptics`.
 * Events: `usa:toggle` ({ open }).
 */
export interface UsaSpringCollapseElement extends UsaElement {
  open: boolean;
  toggle(force?: boolean): void;
}

export function defineSpringCollapse(tag = 'usa-spring-collapse'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringCollapse extends Base {
    static get observedAttributes(): string[] {
      return ['label', 'open', 'disabled', 'feel', 'haptics'];
    }
    private _open = false;
    private _seen?: string | null;
    private _source: Node[] | null = null;
    private _set: ((on: boolean, user: boolean) => void) | null = null;
    get open(): boolean {
      return this._open;
    }
    set open(v: boolean) {
      this.toggle(!!v);
    }
    toggle(force?: boolean): void {
      const on = force === undefined ? !this._open : force;
      if (this._set) this._set(on, false);
      else this._open = on;
    }
    mount(): void {
      if (!this._source) {
        this._source = [...this.childNodes];
        this._source.forEach((n) => n.parentNode === this && this.removeChild(n));
      }
      const attr = this.getAttribute('open');
      if (attr !== this._seen) {
        this._seen = attr;
        this._open = this.flag('open');
      }
      const disabled = this.flag('disabled');
      const feel = this.str('feel') || undefined;
      const root = make('div', 'usa-dkit usa-dcol');
      const head = make('button', 'usa-dcol-head');
      head.type = 'button';
      head.disabled = disabled;
      head.append(make('span', 'usa-dcol-label', this.str('label', 'Details')));
      const chev = document.createElementNS(SVG, 'svg');
      chev.setAttribute('viewBox', '0 0 24 24');
      chev.setAttribute('class', 'usa-dcol-chev');
      chev.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS(SVG, 'path');
      path.setAttribute('d', 'M6 9l6 6 6-6');
      chev.append(path);
      head.append(chev);
      const panel = make('div', 'usa-dcol-panel');
      panel.id = uid('usa-dcol-panel');
      head.setAttribute('aria-controls', panel.id);
      const body = make('div', 'usa-dcol-body');
      body.append(...this._source.map((n) => n.cloneNode(true)));
      panel.append(body);
      panel.hidden = !this._open;
      root.append(head, panel);
      root.toggleAttribute('data-open', this._open);
      head.setAttribute('aria-expanded', String(this._open));
      this.append(root);

      // the chevron flips on its own, bouncier spring while the panel's height settles
      const group = hostSprings(this, { c: this._open ? 1 : 0 }, (v) => {
        chev.style.transform = `rotate(${Math.round(v.c * 1800) / 10}deg)`;
      });
      group.jump({ c: this._open ? 1 : 0 });
      const set = (on: boolean, user: boolean) => {
        if (on === this._open) return;
        this._open = on;
        head.setAttribute('aria-expanded', String(on));
        root.toggleAttribute('data-open', on);
        void springExpand(panel, on, { feel });
        group.set({ c: on ? 1 : 0 }, { spring: on ? 'bouncy' : 'snappy' });
        if (user) tick(this, 6);
        this.emit('toggle', { open: on });
      };
      this._set = set;
      this.listen(head, 'click', () => {
        if (!disabled) set(!this._open, true);
      });
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._set = null;
      });
    }
  }, { id: 'damped-kit-18', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
