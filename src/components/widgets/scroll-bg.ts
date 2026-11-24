import { caf, defineElement, queryAttr, raf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { cleanColor, ownChildren } from './kit';
import css from './motion-kit.css?raw';

export { cleanColor };


/** Index of the section whose box spans the line `line` px from the viewport top (the last one above it otherwise). */
export function sectionAt(tops: number[], line: number): number {
  let at = 0;
  for (let i = 0; i < tops.length; i++) if (tops[i] <= line) at = i;
  return at;
}

/**
 * Background (and text) color that changes as you scroll from one section to the next. Each element child is a
 * section with `data-bg` and optionally `data-fg`; when a section crosses the `line` (a fraction of the screen height),
 * the element (or the `target`, e.g. `body`) eases to its colors. Colors are checked with `CSS.supports`. Under reduced
 * motion the colors still change, without the fade. Pick pairs with enough contrast; the element does not check it.
 *
 * Attributes: `target` (selector; the element itself), `line` (0–1; 0.5).
 * Event `usa:change` ({ index, color }).
 */
export interface UsaScrollBgElement extends UsaElement {
  readonly index: number;
}

export function defineScrollBg(tag = 'usa-scroll-bg'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ScrollBg extends Base {
    static get observedAttributes(): string[] { return ['target', 'line']; }
    private _index = -1;
    get index(): number { return Math.max(0, this._index); }
    mount(): void {
      const sections = ownChildren(this);
      const target = (queryAttr(this.str('target') || null) as HTMLElement | null) ?? this;
      const was = { bg: target.style.backgroundColor, fg: target.style.color, cls: target.classList.contains('usa-sbg') };
      target.classList.add('usa-sbg');
      target.toggleAttribute('data-sbg-static', this.reduced);
      const line = Math.min(1, Math.max(0, this.num('line', 0.5)));
      let pending = 0;
      this._index = -1;
      const update = () => {
        pending = 0;
        if (!sections.length) return;
        const i = sectionAt(sections.map((s) => s.getBoundingClientRect().top), window.innerHeight * line);
        if (i === this._index) return;
        this._index = i;
        const bg = cleanColor(sections[i].dataset.bg || ''), fg = cleanColor(sections[i].dataset.fg || '');
        target.style.backgroundColor = bg;
        target.style.color = fg;
        this.emit('change', { index: i, color: bg });
      };
      const queue = () => { if (!pending) pending = raf(update, this); };
      this.listen(window, 'scroll', queue, { passive: true });
      this.listen(window, 'resize', queue, { passive: true });
      this.onCleanup(() => {
        if (pending) caf(pending);
        target.style.backgroundColor = was.bg;
        target.style.color = was.fg;
        if (!was.cls) target.classList.remove('usa-sbg');
        target.removeAttribute('data-sbg-static');
        if (!target.className) target.removeAttribute('class');
        if (!target.getAttribute('style')) target.removeAttribute('style');
      });
      update();
    }
  }, { id: 'motion-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
