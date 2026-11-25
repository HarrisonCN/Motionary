import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { micro, type MicroHandle } from '../interaction/micro';
import { hostSprings, tick, uid } from './micro-kit-16';
import { openSet } from './spring-kit-17';
import css from './spring-kit-17.css?raw';

const SVG = 'http://www.w3.org/2000/svg';

/**
 * An accordion whose panels open on springs: the height follows a spring (so a fast toggle reverses smoothly from
 * where it is), the content drifts in after it, and the chevron flips with a little overshoot. Headers are real
 * buttons with `aria-expanded`; the arrow keys, Home and End move between them.
 *
 * Content: each direct child is a section; its `data-title` (or first heading) is the header and the rest its
 * panel. Attributes: `open` (indexes of open sections, e.g. "0" or "0, 2"), `multiple` (several may be open),
 * `feel`, `haptics`.
 * Events: `usa:toggle` ({ index, open }).
 */
export interface UsaSpringAccordionElement extends UsaElement {
  readonly openIndexes: number[];
  toggle(index: number, force?: boolean): void;
}

export function defineSpringAccordion(tag = 'usa-spring-accordion'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringAccordion extends Base {
    static get observedAttributes(): string[] {
      return ['open', 'multiple', 'feel', 'haptics'];
    }
    private _open: number[] = [];
    private _seen?: string | null;
    private _source: { title: string; nodes: Node[] }[] | null = null;
    private _toggle: ((i: number, force: boolean | undefined, user: boolean) => void) | null = null;
    get openIndexes(): number[] {
      return this._open.slice();
    }
    toggle(index: number, force?: boolean): void {
      this._toggle?.(index, force, false);
    }
    mount(): void {
      if (!this._source) {
        const kids = [...this.children];
        this._source = kids.map((k, i) => {
          const head = k.getAttribute('data-title') ? null : k.querySelector('h1, h2, h3, h4, h5, h6');
          const title = k.getAttribute('data-title') || head?.textContent?.trim() || `Section ${i + 1}`;
          head?.remove();
          return { title, nodes: [...k.childNodes] };
        });
        kids.forEach((k) => k.remove());
      }
      const sections = this._source;
      const multiple = this.flag('multiple');
      const attr = this.getAttribute('open');
      if (attr !== this._seen) {
        this._seen = attr;
        this._open = openSet(attr ?? '', sections.length, multiple);
      }
      this._open = multiple ? this._open.filter((i) => i < sections.length) : this._open.slice(0, 1);
      const root = make('div', 'usa-skit usa-sacc');
      const handles: MicroHandle[] = [];
      const parts = sections.map((s, i) => {
        const item = make('div', 'usa-sacc-item');
        const head = make('button', 'usa-sacc-head');
        head.type = 'button';
        const pid = uid('usa-sacc-panel');
        const hid = uid('usa-sacc-head');
        head.id = hid;
        head.setAttribute('aria-controls', pid);
        head.append(make('span', 'usa-sacc-title', s.title));
        const chev = document.createElementNS(SVG, 'svg');
        chev.setAttribute('viewBox', '0 0 24 24');
        chev.setAttribute('class', 'usa-sacc-chev');
        chev.setAttribute('aria-hidden', 'true');
        const p = document.createElementNS(SVG, 'path');
        p.setAttribute('d', 'M6 9l6 6 6-6');
        chev.append(p);
        head.append(chev);
        const panel = make('div', 'usa-sacc-panel');
        panel.id = pid;
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', hid);
        const body = make('div', 'usa-sacc-body');
        body.append(...s.nodes.map((n) => n.cloneNode(true)));
        panel.append(body);
        item.append(head, panel);
        root.append(item);
        handles.push(micro(head, 'press', { feel: this.str('feel') || undefined }));
        return { head, panel, body, chev };
      });
      this.append(root);

      const init: Record<string, number> = {};
      parts.forEach((_, i) => {
        const on = this._open.includes(i) ? 1 : 0;
        init[`h${i}`] = on;
        init[`c${i}`] = on;
      });
      const heights = parts.map(() => 0);
      const group = hostSprings(this, init, (v) => {
        parts.forEach((pt, i) => {
          const h = Math.max(0, v[`h${i}`]);
          const open = this._open.includes(i);
          const rest = open && Math.abs(h - 1) < 0.002 && Math.abs(group.velocity(`h${i}`)) < 0.01;
          pt.panel.toggleAttribute('data-rest', rest);
          pt.panel.style.height = rest ? '' : `${Math.round(h * heights[i] * 10) / 10}px`;
          pt.body.style.opacity = String(Math.round(Math.min(1, Math.max(0, h * 1.6 - 0.4)) * 100) / 100);
          pt.body.style.transform = `translateY(${Math.round((1 - Math.min(1, h)) * -10 * 10) / 10}px)`;
          pt.chev.style.transform = `rotate(${Math.round(v[`c${i}`] * 1800) / 10}deg)`;
        });
      });
      const paint = () => {
        parts.forEach((pt, i) => {
          const open = this._open.includes(i);
          pt.head.setAttribute('aria-expanded', String(open));
          pt.panel.toggleAttribute('data-open', open);
          pt.panel.toggleAttribute('inert', !open);
        });
      };
      paint();
      const measure = (i: number) => (heights[i] = parts[i].body.scrollHeight || parts[i].body.getBoundingClientRect().height || heights[i]);
      parts.forEach((_, i) => measure(i));
      group.jump(init);
      const toggle = (i: number, force: boolean | undefined, user: boolean) => {
        if (!parts[i]) return;
        const on = force === undefined ? !this._open.includes(i) : force;
        if (on === this._open.includes(i)) return;
        const closing = on && !multiple ? this._open.filter((x) => x !== i) : [];
        this._open = on ? (multiple ? [...this._open, i] : [i]) : this._open.filter((x) => x !== i);
        paint();
        for (const j of [i, ...closing]) {
          measure(j);
          const target = this._open.includes(j) ? 1 : 0;
          group.set({ [`h${j}`]: target }, { spring: target ? 'smooth' : 'snappy' });
          group.set({ [`c${j}`]: target }, { spring: 'bouncy' });
        }
        if (user) tick(this, 5);
        for (const j of closing) this.emit('toggle', { index: j, open: false });
        this.emit('toggle', { index: i, open: on });
      };
      this._toggle = toggle;
      this.listen(root, 'click', (e: MouseEvent) => {
        const h = (e.target as Element).closest?.('.usa-sacc-head');
        const i = parts.findIndex((p) => p.head === h);
        if (i >= 0) toggle(i, undefined, true);
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        const i = parts.findIndex((p) => p.head === e.target);
        if (i < 0) return;
        const n = parts.length;
        const to: Record<string, number> = { ArrowDown: (i + 1) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 };
        if (!(e.key in to)) return;
        e.preventDefault();
        parts[to[e.key]].head.focus();
      });
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => parts.forEach((_, i) => measure(i)));
        parts.forEach((p) => ro.observe(p.body));
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        group.stop();
        handles.forEach((h) => h.destroy());
        root.remove();
        this._toggle = null;
      });
    }
  }, { id: 'spring-kit-17', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
