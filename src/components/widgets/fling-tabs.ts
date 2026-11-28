import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick, uid } from './micro-kit-16';
import { dampedAt, pageAfter } from './damped-kit-18';
import { frameOnce } from './fling-kit-19';
import { indicatorAt } from './snap-kit-20';
import css from './snap-kit-20.css?raw';

/**
 * Tabs whose panels you swipe between, with an indicator tied to the swipe, as the top tabs of Android apps and
 * many social apps work: drag the panels sideways and the pill under the tab names follows the finger, its leading
 * edge running ahead and its trailing edge catching up so it stretches between two tabs. A flick goes to the next
 * tab, past the first or last the panels resist like rubber, and the panel height eases to the new panel's. The
 * tab names are a real tab list: the arrow keys, Home and End move between them, and hidden panels are inert.
 *
 * Content: each child with `data-tab="Name"` is a panel, its value the tab's name. Attributes: `index` (the tab
 * shown; 0), `label` (the tab list's accessible name; Tabs), `feel`, `haptics`.
 * Events: `usa:change` ({ index, label }).
 */
export interface UsaFlingTabsElement extends UsaElement {
  index: number;
  readonly count: number;
}

export function defineFlingTabs(tag = 'usa-fling-tabs'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class FlingTabs extends Base {
    static get observedAttributes(): string[] {
      return ['index', 'label', 'feel', 'haptics'];
    }
    private _index = 0;
    private _seen?: string | null;
    private _source: { name: string; nodes: Node[] }[] | null = null;
    private _go: ((i: number, user: boolean, velocity?: number) => void) | null = null;
    get index(): number {
      return this._index;
    }
    set index(v: number) {
      if (this._go) this._go(Math.floor(Number(v)) || 0, false);
      else this._index = Math.max(0, Math.floor(Number(v)) || 0);
    }
    get count(): number {
      return this._source?.length ?? 0;
    }
    mount(): void {
      if (!this._source) {
        const kids = [...this.children];
        const marked = kids.filter((k) => k.hasAttribute('data-tab'));
        const use = marked.length ? marked : kids;
        this._source = use.map((k, i) => {
          const copy = k.cloneNode(true) as Element;
          const name = (k.getAttribute('data-tab') || '').trim() || `Tab ${i + 1}`;
          copy.removeAttribute('data-tab');
          return { name, nodes: [copy] };
        });
        kids.forEach((k) => k.remove());
      }
      const tabsSrc = this._source.length ? this._source : [{ name: 'Tab 1', nodes: [] as Node[] }];
      const n = tabsSrc.length;
      const attr = this.getAttribute('index');
      if (attr !== this._seen) {
        this._seen = attr;
        this._index = Math.floor(this.num('index', 0)) || 0;
      }
      this._index = Math.min(n - 1, Math.max(0, this._index));

      const root = make('div', 'usa-snkit usa-ftabs');
      const bar = make('div', 'usa-ftabs-bar');
      bar.setAttribute('role', 'tablist');
      bar.setAttribute('aria-label', this.str('label', 'Tabs'));
      const ink = make('div', 'usa-ftabs-ink');
      ink.setAttribute('aria-hidden', 'true');
      bar.append(ink);
      const view = make('div', 'usa-ftabs-view');
      const track = make('div', 'usa-ftabs-track');
      view.append(track);
      const tabs: HTMLButtonElement[] = [];
      const panels: HTMLElement[] = [];
      tabsSrc.forEach((t, i) => {
        const tab = make('button', 'usa-ftabs-tab', t.name) as HTMLButtonElement;
        tab.type = 'button';
        tab.id = uid('usa-ftabs-tab');
        tab.setAttribute('role', 'tab');
        tab.dataset.index = String(i);
        const panel = make('div', 'usa-ftabs-panel');
        panel.id = uid('usa-ftabs-panel');
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        tab.setAttribute('aria-controls', panel.id);
        panel.append(...t.nodes.map((x) => x.cloneNode(true)));
        bar.append(tab);
        track.append(panel);
        tabs.push(tab);
        panels.push(panel);
      });
      root.append(bar, view);
      this.append(root);

      const dir = typeof getComputedStyle === 'function' && getComputedStyle(this).direction === 'rtl' ? -1 : 1;
      let w = 0;
      let rects: { x: number; w: number }[] = [];
      let heights: number[] = [];
      const measure = () => {
        w = view.getBoundingClientRect().width || w || 320;
        rects = tabs.map((t) => ({ x: t.offsetLeft, w: t.offsetWidth }));
        heights = panels.map((p) => p.offsetHeight);
      };
      measure();
      const heightAt = (p: number): number => {
        const i = Math.min(n - 1, Math.max(0, Math.floor(p)));
        const j = Math.min(n - 1, i + 1);
        const t = Math.min(1, Math.max(0, p - i));
        return (heights[i] || 0) + ((heights[j] || 0) - (heights[i] || 0)) * t;
      };
      const group = hostSprings(this, { x: this._index }, (v) => {
        track.style.transform = `translateX(${Math.round(-v.x * w * dir * 10) / 10}px)`;
        const at = indicatorAt(v.x, rects);
        if (at.w) {
          ink.style.width = `${at.w}px`;
          ink.style.transform = `translateX(${at.x}px)`;
        }
        const h = heightAt(v.x);
        if (h > 0) view.style.height = `${Math.round(h)}px`;
      });
      const reveal = (tab: HTMLElement) => {
        // keep the chosen tab inside a scrolling tab bar without scrolling the page
        const left = tab.offsetLeft - 8;
        const right = tab.offsetLeft + tab.offsetWidth + 8;
        if (left < bar.scrollLeft) bar.scrollLeft = left;
        else if (right > bar.scrollLeft + bar.clientWidth) bar.scrollLeft = right - bar.clientWidth;
      };
      const paint = () => {
        tabs.forEach((t, i) => {
          const on = i === this._index;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
        });
        panels.forEach((p, i) => {
          const on = i === this._index;
          p.toggleAttribute('inert', !on);
          p.setAttribute('aria-hidden', String(!on));
        });
        reveal(tabs[this._index]);
      };
      const go = (i: number, user: boolean, velocity = 0) => {
        const to = Math.min(n - 1, Math.max(0, i));
        const changed = to !== this._index;
        this._index = to;
        paint();
        group.set({ x: to }, { spring: { duration: 540, bounce: 0.16 }, velocity: velocity ? { x: velocity } : undefined });
        if (changed) {
          if (user) tick(this, 6);
          this.emit('change', { index: to, label: tabsSrc[to].name });
        }
      };
      this._go = go;
      paint();
      group.jump({ x: this._index });

      this.listen(bar, 'click', (e: MouseEvent) => {
        const t = (e.target as Element).closest?.('.usa-ftabs-tab') as HTMLElement | null;
        if (t) go(Number(t.dataset.index), true);
      });
      this.listen(bar, 'keydown', (e: KeyboardEvent) => {
        const keys: Record<string, number> = { ArrowRight: this._index + dir, ArrowLeft: this._index - dir, Home: 0, End: n - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        go(keys[e.key], true);
        tabs[this._index].focus();
      });

      // `from` is where the track is when grabbed; `base` is the tab it was heading to, which a drag turns by one at most
      let drag: { id: number; x0: number; y0: number; from: number; base: number; last: number; t: number; v: number; live: boolean } | null = null;
      this.listen(view, 'pointerdown', (e: PointerEvent) => {
        if ((e.pointerType === 'mouse' && e.button !== 0) || (e.target as Element).closest?.('a, button, input, textarea, select, label, [contenteditable]')) return;
        measure();
        drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: group.get('x'), base: this._index, last: e.clientX, t: e.timeStamp, v: 0, live: false };
      });
      this.listen(view, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = (e.clientX - drag.x0) * dir;
        if (!drag.live) {
          if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y0)) return;
          drag.live = true;
          root.setAttribute('data-dragging', '');
          try {
            view.setPointerCapture?.(e.pointerId);
          } catch {
            /* synthetic */
          }
        }
        const dt = Math.max(1, e.timeStamp - drag.t);
        drag.v = drag.v * 0.3 + ((-((e.clientX - drag.last) * dir) / dt) * 1000) * 0.7;
        drag.last = e.clientX;
        drag.t = e.timeStamp;
        group.jump({ x: dampedAt(drag.from * w - dx, 0, (n - 1) * w, w) / w });
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        root.removeAttribute('data-dragging');
        if (!d.live) return;
        const v = e.timeStamp - d.t > 90 ? 0 : d.v;
        go(pageAfter(group.get('x') * w, v, w, n, d.base), true, v / w);
      };
      this.listen(view, 'pointerup', end);
      this.listen(view, 'pointercancel', end);
      if (typeof ResizeObserver !== 'undefined') {
        const later = frameOnce(() => {
          measure();
          if (!drag && !group.animating) group.jump({ x: this._index });
        }, this);
        const ro = new ResizeObserver(() => later.ask());
        ro.observe(view);
        ro.observe(bar);
        panels.forEach((p) => ro.observe(p));
        this.onCleanup(() => {
          ro.disconnect();
          later.cancel();
        });
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._go = null;
      });
    }
  }, { id: 'snap-kit-20', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
