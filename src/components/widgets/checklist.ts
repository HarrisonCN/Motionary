import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren } from './kit';
import css from './parts-kit-12.css?raw';

/** Dash offset of a progress ring of radius `r` with `done` of `total` filled. */
export function ringDash(done: number, total: number, r = 16): { length: number; offset: number } {
  const length = Math.round(2 * Math.PI * r * 1000) / 1000;
  const f = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;
  return { length, offset: Math.round(length * (1 - f) * 1000) / 1000 };
}

/**
 * An onboarding checklist. Each child becomes one task with a real checkbox (a child that already holds a checkbox keeps
 * it). Ticking a task draws a line through it and moves a progress ring in the header on; when every task is ticked the
 * ring pops, the heading changes to `done-label` and `usa:complete` fires. Unticking works too. The count is read out
 * politely.
 *
 * Attributes: `label` (Getting started), `done-label` (All done!).
 * Events `usa:change` ({ index, checked, done, total }), `usa:complete`.
 */
export interface UsaChecklistElement extends UsaElement {
  readonly done: number;
}

export function defineChecklist(tag = 'usa-checklist'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Checklist extends Base {
    static get observedAttributes(): string[] { return ['label', 'done-label']; }
    private _done = 0;
    get done(): number { return this._done; }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('section', 'usa-kit usa-check');
      const head = make('header', 'usa-check-head');
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 40 40');
      svg.setAttribute('aria-hidden', 'true');
      svg.classList.add('usa-check-ring');
      const { length } = ringDash(0, 1);
      for (const cls of ['usa-check-ring-bg', 'usa-check-ring-fg']) {
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('class', cls);
        c.setAttribute('cx', '20');
        c.setAttribute('cy', '20');
        c.setAttribute('r', '16');
        svg.append(c);
      }
      const fg = svg.lastChild as SVGCircleElement;
      fg.style.strokeDasharray = String(length);
      const title = make('strong', 'usa-check-title', this.str('label', 'Getting started'));
      title.id = `usa-check-${Math.random().toString(36).slice(2, 8)}`;
      root.setAttribute('aria-labelledby', title.id);
      const count = make('span', 'usa-check-count');
      count.setAttribute('aria-live', 'polite');
      head.append(svg, title, count);
      const ul = make('ul', 'usa-check-list');
      const boxes: HTMLInputElement[] = [];
      const rows = kids.map((k) => {
        const li = make('li', 'usa-check-item');
        let box = k.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
        if (!box) {
          const label = make('label');
          box = make('input');
          box.type = 'checkbox';
          const text = make('span', 'usa-check-text');
          text.append(k);
          label.append(box, text);
          li.append(label);
        } else li.append(k);
        boxes.push(box);
        ul.append(li);
        return li;
      });
      root.append(head, ul);
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      const total = boxes.length;
      const paint = () => {
        this._done = boxes.filter((b) => b.checked).length;
        fg.style.strokeDashoffset = String(ringDash(this._done, total).offset);
        count.textContent = `${this._done} / ${total}`;
        rows.forEach((li, i) => li.toggleAttribute('data-checked', boxes[i].checked));
        const all = total > 0 && this._done === total;
        root.toggleAttribute('data-complete', all);
        title.textContent = all ? this.str('done-label', 'All done!') : this.str('label', 'Getting started');
        return all;
      };
      boxes.forEach((b, i) => this.listen(b, 'change', () => {
        const was = root.hasAttribute('data-complete');
        const all = paint();
        this.emit('change', { index: i, checked: b.checked, done: this._done, total });
        if (all && !was) this.emit('complete');
      }));
      this.onCleanup(() => {
        this.append(...kids);
        root.remove();
      });
      paint();
    }
  }, { id: 'parts-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
